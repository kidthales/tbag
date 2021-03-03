import { JSONObject } from '../../../utils';

export const levelCellComponentKey = 'levelCell';

export interface LevelCellComponentData extends JSONObject {
  blockMove: boolean;
  blockLight: boolean;
}

export interface LevelCellComponent extends JSONObject {
  [levelCellComponentKey]: LevelCellComponentData;
}
