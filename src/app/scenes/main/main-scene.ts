import { avatarConfig, entityStaticDataIdConfig, layoutConfig, saveConfig } from '../../configs';
import { MessageHud, NewGamePopup, StatusHud } from '../../dom';
import { EntityStaticDataManager, renderableComponentKey } from '../../entities';
import { LocalStoragePlugin, LocalStorageScene } from '../../plugins/local-storage';
import { Save } from '../../save';
import { World, WorldData, WorldDataConfig, WorldExitReason } from '../../world';

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

    const { bottomHud, leftHud } = layoutConfig.mainScene.inWorld;

    this.hudGroup.add(new MessageHud(this, bottomHud.x, bottomHud.y, bottomHud.width, bottomHud.height).setOrigin(0));
    this.hudGroup.add(new StatusHud(this, leftHud.x, leftHud.y, leftHud.width, leftHud.height).setOrigin(0));

    this.hudGroup.setVisible(false);

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
    const popup = new NewGamePopup(
      this,
      0,
      0,
      layoutConfig.scale.width,
      layoutConfig.scale.height,
      (avatarStaticDataId, avatarData) => {
        this.worldDataConfig.avatarStaticDataId = avatarStaticDataId;
        this.worldDataConfig.avatarData = avatarData;

        popup.destroy();

        this.transition(MainSceneState.InWorld);
      }
    ).setOrigin(0);
  }

  protected onInWorld(prevState: MainSceneState): void {
    this.hudGroup.setVisible(true);

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
        this.reloadPage();
        break;
    }
  }

  protected onGameOver(): void {
    this.reloadPage();
  }

  protected reloadPage(): void {
    window.location.reload();
  }
}
