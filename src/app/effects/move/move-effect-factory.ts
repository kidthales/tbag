import { EntityType, EntityUnion } from '../../entities';
import { Level } from '../../level';

import { Effect } from '../effect';
import { EffectFactory } from '../effect-factory';

import { creatureMoveEffectFactory } from './creature-move-effect-factory';
import { MoveEffectData } from './move-effect-data';

export const moveEffectFactory: EffectFactory<MoveEffectData> = function moveEffectFactory(
  timestamp: number,
  entity: EntityUnion,
  level: Level,
  data: MoveEffectData,
  skip = false
): Effect[] {
  switch (entity.type) {
    case EntityType.Creature:
      return creatureMoveEffectFactory(timestamp, entity, level, data, skip);
    case EntityType.Ephemeral:
    case EntityType.Terrain:
    case EntityType.Item:
    default:
      return [];
  }
};
