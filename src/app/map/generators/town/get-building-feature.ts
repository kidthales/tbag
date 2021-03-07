import RNG from 'rot-js/lib/rng';

import { Direction } from '../../direction';

import { generateTownStaticConfig } from './generate-town-static-config';
import { TownMapBuildingFeature } from './town-map-building-feature';

export function getBuildingFeature(area: Phaser.Geom.Rectangle): TownMapBuildingFeature {
  const { buildingFeatureAreaPadding, minBuildingDimensions, maxBuildingDimensions } = generateTownStaticConfig;

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
