import { LocalStoragePlugin } from '../plugins';

export interface LocalStorageScene extends Phaser.Scene {
  [LocalStoragePlugin.mapping]: LocalStoragePlugin;
}
