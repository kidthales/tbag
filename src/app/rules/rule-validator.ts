import { ActionPayload } from '../actions';
import { Level } from '../level';
import { Scheduler } from '../scheduler';

export type RuleValidator<P extends ActionPayload = ActionPayload> = (
  payload: P,
  level: Level,
  scheduler: Scheduler,
  rng: Phaser.Math.RandomDataGenerator
) => boolean;
