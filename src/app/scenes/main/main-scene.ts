import { avatarConfig, entityStaticDataIdConfig, layoutConfig, saveConfig } from '../../configs';
import { EntityStaticDataManager, renderableComponentKey } from '../../entities';
import { LocalStoragePlugin, LocalStorageScene } from '../../plugins/local-storage';
import { Save } from '../../save';
import { World, WorldData, WorldDataConfig, WorldExitReason } from '../../world';

import { TitleScene } from '../title-scene';

import { MainSceneState } from './main-scene-state';

export class MainScene extends Phaser.Scene implements LocalStorageScene {
  public static readonly key = 'Main';

  public readonly [LocalStoragePlugin.mapping]: LocalStoragePlugin;

  protected state: MainSceneState;

  protected save: Save;

  protected hudGroup: Phaser.GameObjects.Group;

  protected worldDataConfig: WorldDataConfig;

  public constructor() {
    super(MainScene.key);
  }

  public init(): void {
    this.initSave().initTransitionHandlers().initWorldDataConfig().initHud();
  }

  public create(): void {
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.onShutdown, this);
    this.transition(MainSceneState.LoadFromSave);
  }

  protected initSave(): this {
    this.save = new Save(this.ls).applyTransforms(saveConfig.transforms);
    return this;
  }

  protected initTransitionHandlers(): this {
    this.events.once(MainSceneState.LoadFromSave, () => this.onLoadFromSave(), this);
    this.events.once(MainSceneState.NewGame, () => this.onNewGame(), this);
    this.events.once(MainSceneState.InWorld, (prevState: MainSceneState) => this.onInWorld(prevState), this);
    this.events.once(MainSceneState.GameOver, () => this.onGameOver(), this);
    return this;
  }

  protected initWorldDataConfig(): this {
    const jsonCache = this.cache.json;

    this.worldDataConfig = {
      worldViewport: layoutConfig.mainScene.inWorld.worldViewport,
      font: layoutConfig.mainScene.inWorld.font,
      glyphs: { default: jsonCache.get('glyphs') },
      entityStaticDataManager: new EntityStaticDataManager(jsonCache)
    };

    return this;
  }

  protected initHud(): this {
    this.hudGroup = this.add.group();
    //this.hudGroup.add(this.add.graphics({ x: 0, y: 0 }).fillStyle(0x0000ff).fillRect(0, 0, 100, 900));
    //this.hudGroup.add(this.add.graphics({ x: 1350, y: 0 }).fillStyle(0xff0000).fillRect(0, 0, 250, 900));
    //this.hudGroup.add(this.add.graphics({ x: 100, y: 700 }).fillStyle(0x00ff00).fillRect(0, 0, 1250, 200));
    return this;
  }

  protected transition(state: MainSceneState): void {
    const prevState = this.state;
    this.state = state;

    this.events.emit(state, prevState);
  }

  protected onLoadFromSave(): void {
    const savedWorldDataConfig = this.save.loadWorld();

    if (!savedWorldDataConfig.currentLevel) {
      this.save.clear();
      this.transition(MainSceneState.NewGame);
    } else {
      this.worldDataConfig.avatarStaticDataId = savedWorldDataConfig.avatarStaticDataId;
      this.worldDataConfig.avatarData = savedWorldDataConfig.avatarData;
      this.worldDataConfig.currentLevel = savedWorldDataConfig.currentLevel;
      this.worldDataConfig.levels = {};

      Object.entries(savedWorldDataConfig.levels || {}).forEach(
        ([id, level]) =>
          (this.worldDataConfig.levels[id] = {
            ...level,
            entityStaticDataManager: this.worldDataConfig.entityStaticDataManager
          })
      );

      this.transition(MainSceneState.InWorld);
    }
  }

  protected onNewGame(): void {
    this.worldDataConfig.avatarStaticDataId = entityStaticDataIdConfig.creature.human;
    this.worldDataConfig.avatarData = { [renderableComponentKey]: avatarConfig.renderable };

    this.transition(MainSceneState.InWorld);
  }

  protected onInWorld(prevState: MainSceneState): void {
    const fromSave = prevState === MainSceneState.LoadFromSave;
    const world = new World(this, (reason) => this.onWorldExit(reason), new WorldData(this.worldDataConfig));
    world.run(fromSave);
  }

  protected onWorldExit(reason: WorldExitReason): void {
    switch (reason) {
      case WorldExitReason.GameOver:
        this.transition(MainSceneState.GameOver);
        break;
      case WorldExitReason.None:
      default:
        this.transitionToTitleScene();
        break;
    }
  }

  protected onGameOver(): void {
    this.transitionToTitleScene();
  }

  protected onShutdown(): void {
    this.events.removeAllListeners();
  }

  protected transitionToTitleScene(): void {
    this.scene.transition({ target: TitleScene.key, sleep: false });
  }
}
