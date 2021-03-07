import { NoopActionPayload } from '../../actions';
import { Level } from '../../level';
import { Scheduler } from '../../scheduler';

import { RuleValidator } from '../rule-validator';

export const noopRuleValidator: RuleValidator<NoopActionPayload> = function noopRuleValidator(
  payload: NoopActionPayload,
  level: Level,
  scheduler: Scheduler,
  rng: Phaser.Math.RandomDataGenerator
): boolean {
  return true;
};
