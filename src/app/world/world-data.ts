import { AvatarEntity } from '../avatar';
import { EntityStaticDataManager } from '../entities';
import { LevelData } from '../level';
import { Font, GlyphTileset } from '../plugins/glyph';
import { Scheduler } from '../scheduler';

import { WorldDataConfig } from './world-data-config';

/**
 * World data.
 */
export class WorldData {
  /**
   * Default font for glyphs.
   */
  protected static readonly defaultFont = new Font(28, 'monospace');

  /**
   * Font for glyphs.
   */
  public readonly font: Font;

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
   * World map viewport location & dimensions.
   */
  public readonly worldMapViewport: Phaser.Geom.Rectangle;

  /**
   * Avatar entity.
   */
  public readonly avatar: AvatarEntity;

  /**
   * Current level.
   */
  public readonly currentLevel: string;

  /**
   * Level data mappings.
   */
  public readonly levels: Map<string, LevelData>;

  /**
   * World scheduler instance.
   */
  public readonly scheduler: Scheduler;

  /**
   * Instantiate world data. Parses & normalizes provided configuration for use with a world instance.
   *
   * @param worldDataConfig World data configuration.
   */
  public constructor({
    font,
    glyphs,
    entityStaticDataManager,
    worldViewport,
    worldMapViewport,
    avatarData,
    avatarStaticDataId,
    currentLevel,
    levels
  }: WorldDataConfig) {
    this.font = Font.normalize(font || WorldData.defaultFont);

    let gid = 0;
    this.glyphsets = new Map<string, GlyphTileset>(
      Object.entries(glyphs).map(([id, vector]) => {
        const glyphset = new GlyphTileset(id, gid, this.font, vector);
        gid = glyphset.total;
        return [id, glyphset];
      })
    );

    this.entityStaticDataManager = entityStaticDataManager;
    this.worldViewport = worldViewport;
    this.worldMapViewport = worldMapViewport;

    this.avatar = new AvatarEntity(avatarStaticDataId, avatarData);

    this.levels = new Map<string, LevelData>(
      Object.entries(levels || {}).map(([id, config]) => [id, new LevelData({ ...config, entityStaticDataManager })])
    );

    this.currentLevel = currentLevel;
    this.scheduler = new Scheduler(this.levels.get(currentLevel)?.schedulerState);
  }
}
