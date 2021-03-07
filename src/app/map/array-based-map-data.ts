import { MapCell } from './map-cell';
import { MapData } from './map-data';
import { MapFeatures } from './map-features';

export abstract class ArrayBasedMapData<T extends MapFeatures = MapFeatures> extends MapData<MapCell[][], T> {
  public constructor(public readonly width: number, public readonly height: number, public readonly features: T) {
    super(width, height, features);

    this.cells = new Array<MapCell[]>(height);

    for (let y = 0; y < height; ++y) {
      this.cells[y] = new Array<MapCell>(width);
    }
  }

  public getCell(x: number, y: number): MapCell {
    return this.cells[y][x];
  }

  public setCell(x: number, y: number, cell: MapCell): this {
    this.cells[y][x] = cell;
    return this;
  }
}
