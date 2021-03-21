import { DomWidget } from '../dom-widget';

export class MessageHud extends DomWidget {
  public constructor(scene: Phaser.Scene, x = 0, y = 0, width = 256, height = 256) {
    super(scene, x, y, width, height);
    this.refresh();
  }

  protected getContent(): string {
    return '';
  }

  protected getStyle(): Record<string, Record<string, string>> {
    return {
      [`.${MessageHud.widgetContentContainerClassName}`]: {
        background: '#111',
        'overflow-y': 'scroll'
      }
    };
  }

  protected registerInputHandling(): void {
    return;
  }
}
