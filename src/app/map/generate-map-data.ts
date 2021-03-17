import { LevelType } from '../level';

import { MapDataGenerator, TownMapDataGenerator } from './generators';
import { MapDataUnion } from './map-data-union';

export function generateMapData(type: LevelType, seed: string[]): MapDataUnion {
  let generator: MapDataGenerator;

  switch (type) {
    case LevelType.Town:
    default:
      generator = new TownMapDataGenerator(seed);
      break;
  }

  return generator.generate() as MapDataUnion;
}
