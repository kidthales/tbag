import { JSONObject } from '../../../utils';

import { Entity, EntityData, EntityStaticData } from '../entity';
import { EntityType } from '../type';

export interface ItemStaticData extends EntityStaticData, JSONObject {}

export interface ItemData extends Partial<ItemStaticData>, EntityData, JSONObject {}

export interface ItemEntity extends Entity<ItemData> {
  type: EntityType.Item;
}
