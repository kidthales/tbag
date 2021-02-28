import { glyphTilemapCustomCacheKey } from '../cache';
import { GlyphSprite } from '../gameobjects';
import { Glyph, GlyphLike } from '../glyph';
import { GlyphTilemapJSONFile } from '../loader';
import { GlyphTilemap } from '../tilemaps';
import { Font, FontLike } from '../utils';

export class GlyphPlugin extends Phaser.Plugins.BasePlugin {
  public static readonly key = 'glyphPlugin';

  public static readonly mapping = 'glyph';

  public static get pluginDefinition(): { key: string; plugin: typeof GlyphPlugin; mapping: string } {
    return {
      key: GlyphPlugin.key,
      plugin: GlyphPlugin,
      mapping: GlyphPlugin.mapping
    };
  }

  public constructor(pluginManager: Phaser.Plugins.PluginManager) {
    super(pluginManager);

    pluginManager.game.cache.addCustom(glyphTilemapCustomCacheKey);
    pluginManager.registerFileType(GlyphTilemap.key, GlyphTilemapJSONFile.callback);

    pluginManager.registerGameObject(...GlyphTilemap.gameObjectDefinition);
    pluginManager.registerGameObject(...GlyphSprite.gameObjectDefinition);
  }

  public getTexture(ch: string | GlyphLike, fg?: string, bg?: string, font?: FontLike): Phaser.Textures.Texture {
    let glyphs: Glyph[];

    if (typeof ch === 'string') {
      glyphs = [new Glyph(ch, fg, bg, Font.normalize(font))];
    } else {
      const n = Glyph.normalize(ch);
      glyphs = Array.isArray(n) ? n : [n];
    }

    const textureSystem = this.game.textures;

    if (!glyphs.length) {
      return textureSystem.get(undefined);
    }

    const key = Glyph.hash(glyphs);

    if (textureSystem.exists(key)) {
      return textureSystem.get(key);
    }

    return this.createTexture(key, glyphs);
  }

  protected createTexture(key: string, glyphs: Glyph[]): Phaser.Textures.Texture {
    const textureWidth = glyphs.reduce((width, glyph) => width + Glyph.frameDimensions(glyph).width, 0);
    const textureHeight = glyphs.reduce((max: number, { font: { size } }) => (size > max ? size : max), 0);

    const texture = this.game.textures.createCanvas(key, textureWidth, textureHeight);
    const ctx = texture.getContext();

    let frameX = 0;
    let frameY = 0;

    glyphs.forEach((glyph, index) => {
      const { width: frameWidth, height: frameHeight } = Glyph.frameDimensions(glyph);
      const chX = frameX + frameWidth / 2; // - 0.5;
      const chY = frameY + frameHeight / 2; // + 1;

      if (glyph.bg) {
        ctx.fillStyle = glyph.bg;
        ctx.fillRect(frameX, frameY, frameWidth, frameHeight);
      }

      ctx.font = glyph.font.css;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      ctx.fillStyle = glyph.fg;
      ctx.fillText(glyph.ch, chX, chY);

      texture.add(index, 0, frameX, frameY, frameWidth, frameHeight);

      frameX += frameWidth;
      frameY += 0;
    });

    texture.update();

    this.game.anims.create({ key, frames: key, defaultTextureKey: key, repeat: -1 });

    return texture;
  }
}
