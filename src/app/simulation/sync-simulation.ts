import { Level } from '../level';
import { Scheduler } from '../scheduler';
import { World } from '../world';

import { runSimulation } from './run-simulation';

const schedulerSentinel = 'sentinel';

export function syncSimulation(world: World, level: Level, rng: Phaser.Math.RandomDataGenerator): void {
  const worldScheduler = world.scheduler;
  const oldScheduler = new Scheduler(level.schedulerState);

  if (oldScheduler.time < worldScheduler.time) {
    oldScheduler.add(schedulerSentinel, true, 1);

    runSimulation(
      level,
      oldScheduler,
      rng,
      (id) => id === schedulerSentinel && oldScheduler.time >= worldScheduler.time,
      true
    );

    oldScheduler.remove(schedulerSentinel);
  } else if (oldScheduler.time > worldScheduler.time) {
    worldScheduler.add(schedulerSentinel, true, 1);

    do {
      worldScheduler.next();
    } while (worldScheduler.time < oldScheduler.time);

    worldScheduler.remove(schedulerSentinel);
  }

  worldScheduler.load(oldScheduler.state);
}
