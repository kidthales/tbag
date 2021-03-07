import { ActionType, ActionUnion } from '../actions';
import { Level } from '../level';
import { noopRule, moveRule } from '../rules';
import { Scheduler } from '../scheduler';

export function validateAction(
  action: ActionUnion,
  level: Level,
  scheduler: Scheduler,
  rng: Phaser.Math.RandomDataGenerator
): boolean {
  switch (action.type) {
    case ActionType.Noop:
      return noopRule.validate(action.payload, level, scheduler, rng);
    case ActionType.Move:
      return moveRule.validate(action.payload, level, scheduler, rng);
    default:
      return false;
  }
}
