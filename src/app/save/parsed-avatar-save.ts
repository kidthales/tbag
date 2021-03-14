import { AvatarData } from '../avatar';
import { JSONObject } from '../utils';

export interface ParsedAvatarSave extends JSONObject {
  staticDataId: number;
  data: AvatarData;
}
