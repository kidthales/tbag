import { entityStaticDataIds } from '../../../configs';

export const generateTownStaticConfig = {
  minMapDimensions: { width: 80, height: 25 },
  maxMapDimensions: { width: 80, height: 25 },

  arenaIndexToTerrainStaticDataId: {
    0: entityStaticDataIds.terrain.floor,
    1: entityStaticDataIds.terrain.wall
  },

  featureAreaOffset: new Phaser.Geom.Point(2, 2),
  featureAreaBinaryPartitionDepth: 4, // 2^4 feature areas.

  buildingFeatureAreaPadding: 1,

  minBuildingDimensions: { width: 4, height: 4 },
  maxBuildingDimensions: { width: 7, height: 7 },

  numBuildings: 8
};
