export class PathTooltip extends Phaser.GameObjects.Graphics {
  protected pathLineStyle: Phaser.Types.GameObjects.Graphics.LineStyle;

  protected pathPoints: Phaser.Geom.Point[];

  public constructor(
    scene: Phaser.Scene,
    lineStyle?: Phaser.Types.GameObjects.Graphics.LineStyle,
    points: Phaser.Geom.Point[] = []
  ) {
    super(scene, { lineStyle });
    scene.sys.displayList.add(this);

    this.pathLineStyle = lineStyle || { width: 1, color: 0xffffff, alpha: 1 };
    this.pathPoints = points;

    this.refresh();
  }

  public get points(): Phaser.Geom.Point[] {
    return this.pathPoints;
  }

  public set points(value: Phaser.Geom.Point[]) {
    this.pathPoints = value;
    this.refresh();
  }

  public pathStyle(lineWidth: number, color: number, alpha = 1): this {
    this.pathLineStyle = { width: lineWidth, color, alpha };
    this.refresh();
    return this;
  }

  public refresh(): void {
    this.clear();

    const { width, color, alpha } = this.pathLineStyle;
    this.lineStyle(width, color, alpha);

    const points = this.pathPoints;
    const length = points.length;

    if (length < 2) {
      return;
    }

    let { x, y } = points[0];
    this.beginPath().moveTo(x, y);

    for (let i = 1; i < length; ++i) {
      let { x, y } = points[i];
      this.lineTo(x, y);
    }

    this.strokePath();
  }
}
