import { MoveAction, NoopAction } from '../../actions';
import { EffectUnion } from '../../effects';
import { EntityUnion } from '../../entities';
import { Level } from '../../level';
import { validate } from '../../rules';
import { Scheduler } from '../../scheduler';

import { getRandomMoveActionDirection } from './get-random-move-action-direction';

export function act(
  entity: EntityUnion,
  level: Level,
  scheduler: Scheduler,
  rng: Phaser.Math.RandomDataGenerator,
  skipEffects = false
): EffectUnion[] {
  const moveAction = new MoveAction({ actor: entity, direction: getRandomMoveActionDirection(rng) });
  let applyAction = validate(moveAction, level, scheduler, rng);

  if (applyAction) {
    return applyAction(skipEffects);
  }

  const noopAction = new NoopAction({ actor: entity, duration: 1 });
  applyAction = validate(noopAction, level, scheduler, rng);

  if (applyAction) {
    return applyAction(skipEffects);
  }

  return [];
}
