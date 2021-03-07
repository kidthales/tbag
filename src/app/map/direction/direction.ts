import { CardinalDirection } from './cardinal-direction';
import { IntercardinalDirection } from './intercardinal-direction';
import { SecondaryIntercardinalDirection } from './secondary-intercardinal-direction';

export const Direction = { ...CardinalDirection, ...IntercardinalDirection, ...SecondaryIntercardinalDirection };

export type Direction = CardinalDirection | IntercardinalDirection | SecondaryIntercardinalDirection;
