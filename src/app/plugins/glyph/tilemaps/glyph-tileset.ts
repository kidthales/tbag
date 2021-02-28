import { Font, FontLike } from '../utils';
import { Glyph, GlyphVector } from '../glyph';

/**
 * Maintains index of glyphs.
 */
export class GlyphTileset {
  /**
   * Glyph index.
   */
  protected readonly glyphs: Glyph[];

  /**
   * Font shared by glyphs in this glyphset.
   */
  protected readonly font: Font;

  /**
   * Instantiate glyphset.
   *
   * @param name The name of the glyphset in the map data.
   * @param firstgid The first glyph index this glyphset contains.
   * @param font Glyph font.
   * @param glyphs Index of minimal glyph data [ch, fg, bg].
   */
  public constructor(
    public readonly name: string,
    public readonly firstgid: number,
    font: FontLike,
    glyphs: GlyphVector[]
  ) {
    this.font = Font.normalize(font);
    this.glyphs = glyphs.map(([ch, fg, bg]) => new Glyph(ch, fg, bg, this.font));
  }

  /**
   * The total number of glyphs in the glyphset.
   */
  public get total(): number {
    return this.glyphs.length;
  }

  /**
   * Returns true if and only if this glyphset contains the given glyph index.
   *
   * @param index The unique id of the glyph across all glyphsets in the map.
   */
  public containsGlyphIndex(index: number): boolean {
    return index >= this.firstgid && index < this.firstgid + this.total;
  }

  /**
   * Returns the glyph in the glyphset for the given glyph index.
   * Returns null if glyph index is not contained in this glyphset.
   *
   * @param index  The unique id of the glyph across all glyphsets in the map.
   */
  public getGlyph(index: number): Glyph {
    if (!this.containsGlyphIndex(index)) {
      return null;
    }

    return this.glyphs[index - this.firstgid];
  }
}
