import { GlyphTile } from './glyph-tile';
import { GlyphTilemapLayerData } from './glyph-tilemap-layer';

const point = new Phaser.Math.Vector2();
const pointStart = new Phaser.Math.Vector2();
const pointEnd = new Phaser.Math.Vector2();
const bounds = new Phaser.Geom.Rectangle();
const defaultTileColor = new Phaser.Display.Color(105, 210, 231, 150);

/**
 * For triangle intersection testing.
 *
 * @param triangle Triangle in world (pixel) coordinates.
 * @param rect Rectangle in world (pixel) coordinates.
 */
function triangleToRectangle(triangle: Phaser.Geom.Triangle, rect: Phaser.Geom.Rectangle): boolean {
  return Phaser.Geom.Intersects.RectangleToTriangle(rect, triangle);
}

/**
 * Tile search filter options.
 */
export interface FilteringOptions {
  isNotEmpty?: boolean;
}

/**
 * Draws a debug representation of the layer to the given Graphics. This is helpful when you want to
 * get a quick idea of which of your tiles are colliding and which have interesting faces. The tiles
 * are drawn starting at (0, 0) in the Graphics, allowing you to place the debug representation
 * wherever you want on the screen.
 *
 * @param graphics The target Graphics object to draw upon.
 * @param styleConfig An object specifying the colors to use for the debug drawing.
 * @param layer The GlyphTilemap Layer to act upon.
 */
export function renderDebug(
  graphics: Phaser.GameObjects.Graphics,
  styleConfig: Phaser.Types.Tilemaps.StyleConfig,
  layer: GlyphTilemapLayerData
): void {
  if (styleConfig === undefined) {
    styleConfig = {};
  }

  const tileColor = (styleConfig.tileColor !== undefined
    ? styleConfig.tileColor
    : defaultTileColor) as Phaser.Display.Color;

  const tiles = getTilesWithin(0, 0, layer.width, layer.height, undefined, layer);

  graphics.translateCanvas(layer.glyphmapLayer.x, layer.glyphmapLayer.y);
  graphics.scaleCanvas(layer.glyphmapLayer.scaleX, layer.glyphmapLayer.scaleY);

  for (let i = 0; i < tiles.length; i++) {
    const tile = tiles[i];

    const tw = tile.width;
    const th = tile.height;
    const x = tile.pixelX;
    const y = tile.pixelY;

    if (tileColor !== null) {
      graphics.fillStyle(tileColor.color, tileColor.alpha / 255);
      graphics.fillRect(x, y, tw, th);
    }
  }
}

/**
 * Gets the tiles in the given rectangular area (in tile coordinates) of the layer.
 *
 * @param tileX The left most tile index (in tile coordinates) to use as the origin of the area.
 * @param tileY The top most tile index (in tile coordinates) to use as the origin of the area.
 * @param width How many tiles wide from the `tileX` index the area will be.
 * @param height How many tiles tall from the `tileY` index the area will be.
 * @param options Optional filters to apply when getting the tiles.
 * @param layer - The Glyphmap Layer to act upon.
 */
export function getTilesWithin(
  tileX = 0,
  tileY = 0,
  width: number,
  height: number,
  options: FilteringOptions = {},
  layer: GlyphTilemapLayerData
): GlyphTile[] {
  if (width === undefined) {
    width = layer.width;
  }
  if (height === undefined) {
    height = layer.height;
  }

  const isNotEmpty = options.isNotEmpty || false;

  // Clip x, y to top left of map, while shrinking width/height to match.
  if (tileX < 0) {
    width += tileX;
    tileX = 0;
  }

  if (tileY < 0) {
    height += tileY;
    tileY = 0;
  }

  // Clip width and height to bottom right of map.
  if (tileX + width > layer.width) {
    width = Math.max(layer.width - tileX, 0);
  }

  if (tileY + height > layer.height) {
    height = Math.max(layer.height - tileY, 0);
  }

  const results: GlyphTile[] = [];

  for (let ty = tileY; ty < tileY + height; ty++) {
    for (let tx = tileX; tx < tileX + width; tx++) {
      const tile = layer.data[ty][tx];

      if (tile !== null) {
        if (isNotEmpty && tile.index === -1) {
          continue;
        }

        results.push(tile);
      }
    }
  }

  return results;
}

/**
 * Gets the tiles that overlap with the given shape in the given layer. The shape must be a Circle,
 * Line, Rectangle or Triangle. The shape should be in world coordinates.
 *
 * @param shape A shape in world (pixel) coordinates.
 * @param options Optional filters to apply when getting the tiles.
 * @param camera The Camera to use when calculating the tile index from the world values.
 * @param layer The GlyphTilemap Layer to act upon.
 * @return Array of GlyphTile objects.
 */
export function getTilesWithinShape(
  shape: Phaser.Geom.Circle | Phaser.Geom.Line | Phaser.Geom.Rectangle | Phaser.Geom.Triangle,
  options: FilteringOptions,
  camera: Phaser.Cameras.Scene2D.Camera,
  layer: GlyphTilemapLayerData
): GlyphTile[] {
  if (shape === undefined) {
    return [];
  }

  // intersectTest is a function with parameters: shape, rect
  let intersectTest: (...args: unknown[]) => void | boolean = Phaser.Utils.NOOP;

  if (shape instanceof Phaser.Geom.Circle) {
    intersectTest = Phaser.Geom.Intersects.CircleToRectangle;
  } else if (shape instanceof Phaser.Geom.Rectangle) {
    intersectTest = Phaser.Geom.Intersects.RectangleToRectangle;
  } else if (shape instanceof Phaser.Geom.Triangle) {
    intersectTest = triangleToRectangle;
  } else if (shape instanceof Phaser.Geom.Line) {
    intersectTest = Phaser.Geom.Intersects.LineToRectangle;
  }

  // Top left corner of the shapes's bounding box, rounded down to include partial tiles
  layer.glyphmapLayer.worldToTileXY(shape.left, shape.top, true, pointStart, camera);

  const xStart = pointStart.x;
  const yStart = pointStart.y;

  // Bottom right corner of the shapes's bounding box, rounded up to include partial tiles
  layer.glyphmapLayer.worldToTileXY(shape.right, shape.bottom, true, pointEnd, camera);

  const xEnd = Math.ceil(pointEnd.x);
  const yEnd = Math.ceil(pointEnd.y);

  // Tiles within bounding rectangle of shape. Bounds are forced to be at least 1 x 1 tile in size
  // to grab tiles for shapes that don't have a height or width (e.g. a horizontal line).
  const width = Math.max(xEnd - xStart, 1);
  const height = Math.max(yEnd - yStart, 1);

  const tiles = getTilesWithin(xStart, yStart, width, height, options, layer);

  let tileWidth = layer.tileWidth;
  let tileHeight = layer.tileHeight;

  if (layer.glyphmapLayer) {
    tileWidth *= layer.glyphmapLayer.scaleX;
    tileHeight *= layer.glyphmapLayer.scaleY;
  }

  const results = [];
  const tileRect = new Phaser.Geom.Rectangle(0, 0, tileWidth, tileHeight);

  for (let i = 0; i < tiles.length; i++) {
    const tile = tiles[i];

    layer.glyphmapLayer.tileToWorldXY(tile.x, tile.y, point, camera);

    tileRect.x = point.x;
    tileRect.y = point.y;

    if (intersectTest(shape, tileRect)) {
      results.push(tile);
    }
  }

  return results;
}

/**
 * Copies the tiles in the source rectangular area to a new destination (all specified in tile
 *
 * @param srcTileX The x coordinate of the area to copy from, in tiles, not pixels.
 * @param srcTileY The y coordinate of the area to copy from, in tiles, not pixels.
 * @param width The width of the area to copy, in tiles, not pixels.
 * @param height The height of the area to copy, in tiles, not pixels.
 * @param destTileX The x coordinate of the area to copy to, in tiles, not pixels.
 * @param destTileY The y coordinate of the area to copy to, in tiles, not pixels.
 * @param layer The Glyphmap Layer to act upon.
 */
export function copy(
  srcTileX: number,
  srcTileY: number,
  width: number,
  height: number,
  destTileX: number,
  destTileY: number,
  layer: GlyphTilemapLayerData
): void {
  if (srcTileX < 0) {
    srcTileX = 0;
  }
  if (srcTileY < 0) {
    srcTileY = 0;
  }

  const srcTiles = getTilesWithin(srcTileX, srcTileY, width, height, undefined, layer);

  const offsetX = destTileX - srcTileX;
  const offsetY = destTileY - srcTileY;

  for (let i = 0; i < srcTiles.length; i++) {
    const tileX = srcTiles[i].x + offsetX;
    const tileY = srcTiles[i].y + offsetY;

    if (tileX >= 0 && tileX < layer.width && tileY >= 0 && tileY < layer.height) {
      if (layer.data[tileY][tileX]) {
        layer.data[tileY][tileX].copy(srcTiles[i]);
      }
    }
  }
}

/**
 * Sets the tiles in the given rectangular area (in tile coordinates) of the layer with the
 * specified index.
 *
 * @param index The tile index to fill the area with.
 * @param tileX The left most tile index (in tile coordinates) to use as the origin of the area.
 * @param tileY The top most tile index (in tile coordinates) to use as the origin of the area.
 * @param width How many tiles wide from the `tileX` index the area will be.
 * @param height How many tiles tall from the `tileY` index the area will be.
 * @param layer - The glyph layer to use. If not given the current layer is used.
 */
export function fill(index, tileX, tileY, width, height, layer): void {
  const tiles = getTilesWithin(tileX, tileY, width, height, null, layer);

  for (let i = 0; i < tiles.length; i++) {
    tiles[i].index = index;
  }
}

/**
 * For each tile in the given rectangular area (in tile coordinates) of the layer, run the given
 * filter callback function. Any tiles that pass the filter test (i.e. where the callback returns
 * true) will returned as a new array. Similar to Array.prototype.Filter in vanilla JS.
 *
 * @param callback The callback. Each tile in the given area will be passed to this
 * callback as the first and only parameter. The callback should return true for tiles that pass the
 * filter.
 * @param context The context under which the callback should be run.
 * @param tileX The left most tile index (in tile coordinates) to use as the origin of the area to filter.
 * @param tileY The top most tile index (in tile coordinates) to use as the origin of the area to filter.
 * @param width How many tiles wide from the `tileX` index the area will be.
 * @param height How many tiles tall from the `tileY` index the area will be.
 * @param options Optional filters to apply when getting the tiles.
 * @param layer The Glyphmap Layer to act upon.
 */
export function filterTiles(
  callback: (value: GlyphTile, index: number, array: GlyphTile[]) => boolean,
  context: unknown,
  tileX: number,
  tileY: number,
  width: number,
  height: number,
  options: FilteringOptions,
  layer: GlyphTilemapLayerData
): GlyphTile[] {
  const tiles = getTilesWithin(tileX, tileY, width, height, options, layer);
  return tiles.filter(callback, context);
}

/**
 * Searches the entire map layer for the first tile matching the given index, then returns that GlyphTile
 * object. If no match is found, it returns null. The search starts from the top-left tile and
 * continues horizontally until it hits the end of the row, then it drops down to the next column.
 * If the reverse boolean is true, it scans starting from the bottom-right corner traveling up to
 * the top-left.
 *
 * @param index The tile index value to search for.
 * @param skip The number of times to skip a matching tile before returning.
 * @param reverse If true it will scan the layer in reverse, starting at the bottom-right. Otherwise it scans from the top-left.
 * @param layer The Glyphmap Layer to act upon.
 * @return The first (or n skipped) tile with the matching index.
 */
export function findByIndex(index: number, skip = 0, reverse = false, layer: GlyphTilemapLayerData) {
  let count = 0;
  let tx: number;
  let ty: number;
  let tile: GlyphTile;

  if (reverse) {
    for (ty = layer.height - 1; ty >= 0; ty--) {
      for (tx = layer.width - 1; tx >= 0; tx--) {
        tile = layer.data[ty][tx];

        if (tile && tile.index === index) {
          if (count === skip) {
            return tile;
          } else {
            count += 1;
          }
        }
      }
    }
  } else {
    for (ty = 0; ty < layer.height; ty++) {
      for (tx = 0; tx < layer.width; tx++) {
        tile = layer.data[ty][tx];
        if (tile && tile.index === index) {
          if (count === skip) {
            return tile;
          } else {
            count += 1;
          }
        }
      }
    }
  }

  return null;
}

/**
 * Find the first tile in the given rectangular area (in tile coordinates) of the layer that
 * satisfies the provided testing function. I.e. finds the first tile for which `callback` returns
 * true. Similar to Array.prototype.find in vanilla JS.
 *
 * @param callback The callback. Each tile in the given area will be passed to this callback as the first and only parameter.
 * @param context The context under which the callback should be run.
 * @param tileX The left most tile index (in tile coordinates) to use as the origin of the area to filter.
 * @param tileY The top most tile index (in tile coordinates) to use as the origin of the area to filter.
 * @param width How many tiles wide from the `tileX` index the area will be.
 * @param height How many tiles tall from the `tileY` index the area will be.
 * @param options Optional filters to apply when getting the tiles.
 * @param layer The Glyphmap Layer to act upon.
 *
 * @return A GlyphTile that matches the search, or null if no GlyphTile found
 */
export function findTile(
  callback: (value: GlyphTile, index: number, array: GlyphTile[]) => boolean,
  context: unknown,
  tileX: number,
  tileY: number,
  width: number,
  height: number,
  options: FilteringOptions,
  layer: GlyphTilemapLayerData
): GlyphTile {
  const tiles = getTilesWithin(tileX, tileY, width, height, options, layer);
  return tiles.find(callback, context) || null;
}

/**
 * For each tile in the given rectangular area (in tile coordinates) of the layer, run the given
 * callback. Similar to Array.prototype.forEach in vanilla JS.
 *
 * @param callback The callback. Each tile in the given area will be passed to this callback as the first and only parameter.
 * @param context The context under which the callback should be run.
 * @param tileX The left most tile index (in tile coordinates) to use as the origin of the area to filter.
 * @param tileY The top most tile index (in tile coordinates) to use as the origin of the area to filter.
 * @param width How many tiles wide from the `tileX` index the area will be.
 * @param height How many tiles tall from the `tileY` index the area will be.
 * @param options Optional filters to apply when getting the tiles.
 * @param layer The GlyphTilemap Layer to act upon.
 */
export function forEachTile(
  callback: (value: GlyphTile, index: number, array: GlyphTile[]) => void,
  context: unknown,
  tileX: number,
  tileY: number,
  width: number,
  height: number,
  options: FilteringOptions,
  layer: GlyphTilemapLayerData
): void {
  const tiles = getTilesWithin(tileX, tileY, width, height, options, layer);
  tiles.forEach(callback, context);
}

/**
 * Scans the given rectangular area (given in tile coordinates) for tiles with an index matching
 * `findIndex` and updates their index to match `newIndex`.
 *
 * @param findIndex The index of the tile to search for.
 * @param newIndex The index of the tile to replace it with.
 * @param tileX The left most tile index (in tile coordinates) to use as the origin of the area.
 * @param tileY The top most tile index (in tile coordinates) to use as the origin of the area.
 * @param width How many tiles wide from the `tileX` index the area will be.
 * @param height How many tiles tall from the `tileY` index the area will be.
 * @param layer The GlyphTilemap Layer to act upon.
 */
export function replaceByIndex(
  findIndex: number,
  newIndex: number,
  tileX: number,
  tileY: number,
  width: number,
  height: number,
  layer: GlyphTilemapLayerData
): void {
  const tiles = getTilesWithin(tileX, tileY, width, height, undefined, layer);

  for (let i = 0; i < tiles.length; i++) {
    if (tiles[i] && tiles[i].index === findIndex) {
      tiles[i].index = newIndex;
    }
  }
}

/**
 * Scans the given rectangular area (given in tile coordinates) for tiles with an index matching
 * `indexA` and swaps then with `indexB`. This only modifies the index.
 *
 * @param tileA First tile index.
 * @param tileB Second tile index.
 * @param tileX The left most tile index (in tile coordinates) to use as the origin of the area.
 * @param tileY The top most tile index (in tile coordinates) to use as the origin of the area.
 * @param width How many tiles wide from the `tileX` index the area will be.
 * @param height How many tiles tall from the `tileY` index the area will be.
 * @param layer The GlyphTilemap Layer to act upon.
 */
export function swapByIndex(
  indexA: number,
  indexB: number,
  tileX: number,
  tileY: number,
  width: number,
  height: number,
  layer: GlyphTilemapLayerData
): void {
  const tiles = getTilesWithin(tileX, tileY, width, height, null, layer);

  for (let i = 0; i < tiles.length; i++) {
    if (tiles[i]) {
      if (tiles[i].index === indexA) {
        tiles[i].index = indexB;
      } else if (tiles[i].index === indexB) {
        tiles[i].index = indexA;
      }
    }
  }
}

/**
 * Checks if the given tile coordinates are within the bounds of the layer.
 *
 * @param tileX The x coordinate, in tiles, not pixels.
 * @param tileY The y coordinate, in tiles, not pixels.
 * @param layer The GlyphTilemap Layer to act upon.
 */
export function isInLayerBounds(tileX: number, tileY: number, layer: GlyphTilemapLayerData): boolean {
  return tileX >= 0 && tileX < layer.width && tileY >= 0 && tileY < layer.height;
}

/**
 * Checks if there is a tile at the given location (in tile coordinates) in the given layer. Returns
 * false if there is no tile or if the tile at that location has an index of -1.
 *
 * @param tileX X position to get the tile from (given in tile units, not pixels).
 * @param tileY Y position to get the tile from (given in tile units, not pixels).
 * @param layer The GlyphTilemap Layer to act upon.
 */
export function hasTileAt(tileX: number, tileY: number, layer: GlyphTilemapLayerData): boolean {
  if (isInLayerBounds(tileX, tileY, layer)) {
    const tile = layer.data[tileY][tileX];

    return tile !== null && tile.index > -1;
  }

  return false;
}

/**
 * Gets a tile at the given tile coordinates from the given layer.
 *
 * @param tileX X position to get the tile from (given in tile units, not pixels).
 * @param tileY Y position to get the tile from (given in tile units, not pixels).
 * @param nonNull If true getTile won't return null for empty tiles, but a GlyphTile object with an index of -1.
 * @param layer The GlyphTilemap Layer to act upon.
 * @return The tile at the given coordinates or null if no tile was found or the coordinates were invalid.
 */
export function getTileAt(tileX: number, tileY: number, nonNull: boolean, layer: GlyphTilemapLayerData) {
  if (nonNull === undefined) {
    nonNull = false;
  }

  if (isInLayerBounds(tileX, tileY, layer)) {
    const tile = layer.data[tileY][tileX] || null;

    if (!tile) {
      return null;
    } else if (tile.index === -1) {
      return nonNull ? tile : null;
    }

    return tile;
  }

  return null;
}

/**
 * Puts a tile at the given tile coordinates in the specified layer. You can pass in either an index
 * or a GlyphTile object. If you pass in a GlyphTile, all attributes will be copied over to the specified
 * location. If you pass in an index, only the index at the specified location will be changed.
 *
 * @param tile The index of this tile to set or a GlyphTile object.
 * @param tileX The x coordinate, in tiles, not pixels.
 * @param tileY The y coordinate, in tiles, not pixels.
 * @param layer The GlyphTilemap Layer to act upon.
 * @return The GlyphTile object that was created or added to this map.
 */
export function putTileAt(
  tile: number | GlyphTile,
  tileX: number,
  tileY: number,
  layer: GlyphTilemapLayerData
): GlyphTile {
  if (!isInLayerBounds(tileX, tileY, layer)) {
    return null;
  }

  if (tile instanceof GlyphTile) {
    if (layer.data[tileY][tileX] === null) {
      layer.data[tileY][tileX] = new GlyphTile(layer, tile.index, tileX, tileY);
    }

    layer.data[tileY][tileX].copy(tile);
  } else {
    const index = tile;

    if (layer.data[tileY][tileX] === null) {
      layer.data[tileY][tileX] = new GlyphTile(layer, index, tileX, tileY);
    } else {
      layer.data[tileY][tileX].index = index;
    }
  }

  return layer.data[tileY][tileX];
}

/**
 * Puts an array of tiles or a 2D array of tiles at the given tile coordinates in the specified
 * layer. The array can be composed of either tile indexes or GlyphTile objects. If you pass in a GlyphTile,
 * all attributes will be copied over to the specified location. If you pass in an index, only the
 * index at the specified location will be changed.
 *
 * @param tiles A row (array) or grid (2D array) of GlyphTiles or tile indexes to place.
 * @param tileX The x coordinate, in tiles, not pixels.
 * @param tileY The y coordinate, in tiles, not pixels.
 * @param layer The GlyphTilemap Layer to act upon.
 */
export function putTilesAt(
  tiles: number[] | number[][] | GlyphTile[] | GlyphTile[][],
  tileX: number,
  tileY: number,
  layer: GlyphTilemapLayerData
): void {
  if (!Array.isArray(tiles)) {
    return null;
  }

  // Force the input array to be a 2D array
  if (!Array.isArray(tiles[0])) {
    tiles = [tiles as number[] & GlyphTile[]];
  }

  const height = tiles.length;
  const width = (tiles[0] as number[] & GlyphTile[]).length;

  for (let ty = 0; ty < height; ty++) {
    for (let tx = 0; tx < width; tx++) {
      const tile = tiles[ty][tx];
      putTileAt(tile, tileX + tx, tileY + ty, layer);
    }
  }
}

/**
 * Removes the tile at the given tile coordinates in the specified layer and updates the layer's
 * collision information.
 *
 * @param tileX The x coordinate.
 * @param tileY The y coordinate.
 * @param replaceWithNull If true, this will replace the tile at the specified location with
 * null instead of a GlyphTile with an index of -1.
 * @param layer The GlyphTilemap Layer to act upon.
 * @return The GlyphTile object that was removed.
 */
export function removeTileAt(
  tileX: number,
  tileY: number,
  replaceWithNull = true,
  layer: GlyphTilemapLayerData
): GlyphTile {
  if (!isInLayerBounds(tileX, tileY, layer)) {
    return null;
  }

  const tile = layer.data[tileY][tileX];

  if (!tile) {
    return null;
  }

  layer.data[tileY][tileX] = replaceWithNull ? null : new GlyphTile(layer, -1, tileX, tileY);

  return tile;
}

/**
 * Removes the tile at the given world coordinates in the specified layer and updates the layer's
 * collision information.
 *
 * @param worldX The x coordinate, in pixels.
 * @param worldY The y coordinate, in pixels.
 * @param replaceWithNull If true, this will replace the tile at the specified location
 * with null instead of a GlyphTile with an index of -1.
 * @param camera The Camera to use when calculating the tile index from the world values.
 * @param layer The GlyphTilemap Layer to act upon.
 * @return The GlyphTile object that was removed.
 */
export function removeTileAtWorldXY(
  worldX: number,
  worldY: number,
  replaceWithNull: boolean,
  camera: Phaser.Cameras.Scene2D.Camera,
  layer: GlyphTilemapLayerData
): GlyphTile {
  layer.glyphmapLayer.worldToTileXY(worldX, worldY, true, point, camera);
  return removeTileAt(point.x, point.y, replaceWithNull, layer);
}

/**
 * Checks if there is a tile at the given location (in world coordinates) in the given layer. Returns
 * false if there is no tile or if the tile at that location has an index of -1.
 *
 * @param worldX The X coordinate of the world position.
 * @param worldY The Y coordinate of the world position.
 * @param camera The Camera to use when factoring in which tiles to return.
 * @param layer The GlyphTilemap Layer to act upon.
 */
export function hasTileAtWorldXY(
  worldX: number,
  worldY: number,
  camera: Phaser.Cameras.Scene2D.Camera,
  layer: GlyphTilemapLayerData
): boolean {
  layer.glyphmapLayer.worldToTileXY(worldX, worldY, true, point, camera);

  const tileX = point.x;
  const tileY = point.y;

  return hasTileAt(tileX, tileY, layer);
}

/**
 * Gets a tile at the given world coordinates from the given layer.
 *
 * @param worldX X position to get the tile from (given in pixels)
 * @param worldY Y position to get the tile from (given in pixels)
 * @param nonNull If true, function won't return null for empty tiles, but a Tile object with an index of -1.
 * @param camera The Camera to use when calculating the tile index from the world values.
 * @param layer The GlyphTilemap Layer to act upon.
 * @return The tile at the given coordinates or null if no tile was found or the coordinates were invalid.
 */
export function getTileAtWorldXY(
  worldX: number,
  worldY: number,
  nonNull: boolean,
  camera: Phaser.Cameras.Scene2D.Camera,
  layer: GlyphTilemapLayerData
): GlyphTile {
  layer.glyphmapLayer.worldToTileXY(worldX, worldY, true, point, camera);
  return getTileAt(point.x, point.y, nonNull, layer);
}

/**
 * Puts a tile at the given world coordinates (pixels) in the specified layer. You can pass in either
 * an index or a GlyphTile object. If you pass in a GlyphTile, all attributes will be copied over to the
 * specified location. If you pass in an index, only the index at the specified location will be
 * changed.
 *
 * @param tile The index of this tile to set or a GlyphTile object.
 * @param worldX The x coordinate, in pixels.
 * @param worldY The y coordinate, in pixels.
 * @param camera The Camera to use when calculating the tile index from the world values.
 * @param layer The GlyphTilemap Layer to act upon.
 * @return The GlyphTile object that was created or added to this map.
 */
export function putTileAtWorldXY(
  tile: number | GlyphTile,
  worldX: number,
  worldY: number,
  camera: Phaser.Cameras.Scene2D.Camera,
  layer: GlyphTilemapLayerData
): GlyphTile {
  layer.glyphmapLayer.worldToTileXY(worldX, worldY, true, point, camera);
  return putTileAt(tile, point.x, point.y, layer);
}

/**
 * Gets the tiles in the given rectangular area (in world coordinates) of the layer.
 *
 * @param worldX The world x coordinate for the top-left of the area.
 * @param worldY The world y coordinate for the top-left of the area.
 * @param width The width of the area.
 * @param height The height of the area.
 * @param options Optional filters to apply when getting the tiles.
 * @param camera The Camera to use when factoring in which tiles to return.
 * @param layer The GlyphTilemap Layer to act upon.
 * @return Array of GlyphTile objects.
 */
export function getTilesWithinWorldXY(
  worldX: number,
  worldY: number,
  width: number,
  height: number,
  options: FilteringOptions,
  camera: Phaser.Cameras.Scene2D.Camera,
  layer: GlyphTilemapLayerData
): GlyphTile[] {
  //  Top left corner of the rect, rounded down to include partial tiles
  worldToTileXY(worldX, worldY, true, pointStart, camera, layer);

  const xStart = pointStart.x;
  const yStart = pointStart.y;

  //  Bottom right corner of the rect, rounded up to include partial tiles
  worldToTileXY(worldX + width, worldY + height, false, pointEnd, camera, layer);

  const xEnd = Math.ceil(pointEnd.x);
  const yEnd = Math.ceil(pointEnd.y);

  return getTilesWithin(xStart, yStart, xEnd - xStart, yEnd - yStart, options, layer);
}

/**
 * Converts from world X coordinates (pixels) to tile X coordinates (tile units), factoring in the
 * layer's position, scale and scroll.
 *
 * @param worldX The x coordinate to be converted, in pixels, not tiles.
 * @param snapToFloor Whether or not to round the tile coordinate down to the nearest integer.
 * @param camera The Camera to use when calculating the tile index from the world values.
 * @param layer The GlyphTilemap Layer to act upon.
 */
export function worldToTileX(
  worldX: number,
  snapToFloor: boolean,
  camera: Phaser.Cameras.Scene2D.Camera,
  layer: GlyphTilemapLayerData
): number {
  if (snapToFloor === undefined) {
    snapToFloor = true;
  }

  let tileWidth = layer.tileWidth;
  const glyphmapLayer = layer.glyphmapLayer;

  if (glyphmapLayer) {
    if (!camera) {
      camera = glyphmapLayer.scene.cameras.main;
    }

    // Find the world position relative to the layer's top left origin,
    // factoring in the camera's horizontal scroll
    worldX = worldX - (glyphmapLayer.x + camera.scrollX * (1 - glyphmapLayer.scrollFactorX));

    tileWidth *= glyphmapLayer.scaleX;
  }

  return snapToFloor ? Math.floor(worldX / tileWidth) : worldX / tileWidth;
}

/**
 * Converts from world Y coordinates (pixels) to tile Y coordinates (tile units), factoring in the
 * layer's position, scale and scroll.
 *
 * @param worldY The y coordinate to be converted, in pixels, not tiles.
 * @param snapToFloor Whether or not to round the tile coordinate down to the nearest integer.
 * @param camera The Camera to use when calculating the tile index from the world values.
 * @param layer The GlyphTilemap Layer to act upon.
 */
export function worldToTileY(
  worldY: number,
  snapToFloor: boolean,
  camera: Phaser.Cameras.Scene2D.Camera,
  layer: GlyphTilemapLayerData
): number {
  if (snapToFloor === undefined) {
    snapToFloor = true;
  }

  let tileHeight = layer.tileHeight;
  const glyphmapLayer = layer.glyphmapLayer;

  if (glyphmapLayer) {
    if (!camera) {
      camera = glyphmapLayer.scene.cameras.main;
    }

    // Find the world position relative to the layer's top left origin,
    // factoring in the camera's vertical scroll
    worldY = worldY - (glyphmapLayer.y + camera.scrollY * (1 - glyphmapLayer.scrollFactorY));

    tileHeight *= glyphmapLayer.scaleY;
  }

  return snapToFloor ? Math.floor(worldY / tileHeight) : worldY / tileHeight;
}

/**
 * Converts from world XY coordinates (pixels) to tile XY coordinates (tile units), factoring in the
 * layer's position, scale and scroll. This will return a new Vector2 object or update the given
 * `point` object.
 *
 * @param worldX The x coordinate to be converted, in pixels, not tiles.
 * @param worldY The y coordinate to be converted, in pixels, not tiles.
 * @param snapToFloor Whether or not to round the tile coordinate down to the nearest integer.
 * @param point A Vector2 to store the coordinates in. If not given a new Vector2 is created.
 * @param camera The Camera to use when calculating the tile index from the world values.
 * @param layer The GlyphTilemap Layer to act upon.
 */
export function worldToTileXY(
  worldX: number,
  worldY: number,
  snapToFloor: boolean,
  point: Phaser.Math.Vector2,
  camera: Phaser.Cameras.Scene2D.Camera,
  layer: GlyphTilemapLayerData
): Phaser.Math.Vector2 {
  if (snapToFloor === undefined) {
    snapToFloor = true;
  }

  if (!point) {
    point = new Phaser.Math.Vector2(0, 0);
  }

  point.x = worldToTileX(worldX, snapToFloor, camera, layer);
  point.y = worldToTileY(worldY, snapToFloor, camera, layer);

  return point;
}

/**
 * Converts from tile X coordinates (tile units) to world X coordinates (pixels), factoring in the
 * layer's position, scale and scroll.
 *
 * @param tileX The x coordinate, in tiles, not pixels.
 * @param camera The Camera to use when calculating the tile index from the world values.
 * @param layer The GlyphTilemap Layer to act upon.
 */
export function tileToWorldX(
  tileX: number,
  camera: Phaser.Cameras.Scene2D.Camera,
  layer: GlyphTilemapLayerData
): number {
  const glyphmapLayer = layer.glyphmapLayer;

  let tileWidth = layer.tileWidth;
  let layerWorldX = 0;

  if (glyphmapLayer) {
    if (!camera) {
      camera = glyphmapLayer.scene.cameras.main;
    }

    layerWorldX = glyphmapLayer.x + camera.scrollX * (1 - glyphmapLayer.scrollFactorX);

    tileWidth *= glyphmapLayer.scaleX;
  }

  return layerWorldX + tileX * tileWidth;
}

/**
 * Converts from tile Y coordinates (tile units) to world Y coordinates (pixels), factoring in the
 * layer's position, scale and scroll.
 *
 * @param tileY The y coordinate, in tiles, not pixels.
 * @param camera The Camera to use when calculating the tile index from the world values.
 * @param layer The GlyphTilemap Layer to act upon.
 */
export function tileToWorldY(
  tileY: number,
  camera: Phaser.Cameras.Scene2D.Camera,
  layer: GlyphTilemapLayerData
): number {
  const glyphmapLayer = layer.glyphmapLayer;

  let tileHeight = layer.tileHeight;
  var layerWorldY = 0;

  if (glyphmapLayer) {
    if (!camera) {
      camera = glyphmapLayer.scene.cameras.main;
    }

    layerWorldY = glyphmapLayer.y + camera.scrollY * (1 - glyphmapLayer.scrollFactorY);

    tileHeight *= glyphmapLayer.scaleY;
  }

  return layerWorldY + tileY * tileHeight;
}

/**
 * Converts from tile XY coordinates (tile units) to world XY coordinates (pixels), factoring in the
 * layer's position, scale and scroll. This will return a new Vector2 object or update the given
 * `point` object.
 *
 * @param tileX The x coordinate, in tiles, not pixels.
 * @param tileY The y coordinate, in tiles, not pixels.
 * @param point A Vector2 to store the coordinates in. If not given a new Vector2 is created.
 * @param camera The Camera to use when calculating the tile index from the world values.
 * @param layer The GlyphTilemap Layer to act upon.
 */
export function tileToWorldXY(
  tileX: number,
  tileY: number,
  point: Phaser.Math.Vector2,
  camera: Phaser.Cameras.Scene2D.Camera,
  layer: GlyphTilemapLayerData
): Phaser.Math.Vector2 {
  if (!point) {
    point = new Phaser.Math.Vector2(0, 0);
  }

  point.x = tileToWorldX(tileX, camera, layer);
  point.y = tileToWorldY(tileY, camera, layer);

  return point;
}

/**
 * Randomizes the indexes of a rectangular region of tiles (in tile coordinates) within the
 * specified layer. Each tile will receive a new index. If an array of indexes is passed in, then
 * those will be used for randomly assigning new tile indexes. If an array is not provided, the
 * indexes found within the region (excluding -1) will be used for randomly assigning new tile
 * indexes. This method only modifies tile indexes and does not change collision information.
 *
 * @param tileX The left most tile index (in tile coordinates) to use as the origin of the area.
 * @param tileY The top most tile index (in tile coordinates) to use as the origin of the area.
 * @param width How many tiles wide from the `tileX` index the area will be.
 * @param height How many tiles tall from the `tileY` index the area will be.
 * @param indexes An array of indexes to randomly draw from during randomization.
 * @param layer The GlyphTilemap Layer to act upon.
 */
export function randomize(
  tileX: number,
  tileY: number,
  width: number,
  height: number,
  indexes: number[],
  layer: GlyphTilemapLayerData
): void {
  let i;
  const tiles = getTilesWithin(tileX, tileY, width, height, {}, layer);

  // If no indices are given, then find all the unique indexes within the specified region
  if (!indexes) {
    indexes = [];

    for (i = 0; i < tiles.length; i++) {
      if (indexes.indexOf(tiles[i].index) === -1) {
        indexes.push(tiles[i].index);
      }
    }
  }

  for (i = 0; i < tiles.length; i++) {
    tiles[i].index = Phaser.Utils.Array.GetRandom(indexes);
  }
}

/**
 * Randomizes the indexes of a rectangular region of tiles (in tile coordinates) within the
 * specified layer. Each tile will receive a new index. New indexes are drawn from the given
 * weightedIndexes array. An example weighted array:
 *
 * [
 *  { index: 6, weight: 4 },    // Probability of index 6 is 4 / 8
 *  { index: 7, weight: 2 },    // Probability of index 7 would be 2 / 8
 *  { index: 8, weight: 1.5 },  // Probability of index 8 would be 1.5 / 8
 *  { index: 26, weight: 0.5 }  // Probability of index 27 would be 0.5 / 8
 * ]
 *
 * The probability of any index being choose is (the index's weight) / (sum of all weights). This
 * method only modifies tile indexes.
 *
 * @param tileX The left most tile index (in tile coordinates) to use as the origin of the area.
 * @param tileY The top most tile index (in tile coordinates) to use as the origin of the area.
 * @param width How many tiles wide from the `tileX` index the area will be.
 * @param height How many tiles tall from the `tileY` index the area will be.
 * @param weightedIndexes An array of objects to randomly draw from during
 * randomization. They should be in the form: { index: 0, weight: 4 } or
 * { index: [0, 1], weight: 4 } if you wish to draw from multiple tile indexes.
 * @param layer The GlyphTilemap Layer to act upon.
 */
export function weightedRandomize(
  tileX: number,
  tileY: number,
  width: number,
  height: number,
  weightedIndexes: { index: number | number[]; weight: number }[],
  layer: GlyphTilemapLayerData
): void {
  if (!weightedIndexes) {
    return;
  }

  let i: number;
  const tiles = getTilesWithin(tileX, tileY, width, height, null, layer);

  let weightTotal = 0;

  for (i = 0; i < weightedIndexes.length; i++) {
    weightTotal += weightedIndexes[i].weight;
  }

  if (weightTotal <= 0) {
    return;
  }

  for (i = 0; i < tiles.length; i++) {
    const rand = Math.random() * weightTotal;
    let sum = 0;
    let randomIndex = -1;

    for (let j = 0; j < weightedIndexes.length; j++) {
      sum += weightedIndexes[j].weight;

      if (rand <= sum) {
        const chosen = weightedIndexes[j].index;

        randomIndex = Array.isArray(chosen) ? chosen[Math.floor(Math.random() * chosen.length)] : chosen;
        break;
      }
    }

    tiles[i].index = randomIndex;
  }
}

/**
 * Shuffles the tiles in a rectangular region (specified in tile coordinates) within the given
 * layer. It will only randomize the tiles in that area, so if they're all the same nothing will
 * appear to have changed! This method only modifies tile indexes.
 *
 * @param tileX The left most tile index (in tile coordinates) to use as the origin of the area.
 * @param tileY The top most tile index (in tile coordinates) to use as the origin of the area.
 * @param width How many tiles wide from the `tileX` index the area will be.
 * @param height How many tiles tall from the `tileY` index the area will be.
 * @param layer The GlyphTilemap Layer to act upon.
 */
export function shuffle(
  tileX: number,
  tileY: number,
  width: number,
  height: number,
  layer: GlyphTilemapLayerData
): void {
  const tiles = getTilesWithin(tileX, tileY, width, height, null, layer);

  const indexes = tiles.map(function (tile) {
    return tile.index;
  });

  Phaser.Utils.Array.Shuffle(indexes);

  for (let i = 0; i < tiles.length; i++) {
    tiles[i].index = indexes[i];
  }
}

/**
 * Returns the tiles in the given layer that are within the cameras viewport. This is used internally.
 *
 * @param layer - The GlyphTilemap Layer to act upon.
 * @param camera - The Camera to run the cull check against.
 * @param outputArray - An optional array to store the GlyphTile objects within.
 */
export function cullTiles(
  layer: GlyphTilemapLayerData,
  camera: Phaser.Cameras.Scene2D.Camera,
  outputArray: GlyphTile[] = []
): GlyphTile[] {
  outputArray.length = 0;

  const glyphmapLayer = layer.glyphmapLayer;

  //  Camera world view bounds, snapped for scaled tile size
  //  Cull Padding values are given in tiles, not pixels
  const bounds = cullBounds(layer, camera);

  if (glyphmapLayer.skipCull || glyphmapLayer.scrollFactorX !== 1 || glyphmapLayer.scrollFactorY !== 1) {
    bounds.left = 0;
    bounds.right = layer.width;
    bounds.top = 0;
    bounds.bottom = layer.height;
  }

  runCull(layer, bounds, outputArray);

  return outputArray;
}

/**
 * Returns the bounds in the given orthogonal layer that are within the cameras viewport.
 * This is used internally by the cull tiles function.
 *
 * @param layer The GlyphTilemap Layer to act upon.
 * @param camera The Camera to run the cull check against.
 * @return A rectangle containing the culled bounds. If you wish to retain this object, clone it, as it's recycled internally.
 */
export function cullBounds(layer: GlyphTilemapLayerData, camera: Phaser.Cameras.Scene2D.Camera): Phaser.Geom.Rectangle {
  const glyphmapLayer = layer.glyphmapLayer;

  const tileW = Math.floor(layer.tileWidth * glyphmapLayer.scaleX);
  const tileH = Math.floor(layer.tileHeight * glyphmapLayer.scaleY);

  const boundsLeft =
    Phaser.Math.Snap.Floor(camera.worldView.x - glyphmapLayer.x, tileW, 0, true) - glyphmapLayer.cullPaddingX;
  const boundsRight =
    Phaser.Math.Snap.Ceil(camera.worldView.right - glyphmapLayer.x, tileW, 0, true) + glyphmapLayer.cullPaddingX;

  const boundsTop =
    Phaser.Math.Snap.Floor(camera.worldView.y - glyphmapLayer.y, tileH, 0, true) - glyphmapLayer.cullPaddingY;
  const boundsBottom =
    Phaser.Math.Snap.Ceil(camera.worldView.bottom - glyphmapLayer.y, tileH, 0, true) + glyphmapLayer.cullPaddingY;

  return bounds.setTo(boundsLeft, boundsTop, boundsRight - boundsLeft, boundsBottom - boundsTop);
}

/**
 * Returns the tiles in the given layer that are within the cameras viewport. This is used internally.
 *
 * @param layer The GlyphTilemap Layer to act upon.
 * @param bounds An object containing the `left`, `right`, `top` and `bottom` bounds.
 * @param outputArray The array to store the GlyphTile objects within.
 */
export function runCull(
  layer: GlyphTilemapLayerData,
  bounds: { left: number; right: number; top: number; bottom: number },
  outputArray: GlyphTile[]
): GlyphTile[] {
  const mapData = layer.data;
  const mapWidth = layer.width;
  const mapHeight = layer.height;

  const glyphmapLayer = layer.glyphmapLayer;

  const drawLeft = Math.max(0, bounds.left);
  const drawRight = Math.min(mapWidth, bounds.right);
  const drawTop = Math.max(0, bounds.top);
  const drawBottom = Math.min(mapHeight, bounds.bottom);

  let x: number;
  let y: number;
  let tile: GlyphTile;

  for (y = drawTop; y < drawBottom; y++) {
    for (x = drawLeft; mapData[y] && x < drawRight; x++) {
      tile = mapData[y][x];

      if (!tile || tile.index === -1 || !tile.visible) {
        continue;
      }

      outputArray.push(tile);
    }
  }

  glyphmapLayer.tilesDrawn = outputArray.length;
  glyphmapLayer.tilesTotal = mapWidth * mapHeight;

  return outputArray;
}
