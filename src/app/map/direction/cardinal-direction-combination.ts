import { CardinalDirection } from './cardinal-direction';
import { IntercardinalDirection } from './intercardinal-direction';

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
