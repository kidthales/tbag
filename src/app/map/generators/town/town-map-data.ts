import { LevelType } from '../../../level';

import { ArrayBasedMapData } from '../../array-based-map-data';

import { TownMapFeatures } from './town-map-features';

export class TownMapData extends ArrayBasedMapData<TownMapFeatures> {
  public readonly type = LevelType.Town;
}
