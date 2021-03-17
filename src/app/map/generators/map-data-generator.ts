import { MapCell } from '../map-cell';
import { MapData } from '../map-data';

import { Dimensions } from './dimensions';

export abstract class MapDataGenerator<T extends MapData = MapData> {
  protected static binaryPartition(area: Phaser.Geom.Rectangle, depth: number): Phaser.Geom.Rectangle[] {
    if (depth <= 0) {
      return [area];
    }

    const { x: x1, y: y1, width, height } = area;

    const subWidth = width >= height ? Math.floor(width / 2) : width;
    const subHeight = width >= height ? height : Math.floor(height / 2);

    if (!subWidth || !subHeight) {
      return [area];
    }

    const x2 = width >= height ? x1 + subWidth : x1;
    const y2 = width >= height ? y1 : y1 + subHeight;

    return [].concat(
      MapDataGenerator.binaryPartition(new Phaser.Geom.Rectangle(x1, y1, subWidth, subHeight), depth - 1),
      MapDataGenerator.binaryPartition(new Phaser.Geom.Rectangle(x2, y2, subWidth, subHeight), depth - 1)
    );
  }

  protected abstract readonly mapData: T;

  protected readonly rng: Phaser.Math.RandomDataGenerator;

  public constructor(seed: string[]) {
    this.rng = new Phaser.Math.RandomDataGenerator(seed);
  }

  public abstract generate(): T;

  protected getRandomDimensions(min: Dimensions, max: Dimensions): Dimensions {
    return {
      width: this.rng.integerInRange(min.width, max.width),
      height: this.rng.integerInRange(min.height, max.height)
    };
  }

  protected forEachCell(
    callback: (cell: MapCell) => void,
    context: unknown,
    x: number,
    y: number,
    width: number,
    height: number
  ): void {
    const { width: mapWidth, height: mapHeight } = this.mapData;
    const right = x + width;
    const bottom = y + height;

    for (let cellY = y; cellY < bottom; ++cellY) {
      if (cellY >= mapHeight) {
        break;
      } else if (cellY < 0) {
        continue;
      }

      for (let cellX = x; cellX < right; ++cellX) {
        if (cellX >= mapWidth) {
          break;
        } else if (cellX < 0) {
          continue;
        }

        callback.call(context, this.mapData.getCell(cellX, cellY));
      }
    }
  }

  protected forEachPerimeterCell(
    callback: (cell: MapCell) => void,
    context: unknown,
    x: number,
    y: number,
    width: number,
    height: number
  ): void {
    const { width: mapWidth, height: mapHeight } = this.mapData;
    const right = x + width;
    const bottom = y + height;

    const top = y;
    const left = x;

    for (let cellX = x; cellX < right; ++cellX) {
      if (cellX >= mapWidth) {
        break;
      } else if (cellX < 0) {
        continue;
      }

      if (top >= 0 && top < mapHeight) {
        callback.call(context, this.mapData.getCell(cellX, top));
      }

      if (bottom - 1 >= 0 && bottom - 1 < mapHeight) {
        callback.call(context, this.mapData.getCell(cellX, bottom - 1));
      }
    }

    for (let cellY = y + 1; cellY < bottom - 1; ++cellY) {
      if (cellY >= mapHeight) {
        break;
      } else if (cellY < 0) {
        continue;
      }

      if (left >= 0 && left < mapWidth) {
        callback.call(context, this.mapData.getCell(left, cellY));
      }

      if (right - 1 >= 0 && right - 1 < mapWidth) {
        callback.call(context, this.mapData.getCell(right - 1, cellY));
      }
    }
  }
}
