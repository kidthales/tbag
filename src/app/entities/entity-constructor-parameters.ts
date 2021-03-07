import { EntityData } from './entity-data';

export type EntityConstructorParameters<T extends EntityData = EntityData> = [
  string,
  number,
  T?,
  Phaser.GameObjects.GameObject?
];
