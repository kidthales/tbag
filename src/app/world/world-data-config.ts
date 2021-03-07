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

  entityStaticDataManager: EntityStaticDataManager;

  /**
   * Persisted font state.
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
