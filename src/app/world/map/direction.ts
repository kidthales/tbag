export enum CardinalDirection {
  North = 1,
  East = 2,
  South = 4,
  West = 8
}

export enum IntercardinalDirection {
  NorthEast = CardinalDirection.North + CardinalDirection.East,
  SouthEast = CardinalDirection.South + CardinalDirection.East,
  SouthWest = CardinalDirection.South + CardinalDirection.West,
  NorthWest = CardinalDirection.North + CardinalDirection.West
}

export enum SecondaryIntercardinalDirectionComponent {
  North = 16,
  East = 32,
  South = 64,
  West = 128
}

export enum SecondaryIntercardinalDirection {
  NorthNorthEast = SecondaryIntercardinalDirectionComponent.North + IntercardinalDirection.NorthEast,
  EastNorthEast = SecondaryIntercardinalDirectionComponent.East + IntercardinalDirection.NorthEast,
  EastSouthEast = SecondaryIntercardinalDirectionComponent.East + IntercardinalDirection.SouthEast,
  SouthSouthEast = SecondaryIntercardinalDirectionComponent.South + IntercardinalDirection.SouthEast,
  SouthSouthWest = SecondaryIntercardinalDirectionComponent.South + IntercardinalDirection.SouthWest,
  WestSouthWest = SecondaryIntercardinalDirectionComponent.West + IntercardinalDirection.SouthWest,
  WestNorthWest = SecondaryIntercardinalDirectionComponent.West + IntercardinalDirection.NorthWest,
  NorthNorthWest = SecondaryIntercardinalDirectionComponent.North + IntercardinalDirection.NorthWest
}

export const Direction = { ...CardinalDirection, ...IntercardinalDirection, ...SecondaryIntercardinalDirection };
export type Direction = CardinalDirection | IntercardinalDirection | SecondaryIntercardinalDirection;

export enum CardinalDirectionCombination {
  North = CardinalDirection.North,
  East = CardinalDirection.East,
  South = CardinalDirection.South,
  West = CardinalDirection.West,
  NorthEast = IntercardinalDirection.NorthEast,
  NorthSouth = CardinalDirection.North + CardinalDirection.South,
  NorthWest = IntercardinalDirection.NorthWest,
  EastWest = CardinalDirection.East + CardinalDirection.West,
  EastSouth = IntercardinalDirection.SouthEast,
  SouthWest = IntercardinalDirection.SouthWest,
  NorthEastSouth = IntercardinalDirection.NorthEast + CardinalDirection.South,
  NorthEastWest = IntercardinalDirection.NorthEast + CardinalDirection.West,
  NorthSouthWest = CardinalDirection.North + IntercardinalDirection.SouthWest,
  EastSouthWest = CardinalDirection.East + IntercardinalDirection.SouthWest,
  NorthEastSouthWest = IntercardinalDirection.NorthWest + IntercardinalDirection.SouthEast
}

export const directionTranslation: Record<Direction, [number, number]> = {
  [Direction.North]: [0, -1],
  [Direction.NorthNorthEast]: [1, -2],
  [Direction.NorthEast]: [1, -1],
  [Direction.EastNorthEast]: [2, -1],
  [Direction.East]: [1, 0],
  [Direction.EastSouthEast]: [2, 1],
  [Direction.SouthEast]: [1, -1],
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

export function hasCardinalDirectionComponent(
  subject: Direction | CardinalDirectionCombination,
  component: CardinalDirection
): boolean {
  return !!(subject & component);
}

export function translate(x: number, y: number, direction: Direction): [number, number] {
  if (direction === undefined || directionTranslation[direction] === undefined) {
    return [x, y];
  }

  const [dx, dy] = directionTranslation[direction];
  return [x + dx, y + dy];
}
