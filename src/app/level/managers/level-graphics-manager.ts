import { visibilityConfig } from '../../configs';
import { FieldOfViewCell } from '../../fov';

import { Level } from '../level';
import { LevelGameObjectDepth } from '../level-game-object-depth';

export class LevelGraphicsManager {
  protected static readonly visibilityFillColor = 0x000000;

  protected readonly pathTooltip: Phaser.GameObjects.Graphics;

  protected readonly visibility: Phaser.GameObjects.RenderTexture;

  protected readonly visibilityStamp: Phaser.GameObjects.Graphics;

  public constructor(protected readonly level: Level, pathTooltipOptions?: Phaser.Types.GameObjects.Graphics.Options) {
    this.pathTooltip = level.levelScene.add.graphics(pathTooltipOptions).setDepth(LevelGameObjectDepth.PathTooltip);
    this.visibility = level.levelScene.add
      .renderTexture(0, 0, level.widthInPixels, level.heightInPixels)
      .setDepth(LevelGameObjectDepth.Visibility);

    this.visibilityStamp = level.levelScene.make.graphics({});

    level.gameObjectGroup.add(this.pathTooltip);
    level.gameObjectGroup.add(this.visibility);
  }

  public clearPathTooltip(): this {
    this.pathTooltip.clear();
    return this;
  }

  public setPathTooltipStyle(style: Phaser.Types.GameObjects.Graphics.LineStyle): this {
    const { width, color, alpha } = style;
    this.pathTooltip.lineStyle(width, color, alpha);
    return this;
  }

  public drawPathTooltip(points: Phaser.Geom.Point[]): this {
    if (points.length < 2) {
      return this;
    }

    const toWorld = ({ x, y }: Phaser.Geom.Point) => this.level.map.cellCenterToWorldXY(x, y);

    let { x, y } = toWorld(points[0]);
    this.pathTooltip.beginPath().moveTo(x, y);

    for (let i = 1; i < points.length; ++i) {
      let { x, y } = toWorld(points[i]);
      this.pathTooltip.lineTo(x, y);
    }

    this.pathTooltip.strokePath();
  }

  public clearVisibility(): this {
    this.visibility.clear();
    return this;
  }

  public setVisibility(visibility: number): this {
    this.visibilityStamp
      .clear()
      .fillStyle(
        LevelGraphicsManager.visibilityFillColor,
        Phaser.Math.Clamp(visibilityConfig.maxVisibility - visibility, 0, 1)
      )
      .fillRect(0, 0, this.level.widthInPixels, this.level.heightInPixels);

    this.visibility.clear().draw(this.visibilityStamp);

    return this;
  }

  public setVisibilityCells(cells: FieldOfViewCell[]): this {
    return this.eraseVisibilityCells(cells).setVisibilityCellsAlpha(cells);
  }

  public setVisibilityCell(cell: FieldOfViewCell, textureFrame?: Phaser.Textures.Frame): this {
    const cells = [cell];

    this.eraseVisibilityCells(cells);

    if (textureFrame) {
      const { worldX, worldY } = this.level.map.getCell(cell.x, cell.y);
      this.visibility.draw(textureFrame, worldX, worldY);
    }

    return this.setVisibilityCellsAlpha(cells);
  }

  protected eraseVisibilityCells(cells: FieldOfViewCell[]): this {
    this.visibilityStamp.clear().fillStyle(LevelGraphicsManager.visibilityFillColor, 1);

    cells.forEach(({ x, y }) => {
      const {
        worldX,
        worldY,
        tile: { width, height }
      } = this.level.map.getCell(x, y);

      this.visibilityStamp.fillRect(worldX, worldY, width, height);
    });

    this.visibility.erase(this.visibilityStamp);

    return this;
  }

  protected setVisibilityCellsAlpha(cells: FieldOfViewCell[]): this {
    this.visibilityStamp.clear();

    cells.forEach(({ x, y, radius, visibility }) => {
      const {
        worldX,
        worldY,
        tile: { width, height }
      } = this.level.map.getCell(x, y);

      const alpha = Phaser.Math.Clamp(visibilityConfig.maxVisibility - visibility, 0, visibilityConfig.exploredAlpha);
      this.visibilityStamp
        .fillStyle(LevelGraphicsManager.visibilityFillColor, alpha)
        .fillRect(worldX, worldY, width, height);
    });

    this.visibility.draw(this.visibilityStamp);

    return this;
  }
}
