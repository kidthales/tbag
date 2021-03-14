import { JSONObject } from '../utils';

import { ParsedAvatarSave } from './parsed-avatar-save';
import { ParsedLevelSave } from './parsed-level-save';

export interface ParsedSave extends JSONObject {
  currentLevel?: string;
  avatar?: ParsedAvatarSave;
  levels?: Record<string, ParsedLevelSave>;
}
