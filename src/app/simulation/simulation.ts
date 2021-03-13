import { EffectUnion } from '../effects';
import { Level } from '../level';
import { Scheduler } from '../scheduler';
import { World } from '../world';

import { act } from './behaviors';

export class Simulation {
  protected static schedulerSentinel = 'sentinel';

  public constructor(
    protected readonly world: World,
    protected readonly level: Level,
    protected readonly rng: Phaser.Math.RandomDataGenerator
  ) {}

  public run(pauseCondition: (id: string) => boolean, skipEffects = false): EffectUnion[] {
    const {
      level,
      world: { scheduler },
      rng
    } = this;

    const entities = level.entityManager;

    let effects: EffectUnion[] = [];
    let id = scheduler.next();

    while (id && !pauseCondition(id)) {
      if (entities.has(id)) {
        effects = effects.concat(act(entities.get(id), level, scheduler, rng, skipEffects));
      }

      id = scheduler.next();
    }

    return effects;
  }

  public sync(): void {
    const { level, world, rng } = this;

    const worldScheduler = world.scheduler;
    const oldScheduler = new Scheduler(level.schedulerState);

    if (oldScheduler.currentTime < worldScheduler.currentTime) {
      oldScheduler.add(Simulation.schedulerSentinel, true, 1);

      this.run(
        (id) => id === Simulation.schedulerSentinel && oldScheduler.currentTime >= worldScheduler.currentTime,
        true
      );

      oldScheduler.remove(Simulation.schedulerSentinel);
    } else if (oldScheduler.currentTime > worldScheduler.currentTime) {
      worldScheduler.add(Simulation.schedulerSentinel, true, 1);

      do {
        worldScheduler.next();
      } while (worldScheduler.currentTime < oldScheduler.currentTime);

      worldScheduler.remove(Simulation.schedulerSentinel);
    }

    worldScheduler.load(oldScheduler.state);
  }
}
