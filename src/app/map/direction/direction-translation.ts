import { Direction } from './direction';

export const directionTranslation: Record<Direction, [number, number]> = {
  [Direction.North]: [0, -1],
  [Direction.NorthNortheast]: [1, -2],
  [Direction.Northeast]: [1, -1],
  [Direction.EastNortheast]: [2, -1],
  [Direction.East]: [1, 0],
  [Direction.EastSoutheast]: [2, 1],
  [Direction.Southeast]: [1, 1],
  [Direction.SouthSoutheast]: [1, 2],
  [Direction.South]: [0, 1],
  [Direction.SouthSouthwest]: [-1, 2],
  [Direction.Southwest]: [-1, 1],
  [Direction.WestSouthwest]: [-2, 1],
  [Direction.West]: [-1, 0],
  [Direction.WestNorthwest]: [-2, 1],
  [Direction.Northwest]: [-1, -1],
  [Direction.NorthNorthwest]: [-1, 2]
};
