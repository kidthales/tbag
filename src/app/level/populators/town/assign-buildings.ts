import { entityStaticDataIdConfig } from '../../../configs';
import { EntityFactory, EntityStaticDataManager, TerrainData, TerrainEntity } from '../../../entities';
import { TownMapData } from '../../../map';

import { getEntranceTerrainRenderable } from './get-entrance-terrain-renderable';

export function assignBuildings(
  mapData: TownMapData,
  entityStaticDataManager: EntityStaticDataManager,
  terrainEntityFactory: EntityFactory<TerrainEntity<TerrainData>>
): void {
  const renderable = getEntranceTerrainRenderable(entityStaticDataManager);
  let index = 0;

  mapData.features.buildings.forEach((buildingFeature) => {
    const { x, y } = buildingFeature.entrance;

    terrainEntityFactory(entityStaticDataIdConfig.terrain.entrance, {
      renderable: renderable[index++ % renderable.length],
      position: { x, y }
    });
  });
}
