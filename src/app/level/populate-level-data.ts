import { Scheduler } from '../scheduler';

import { LevelData } from './level-data';
import { LevelType } from './level-type';
import { populateTown } from './populators';

export function populateLevelData(
  levelData: LevelData,
  scheduler: Scheduler,
  rng: Phaser.Math.RandomDataGenerator
): void {
  switch (levelData.type) {
    case LevelType.Town:
      populateTown(levelData.mapData, levelData.entityManager, levelData.entityStaticDataManager, scheduler, rng);
      break;
    default:
      break;
  }
}
//level.entityManager.forEach(({ id }) => worldScheduler.add(id, true, 1));
