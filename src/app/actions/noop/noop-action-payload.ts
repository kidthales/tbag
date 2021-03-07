import { ActionPayload } from '../action-payload';

export interface NoopActionPayload extends ActionPayload {
  duration: number;
}
