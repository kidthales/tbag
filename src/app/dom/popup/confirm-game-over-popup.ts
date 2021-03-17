import { CardDomWidget, CardDomWidgetActionConfig } from '../card';

export class ConfirmGameOverPopup extends CardDomWidget {
  protected cardTitle = '<h3>Confirm Game Over?</h3>';

  protected cardContent = `
    <p>Are you sure you want to end this game?</p>
  `;

  protected cardActions: Record<string, CardDomWidgetActionConfig> = {
    ok: {
      html: `<button name="ok">OK</button>`,
      onClick: () => this.onOkAction()
    },
    cancel: {
      html: `<button name="cancel">Cancel</button>`,
      onClick: () => this.onCancelAction()
    }
  };

  public constructor(
    scene: Phaser.Scene,
    x = 0,
    y = 0,
    protected readonly ok: () => void,
    protected readonly cancel: () => void
  ) {
    super(scene, x, y);
    this.refresh();
  }

  protected getStyle(): Record<string, Record<string, string>> {
    return {
      [`.${ConfirmGameOverPopup.widgetContentContainerClassName}`]: {
        background: '#fff'
      }
    };
  }

  protected onOkAction(): void {
    this.ok();
  }

  protected onCancelAction(): void {
    this.cancel();
  }
}
