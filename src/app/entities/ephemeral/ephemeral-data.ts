import { EntityData } from '../entity-data';

import { EphemeralStaticData } from './ephemeral-static-data';

export type EphemeralData = Partial<EphemeralStaticData> & EntityData;
