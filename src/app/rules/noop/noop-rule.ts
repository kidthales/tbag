import { NoopAction, NoopActionPayload } from '../../actions';

import { Rule } from '../rule';

import { noopRuleApplicator } from './noop-rule-applicator';
import { noopRuleValidator } from './noop-rule-validator';

export const noopRule: Rule<NoopAction, NoopActionPayload> = {
  validate: noopRuleValidator,
  apply: noopRuleApplicator
};
