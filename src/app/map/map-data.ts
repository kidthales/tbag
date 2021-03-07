import { MapCell } from './map-cell';
import { MapFeatures } from './map-features';
import { MapType } from './map-type';

export abstract class MapData<T, V extends MapFeatures = MapFeatures> {
  public abstract readonly type: MapType;

  protected cells: T;

  public constructor(public readonly width: number, public readonly height: number, public readonly features: V) {}

  public abstract getCell(x: number, y: number): MapCell;

  public abstract setCell(x: number, y: number, cell: MapCell): this;
}
