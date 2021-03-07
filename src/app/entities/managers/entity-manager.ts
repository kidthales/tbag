import { Type } from '../../utils';

import { EntityConstructorParameters } from '../entity-constructor-parameters';
import { EntityFactory } from '../entity-factory';
import { EntityUnion } from '../entity-union';

import { EntityManagerState } from './entity-manager-state';

export class EntityManager {
  protected readonly entities: Map<string, EntityUnion>;

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

  public create<T extends EntityUnion = EntityUnion, U extends T['data'] = T['data']>(
    ctor: Type<T, EntityConstructorParameters<U>>,
    staticDataId: number,
    data?: U,
    gameobject?: Phaser.GameObjects.GameObject
  ): T {
    const id = Phaser.Math.RND.uuid();
    const entity = new ctor(id, staticDataId, data, gameobject);

    this.entities.set(id, entity);
    return entity;
  }

  public createFactory<T extends EntityUnion = EntityUnion>(
    ctor: Type<T, EntityConstructorParameters>
  ): EntityFactory<T> {
    return <D extends T['data'] = T['data']>(
      staticDataId: number,
      data?: D,
      gameobject?: Phaser.GameObjects.GameObject
    ) => {
      return this.create<T, D>(ctor, staticDataId, data, gameobject);
    };
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

  public forEach(callback: (entity: EntityUnion) => void): this {
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
