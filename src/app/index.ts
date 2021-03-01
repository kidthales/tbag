import { GlyphPlugin, LocalStoragePlugin } from './plugins';
import { BootScene, MainScene, PreloadScene, TitleScene } from './scenes';

/**
 * Phaser game configuration.
 */
const gameConfig: Phaser.Types.Core.GameConfig = {
  title: 'tbag',
  version: '0.0.0',
  type: Phaser.AUTO,
  parent: 'body',
  dom: {
    createContainer: true
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 1600,
    height: 900
  },
  plugins: {
    global: [GlyphPlugin.pluginDefinition, LocalStoragePlugin.pluginDefinition]
  },
  scene: [BootScene, PreloadScene, TitleScene, MainScene]
};

/**
 * Run game.
 */
export function app(): void {
  new Phaser.Game(gameConfig);
}
