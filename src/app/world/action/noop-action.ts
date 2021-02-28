import { Action, ActionPayload } from './action';
import { ActionType } from './type';

export interface NoopActionPayload extends ActionPayload {
  duration: number;
}

export class NoopAction extends Action<NoopActionPayload> {
  public readonly type = ActionType.Noop;
}
