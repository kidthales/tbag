import { entityStaticDataIdConfig } from '../../../configs';

import { Direction } from '../../direction';
import { MapCell } from '../../map-cell';
import { MapDataGenerator } from '../map-data-generator';

import { TownMapData } from './town-map-data';
import { TownMapBuildingFeature } from './town-map-building-feature';

export class TownMapDataGenerator extends MapDataGenerator<TownMapData> {
  protected static readonly mapDimensions = {
    min: { width: 80, height: 25 },
    max: { width: 80, height: 25 }
  };

  protected static readonly featureAreaOffset = new Phaser.Geom.Point(2, 2);

  protected static readonly featureAreaBinaryPartitionDepth = 4; // 2^4 feature areas.

  protected static readonly buildingFeatureAreaPadding = 1;

  protected static readonly buildingDimensions = {
    min: { width: 4, height: 4 },
    max: { width: 7, height: 7 }
  };

  protected static readonly numBuildings = 8;

  protected readonly mapData: TownMapData;

  public constructor(seed: string[]) {
    super(seed);

    const mapDimensions = this.getRandomDimensions(
      TownMapDataGenerator.mapDimensions.min,
      TownMapDataGenerator.mapDimensions.max
    );

    this.mapData = new TownMapData(mapDimensions.width, mapDimensions.height, { exterior: true });
  }

  public generate(): TownMapData {
    this.assignInitialTerrain();

    const featureAreas = this.getFeatureAreas();

    this.assignBuildingFeatures(featureAreas);

    this.mapData.features.unusedAreas = featureAreas;

    return this.mapData;
  }

  protected assignInitialTerrain(): void {
    const { width, height } = this.mapData;
    const { floor, wall } = entityStaticDataIdConfig.terrain;

    for (let y = 0; y < height; ++y) {
      for (let x = 0; x < width; ++x) {
        this.mapData.setCell(x, y, new MapCell(floor));
      }
    }

    this.forEachPerimeterCell((cell) => (cell.terrainStaticDataId = wall), this, 0, 0, width, height);
  }

  protected getFeatureAreas(): Phaser.Geom.Rectangle[] {
    const { width, height } = this.mapData;
    const { x, y } = TownMapDataGenerator.featureAreaOffset;

    return TownMapDataGenerator.binaryPartition(
      new Phaser.Geom.Rectangle(x, y, width - 2 * x, height - 2 * y),
      TownMapDataGenerator.featureAreaBinaryPartitionDepth
    );
  }

  protected assignBuildingFeatures(availableAreas: Phaser.Geom.Rectangle[]): void {
    const mapData = this.mapData;
    const { wall, entrance } = entityStaticDataIdConfig.terrain;

    mapData.features.buildings = [];

    for (let i = 0; i < TownMapDataGenerator.numBuildings; ++i) {
      if (!availableAreas.length) {
        break;
      }

      const area = Phaser.Utils.Array.SpliceOne(availableAreas, this.rng.integerInRange(0, availableAreas.length - 1));

      const buildingFeature = this.getBuildingFeature(area);
      const building = buildingFeature.building;

      this.forEachCell(
        (cell) => (cell.terrainStaticDataId = wall),
        this,
        building.x,
        building.y,
        building.width,
        building.height
      );

      const { x, y } = buildingFeature.entrance;
      mapData.getCell(x, y).terrainStaticDataId = entrance;

      mapData.features.buildings.push(buildingFeature);
    }
  }

  protected getBuildingFeature(area: Phaser.Geom.Rectangle): TownMapBuildingFeature {
    const { buildingFeatureAreaPadding, buildingDimensions } = TownMapDataGenerator;

    const width = this.rng.integerInRange(
      buildingDimensions.min.width,
      Phaser.Math.Clamp(
        buildingDimensions.max.width,
        buildingDimensions.min.width,
        area.width - 2 * buildingFeatureAreaPadding
      )
    );

    const height = this.rng.integerInRange(
      buildingDimensions.min.height,
      Phaser.Math.Clamp(
        buildingDimensions.max.height,
        buildingDimensions.min.height,
        area.height - 2 * buildingFeatureAreaPadding
      )
    );

    const x = this.rng.integerInRange(
      area.x + buildingFeatureAreaPadding,
      area.right - width - buildingFeatureAreaPadding
    );
    const y = this.rng.integerInRange(
      area.y + buildingFeatureAreaPadding,
      area.bottom - height - buildingFeatureAreaPadding
    );

    const building = new Phaser.Geom.Rectangle(x, y, width, height);
    let entrance: Phaser.Geom.Point;

    const getPoint = (accessor: string): Phaser.Geom.Point => {
      return this.rng
        .shuffle((building[accessor]() as Phaser.Geom.Line).getPoints<Phaser.Geom.Point[]>(0, 1).slice(1))
        .pop();
    };

    const entranceFace = this.rng.shuffle([Direction.North, Direction.East, Direction.South, Direction.West]).pop();

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
}
