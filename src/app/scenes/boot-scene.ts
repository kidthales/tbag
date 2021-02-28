import { PreloadScene } from './preload-scene';

/**
 * Boot scene.
 */
export class BootScene extends Phaser.Scene {
  public static readonly key = 'Boot';

  /**
   * Instantiate boot scene.
   */
  public constructor() {
    super(BootScene.key);
  }

  /**
   * Lifecycle method called after init & preload.
   */
  public create(): void {
    this.scene.start(PreloadScene.key);
  }
}
