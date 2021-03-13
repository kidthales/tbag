import { NoopAction } from '../actions';
import { EffectUnion } from '../effects';

import { Rule } from './rule';

export class NoopRule extends Rule<NoopAction> {
  protected static defaultDuration = 1;

  public validate(): ((skipEffects?: boolean) => EffectUnion[]) | false {
    return () => {
      const duration = this.action.payload.duration;
      this.scheduler.setDuration(duration > 0 ? duration : NoopRule.defaultDuration);
      return [];
    };
  }
}
