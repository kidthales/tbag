import { ActionType, ActionUnion } from '../actions';
import { EffectUnion } from '../effects';
import { Level } from '../level';
import { Scheduler } from '../scheduler';

import { MoveRule } from './move-rule';
import { NoopRule } from './noop-rule';
import { Rule } from './rule';

export function validate(
  action: ActionUnion,
  level: Level,
  scheduler: Scheduler,
  rng: Phaser.Math.RandomDataGenerator
): ((skipEffects?: boolean) => EffectUnion[]) | false {
  let rule: Rule;

  switch (action.type) {
    case ActionType.Noop:
      rule = new NoopRule(level, scheduler, rng, action);
      break;
    case ActionType.Move:
      rule = new MoveRule(level, scheduler, rng, action);
      break;
    default:
      return false;
  }

  return rule.validate();
}
