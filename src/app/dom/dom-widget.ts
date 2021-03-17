import { HtmlBlockTag } from '../utils';

export abstract class DomWidget
  implements
    Phaser.GameObjects.Components.AlphaSingle,
    Phaser.GameObjects.Components.BlendMode,
    Phaser.GameObjects.Components.Depth,
    Phaser.GameObjects.Components.Origin,
    Phaser.GameObjects.Components.ScrollFactor,
    Phaser.GameObjects.Components.Transform,
    Phaser.GameObjects.Components.Visible {
  protected static readonly widgetContentContainerClassName = 'widget-content-container';

  private static readonly widgetContentContainerDimensionsClassName = 'widget-content-container-dimensions';

  public readonly id = `widget-${Phaser.Math.RND.uuid()}`;

  public handlingInput = false;

  protected gameobject: Phaser.GameObjects.DOMElement;

  protected widgetWidth: number;

  protected widgetHeight: number;

  public constructor(
    protected readonly scene: Phaser.Scene,
    x = 0,
    y = 0,
    width = 256,
    height = 256,
    root: HtmlBlockTag = 'div'
  ) {
    this.gameobject = this.scene.add.dom(x, y, root);

    this.widgetWidth = width;
    this.widgetHeight = height;

    this.refresh();
  }

  public set width(value: number) {
    this.widgetWidth = value;
    this.refresh();
  }

  public set height(value: number) {
    this.widgetHeight = value;
    this.refresh();
  }

  public get alpha(): number {
    return this.gameobject.alpha;
  }

  public set alpha(value: number) {
    this.gameobject.alpha = value;
  }

  public get blendMode(): string | Phaser.BlendModes {
    return this.gameobject.blendMode;
  }

  public set blendMode(value: string | Phaser.BlendModes) {
    this.gameobject.blendMode = value;
  }

  public get depth(): number {
    return this.gameobject.depth;
  }

  public set depth(value: number) {
    this.gameobject.depth = value;
  }

  public get originX(): number {
    return this.gameobject.originX;
  }

  public set originX(value: number) {
    this.gameobject.originX = value;
  }

  public get originY(): number {
    return this.gameobject.originY;
  }

  public set originY(value: number) {
    this.gameobject.originY = value;
  }

  public get displayOriginX(): number {
    return this.gameobject.displayOriginX;
  }

  public set displayOriginX(value: number) {
    this.gameobject.displayOriginX = value;
  }

  public get displayOriginY(): number {
    return this.gameobject.displayOriginY;
  }

  public set displayOriginY(value: number) {
    this.gameobject.displayOriginY;
  }

  public get scrollFactorX(): number {
    return this.gameobject.scrollFactorX;
  }

  public set scrollFactorX(value: number) {
    this.gameobject.scrollFactorX = value;
  }

  public get scrollFactorY(): number {
    return this.gameobject.scrollFactorY;
  }

  public set scrollFactorY(value: number) {
    this.gameobject.scrollFactorY = value;
  }

  public get x(): number {
    return this.gameobject.x;
  }

  public set x(value: number) {
    this.gameobject.x = value;
  }

  public get y(): number {
    return this.gameobject.y;
  }

  public set y(value: number) {
    this.gameobject.y = value;
  }

  public get z(): number {
    return this.gameobject.z;
  }

  public set z(value: number) {
    this.gameobject.z = value;
  }

  public get w(): number {
    return this.gameobject.w;
  }

  public set w(value: number) {
    this.gameobject.w = value;
  }

  public get scale(): number {
    return this.gameobject.scale;
  }

  public set scale(value: number) {
    this.gameobject.scale = value;
  }

  public get scaleX(): number {
    return this.gameobject.scaleX;
  }

  public set scaleX(value: number) {
    this.gameobject.scaleX = value;
  }

  public get scaleY(): number {
    return this.gameobject.scaleY;
  }

  public set scaleY(value: number) {
    this.gameobject.scaleY = value;
  }

  public get angle(): number {
    return this.gameobject.angle;
  }

  public set angle(value: number) {
    this.gameobject.angle = value;
  }

  public get rotation(): number {
    return this.gameobject.rotation;
  }

  public set rotation(value: number) {
    this.gameobject.rotation = value;
  }

  public get visible(): boolean {
    return this.gameobject.visible;
  }

  public set visible(value: boolean) {
    this.gameobject.visible = value;
  }

  public clearAlpha(): this {
    this.gameobject.clearAlpha();
    return this;
  }

  public setAlpha(value?: number): this {
    this.gameobject.setAlpha(value);
    return this;
  }

  public setBlendMode(value: string | Phaser.BlendModes): this {
    this.gameobject.setBlendMode(value);
    return this;
  }

  public setDepth(value: number): this {
    this.gameobject.setDepth(value);
    return this;
  }

  public setOrigin(x?: number, y?: number): this {
    this.gameobject.setOrigin(x, y);
    return this;
  }

  public setOriginFromFrame(): this {
    this.gameobject.setOriginFromFrame();
    return this;
  }

  public setDisplayOrigin(x?: number, y?: number): this {
    this.gameobject.setDisplayOrigin(x, y);
    return this;
  }

  public updateDisplayOrigin(): this {
    this.gameobject.updateDisplayOrigin();
    return this;
  }

  public setScrollFactor(x: number, y?: number): this {
    this.gameobject.setScrollFactor(x, y);
    return this;
  }

  public setPosition(x?: number, y?: number, z?: number, w?: number): this {
    this.gameobject.setPosition(x, y, z, w);
    return this;
  }

  public copyPosition(
    source: Phaser.Types.Math.Vector2Like | Phaser.Types.Math.Vector3Like | Phaser.Types.Math.Vector4Like
  ): this {
    this.gameobject.copyPosition(source);
    return this;
  }

  public setRandomPosition(x?: number, y?: number, width?: number, height?: number): this {
    this.gameobject.setRandomPosition(x, y, width, height);
    return this;
  }

  public setRotation(radians?: number): this {
    this.gameobject.setRotation(radians);
    return this;
  }

  public setAngle(degrees?: number): this {
    this.gameobject.setAngle(degrees);
    return this;
  }

  public setScale(x: number, y?: number): this {
    this.gameobject.setScale(x, y);
    return this;
  }

  public setX(value?: number): this {
    this.gameobject.setX(value);
    return this;
  }

  public setY(value?: number): this {
    this.gameobject.setY(value);
    return this;
  }

  public setZ(value?: number): this {
    this.gameobject.setZ(value);
    return this;
  }

  public setW(value?: number): this {
    this.gameobject.setW(value);
    return this;
  }

  public getLocalTransformMatrix(
    tempMatrix?: Phaser.GameObjects.Components.TransformMatrix
  ): Phaser.GameObjects.Components.TransformMatrix {
    return this.gameobject.getLocalTransformMatrix(tempMatrix);
  }

  public getWorldTransformMatrix(
    tempMatrix?: Phaser.GameObjects.Components.TransformMatrix,
    parentMatrix?: Phaser.GameObjects.Components.TransformMatrix
  ): Phaser.GameObjects.Components.TransformMatrix {
    return this.gameobject.getWorldTransformMatrix(tempMatrix, parentMatrix);
  }

  public getLocalPoint(
    x: number,
    y: number,
    point?: Phaser.Math.Vector2,
    camera?: Phaser.Cameras.Scene2D.Camera
  ): Phaser.Math.Vector2 {
    return this.gameobject.getLocalPoint(x, y, point, camera);
  }

  public getParentRotation(): number {
    return this.gameobject.getParentRotation();
  }

  public setVisible(value: boolean): this {
    this.gameobject.setVisible(value);
    return this;
  }

  public destroy(): void {
    this.gameobject.destroy();
  }

  protected abstract getContent(): string;

  protected abstract getStyle(): Record<string, Record<string, string>>;

  protected abstract registerInputHandling(): void;

  protected refresh(): this {
    this.gameobject.setElement(this.gameobject.node, this.getDimensionsCss());
    this.gameobject.node.innerHTML = this.getHtml();
    this.gameobject.updateSize();

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
