import { entityStaticDataIdConfig } from '../../../configs';
import { CreatureEntity, EntityManager, EntityStaticDataManager, TerrainEntity } from '../../../entities';
import { TownMapData } from '../../../map';
import { Scheduler } from '../../../scheduler';

import { assignBuildings } from './assign-buildings';

export function populateTown(
  mapData: TownMapData,
  entityManager: EntityManager,
  entityStaticDataManager: EntityStaticDataManager,
  scheduler: Scheduler,
  rng: Phaser.Math.RandomDataGenerator
): void {
  const terrainEntityFactory = entityManager.createFactory(TerrainEntity);
  const creatureEntityFactory = entityManager.createFactory(CreatureEntity);

  assignBuildings(mapData, entityStaticDataManager, terrainEntityFactory);

  // TODO: Testing...
  mapData.features.unusedAreas.forEach((area) => {
    const { x, y } = area.getRandomPoint();

    const human = creatureEntityFactory(entityStaticDataIdConfig.creature.human, {
      position: { x: Math.floor(x), y: Math.floor(y) }
    });

    scheduler.add(human.id, true, 1);
  });
}
