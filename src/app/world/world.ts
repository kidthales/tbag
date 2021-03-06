import { Font, FontLike, GlyphTileset, GlyphVector } from '../plugins/glyph';
import { LocalStorageScene } from '../plugins/local-storage';

import { CreatureStaticData, EphemeralStaticData, ItemStaticData, TerrainStaticData } from './entity';
import { LevelData, LevelDataConfig, LevelScene, LevelType } from './level';
import { Scheduler, SchedulerState } from './scheduler';

/**
 * World static data.
 */
export interface WorldStaticDataConfig {
  /**
   * Terrain entity static data.
   */
  readonly terrain: TerrainStaticData[];

  /**
   * Creature entity static data.
   */
  readonly creature: CreatureStaticData[];

  /**
   * Item entity static data.
   */
  readonly item: ItemStaticData[];

  /**
   * Ephemeral entity static data.
   */
  readonly ephemeral: EphemeralStaticData[];
}

export class WorldStaticData {
  /**
   * Terrain entity static data.
   */
  protected readonly terrain: TerrainStaticData[];

  /**
   * Creature entity static data.
   */
  protected readonly creature: CreatureStaticData[];

  /**
   * Item entity static data.
   */
  protected readonly item: ItemStaticData[];

  /**
   * Ephemeral entity static data.
   */
  protected readonly ephemeral: EphemeralStaticData[];

  public constructor({ terrain, creature, item, ephemeral }: WorldStaticDataConfig) {
    this.terrain = terrain;
    this.creature = creature;
    this.item = item;
    this.ephemeral = ephemeral;
  }

  public getTerrain(id: number): TerrainStaticData {
    return this.terrain[id];
  }

  public getCreature(id: number): CreatureStaticData {
    return this.creature[id];
  }

  public getItem(id: number): ItemStaticData {
    return this.item[id];
  }

  public getEphemeral(id: number): EphemeralStaticData {
    return this.ephemeral[id];
  }
}

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
   * Static data for the world.
   */
  staticData: WorldStaticDataConfig;

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

/**
 * World data.
 */
export class WorldData {
  /**
   * Default font for glyphs.
   */
  protected static readonly defaultFont = new Font(32, 'monospace');

  /**
   * Font for glyphs.
   */
  public readonly font: Font;

  /**
   * Glyphset mappings.
   */
  public readonly glyphsets: Map<string, GlyphTileset>;

  /**
   * World static data.
   */
  public readonly staticData: WorldStaticData;

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
  public constructor({ font, glyphs, staticData, levels, schedulerState }: WorldDataConfig) {
    this.font = Font.normalize(font || WorldData.defaultFont);

    let gid = 0;
    this.glyphsets = new Map<string, GlyphTileset>(
      Object.entries(glyphs).map(([id, vector]) => {
        const glyphset = new GlyphTileset(id, gid, this.font, vector);
        gid = glyphset.total;
        return [id, glyphset];
      })
    );

    this.staticData = new WorldStaticData(staticData);

    this.levels = new Map<string, LevelData>(
      Object.entries(levels || {}).map(([id, config]) => [id, new LevelData(config)])
    );

    this.scheduler = new Scheduler(schedulerState);
  }
}

/**
 * World.
 */
export class World {
  /**
   * Glyphset mappings.
   */
  public readonly glyphsets: Map<string, GlyphTileset>;

  /**
   * World static data.
   */
  public readonly staticData: WorldStaticData;

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
    { font, glyphsets, staticData, levels, scheduler }: WorldData
  ) {
    this.worldFont = font;
    this.glyphsets = glyphsets;
    this.staticData = staticData;
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
    this.levels.set('town', new LevelData({ type: LevelType.Town, seed: Date.now().toString() }));

    const levelScene = new LevelScene('town', this);

    this.scene.scene.add(levelScene.id, levelScene, false, {});
    this.scene.scene.launch(levelScene.id, { firstTime: true });
  }

  //protected onTick(time: number): void {}
}
