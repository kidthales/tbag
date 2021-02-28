import { TitleScene } from './title-scene';

export class PreloadScene extends Phaser.Scene {
  public static readonly key = 'Preload';

  /**
   * Instantiate load scene.
   */
  public constructor() {
    super(PreloadScene.key);
  }

  /**
   * Lifecycle method called after init & before create.
   */
  public preload(): void {
    this.load.pack('assets', 'assets/manifest.json');
  }

  /**
   * Lifecycle method called after init & preload.
   */
  public create(): void {
    this.scene.transition({
      target: TitleScene.key,
      duration: 1500,
      sleep: false,
      allowInput: false,
      onUpdate: (progress: number) => {
        /*const style = document.getElementById('splashContainer').style;

        style.opacity = (1 - progress).toString();

        if (progress === 1) {
          style.display = 'none';
          style.opacity = '1';
        }*/
      }
    });
  }
}
