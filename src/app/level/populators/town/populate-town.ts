import { EntityManager, EntityStaticDataManager, TerrainEntity } from '../../../entities';
import { TownMapData } from '../../../map';
import { Scheduler } from '../../../scheduler';

import { assignBuildings } from './assign-buildings';

export function populateTown(
  mapData: TownMapData,
  entityManager: EntityManager,
  entityStaticDataManager: EntityStaticDataManager,
  scheduler: Scheduler
): void {
  const terrainEntityFactory = entityManager.createFactory(TerrainEntity);

  assignBuildings(mapData, entityStaticDataManager, terrainEntityFactory);
}
