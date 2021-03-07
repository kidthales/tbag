import { EntityData } from '../entity-data';

import { TerrainStaticData } from './terrain-static-data';

export type TerrainData = Partial<TerrainStaticData> & EntityData;
