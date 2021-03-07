import { LevelCell } from '../level';

export function refreshLevelCells(cells: LevelCell[]): void {
  cells.forEach((cell) => cell.refresh());
}
