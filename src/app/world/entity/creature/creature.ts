import { JSONObject } from '../../../utils';

import { Entity, EntityData, EntityStaticData } from '../entity';
import { EntityType } from '../type';

export interface CreatureStaticData extends EntityStaticData, JSONObject {}

export interface CreatureData extends Partial<CreatureStaticData>, EntityData, JSONObject {}

export interface CreatureEntity extends Entity<CreatureData> {
  type: EntityType.Creature;
}
