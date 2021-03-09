import { entityStaticDataIdConfig } from '../../../configs';
import { EntityStaticDataManager, renderableComponentKey } from '../../../entities';

export function getEntranceTerrainRenderable(entityStaticDataManager: EntityStaticDataManager): number[] {
  const renderable = entityStaticDataManager.getTerrain(entityStaticDataIdConfig.terrain.entrance)[
    renderableComponentKey
  ];
  return typeof renderable === 'number' ? [renderable] : renderable;
}
