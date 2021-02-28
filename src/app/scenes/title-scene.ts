import { MainScene } from './main-scene';

/**
 * Title scene.
 */
export class TitleScene extends Phaser.Scene {
  public static readonly key = 'Title';

  /**
   * Instantiate title scene.
   */
  public constructor() {
    super(TitleScene.key);
  }

  /**
   * Lifecycle method called before all others.
   */
  public init(): void {
    this.input.keyboard.enabled = false;
    this.input.keyboard.once(Phaser.Input.Keyboard.Events.ANY_KEY_UP, () => this.scene.start(MainScene.key));
  }

  /**
   * Lifecycle method called after init & preload.
   */
  public create(): void {
    const { centerX, centerY } = this.cameras.main;

    const title = this.add.text(centerX, centerY, 'Title');

    this.events.once(Phaser.Scenes.Events.TRANSITION_START, (fromScene, duration) => {
      title.setAlpha(0);
      this.tweens.add({
        targets: title,
        alpha: 1,
        duration,
        onComplete: () => (this.input.keyboard.enabled = true)
      });
    });
  }
}
