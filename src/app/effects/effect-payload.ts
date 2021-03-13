import { ActionUnion } from '../actions';

export interface EffectPayload {
  trigger: ActionUnion;
  skip?: boolean;
}
