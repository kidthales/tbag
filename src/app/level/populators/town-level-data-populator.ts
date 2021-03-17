import { entityStaticDataIdConfig } from '../../configs';
import { CreatureEntity, renderableComponentKey, TerrainEntity } from '../../entities';
import { TownMapData } from '../../map';

import { LevelDataPopulator } from './level-data-populator';

export class TownLevelDataPopulator extends LevelDataPopulator<TownMapData> {
  public populate(): void {
    this.assignBuildings();
    this.assignCreatures();
  }

  protected assignBuildings(): void {
    const terrainEntityFactory = this.entityManager.createFactory(TerrainEntity);

    const renderable = this.getEntranceTerrainRenderable();
    let index = 0;

    this.mapData.features.buildings.forEach((buildingFeature) => {
      const { x, y } = buildingFeature.entrance;

      terrainEntityFactory(entityStaticDataIdConfig.terrain.entrance, {
        renderable: renderable[index++ % renderable.length],
        position: { x, y }
      });
    });
  }

  protected assignCreatures(): void {
    const creatureEntityFactory = this.entityManager.createFactory(CreatureEntity);

    this.mapData.features.unusedAreas.forEach((area) => {
      const { x, y } = area.getRandomPoint();

      const human = creatureEntityFactory(entityStaticDataIdConfig.creature.human, {
        position: { x: Math.floor(x), y: Math.floor(y) }
      });

      this.scheduler.add(human.id, true, 1);
    });
  }

  protected getEntranceTerrainRenderable(): number[] {
    const renderable = this.entityStaticDataManager.getTerrain(entityStaticDataIdConfig.terrain.entrance)[
      renderableComponentKey
    ];
    return typeof renderable === 'number' ? [renderable] : renderable;
  }
}
