import { Effect } from '../effects';
import { Level } from '../level';
import { Scheduler } from '../scheduler';

import { act } from './behaviors';

export function runSimulation(
  level: Level,
  scheduler: Scheduler,
  rng: Phaser.Math.RandomDataGenerator,
  pauseCondition: (id: string) => boolean,
  skipEffects = false
): Effect[] {
  const entities = level.entityManager;

  let effects: Effect[] = [];
  let id = scheduler.next();

  while (id && !pauseCondition(id)) {
    if (entities.has(id)) {
      effects = effects.concat(act(entities.get(id), level, scheduler, rng, skipEffects));
    }

    id = scheduler.next();
  }

  return effects;
}
