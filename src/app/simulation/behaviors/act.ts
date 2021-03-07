import { MoveAction, NoopAction } from '../../actions';
import { Effect } from '../../effects';
import { EntityUnion } from '../../entities';
import { Level } from '../../level';
import { Scheduler } from '../../scheduler';

import { applyAction } from '../apply-action';
import { validateAction } from '../validate-action';

import { getRandomMoveActionDirection } from './get-random-move-action-direction';

export function act(
  entity: EntityUnion,
  level: Level,
  scheduler: Scheduler,
  rng: Phaser.Math.RandomDataGenerator,
  skipEffects = false
): Effect[] {
  const moveAction = new MoveAction({ actor: entity, direction: getRandomMoveActionDirection(rng) });

  if (validateAction(moveAction, level, scheduler, rng)) {
    return applyAction(moveAction, level, scheduler, rng, skipEffects);
  }

  const noopAction = new NoopAction({ actor: entity, duration: 1 });
  return applyAction(noopAction, level, scheduler, rng, skipEffects);
}
