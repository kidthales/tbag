import { JSONObject } from '../../../utils';

import { Entity, EntityData, EntityStaticData } from '../entity';
import { EntityType } from '../type';

export interface TerrainStaticData extends EntityStaticData, JSONObject {
  blockMove?: boolean;
}

export interface TerrainData extends Partial<TerrainStaticData>, EntityData, JSONObject {}

export interface TerrainEntity extends Entity<TerrainData> {
  type: EntityType.Terrain;
}
