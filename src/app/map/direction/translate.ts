import { Direction } from './direction';
import { directionTranslation } from './direction-translation';

export function translate(x: number, y: number, direction: Direction): [number, number] {
  if (direction === undefined || directionTranslation[direction] === undefined) {
    return [x, y];
  }

  const [dx, dy] = directionTranslation[direction];
  return [x + dx, y + dy];
}
