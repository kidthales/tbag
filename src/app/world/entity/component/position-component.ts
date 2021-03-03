import { JSONObject } from '../../../utils';

export const positionComponentKey = 'position';

export interface PositionComponentData extends JSONObject {
  x: number;
  y: number;
}

export interface PositionComponent extends JSONObject {
  [positionComponentKey]: PositionComponentData;
}
