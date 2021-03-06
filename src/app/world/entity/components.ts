import { JSONObject } from '../../utils';

export const descriptionComponentKey = 'description';
export const renderableComponentKey = 'renderable';
export const positionComponentKey = 'position';
export const levelCellComponentKey = 'levelCell';

export interface DescriptionComponentData extends JSONObject {
  name: string;
}

export interface DescriptionComponent extends JSONObject {
  [descriptionComponentKey]: DescriptionComponentData;
}

export type RenderableComponentData = number | number[];

export interface RenderableComponent extends JSONObject {
  [renderableComponentKey]: RenderableComponentData;
}

export interface PositionComponentData extends JSONObject {
  x: number;
  y: number;
}

export interface PositionComponent extends JSONObject {
  [positionComponentKey]: PositionComponentData;
}

export interface LevelCellComponentData extends JSONObject {
  blockMove: boolean;
  blockLight: boolean;
}

export interface LevelCellComponent extends JSONObject {
  [levelCellComponentKey]: LevelCellComponentData;
}
