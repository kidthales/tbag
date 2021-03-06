import { EntityFactory, renderableComponentKey, TerrainData, TerrainEntity } from '../entity';
import { TownMapData } from '../map';
import { staticDataIds } from '../static-data-ids';
import { WorldStaticData } from '../world';

import { LevelData, LevelType } from './level';

export function populate(levelData: LevelData): void {
  switch (levelData.type) {
    case LevelType.Town:
      populateTown(levelData.mapData, levelData);
      break;
    default:
      break;
  }
}

function populateTown(mapData: TownMapData, levelData: LevelData): void {
  const terrainEntityFactory = levelData.entityManager.createFactory(TerrainEntity);

  assignBuildings(mapData, levelData, terrainEntityFactory);
}

function assignBuildings(
  mapData: TownMapData,
  levelData: LevelData,
  terrainEntityFactory: EntityFactory<TerrainEntity<TerrainData>>
): void {
  const renderable = getEntranceTerrainRenderable(levelData.levelScene.world.staticData);
  let index = 0;

  mapData.features.buildings.forEach((buildingFeature) => {
    const { x, y } = buildingFeature.entrance;

    terrainEntityFactory(staticDataIds.terrain.entrance, {
      renderable: renderable[index++ % renderable.length],
      position: { x, y }
    });
  });
}

function getEntranceTerrainRenderable(staticData: WorldStaticData): number[] {
  const renderable = staticData.getTerrain(staticDataIds.terrain.entrance)[renderableComponentKey];
  return typeof renderable === 'number' ? [renderable] : renderable;
}
