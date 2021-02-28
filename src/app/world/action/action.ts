import { EntityUnion } from '../entity';

import { ActionType } from './type';

export interface ActionPayload {
  actor: EntityUnion;
}

export abstract class Action<P extends ActionPayload> {
  public abstract readonly type: ActionType;

  public constructor(public readonly payload?: P) {}
}
