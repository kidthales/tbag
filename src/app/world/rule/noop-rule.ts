import { NoopActionPayload } from '../action';
import { Effect } from '../effect';
import { Level } from '../level';
import { Scheduler } from '../scheduler';

import { Apply, Validate } from './rule';

export const validate: Validate<NoopActionPayload> = function validate(
  payload: NoopActionPayload,
  level: Level,
  scheduler: Scheduler,
  rng: Phaser.Math.RandomDataGenerator
): boolean {
  return true;
};

export const apply: Apply<NoopActionPayload> = function apply(
  { duration }: NoopActionPayload,
  level: Level,
  scheduler: Scheduler,
  rng: Phaser.Math.RandomDataGenerator,
  skipEffects = false
): Effect[] {
  scheduler.setDuration(duration > 0 ? duration : 1);
  return [];
};
