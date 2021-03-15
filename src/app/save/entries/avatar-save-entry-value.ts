import { AvatarData } from '../../avatar';
import { JSONObject } from '../../utils';

export interface AvatarSaveEntryValue extends JSONObject {
  staticDataId: number;
  data: AvatarData;
}
