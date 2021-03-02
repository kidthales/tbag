import { LocalStoragePlugin, LocalStorageScene } from '../plugins/local-storage';
import { World, WorldData, WorldDataConfig } from '../world';

export class MainScene extends Phaser.Scene implements LocalStorageScene {
  public static readonly key = 'Main';

  public readonly [LocalStoragePlugin.mapping]: LocalStoragePlugin;

  public constructor() {
    super(MainScene.key);
  }

  public init(): void {}

  public create(): void {
    const worldDataConfig: WorldDataConfig = {
      glyphs: {
        default: this.cache.json.get('glyphs')
      },
      staticData: {
        terrain: this.cache.json.get('terrain'),
        creature: this.cache.json.get('creature'),
        item: this.cache.json.get('item'),
        ephemeral: this.cache.json.get('ephemeral')
      }
    };

    const worldData = new WorldData(worldDataConfig);

    const world = new World(this, worldData);

    world.run();
  }
}
