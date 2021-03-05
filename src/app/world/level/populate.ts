import { EntityType, TerrainData, TerrainEntity, terrainStaticDataIds } from '../entity';
import { renderableComponentKey } from '../entity/component';
import { TownMapData } from '../map';

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
  const entranceRenderable =
    levelData.levelScene.world.staticData.terrain[terrainStaticDataIds.entrance][renderableComponentKey];

  let frame = 0;

  mapData.features.buildings.forEach((buildingFeature) => {
    const { x, y } = buildingFeature.entrance;

    levelData.entityManager.create<TerrainEntity, TerrainData>(EntityType.Terrain, terrainStaticDataIds.entrance, {
      renderable: entranceRenderable[frame++],
      position: { x, y }
    });
  });
}
