import { NoopActionPayload } from '../../actions';
import { Effect } from '../../effects';
import { Level } from '../../level';
import { Scheduler } from '../../scheduler';

import { RuleApplicator } from '../rule-applicator';

export const noopRuleApplicator: RuleApplicator<NoopActionPayload> = function noopRuleApplicator(
  { duration }: NoopActionPayload,
  level: Level,
  scheduler: Scheduler,
  rng: Phaser.Math.RandomDataGenerator,
  skipEffects = false
): Effect[] {
  scheduler.setDuration(duration > 0 ? duration : 1);
  return [];
};
