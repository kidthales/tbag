import { MoveActionDirection } from '../../actions';
import { Level } from '../../level';

import { getMoveDirectionLevelCell } from './get-move-direction-level-cell';

export function validateCreatureMove(
  srcX: number,
  srcY: number,
  direction: MoveActionDirection,
  level: Level
): boolean {
  const cell = getMoveDirectionLevelCell(srcX, srcY, direction, level);

  if (!cell) {
    return false;
  }

  if (cell.creature) {
    return false;
  }

  return !cell.blockMove;
}
