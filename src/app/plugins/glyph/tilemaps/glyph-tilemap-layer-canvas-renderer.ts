import { GlyphTilemapLayer } from './glyph-tilemap-layer';

const tempMatrix1 = new Phaser.GameObjects.Components.TransformMatrix();
const tempMatrix2 = new Phaser.GameObjects.Components.TransformMatrix();
const tempMatrix3 = new Phaser.GameObjects.Components.TransformMatrix();

/**
 * Renders this Game Object with the Canvas Renderer to the given Camera.
 * The object will not render if any of its renderFlags are set or it is being actively filtered out by the Camera.
 * This method should not be called directly. It is a utility function for the Render module.
 *
 * @param renderer A reference to the current active Canvas renderer.
 * @param src The Game Object being rendered in this call.
 * @param camera The Camera that is rendering the Game Object.
 * @param parentMatrix This transform matrix is defined if the game object is nested
 */
export default function renderCanvas(
  renderer: Phaser.Renderer.Canvas.CanvasRenderer,
  src: GlyphTilemapLayer,
  camera: Phaser.Cameras.Scene2D.Camera,
  parentMatrix: Phaser.GameObjects.Components.TransformMatrix
): void {
  const renderTiles = src.cull(camera);

  const tileCount = renderTiles.length;
  const alpha = camera.alpha * src.alpha;

  if (tileCount === 0 || alpha <= 0) {
    return;
  }

  const camMatrix = tempMatrix1;
  const layerMatrix = tempMatrix2;
  const calcMatrix = tempMatrix3;

  layerMatrix.applyITRS(src.x, src.y, src.rotation, src.scaleX, src.scaleY);

  camMatrix.copyFrom(camera['matrix']);

  const ctx = renderer.currentContext;
  const gidMap = src.gidMap;

  ctx.save();

  if (parentMatrix) {
    //  Multiply the camera by the parent matrix
    camMatrix.multiplyWithOffset(
      parentMatrix,
      -camera.scrollX * src.scrollFactorX,
      -camera.scrollY * src.scrollFactorY
    );

    //  Undo the camera scroll
    layerMatrix.e = src.x;
    layerMatrix.f = src.y;

    //  Multiply by the Sprite matrix, store result in calcMatrix
    camMatrix.multiply(layerMatrix, calcMatrix);

    calcMatrix.copyToContext(ctx);
  } else {
    layerMatrix.e -= camera.scrollX * src.scrollFactorX;
    layerMatrix.f -= camera.scrollY * src.scrollFactorY;

    layerMatrix.copyToContext(ctx);
  }

  if (!renderer.antialias || src.scaleX > 1 || src.scaleY > 1) {
    ctx.imageSmoothingEnabled = false;
  }

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

    const texture = src.glyphmap.glyphPlugin.getTexture(glyph);

    const tileWidth = tile.width;
    const tileHeight = tile.height;

    const halfWidth = tileWidth * 0.5;
    const halfHeight = tileHeight * 0.5;

    ctx.save();

    ctx.translate(tile.pixelX + halfWidth, tile.pixelY + halfHeight);

    ctx.drawImage(
      texture.getSourceImage() as HTMLImageElement | HTMLCanvasElement,
      0,
      0,
      tileWidth,
      tileHeight,
      -halfWidth,
      -halfHeight,
      tileWidth,
      tileHeight
    );

    ctx.restore();
  }

  ctx.restore();
}
