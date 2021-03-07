import { MoveAction } from './move';
import { NoopAction } from './noop';

export type ActionUnion = NoopAction | MoveAction;
