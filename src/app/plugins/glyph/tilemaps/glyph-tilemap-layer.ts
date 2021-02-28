import { Font, FontLike, Mixin } from '../utils';
import { Glyph } from '../glyph';
import { GameObjectComponents } from '../gameobjects';

import * as GlyphTilemapComponents from './glyph-tilemap-components';
import { GlyphTile } from './glyph-tile';
import { GlyphTilemap } from './glyph-tilemap';
import GlyphTilemapLayerRender from './glyph-tilemap-layer-render';
import { GlyphTileset } from './glyph-tileset';

/**
 * Glyphmap layer data configuration.
 */
export interface GlyphTilemapLayerDataConfig {
  /**
   * The name of the layer.
   */
  name?: string;

  /**
   * The x offset of where to draw from the top left.
   */
  x?: number;

  /**
   * The y offset of where to draw from the top left.
   */
  y?: number;

  /**
   * The width of the layer in tiles.
   */
  width?: number;

  /**
   * The height of the layer in tiles.
   */
  height?: number;

  /**
   * Font for the layer.
   */
  font?: FontLike;

  /**
   * The alpha value of the layer.
   */
  alpha?: number;

  /**
   * Is the layer visible or not?
   */
  visible?: boolean;

  /**
   * Tile ID index map.
   */
  indexes?: number[];

  /**
   * An array of the tile data indexes.
   */
  data?: GlyphTile[][];

  /**
   * A reference to the GlyphTilemap layer that owns this data.
   */
  glyphmapLayer?: GlyphTilemapLayer;
}

/**
 * A class for representing data about about a layer in a glyphmap.
 * Maps are parsed into this format.
 * GlyphTilemap and GlyphTilemapLayer objects have a reference
 * to this data and use it to look up and perform operations on tiles.
 */
export class GlyphTilemapLayerData {
  /**
   * The name of the layer.
   */
  public readonly name: string;

  /**
   * The x offset of where to draw from the top left.
   */
  public readonly x: number;

  /**
   * The y offset of where to draw from the top left.
   */
  public readonly y: number;

  /**
   * The pixel width of the tiles.
   */
  public readonly tileWidth: number;

  /**
   * The pixel height of the tiles.
   */
  public readonly tileHeight: number;

  /**
   * Font for the layer.
   */
  public readonly font: Font;

  /**
   * The alpha value of the layer.
   */
  public readonly alpha: number;

  /**
   * Is the layer visible or not?
   */
  public readonly visible: boolean;

  /**
   * Tile ID index map.
   */
  public readonly indexes: number[];

  /**
   * The width of the layer in tiles.
   */
  public width: number;

  /**
   * The height of the layer in tiles.
   */
  public height: number;

  /**
   * The width in pixels of the entire layer.
   */
  public widthInPixels: number;

  /**
   * The height in pixels of the entire layer.
   */
  public heightInPixels: number;

  /**
   * An array of the tile data indexes.
   */
  public data: GlyphTile[][];

  /**
   * A reference to the GlyphTilemap layer that owns this data.
   */
  public glyphmapLayer: GlyphTilemapLayer;

  /**
   * Instantiate glyphmap layer data.
   *
   * @param config Glyphmap layer data configuration.
   */
  public constructor({
    name,
    x,
    y,
    width,
    height,
    font,
    alpha,
    visible,
    indexes,
    data,
    glyphmapLayer
  }: GlyphTilemapLayerDataConfig) {
    this.name = typeof name === 'string' ? name : 'layer';

    this.x = x || 0;
    this.y = y || 0;
    this.width = width || 0;
    this.height = height || 0;

    this.alpha = typeof alpha === 'number' ? alpha : 1;
    this.visible = typeof visible === 'boolean' ? visible : true;

    this.font = Font.normalize(font || ({} as Font));

    const { width: tileWidth, height: tileHeight } = Glyph.frameDimensions(
      new Glyph(undefined, undefined, undefined, this.font)
    );

    this.tileWidth = tileWidth;
    this.tileHeight = tileHeight;
    this.widthInPixels = tileWidth * this.width;
    this.heightInPixels = tileHeight * this.height;

    this.indexes = Array.isArray(indexes) ? indexes : [];
    this.data = Array.isArray(data) ? data : [];

    this.glyphmapLayer = glyphmapLayer || null;
  }
}

const {
  Alpha,
  BlendMode,
  ComputedSize,
  Depth,
  Flip,
  GetBounds,
  Origin,
  Pipeline,
  ScrollFactor,
  Transform,
  Visible
} = GameObjectComponents;

/**
 * A GlyphTilemap Layer is a Game Object that renders GlyphTilemapLayerData from a GlyphTilemap when used in combination
 * with one, or more, GlyphTilesets.
 */
@Mixin([
  Alpha,
  BlendMode,
  ComputedSize,
  Depth,
  Flip,
  GetBounds,
  Origin,
  Pipeline,
  ScrollFactor,
  Transform,
  Visible,
  GlyphTilemapLayerRender
])
export class GlyphTilemapLayer
  extends Phaser.GameObjects.GameObject
  implements
    Phaser.GameObjects.Components.Alpha,
    Phaser.GameObjects.Components.BlendMode,
    Phaser.GameObjects.Components.ComputedSize,
    Phaser.GameObjects.Components.Depth,
    Phaser.GameObjects.Components.Flip,
    Phaser.GameObjects.Components.GetBounds,
    Phaser.GameObjects.Components.Origin,
    Phaser.GameObjects.Components.Pipeline,
    Phaser.GameObjects.Components.ScrollFactor,
    Phaser.GameObjects.Components.Transform,
    Phaser.GameObjects.Components.Visible {
  /**
   * Used internally during rendering. This holds the tiles that are visible within the Camera.
   */
  public readonly culledTiles: GlyphTile[] = [];

  /**
   * @mixin
   */
  public readonly clearAlpha: () => this;

  /**
   * @mixin
   */
  public readonly setAlpha: (topLeft?: number, topRight?: number, bottomLeft?: number, bottomRight?: number) => this;

  /**
   * @mixin
   */
  public readonly setBlendMode: (value: string | Phaser.BlendModes) => this;

  /**
   * @mixin
   */
  public readonly setSize: (width: number, height: number) => this;

  /**
   * @mixin
   */
  public readonly setDisplaySize: (width: number, height: number) => this;

  /**
   * @mixin
   */
  public readonly setDepth: (value: number) => this;

  /**
   * @mixin
   */
  public readonly toggleFlipX: () => this;

  /**
   * @mixin
   */
  public readonly toggleFlipY: () => this;

  /**
   * @mixin
   */
  public readonly setFlipX: (value: boolean) => this;

  /**
   * @mixin
   */
  public readonly setFlipY: (value: boolean) => this;

  /**
   * @mixin
   */
  public readonly setFlip: (x: boolean, y: boolean) => this;

  /**
   * @mixin
   */
  public readonly resetFlip: () => this;

  /**
   * @mixin
   */
  public readonly getCenter: <O extends Phaser.Math.Vector2>(output?: O) => O;

  /**
   * @mixin
   */
  public readonly getTopLeft: <O extends Phaser.Math.Vector2>(output?: O, includeParent?: boolean) => O;

  /**
   * @mixin
   */
  public readonly getTopCenter: <O extends Phaser.Math.Vector2>(output?: O, includeParent?: boolean) => O;

  /**
   * @mixin
   */
  public readonly getTopRight: <O extends Phaser.Math.Vector2>(output?: O, includeParent?: boolean) => O;

  /**
   * @mixin
   */
  public readonly getLeftCenter: <O extends Phaser.Math.Vector2>(output?: O, includeParent?: boolean) => O;

  /**
   * @mixin
   */
  public readonly getRightCenter: <O extends Phaser.Math.Vector2>(output?: O, includeParent?: boolean) => O;

  /**
   * @mixin
   */
  public readonly getBottomLeft: <O extends Phaser.Math.Vector2>(output?: O, includeParent?: boolean) => O;

  /**
   * @mixin
   */
  public readonly getBottomCenter: <O extends Phaser.Math.Vector2>(output?: O, includeParent?: boolean) => O;

  /**
   * @mixin
   */
  public readonly getBottomRight: <O extends Phaser.Math.Vector2>(output?: O, includeParent?: boolean) => O;

  /**
   * @mixin
   */
  public readonly getBounds: <O extends Phaser.Geom.Rectangle>(output?: O) => O;

  /**
   * @mixin
   */
  public readonly setOrigin: (x?: number, y?: number) => this;

  /**
   * @mixin
   */
  public readonly setOriginFromFrame: () => this;

  /**
   * @mixin
   */
  public readonly setDisplayOrigin: (x?: number, y?: number) => this;

  /**
   * @mixin
   */
  public readonly updateDisplayOrigin: () => this;

  /**
   * @mixin
   */
  public readonly initPipeline: (pipeline: string | Phaser.Renderer.WebGL.WebGLPipeline) => boolean;

  /**
   * @mixin
   */
  public readonly setPipeline: (
    pipeline: string | Phaser.Renderer.WebGL.WebGLPipeline,
    pipelineData?: object,
    copyData?: boolean
  ) => this;

  /**
   * @mixin
   */
  public readonly setPostPipeline: (
    pipelines:
      | string
      | Function
      | string[]
      | Phaser.Renderer.WebGL.Pipelines.PostFXPipeline
      | Phaser.Renderer.WebGL.Pipelines.PostFXPipeline[]
      | Function[],
    pipelineData?: object,
    copyData?: boolean
  ) => this;

  /**
   * @mixin
   */
  public readonly setPipelineData: (key: string, value?: any) => this;

  /**
   * @mixin
   */
  public readonly getPostPipeline: (
    pipeline: string | Function | Phaser.Renderer.WebGL.Pipelines.PostFXPipeline
  ) => Phaser.Renderer.WebGL.Pipelines.PostFXPipeline | Phaser.Renderer.WebGL.Pipelines.PostFXPipeline[];

  /**
   * @mixin
   */
  public readonly resetPipeline: (resetPostPipelines?: boolean, resetData?: boolean) => boolean;

  /**
   * @mixin
   */
  public readonly resetPostPipeline: (resetData?: boolean) => void;

  /**
   * @mixin
   */
  public readonly removePostPipeline: (pipeline: string | Phaser.Renderer.WebGL.Pipelines.PostFXPipeline) => this;

  /**
   * @mixin
   */
  public readonly getPipelineName: () => string;

  /**
   * @mixin
   */
  public readonly setScrollFactor: (x: number, y?: number) => this;

  /**
   * @mixin
   */
  public readonly setPosition: (x?: number, y?: number, z?: number, w?: number) => this;

  /**
   * @mixin
   */
  public readonly copyPosition: (
    source: Phaser.Types.Math.Vector2Like | Phaser.Types.Math.Vector3Like | Phaser.Types.Math.Vector4Like
  ) => this;

  /**
   * @mixin
   */
  public readonly setRandomPosition: (x?: number, y?: number, width?: number, height?: number) => this;

  /**
   * @mixin
   */
  public readonly setRotation: (radians?: number) => this;

  /**
   * @mixin
   */
  public readonly setAngle: (degrees?: number) => this;

  /**
   * @mixin
   */
  public readonly setScale: (x: number, y?: number) => this;

  /**
   * @mixin
   */
  public readonly setX: (value?: number) => this;

  /**
   * @mixin
   */
  public readonly setY: (value?: number) => this;

  /**
   * @mixin
   */
  public readonly setZ: (value?: number) => this;

  /**
   * @mixin
   */
  public readonly setW: (value?: number) => this;

  /**
   * @mixin
   */
  public readonly getLocalTransformMatrix: (
    tempMatrix?: Phaser.GameObjects.Components.TransformMatrix
  ) => Phaser.GameObjects.Components.TransformMatrix;

  /**
   * @mixin
   */
  public readonly getWorldTransformMatrix: (
    tempMatrix?: Phaser.GameObjects.Components.TransformMatrix,
    parentMatrix?: Phaser.GameObjects.Components.TransformMatrix
  ) => Phaser.GameObjects.Components.TransformMatrix;

  /**
   * @mixin
   */
  public readonly getLocalPoint: (
    x: number,
    y: number,
    point?: Phaser.Math.Vector2,
    camera?: Phaser.Cameras.Scene2D.Camera
  ) => Phaser.Math.Vector2;

  /**
   * @mixin
   */
  public readonly getParentRotation: () => number;

  /**
   * @mixin
   */
  public readonly setVisible: (value: boolean) => this;

  /**
   * @mixin
   */
  public alpha: number;

  /**
   * @mixin
   */
  public alphaTopLeft: number;

  /**
   * @mixin
   */
  public alphaTopRight: number;

  /**
   * @mixin
   */
  public alphaBottomLeft: number;

  /**
   * @mixin
   */
  public alphaBottomRight: number;

  /**
   * @mixin
   */
  public blendMode: string | Phaser.BlendModes;

  /**
   * @mixin
   */
  public width: number;

  /**
   * @mixin
   */
  public height: number;

  /**
   * @mixin
   */
  public displayWidth: number;

  /**
   * @mixin
   */
  public displayHeight: number;

  /**
   * @mixin
   */
  public depth: number;

  /**
   * @mixin
   */
  public flipX: boolean;

  /**
   * @mixin
   */
  public flipY: boolean;

  /**
   * @mixin
   */
  public originX: number;

  /**
   * @mixin
   */
  public originY: number;

  /**
   * @mixin
   */
  public displayOriginX: number;

  /**
   * @mixin
   */
  public displayOriginY: number;

  /**
   * @mixin
   */
  public defaultPipeline: Phaser.Renderer.WebGL.WebGLPipeline;

  /**
   * @mixin
   */
  public pipeline: Phaser.Renderer.WebGL.WebGLPipeline;

  /**
   * @mixin
   */
  public hasPostPipeline: boolean;

  /**
   * @mixin
   */
  public postPipeline: Phaser.Renderer.WebGL.Pipelines.PostFXPipeline[];

  /**
   * @mixin
   */
  public pipelineData: object;

  /**
   * @mixin
   */
  public scrollFactorX: number;

  /**
   * @mixin
   */
  public scrollFactorY: number;

  /**
   * @mixin
   */
  public x: number;

  /**
   * @mixin
   */
  public y: number;

  /**
   * @mixin
   */
  public z: number;

  /**
   * @mixin
   */
  public w: number;

  /**
   * @mixin
   */
  public scale: number;

  /**
   * @mixin
   */
  public scaleX: number;

  /**
   * @mixin
   */
  public scaleY: number;

  /**
   * @mixin
   */
  public angle: number;

  /**
   * @mixin
   */
  public rotation: number;

  /**
   * @mixin
   */
  public visible: boolean;

  /**
   * The GlyphTilemapLayerData associated with this layer.
   * GlyphTilemapLayerData can only be associated with one glyphmap layer.
   */
  public layer: GlyphTilemapLayerData;

  /**
   * An array of `GlyphTileset` objects associated with this layer.
   */
  public glyphset: GlyphTileset[] = [];

  /**
   * The total number of tiles drawn by the renderer in the last frame.
   */
  public tilesDrawn = 0;

  /**
   * The total number of tiles in this layer. Updated every frame.
   */
  public tilesTotal: number;

  /**
   * You can control if the camera should cull tiles on this layer before rendering them or not.
   *
   * By default the camera will try to cull the tiles in this layer, to avoid over-drawing to the renderer.
   *
   * However, there are some instances when you may wish to disable this, and toggling this flag allows
   * you to do so. Also see `setSkipCull` for a chainable method that does the same thing.
   */
  public skipCull = false;

  /**
   * The amount of extra tiles to add into the cull rectangle when calculating its horizontal size.
   *
   * See the method `setCullPadding` for more details.
   */
  public cullPaddingX = 1;

  /**
   * The amount of extra tiles to add into the cull rectangle when calculating its vertical size.
   *
   * See the method `setCullPadding` for more details.
   */
  public cullPaddingY = 1;

  /**
   * An array holding the mapping between the tile indexes and the glyphset they belong to.
   */
  public gidMap: GlyphTileset[] = [];

  /**
   * Instantiate glyphmap layer.
   *
   * @param scene The Scene to which this Game Object belongs.
   * @param glyphmap The GlyphTilemap this layer is a part of.
   * @param layerIndex The index of the GlyphTilemapLayerData associated with this layer.
   * @param glyphset The glyphset, or an array of glyphsets, used to render this layer. Can be a string or a GlyphTileset object.
   * @param x The world x position where the top left of this layer will be placed.
   * @param y The world y position where the top left of this layer will be placed.
   */
  public constructor(
    scene: Phaser.Scene,
    public glyphmap: GlyphTilemap,
    public layerIndex: number,
    glyphset: string | string[] | GlyphTileset | GlyphTileset[],
    x = 0,
    y = 0
  ) {
    super(scene, 'GlyphmapLayer');

    this.layer = glyphmap.layers[layerIndex];

    this.layer.glyphmapLayer = this;

    this.tilesTotal = this.layer.width * this.layer.height;

    this.setGlyphsets(glyphset);
    this.setAlpha(this.layer.alpha);
    this.setPosition(x, y);
    this.setOrigin();
    this.setSize(this.layer.widthInPixels, this.layer.heightInPixels);

    this.initPipeline(undefined);
  }

  /**
   * Returns the tiles in the given layer that are within the cameras viewport.
   * This is used internally during rendering.
   *
   * @param camera The Camera to run the cull check against.
   */
  public cull(camera: Phaser.Cameras.Scene2D.Camera): GlyphTile[] {
    return GlyphTilemapComponents.cullTiles(this.layer, camera, this.culledTiles);
  }

  /**
   * Copies the tiles in the source rectangular area to a new destination (all specified in tile
   * coordinates) within the layer. This copies all tile properties & recalculates collision
   * information in the destination region.
   *
   * @param srcTileX The x coordinate of the area to copy from, in tiles, not pixels.
   * @param srcTileY The y coordinate of the area to copy from, in tiles, not pixels.
   * @param width The width of the area to copy, in tiles, not pixels.
   * @param height The height of the area to copy, in tiles, not pixels.
   * @param destTileX The x coordinate of the area to copy to, in tiles, not pixels.
   * @param destTileY The y coordinate of the area to copy to, in tiles, not pixels.
   * @return This GlyphTilemap Layer object.
   */
  public copy(
    srcTileX: number,
    srcTileY: number,
    width: number,
    height: number,
    destTileX: number,
    destTileY: number
  ): this {
    GlyphTilemapComponents.copy(srcTileX, srcTileY, width, height, destTileX, destTileY, this.layer);
    return this;
  }

  /**
   * Sets the tiles in the given rectangular area (in tile coordinates) of the layer with the
   * specified index. Tiles will be set to collide if the given index is a colliding index.
   * Collision information in the region will be recalculated.
   *
   * @param index The tile index to fill the area with.
   * @param tileX The left most tile index (in tile coordinates) to use as the origin of the area.
   * @param tileY The top most tile index (in tile coordinates) to use as the origin of the area.
   * @param width How many tiles wide from the `tileX` index the area will be.
   * @param height How many tiles tall from the `tileY` index the area will be.
   * @return This GlyphTilemap Layer object.
   */
  public fill(index: number, tileX: number, tileY: number, width: number, height: number): this {
    GlyphTilemapComponents.fill(index, tileX, tileY, width, height, this.layer);
    return this;
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
   */
  public filterTiles(
    callback: (value: GlyphTile, index: number, array: GlyphTile[]) => boolean,
    context: unknown,
    tileX: number,
    tileY: number,
    width: number,
    height: number,
    options?: GlyphTilemapComponents.FilteringOptions
  ): GlyphTile[] {
    return GlyphTilemapComponents.filterTiles(callback, context, tileX, tileY, width, height, options, this.layer);
  }

  /**
   * Searches the entire map layer for the first tile matching the given index, then returns that Tile
   * object. If no match is found, it returns null. The search starts from the top-left tile and
   * continues horizontally until it hits the end of the row, then it drops down to the next column.
   * If the reverse boolean is true, it scans starting from the bottom-right corner traveling up to
   * the top-left.
   *
   * @param index The tile index value to search for.
   * @param skip The number of times to skip a matching tile before returning.
   * @param reverse If true it will scan the layer in reverse, starting at the bottom-right. Otherwise it scans from the top-left.
   */
  public findByIndex(index: number, skip = 0, reverse = false): GlyphTile {
    return GlyphTilemapComponents.findByIndex(index, skip, reverse, this.layer);
  }

  /**
   * Find the first tile in the given rectangular area (in tile coordinates) of the layer that
   * satisfies the provided testing function. I.e. finds the first tile for which `callback` returns
   * true. Similar to Array.prototype.find in vanilla JS.
   *
   * @param callback The callback. Each tile in the given area will be passed to this callback as the first and only parameter.
   * @param context The context under which the callback should be run.
   * @param tileX The left most tile index (in tile coordinates) to use as the origin of the area to search.
   * @param tileY The top most tile index (in tile coordinates) to use as the origin of the area to search.
   * @param width How many tiles wide from the `tileX` index the area will be.
   * @param height How many tiles tall from the `tileY` index the area will be.
   * @param options Optional filters to apply when getting the tiles.
   */
  public findTile(
    callback: (value: GlyphTile, index: number, array: GlyphTile[]) => boolean,
    context: unknown,
    tileX: number,
    tileY: number,
    width: number,
    height: number,
    options?: GlyphTilemapComponents.FilteringOptions
  ): GlyphTile {
    return GlyphTilemapComponents.findTile(callback, context, tileX, tileY, width, height, options, this.layer);
  }

  /**
   * For each tile in the given rectangular area (in tile coordinates) of the layer, run the given
   * callback. Similar to Array.prototype.forEach in vanilla JS.
   *
   * @param callback The callback. Each tile in the given area will be passed to this callback as the first and only parameter.
   * @param context The context, or scope, under which the callback should be run.
   * @param tileX The left most tile index (in tile coordinates) to use as the origin of the area to search.
   * @param tileY The top most tile index (in tile coordinates) to use as the origin of the area to search.
   * @param width How many tiles wide from the `tileX` index the area will be.
   * @param height How many tiles tall from the `tileY` index the area will be.
   * @param options Optional filters to apply when getting the tiles.
   * @return This GlyphTilemap Layer object.
   */
  public forEachTile(
    callback: (value: GlyphTile, index: number, array: GlyphTile[]) => void,
    context: unknown,
    tileX: number,
    tileY: number,
    width: number,
    height: number,
    options?: GlyphTilemapComponents.FilteringOptions
  ): this {
    GlyphTilemapComponents.forEachTile(callback, context, tileX, tileY, width, height, options, this.layer);
    return this;
  }

  /**
   * Gets a tile at the given tile coordinates from the given layer.
   *
   * @method Phaser.Tilemaps.TilemapLayer#getTileAt
   * @since 3.50.0
   *
   * @param tileX X position to get the tile from (given in tile units, not pixels).
   * @param tileY Y position to get the tile from (given in tile units, not pixels).
   * @param nonNull If true getTile won't return null for empty tiles, but a Tile object with an index of -1.
   * @return The GlyphTile at the given coordinates or null if no tile was found or the coordinates were invalid.
   */
  public getTileAt(tileX: number, tileY: number, nonNull = false): GlyphTile {
    return GlyphTilemapComponents.getTileAt(tileX, tileY, nonNull, this.layer);
  }

  /**
   * Gets a tile at the given world coordinates from the given layer.
   *
   * @param worldX X position to get the tile from (given in pixels)
   * @param worldY Y position to get the tile from (given in pixels)
   * @param nonNull If true, function won't return null for empty tiles, but a Tile object with an index of -1.
   * @param camera The Camera to use when calculating the tile index from the world values.
   * @return The tile at the given coordinates or null if no tile was found or the coordinates were invalid.
   */
  public getTileAtWorldXY(
    worldX: number,
    worldY: number,
    nonNull = false,
    camera: Phaser.Cameras.Scene2D.Camera
  ): GlyphTile {
    return GlyphTilemapComponents.getTileAtWorldXY(worldX, worldY, nonNull, camera, this.layer);
  }

  /**
   * Gets the tiles in the given rectangular area (in tile coordinates) of the layer.
   *
   * @param tileX The left most tile index (in tile coordinates) to use as the origin of the area.
   * @param tileY The top most tile index (in tile coordinates) to use as the origin of the area.
   * @param width How many tiles wide from the `tileX` index the area will be.
   * @param height How many tiles tall from the `tileY` index the area will be.
   * @param options Optional filters to apply when getting the tiles.
   * @return An array of GlyphTile objects found within the area.
   */
  public getTilesWithin(
    tileX: number,
    tileY: number,
    width: number,
    height: number,
    options?: GlyphTilemapComponents.FilteringOptions
  ): GlyphTile[] {
    return GlyphTilemapComponents.getTilesWithin(tileX, tileY, width, height, options, this.layer);
  }

  /**
   * Gets the tiles that overlap with the given shape in the given layer. The shape must be a Circle,
   * Line, Rectangle or Triangle. The shape should be in world coordinates.
   *
   * @param shape A shape in world (pixel) coordinates
   * @param options Optional filters to apply when getting the tiles.
   * @param camera The Camera to use when factoring in which tiles to return.
   */
  public getTilesWithinShape(
    shape: Phaser.Geom.Circle | Phaser.Geom.Line | Phaser.Geom.Rectangle | Phaser.Geom.Triangle,
    options: GlyphTilemapComponents.FilteringOptions,
    camera: Phaser.Cameras.Scene2D.Camera
  ): GlyphTile[] {
    return GlyphTilemapComponents.getTilesWithinShape(shape, options, camera, this.layer);
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
   */
  public getTilesWithinWorldXY(
    worldX: number,
    worldY: number,
    width: number,
    height: number,
    options: GlyphTilemapComponents.FilteringOptions,
    camera: Phaser.Cameras.Scene2D.Camera
  ): GlyphTile[] {
    return GlyphTilemapComponents.getTilesWithinWorldXY(worldX, worldY, width, height, options, camera, this.layer);
  }

  /**
   * Checks if there is a tile at the given location (in tile coordinates) in the given layer. Returns
   * false if there is no tile or if the tile at that location has an index of -1.
   *
   * @param tileX The x coordinate, in tiles, not pixels.
   * @param tileY The y coordinate, in tiles, not pixels.
   */
  public hasTileAt(tileX: number, tileY: number): boolean {
    return GlyphTilemapComponents.hasTileAt(tileX, tileY, this.layer);
  }

  /**
   * Checks if there is a tile at the given location (in world coordinates) in the given layer. Returns
   * false if there is no tile or if the tile at that location has an index of -1.
   *
   * @param worldX The x coordinate, in pixels.
   * @param worldY The y coordinate, in pixels.
   * @param camera The Camera to use when factoring in which tiles to return.
   */
  public hasTileAtWorldXY(worldX: number, worldY: number, camera: Phaser.Cameras.Scene2D.Camera): boolean {
    return GlyphTilemapComponents.hasTileAtWorldXY(worldX, worldY, camera, this.layer);
  }

  /**
   * Puts a tile at the given tile coordinates in the specified layer. You can pass in either an index
   * or a GlyphTile object. If you pass in a GlyphTile, all attributes will be copied over to the specified
   * location. If you pass in an index, only the index at the specified location will be changed.
   *
   * @param tile - The index of this tile to set or a Tile object.
   * @param tileX - The x coordinate, in tiles, not pixels.
   * @param tileY - The y coordinate, in tiles, not pixels.
   * @return The GlyphTile object that was inserted at the given coordinates.
   */
  public putTileAt(tile: number | GlyphTile, tileX: number, tileY: number): GlyphTile {
    return GlyphTilemapComponents.putTileAt(tile, tileX, tileY, this.layer);
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
   * @param camera] The Camera to use when calculating the tile index from the world values.
   * @return The GlyphTile object that was inserted at the given coordinates.
   */
  public putTileAtWorldXY(
    tile: number | GlyphTile,
    worldX: number,
    worldY: number,
    camera: Phaser.Cameras.Scene2D.Camera
  ): GlyphTile {
    return GlyphTilemapComponents.putTileAtWorldXY(tile, worldX, worldY, camera, this.layer);
  }

  /**
   * Puts an array of tiles or a 2D array of tiles at the given tile coordinates in the specified
   * layer. The array can be composed of either tile indexes or GlyphTile objects. If you pass in a GlyphTile,
   * all attributes will be copied over to the specified location. If you pass in an index, only the
   * index at the specified location will be changed. Collision information will be recalculated
   * within the region tiles were changed.
   *
   * @param tiles A row (array) or grid (2D array) of GlyphTiles or tile indexes to place.
   * @param tileX The x coordinate, in tiles, not pixels.
   * @param tileY The y coordinate, in tiles, not pixels.
   * @return This GlyphTilemap Layer object.
   */
  public putTilesAt(tiles: number[] | number[][] | GlyphTile[] | GlyphTile[][], tileX: number, tileY: number): this {
    GlyphTilemapComponents.putTilesAt(tiles, tileX, tileY, this.layer);
    return this;
  }

  /**
   * Randomizes the indexes of a rectangular region of tiles (in tile coordinates) within the
   * specified layer. Each tile will receive a new index. If an array of indexes is passed in, then
   * those will be used for randomly assigning new tile indexes. If an array is not provided, the
   * indexes found within the region (excluding -1) will be used for randomly assigning new tile
   * indexes. This method only modifies tile indexes.
   *
   * @param tileX The left most tile index (in tile coordinates) to use as the origin of the area.
   * @param tileY The top most tile index (in tile coordinates) to use as the origin of the area.
   * @param width How many tiles wide from the `tileX` index the area will be.
   * @param height How many tiles tall from the `tileY` index the area will be.
   * @param indexes An array of indexes to randomly draw from during randomization.
   * @return This GlyphTilemap Layer object.
   */
  public randomize(tileX: number, tileY: number, width: number, height: number, indexes: number[]): this {
    GlyphTilemapComponents.randomize(tileX, tileY, width, height, indexes, this.layer);
    return this;
  }

  /**
   * Removes the tile at the given tile coordinates in the specified layer and updates the layers
   * collision information.
   *
   * @param tileX The x coordinate, in tiles, not pixels.
   * @param tileY The y coordinate, in tiles, not pixels.
   * @param replaceWithNull If true, this will replace the tile at the specified location with null instead of a GlyphTile with an index of -1.
   * @return A GlyphTile object.
   */
  public removeTileAt(tileX: number, tileY: number, replaceWithNull = true): GlyphTile {
    return GlyphTilemapComponents.removeTileAt(tileX, tileY, replaceWithNull, this.layer);
  }

  /**
   * Removes the tile at the given world coordinates in the specified layer and updates the layers
   * collision information.
   *
   * @param worldX The x coordinate, in pixels.
   * @param worldY The y coordinate, in pixels.
   * @param replaceWithNull If true, this will replace the tile at the specified location with null instead of a GlyphTile with an index of -1.
   * @param camera The Camera to use when calculating the tile index from the world values.
   * @return The GlyphTile object that was removed from the given location.
   */
  public removeTileAtWorldXY(
    worldX: number,
    worldY: number,
    replaceWithNull = true,
    camera: Phaser.Cameras.Scene2D.Camera
  ): GlyphTile {
    return GlyphTilemapComponents.removeTileAtWorldXY(worldX, worldY, replaceWithNull, camera, this.layer);
  }

  /**
   * Draws a debug representation of the layer to the given Graphics. This is helpful when you want to
   * get a quick idea of which of your tiles are colliding and which have interesting faces. The tiles
   * are drawn starting at (0, 0) in the Graphics, allowing you to place the debug representation
   * wherever you want on the screen.
   *
   * @param graphics The target Graphics object to draw upon.
   * @param styleConfig An object specifying the colors to use for the debug drawing.
   * @return This GlyphTilemap Layer object.
   */
  public renderDebug(graphics: Phaser.GameObjects.Graphics, styleConfig: Phaser.Types.Tilemaps.StyleConfig): this {
    GlyphTilemapComponents.renderDebug(graphics, styleConfig, this.layer);
    return this;
  }

  /**
   * Scans the given rectangular area (given in tile coordinates) for tiles with an index matching
   * `findIndex` and updates their index to match `newIndex`. This only modifies the index.
   *
   * @param findIndex The index of the tile to search for.
   * @param newIndex The index of the tile to replace it with.
   * @param tileX The left most tile index (in tile coordinates) to use as the origin of the area.
   * @param tileY The top most tile index (in tile coordinates) to use as the origin of the area.
   * @param width How many tiles wide from the `tileX` index the area will be.
   * @param height How many tiles tall from the `tileY` index the area will be.
   * @return This GlyphTilemap Layer object.
   */
  public replaceByIndex(
    findIndex: number,
    newIndex: number,
    tileX: number,
    tileY: number,
    width: number,
    height: number
  ): this {
    GlyphTilemapComponents.replaceByIndex(findIndex, newIndex, tileX, tileY, width, height, this.layer);
    return this;
  }

  /**
   * You can control if the Cameras should cull tiles before rendering them or not.
   *
   * By default the camera will try to cull the tiles in this layer, to avoid over-drawing to the renderer.
   *
   * However, there are some instances when you may wish to disable this.
   *
   * @param value Set to `true` to stop culling tiles. Set to `false` to enable culling again.
   * @return This GlyphTilemap Layer object.
   */
  public setSkipCull(value = true): this {
    this.skipCull = value;
    return this;
  }

  /**
   * When a Camera culls the tiles in this layer it does so using its view into the world, building up a
   * rectangle inside which the tiles must exist or they will be culled. Sometimes you may need to expand the size
   * of this 'cull rectangle', especially if you plan on rotating the Camera viewing the layer. Do so
   * by providing the padding values. The values given are in tiles, not pixels. So if the tile width was 32px
   * and you set `paddingX` to be 4, it would add 32px x 4 to the cull rectangle (adjusted for scale)
   *
   * @param paddingX The amount of extra horizontal tiles to add to the cull check padding.
   * @param paddingY The amount of extra vertical tiles to add to the cull check padding.
   * @return This GlyphTilemap Layer object.
   */
  public setCullPadding(paddingX = 1, paddingY = 1): this {
    this.cullPaddingX = paddingX;
    this.cullPaddingY = paddingY;
    return this;
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
   * @return This GlyphTilemap Layer object.
   */
  public shuffle(tileX: number, tileY: number, width: number, height: number): this {
    GlyphTilemapComponents.shuffle(tileX, tileY, width, height, this.layer);
    return this;
  }

  /**
   * Scans the given rectangular area (given in tile coordinates) for tiles with an index matching
   * `indexA` and swaps then with `indexB`. This only modifies the index and does not change collision
   * information.
   *
   * @param tileA First tile index.
   * @param tileB Second tile index.
   * @param tileX The left most tile index (in tile coordinates) to use as the origin of the area.
   * @param tileY The top most tile index (in tile coordinates) to use as the origin of the area.
   * @param width How many tiles wide from the `tileX` index the area will be.
   * @param height How many tiles tall from the `tileY` index the area will be.
   * @return This GlyphTilemap Layer object.
   */
  public swapByIndex(
    indexA: number,
    indexB: number,
    tileX: number,
    tileY: number,
    width: number,
    height: number
  ): this {
    GlyphTilemapComponents.swapByIndex(indexA, indexB, tileX, tileY, width, height, this.layer);
    return this;
  }

  /**
   * Converts from tile X coordinates (tile units) to world X coordinates (pixels), factoring in the
   * layers position, scale and scroll.
   *
   * @param tileX The x coordinate, in tiles, not pixels.
   * @param camera The Camera to use when calculating the tile index from the world values.
   * @return The GlyphTile X coordinate converted to pixels.
   */
  public tileToWorldX(tileX: number, camera: Phaser.Cameras.Scene2D.Camera): number {
    return this.glyphmap.tileToWorldX(tileX, camera, this);
  }

  /**
   * Converts from tile Y coordinates (tile units) to world Y coordinates (pixels), factoring in the
   * layers position, scale and scroll.
   *
   * @param tileY The y coordinate, in tiles, not pixels.
   * @param camera The Camera to use when calculating the tile index from the world values.
   * @return The GlyphTile Y coordinate converted to pixels.
   */
  public tileToWorldY(tileY: number, camera: Phaser.Cameras.Scene2D.Camera): number {
    return this.glyphmap.tileToWorldY(tileY, camera, this);
  }

  /**
   * Converts from tile XY coordinates (tile units) to world XY coordinates (pixels), factoring in the
   * layers position, scale and scroll. This will return a new Vector2 object or update the given
   * `point` object.
   *
   * @param tileX The x coordinate, in tiles, not pixels.
   * @param tileY The y coordinate, in tiles, not pixels.
   * @param point A Vector2 to store the coordinates in. If not given a new Vector2 is created.
   * @param camera The Camera to use when calculating the tile index from the world values.
   */
  public tileToWorldXY(
    tileX: number,
    tileY: number,
    point: Phaser.Math.Vector2,
    camera: Phaser.Cameras.Scene2D.Camera
  ): Phaser.Math.Vector2 {
    return this.glyphmap.tileToWorldXY(tileX, tileY, point, camera, this);
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
   * @param weightedIndexes An array of objects to randomly draw from during randomization.
   * They should be in the form: { index: 0, weight: 4 } or { index: [0, 1], weight: 4 }
   * if you wish to draw from multiple tile indexes.
   * @param tileX The left most tile index (in tile coordinates) to use as the origin of the area.
   * @param tileY The top most tile index (in tile coordinates) to use as the origin of the area.
   * @param width How many tiles wide from the `tileX` index the area will be.
   * @param height How many tiles tall from the `tileY` index the area will be.
   * @return This GlyphTilemap Layer object.
   */
  public weightedRandomize(
    weightedIndexes: { index: number | number[]; weight: number }[],
    tileX: number,
    tileY: number,
    width: number,
    height: number
  ): this {
    GlyphTilemapComponents.weightedRandomize(tileX, tileY, width, height, weightedIndexes, this.layer);
    return this;
  }

  /**
   * Converts from world X coordinates (pixels) to tile X coordinates (tile units), factoring in the
   * layers position, scale and scroll.
   *
   * @param worldX The x coordinate to be converted, in pixels, not tiles.
   * @param snapToFloor Whether or not to round the tile coordinate down to the nearest integer.
   * @param camera The Camera to use when calculating the tile index from the world values.
   */
  public worldToTileX(worldX: number, snapToFloor: boolean, camera: Phaser.Cameras.Scene2D.Camera): number {
    return this.glyphmap.worldToTileX(worldX, snapToFloor, camera, this);
  }

  /**
   * Converts from world Y coordinates (pixels) to tile Y coordinates (tile units), factoring in the
   * layers position, scale and scroll.
   *
   * @param worldY The y coordinate to be converted, in pixels, not tiles.
   * @param snapToFloor Whether or not to round the tile coordinate down to the nearest integer.
   * @param camera The Camera to use when calculating the tile index from the world values.
   */
  public worldToTileY(worldY: number, snapToFloor: boolean, camera: Phaser.Cameras.Scene2D.Camera): number {
    return this.glyphmap.worldToTileY(worldY, snapToFloor, camera, this);
  }

  /**
   * Converts from world XY coordinates (pixels) to tile XY coordinates (tile units), factoring in the
   * layers position, scale and scroll. This will return a new Vector2 object or update the given
   * `point` object.
   *
   * @param worldX The x coordinate to be converted, in pixels, not tiles.
   * @param worldY The y coordinate to be converted, in pixels, not tiles.
   * @param snapToFloor Whether or not to round the tile coordinate down to the nearest integer.
   * @param point A Vector2 to store the coordinates in. If not given a new Vector2 is created.
   * @param camera The Camera to use when calculating the tile index from the world values.
   */
  public worldToTileXY(
    worldX: number,
    worldY: number,
    snapToFloor: boolean,
    point: Phaser.Math.Vector2,
    camera: Phaser.Cameras.Scene2D.Camera
  ): Phaser.Math.Vector2 {
    return this.glyphmap.worldToTileXY(worldX, worldY, snapToFloor, point, camera, this);
  }

  /**
   * Destroys this GlyphmapLayer and removes its link to the associated GlyphmapLayerData.
   *
   * @param removeFromGlyphmap Remove this layer from the parent Glyphmap?
   */
  public destroy(removeFromGlyphmap = true): void {
    if (!this.glyphmap) {
      //  Abort, we've already been destroyed
      return;
    }

    //  Uninstall this layer only if it is still installed on the GlyphmapLayerData object
    if (this.layer.glyphmapLayer === this) {
      this.layer.glyphmapLayer = undefined;
    }

    if (removeFromGlyphmap) {
      this.glyphmap.removeLayer(this);
    }

    this.glyphmap = undefined;
    this.layer = undefined;
    this.culledTiles.length = 0;

    this.gidMap = [];
    this.glyphset = [];

    super.destroy();
  }

  /**
   * Populates the internal `glyphset` array with the Glyphset references this layer requires for rendering.
   *
   * @param glyphset The glyphset, or an array of glyphsets, used to render this layer. Can be a string or a Glyphset object.
   */
  private setGlyphsets(glyphsets: string | string[] | GlyphTileset | GlyphTileset[]): void {
    const gidMap = [];
    const setList = [];
    const map = this.glyphmap;

    const normalizedGlyphsets = Array.isArray(glyphsets) ? glyphsets : [glyphsets];

    for (let i = 0; i < normalizedGlyphsets.length; i++) {
      let glyphset = normalizedGlyphsets[i];

      if (typeof glyphset === 'string') {
        glyphset = map.getGlyphset(glyphset);
      }

      if (glyphset) {
        setList.push(glyphset);

        const s = glyphset.firstgid;

        for (let t = 0; t < glyphset.total; t++) {
          gidMap[s + t] = glyphset;
        }
      }
    }

    this.gidMap = gidMap;
    this.glyphset = setList;
  }
}
