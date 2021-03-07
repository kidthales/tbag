import { Action } from '../action';
import { ActionType } from '../action-type';

import { MoveActionPayload } from './move-action-payload';

export class MoveAction extends Action<MoveActionPayload> {
  public readonly type = ActionType.Move;
}
