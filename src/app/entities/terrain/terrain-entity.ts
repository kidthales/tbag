import { ComponentDataUnion } from '../components';
import { Entity } from '../entity';
import { EntityType } from '../entity-type';
import { EntityStaticDataManager } from '../managers';

import { TerrainData } from './terrain-data';

export class TerrainEntity<T extends TerrainData = TerrainData> extends Entity<T> {
  public readonly type = EntityType.Terrain;

  public hasStaticComponent(key: string, staticData: EntityStaticDataManager): boolean {
    const data = staticData.getTerrain(this.staticDataId);

    return data && !!data[key];
  }

  public getStaticComponent<D extends ComponentDataUnion>(key: string, staticData: EntityStaticDataManager): D {
    const data = staticData.getTerrain(this.staticDataId);

    if (!data) {
      return;
    }

    return data[key] as D;
  }
}
