import { AvatarEntity } from '../avatar';

export interface LevelSceneLaunchData {
  avatar: AvatarEntity;
  worldViewport: Phaser.Geom.Rectangle;
  fromSave?: boolean;
  populate?: boolean;
}
