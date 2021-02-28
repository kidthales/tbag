import { GlyphPlugin, LocalStoragePlugin } from './plugins';
import { BootScene, MainScene, PreloadScene, TitleScene } from './scenes';

/**
 * Phaser game configuration.
 */
const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'tbag',
  width: window.innerWidth,
  height: window.innerHeight,
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
