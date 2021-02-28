import { CardinalDirection, IntercardinalDirection } from '../map';

import { Action, ActionPayload } from './action';
import { ActionType } from './type';

export type MoveActionDirection = CardinalDirection | IntercardinalDirection;

export interface MoveActionPayload extends ActionPayload {
  direction: MoveActionDirection;
}

export class MoveAction extends Action<MoveActionPayload> {
  public readonly type = ActionType.Move;
}
