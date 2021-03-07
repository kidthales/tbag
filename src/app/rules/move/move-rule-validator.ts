import { MoveActionPayload } from '../../actions';
import { EntityType, PositionComponentData, positionComponentKey } from '../../entities';
import { Level } from '../../level';
import { Scheduler } from '../../scheduler';

import { RuleValidator } from '../rule-validator';

import { validateCreatureMove } from './validate-creature-move';

export const moveRuleValidator: RuleValidator<MoveActionPayload> = function moveRuleValidator(
  { actor, direction }: MoveActionPayload,
  level: Level,
  scheduler: Scheduler,
  rng: Phaser.Math.RandomDataGenerator
): boolean {
  const position = actor.getComponent<PositionComponentData>(positionComponentKey);

  if (!position) {
    return false;
  }

  const { x, y } = position;

  switch (actor.type) {
    case EntityType.Creature:
      return validateCreatureMove(x, y, direction, level);
    case EntityType.Ephemeral:
    case EntityType.Terrain:
    case EntityType.Item:
    default:
      return false;
  }
};
