import { EntityManagerState } from '../../entities';
import { LevelType } from '../../level';
import { SchedulerState } from '../../scheduler';
import { JSONObject } from '../../utils';

export interface LevelSaveEntryValue extends JSONObject {
  type: LevelType;
  seed: string[];
  rngState: string;
  persist: boolean;
  entityManagerState: EntityManagerState;
  schedulerState: SchedulerState;
  avatarExplored: true | Record<string, boolean>;
}
