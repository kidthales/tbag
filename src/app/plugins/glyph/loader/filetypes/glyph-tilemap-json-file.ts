import { glyphTilemapCustomCacheKey } from '../../cache';
import { GlyphTilemap } from '../../tilemaps';

export interface GlyphTilemapJSONFileConfig {
  key: string;
  url?: string | object;
  xhrSetting?: Phaser.Types.Loader.XHRSettingsObject;
}

export type GlyphTilemapJSONFileLoader = { [GlyphTilemap.key]: typeof GlyphTilemapJSONFile.callback };

export type LoaderPluginWithGlyphTilemapJSONFile = Phaser.Loader.LoaderPlugin & GlyphTilemapJSONFileLoader;

export class GlyphTilemapJSONFile extends Phaser.Loader.FileTypes.JSONFile {
  public static readonly callback = function glyphTilemapJSONFileCallback(
    key: string | GlyphTilemapJSONFileConfig[],
    url?: string | object,
    xhrSettings?: Phaser.Types.Loader.XHRSettingsObject
  ) {
    if (Array.isArray(key)) {
      for (var i = 0; i < key.length; i++) {
        //  If it's an array it has to be an array of Objects, so we get everything out of the 'key' object
        this.addFile(new GlyphTilemapJSONFile(this, key[i]));
      }
    } else {
      this.addFile(new GlyphTilemapJSONFile(this, key, url, xhrSettings));
    }

    return this;
  };

  public constructor(
    loader: Phaser.Loader.LoaderPlugin,
    key: string | GlyphTilemapJSONFileConfig,
    url?: string | object,
    xhrSettings?: Phaser.Types.Loader.XHRSettingsObject
  ) {
    super(loader, key, url, xhrSettings);

    this.cache = loader.cacheManager.custom[glyphTilemapCustomCacheKey];
    this.type = 'glyphmapJSON';
  }
}
