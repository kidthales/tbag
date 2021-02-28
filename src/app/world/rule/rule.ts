import { ActionPayload } from '../action';
import { Effect } from '../effect';
import { Level } from '../level';
import { Scheduler } from '../scheduler';

export type Validate<P extends ActionPayload = ActionPayload> = (
  payload: P,
  level: Level,
  scheduler: Scheduler,
  rng: Phaser.Math.RandomDataGenerator
) => boolean;

export type Apply<P extends ActionPayload = ActionPayload> = (
  payload: P,
  level: Level,
  scheduler: Scheduler,
  rng: Phaser.Math.RandomDataGenerator,
  skipEffects?: boolean
) => Effect[];
