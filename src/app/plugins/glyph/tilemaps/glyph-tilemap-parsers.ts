import { glyphTilemapCustomCacheKey } from '../cache';
import { GlyphVector } from '../glyph';
import { GlyphScene } from '../scene';
import { Font, FontLike } from '../utils';

import { GlyphTile } from './glyph-tile';
import { GlyphTilemap, GlyphTilemapData } from './glyph-tilemap';
import { GlyphTilemapLayerData } from './glyph-tilemap-layer';
import { GlyphTileset } from './glyph-tileset';

export function parseLayerData(name: string, data: number[][], font: Font, insertNull: boolean): GlyphTilemapLayerData {
  const layerData = new GlyphTilemapLayerData({ name, font });

  const tiles: GlyphTile[][] = [];
  const height = data.length;

  let width = 0;

  for (let y = 0; y < data.length; y++) {
    tiles[y] = [];

    const row = data[y];

    for (var x = 0; x < row.length; x++) {
      const tileIndex = parseInt((row[x] as unknown) as string, 10);

      if (isNaN(tileIndex) || tileIndex === -1) {
        tiles[y][x] = insertNull ? null : new GlyphTile(layerData, -1, x, y);
      } else {
        tiles[y][x] = new GlyphTile(layerData, tileIndex, x, y);
      }
    }

    if (width === 0) {
      width = row.length;
    }
  }

  layerData.data = tiles;

  layerData.width = width;
  layerData.height = height;
  layerData.widthInPixels = width * layerData.tileWidth;
  layerData.heightInPixels = height * layerData.tileHeight;

  return layerData;
}

export function parseGlyphsetData(name: string, glyphs: GlyphVector[], font: FontLike, gid: number): GlyphTileset {
  const normalizedFont = Font.clone(Font.normalize(font));
  return new GlyphTileset(name, gid, normalizedFont, glyphs);
}

export interface RawGlyphTilemapLayerData {
  name: string;
  data: number[][];
}

export interface RawGlyphTilesetData {
  name: string;
  glyphs: GlyphVector[];
}

export interface RawGlyphTilemapData {
  name: string;
  width: number;
  height: number;
  font: FontLike;
  layers: RawGlyphTilemapLayerData[];
  glyphsets: RawGlyphTilesetData[];
}

export function parseMapData(
  name: string,
  width: number,
  height: number,
  font: FontLike,
  layers: RawGlyphTilemapLayerData[],
  glyphsets: RawGlyphTilesetData[],
  insertNull?: boolean
): GlyphTilemapData {
  const normalizedFont = Font.clone(Font.normalize(font));

  const parsedLayers = layers.map(({ name, data }) => parseLayerData(name, data, normalizedFont, insertNull));

  let gid = 0;
  const parsedGlyphsets = glyphsets.map(({ name, glyphs }) => {
    const glyphset = parseGlyphsetData(name, glyphs, normalizedFont, gid);
    gid += glyphset.total;
    return glyphset;
  });

  return new GlyphTilemapData({
    name,
    width,
    height,
    font: normalizedFont,
    layers: parsedLayers,
    glyphsets: parsedGlyphsets
  });
}

export function parse(
  scene: Phaser.Scene,
  key?: string,
  width = 80,
  height = 25,
  font: FontLike = new Font(10, 'monospace'),
  layers?: RawGlyphTilemapLayerData[],
  glyphsets: RawGlyphTilesetData[] = [],
  insertNull = false
): GlyphTilemap {
  let mapData: GlyphTilemapData;

  if (Array.isArray(layers)) {
    const name = key !== undefined ? key : 'map';
    mapData = parseMapData(name, width, height, font, layers, glyphsets, insertNull);
  } else if (key !== undefined) {
    const glyphmapData = (scene as GlyphScene).cache.custom[glyphTilemapCustomCacheKey].get(key) as RawGlyphTilemapData;

    if (!glyphmapData) {
      console.warn(`No glyphmap data found for key: ${key}`);
    } else {
      mapData = parseMapData(
        glyphmapData.name,
        glyphmapData.width,
        glyphmapData.height,
        glyphmapData.font,
        glyphmapData.layers,
        glyphmapData.glyphsets,
        insertNull
      );
    }
  }

  if (!mapData) {
    mapData = parseMapData('map', width, height, font, [], glyphsets, insertNull);
  }

  return new GlyphTilemap(scene, mapData);
}
