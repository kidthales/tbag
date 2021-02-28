import ArenaGenerator from 'rot-js/lib/map/arena';
import CellularGenerator from 'rot-js/lib/map/cellular';
import DiggerGenerator from 'rot-js/lib/map/digger';
import DividedMazeGenerator from 'rot-js/lib/map/dividedmaze';
import DungeonGenerator from 'rot-js/lib/map/dungeon';
import MapGenerator from 'rot-js/lib/map/map';
import RNG from 'rot-js/lib/rng';

import { MapCell, MapData, MapDataCorridorFeature, MapDataFeatures, MapDataRoomFeature, MapType } from './map';

export function generateMapData(type: MapType, seed: string | string[]): MapData {
  const normalizedSeed = normalizeSeed(seed);

  RNG.setSeed(normalizedSeed);

  const [width, height] = getDimensionsByMapType(type);
  const generator = getMapGenerator(type, width, height);
  const cells = allocateMapCells(width, height);

  runMapGenerator(type, generator, cells);

  const features = createMapFeatures(type, generator, cells);

  return new MapData(type, width, height, cells, features);
}

function normalizeSeed(seed: string | string[]): number {
  return (Array.isArray(seed) ? seed : [seed]).reduce((t, s) => {
    for (let i = 0; i < s.length; ++i) {
      t += s.codePointAt(i);
    }

    return t;
  }, 0);
}

function getDimensionsByMapType(type: MapType): [number, number] {
  let width: number;
  let height: number;

  switch (type) {
    case MapType.Dungeon:
      width = RNG.getUniformInt(150, 250);
      height = RNG.getUniformInt(150, 250);
      break;
    case MapType.Maze:
      width = RNG.getUniformInt(80, 160);
      height = RNG.getUniformInt(80, 160);
      break;
    case MapType.Cave:
      width = RNG.getUniformInt(80, 160);
      height = RNG.getUniformInt(80, 160);
      break;
    case MapType.Town:
    default:
      width = 80;
      height = 25;
      break;
  }

  return [width, height];
}

function allocateMapCells(width: number, height: number): MapCell[][] {
  const cells: MapCell[][] = new Array<MapCell[]>(height);

  for (let y = 0; y < height; ++y) {
    cells[y] = new Array<MapCell>(width);
  }

  return cells;
}

function getMapGenerator(type: MapType, width: number, height: number) {
  let generator: MapGenerator;

  switch (type) {
    case MapType.Dungeon:
      generator = new DiggerGenerator(width, height);
      break;
    case MapType.Maze:
      generator = new DividedMazeGenerator(width, height);
      break;
    case MapType.Cave:
      generator = new CellularGenerator(width, height, { connected: true } as any);
      break;
    case MapType.Town:
    default:
      generator = new ArenaGenerator(width, height);
      break;
  }

  return generator;
}

function runMapGenerator(type: MapType, generator: MapGenerator, cells: MapCell[][]): void {
  if (type === MapType.Cave) {
    const g = generator as CellularGenerator;

    g.randomize(0.5);

    for (let i = 0; i < 3; ++i) {
      g.create();
    }
  }

  generator.create((x, y, contents) => assignMapCell(x, y, contents, cells));
}

function createMapFeatures(type: MapType, generator: MapGenerator, cells: MapCell[][]): MapDataFeatures {
  const features: MapDataFeatures = { corridors: [], rooms: [] };

  if (type === MapType.Dungeon) {
    const g = generator as DungeonGenerator;

    g.getCorridors().forEach((c) =>
      features.corridors.push(new MapDataCorridorFeature(c._startX, c._startY, c._endX, c._endY, c._endsWithAWall))
    );

    g.getRooms().forEach((r) => {
      const doors: [number, number][] = [];
      r.getDoors((x, y) => doors.push([x, y]));
      features.rooms.push(new MapDataRoomFeature(r._x1, r._y1, r._x2 - r._x1, r._y2 - r._y1, doors));
    });
  }

  return features;
}

function assignMapCell(x: number, y: number, contents: number, cells: MapCell[][]): void {
  cells[y][x] = [contents, undefined];
}
