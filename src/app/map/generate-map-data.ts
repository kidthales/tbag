import { generateTown } from './generators';
import { MapDataUnion } from './map-data-union';
import { MapType } from './map-type';

export function generateMapData(type: MapType, seed: string | string[]): MapDataUnion {
  switch (type) {
    case MapType.Town:
    default:
      return generateTown(seed);
  }
}
