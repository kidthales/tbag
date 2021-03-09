import { CardinalDirection } from './cardinal-direction';
import { IntercardinalDirection } from './intercardinal-direction';

export enum CardinalDirectionCombination {
  North = CardinalDirection.North,
  East = CardinalDirection.East,
  South = CardinalDirection.South,
  West = CardinalDirection.West,
  NorthEast = IntercardinalDirection.Northeast,
  NorthSouth = CardinalDirection.North + CardinalDirection.South,
  NorthWest = IntercardinalDirection.Northwest,
  EastWest = CardinalDirection.East + CardinalDirection.West,
  EastSouth = IntercardinalDirection.Southeast,
  SouthWest = IntercardinalDirection.Southwest,
  NorthEastSouth = IntercardinalDirection.Northeast + CardinalDirection.South,
  NorthEastWest = IntercardinalDirection.Northeast + CardinalDirection.West,
  NorthSouthWest = CardinalDirection.North + IntercardinalDirection.Southwest,
  EastSouthWest = CardinalDirection.East + IntercardinalDirection.Southwest,
  NorthEastSouthWest = IntercardinalDirection.Northwest + IntercardinalDirection.Southeast
}
