import { CardinalDirection, IntercardinalDirection, MapDataUnion, translate } from '../../map';
import { PathFinder } from '../../path';
import { GlyphTile, GlyphTilemap, GlyphTilemapComponents } from '../../plugins/glyph';
import { enumValues } from '../../utils';

import { Level } from '../level';
import { LevelCell } from '../level-cell';
import { LevelGameObjectDepth } from '../level-game-object-depth';

export class LevelMapManager {
  protected static readonly defaultMapLayerName = 'default';

  protected static readonly defaultNeighborDirections = [
    ...enumValues(CardinalDirection),
    ...enumValues(IntercardinalDirection)
  ];

  protected readonly glyphmap: GlyphTilemap;

  protected readonly pathFinder = new PathFinder();

  public constructor(protected readonly level: Level) {
    const {
      width,
      height,
      levelScene,
      world: { font, glyphsets }
    } = level;

    const glyphmap = (this.glyphmap = levelScene.add.glyphmap(undefined, width, height, font));

    const layer = glyphmap
      .createBlankLayer(LevelMapManager.defaultMapLayerName, Array.from(glyphsets.values()))
      .setInteractive()
      .setDepth(LevelGameObjectDepth.Map);

    level.gameObjectGroup.add(layer);
  }

  public get width(): number {
    return this.level.width;
  }

  public get height(): number {
    return this.level.height;
  }

  public get widthInPixels(): number {
    return this.glyphmap.widthInPixels;
  }

  public get heightInPixels(): number {
    return this.glyphmap.heightInPixels;
  }

  protected get levelCamera(): Phaser.Cameras.Scene2D.Camera {
    return this.level.levelScene.levelCamera;
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
      .getTilesWithinShape(shape, { isNotEmpty: false }, camera || this.levelCamera)
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
    const { width, height } = this.level;
    return x >= 0 && x < width && y >= 0 && y < height;
  }

  public hasCellAtWorldXY(x: number, y: number, camera?: Phaser.Cameras.Scene2D.Camera): boolean {
    return this.glyphmap.hasTileAtWorldXY(x, y, camera || this.levelCamera);
  }

  public getCellAtWorldXY(x: number, y: number, camera?: Phaser.Cameras.Scene2D.Camera): LevelCell {
    const tile = this.glyphmap.getTileAtWorldXY(x, y, true, camera || this.levelCamera);
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
      .getTilesWithinWorldXY(x, y, width, height, { isNotEmpty: false }, camera || this.levelCamera)
      .map((tile) => this.getCellFromTile(tile));
  }

  public worldToCellX(x: number, snapToFloor: boolean, camera?: Phaser.Cameras.Scene2D.Camera): number {
    return this.glyphmap.worldToTileX(x, snapToFloor, camera || this.levelCamera);
  }

  public worldToCellY(y: number, snapToFloor: boolean, camera?: Phaser.Cameras.Scene2D.Camera): number {
    return this.glyphmap.worldToTileY(y, snapToFloor, camera || this.levelCamera);
  }

  public worldToCellXY(
    x: number,
    y: number,
    snapToFloor: boolean,
    point?: Phaser.Math.Vector2,
    camera?: Phaser.Cameras.Scene2D.Camera
  ): Phaser.Math.Vector2 {
    return this.glyphmap.worldToTileXY(x, y, snapToFloor, point, camera || this.levelCamera);
  }

  public cellToWorldX(x: number, camera?: Phaser.Cameras.Scene2D.Camera): number {
    return this.glyphmap.tileToWorldX(x, camera || this.levelCamera);
  }

  public cellToWorldY(y: number, camera?: Phaser.Cameras.Scene2D.Camera): number {
    return this.glyphmap.tileToWorldY(y, camera || this.levelCamera);
  }

  public cellToWorldXY(
    x: number,
    y: number,
    point?: Phaser.Math.Vector2,
    camera?: Phaser.Cameras.Scene2D.Camera
  ): Phaser.Math.Vector2 {
    return this.glyphmap.tileToWorldXY(x, y, point, camera || this.levelCamera);
  }

  public cellCenterToWorldXY(
    x: number,
    y: number,
    point?: Phaser.Math.Vector2,
    camera?: Phaser.Cameras.Scene2D.Camera
  ): Phaser.Math.Vector2 {
    const glyphmap = this.glyphmap;

    const tile = glyphmap.getTileAt(x, y, true);
    const offsetX = tile.width / 2;
    const offsetY = tile.height / 2;

    return glyphmap
      .tileToWorldXY(x, y, point, camera || this.levelCamera)
      .add(new Phaser.Math.Vector2(offsetX, offsetY));
  }

  public cull(camera?: Phaser.Cameras.Scene2D.Camera): LevelCell[] {
    return this.glyphmap
      .getLayer(LevelMapManager.defaultMapLayerName)
      .glyphmapLayer.cull(camera || this.levelCamera)
      .map((tile) => this.getCellFromTile(tile));
  }

  public cullBounds(camera?: Phaser.Cameras.Scene2D.Camera): Phaser.Geom.Rectangle {
    return GlyphTilemapComponents.cullBounds(
      this.glyphmap.getLayer(LevelMapManager.defaultMapLayerName),
      camera || this.levelCamera
    );
  }

  public setCameraBounds(camera?: Phaser.Cameras.Scene2D.Camera): this {
    const normalizedCamera = camera || this.levelCamera;
    const { x, y, widthInPixels, heightInPixels } = this.glyphmap.getLayer(LevelMapManager.defaultMapLayerName);

    normalizedCamera.setBounds(x, y, widthInPixels, heightInPixels);

    return this;
  }

  public getPath(
    begin: Phaser.Geom.Point,
    end: Phaser.Geom.Point,
    neighbors: (cell: LevelCell) => LevelCell[] = (cell) => this.getPathDefaultNeighbors(cell)
  ): LevelCell[] {
    return this.pathFinder
      .find(begin, end, ({ x, y }) => neighbors(this.getCell(x, y)).map(({ x, y }) => ({ x, y })))
      .map(({ x, y }) => this.getCell(x, y));
  }

  public getBresenhamPath(begin: Phaser.Geom.Point, end: Phaser.Geom.Point): LevelCell[] {
    return Phaser.Geom.Line.BresenhamPoints(new Phaser.Geom.Line(begin.x, begin.y, end.x, end.y)).map(({ x, y }) =>
      this.getCell(x, y)
    );
  }

  protected getCellFromTile(tile: GlyphTile): LevelCell {
    const { x, y } = tile;
    return new LevelCell(this.level, x, y, this.level.mapData.getCell(x, y), tile);
  }

  protected getPathDefaultNeighbors(cell: LevelCell): LevelCell[] {
    return LevelMapManager.defaultNeighborDirections
      .map((direction) => {
        const [x, y] = translate(cell.x, cell.y, direction);

        if (this.isInBounds(x, y)) {
          const neighbor = this.getCell(x, y);

          if (!neighbor.blockMove && !neighbor.creature) {
            return neighbor;
          }
        }
      })
      .filter(Boolean);
  }
}
