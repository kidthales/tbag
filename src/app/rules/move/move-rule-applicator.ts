import { MoveActionPayload } from '../../actions';
import { Effect } from '../../effects';
import { EntityType } from '../../entities';
import { Level } from '../../level';
import { Scheduler } from '../../scheduler';

import { RuleApplicator } from '../rule-applicator';

import { applyCreatureMove } from './apply-creature-move';

export const moveRuleApplicator: RuleApplicator<MoveActionPayload> = function apply(
  { actor, direction }: MoveActionPayload,
  level: Level,
  scheduler: Scheduler,
  rng: Phaser.Math.RandomDataGenerator,
  skipEffects = false
): Effect[] {
  switch (actor.type) {
    case EntityType.Creature:
      return applyCreatureMove(actor, direction, level, scheduler, rng, skipEffects);
    case EntityType.Ephemeral:
    case EntityType.Terrain:
    case EntityType.Item:
    default:
      return [];
  }
};
