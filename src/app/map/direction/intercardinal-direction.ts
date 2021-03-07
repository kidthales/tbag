import { CardinalDirection } from './cardinal-direction';

export enum IntercardinalDirection {
  NorthEast = CardinalDirection.North + CardinalDirection.East,
  SouthEast = CardinalDirection.South + CardinalDirection.East,
  SouthWest = CardinalDirection.South + CardinalDirection.West,
  NorthWest = CardinalDirection.North + CardinalDirection.West
}
