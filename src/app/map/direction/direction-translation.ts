import { Direction } from './direction';

export const directionTranslation: Record<Direction, [number, number]> = {
  [Direction.North]: [0, -1],
  [Direction.NorthNorthEast]: [1, -2],
  [Direction.NorthEast]: [1, -1],
  [Direction.EastNorthEast]: [2, -1],
  [Direction.East]: [1, 0],
  [Direction.EastSouthEast]: [2, 1],
  [Direction.SouthEast]: [1, 1],
  [Direction.SouthSouthEast]: [1, 2],
  [Direction.South]: [0, 1],
  [Direction.SouthSouthWest]: [-1, 2],
  [Direction.SouthWest]: [-1, 1],
  [Direction.WestSouthWest]: [-2, 1],
  [Direction.West]: [-1, 0],
  [Direction.WestNorthWest]: [-2, 1],
  [Direction.NorthWest]: [-1, -1],
  [Direction.NorthNorthWest]: [-1, 2]
};
