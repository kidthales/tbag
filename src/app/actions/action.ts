import { ActionPayload } from './action-payload';
import { ActionType } from './action-type';

export abstract class Action<P extends ActionPayload = ActionPayload> {
  public abstract readonly type: ActionType;

  public constructor(public readonly payload: P) {}
}
