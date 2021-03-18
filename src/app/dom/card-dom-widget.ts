import { DomWidget } from './dom-widget';

import { CardDomWidgetActionConfig } from './card-dom-widget-action-config';

export abstract class CardDomWidget extends DomWidget {
  protected abstract cardTitle;

  protected abstract cardContent;

  protected abstract cardActions: Record<string, CardDomWidgetActionConfig>;

  public constructor(scene: Phaser.Scene, x = 0, y = 0, width = 256, height = 256) {
    super(scene, x, y, width, height, 'div');
  }

  public get title(): string {
    return this.cardTitle;
  }

  public set title(value: string) {
    this.cardTitle = value;
    this.refresh();
  }

  public get content(): string {
    return this.content;
  }

  public set content(value: string) {
    this.cardContent = value;
    this.refresh();
  }

  public get actions(): Record<string, CardDomWidgetActionConfig> {
    return this.cardActions;
  }

  public set actions(value: Record<string, CardDomWidgetActionConfig>) {
    this.cardActions = value;
    this.refresh();
  }

  protected getContent(): string {
    return `
      <div class="card-title">${this.cardTitle}</div>
      <div class="card-content">${this.cardContent}</div>
      <div class="card-actions">${this.getActions()}</div>
    `;
  }

  protected registerInputHandling(): void {
    this.addListener('click').on(
      'click',
      (event: Event) => {
        const config = this.cardActions[event.target['name']];

        if (config && config.onClick && !this.handlingInput) {
          this.handlingInput = true;
          this.scene.time.delayedCall(250, () => (this.handlingInput = false), undefined, this);
          config.onClick();
        }
      },
      this
    );
  }

  protected getActions(): string {
    return Object.values(this.cardActions || {})
      .map(({ html }) => html)
      .join('');
  }
}
