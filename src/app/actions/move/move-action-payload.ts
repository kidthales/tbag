import { ActionPayload } from '../action-payload';

import { MoveActionDirection } from './move-action-direction';

export interface MoveActionPayload extends ActionPayload {
  direction: MoveActionDirection;
}
