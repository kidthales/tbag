import { AvatarData } from '../../avatar';
import { avatarConfig, entityStaticDataIdConfig } from '../../configs';
import { renderableComponentKey } from '../../entities';

import { CardDomWidget } from '../card-dom-widget';
import { CardDomWidgetActionConfig } from '../card-dom-widget-action-config';

export class NewGamePopup extends CardDomWidget {
  protected cardTitle = '<h2>New Game</h2>';

  protected cardActions: Record<string, CardDomWidgetActionConfig> = {
    ok: {
      html: `<button name="ok">OK</button>`,
      onClick: () => this.onOkAction()
    }
  };

  public constructor(
    scene: Phaser.Scene,
    x = 0,
    y = 0,
    width = 256,
    height = 256,
    protected readonly ok: (avatarStaticDataId: number, avatarData: AvatarData) => void
  ) {
    super(scene, x, y, width, height);
    this.refresh();
  }

  protected get cardContent(): string {
    return ``;
  }

  protected getStyle(): Record<string, Record<string, string>> {
    return {
      [`.${NewGamePopup.widgetContentContainerClassName}`]: {
        background: '#fff'
      }
    };
  }

  protected onOkAction(): void {
    this.ok(entityStaticDataIdConfig.creature.human, { [renderableComponentKey]: avatarConfig.renderable });
  }
}
