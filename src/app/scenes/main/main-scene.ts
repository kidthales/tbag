import { avatarConfig, entityStaticDataIdConfig, layoutConfig } from '../../configs';
import { EntityStaticDataManager, renderableComponentKey } from '../../entities';
import { LocalStoragePlugin, LocalStorageScene } from '../../plugins/local-storage';
import { World, WorldData, WorldDataConfig } from '../../world';

import { MainSceneState } from './main-scene-state';

export class MainScene extends Phaser.Scene implements LocalStorageScene {
  public static readonly key = 'Main';

  public readonly [LocalStoragePlugin.mapping]: LocalStoragePlugin;

  protected state = MainSceneState.LoadFromSave;

  protected worldDataConfig: WorldDataConfig;

  protected hudGroup: Phaser.GameObjects.Group;

  public constructor() {
    super(MainScene.key);
  }

  public init(): void {
    const jsonCache = this.cache.json;

    this.worldDataConfig = {
      glyphs: { default: jsonCache.get('glyphs') },
      entityStaticDataManager: new EntityStaticDataManager(jsonCache),
      worldViewport: layoutConfig.mainScene.inWorld.worldViewport,
      avatarData: { [renderableComponentKey]: avatarConfig.renderable },
      avatarStaticDataId: entityStaticDataIdConfig.creature.human,
      font: layoutConfig.mainScene.inWorld.font
    };

    this.hudGroup = this.add.group();
    //this.hudGroup.add(this.add.graphics({ x: 0, y: 0 }).fillStyle(0x0000ff).fillRect(0, 0, 100, 900));
    //this.hudGroup.add(this.add.graphics({ x: 1350, y: 0 }).fillStyle(0xff0000).fillRect(0, 0, 250, 900));
    //this.hudGroup.add(this.add.graphics({ x: 100, y: 700 }).fillStyle(0x00ff00).fillRect(0, 0, 1250, 200));
  }

  public create(): void {
    const worldData = new WorldData(this.worldDataConfig);
    const world = new World(this, worldData);

    world.run();
  }
}
