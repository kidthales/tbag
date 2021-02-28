import { Font, FontArray, FontObject } from './utils';

export type GlyphVector = [string, string, string?];

export interface GlyphObject {
  ch: string;
  fg: string;
  bg?: string;
  font?: FontObject;
}

export type GlyphArray = [...GlyphVector, FontArray];

export type GlyphLike = Glyph | Glyph[] | GlyphObject | GlyphObject[] | GlyphArray | GlyphArray[];

export class Glyph {
  public static normalize(g: GlyphLike): Glyph | Glyph[] {
    if (g instanceof Glyph) {
      // Glyph
      return g;
    } else if (!Array.isArray(g)) {
      // GlyphObject
      return Glyph.fromObject(g);
    }

    if (!g.length) {
      return g as Glyph[];
    }

    const c = g[0];

    if (c instanceof Glyph) {
      // Glyph[]
      return g as Glyph[];
    } else if (typeof c === 'string') {
      // GlyphArray
      return Glyph.fromArray(g as GlyphArray);
    } else if (Array.isArray(c)) {
      // GlyphArray[]
      return (g as GlyphArray[]).map((v: GlyphArray) => Glyph.fromArray(v));
    }

    // GlyphObject[]
    return (g as GlyphObject[]).map((v) => Glyph.fromObject(v));
  }

  public static fromJson(j: string): Glyph {
    return Glyph.fromObject(JSON.parse(j));
  }

  public static fromObject(o: Partial<GlyphObject>): Glyph {
    const { ch, fg, bg, font } = o;
    return new Glyph(ch, fg, bg, Font.fromObject(font));
  }

  public static fromArray(a: GlyphArray): Glyph {
    const [ch, fg, bg, font] = a;
    return new Glyph(ch, fg, bg, Font.fromArray(font));
  }

  public static hash(g: GlyphLike): string {
    const n = Glyph.normalize(g);
    const glyphs = Array.isArray(n) ? n : [n];
    return glyphs.reduce((hash, glyph) => `${hash}${glyph.hash}`, '');
  }

  public static frameDimensions(g: Glyph | GlyphObject | GlyphArray): { width: number; height: number } {
    const glyph = (Glyph.normalize(g) as Glyph).clone;
    glyph.ch = 'W';
    return { width: glyph.metrics.width, height: glyph.font.size };
  }

  public constructor(public ch = '', public fg = '#fff', public bg?: string, public font = new Font()) {}

  public get clone(): Glyph {
    return Glyph.fromObject(this.object);
  }

  public get json(): string {
    return JSON.stringify(this.object);
  }

  public get object(): GlyphObject {
    const { ch, fg, bg, font } = this;
    return { ch, fg, bg, font: font.object };
  }

  public get array(): GlyphArray {
    const { ch, fg, bg, font } = this;
    return [ch, fg, bg, font.array];
  }

  public get hash(): string {
    const { ch, fg, bg, font } = this;
    return `${[ch, fg, bg || '', ...font.array].join('\0')}`;
  }

  public get metrics(): TextMetrics {
    const canvas = Phaser.Display.Canvas.CanvasPool.create(this);
    const ctx = canvas.getContext('2d');

    ctx.font = this.font.css;

    const metrics = ctx.measureText(this.ch);
    Phaser.Display.Canvas.CanvasPool.remove(canvas);

    return metrics;
  }
}
