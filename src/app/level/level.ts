import { AvatarEntity } from '../avatar';
import {
  EntityManager,
  EntityStaticDataManager,
  EntityUnion,
  PositionComponentData,
  positionComponentKey,
  renderableComponentKey
} from '../entities';
import { Glyph, GlyphTile, GlyphTilemap, GlyphTilemapComponents } from '../plugins/glyph';
import { SchedulerState } from '../scheduler';
import { World } from '../world';

import { LevelCell } from './level-cell';
import { LevelData } from './level-data';
import { LevelScene } from './level-scene';
import { LevelType } from './level-type';

export class Level {
  protected readonly glyphmap: GlyphTilemap;

  public constructor(protected readonly levelData: LevelData) {
    const { font, glyphsets } = this.world;
    const { width, height } = this.levelData.mapData;

    this.glyphmap = this.levelScene.add.glyphmap(undefined, width, height, font);
    this.glyphmap.createBlankLayer('default', Array.from(glyphsets.values()));

    this.entityManager.forEach((entity) => {
      const position = entity.getComponent<PositionComponentData>(positionComponentKey);

      if (!position) {
        return;
      }

      const { x, y } = position;

      this.getCell(x, y).addEntity(entity);
    });

    for (let y = 0; y < height; ++y) {
      for (let x = 0; x < width; ++x) {
        const cell = this.getCell(x, y);
        cell.entities.forEach((entity) => this.allocateGameObject(entity));
        cell.refresh();
      }
    }
  }

  public get type(): LevelType {
    return this.levelData.type;
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

  public get entityStaticDataManager(): EntityStaticDataManager {
    return this.levelData.entityStaticDataManager;
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

  public setCameraBounds(camera?: Phaser.Cameras.Scene2D.Camera): this {
    const normalizedCamera = camera || this.levelData.levelScene.cameras.main;
    const { x, y, widthInPixels, heightInPixels } = this.glyphmap.getLayer(undefined);

    normalizedCamera.setBounds(x, y, widthInPixels, heightInPixels);

    return this;
  }

  public allocateGameObject(entity: string | EntityUnion): Phaser.GameObjects.GameObject {
    const normalizedEntity = this.normalizeEntity(entity);

    if (normalizedEntity.gameobject) {
      return normalizedEntity.gameobject;
    }

    if (!normalizedEntity.hasComponent(positionComponentKey)) {
      return;
    }

    const renderCoordinates = this.getRenderCoordinates(
      normalizedEntity.getComponent<PositionComponentData>(positionComponentKey)
    );

    const renderable = this.getRenderable(entity);

    // TODO: Handle non-glyph renderables for some entities...
    const glyphs = this.getGlyphsFromRenderable(renderable);

    if (!glyphs.length) {
      // Not found...
      glyphs.push(new Glyph('_', '#fff', undefined, this.levelScene.world.font));
    }

    normalizedEntity.gameobject = this.levelScene.add.glyphSprite(renderCoordinates.x, renderCoordinates.y, glyphs);

    return normalizedEntity.gameobject;
  }

  protected getCellFromTile(tile: GlyphTile): LevelCell {
    const { x, y } = tile;
    return new LevelCell(this, x, y, this.levelData.mapData.getCell(x, y), tile);
  }

  protected normalizeEntity(entity: string | EntityUnion): EntityUnion {
    if (typeof entity === 'string') {
      if (this.entityManager.has(entity)) {
        return this.entityManager.get(entity);
      }

      if (entity === AvatarEntity.id) {
        return this.levelScene.avatar;
      }
    } else {
      return entity;
    }
  }

  protected getRenderCoordinates(position: PositionComponentData): Phaser.Geom.Point {
    const { x: cellX, y: cellY } = position;
    const cell = this.getCell(cellX, cellY);
    const tile = cell.tile;

    const offsetX = tile.width / 2;
    const offsetY = tile.height / 2;

    return new Phaser.Geom.Point(cell.worldX + offsetX, cell.worldY + offsetY);
  }

  protected getRenderable(entity: string | EntityUnion): number | number[] {
    const normalizedEntity = this.normalizeEntity(entity);

    if (normalizedEntity.hasComponent(renderableComponentKey)) {
      return normalizedEntity.getComponent(renderableComponentKey);
    }

    if (normalizedEntity.hasStaticComponent(renderableComponentKey, this.entityStaticDataManager)) {
      return normalizedEntity.getStaticComponent(renderableComponentKey, this.entityStaticDataManager);
    }
  }

  protected getGlyphsFromRenderable(renderable: number | number[]): Glyph[] {
    const glyphs: Glyph[] = [];

    if (renderable === undefined) {
      return glyphs;
    }

    const normalizedRenderable = Array.isArray(renderable) ? renderable : [renderable];
    const glyphsets = this.world.glyphsets.values();

    normalizedRenderable.forEach((r) => {
      for (let glyphset of glyphsets) {
        if (glyphset.containsGlyphIndex(r)) {
          glyphs.push(glyphset.getGlyph(r));
          break;
        }
      }
    });

    return glyphs;
  }
}
