import { AvatarEntity } from '../avatar';

export interface LevelSceneLaunchData {
  avatar: AvatarEntity;
  levelViewport: Phaser.Geom.Rectangle;
  levelMinimapViewport: Phaser.Geom.Rectangle;
  fromSave?: boolean;
  populate?: boolean;
}
