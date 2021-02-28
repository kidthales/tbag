import { GameObjectComponents } from '../gameobjects';
import { Mixin } from '../utils';

import { GlyphTilemapLayer, GlyphTilemapLayerData } from './glyph-tilemap-layer';

/**
 * A GlyphTile is a representation of a single tile within the GlyphTilemap. This is a lightweight data
 * representation, so its position information is stored without factoring in scroll, layer
 * scale or layer position.
 */
@Mixin([GameObjectComponents.Visible])
export class GlyphTile implements Phaser.GameObjects.Components.Visible {
  /**
   * @mixin
   */
  public readonly setVisible: (value: boolean) => this;

  /**
   * @mixin
   */
  public visible: boolean;

  /**
   * Instantiate glyph tile.
   *
   * @param layer The GlyphTilemapLayerData object in the GlyphTilemap that this tile belongs to.
   * @param index The unique index of this tile within the map.
   * @param x The x coordinate of this tile in tile coordinates.
   * @param y The y coordinate of this tile in tile coordinates.
   */
  public constructor(
    public readonly layer: GlyphTilemapLayerData,
    public index: number,
    public x: number,
    public y: number
  ) {}

  /**
   * Width of the tile in pixels.
   */
  public get width(): number {
    return this.layer.tileWidth;
  }

  /**
   * Height of the tile in pixels.
   */
  public get height(): number {
    return this.layer.tileHeight;
  }

  /**
   * The x coordinate of the top left of this tile in pixels. This is relative to the top left
   * of the layer this tile is being rendered within. This property does NOT factor in camera
   * scroll, layer scale or layer position.
   */
  public get pixelX(): number {
    return this.x * this.width;
  }

  /**
   * The y coordinate of the top left of this tile in pixels. This is relative to the top left
   * of the layer this tile is being rendered within. This property does NOT factor in camera
   * scroll, layer scale or layer position.
   */
  public get pixelY(): number {
    return this.y * this.height;
  }

  /**
   * The glyphmap layer that contains this GlyphTile. This will only return null if accessed from a
   * GlyphTilemapLayerData instance before the tile is placed within a GlyphTilemapLayer.
   */
  public get glyphmapLayer(): GlyphTilemapLayer {
    return this.layer.glyphmapLayer;
  }

  /**
   * Copies the tile data & properties from the given tile to this tile. This copies everything
   * except for position.
   *
   * @param tile The tile to copy from.
   */
  public copy(tile: GlyphTile): this {
    this.index = tile.index;
    return this;
  }
}
