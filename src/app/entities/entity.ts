import { ComponentDataUnion } from './components';
import { EntityData } from './entity-data';
import { EntityState } from './entity-state';
import { EntityType } from './entity-type';
import { EntityStaticDataManager } from './managers';

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

  public abstract hasStaticComponent(key: string, staticData: EntityStaticDataManager): boolean;

  public abstract getStaticComponent<D extends ComponentDataUnion>(key: string, staticData: EntityStaticDataManager): D;

  public hasComponent(key: string): boolean {
    return this.data && this.data[key] !== undefined;
  }

  public getComponent<D extends ComponentDataUnion>(key: string): D {
    if (!this.data) {
      return;
    }

    return (this.data as EntityData)[key] as D;
  }

  public setComponent<D extends ComponentDataUnion>(key: string, data: D): this {
    if (!this.data) {
      this.data = {} as T;
    }

    (this.data as EntityData)[key] = data;

    return this;
  }
}
