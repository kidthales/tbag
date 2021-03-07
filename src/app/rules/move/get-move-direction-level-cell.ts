import { MoveActionDirection } from '../../actions';
import { Level, LevelCell } from '../../level';
import { translate } from '../../map';

export function getMoveDirectionLevelCell(
  srcX: number,
  srcY: number,
  direction: MoveActionDirection,
  level: Level
): LevelCell {
  const [dstX, dstY] = translate(srcX, srcY, direction);
  return level.getCell(dstX, dstY);
}
