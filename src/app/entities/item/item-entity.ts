import { ComponentDataUnion } from '../components';
import { Entity } from '../entity';
import { EntityType } from '../entity-type';
import { EntityStaticDataManager } from '../managers';

import { ItemData } from './item-data';

export class ItemEntity<T extends ItemData = ItemData> extends Entity<T> {
  public readonly type = EntityType.Item;

  public hasStaticComponent(key: string, staticData: EntityStaticDataManager): boolean {
    const data = staticData.getItem(this.staticDataId);

    return data && !!data[key];
  }

  public getStaticComponent<D extends ComponentDataUnion>(key: string, staticData: EntityStaticDataManager): D {
    const data = staticData.getItem(this.staticDataId);

    if (!data) {
      return;
    }

    return data[key] as D;
  }
}
