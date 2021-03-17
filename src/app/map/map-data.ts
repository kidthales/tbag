import { LevelType } from '../level';

import { MapCell } from './map-cell';
import { MapFeatures } from './map-features';

export abstract class MapData<T = unknown, V extends MapFeatures = MapFeatures> {
  public abstract readonly type: LevelType;

  protected cells: T;

  public constructor(public readonly width: number, public readonly height: number, public readonly features: V) {}

  public abstract getCell(x: number, y: number): MapCell;

  public abstract setCell(x: number, y: number, cell: MapCell): this;
}
