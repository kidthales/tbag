import { LevelType } from '../level';

export const worldConfig = {
  firstLevelId: 'town',
  levels: {
    town: {
      type: LevelType.Town,
      persist: true
    }
  }
};
