import { MoveAction } from './move-action';
import { NoopAction } from './noop-action';

export enum ActionType {
  Noop,
  Move
}

export type ActionUnion = NoopAction | MoveAction;
