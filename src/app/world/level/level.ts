import { Glyph, GlyphSprite, GlyphTile, GlyphTilemap, GlyphTilemapComponents } from '../../plugins/glyph';

import {
  CreatureEntity,
  EntityManager,
  EntityManagerState,
  EntityType,
  EntityUnion,
  EphemeralEntity,
  ItemEntity,
  TerrainEntity,
  TerrainStaticData
} from '../entity';
import { MapCell, mapCellEntityIdsIndex, mapCellTerrainStaticDataIdIndex, MapData } from '../map';
import { SchedulerState } from '../scheduler';
import { World } from '../world';

import { LevelCell } from './level-cell';
import { LevelScene } from './level-scene';

export interface LevelDataConfig {
  seed: string | string[];
  rngState?: string;
  entityManagerState?: EntityManagerState;
  schedulerState?: SchedulerState;
  mapData?: MapData;
  levelScene?: LevelScene;
}

export class LevelData {
  public readonly seed: string | string[];

  public readonly entityManager: EntityManager;

  public mapData: MapData;

  public rngState: string;

  public schedulerState: SchedulerState;

  public levelScene: LevelScene;

  public constructor({ seed, rngState, entityManagerState, schedulerState, mapData, levelScene }: LevelDataConfig) {
    this.seed = seed;
    this.entityManager = new EntityManager(entityManagerState);

    this.rngState = rngState || null;
    this.schedulerState = schedulerState || null;

    this.mapData = mapData || null;
    this.levelScene = levelScene || null;
  }
}

export class Level {
  protected glyphmap: GlyphTilemap;

  public constructor(protected readonly levelData: LevelData) {
    const { font, glyphset } = this.world;
    const { width, height } = this.levelData.mapData;

    this.glyphmap = this.levelScene.add.glyphmap(undefined, width, height, font);
    this.glyphmap.createBlankLayer('layer', glyphset);

    this.entityManager.forEach((entity) => {
      const p = entity.data?.position;

      if (!p) {
        return;
      }

      const { x, y } = p;

      this.getCell(x, y).addEntity(entity);
    });
  }

  public get seed(): string | string[] {
    return this.levelData.seed;
  }

  public get width(): number {
    return this.levelData.mapData.width;
  }

  public get height(): number {
    return this.levelData.mapData.height;
  }

  public get entityManager(): EntityManager {
    return this.levelData.entityManager;
  }

  public get rngState(): string {
    return this.levelData.rngState;
  }

  public set rngState(state: string) {
    this.levelData.rngState = state;
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

  public get world(): World {
    return this.levelScene.world;
  }

  public create(): void {
    const { glyphset } = this.world;
    const { width, height } = this.levelData.mapData;
    const scene = this.levelScene;

    for (let y = 0; y < height; ++y) {
      for (let x = 0; x < width; ++x) {
        const cell = this.getCell(x, y);
        const { tile } = cell;

        // Create gameobjects for entities...
        const offsetX = tile.width / 2;
        const offsetY = tile.height / 2;

        cell.entities.forEach((entity) => {
          let renderable = entity.data?.renderable;

          if (renderable === undefined) {
            switch (entity.type) {
              case EntityType.Terrain:
                renderable = this.world.terrain[entity.staticDataId].renderable;
                break;
              case EntityType.Creature:
                renderable = this.world.creature[entity.staticDataId].renderable;
                break;
              case EntityType.Item:
              case EntityType.Ephemeral:
              default:
                return;
            }
          }

          if (renderable === undefined) {
            return;
          }

          let glyphs: Glyph[];

          if (Array.isArray(renderable) && renderable.length) {
            glyphs = renderable.map((r) => glyphset.getGlyph(r));
          } else if (typeof renderable === 'number') {
            glyphs = [glyphset.getGlyph(renderable)];
          }

          if (!glyphs) {
            return;
          }

          entity.gameobject = scene.add.glyphSprite(cell.worldX + offsetX, cell.worldY + offsetY, glyphs);
        });

        cell.refresh();
      }
    }
  }

  public getCell(x: number, y: number): LevelCell {
    const tile = this.glyphmap.getTileAt(x, y, true);
    return this.getCellFromTile(tile);
  }

  public getCellsWithin(x: number, y: number, width: number, height: number): LevelCell[] {
    const cells: LevelCell[] = [];

    this.glyphmap.forEachTile((tile) => cells.push(this.getCellFromTile(tile)), this, x, y, width, height);

    return cells;
  }

  public getCellsWithinShape(
    shape: Phaser.Geom.Circle | Phaser.Geom.Line | Phaser.Geom.Rectangle | Phaser.Geom.Triangle,
    camera?: Phaser.Cameras.Scene2D.Camera
  ): LevelCell[] {
    return this.glyphmap
      .getTilesWithinShape(shape, { isNotEmpty: false }, camera || this.levelData.levelScene.cameras.main)
      .map((tile) => this.getCellFromTile(tile));
  }

  public filterCells(
    callback: (cell: LevelCell, index: number, array: LevelCell[]) => boolean,
    context: unknown,
    x: number,
    y: number,
    width: number,
    height: number
  ): LevelCell[] {
    return this.getCellsWithin(x, y, width, height).filter(callback, context);
  }

  public findCells(
    callback: (cell: LevelCell, index: number, array: LevelCell[]) => boolean,
    context: unknown,
    x: number,
    y: number,
    width: number,
    height: number
  ): LevelCell {
    return this.getCellsWithin(x, y, width, height).find(callback, context);
  }

  public forEachCell(
    callback: (cell: LevelCell, index: number, array: LevelCell[]) => void,
    context: unknown,
    x: number,
    y: number,
    width: number,
    height: number
  ): void {
    return this.getCellsWithin(x, y, width, height).forEach(callback, context);
  }

  public isInBounds(x: number, y: number): boolean {
    const { width, height } = this.levelData.mapData;
    return x >= 0 && x < width && y >= 0 && y < height;
  }

  public hasCellAtWorldXY(x: number, y: number, camera?: Phaser.Cameras.Scene2D.Camera): boolean {
    return this.glyphmap.hasTileAtWorldXY(x, y, camera || this.levelData.levelScene.cameras.main);
  }

  public getCellAtWorldXY(x: number, y: number, camera?: Phaser.Cameras.Scene2D.Camera): LevelCell {
    const tile = this.glyphmap.getTileAtWorldXY(x, y, true, camera || this.levelData.levelScene.cameras.main);
    return this.getCellFromTile(tile);
  }

  public getCellsWithinWorldXY(
    x: number,
    y: number,
    width: number,
    height: number,
    camera?: Phaser.Cameras.Scene2D.Camera
  ): LevelCell[] {
    return this.glyphmap
      .getTilesWithinWorldXY(
        x,
        y,
        width,
        height,
        { isNotEmpty: false },
        camera || this.levelData.levelScene.cameras.main
      )
      .map((tile) => this.getCellFromTile(tile));
  }

  public worldToCellX(x: number, snapToFloor: boolean, camera?: Phaser.Cameras.Scene2D.Camera): number {
    return this.glyphmap.worldToTileX(x, snapToFloor, camera || this.levelData.levelScene.cameras.main);
  }

  public worldToCellY(y: number, snapToFloor: boolean, camera?: Phaser.Cameras.Scene2D.Camera): number {
    return this.glyphmap.worldToTileY(y, snapToFloor, camera || this.levelData.levelScene.cameras.main);
  }

  public worldToCellXY(
    x: number,
    y: number,
    snapToFloor: boolean,
    point?: Phaser.Math.Vector2,
    camera?: Phaser.Cameras.Scene2D.Camera
  ): Phaser.Math.Vector2 {
    return this.glyphmap.worldToTileXY(x, y, snapToFloor, point, camera || this.levelData.levelScene.cameras.main);
  }

  public cellToWorldX(x: number, camera?: Phaser.Cameras.Scene2D.Camera): number {
    return this.glyphmap.tileToWorldX(x, camera || this.levelData.levelScene.cameras.main);
  }

  public cellToWorldY(y: number, camera?: Phaser.Cameras.Scene2D.Camera): number {
    return this.glyphmap.tileToWorldY(y, camera || this.levelData.levelScene.cameras.main);
  }

  public cellToWorldXY(
    x: number,
    y: number,
    point?: Phaser.Math.Vector2,
    camera?: Phaser.Cameras.Scene2D.Camera
  ): Phaser.Math.Vector2 {
    return this.glyphmap.tileToWorldXY(x, y, point, camera || this.levelData.levelScene.cameras.main);
  }

  public cull(camera?: Phaser.Cameras.Scene2D.Camera): LevelCell[] {
    return this.glyphmap
      .getLayer(undefined)
      .glyphmapLayer.cull(camera || this.levelData.levelScene.cameras.main)
      .map((tile) => this.getCellFromTile(tile));
  }

  public cullBounds(camera?: Phaser.Cameras.Scene2D.Camera): Phaser.Geom.Rectangle {
    return GlyphTilemapComponents.cullBounds(
      this.glyphmap.getLayer(undefined),
      camera || this.levelData.levelScene.cameras.main
    );
  }

  protected getCellFromTile(tile: GlyphTile): LevelCell {
    const { x, y } = tile;
    return new LevelCell(this, x, y, this.levelData.mapData.cells[y][x], tile);
  }
}
