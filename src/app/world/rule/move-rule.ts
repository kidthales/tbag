import { MoveActionDirection, MoveActionPayload } from '../action';
import { createMoveEffect, Effect, MoveEffectData } from '../effect';
import { CreatureData, CreatureEntity, EntityType, EphemeralData } from '../entity';
import { Level, LevelCell } from '../level';
import { Direction } from '../map';
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
  let effectData: MoveEffectData;

  switch (actor.type) {
    case EntityType.Creature:
      effectData = applyCreatureMove(actor, direction, level, scheduler, rng);
      break;
    case EntityType.Ephemeral:
    case EntityType.Terrain:
    case EntityType.Item:
    default:
      return [];
  }

  return createMoveEffect(scheduler.time, actor, level, effectData, skipEffects);
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
  rng: Phaser.Math.RandomDataGenerator
): MoveEffectData {
  const position = creature.data.position;

  const { x: srcX, y: srcY } = position;

  const srcCell = getCell(srcX, srcY, undefined, level);
  const dstCell = getCell(srcX, srcY, direction, level);

  srcCell.removeEntity(creature);
  dstCell.addEntity(creature);

  position.x = dstCell.x;
  position.y = dstCell.y;

  scheduler.setDuration(rng.integerInRange(1, 2));

  return { srcCell, dstCell };
}

function getCell(srcX: number, srcY: number, direction: MoveActionDirection, level: Level): LevelCell {
  const [dstX, dstY] = translate(srcX, srcY, direction);

  if (!level.isInBounds(dstX, dstY)) {
    return;
  }

  return level.getCell(dstX, dstY);
}

function translate(x: number, y: number, direction: MoveActionDirection): [number, number] {
  switch (direction) {
    case Direction.North:
      return [x, y - 1];
    case Direction.NorthEast:
      return [x + 1, y - 1];
    case Direction.East:
      return [x + 1, y];
    case Direction.SouthEast:
      return [x + 1, y + 1];
    case Direction.South:
      return [x, y + 1];
    case Direction.SouthWest:
      return [x - 1, y + 1];
    case Direction.West:
      return [x - 1, y];
    case Direction.NorthWest:
      return [x - 1, y - 1];
    default:
      return [x, y];
  }
}
