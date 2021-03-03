import { JSONObject } from '../../../utils';

export const renderableComponentKey = 'renderable';

export type RenderableComponentData = number | number[];

export interface RenderableComponent extends JSONObject {
  [renderableComponentKey]: RenderableComponentData;
}
