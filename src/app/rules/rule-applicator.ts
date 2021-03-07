import { ActionPayload } from '../actions';
import { Effect } from '../effects';
import { Level } from '../level';
import { Scheduler } from '../scheduler';

export type RuleApplicator<P extends ActionPayload = ActionPayload> = (
  payload: P,
  level: Level,
  scheduler: Scheduler,
  rng: Phaser.Math.RandomDataGenerator,
  skipEffects?: boolean
) => Effect[];
