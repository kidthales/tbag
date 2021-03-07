import { Direction } from '../../direction';

export interface TownMapBuildingFeature {
  bounds: Phaser.Geom.Rectangle;
  building: Phaser.Geom.Rectangle;
  entrance: Phaser.Geom.Point;
  entranceFace: Direction;
}
