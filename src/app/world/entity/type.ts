import { CreatureEntity } from './creature';
import { EphemeralEntity } from './ephemeral';
import { ItemEntity } from './item';
import { TerrainEntity } from './terrain';

export enum EntityType {
  Terrain,
  Item,
  Creature,
  Ephemeral
}

export type EntityUnion = TerrainEntity | ItemEntity | EphemeralEntity | CreatureEntity;
