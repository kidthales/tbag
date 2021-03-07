import { ActionType, ActionUnion } from '../actions';
import { Effect } from '../effects';
import { Level } from '../level';
import { noopRule, moveRule } from '../rules';
import { Scheduler } from '../scheduler';

export function applyAction(
  action: ActionUnion,
  level: Level,
  scheduler: Scheduler,
  rng: Phaser.Math.RandomDataGenerator,
  skipEffects = false
): Effect[] {
  switch (action.type) {
    case ActionType.Noop:
      return noopRule.apply(action.payload, level, scheduler, rng, skipEffects);
    case ActionType.Move:
      return moveRule.apply(action.payload, level, scheduler, rng, skipEffects);
    default:
      return [];
  }
}
