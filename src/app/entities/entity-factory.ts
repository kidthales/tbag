import { EntityUnion } from './entity-union';

export type EntityFactory<T extends EntityUnion = EntityUnion> = <D extends T['data'] = T['data']>(
  staticDataId: number,
  data?: D,
  gameobject?: Phaser.GameObjects.GameObject
) => T;
