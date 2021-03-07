import { Action } from '../action';
import { ActionType } from '../action-type';

import { NoopActionPayload } from './noop-action-payload';

export class NoopAction extends Action<NoopActionPayload> {
  public readonly type = ActionType.Noop;
}
