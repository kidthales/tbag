import { JSONObject } from '../../utils';

import { DescriptionComponent, PositionComponent, RenderableComponent } from './component';
import { EntityType } from './type';

export interface EntityStaticData extends DescriptionComponent, Partial<RenderableComponent>, JSONObject {}

export interface EntityData extends Partial<EntityStaticData>, Partial<PositionComponent>, JSONObject {}

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
