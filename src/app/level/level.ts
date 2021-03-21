import { EntityManager, EntityStaticDataManager } from '../entities';
import { MapDataUnion } from '../map';
import { Scheduler, SchedulerState } from '../scheduler';
import { World } from '../world';

import { LevelData } from './level-data';
import { LevelScene } from './level-scene';
import { LevelType } from './level-type';
import { LevelEntityManager, LevelGraphicsManager, LevelMapManager, LevelVisibilityManager } from './managers';

export class Level {
  public readonly gameObjectGroup: Phaser.GameObjects.Group;

  public readonly map: LevelMapManager;

  public readonly entity: LevelEntityManager;

  public readonly graphics: LevelGraphicsManager;

  public readonly visibility: LevelVisibilityManager;

  public constructor(protected readonly levelData: LevelData) {
    this.gameObjectGroup = this.levelScene.add.group();

    this.map = new LevelMapManager(this);
    this.graphics = new LevelGraphicsManager(this);
    this.visibility = new LevelVisibilityManager(this);
    this.entity = new LevelEntityManager(this);
  }

  public get type(): LevelType {
    return this.levelData.type;
  }

  public get seed(): string | string[] {
    return this.levelData.seed;
  }

  public get persist(): boolean {
    return this.levelData.persist;
  }

  public get width(): number {
    return this.levelData.mapData.width;
  }

  public get height(): number {
    return this.levelData.mapData.height;
  }

  public get widthInPixels(): number {
    return this.map.widthInPixels;
  }

  public get heightInPixels(): number {
    return this.map.heightInPixels;
  }

  public get entityManager(): EntityManager {
    return this.levelData.entityManager;
  }

  public get entityStaticDataManager(): EntityStaticDataManager {
    return this.levelData.entityStaticDataManager;
  }

  public get avatarExplored(): true | Record<string, boolean> {
    return this.levelData.avatarExplored;
  }

  public get world(): World {
    return this.levelScene.world;
  }

  public get scheduler(): Scheduler {
    return this.world.scheduler;
  }

  public get rng(): Phaser.Math.RandomDataGenerator {
    return this.levelScene.rng;
  }

  public get mapData(): MapDataUnion {
    return this.levelData.mapData;
  }

  public set mapData(value: MapDataUnion) {
    this.levelData.mapData = value;
  }

  public get rngState(): string {
    return this.levelData.rngState;
  }

  public set rngState(value: string) {
    this.levelData.rngState = value;
  }

  public get schedulerState(): SchedulerState {
    return this.levelData.schedulerState;
  }

  public set schedulerState(state: SchedulerState) {
    this.levelData.schedulerState = state;
  }

  public get levelScene(): LevelScene {
    return this.levelData.levelScene;
  }

  public set levelScene(scene: LevelScene) {
    this.levelData.levelScene = scene;
  }
}
