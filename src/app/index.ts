import { layoutConfig } from './configs';
import { GlyphPlugin, LocalStoragePlugin } from './plugins';
import { BootScene, MainScene, PreloadScene, TitleScene } from './scenes';

/**
 * Run game.
 */
export function app(): void {
  new Phaser.Game({
    title: 'tbag',
    version: '0.0.0',
    type: Phaser.AUTO,
    parent: 'body',
    dom: {
      createContainer: true
    },
    scale: layoutConfig.scale,
    plugins: {
      global: [GlyphPlugin.pluginDefinition, LocalStoragePlugin.pluginDefinition]
    },
    scene: [BootScene, PreloadScene, TitleScene, MainScene]
  });
}
