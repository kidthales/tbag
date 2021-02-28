import { JSONObject } from '../../../utils';

import { Entity, EntityData, EntityStaticData } from '../entity';
import { EntityType } from '../type';

export interface EphemeralStaticData extends EntityStaticData, JSONObject {}

export interface EphemeralData extends Partial<EphemeralStaticData>, EntityData, JSONObject {}

export interface EphemeralEntity extends Entity<EphemeralData> {
  type: EntityType.Ephemeral;
}
