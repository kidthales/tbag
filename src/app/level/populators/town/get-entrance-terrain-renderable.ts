import { entityStaticDataIds } from '../../../configs';
import { EntityStaticDataManager, renderableComponentKey } from '../../../entities';

export function getEntranceTerrainRenderable(entityStaticDataManager: EntityStaticDataManager): number[] {
  const renderable = entityStaticDataManager.getTerrain(entityStaticDataIds.terrain.entrance)[renderableComponentKey];
  return typeof renderable === 'number' ? [renderable] : renderable;
}
