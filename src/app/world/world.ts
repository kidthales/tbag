import { Font, GlyphTileset, GlyphVector } from '../plugins/glyph';
import { LocalStorageScene } from '../plugins/local-storage';

import { CreatureStaticData, TerrainStaticData } from './entity';
import { LevelDataConfig, LevelData, LevelScene } from './level';
import { Scheduler, SchedulerState } from './scheduler';

export interface WorldDataConfig {
  glyphs: GlyphVector[];
  levels?: Record<string, LevelDataConfig>;
  schedulerState?: SchedulerState;
}

export class WorldData {
  public readonly glyphs: GlyphVector[];

  public readonly levels: Map<string, LevelData>;

  public readonly scheduler: Scheduler;

  public constructor({ glyphs, levels, schedulerState }: WorldDataConfig) {
    this.glyphs = glyphs;

    this.levels = new Map<string, LevelData>(
      Object.entries(levels || {}).map(([id, config]) => [id, new LevelData(config)])
    );

    this.scheduler = new Scheduler(schedulerState);
  }
}

export class World {
  public readonly font: Font;

  public readonly glyphset: GlyphTileset;

  public readonly scheduler: Scheduler;

  protected readonly levels: Map<string, LevelData>;

  public constructor(protected readonly scene: LocalStorageScene, worldData: WorldData) {
    this.font = new Font(32, 'monospace');
    this.glyphset = new GlyphTileset('worldGlyphs', 0, this.font, worldData.glyphs);

    this.levels = worldData.levels;
    this.scheduler = worldData.scheduler;

    //this.scheduler.onTick(this.onTick, this);
  }

  public get creature(): CreatureStaticData[] {
    return this.scene.cache.json.get('creature');
  }

  public get terrain(): TerrainStaticData[] {
    return this.scene.cache.json.get('terrain');
  }

  public run(): void {
    this.levels.set('town', new LevelData({ seed: Date.now().toString() }));

    const levelScene = new LevelScene('town', this);

    this.scene.scene.add(levelScene.id, levelScene, false, {});
    this.scene.scene.launch(levelScene.id, { firstTime: true });
  }

  public getLevelData(id: string): LevelData {
    if (this.levels.has(id)) {
      return this.levels.get(id);
    }
  }

  //protected onTick(time: number): void {}
}
