import { ArrayBasedMapData } from '../../array-based-map-data';
import { MapType } from '../../map-type';

import { TownMapFeatures } from './town-map-features';

export class TownMapData extends ArrayBasedMapData<TownMapFeatures> {
  public readonly type = MapType.Town;
}
