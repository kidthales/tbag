import { AvatarEntity } from '../avatar';
import { Effect, scheduleEffects, ScheduledEffects } from '../effects';
import { PositionComponentData, positionComponentKey } from '../entities';
import { generateMapData } from '../map';
import {
  GlyphPlugin,
  GlyphScene,
  GlyphSceneCacheManager,
  GlyphSceneGameObjectCreator,
  GlyphSceneGameObjectFactory,
  GlyphSceneLoaderPlugin
} from '../plugins/glyph';
import { runSimulation, syncSimulation } from '../simulation';
import { World } from '../world';

import { Level } from './level';
import { LevelData } from './level-data';
import { LevelSceneLaunchData } from './level-scene-launch-data';
import { LevelInputManager } from './managers';
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

  protected levelInputManager: LevelInputManager;

  public constructor(public readonly id: string, public readonly world: World) {
    super(id);
  }

  public init(launchData: LevelSceneLaunchData): void {
    const { avatar, populate, fromSave } = launchData;

    const levelData = this.initLevelDataAndRng(populate && !fromSave);

    this.initLevelAndLevelInputManager(levelData, fromSave);
    this.initAvatar(avatar, fromSave);
  }

  public create(launchData: LevelSceneLaunchData): void {
    this.events.on(Phaser.Scenes.Events.DESTROY, this.onDestroy, this);

    const {
      worldViewport: { x, y, width, height }
    } = launchData;

    this.cameras.add(x, y, width, height, false, 'world');
    this.level.ignoreCamera(this.cameras.main);
    this.level.setCameraBounds(this.cameras.getCamera('world'));

    this.cameras.getCamera('world').startFollow(this.avatar.gameobject);
  }

  public update(time: number, delta: number): void {
    if (!this.avatarTurn) {
      this.updateSimulation();
    }
  }

  protected initLevelDataAndRng(populate: boolean): LevelData {
    const world = this.world;
    const levelData = world.levels.get(this.id);

    levelData.levelScene = this;
    levelData.mapData = generateMapData(levelData.type as any, levelData.seed);

    const rng = new Phaser.Math.RandomDataGenerator(levelData.seed);

    if (populate) {
      levelData.rngState = undefined;
      levelData.schedulerState = undefined;

      levelData.entityManager.clear();

      populateLevelData(levelData, world.scheduler, rng);
    }

    this.rng = rng;

    return levelData;
  }

  protected initLevelAndLevelInputManager(levelData: LevelData, fromSave: boolean): void {
    const level = (this.level = new Level(levelData));
    const rng = this.rng;

    if (level.rngState) {
      rng.state(level.rngState);
    }

    if (level.schedulerState && !fromSave) {
      syncSimulation(this.world, level, rng);
    }

    this.levelInputManager = new LevelInputManager(level, rng, (effects: Effect[]) => {
      this.save();
      this.endAvatarTurn(effects);
    });
  }

  protected initAvatar(avatar: AvatarEntity, fromSave: boolean): void {
    this.avatar = avatar;

    if (!fromSave) {
      // TODO: Assign avatar start position...
      avatar.setComponent<PositionComponentData>(positionComponentKey, { x: 1, y: 1 });
      this.world.scheduler.add(avatar.id, true, 0);
    }

    const level = this.level;

    level.allocateGameObject(avatar);

    const { x, y } = avatar.getComponent<PositionComponentData>(positionComponentKey);
    const cell = level.getCell(x, y);

    cell.addEntity(avatar);
    cell.refresh();
  }

  protected updateSimulation(): void {
    const {
      level,
      world: { scheduler },
      rng
    } = this;

    const effects = runSimulation(level, scheduler, rng, (id) => id === this.avatar.id);

    this.save();
    this.beginAvatarTurn(effects);
  }

  protected save(): void {
    const {
      level,
      world: { scheduler },
      rng
    } = this;

    level.rngState = rng.state();
    level.schedulerState = scheduler.state;
    // TODO: Save game...
  }

  protected beginAvatarTurn(effects: Effect[]): void {
    this.avatarTurn = true;
    this.displayEffects(effects, () => (this.levelInputManager.allowInput = true), this);
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
