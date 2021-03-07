import RNG from 'rot-js/lib/rng';

import { entityStaticDataIds } from '../../../configs';

import { MapCell } from '../../map-cell';

import { generateTownStaticConfig } from './generate-town-static-config';
import { getBuildingFeature } from './get-building-feature';
import { TownMapData } from './town-map-data';

export function allocateBuildingFeatures(mapData: TownMapData, availableAreas: Phaser.Geom.Rectangle[]): void {
  const { numBuildings } = generateTownStaticConfig;

  mapData.features.buildings = [];

  for (let i = 0; i < numBuildings; ++i) {
    if (!availableAreas.length) {
      break;
    }

    const area = Phaser.Utils.Array.SpliceOne(availableAreas, RNG.getUniformInt(0, availableAreas.length - 1));

    const buildingFeature = getBuildingFeature(area);
    const building = buildingFeature.building;

    for (let y = building.y; y < building.bottom; ++y) {
      for (let x = building.x; x < building.right; ++x) {
        mapData.setCell(x, y, new MapCell(entityStaticDataIds.terrain.wall));
      }
    }

    const { x, y } = buildingFeature.entrance;
    mapData.setCell(x, y, new MapCell(entityStaticDataIds.terrain.entrance));

    mapData.features.buildings.push(buildingFeature);
  }
}
