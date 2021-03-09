import { AvatarEntity } from '../avatar';
import { avatarConfig } from '../configs';
import { EntityStaticDataManager, renderableComponentKey } from '../entities';
import { LevelData, LevelScene, LevelType } from '../level';
import { Font, GlyphTileset } from '../plugins/glyph';
import { LocalStorageScene } from '../plugins/local-storage';
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
   * Instantiate world.
   *
   * @param scene Host scene.
   * @param worldData World data.
   */
  public constructor(
    protected readonly scene: LocalStorageScene,
    { font, glyphsets, entityStaticDataManager, levels, scheduler }: WorldData
  ) {
    this.worldFont = font;
    this.glyphsets = glyphsets;
    this.entityStaticDataManager = entityStaticDataManager;
    this.levels = levels;
    this.scheduler = scheduler;

    //this.scheduler.onTick(this.onTick, this);
  }

  /**
   * Get clone of font instance in use.
   */
  public get font(): Font {
    return Font.clone(this.worldFont);
  }

  /**
   * TODO: Replace this nonsense...
   */
  public run(): void {
    this.levels.set(
      'town',
      new LevelData({
        type: LevelType.Town,
        seed: Date.now().toString(),
        entityStaticDataManager: this.entityStaticDataManager
      })
    );

    const levelScene = new LevelScene('town', this);

    this.scene.scene.add(levelScene.id, levelScene, false, {});
    this.scene.scene.launch(levelScene.id, {
      avatar: new AvatarEntity(0, { [renderableComponentKey]: avatarConfig.renderable }),
      populate: true,
      fromSave: false
    });
  }

  //protected onTick(time: number): void {}
}
