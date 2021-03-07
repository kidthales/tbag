import { MoveAction, MoveActionPayload } from '../../actions';

import { Rule } from '../rule';

import { moveRuleApplicator } from './move-rule-applicator';
import { moveRuleValidator } from './move-rule-validator';

export const moveRule: Rule<MoveAction, MoveActionPayload> = {
  validate: moveRuleValidator,
  apply: moveRuleApplicator
};
