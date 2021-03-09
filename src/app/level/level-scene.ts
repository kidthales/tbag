import { MoveAction, MoveActionDirection } from '../actions';
import { AvatarEntity } from '../avatar';
import { defaultInputConfig } from '../configs';
import { Effect, scheduleEffects, ScheduledEffects } from '../effects';
import { PositionComponentData, positionComponentKey } from '../entities';
import { InputName } from '../input';
import { Direction, generateMapData, translate } from '../map';
import {
  GlyphPlugin,
  GlyphScene,
  GlyphSceneCacheManager,
  GlyphSceneGameObjectCreator,
  GlyphSceneGameObjectFactory,
  GlyphSceneLoaderPlugin
} from '../plugins/glyph';
import { applyAction, runSimulation, syncSimulation, validateAction } from '../simulation';
import { World } from '../world';

import { Level } from './level';
import { LevelSceneLaunchData } from './level-scene-launch-data';
import { populateLevelData } from './populate-level-data';

export class LevelScene extends Phaser.Scene implements GlyphScene {
  public readonly [GlyphPlugin.mapping]: GlyphPlugin;

  public readonly add: GlyphSceneGameObjectFactory;

  public readonly cache: GlyphSceneCacheManager;

  public readonly load: GlyphSceneLoaderPlugin;

  public readonly make: GlyphSceneGameObjectCreator;

  public avatar: AvatarEntity;

  protected level: Level;

  protected rng: Phaser.Math.RandomDataGenerator;

  protected avatarTurn = false;

  protected allowInput = false;

  protected inputMap: Record<InputName, () => void> = {
    [InputName.MoveOrMeleeAttackNorth]: () => this.onMoveOrMeleeAttackNorth(),
    [InputName.MoveOrMeleeAttackNortheast]: () => this.onMoveOrMeleeAttackNortheast(),
    [InputName.MoveOrMeleeAttackEast]: () => this.onMoveOrMeleeAttackEast(),
    [InputName.MoveOrMeleeAttackSoutheast]: () => this.onMoveOrMeleeAttackSoutheast(),
    [InputName.MoveOrMeleeAttackSouth]: () => this.onMoveOrMeleeAttackSouth(),
    [InputName.MoveOrMeleeAttackSouthwest]: () => this.onMoveOrMeleeAttackSouthwest(),
    [InputName.MoveOrMeleeAttackWest]: () => this.onMoveOrMeleeAttackWest(),
    [InputName.MoveOrMeleeAttackNorthwest]: () => this.onMoveOrMeleeAttackNorthwest()
  };

  public constructor(public readonly id: string, public readonly world: World) {
    super(id);
  }

  public init(launchData: LevelSceneLaunchData): void {
    this.avatar = launchData.avatar;

    const world = this.world;
    const levelData = world.levels.get(this.id);

    levelData.levelScene = this;
    levelData.mapData = generateMapData(levelData.type as any, levelData.seed);

    const rng = new Phaser.Math.RandomDataGenerator(levelData.seed);

    if (launchData.populate && !launchData.fromSave) {
      levelData.rngState = undefined;
      levelData.schedulerState = undefined;

      levelData.entityManager.clear();

      populateLevelData(levelData, world.scheduler, rng);
    }

    const level = new Level(levelData);

    if (level.rngState) {
      rng.state(level.rngState);
    }

    if (level.schedulerState && !launchData.fromSave) {
      syncSimulation(world, level, rng);
    }

    if (!launchData.fromSave) {
      // TODO: Assign avatar start position...
      this.avatar.setComponent<PositionComponentData>(positionComponentKey, { x: 1, y: 1 });
      world.scheduler.add(this.avatar.id, true, 0);
    }

    // TODO: Add avatar to map...
    const cell = level.getCell(1, 1);
    cell.addEntity(this.avatar);
    level.allocateGameObject(this.avatar);
    cell.refresh();

    this.rng = rng;
    this.level = level;

    this.initInput();
  }

  public create(launchData: LevelSceneLaunchData): void {
    this.events.on(Phaser.Scenes.Events.DESTROY, this.onDestroy, this);
    this.level.setCameraBounds(this.cameras.main);
    this.cameras.main.startFollow(this.avatar.gameobject);
  }

  public update(time: number, delta: number): void {
    if (!this.avatarTurn) {
      const {
        level,
        world: { scheduler },
        rng
      } = this;

      const effects = runSimulation(level, scheduler, rng, (id) => id === this.avatar.id);

      level.rngState = rng.state();
      level.schedulerState = scheduler.state;
      // TODO: Save game...

      this.beginAvatarTurn(effects);
    }
  }

  protected initInput(): this {
    defaultInputConfig.forEach((config) => {
      const {
        name: inputName,
        key: { name: keyName, altKey, ctrlKey, shiftKey, emitOnRepeat }
      } = config;
      let {
        key: { enableCapture }
      } = config;

      if (enableCapture === undefined) {
        enableCapture = true;
      }

      const key = this.input.keyboard.addKey(keyName, enableCapture, emitOnRepeat);

      key.on(
        Phaser.Input.Keyboard.Events.DOWN,
        (event: KeyboardEvent) => {
          if (!this.allowInput || (altKey && !key.altKey) || (ctrlKey && !key.ctrlKey) || (shiftKey && !key.shiftKey)) {
            return;
          }

          if (this.inputMap[inputName]) {
            this.allowInput = false;
            this.inputMap[inputName]();
          }
        },
        this
      );
    });

    return this;
  }

  protected onMoveOrMeleeAttackNorth(): void {
    this.attemptMoveOrMeleeAttack(Direction.North);
  }

  protected onMoveOrMeleeAttackNortheast(): void {
    this.attemptMoveOrMeleeAttack(Direction.Northeast);
  }

  protected onMoveOrMeleeAttackEast(): void {
    this.attemptMoveOrMeleeAttack(Direction.East);
  }

  protected onMoveOrMeleeAttackSoutheast(): void {
    this.attemptMoveOrMeleeAttack(Direction.Southeast);
  }

  protected onMoveOrMeleeAttackSouth(): void {
    this.attemptMoveOrMeleeAttack(Direction.South);
  }

  protected onMoveOrMeleeAttackSouthwest(): void {
    this.attemptMoveOrMeleeAttack(Direction.Southwest);
  }

  protected onMoveOrMeleeAttackWest(): void {
    this.attemptMoveOrMeleeAttack(Direction.West);
  }

  protected onMoveOrMeleeAttackNorthwest(): void {
    this.attemptMoveOrMeleeAttack(Direction.Northwest);
  }

  protected attemptMoveOrMeleeAttack(direction: MoveActionDirection): void {
    const { x: srcX, y: srcY } = this.avatar.getComponent<PositionComponentData>(positionComponentKey);
    const [dstX, dstY] = translate(srcX, srcY, direction);

    const dstCell = this.level.getCell(dstX, dstY);

    if (dstCell.creature) {
      // TODO: Attack...
      this.allowInput = true;
    } else {
      this.attemptMove(direction);
    }
  }

  protected attemptMove(direction: MoveActionDirection): void {
    const {
      avatar,
      level,
      world: { scheduler },
      rng
    } = this;

    const moveAction = new MoveAction({ actor: avatar, direction });

    if (validateAction(moveAction, level, scheduler, rng)) {
      const effects = applyAction(moveAction, level, scheduler, rng);

      level.rngState = rng.state();
      level.schedulerState = scheduler.state;
      // TODO: Save game...

      this.endAvatarTurn(effects);
    } else {
      this.allowInput = true;
    }
  }

  protected beginAvatarTurn(effects: Effect[]): void {
    this.avatarTurn = true;
    this.displayEffects(effects, () => (this.allowInput = true), this);
  }

  protected endAvatarTurn(effects: Effect[]): void {
    this.displayEffects(effects, () => (this.avatarTurn = false), this);
  }

  protected displayEffects(effects: Effect[], callback: () => void, context?: unknown): void {
    let count = 0;

    const onEffectComplete = (): void => {
      if (++count >= effects.length) {
        callback.call(context || this);
      }
    };

    if (!effects.length) {
      onEffectComplete();
      return;
    }

    const display = (schedule: ScheduledEffects): void => {
      if (!schedule.length) {
        return;
      }

      const effect = schedule.shift();

      if (!Array.isArray(effect)) {
        return effect.run(() => {
          onEffectComplete();
          display(schedule);
        }, this);
      }

      const concurrent = effect as Effect[];
      let concurrentCount = 0;

      function onConcurrentEffectComplete(): void {
        onEffectComplete();

        if (++concurrentCount >= concurrent.length) {
          display(schedule);
        }
      }

      let delay = 0;
      concurrent.forEach((c) => {
        this.time.delayedCall(delay, () => c.run(onConcurrentEffectComplete, this));
        delay += 25;
      });
    };

    return display(scheduleEffects(effects));
  }

  protected onDestroy(): void {
    this.level.levelScene = undefined;
  }
}
