import { JSONObject } from '../../utils';

import { EntityState } from '../entity-state';

export interface EntityManagerState extends JSONObject {
  entities: EntityState[];
}
