import { CreatureEntity } from './creature';
import { EphemeralEntity } from './ephemeral';
import { ItemEntity } from './item';
import { TerrainEntity } from './terrain';

export type EntityUnion = TerrainEntity | ItemEntity | EphemeralEntity | CreatureEntity;
