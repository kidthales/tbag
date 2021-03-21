import { EntityManagerState, EntityStaticDataManager } from '../entities';
import { MapDataUnion } from '../map';
import { SchedulerState } from '../scheduler';

import { LevelScene } from './level-scene';
import { LevelType } from './level-type';

export interface LevelDataConfig {
  type: LevelType;
  seed: string[];
  entityStaticDataManager: EntityStaticDataManager;
  persist?: boolean;
  rngState?: string;
  entityManagerState?: EntityManagerState;
  schedulerState?: SchedulerState;
  mapData?: MapDataUnion;
  avatarExplored?: true | Record<string, boolean>;
  levelScene?: LevelScene;
}
