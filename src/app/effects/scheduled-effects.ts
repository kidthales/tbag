import { EffectUnion } from './effect-union';

export type ScheduledEffects = (EffectUnion | EffectUnion[])[];
