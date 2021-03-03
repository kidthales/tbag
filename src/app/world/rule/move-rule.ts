import { MoveActionDirection, MoveActionPayload } from '../action';
import { createMoveEffect, Effect } from '../effect';
import { CreatureData, CreatureEntity, EntityType, EphemeralData, getEntityComponentData } from '../entity';
import { EntityComponents } from '../entity';
import { Level, LevelCell } from '../level';
import { translate } from '../map';
import { Scheduler } from '../scheduler';

import { Apply, Validate } from './rule';

export const validate: Validate<MoveActionPayload> = function validate(
  { actor, direction }: MoveActionPayload,
  level: Level,
  scheduler: Scheduler,
  rng: Phaser.Math.RandomDataGenerator
): boolean {
  if (!actor.data || !actor.data.position) {
    return false;
  }

  switch (actor.type) {
    case EntityType.Creature:
      return validateCreatureMove(actor.data, direction, level);
    case EntityType.Ephemeral:
      return validateEphemeralMove(actor.data, direction, level);
    case EntityType.Terrain:
    case EntityType.Item:
    default:
      return false;
  }
};

export const apply: Apply<MoveActionPayload> = function apply(
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

function validateCreatureMove(
  { position: { x, y } }: CreatureData,
  direction: MoveActionDirection,
  level: Level
): boolean {
  const cell = getCell(x, y, direction, level);

  if (!cell) {
    return false;
  }

  if (cell.creature) {
    return false;
  }

  return !cell.blockMove;
}

function validateEphemeralMove(
  { position: { x, y } }: EphemeralData,
  direction: MoveActionDirection,
  level: Level
): boolean {
  const cell = getCell(x, y, direction, level);

  if (!cell) {
    return false;
  }

  return cell.blockMove;
}

function applyCreatureMove(
  creature: CreatureEntity,
  direction: MoveActionDirection,
  level: Level,
  scheduler: Scheduler,
  rng: Phaser.Math.RandomDataGenerator,
  skipEffects = false
): Effect[] {
  const position = getEntityComponentData<EntityComponents.PositionComponentData>(
    EntityComponents.positionComponentKey,
    creature,
    level.world.staticData
  );

  const { x: srcX, y: srcY } = position;

  const srcCell = getCell(srcX, srcY, undefined, level);
  const dstCell = getCell(srcX, srcY, direction, level);

  srcCell.removeEntity(creature);
  dstCell.addEntity(creature);

  position.x = dstCell.x;
  position.y = dstCell.y;

  scheduler.setDuration(rng.integerInRange(1, 2));

  return createMoveEffect(scheduler.time, creature, level, { srcCell, dstCell }, skipEffects);
}

function getCell(srcX: number, srcY: number, direction: MoveActionDirection, level: Level): LevelCell {
  const [dstX, dstY] = translate(srcX, srcY, direction);
  return level.getCell(dstX, dstY);
}
