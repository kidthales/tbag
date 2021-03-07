import ArenaGenerator from 'rot-js/lib/map/arena';

import { MapCell } from '../../map-cell';

import { binaryPartition } from '../binary-partition';
import { getRandomDimensions } from '../get-random-dimensions';
import { normalizeSeed } from '../normalize-seed';
import { setSeed } from '../set-seed';

import { allocateBuildingFeatures } from './allocate-building-features';
import { generateTownStaticConfig } from './generate-town-static-config';
import { TownMapData } from './town-map-data';

export function generateTown(seed: string | string[]): TownMapData {
  setSeed(normalizeSeed(seed));

  const {
    minMapDimensions,
    maxMapDimensions,
    arenaIndexToTerrainStaticDataId,
    featureAreaOffset,
    featureAreaBinaryPartitionDepth
  } = generateTownStaticConfig;

  const mapDimensions = getRandomDimensions(minMapDimensions, maxMapDimensions);
  const mapData = new TownMapData(mapDimensions.width, mapDimensions.height, { exterior: true });

  // Empty area bordered by walls.
  const generator = new ArenaGenerator(mapDimensions.width, mapDimensions.height);
  generator.create((x, y, contents) => mapData.setCell(x, y, new MapCell(arenaIndexToTerrainStaticDataId[contents])));

  const featureAreas = binaryPartition(
    new Phaser.Geom.Rectangle(
      featureAreaOffset.x,
      featureAreaOffset.y,
      mapDimensions.width - 2 * featureAreaOffset.x,
      mapDimensions.height - 2 * featureAreaOffset.y
    ),
    featureAreaBinaryPartitionDepth
  );

  allocateBuildingFeatures(mapData, featureAreas);

  mapData.features.unusedAreas = featureAreas;

  return mapData;
}
