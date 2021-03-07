import { Action, ActionPayload } from '../actions';

import { RuleApplicator } from './rule-applicator';
import { RuleValidator } from './rule-validator';

export interface Rule<T extends Action = Action, U extends ActionPayload = T['payload']> {
  validate: RuleValidator<U>;
  apply: RuleApplicator<U>;
}
