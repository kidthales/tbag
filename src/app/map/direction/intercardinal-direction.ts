import { CardinalDirection } from './cardinal-direction';

export enum IntercardinalDirection {
  Northeast = CardinalDirection.North + CardinalDirection.East,
  Southeast = CardinalDirection.South + CardinalDirection.East,
  Southwest = CardinalDirection.South + CardinalDirection.West,
  Northwest = CardinalDirection.North + CardinalDirection.West
}
