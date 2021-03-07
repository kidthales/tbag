import { CardinalDirection } from './cardinal-direction';
import { CardinalDirectionCombination } from './cardinal-direction-combination';
import { Direction } from './direction';

export function hasCardinalDirectionComponent(
  subject: Direction | CardinalDirectionCombination,
  component: CardinalDirection
): boolean {
  return !!(subject & component);
}
