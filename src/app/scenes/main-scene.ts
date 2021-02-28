import { GlyphVector } from '../plugins/glyph';
import { LocalStoragePlugin, LocalStorageScene } from '../plugins/local-storage';
import { World, WorldData } from '../world';

export class MainScene extends Phaser.Scene implements LocalStorageScene {
  public static readonly key = 'Main';

  public readonly [LocalStoragePlugin.mapping]: LocalStoragePlugin;

  public constructor() {
    super(MainScene.key);
  }

  public init(): void {}

  public create(): void {
    const glyphs = this.cache.json.get('glyphs') as GlyphVector[];

    const worldData = new WorldData({ glyphs });
    const world = new World(this, worldData);

    world.run();
  }
}
