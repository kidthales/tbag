/**
 * Render module for GlyphTilemapLayer.
 */
import { GlyphTilemapLayer } from './glyph-tilemap-layer';

declare const WEBGL_RENDERER: unknown;
declare const CANVAS_RENDERER: unknown;

let renderWebGL:
  | (() => void)
  | ((
      renderer: Phaser.Renderer.WebGL.WebGLRenderer,
      src: GlyphTilemapLayer,
      camera: Phaser.Cameras.Scene2D.Camera
    ) => void) = Phaser.Utils.NOOP;

let renderCanvas:
  | (() => void)
  | ((
      renderer: Phaser.Renderer.Canvas.CanvasRenderer,
      src: GlyphTilemapLayer,
      camera: Phaser.Cameras.Scene2D.Camera,
      parentMatrix: Phaser.GameObjects.Components.TransformMatrix
    ) => void) = Phaser.Utils.NOOP;

if (typeof WEBGL_RENDERER) {
  renderWebGL = require(/* webpackChunkName: "glyph-tilemap-layer-webgl-renderer" */ './glyph-tilemap-layer-webgl-renderer')
    .default;
}

if (typeof CANVAS_RENDERER) {
  renderCanvas = require(/* webpackChunkName: "glyph-tilemap-layer-canvas-renderer" */ './glyph-tilemap-layer-canvas-renderer')
    .default;
}

export default {
  /**
   * Renders this Game Object with the WebGL Renderer to the given Camera.
   * The object will not render if any of its renderFlags are set or it is being actively filtered out by the Camera.
   * This method should not be called directly. It is a utility function for the Render module.
   *
   * @param renderer A reference to the current active WebGL renderer.
   * @param src The Game Object being rendered in this call.
   * @param camera The Camera that is rendering the Game Object.
   */
  renderWebGL,

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
  renderCanvas
};
