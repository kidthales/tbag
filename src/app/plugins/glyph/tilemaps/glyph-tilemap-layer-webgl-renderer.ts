import { GlyphTilemapLayer } from './glyph-tilemap-layer';

/**
 * Renders this Game Object with the WebGL Renderer to the given Camera.
 * The object will not render if any of its renderFlags are set or it is being actively filtered out by the Camera.
 * This method should not be called directly. It is a utility function for the Render module.
 *
 * @param renderer A reference to the current active WebGL renderer.
 * @param src The Game Object being rendered in this call.
 * @param camera The Camera that is rendering the Game Object.
 */
export default function renderWebGL(
  renderer: Phaser.Renderer.WebGL.WebGLRenderer,
  src: GlyphTilemapLayer,
  camera: Phaser.Cameras.Scene2D.Camera
): void {
  const renderTiles = src.cull(camera);

  const tileCount = renderTiles.length;
  const alpha = camera.alpha * src.alpha;

  if (tileCount === 0 || alpha <= 0) {
    return;
  }

  const gidMap = src.gidMap;
  const pipeline = renderer.pipelines.set(src.pipeline, src) as Phaser.Renderer.WebGL.Pipelines.MultiPipeline;

  const scrollFactorX = src.scrollFactorX;
  const scrollFactorY = src.scrollFactorY;

  const x = src.x;
  const y = src.y;

  const sx = src.scaleX;
  const sy = src.scaleY;

  const getTint = Phaser.Renderer.WebGL.Utils.getTintAppendFloatAlpha;

  renderer.pipelines.preBatch(src);

  for (let i = 0; i < tileCount; i++) {
    const tile = renderTiles[i];

    const glyphset = gidMap[tile.index];

    if (!glyphset) {
      continue;
    }

    const glyph = glyphset.getGlyph(tile.index);

    if (glyph === null) {
      continue;
    }

    const texture = src.glyphmap.glyphPlugin.getTexture(glyph).get().source.glTexture;
    const textureUnit = pipeline.setTexture2D(texture);

    const frameWidth = tile.width;
    const frameHeight = tile.height;

    const frameX = 0;
    const frameY = 0;

    const tw = tile.width * 0.5;
    const th = tile.height * 0.5;

    const tint = getTint(0xffffff, alpha);

    pipeline.batchTexture(
      src,
      texture,
      texture['width'],
      texture['height'],
      x + (tw + tile.pixelX) * sx,
      y + (th + tile.pixelY) * sy,
      tile.width,
      tile.height,
      sx,
      sy,
      0,
      false,
      false,
      scrollFactorX,
      scrollFactorY,
      tw,
      th,
      frameX,
      frameY,
      frameWidth,
      frameHeight,
      tint,
      tint,
      tint,
      tint,
      (false as unknown) as number,
      0,
      0,
      camera,
      null,
      true,
      textureUnit
    );
  }

  renderer.pipelines.postBatch(src);
}
