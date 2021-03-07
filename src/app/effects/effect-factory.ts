import { EntityUnion } from '../entities';
import { Level } from '../level';

import { Effect } from './effect';

export type EffectFactory<T, U extends EntityUnion = EntityUnion> = (
  timestamp: number,
  entity: EntityUnion,
  level: Level,
  data: T,
  skip?: boolean
) => Effect[];
