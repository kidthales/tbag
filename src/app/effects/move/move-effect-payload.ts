import { LevelCell } from '../../level';

import { EffectPayload } from '../effect-payload';

export interface MoveEffectPayload extends EffectPayload {
  srcCell: LevelCell;
  dstCell: LevelCell;
}
