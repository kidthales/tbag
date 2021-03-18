import { DomWidget } from '../dom-widget';

export class StatusHud extends DomWidget {
  public constructor(scene: Phaser.Scene, x = 0, y = 0, width = 256, height = 256) {
    super(scene, x, y, width, height);
    this.refresh();
  }

  protected getContent(): string {
    return '';
  }

  protected getStyle(): Record<string, Record<string, string>> {
    return {
      [`.${StatusHud.widgetContentContainerClassName}`]: {
        background: '#111'
      }
    };
  }

  protected registerInputHandling(): void {
    return;
  }
}
