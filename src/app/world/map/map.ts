import { LevelType } from '../level';

export const mapCellTerrainStaticDataIdIndex = 0;

export const mapCellEntityIdsIndex = 1;

export type MapCell = [number, string[]?];

export interface MapFeatures {
  exterior?: boolean;
  unusedAreas?: Phaser.Geom.Rectangle[];
}

export abstract class MapData<T, V extends MapFeatures = MapFeatures> {
  public abstract readonly levelType: LevelType;

  protected cells: T;

  public constructor(public readonly width: number, public readonly height: number, public readonly features: V) {}

  public abstract getCell(x: number, y: number): MapCell;

  public abstract setCell(x: number, y: number, cell: MapCell): this;
}

export abstract class ArrayMapData<T extends MapFeatures = MapFeatures> extends MapData<MapCell[][], T> {
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

/*export class MapDataCorridorFeature extends Phaser.Geom.Line {
  public constructor(x1?: number, y1?: number, x2?: number, y2?: number, public endsWithWall?: boolean) {
    super(x1, y1, x2, y2);
  }
}

export class MapDataRoomFeature extends Phaser.Geom.Rectangle {
  public constructor(x?: number, y?: number, width?: number, height?: number, public doors: [number, number][] = []) {
    super(x, y, width, height);
  }
}

export interface MapDataFeatures {
  corridors: MapDataCorridorFeature[];
  rooms: MapDataRoomFeature[];
}

export class MapData {
  public constructor(
    public readonly type: MapType,
    public readonly width: number,
    public readonly height: number,
    public readonly cells: MapCell[][],
    public readonly features: MapDataFeatures
  ) {}
}*/
