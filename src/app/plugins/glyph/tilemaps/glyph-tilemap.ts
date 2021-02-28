import { Glyph, GlyphVector } from '../glyph';
import { GlyphPlugin } from '../plugins';
import { Font, FontLike } from '../utils';

import { GlyphTile } from './glyph-tile';
import * as Components from './glyph-tilemap-components';
import { GlyphTilemapLayer, GlyphTilemapLayerData } from './glyph-tilemap-layer';
import * as Parsers from './glyph-tilemap-parsers';
import { GlyphTileset } from './glyph-tileset';

/**
 * Glyph tilemap data configuration.
 */
export interface GlyphTilemapDataConfig {
  /**
   * The key in the Phaser cache that corresponds to the loaded glyphmap data.
   */
  name?: string;

  /**
   * The width of the entire glyphmap.
   */
  width?: number;

  /**
   * The height of the entire glyphmap.
   */
  height?: number;

  /**
   * Font for the glyphmap.
   */
  font?: FontLike;

  /**
   * The layers of the glyphmap.
   */
  layers?: GlyphTilemapLayerData[];

  /**
   * The glyphsets the map uses.
   */
  glyphsets?: GlyphTileset[];
}

/**
 * A class for representing data about a map. Maps are parsed into this
 * format. A GlyphTilemap object gets a copy of this data and then unpacks
 * the needed properties into itself.
 */
export class GlyphTilemapData {
  /**
   * The key in the Phaser cache that corresponds to the loaded glyphmap data.
   */
  public readonly name: string;

  /**
   * The width of the tiles.
   */
  public readonly tileWidth: number;

  /**
   * The height of the tiles.
   */
  public readonly tileHeight: number;

  /**
   * Font for the glyphmap.
   */
  public readonly font: Font;

  /**
   * The layers of the glyphmap.
   */
  public readonly layers: GlyphTilemapLayerData[];

  /**
   * The glyphsets the map uses.
   */
  public readonly glyphsets: GlyphTileset[];

  /**
   * The width of the entire glyphmap.
   */
  public width: number;

  /**
   * The height of the entire glyphmap.
   */
  public height: number;

  /**
   * The width in pixels of the entire glyphmap.
   */
  public widthInPixels: number;

  /**
   * The height in pixels of the entire glyphmap.
   */
  public heightInPixels: number;

  /**
   * Instantiate glyphmap data.
   *
   * @param config Glyphmap data configuration.
   */
  public constructor({ name, width, height, font, layers, glyphsets }: GlyphTilemapDataConfig) {
    this.name = typeof name === 'string' ? name : 'map';
    this.width = width || 0;
    this.height = height || 0;
    this.font = Font.normalize(font || ({} as Font));
    this.layers = layers || [];
    this.glyphsets = glyphsets || [];

    const { width: tileWidth, height: tileHeight } = Glyph.frameDimensions(
      new Glyph(undefined, undefined, undefined, this.font)
    );

    this.tileWidth = tileWidth;
    this.tileHeight = tileHeight;
    this.widthInPixels = tileWidth * this.width;
    this.heightInPixels = tileHeight * this.height;
  }
}

/**
 * Glyphmap configuration. Used with corresponding GameObjectCreator method.
 */
export interface GlyphTilemapConfig {
  /**
   * The key in the Phaser cache that corresponds to the loaded glyphmap data.
   */
  key?: string;

  /**
   * Instead of loading from the cache, you can also load directly from a 2D array of tile indexes.
   */
  data?: number[][];

  /**
   * Width of glyphmap, in tiles.
   */
  width?: number;

  /**
   * Height of glyphmap, in tiles.
   */
  height?: number;

  /**
   * Font for the glyphmap.
   */
  font?: Font;

  /**
   * The glyphsets the map uses.
   */
  glyphsets?: Parsers.RawGlyphTilesetData[];

  /**
   * Controls how empty tiles, tiles with an index of -1,
   * in the map data are handled. If `true`, empty locations will get a value of `null`. If `false`,
   * empty location will get a GlyphTile object with an index of -1. If you've a large sparsely populated
   * map and the tile data doesn't need to change then setting this value to `true` will help with
   * memory consumption. However if your map is small or you need to update the tiles dynamically,
   * then leave the default value set.
   */
  insertNull?: boolean;
}

export type GlyphTilemapFactory = { [GlyphTilemap.key]: typeof GlyphTilemap['factory'] };

export type GlyphTilemapCreator = { [GlyphTilemap.key]: typeof GlyphTilemap['creator'] };

export type GameObjectFactoryWithGlyphTilemap = Phaser.GameObjects.GameObjectFactory & GlyphTilemapFactory;

export type GameObjectCreatorWithGlyphTilemap = Phaser.GameObjects.GameObjectCreator & GlyphTilemapCreator;

/**
 * Adaptation of Phaser.Tilemaps.Tilemap but for 'glyphs'.
 */
export class GlyphTilemap {
  public static readonly key = 'glyphmap';

  protected static readonly factory = function glyphTilemapFactory(
    key?: string,
    width?: number,
    height?: number,
    font?: FontLike,
    data?: number[][],
    glyphsets?: Parsers.RawGlyphTilesetData[],
    insertNull?: boolean
  ): GlyphTilemap {
    const layers = data ? [{ name: 'layer', data }] : undefined;
    return Parsers.parse(this.scene, key, width, height, font, layers, glyphsets, insertNull);
  };

  protected static readonly creator = function glyphTilemapCreator({
    key,
    width,
    height,
    font,
    data,
    glyphsets,
    insertNull
  }: GlyphTilemapConfig): GlyphTilemap {
    const layers = data ? [{ name: 'layer', data }] : undefined;
    return Parsers.parse(this.scene, key, width, height, font, layers, glyphsets, insertNull);
  };

  public static get gameObjectDefinition(): [string, typeof GlyphTilemap.factory, typeof GlyphTilemap.creator] {
    return [GlyphTilemap.key, GlyphTilemap.factory, GlyphTilemap.creator];
  }

  /**
   * The base width of a tile in pixels. Note that individual layers may have a different tile
   * width.
   */
  public readonly tileWidth: number;

  /**
   * The base height of a tile in pixels. Note that individual layers may have a different
   * tile height.
   */
  public readonly tileHeight: number;

  /**
   * The width of the map (in tiles).
   */
  public readonly width: number;

  /**
   * The height of the map (in tiles).
   */
  public readonly height: number;

  /**
   * The width of the map in pixels based on width * tileWidth.
   */
  public readonly widthInPixels: number;

  /**
   * The height of the map in pixels based on height * tileHeight.
   */
  public readonly heightInPixels: number;

  /**
   * An array of GlyphTilemap layer data.
   */
  public readonly layers: GlyphTilemapLayerData[];

  /**
   * Reference to glyph plugin injected into containing scene.
   */
  public readonly glyphPlugin: GlyphPlugin;

  /**
   * Glyphmap font object.
   */
  protected readonly font: Font;

  /**
   * An array of GlyphTilesets used in the map.
   */
  protected readonly glyphsets: GlyphTileset[];

  /**
   * The index of the currently selected GlyphTilemapLayerData object.
   */
  public currentLayerIndex = 0;

  /**
   * Instantiate glyphmap.
   *
   * @param scene The Scene to which this GlyphTilemap belongs.
   * @param mapData A GlyphTilemapData instance containing GlyphTilemap data.
   */
  public constructor(public scene: Phaser.Scene, mapData: GlyphTilemapData) {
    this.glyphPlugin = this.scene.sys.plugins.get(GlyphPlugin.key) as GlyphPlugin;

    this.font = mapData.font;
    this.layers = mapData.layers;
    this.glyphsets = mapData.glyphsets;

    this.tileWidth = mapData.tileWidth;
    this.tileHeight = mapData.tileHeight;

    this.width = mapData.width;
    this.height = mapData.height;

    this.widthInPixels = mapData.tileWidth * mapData.width;
    this.heightInPixels = mapData.tileHeight * mapData.height;
  }

  /**
   * The GlyphTilemapLayerData object that is currently selected in the map. You can set this property using
   * any type supported by setLayer.
   */
  public get layer(): any {
    return this.layers[this.currentLayerIndex];
  }

  /**
   * The GlyphTilemapLayerData object that is currently selected in the map. You can set this property using
   * any type supported by setLayer.
   */
  public set layer(layer: any) {
    this.setLayer(layer);
  }

  /**
   * Add or create data to the map to be used as a glyphset. A single map may use multiple glyphsets.
   *
   * @param name The name of the glyphset as specified in the map data, or a glyphset instance.
   * @param glyphs
   * @param font
   * @param gid If adding multiple glyphsets to a blank map, specify the starting GID this set will use here.
   * @return Returns the Glyphset object that was created, or null if it failed.
   */
  public addGlyphset(name: string | GlyphTileset, glyphs?: GlyphVector[], font?: FontLike, gid = 0): GlyphTileset {
    if (name === undefined) {
      return null;
    } else if (name instanceof GlyphTileset) {
      this.glyphsets.push(name);
      return name;
    }

    const glyphset = Parsers.parseGlyphsetData(name, glyphs, font, gid);

    this.glyphsets.push(glyphset);

    return glyphset;
  }

  /**
   * Copies the tiles in the source rectangular area to a new destination (all specified in tile
   * coordinates) within the layer. This copies all tile properties.
   *
   * If no layer specified, the map's current layer is used.
   *
   * @param srcTileX The x coordinate of the area to copy from, in tiles, not pixels.
   * @param srcTileY The y coordinate of the area to copy from, in tiles, not pixels.
   * @param width The width of the area to copy, in tiles, not pixels.
   * @param height The height of the area to copy, in tiles, not pixels.
   * @param destTileX The x coordinate of the area to copy to, in tiles, not pixels.
   * @param destTileY The y coordinate of the area to copy to, in tiles, not pixels.
   * @param layer The glyph layer to use. If not given the current layer is used.
   * @return This, or null if the layer given was invalid.
   */
  public copy(
    srcTileX: number,
    srcTileY: number,
    width: number,
    height: number,
    destTileX: number,
    destTileY: number,
    layer?: string | number | GlyphTilemapLayer
  ): this {
    const layerData = this.getLayer(layer);

    if (layer !== null) {
      Components.copy(srcTileX, srcTileY, width, height, destTileX, destTileY, layerData);
      return this;
    }

    return null;
  }

  /**
   * Creates a new and empty Glyphmap Layer. The currently selected layer in the map is set to this new layer.
   *
   * @param name The name of this layer. Must be unique within the map.
   * @param glyphset The glyphet, or an array of glyphsets, used to render this layer. Can be a string or a Glyphset object.
   * @param x The world x position where the top left of this layer will be placed.
   * @param y The world y position where the top left of this layer will be placed.
   * @param width The width of the layer in tiles. If not specified, it will default to the map's width.
   * @param height The height of the layer in tiles. If not specified, it will default to the map's height.
   * @param font
   *
   * @return Returns the new layer that was created, or `null` if it failed.
   */
  public createBlankLayer(
    name: string,
    glyphset: string | string[] | GlyphTileset | GlyphTileset[],
    x = 0,
    y = 0,
    width?: number,
    height?: number,
    font?: FontLike
  ): GlyphTilemapLayer {
    const index = this.getLayerIndex(name);

    if (index !== null) {
      console.warn('Invalid Tilemap Layer ID: ' + name);
      return null;
    }

    width = width === undefined ? this.width : width;
    height = height === undefined ? this.height : height;

    const normalizedFont = Font.clone(Font.normalize(font || this.font));

    const layerData = new GlyphTilemapLayerData({
      name: name,
      width: width,
      height: height,
      font: normalizedFont
    });

    let row: GlyphTile[];

    for (let tileY = 0; tileY < height; tileY++) {
      row = [];

      for (let tileX = 0; tileX < width; tileX++) {
        row.push(new GlyphTile(layerData, -1, tileX, tileY));
      }

      layerData.data.push(row);
    }

    this.layers.push(layerData);
    this.currentLayerIndex = this.layers.length - 1;

    const layer = new GlyphTilemapLayer(this.scene, this, this.currentLayerIndex, glyphset, x, y);
    this.scene.sys.displayList.add(layer);

    return layer;
  }

  /**
   * Creates a new Tilemap Layer that renders the LayerData associated with the given
   * `layerID`. The currently selected layer in the map is set to this new layer.
   *
   * The `layerID` is important. If you've created your map in Tiled then you can get this by
   * looking in Tiled and looking at the layer name. Or you can open the JSON file it exports and
   * look at the layers[].name value. Either way it must match.
   *
   * Prior to v3.50.0 this method was called `createDynamicLayer`.
   *
   * @method Phaser.Tilemaps.Tilemap#createLayer
   * @since 3.0.0
   *
   * @param {(number|string)} layerID - The layer array index value, or if a string is given, the layer name from Tiled.
   * @param {(string|string[]|Phaser.Tilemaps.Tileset|Phaser.Tilemaps.Tileset[])} tileset - The tileset, or an array of tilesets, used to render this layer. Can be a string or a Tileset object.
   * @param {number} [x=0] - The x position to place the layer in the world. If not specified, it will default to the layer offset from Tiled or 0.
   * @param {number} [y=0] - The y position to place the layer in the world. If not specified, it will default to the layer offset from Tiled or 0.
   *
   * @return {?Phaser.Tilemaps.TilemapLayer} Returns the new layer was created, or null if it failed.
   */
  public createLayer(
    layerID: number | string,
    glyphset: string | string[] | GlyphTileset | GlyphTileset[],
    x?: number,
    y?: number
  ): GlyphTilemapLayer {
    var index = this.getLayerIndex(layerID);

    if (index === null) {
      console.warn('Invalid Glyphmap Layer ID: ' + layerID);

      if (typeof layerID === 'string') {
        console.warn('Valid glyphlayer names:\n\t' + this.getTileLayerNames().join(',\n\t'));
      }

      return null;
    }

    const layerData = this.layers[index];

    // Check for an associated glyphmap layer
    if (layerData.glyphmapLayer) {
      console.warn('Glyphmap Layer ID already exists:' + layerID);
      return null;
    }

    this.currentLayerIndex = index;

    //  Default the x/y position to match layer offset, if it exists.
    x = x === undefined ? layerData.x : x;
    y = y === undefined ? layerData.y : y;

    const layer = new GlyphTilemapLayer(this.scene, this, index, glyphset, x, y);
    this.scene.sys.displayList.add(layer);

    return layer;
  }

  /**
   * Sets the tiles in the given rectangular area (in tile coordinates) of the layer with the
   * specified index.
   *
   * If no layer specified, the map's current layer is used.
   *
   * @param index The tile index to fill the area with.
   * @param tileX The left most tile index (in tile coordinates) to use as the origin of the area.
   * @param tileY The top most tile index (in tile coordinates) to use as the origin of the area.
   * @param width How many tiles wide from the `tileX` index the area will be.
   * @param height How many tiles tall from the `tileY` index the area will be.
   * @param layer The glyph layer to use. If not given the current layer is used.
   * @return Returns this, or null if the layer given was invalid.
   */
  public fill(
    index: number,
    tileX: number,
    tileY: number,
    width: number,
    height: number,
    layer?: string | number | GlyphTilemapLayer
  ): this {
    const layerData = this.getLayer(layer);

    if (layerData === null) {
      return null;
    }

    Components.fill(index, tileX, tileY, width, height, layer);
    return this;
  }

  /**
   * For each tile in the given rectangular area (in tile coordinates) of the layer, run the given
   * filter callback function. Any tiles that pass the filter test (i.e. where the callback returns
   * true) will returned as a new array. Similar to Array.prototype.Filter in vanilla JS.
   * If no layer specified, the map's current layer is used.
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
   * @param layer The glyphtile layer to use. If not given the current layer is used.
   *
   * @return Returns an array of GlyphTiles, or null if the layer given was invalid.
   */
  public filterTiles(
    callback: (value: GlyphTile, index: number, array: GlyphTile[]) => boolean,
    context: unknown,
    tileX: number,
    tileY: number,
    width: number,
    height: number,
    options?: Components.FilteringOptions,
    layer?: string | number | GlyphTilemapLayer
  ): GlyphTile[] {
    const layerData = this.getLayer(layer);

    if (layerData === null) {
      return null;
    }

    return Components.filterTiles(callback, context, tileX, tileY, width, height, options, layerData);
  }

  /**
   * Searches the entire map layer for the first tile matching the given index, then returns that GlyphTile
   * object. If no match is found, it returns null. The search starts from the top-left tile and
   * continues horizontally until it hits the end of the row, then it drops down to the next column.
   * If the reverse boolean is true, it scans starting from the bottom-right corner traveling up to
   * the top-left.
   * If no layer specified, the map's current layer is used.
   *
   * @param index The tile index value to search for.
   * @param skip The number of times to skip a matching tile before returning.
   * @param reverse If true it will scan the layer in reverse, starting at the bottom-right. Otherwise it scans from the top-left.
   * @param layer The tile layer to use. If not given the current layer is used.
   *
   * @return Returns a GlyphTile, or null if the layer given was invalid.
   */
  public findByIndex(index: number, skip = 0, reverse = false, layer?: string | number | GlyphTilemapLayer): GlyphTile {
    const layerData = this.getLayer(layer);

    if (layerData === null) {
      return null;
    }

    return Components.findByIndex(index, skip, reverse, layerData);
  }

  /**
   * Find the first tile in the given rectangular area (in tile coordinates) of the layer that
   * satisfies the provided testing function. I.e. finds the first tile for which `callback` returns
   * true. Similar to Array.prototype.find in vanilla JS.
   * If no layer specified, the map's current layer is used.
   *
   * @param callback The callback. Each tile in the given area will be passed to this callback as the first and only parameter.
   * @param context The context under which the callback should be run.
   * @param tileX The left most tile index (in tile coordinates) to use as the origin of the area to search.
   * @param tileY The top most tile index (in tile coordinates) to use as the origin of the area to search.
   * @param width How many tiles wide from the `tileX` index the area will be.
   * @param height How many tiles tall from the `tileY` index the area will be.
   * @param options Optional filters to apply when getting the tiles.
   * @param layer The GlyphTile layer to run the search on. If not provided will use the current layer.
   *
   * @return Returns a GlyphTile, or null if the layer given was invalid.
   */
  public findTile(
    callback: (value: GlyphTile, index: number, array: GlyphTile[]) => boolean,
    context: unknown,
    tileX: number,
    tileY: number,
    width: number,
    height: number,
    options?: Components.FilteringOptions,
    layer?: string | number | GlyphTilemapLayer
  ): GlyphTile {
    const layerData = this.getLayer(layer);

    if (layerData === null) {
      return null;
    }

    return Components.findTile(callback, context, tileX, tileY, width, height, options, layerData);
  }

  /**
   * For each tile in the given rectangular area (in tile coordinates) of the layer, run the given
   * callback. Similar to Array.prototype.forEach in vanilla JS.
   *
   * If no layer specified, the map's current layer is used.
   *
   * @param callback The callback. Each tile in the given area will be passed to this callback as the first and only parameter.
   * @param context The context under which the callback should be run.
   * @param tileX The left most tile index (in tile coordinates) to use as the origin of the area to search.
   * @param tileY The top most tile index (in tile coordinates) to use as the origin of the area to search.
   * @param width How many tiles wide from the `tileX` index the area will be.
   * @param height How many tiles tall from the `tileY` index the area will be.
   * @param options Optional filters to apply when getting the tiles.
   * @param layer The GlyphTile layer to run the search on. If not provided will use the current layer.
   *
   * @return Returns this, or null if the layer given was invalid.
   */
  public forEachTile(
    callback: (value: GlyphTile, index: number, array: GlyphTile[]) => void,
    context: unknown,
    tileX: number,
    tileY: number,
    width: number,
    height: number,
    options?: Components.FilteringOptions,
    layer?: string | number | GlyphTilemapLayer
  ): this {
    const layerData = this.getLayer(layer);

    if (layerData === null) {
      return null;
    }

    Components.forEachTile(callback, context, tileX, tileY, width, height, options, layerData);
    return this;
  }

  /**
   * Gets the LayerData from `this.layers` that is associated with the given `layer`, or null if the layer is invalid.
   *
   * @param layer The name or index of the layer in the map or Glyphmap Layer. If not given will default to the map's current layer index.
   */
  public getLayer(layer: string | number | GlyphTilemapLayer): GlyphTilemapLayerData {
    var index = this.getLayerIndex(layer);
    return index !== null ? this.layers[index] : null;
  }

  /**
   * Gets the LayerData index of the given `layer` within this.layers, or null if an invalid
   * `layer` is given.
   *
   * @param layer The name or index of the layer in the map or a Tilemap Layer. If not given will default to the map's current layer index.
   */
  public getLayerIndex(layer: string | number | GlyphTilemapLayer): number {
    if (layer === undefined) {
      return this.currentLayerIndex;
    } else if (typeof layer === 'string') {
      return this.getLayerIndexByName(layer);
    } else if (typeof layer === 'number' && layer < this.layers.length) {
      return layer;
    } else if (layer instanceof GlyphTilemapLayer) {
      return layer.layerIndex;
    }

    return null;
  }

  /**
   * Gets the index of the LayerData within this.layers that has the given `name`, or null if an
   * invalid `name` is given.
   *
   * @param name The name of the layer to get.
   */
  public getLayerIndexByName(name: string): number {
    return this.getIndex(this.layers, name);
  }

  /**
   * Gets a tile at the given tile coordinates from the given layer.
   *
   * If no layer is specified, the maps current layer is used.
   *
   * @param tileX X position to get the tile from (given in tile units, not pixels).
   * @param tileY Y position to get the tile from (given in tile units, not pixels).
   * @param nonNull If true getTile won't return null for empty tiles, but a Tile object with an index of -1.
   * @param layer The glyph tile layer to use. If not given the current layer is used.
   * @return Returns a GlyphTile, or null if the layer given was invalid.
   */
  public getTileAt(
    tileX: number,
    tileY: number,
    nonNull = false,
    layer?: string | number | GlyphTilemapLayer
  ): GlyphTile {
    const layerData = this.getLayer(layer);

    if (layer === null) {
      return null;
    }

    return Components.getTileAt(tileX, tileY, nonNull, layerData);
  }

  /**
   * Gets a tile at the given world coordinates from the given layer.
   *
   * If no layer is specified, the maps current layer is used.
   *
   * @param worldX X position to get the tile from (given in pixels)
   * @param worldY Y position to get the tile from (given in pixels)
   * @param nonNull If true, function won't return null for empty tiles, but a Tile object with an index of -1.
   * @param camera The Camera to use when calculating the tile index from the world values.
   * @param layer The tile layer to use. If not given the current layer is used.
   * @return Returns a Tile, or null if the layer given was invalid.
   */
  public getTileAtWorldXY(
    worldX: number,
    worldY: number,
    nonNull = false,
    camera: Phaser.Cameras.Scene2D.Camera,
    layer?: string | number | GlyphTilemapLayer
  ): GlyphTile {
    const layerData = this.getLayer(layer);

    if (layerData === null) {
      return null;
    }

    return Components.getTileAtWorldXY(worldX, worldY, nonNull, camera, layerData);
  }

  /**
   * Return a list of all valid glyphlayer names loaded in this Glyphmap.
   */
  public getTileLayerNames(): string[] {
    if (!this.layers || !Array.isArray(this.layers)) {
      return [];
    }

    return this.layers.map(function (layer) {
      return layer.name;
    });
  }

  /**
   * Gets the tiles in the given rectangular area (in tile coordinates) of the layer.
   *
   * If no layer is specified, the maps current layer is used.
   *
   * @param tileX The left most tile index (in tile coordinates) to use as the origin of the area.
   * @param tileY The top most tile index (in tile coordinates) to use as the origin of the area.
   * @param width How many tiles wide from the `tileX` index the area will be.
   * @param height How many tiles tall from the `tileY` index the area will be.
   * @param options Optional filters to apply when getting the tiles.
   * @param layer The tile layer to use. If not given the current layer is used.
   * @return Returns an array of GlyphTiles, or null if the layer given was invalid.
   */
  public getTilesWithin(
    tileX: number,
    tileY: number,
    width: number,
    height: number,
    options?: Components.FilteringOptions,
    layer?: string | number | GlyphTilemapLayer
  ): GlyphTile[] {
    const layerData = this.getLayer(layer);

    if (layer === null) {
      return null;
    }

    return Components.getTilesWithin(tileX, tileY, width, height, options, layerData);
  }

  /**
   * Gets the tiles that overlap with the given shape in the given layer. The shape must be a Circle,
   * Line, Rectangle or Triangle. The shape should be in world coordinates.
   *
   * If no layer is specified, the maps current layer is used.
   *
   * @param shape A shape in world (pixel) coordinates
   * @param options Optional filters to apply when getting the tiles.
   * @param camera The Camera to use when factoring in which tiles to return.
   * @param layer The tile layer to use. If not given the current layer is used.
   * @return Returns an array of GlyphTiles, or null if the layer given was invalid.
   */
  public getTilesWithinShape(
    shape: Phaser.Geom.Circle | Phaser.Geom.Line | Phaser.Geom.Rectangle | Phaser.Geom.Triangle,
    options: Components.FilteringOptions,
    camera: Phaser.Cameras.Scene2D.Camera,
    layer?: string | number | GlyphTilemapLayer
  ): GlyphTile[] {
    const layerData = this.getLayer(layer);

    if (layerData === null) {
      return null;
    }

    return Components.getTilesWithinShape(shape, options, camera, layerData);
  }

  /**
   * Gets the tiles in the given rectangular area (in world coordinates) of the layer.
   *
   * If no layer is specified, the maps current layer is used.
   *
   * @param worldX The world x coordinate for the top-left of the area.
   * @param worldY The world y coordinate for the top-left of the area.
   * @param width The width of the area.
   * @param height The height of the area.
   * @param options Optional filters to apply when getting the tiles.
   * @param camera The Camera to use when factoring in which tiles to return.
   * @param layer The tile layer to use. If not given the current layer is used.
   * @return Returns an array of GlyphTiles, or null if the layer given was invalid.
   */
  public getTilesWithinWorldXY(
    worldX: number,
    worldY: number,
    width: number,
    height: number,
    options: Components.FilteringOptions,
    camera: Phaser.Cameras.Scene2D.Camera,
    layer?: string | number | GlyphTilemapLayer
  ): GlyphTile[] {
    const layerData = this.getLayer(layer);

    if (layerData === null) {
      return null;
    }

    return Components.getTilesWithinWorldXY(worldX, worldY, width, height, options, camera, layerData);
  }

  /**
   * Gets the Glyphset that has the given `name`, or null if an invalid `name` is given.
   *
   * @param name The name of the Glyphset to get.
   */
  public getGlyphset(name: string): GlyphTileset {
    var index = this.getIndex(this.glyphsets, name);
    return index !== null ? this.glyphsets[index] : null;
  }

  /**
   * Gets the index of the Glyphset within this.glyphsets that has the given `name`, or null if an
   * invalid `name` is given.
   *
   * @param name The name of the Glyphset to get.
   */
  public getGlyphsetIndex(name: string): number {
    return this.getIndex(this.glyphsets, name);
  }

  /**
   * Checks if there is a tile at the given location (in tile coordinates) in the given layer. Returns
   * false if there is no tile or if the tile at that location has an index of -1.
   *
   * If no layer is specified, the maps current layer is used.
   *
   * @param tileX The x coordinate, in tiles, not pixels.
   * @param tileY The y coordinate, in tiles, not pixels.
   * @param layer The tile layer to use. If not given the current layer is used.
   */
  public hasTileAt(tileX: number, tileY: number, layer?: string | number | GlyphTilemapLayer): boolean {
    const layerData = this.getLayer(layer);

    if (layerData === null) {
      return null;
    }

    return Components.hasTileAt(tileX, tileY, layerData);
  }

  /**
   * Checks if there is a tile at the given location (in world coordinates) in the given layer. Returns
   * false if there is no tile or if the tile at that location has an index of -1.
   *
   * If no layer is specified, the maps current layer is used.
   *
   * @param worldX The x coordinate, in pixels.
   * @param worldY The y coordinate, in pixels.
   * @param camera The Camera to use when factoring in which tiles to return.
   * @param layer The tile layer to use. If not given the current layer is used.
   */
  public hasTileAtWorldXY(
    worldX: number,
    worldY: number,
    camera: Phaser.Cameras.Scene2D.Camera,
    layer?: string | number | GlyphTilemapLayer
  ): boolean {
    const layerData = this.getLayer(layer);

    if (layerData === null) {
      return null;
    }

    return Components.hasTileAtWorldXY(worldX, worldY, camera, layerData);
  }

  /**
   * Puts a tile at the given tile coordinates in the specified layer. You can pass in either an index
   * or a GlyphTile object. If you pass in a GlyphTile, all attributes will be copied over to the specified
   * location. If you pass in an index, only the index at the specified location will be changed.
   *
   * If no layer is specified, the maps current layer is used.
   *
   * @param tile The index of this tile to set or a GlyphTile object.
   * @param tileX The x coordinate, in tiles, not pixels.
   * @param tileY The y coordinate, in tiles, not pixels.
   * @param layer The tile layer to use. If not given the current layer is used.
   * @return Returns a GlyphTile, or null if the layer given was invalid or the coordinates were out of bounds.
   */
  public putTileAt(
    tile: number | GlyphTile,
    tileX: number,
    tileY: number,
    layer?: string | number | GlyphTilemapLayer
  ): GlyphTile {
    const layerData = this.getLayer(layer);

    if (layerData === null) {
      return null;
    }

    return Components.putTileAt(tile, tileX, tileY, layerData);
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
   * @param layer The tile layer to use. If not given the current layer is used.
   *
   * @return {?Phaser.Tilemaps.Tile} Returns a Tile, or null if the layer given was invalid.
   */
  public putTileAtWorldXY(
    tile: number | GlyphTile,
    worldX: number,
    worldY: number,
    camera: Phaser.Cameras.Scene2D.Camera,
    layer?: string | number | GlyphTilemapLayer
  ): GlyphTile {
    const layerData = this.getLayer(layer);

    if (layerData === null) {
      return null;
    }

    return Components.putTileAtWorldXY(tile, worldX, worldY, camera, layerData);
  }

  /**
   * Puts an array of tiles or a 2D array of tiles at the given tile coordinates in the specified
   * layer. The array can be composed of either tile indexes or GlyphTile objects. If you pass in a GlyphTile,
   * all attributes will be copied over to the specified location. If you pass in an index, only the
   * index at the specified location will be changed.
   *
   * If no layer is specified, the maps current layer is used.
   *
   * @param tiles A row (array) or grid (2D array) of GlyphTiles or tile indexes to place.
   * @param tileX The x coordinate, in tiles, not pixels.
   * @param tileY The y coordinate, in tiles, not pixels.
   * @param layer The tile layer to use. If not given the current layer is used.
   * @return Returns this, or null if the layer given was invalid.
   */
  public putTilesAt(
    tiles: number[] | number[][] | GlyphTile[] | GlyphTile[][],
    tileX: number,
    tileY: number,
    layer?: string | number | GlyphTilemapLayer
  ): this {
    const layerData = this.getLayer(layer);

    if (layerData === null) {
      return null;
    }

    Components.putTilesAt(tiles, tileX, tileY, layerData);

    return this;
  }

  /**
   * Randomizes the indexes of a rectangular region of tiles (in tile coordinates) within the
   * specified layer. Each tile will receive a new index. If an array of indexes is passed in, then
   * those will be used for randomly assigning new tile indexes. If an array is not provided, the
   * indexes found within the region (excluding -1) will be used for randomly assigning new tile
   * indexes. This method only modifies tile indexes and does not change collision information.
   *
   * If no layer is specified, the maps current layer is used.
   *
   * @param tileX The left most tile index (in tile coordinates) to use as the origin of the area.
   * @param tileY The top most tile index (in tile coordinates) to use as the origin of the area.
   * @param width How many tiles wide from the `tileX` index the area will be.
   * @param height How many tiles tall from the `tileY` index the area will be.
   * @param indexes An array of indexes to randomly draw from during randomization.
   * @param layer The tile layer to use. If not given the current layer is used.
   * @return Returns this, or null if the layer given was invalid.
   */
  public randomize(
    tileX: number,
    tileY: number,
    width: number,
    height: number,
    indexes: number[],
    layer?: string | number | GlyphTilemapLayer
  ): this {
    const layerData = this.getLayer(layer);

    if (layer === null) {
      return null;
    }

    Components.randomize(tileX, tileY, width, height, indexes, layerData);

    return this;
  }

  /**
   * Removes the given GlyphTilemapLayer from this Glyphmap without destroying it.
   *
   * If no layer is specified, the map's current layer is used.
   *
   * @param layer The glyph layer to be removed.
   * @return Returns this, or null if the layer given was invalid.
   */
  public removeLayer(layer: string | number | GlyphTilemapLayer): this {
    const index = this.getLayerIndex(layer);

    if (index !== null) {
      Phaser.Utils.Array.SpliceOne(this.layers, index);

      for (let i = index; i < this.layers.length; i++) {
        if (this.layers[i].glyphmapLayer) {
          this.layers[i].glyphmapLayer.layerIndex--;
        }
      }

      if (this.currentLayerIndex === index) {
        this.currentLayerIndex = 0;
      }

      return this;
    }

    return null;
  }

  /**
   * Destroys the given GlyphTilemapLayer and removes it from this GlyphTilemap.
   *
   * If no layer is specified, the maps current layer is used.
   *
   * @param layer The tile layer to be destroyed.
   * @return Returns this, or null if the layer given was invalid.
   */
  public destroyLayer(layer: string | number | GlyphTilemapLayer): this {
    const index = this.getLayerIndex(layer);

    if (index !== null) {
      const layer = this.layers[index].glyphmapLayer;

      layer.destroy();

      Phaser.Utils.Array.SpliceOne(this.layers, index);

      if (this.currentLayerIndex === index) {
        this.currentLayerIndex = 0;
      }

      return this;
    }

    return null;
  }

  /**
   * Removes all GlyphTilemap Layers from this GlyphTilemap and calls `destroy` on each of them.
   *
   * @return This GlyphTilemap object.
   */
  public removeAllLayers(): this {
    const layers = this.layers;

    for (var i = 0; i < layers.length; i++) {
      if (layers[i].glyphmapLayer) {
        layers[i].glyphmapLayer.destroy(false);
      }
    }

    layers.length = 0;
    this.currentLayerIndex = 0;

    return this;
  }

  /**
   * Removes the given GlyphTile, or an array of GlyphTiles, from the layer to which they belong.
   *
   * @param tiles The GlyphTile to remove, or an array of GlyphTiles.
   * @param replaceIndex After removing the GlyphTile, insert a brand new GlyphTile into its
   * location with the given index. Leave as -1 to just remove the tile.
   * @return Returns an array of GlyphTiles that were removed.
   */
  public removeTile(tiles: GlyphTile | GlyphTile[], replaceIndex = -1): GlyphTile[] {
    const removed: GlyphTile[] = [];

    if (!Array.isArray(tiles)) {
      tiles = [tiles];
    }

    for (let i = 0; i < tiles.length; i++) {
      const tile = tiles[i];

      removed.push(this.removeTileAt(tile.x, tile.y, true, tile.glyphmapLayer));

      if (replaceIndex > -1) {
        this.putTileAt(replaceIndex, tile.x, tile.y, tile.glyphmapLayer);
      }
    }

    return removed;
  }

  /**
   * Removes the tile at the given tile coordinates in the specified layer.
   *
   * If no layer is specified, the maps current layer is used.
   *
   * @param tileX The x coordinate, in tiles, not pixels.
   * @param tileY The y coordinate, in tiles, not pixels.
   * @param replaceWithNull If `true` (the default), this will replace the tile at the specified
   * location with null instead of a GlyphTile with an index of -1.
   * @param layer The tile layer to use. If not given the current layer is used.
   * @return Returns the GlyphTile that was removed, or null if the layer given was invalid.
   */
  public removeTileAt(
    tileX: number,
    tileY: number,
    replaceWithNull = true,
    layer?: string | number | GlyphTilemapLayer
  ): GlyphTile {
    const layerData = this.getLayer(layer);

    if (layerData === null) {
      return null;
    }

    return Components.removeTileAt(tileX, tileY, replaceWithNull, layerData);
  }

  /**
   * Removes the tile at the given world coordinates in the specified layer.
   *
   * If no layer is specified, the maps current layer is used.
   *
   * @param worldX The x coordinate, in pixels.
   * @param worldY The y coordinate, in pixels.
   * @param replaceWithNull If `true` (the default), this will replace the tile at the specified location
   * with null instead of a GlyphTile with an index of -1.
   * @param camera The Camera to use when calculating the tile index from the world values.
   * @param layer The tile layer to use. If not given the current layer is used.
   * @return Returns a GlyphTile, or null if the layer given was invalid.
   */
  public removeTileAtWorldXY(
    worldX: number,
    worldY: number,
    replaceWithNull = true,
    camera: Phaser.Cameras.Scene2D.Camera,
    layer?: string | number | GlyphTilemapLayer
  ): GlyphTile {
    const layerData = this.getLayer(layer);

    if (layerData === null) {
      return null;
    }

    return Components.removeTileAtWorldXY(worldX, worldY, replaceWithNull, camera, layerData);
  }

  /**
   * Draws a debug representation of the layer to the given Graphics object. This is helpful when you want to
   * get a quick idea of which of your tiles are colliding and which have interesting faces. The tiles
   * are drawn starting at (0, 0) in the Graphics, allowing you to place the debug representation
   * wherever you want on the screen.
   *
   * If no layer is specified, the maps current layer is used.
   *
   * @param graphics The target Graphics object to draw upon.
   * @param styleConfig An object specifying the colors to use for the debug drawing.
   * @param layer The tile layer to use. If not given the current layer is used.
   * @return Return this GlyphTilemap object, or null if the layer given was invalid.
   */
  public renderDebug(
    graphics: Phaser.GameObjects.Graphics,
    styleConfig: Phaser.Types.Tilemaps.StyleConfig,
    layer?: string | number | GlyphTilemapLayer
  ): this {
    const layerData = this.getLayer(layer);

    if (layerData === null) {
      return null;
    }

    Components.renderDebug(graphics, styleConfig, layerData);

    return this;
  }

  /**
   * Draws a debug representation of all layers within this GlyphTilemap to the given Graphics object.
   *
   * @param graphics The target Graphics object to draw upon.
   * @param styleConfig An object specifying the colors to use for the debug drawing.
   * @return This GlyphTilemap instance.
   */
  public renderDebugFull(graphics: Phaser.GameObjects.Graphics, styleConfig: Phaser.Types.Tilemaps.StyleConfig): this {
    const layers = this.layers;

    for (let i = 0; i < layers.length; i++) {
      Components.renderDebug(graphics, styleConfig, layers[i]);
    }

    return this;
  }

  /**
   * Scans the given rectangular area (given in tile coordinates) for tiles with an index matching
   * `findIndex` and updates their index to match `newIndex`.
   *
   * If no layer is specified, the maps current layer is used.
   *
   * @param findIndex The index of the tile to search for.
   * @param newIndex The index of the tile to replace it with.
   * @param tileX] The left most tile index (in tile coordinates) to use as the origin of the area.
   * @param tileY] The top most tile index (in tile coordinates) to use as the origin of the area.
   * @param width] How many tiles wide from the `tileX` index the area will be.
   * @param height] How many tiles tall from the `tileY` index the area will be.
   * @param layer] The tile layer to use. If not given the current layer is used.
   * @return Return this GlyphTilemap object, or null if the layer given was invalid.
   */
  public replaceByIndex(
    findIndex: number,
    newIndex: number,
    tileX: number,
    tileY: number,
    width: number,
    height: number,
    layer?: string | number | GlyphTilemapLayer
  ): this {
    const layerData = this.getLayer(layer);

    if (layerData === null) {
      return null;
    }

    Components.replaceByIndex(findIndex, newIndex, tileX, tileY, width, height, layerData);

    return this;
  }

  /**
   * Sets the current layer to the GlyhpmapLayerData associated with `layer`.
   *
   * @param layer The name or index of the layer in the map or a GlyphTilemapLayer.
   * If not given will default to the map's current layer index.
   */
  public setLayer(layer: string | number | GlyphTilemapLayer): this {
    const index = this.getLayerIndex(layer);

    if (index !== null) {
      this.currentLayerIndex = index;
    }

    return this;
  }

  /**
   * Shuffles the tiles in a rectangular region (specified in tile coordinates) within the given
   * layer. It will only randomize the tiles in that area, so if they're all the same nothing will
   * appear to have changed! This method only modifies tile indexes and does not change collision
   * information.
   *
   * If no layer is specified, the maps current layer is used.
   *
   * @param tileX The left most tile index (in tile coordinates) to use as the origin of the area.
   * @param tileY The top most tile index (in tile coordinates) to use as the origin of the area.
   * @param width How many tiles wide from the `tileX` index the area will be.
   * @param height How many tiles tall from the `tileY` index the area will be.
   * @param layer The tile layer to use. If not given the current layer is used.
   * @return Return this GlyphTilemap object, or null if the layer given was invalid.
   */
  public shuffle(
    tileX: number,
    tileY: number,
    width: number,
    height: number,
    layer?: string | number | GlyphTilemapLayer
  ): this {
    const layerData = this.getLayer(layer);

    if (layerData === null) {
      return null;
    }

    Components.shuffle(tileX, tileY, width, height, layerData);
    return this;
  }

  /**
   * Scans the given rectangular area (given in tile coordinates) for tiles with an index matching
   * `indexA` and swaps then with `indexB`. This only modifies the index.
   *
   * If no layer is specified, the maps current layer is used.
   *
   * @param tileA First tile index.
   * @param tileB Second tile index.
   * @param tileX The left most tile index (in tile coordinates) to use as the origin of the area.
   * @param tileY The top most tile index (in tile coordinates) to use as the origin of the area.
   * @param width How many tiles wide from the `tileX` index the area will be.
   * @param height How many tiles tall from the `tileY` index the area will be.
   * @param layer The tile layer to use. If not given the current layer is used.
   * @return Return this GlyphTilemap object, or null if the layer given was invalid.
   */
  public swapByIndex(
    indexA: number,
    indexB: number,
    tileX: number,
    tileY: number,
    width: number,
    height: number,
    layer?: string | number | GlyphTilemapLayer
  ): this {
    const layerData = this.getLayer(layer);

    if (layerData === null) {
      return null;
    }

    Components.swapByIndex(indexA, indexB, tileX, tileY, width, height, layerData);
    return this;
  }

  /**
   * Converts from tile X coordinates (tile units) to world X coordinates (pixels), factoring in the
   * layers position, scale and scroll.
   *
   * If no layer is specified, the maps current layer is used.
   *
   * @param tileX The x coordinate, in tiles, not pixels.
   * @param camera The Camera to use when calculating the tile index from the world values.
   * @param layer The tile layer to use. If not given the current layer is used.
   */
  public tileToWorldX(
    tileX: number,
    camera: Phaser.Cameras.Scene2D.Camera,
    layer?: string | number | GlyphTilemapLayer
  ): number {
    const layerData = this.getLayer(layer);

    if (layerData === null) {
      return null;
    }

    return Components.tileToWorldX(tileX, camera, layerData);
  }

  /**
   * Converts from tile Y coordinates (tile units) to world Y coordinates (pixels), factoring in the
   * layers position, scale and scroll.
   *
   * If no layer is specified, the maps current layer is used.
   *
   * @param tileY The y coordinate, in tiles, not pixels.
   * @param camera The Camera to use when calculating the tile index from the world values.
   * @param layer The tile layer to use. If not given the current layer is used.
   */
  public tileToWorldY(
    tileX: number,
    camera: Phaser.Cameras.Scene2D.Camera,
    layer?: string | number | GlyphTilemapLayer
  ): number {
    const layerData = this.getLayer(layer);

    if (layerData === null) {
      return null;
    }

    return Components.tileToWorldY(tileX, camera, layerData);
  }

  /**
   * Converts from tile XY coordinates (tile units) to world XY coordinates (pixels), factoring in the
   * layers position, scale and scroll. This will return a new Vector2 object or update the given
   * `point` object.
   *
   * If no layer is specified, the maps current layer is used.
   *
   * @param tileX The x coordinate, in tiles, not pixels.
   * @param tileY The y coordinate, in tiles, not pixels.
   * @param vec2 A Vector2 to store the coordinates in. If not given a new Vector2 is created.
   * @param camera The Camera to use when calculating the tile index from the world values.
   * @param layer The tile layer to use. If not given the current layer is used.
   */
  public tileToWorldXY(
    tileX: number,
    tileY: number,
    vec2: Phaser.Math.Vector2,
    camera: Phaser.Cameras.Scene2D.Camera,
    layer?: string | number | GlyphTilemapLayer
  ): Phaser.Math.Vector2 {
    const layerData = this.getLayer(layer);

    if (layerData === null) {
      return null;
    }

    return Components.tileToWorldXY(tileX, tileY, vec2, camera, layerData);
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
   * The probability of any index being picked is (the indexs weight) / (sum of all weights). This
   * method only modifies tile indexes.
   *
   * If no layer is specified, the maps current layer is used.
   *
   * @param weightedIndexes - An array of objects to randomly draw from during randomization.
   * They should be in the form: { index: 0, weight: 4 } or { index: [0, 1], weight: 4 }
   * if you wish to draw from multiple tile indexes.
   * @param tileX The left most tile index (in tile coordinates) to use as the origin of the area.
   * @param tileY The top most tile index (in tile coordinates) to use as the origin of the area.
   * @param width How many tiles wide from the `tileX` index the area will be.
   * @param height How many tiles tall from the `tileY` index the area will be.
   * @param layer The tile layer to use. If not given the current layer is used.
   * @return Return this GlyphTilemap object, or null if the layer given was invalid.
   */
  public weightedRandomize(
    weightedIndexes: { index: number | number[]; weight: number }[],
    tileX: number,
    tileY: number,
    width: number,
    height: number,
    layer?: string | number | GlyphTilemapLayer
  ): this {
    const layerData = this.getLayer(layer);

    if (layerData === null) {
      return null;
    }

    Components.weightedRandomize(tileX, tileY, width, height, weightedIndexes, layerData);

    return this;
  }

  /**
   * Converts from world X coordinates (pixels) to tile X coordinates (tile units), factoring in the
   * layers position, scale and scroll.
   *
   * If no layer is specified, the maps current layer is used.
   *
   * @param worldX The x coordinate to be converted, in pixels, not tiles.
   * @param snapToFloor Whether or not to round the tile coordinate down to the nearest integer.
   * @param camera The Camera to use when calculating the tile index from the world values.
   * @param layer The tile layer to use. If not given the current layer is used.
   */
  public worldToTileX(
    worldX: number,
    snapToFloor: boolean,
    camera: Phaser.Cameras.Scene2D.Camera,
    layer?: string | number | GlyphTilemapLayer
  ): number {
    const layerData = this.getLayer(layer);

    if (layerData === null) {
      return null;
    }

    return Components.worldToTileX(worldX, snapToFloor, camera, layerData);
  }

  /**
   * Converts from world Y coordinates (pixels) to tile Y coordinates (tile units), factoring in the
   * layers position, scale and scroll.
   *
   * If no layer is specified, the maps current layer is used.
   *
   * @param worldY The y coordinate to be converted, in pixels, not tiles.
   * @param snapToFloor Whether or not to round the tile coordinate down to the nearest integer.
   * @param camera The Camera to use when calculating the tile index from the world values.
   * @param layer The tile layer to use. If not given the current layer is used.
   */
  public worldToTileY(
    worldY: number,
    snapToFloor: boolean,
    camera: Phaser.Cameras.Scene2D.Camera,
    layer?: string | number | GlyphTilemapLayer
  ): number {
    const layerData = this.getLayer(layer);

    if (layerData === null) {
      return null;
    }

    return Components.worldToTileY(worldY, snapToFloor, camera, layerData);
  }

  /**
   * Converts from world XY coordinates (pixels) to tile XY coordinates (tile units), factoring in the
   * layers position, scale and scroll. This will return a new Vector2 object or update the given
   * `point` object.
   *
   * If no layer is specified, the maps current layer is used.
   *
   * @param worldX The x coordinate to be converted, in pixels, not tiles.
   * @param worldY The y coordinate to be converted, in pixels, not tiles.
   * @param snapToFloor Whether or not to round the tile coordinate down to the nearest integer.
   * @param vec2 A Vector2 to store the coordinates in. If not given a new Vector2 is created.
   * @param camera The Camera to use when calculating the tile index from the world values.
   * @param layer The tile layer to use. If not given the current layer is used.
   */
  public worldToTileXY(
    worldX: number,
    worldY: number,
    snapToFloor: boolean,
    vec2: Phaser.Math.Vector2,
    camera: Phaser.Cameras.Scene2D.Camera,
    layer?: string | number | GlyphTilemapLayer
  ): Phaser.Math.Vector2 {
    const layerData = this.getLayer(layer);

    if (layerData === null) {
      return null;
    }

    return Components.worldToTileXY(worldX, worldY, snapToFloor, vec2, camera, layerData);
  }

  /**
   * Removes all layer data from this GlyphTilemap and nulls the scene reference. This will destroy any
   * GlyphTilemapLayers that have been created.
   */
  public destroy(): void {
    this.removeAllLayers();
    this.glyphsets.length = 0;
    this.scene = null;
  }

  /**
   * Internally used. Returns the index of the object in one of the Tilemaps arrays whose name
   * property matches the given `name`.
   *
   * @param location The Tilemap array to search.
   * @param name The name of the array element to get.
   *
   * @return The index of the element in the array, or null if not found.
   */
  protected getIndex(location: { name: string }[], name: string): number {
    for (let i = 0; i < location.length; i++) {
      if (location[i].name === name) {
        return i;
      }
    }

    return null;
  }
}
