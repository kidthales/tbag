export enum MapType {
  Town,
  Dungeon,
  Maze,
  Cave
}

export const mapCellTerrainStaticDataIdIndex = 0;

export const mapCellEntityIdsIndex = 1;

export type MapCell = [number, string[]?];

export class MapDataCorridorFeature extends Phaser.Geom.Line {
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
}
