import { JSONObject, JSONValue } from '../../utils';

import { EntityType } from './type';

export interface EntityStaticData extends JSONObject {
  name: string;
  renderable?: number | number[];
}

export interface EntityData extends Partial<EntityStaticData>, JSONObject {
  position?: {
    x: number;
    y: number;
  };
}

export interface Entity<
  T extends EntityData = EntityData,
  V extends Phaser.GameObjects.GameObject = Phaser.GameObjects.GameObject
> {
  readonly id: string;
  type: EntityType;
  staticDataId: number;
  data?: T;
  gameobject?: V;
}
