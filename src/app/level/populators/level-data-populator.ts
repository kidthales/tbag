import { EntityManager, EntityStaticDataManager } from '../../entities';
import { MapDataUnion } from '../../map';
import { Scheduler } from '../../scheduler';

import { LevelData } from '../level-data';

export abstract class LevelDataPopulator<T extends MapDataUnion = MapDataUnion> {
  public constructor(
    protected readonly levelData: LevelData,
    protected readonly scheduler: Scheduler,
    protected readonly rng: Phaser.Math.RandomDataGenerator
  ) {}

  protected get mapData(): T {
    return this.levelData.mapData as T;
  }

  protected get entityManager(): EntityManager {
    return this.levelData.entityManager;
  }

  protected get entityStaticDataManager(): EntityStaticDataManager {
    return this.levelData.entityStaticDataManager;
  }

  public abstract populate(): void;
}
