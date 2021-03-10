import { MoveActionDirection } from '../../actions';
import { Effect, moveEffectFactory } from '../../effects';
import { CreatureEntity, PositionComponentData, positionComponentKey } from '../../entities';
import { Level } from '../../level';
import { Scheduler } from '../../scheduler';

import { getMoveDirectionLevelCell } from './get-move-direction-level-cell';

export function applyCreatureMove(
  creature: CreatureEntity,
  direction: MoveActionDirection,
  level: Level,
  scheduler: Scheduler,
  rng: Phaser.Math.RandomDataGenerator,
  skipEffects = false
): Effect[] {
  const position = creature.getComponent<PositionComponentData>(positionComponentKey);

  const { x: srcX, y: srcY } = position;

  const srcCell = getMoveDirectionLevelCell(srcX, srcY, undefined, level);
  const dstCell = getMoveDirectionLevelCell(srcX, srcY, direction, level);

  srcCell.removeEntity(creature);
  dstCell.addEntity(creature);

  position.x = dstCell.x;
  position.y = dstCell.y;

  scheduler.setDuration(rng.integerInRange(1, 2));

  return moveEffectFactory(scheduler.time, creature, level, { srcCell, dstCell }, skipEffects);
}
