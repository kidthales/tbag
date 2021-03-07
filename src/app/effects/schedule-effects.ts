import { Effect } from './effect';
import { EffectType } from './effect-type';
import { ScheduledEffects } from './scheduled-effects';

export function scheduleEffects(effects: Effect[]): ScheduledEffects {
  const scheduledEffects: ScheduledEffects = [];

  let concurrent: Effect[] = [];
  let concurrentIds: string[] = [];

  function pushConcurrent(): void {
    if (!concurrent.length) {
      return;
    }

    scheduledEffects.push(concurrent);
    concurrent = [];
  }

  effects.forEach((effect) => {
    if (effect.type === EffectType.Sync) {
      pushConcurrent();
      scheduledEffects.push(effect);
      return;
    }

    const ids = effect.ids;
    let candidateIds: string[] = [];

    for (let i = 0; i < ids.length; ++i) {
      const id = ids[i];

      if (concurrentIds.includes(id)) {
        pushConcurrent();
        concurrentIds.length = 0;
        candidateIds = ids;
        break;
      }

      candidateIds.push(id);
    }

    concurrentIds.concat(candidateIds);
    concurrent.push(effect);
  });

  pushConcurrent();

  return scheduledEffects;
}
