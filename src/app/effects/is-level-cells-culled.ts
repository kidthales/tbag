import { Level, LevelCell } from '../level';

export function isLevelCellsCulled(level: Level, cells: LevelCell[]): boolean {
  const bounds = level.cullBounds();
  return !cells.some(({ x, y }) => bounds.contains(x, y));
}
