import { AvatarEntity } from '../avatar';
import { worldConfig } from '../configs';
import { EntityStaticDataManager } from '../entities';
import { LevelData, LevelScene, LevelSceneLaunchData } from '../level';
import { Font, GlyphTileset } from '../plugins/glyph';
import { LocalStorageScene } from '../plugins/local-storage';
import { Save } from '../save';
import { Scheduler } from '../scheduler';

import { WorldData } from './world-data';
import { WorldExitReason } from './world-exit-reason';

/**
 * World.
 */
export class World {
  /**
   * Glyphset mappings.
   */
  public readonly glyphsets: Map<string, GlyphTileset>;

  /**
   * Entity static data manager.
   */
  public readonly entityStaticDataManager: EntityStaticDataManager;

  /**
   * World viewport location & dimensions.
   */
  public readonly worldViewport: Phaser.Geom.Rectangle;

  /**
   * Avatar entity.
   */
  public readonly avatar: AvatarEntity;

  /**
   * Level data mappings.
   */
  public readonly levels: Map<string, LevelData>;

  /**
   * World scheduler instance.
   */
  public readonly scheduler: Scheduler;

  /**
   * Font for glyphs.
   */
  protected readonly worldFont: Font;

  /**
   * Save accessor.
   */
  protected readonly saveAccessor: Save;

  /**
   * Current level.
   */
  public currentLevel: string;

  /**
   * Instantiate world.
   *
   * @param scene Host scene.
   * @param worldData World data.
   */
  public constructor(
    protected readonly scene: LocalStorageScene,
    protected readonly onWorldExit: (reason: WorldExitReason) => void,
    { font, glyphsets, entityStaticDataManager, worldViewport, avatar, currentLevel, levels, scheduler }: WorldData
  ) {
    this.worldFont = font;
    this.glyphsets = glyphsets;
    this.entityStaticDataManager = entityStaticDataManager;
    this.worldViewport = worldViewport;
    this.avatar = avatar;
    this.currentLevel = currentLevel;
    this.levels = levels;
    this.scheduler = scheduler;

    this.saveAccessor = new Save(scene.ls);
    this.scheduler.onTick(this.onTick, this);
  }

  /**
   * Get clone of font instance in use.
   */
  public get font(): Font {
    return Font.clone(this.worldFont);
  }

  public run(fromSave?: boolean): void {
    if (!fromSave) {
      this.generateLevelData(worldConfig.firstLevelId);
      this.currentLevel = worldConfig.firstLevelId;
    }

    this.generateLevelScene(this.currentLevel);

    this.scene.scene.launch(this.currentLevel, {
      avatar: this.avatar,
      levelViewport: this.worldViewport,
      populate: !fromSave,
      fromSave
    });
  }

  public save(): void {
    this.saveAccessor.saveWorld(this);
  }

  public gameOver(): void {
    for (let id of this.levels.keys()) {
      this.scene.scene.remove(id);
    }

    this.levels.clear();
    this.scheduler.reset(true);
    this.saveAccessor.clear();

    this.onWorldExit(WorldExitReason.GameOver);
  }

  public transitionToLevel(id: string): void {
    const { avatar, currentLevel, levels, scheduler, worldViewport: levelViewport } = this;

    avatar.gameobject = undefined;

    const launchData: LevelSceneLaunchData = { avatar, levelViewport };

    if (!levels.has(id)) {
      this.generateLevelData(id);
      launchData.populate = true;
    }

    const targetLevelData = levels.get(id);

    if (!targetLevelData.levelScene) {
      this.generateLevelScene(id);
    }

    const currentLevelData = levels.get(currentLevel);

    const { persist, levelScene } = currentLevelData;

    if (persist) {
      scheduler.remove(avatar.id);

      currentLevelData.schedulerState = scheduler.state;
      currentLevelData.rngState = levelScene.rng.state();

      this.saveAccessor.saveLevel(currentLevel, currentLevelData);
    }

    scheduler.clear();
    this.currentLevel = id;

    levelScene.scene.transition({
      target: id,
      data: launchData,
      duration: 1000,
      sleep: false,
      allowInput: false,
      onUpdate: (progress: number) => levelScene.levelCamera.setAlpha(1 - progress),
      onUpdateScope: this
    });
  }

  protected onTick(time: number): void {
    console.log(`Time elapsed: ${time}`);
  }

  protected generateLevelData(id: string): void {
    const config = worldConfig.levels[id];

    const s0 = Date.now();
    const s1 = s0 * Math.random();
    const s2 = s0 * Math.random();

    this.levels.set(
      id,
      new LevelData({
        seed: [s0, s1, s2].map((s) => s.toString()),
        entityStaticDataManager: this.entityStaticDataManager,
        ...config
      })
    );
  }

  protected generateLevelScene(id: string): void {
    this.scene.scene.add(id, new LevelScene(id, this), false, {});
  }
}
