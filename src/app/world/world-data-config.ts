import { AvatarData } from '../avatar';
import { EntityStaticDataManager } from '../entities';
import { LevelDataConfig } from '../level';
import { FontLike, GlyphVector } from '../plugins/glyph';
import { SchedulerState } from '../scheduler';

/**
 * World data configuration.
 */
export interface WorldDataConfig {
  /**
   * Glyphs to be parsed into glyphsets.
   */
  glyphs: {
    /**
     * Must have a default set.
     */
    default: GlyphVector[];

    /**
     * Additional glyph groups.
     */
    [name: string]: GlyphVector[];
  };

  /**
   * Entity static data manager.
   */
  entityStaticDataManager: EntityStaticDataManager;

  /**
   * World viewport location & dimensions.
   */
  worldViewport: Phaser.Geom.Rectangle;

  /**
   * Avatar data.
   */
  avatarData: AvatarData;

  /**
   * Avatar static data ID.
   */
  avatarStaticDataId: number;

  /**
   * Font configuration for glyphs.
   */
  font?: FontLike;

  /**
   * Persisted level states.
   */
  levels?: Record<string, LevelDataConfig>;

  /**
   * Persisted world scheduler state.
   */
  schedulerState?: SchedulerState;
}
