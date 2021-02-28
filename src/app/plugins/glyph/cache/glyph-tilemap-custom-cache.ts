export const glyphTilemapCustomCacheKey = 'glyphmap';

export type GlyphTilemapCustomCache = { [glyphTilemapCustomCacheKey]: Phaser.Cache.BaseCache };

export type CustomCacheWithGlyphTilemapCustomCache = {
  custom: Record<string, Phaser.Cache.BaseCache> & GlyphTilemapCustomCache;
};

export type CacheManagerWithGlyphTilemapCustomCache = Phaser.Cache.CacheManager &
  CustomCacheWithGlyphTilemapCustomCache;
