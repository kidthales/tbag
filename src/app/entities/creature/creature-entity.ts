import { ComponentDataUnion } from '../components';
import { Entity } from '../entity';
import { EntityType } from '../entity-type';
import { EntityStaticDataManager } from '../managers';

import { CreatureData } from './creature-data';

export class CreatureEntity<T extends CreatureData = CreatureData> extends Entity<T> {
  public readonly type = EntityType.Creature;

  public hasStaticComponent(key: string, staticData: EntityStaticDataManager): boolean {
    const data = staticData.getCreature(this.staticDataId);

    return data && !!data[key];
  }

  public getStaticComponent<D extends ComponentDataUnion>(key: string, staticData: EntityStaticDataManager): D {
    const data = staticData.getCreature(this.staticDataId);

    if (!data) {
      return;
    }

    return data[key] as D;
  }
}
