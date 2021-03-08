import { EntityData } from '../entities/entity-data';

import { AvatarStaticData } from './avatar-static-data';

export type AvatarData = Partial<AvatarStaticData> & EntityData;
