import { MapFeatures } from '../../map-features';

import { TownMapBuildingFeature } from './town-map-building-feature';

export interface TownMapFeatures extends MapFeatures {
  buildings?: TownMapBuildingFeature[];
}
