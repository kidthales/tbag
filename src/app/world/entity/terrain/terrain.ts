import { JSONObject } from '../../../utils';

import { LevelCellComponent } from '../component';
import { Entity, EntityData, EntityStaticData } from '../entity';
import { EntityType } from '../type';

export interface TerrainStaticData extends LevelCellComponent, EntityStaticData, JSONObject {}

export interface TerrainData extends Partial<TerrainStaticData>, EntityData, JSONObject {}

export interface TerrainEntity extends Entity<TerrainData> {
  type: EntityType.Terrain;
}
