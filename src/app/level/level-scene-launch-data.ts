import { AvatarEntity } from '../avatar';

export interface LevelSceneLaunchData {
  avatar: AvatarEntity;
  fromSave?: boolean;
  populate?: boolean;
}
