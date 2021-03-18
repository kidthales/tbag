import { HtmlBlockTag } from '../utils';

export abstract class DomWidget extends Phaser.GameObjects.DOMElement {
  protected static readonly widgetContentContainerClassName = 'widget-content-container';

  private static readonly widgetContentContainerDimensionsClassName = 'widget-content-container-dimensions';

  public readonly id = `widget-${Phaser.Math.RND.uuid()}`;

  public handlingInput = false;

  protected widgetWidth: number;

  protected widgetHeight: number;

  public constructor(scene: Phaser.Scene, x = 0, y = 0, width = 256, height = 256, root: HtmlBlockTag = 'div') {
    super(scene, x, y, root);
    scene.sys.displayList.add(this);

    this.widgetWidth = width;
    this.widgetHeight = height;

    this.refresh();
  }

  public setWidth(value: number) {
    this.widgetWidth = value;
    this.refresh();
  }

  public setHeight(value: number) {
    this.widgetHeight = value;
    this.refresh();
  }

  protected abstract getContent(): string;

  protected abstract getStyle(): Record<string, Record<string, string>>;

  protected abstract registerInputHandling(): void;

  protected refresh(): this {
    this.setElement(this.node, this.getDimensionsCss());
    this.node.innerHTML = this.getHtml();
    this.updateSize();

    this.registerInputHandling();

    return this;
  }

  private getHtml(): string {
    return `
      <style>
        ${this.getCss()}
        #${this.id}.${DomWidget.widgetContentContainerDimensionsClassName} { ${this.getDimensionsCss()} }
      </style>

      <div id="${this.id}" class="${DomWidget.widgetContentContainerClassName} ${
      DomWidget.widgetContentContainerDimensionsClassName
    }">
        ${this.getContent()}
      </div>
    `;
  }

  private getCss(): string {
    return Object.entries(this.getStyle())
      .map(
        ([selector, declaration]) =>
          `#${this.id}${
            selector === `.${DomWidget.widgetContentContainerClassName}` ? '' : ' '
          }${selector} { ${Object.entries(declaration)
            .map(([key, value]) => `${key}: ${value};`)
            .join(' ')} }`
      )
      .join('\n');
  }

  private getDimensionsCss(): string {
    const { widgetWidth: width, widgetHeight: height } = this;
    return `width: ${width}px; height: ${height}px; max-width: ${width}px; max-height: ${height}px; min-width: ${width}px; min-height: ${height}px;`;
  }
}
