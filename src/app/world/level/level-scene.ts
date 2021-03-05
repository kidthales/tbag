import {
  GlyphPlugin,
  GlyphScene,
  GlyphSceneCacheManager,
  GlyphSceneGameObjectCreator,
  GlyphSceneGameObjectFactory,
  GlyphSceneLoaderPlugin
} from '../../plugins/glyph';

import { Effect, ScheduledEffects, scheduleEffects } from '../effect';

import { generateMapData } from '../map';
import { run, sync } from '../simulation';
import { World } from '../world';

import { Level } from './level';
import { populate } from './populate';

export interface LevelSceneInitConfig {
  firstTime?: boolean;
}

export class LevelScene extends Phaser.Scene implements GlyphScene {
  public readonly [GlyphPlugin.mapping]: GlyphPlugin;

  public readonly add: GlyphSceneGameObjectFactory;

  public readonly cache: GlyphSceneCacheManager;

  public readonly load: GlyphSceneLoaderPlugin;

  public readonly make: GlyphSceneGameObjectCreator;

  protected level: Level;

  protected rng: Phaser.Math.RandomDataGenerator;

  protected avatarTurn = false;

  public constructor(public readonly id: string, public readonly world: World) {
    super(id);
  }

  public init(config: LevelSceneInitConfig): void {
    const world = this.world;
    const levelData = world.levels.get(this.id);

    levelData.levelScene = this;

    generateMapData(levelData);

    if (config.firstTime) {
      populate(levelData);
    }

    const level = new Level(levelData);
    const rng = new Phaser.Math.RandomDataGenerator(level.seed);

    if (level.rngState) {
      rng.state(level.rngState);
    }

    sync(world, level, rng);

    level.rngState = rng.state();
    level.schedulerState = world.scheduler.state;
    // TODO: Save game...

    this.rng = rng;
    this.level = level;
  }

  public create(config: LevelSceneInitConfig): void {
    this.events.on(Phaser.Scenes.Events.DESTROY, this.onDestroy, this);

    const { width, height } = this.level;
    const { x, y } = this.level.cellToWorldXY(Math.floor(width / 2), Math.floor(height / 2));
    this.cameras.main.centerOn(x, y);

    // TODO: Add avatar to map...
    this.world.scheduler.add('avatar', true, 0);
    this.avatarTurn = true;
    this.time.delayedCall(3000, () => (this.avatarTurn = false), undefined, this);
  }

  public update(time: number, delta: number): void {
    if (!this.avatarTurn) {
      const level = this.level;
      const rng = this.rng;
      const scheduler = this.world.scheduler;

      const effects = run(level, scheduler, rng, (id) => id === 'avatar');

      this.avatarTurn = true;
      level.rngState = rng.state();
      level.schedulerState = scheduler.state;
      // TODO: Save explored...
      // TODO: Save game...

      this.displayEffects(
        effects,
        () => {
          scheduler.setDuration(1);
          this.avatarTurn = false;
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
