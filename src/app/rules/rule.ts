import { ActionUnion } from '../actions';
import { EffectUnion } from '../effects';
import { Level } from '../level';
import { Scheduler } from '../scheduler';

export abstract class Rule<T extends ActionUnion = ActionUnion> {
  public constructor(
    protected readonly level: Level,
    protected readonly scheduler: Scheduler,
    protected readonly rng: Phaser.Math.RandomDataGenerator,
    protected readonly action: T
  ) {}

  public abstract validate(): ((skipEffects?: boolean) => EffectUnion[]) | false;
}
