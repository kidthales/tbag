import { EffectType } from './effect-type';

export interface Effect {
  type: EffectType;
  ids: string[];
  timestamp: number;
  run: (callback: () => void, context?: unknown) => void;
}
