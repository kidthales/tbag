import { AvatarEntity } from '../avatar';
import { EntityStaticDataManager } from '../entities';
import { LevelData, LevelScene, LevelType } from '../level';
import { Font, GlyphTileset } from '../plugins/glyph';
import { LocalStorageScene } from '../plugins/local-storage';
import { Save } from '../save';
import { Scheduler } from '../scheduler';

import { WorldData } from './world-data';

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
      const s0 = Date.now();
      const s1 = s0 * Math.random();
      const s2 = s0 * Math.random();

      this.levels.set(
        'town',
        new LevelData({
          type: LevelType.Town,
          seed: [s0, s1, s2].map((s) => s.toString()),
          persist: true,
          entityStaticDataManager: this.entityStaticDataManager
        })
      );

      this.currentLevel = 'town';
    }

    const levelScene = new LevelScene(this.currentLevel, this);

    this.scene.scene.add(levelScene.id, levelScene, false, {});

    this.scene.scene.launch(levelScene.id, {
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
    this.scheduler.clear();
    this.saveAccessor.clear();

    this.scene.events.emit('Trigger Game Over');
  }

  protected onTick(time: number): void {
    console.log(`Time elapsed: ${time}`);
  }
}
