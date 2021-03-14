import { JSONObject } from '../utils';

import { EntityData } from './entity-data';
import { EntityType } from './entity-type';

export interface EntityState<T extends EntityData = EntityData> extends JSONObject {
  readonly type: EntityType;
  readonly id: string;
  readonly staticDataId: number;
  data?: T;
}
