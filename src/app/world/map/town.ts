import ArenaGenerator from 'rot-js/lib/map/arena';
import RNG from 'rot-js/lib/rng';

import { LevelType } from '../level';
import { staticDataIds } from '../static-data-ids';

import { Direction } from './direction';
import { ArrayMapData, MapFeatures } from './map';

const minMapDimensions = { width: 80, height: 25 };
const maxMapDimensions = { width: 80, height: 25 };

const arenaToStaticTerrainId = {
  0: staticDataIds.terrain.floor,
  1: staticDataIds.terrain.wall
};

const featureAreaOffset = new Phaser.Geom.Point(2, 2);
const featureAreaBinaryPartitionDepth = 4; // 2^4 feature areas.

const buildingFeatureAreaPadding = 1;

const minBuildingDimensions = { width: 4, height: 4 };
const maxBuildingDimensions = { width: 7, height: 7 };

const numBuildings = 8;

export interface TownMapBuildingFeature {
  bounds: Phaser.Geom.Rectangle;
  building: Phaser.Geom.Rectangle;
  entrance: Phaser.Geom.Point;
  entranceFace: Direction;
}

export interface TownMapFeatures extends MapFeatures {
  buildings?: TownMapBuildingFeature[];
}

export class TownMapData extends ArrayMapData<TownMapFeatures> {
  public readonly levelType = LevelType.Town;
}

export function generateTown(seed: number): TownMapData {
  setSeed(seed);

  const mapDimensions = getMapDimensions();
  const mapData = new TownMapData(mapDimensions.width, mapDimensions.height, { exterior: true });

  // Empty area bordered by walls.
  const generator = new ArenaGenerator(mapDimensions.width, mapDimensions.height);
  generator.create((x, y, contents) => mapData.setCell(x, y, [arenaToStaticTerrainId[contents]]));

  const featureAreas = getFeatureAreas(
    new Phaser.Geom.Rectangle(
      featureAreaOffset.x,
      featureAreaOffset.y,
      mapDimensions.width - 2 * featureAreaOffset.x,
      mapDimensions.height - 2 * featureAreaOffset.y
    )
  );

  allocateBuildingFeatures(mapData, featureAreas);

  mapData.features.unusedAreas = featureAreas;

  return mapData;
}

function setSeed(seed: number): void {
  RNG.setSeed(seed);
}

function getMapDimensions(): { width: number; height: number } {
  return {
    width: RNG.getUniformInt(minMapDimensions.width, maxMapDimensions.width),
    height: RNG.getUniformInt(minMapDimensions.height, maxMapDimensions.height)
  };
}

function getFeatureAreas(area: Phaser.Geom.Rectangle): Phaser.Geom.Rectangle[] {
  return binaryPartition(area, featureAreaBinaryPartitionDepth);
}

function allocateBuildingFeatures(mapData: TownMapData, availableAreas: Phaser.Geom.Rectangle[]): void {
  mapData.features.buildings = [];

  for (let i = 0; i < numBuildings; ++i) {
    if (!availableAreas.length) {
      break;
    }

    const area = Phaser.Utils.Array.SpliceOne(availableAreas, RNG.getUniformInt(0, availableAreas.length - 1));

    const buildingFeature = getBuildingFeature(area);
    const building = buildingFeature.building;

    for (let y = building.y; y < building.bottom; ++y) {
      for (let x = building.x; x < building.right; ++x) {
        mapData.setCell(x, y, [staticDataIds.terrain.wall]);
      }
    }

    const { x, y } = buildingFeature.entrance;
    mapData.setCell(x, y, [staticDataIds.terrain.entrance]);

    mapData.features.buildings.push(buildingFeature);
  }
}

function binaryPartition(area: Phaser.Geom.Rectangle, depth: number): Phaser.Geom.Rectangle[] {
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
    binaryPartition(new Phaser.Geom.Rectangle(x1, y1, subWidth, subHeight), depth - 1),
    binaryPartition(new Phaser.Geom.Rectangle(x2, y2, subWidth, subHeight), depth - 1)
  );
}

function getBuildingFeature(area: Phaser.Geom.Rectangle): TownMapBuildingFeature {
  const width = RNG.getUniformInt(
    minBuildingDimensions.width,
    Phaser.Math.Clamp(
      maxBuildingDimensions.width,
      minBuildingDimensions.width,
      area.width - 2 * buildingFeatureAreaPadding
    )
  );

  const height = RNG.getUniformInt(
    minBuildingDimensions.height,
    Phaser.Math.Clamp(
      maxBuildingDimensions.height,
      minBuildingDimensions.height,
      area.height - 2 * buildingFeatureAreaPadding
    )
  );

  const x = RNG.getUniformInt(area.x + buildingFeatureAreaPadding, area.right - width - buildingFeatureAreaPadding);
  const y = RNG.getUniformInt(area.y + buildingFeatureAreaPadding, area.bottom - height - buildingFeatureAreaPadding);

  const building = new Phaser.Geom.Rectangle(x, y, width, height);
  let entrance: Phaser.Geom.Point;

  function getPoint(accessor: string): Phaser.Geom.Point {
    return RNG.shuffle((building[accessor]() as Phaser.Geom.Line).getPoints<Phaser.Geom.Point[]>(0, 1).slice(1)).pop();
  }

  const entranceFace = RNG.shuffle([Direction.North, Direction.East, Direction.South, Direction.West]).pop();

  switch (entranceFace) {
    case Direction.North:
      entrance = getPoint('getLineA');
      break;
    case Direction.East:
      entrance = getPoint('getLineB');
      entrance.x -= 1;
      break;
    case Direction.South:
      entrance = getPoint('getLineC');
      entrance.y -= 1;
      break;
    case Direction.West:
    default:
      entrance = getPoint('getLineD');
      break;
  }

  return { bounds: area, building, entrance, entranceFace };
}
