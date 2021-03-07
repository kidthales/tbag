import { EntityData } from '../entity-data';

import { ItemStaticData } from './item-static-data';

export type ItemData = Partial<ItemStaticData> & EntityData;
