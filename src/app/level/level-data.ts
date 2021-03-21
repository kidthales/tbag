import { EntityManager, EntityStaticDataManager } from '../entities';
import { MapDataUnion } from '../map';
import { SchedulerState } from '../scheduler';

import { LevelDataConfig } from './level-data-config';
import { LevelScene } from './level-scene';
import { LevelType } from './level-type';

export class LevelData {
  public readonly type: LevelType;

  public readonly seed: string[];

  public readonly persist: boolean;

  public readonly entityStaticDataManager: EntityStaticDataManager;

  public readonly entityManager: EntityManager;

  public readonly avatarExplored: true | Record<string, boolean>;

  public mapData: MapDataUnion;

  public rngState: string;

  public schedulerState: SchedulerState;

  public levelScene: LevelScene;

  public constructor({
    type,
    seed,
    entityStaticDataManager,
    persist,
    rngState,
    entityManagerState,
    schedulerState,
    mapData,
    avatarExplored,
    levelScene
  }: LevelDataConfig) {
    this.type = type;
    this.seed = seed;
    this.persist = persist;

    this.entityStaticDataManager = entityStaticDataManager;
    this.entityManager = new EntityManager(entityManagerState);

    this.rngState = rngState || null;
    this.schedulerState = schedulerState || null;

    this.mapData = mapData || null;
    this.levelScene = levelScene || null;

    this.avatarExplored = avatarExplored || {};
  }
}
