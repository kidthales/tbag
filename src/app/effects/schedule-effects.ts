import { Effect } from './effect';
import { EffectPlaybackMode } from './effect-playback-mode';
import { EffectUnion } from './effect-union';
import { ScheduledEffects } from './scheduled-effects';

export function scheduleEffects(effects: EffectUnion[]): ScheduledEffects {
  const scheduledEffects: ScheduledEffects = [];

  let concurrent: EffectUnion[] = [];

  function pushConcurrent(): void {
    if (!concurrent.length) {
      return;
    }

    scheduledEffects.push(concurrent);
    concurrent = [];
  }

  effects.forEach((effect) => {
    switch (effect.playbackMode) {
      case EffectPlaybackMode.Async:
        if (concurrent.some((prev) => Effect.shareEntityIds(effect, prev))) {
          pushConcurrent();
        }
        concurrent.push(effect);
        break;
      //case EffectPlaybackMode.Sync:
      default:
        pushConcurrent();
        scheduledEffects.push(effect);
        break;
    }
  });

  pushConcurrent();

  return scheduledEffects;
}
