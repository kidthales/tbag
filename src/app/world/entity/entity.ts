import { JSONObject, JSONValue } from '../../utils';
import { WorldStaticData } from '../world';

import { DescriptionComponent, LevelCellComponent, PositionComponent, RenderableComponent } from './components';

export enum EntityType {
  Terrain,
  Item,
  Creature,
  Ephemeral
}

export interface EntityStaticData extends DescriptionComponent, Partial<RenderableComponent>, JSONObject {}

export interface EntityData extends Partial<EntityStaticData>, Partial<PositionComponent>, JSONObject {}

export type EntityConstructorParameters<T extends EntityData = EntityData> = [
  string,
  number,
  T?,
  Phaser.GameObjects.GameObject?
];

export interface EntityState<T extends EntityData = EntityData> {
  readonly type: EntityType;
  readonly id: string;
  readonly staticDataId: number;
  data?: T;
}

export abstract class Entity<T extends EntityData = EntityData> {
  public abstract readonly type: EntityType;

  public constructor(
    public readonly id: string,
    public readonly staticDataId: number,
    public data?: T,
    public gameobject?: Phaser.GameObjects.GameObject
  ) {}

  public get state(): EntityState {
    return {
      type: this.type,
      id: this.id,
      staticDataId: this.staticDataId,
      data: this.data
    };
  }

  public abstract hasStaticComponent(key: string, staticData: WorldStaticData): boolean;

  public abstract getStaticComponent<D extends JSONValue>(key: string, staticData: WorldStaticData): D;

  public hasComponent(key: string): boolean {
    return this.data && this.data[key] !== undefined;
  }

  public getComponent<D extends JSONValue>(key: string): D {
    if (!this.data) {
      return;
    }

    return (this.data as EntityData)[key] as D;
  }

  public setComponent<D extends JSONValue>(key: string, data: D): this {
    if (!this.data) {
      this.data = {} as T;
    }

    (this.data as EntityData)[key] = data;

    return this;
  }
}

export interface TerrainStaticData extends LevelCellComponent, EntityStaticData {}

export interface TerrainData extends Partial<TerrainStaticData>, EntityData {}

export class TerrainEntity<T extends TerrainData = TerrainData> extends Entity<T> {
  public readonly type = EntityType.Terrain;

  public hasStaticComponent(key: string, staticData: WorldStaticData): boolean {
    const data = staticData.getTerrain(this.staticDataId);

    return data && !!data[key];
  }

  public getStaticComponent<D extends JSONValue>(key: string, staticData: WorldStaticData): D {
    const data = staticData.getTerrain(this.staticDataId);

    if (!data) {
      return;
    }

    return data[key] as D;
  }
}

export interface CreatureStaticData extends EntityStaticData {}

export interface CreatureData extends Partial<CreatureStaticData>, EntityData {}

export class CreatureEntity<T extends CreatureData = CreatureData> extends Entity<T> {
  public readonly type = EntityType.Creature;

  public hasStaticComponent(key: string, staticData: WorldStaticData): boolean {
    const data = staticData.getCreature(this.staticDataId);

    return data && !!data[key];
  }

  public getStaticComponent<D extends JSONValue>(key: string, staticData: WorldStaticData): D {
    const data = staticData.getCreature(this.staticDataId);

    if (!data) {
      return;
    }

    return data[key] as D;
  }
}

export interface ItemStaticData extends EntityStaticData {}

export interface ItemData extends Partial<ItemStaticData>, EntityData {}

export class ItemEntity<T extends ItemData = ItemData> extends Entity<T> {
  public readonly type = EntityType.Item;

  public hasStaticComponent(key: string, staticData: WorldStaticData): boolean {
    const data = staticData.getItem(this.staticDataId);

    return data && !!data[key];
  }

  public getStaticComponent<D extends JSONValue>(key: string, staticData: WorldStaticData): D {
    const data = staticData.getItem(this.staticDataId);

    if (!data) {
      return;
    }

    return data[key] as D;
  }
}

export interface EphemeralStaticData extends EntityStaticData {}

export interface EphemeralData extends Partial<EphemeralStaticData>, EntityData {}

export class EphemeralEntity<T extends EphemeralData = EphemeralData> extends Entity<T> {
  public readonly type = EntityType.Ephemeral;

  public hasStaticComponent(key: string, staticData: WorldStaticData): boolean {
    const data = staticData.getEphemeral(this.staticDataId);

    return data && !!data[key];
  }

  public getStaticComponent<D extends JSONValue>(key: string, staticData: WorldStaticData): D {
    const data = staticData.getEphemeral(this.staticDataId);

    if (!data) {
      return;
    }

    return data[key] as D;
  }
}

export type EntityUnion = TerrainEntity | ItemEntity | EphemeralEntity | CreatureEntity;
