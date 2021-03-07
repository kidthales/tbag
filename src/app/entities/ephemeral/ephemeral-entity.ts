import { ComponentDataUnion } from '../components';
import { Entity } from '../entity';
import { EntityType } from '../entity-type';
import { EntityStaticDataManager } from '../managers';

import { EphemeralData } from './ephemeral-data';

export class EphemeralEntity<T extends EphemeralData = EphemeralData> extends Entity<T> {
  public readonly type = EntityType.Ephemeral;

  public hasStaticComponent(key: string, staticData: EntityStaticDataManager): boolean {
    const data = staticData.getEphemeral(this.staticDataId);

    return data && !!data[key];
  }

  public getStaticComponent<D extends ComponentDataUnion>(key: string, staticData: EntityStaticDataManager): D {
    const data = staticData.getEphemeral(this.staticDataId);

    if (!data) {
      return;
    }

    return data[key] as D;
  }
}
