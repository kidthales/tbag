import { EntityData } from '../entity-data';

import { CreatureStaticData } from './creature-static-data';

export type CreatureData = Partial<CreatureStaticData> & EntityData;
