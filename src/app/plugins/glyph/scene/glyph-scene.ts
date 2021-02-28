import { CacheManagerWithGlyphTilemapCustomCache } from '../cache';
import { GameObjectCreatorWithGlyphSprite, GameObjectFactoryWithGlyphSprite } from '../gameobjects';
import { LoaderPluginWithGlyphTilemapJSONFile } from '../loader';
import { GameObjectCreatorWithGlyphTilemap, GameObjectFactoryWithGlyphTilemap } from '../tilemaps';
import { GlyphPlugin } from '../plugins';

export type GlyphSceneGameObjectFactory = GameObjectFactoryWithGlyphSprite & GameObjectFactoryWithGlyphTilemap;

export type GlyphSceneGameObjectCreator = GameObjectCreatorWithGlyphSprite & GameObjectCreatorWithGlyphTilemap;

export type GlyphSceneCacheManager = CacheManagerWithGlyphTilemapCustomCache;

export type GlyphSceneLoaderPlugin = LoaderPluginWithGlyphTilemapJSONFile;

export interface GlyphScene extends Phaser.Scene {
  [GlyphPlugin.mapping]: GlyphPlugin;

  add: GlyphSceneGameObjectFactory;

  cache: GlyphSceneCacheManager;

  load: GlyphSceneLoaderPlugin;

  make: GlyphSceneGameObjectCreator;
}
