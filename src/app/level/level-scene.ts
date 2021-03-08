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
  }

  public create(launchData: LevelSceneLaunchData): void {
    this.events.on(Phaser.Scenes.Events.DESTROY, this.onDestroy, this);
    this.level.setCameraBounds(this.cameras.main);
    this.cameras.main.startFollow(this.avatar.gameobject);
  }

  public update(time: number, delta: number): void {
    if (!this.avatarTurn) {
      const level = this.level;
      const rng = this.rng;
      const scheduler = this.world.scheduler;

      const effects = runSimulation(level, scheduler, rng, (id) => id === this.avatar.id);

      this.avatarTurn = true;

      level.rngState = rng.state();
      level.schedulerState = scheduler.state;
      // TODO: Save game...

      this.displayEffects(
        effects,
        () => {
          // TODO: Player input...
        },
        this
      );
    }
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
