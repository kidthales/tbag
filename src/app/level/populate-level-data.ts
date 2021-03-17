import { Scheduler } from '../scheduler';

import { LevelData } from './level-data';
import { LevelType } from './level-type';
import { LevelDataPopulator, TownLevelDataPopulator } from './populators';

export function populateLevelData(
  levelData: LevelData,
  scheduler: Scheduler,
  rng: Phaser.Math.RandomDataGenerator
): void {
  let populator: LevelDataPopulator;

  switch (levelData.type) {
    case LevelType.Town:
      populator = new TownLevelDataPopulator(levelData, scheduler, rng);
      break;
    default:
      return;
  }

  populator.populate();
}
