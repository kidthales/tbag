import ArenaGenerator from 'rot-js/lib/map/arena';
import RNG from 'rot-js/lib/rng';

import { terrainStaticDataIds } from '../entity';
import { LevelType } from '../level';

import { ArrayMapData } from './map';

const maxMapWidth = 80;
const maxMapHeight = 25;

const minMapWidth = 80;
const minMapHeight = 25;

const arenaGeneratorFloor = 0;
const arenaGeneratorWall = 1;

const arenaToStaticTerrainId = {
  [arenaGeneratorFloor]: terrainStaticDataIds.floor,
  [arenaGeneratorWall]: terrainStaticDataIds.wall
};

export class TownMapData extends ArrayMapData<{}> {
  public readonly levelType = LevelType.Town;
}

export function generateTown(seed: number): TownMapData {
  RNG.setSeed(seed);

  const mapWidth = RNG.getUniformInt(minMapWidth, maxMapWidth);
  const mapHeight = RNG.getUniformInt(minMapHeight, maxMapHeight);

  const mapData = new TownMapData(mapWidth, mapHeight, {});

  const generator = new ArenaGenerator(mapWidth, mapHeight);
  generator.create((x, y, contents) => mapData.setCell(x, y, [arenaToStaticTerrainId[contents]]));

  return mapData;
}
