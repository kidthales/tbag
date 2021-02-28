import { JSONValue } from '../../utils';

import { Entity, EntityData } from './entity';
import { EntityType, EntityUnion } from './type';

export interface EntityManagerState {
  entities: Entity[];
}

export class EntityManager {
  protected readonly entities: Map<string, Entity>;

  public constructor(state?: EntityManagerState) {
    if (!state) {
      this.entities = new Map();
    } else {
      this.entities = state.entities.reduce((map, entity) => map.set(entity.id, entity), new Map());
    }
  }

  public get total(): number {
    return this.entities.size;
  }

  public get state(): EntityManagerState {
    return {
      entities: Array.from(this.entities.values()).map(({ id, type, staticDataId, data }) => ({
        id,
        type,
        staticDataId,
        data
      }))
    };
  }

  public create<
    T extends Entity<U, V>,
    U extends EntityData = EntityData,
    V extends Phaser.GameObjects.GameObject = Phaser.GameObjects.GameObject
  >(type: EntityType, staticDataId: number, data?: U, gameobject?: V): T {
    const id = Phaser.Math.RND.uuid();
    const entity = { id, type, staticDataId, data, gameobject };

    this.entities.set(id, entity);
    return entity as T;
  }

  public has(id: string): boolean {
    return this.entities.has(id);
  }

  public get(id: string): EntityUnion {
    return this.entities.get(id);
  }

  public delete(id: string): EntityUnion {
    const entity = this.entities.get(id);
    this.entities.delete(id);
    return entity;
  }

  public forEach(callback: (entity: Entity) => void): this {
    this.entities.forEach(callback);
    return this;
  }

  public clear(): this {
    this.entities.clear();
    return this;
  }

  public destroyAll(): this {
    this.forEach((entity) => {
      if (entity.gameobject) {
        entity.gameobject.destroy();
      }
    });

    return this;
  }
}
