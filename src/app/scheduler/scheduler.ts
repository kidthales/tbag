import ActionScheduler from 'rot-js/lib/scheduler/action';

import { SchedulerState } from './scheduler-state';

export class Scheduler {
  protected static readonly tickId = 'tick';

  protected static readonly tickEventName = 'tick';

  protected readonly eventEmitter = new Phaser.Events.EventEmitter();

  protected readonly scheduler = new ActionScheduler<string>();

  public constructor(state?: SchedulerState) {
    if (!state) {
      this.scheduler.add(Scheduler.tickId, true, 0);
    } else {
      this.load(state);
    }
  }

  public get length(): number {
    return this.scheduler._queue._events.len() - 1;
  }

  public get time(): number {
    return this.scheduler.getTime();
  }

  public get state(): SchedulerState {
    return {
      defaultDuration: this.scheduler._defaultDuration,
      duration: this.scheduler._duration,
      current: this.scheduler._current,
      repeat: this.scheduler._repeat,
      queue: {
        time: this.scheduler._queue._time,
        events: {
          heap: this.scheduler._queue._events['heap'],
          timestamp: this.scheduler._queue._events['timestamp']
        }
      }
    };
  }

  public load(state: SchedulerState): this {
    this.scheduler._defaultDuration = state.defaultDuration;
    this.scheduler._duration = state.duration;
    this.scheduler._current = state.current;
    this.scheduler._repeat = state.repeat;

    this.scheduler._queue._time = state.queue.time;

    this.scheduler._queue._events['heap'] = state.queue.events.heap;
    this.scheduler._queue._events['timestamp'] = state.queue.events.timestamp;

    return this;
  }

  public add(id: string, repeat: boolean, initialDelay = 1): this {
    if (id === Scheduler.tickId) {
      return null;
    }

    this.scheduler.add(id, repeat, initialDelay);
    return this;
  }

  public getTimeUntil(id: string): number {
    return this.scheduler.getTimeOf(id);
  }

  public clear(): this {
    this.scheduler.clear();
    this.scheduler.add(Scheduler.tickId, true);
    return this;
  }

  public remove(id: string): boolean {
    if (id === Scheduler.tickId) {
      return false;
    }

    return this.scheduler.remove(id);
  }

  public next(): string {
    if (!this.length) {
      return null;
    }

    let id = this.scheduler.next();

    while (id === Scheduler.tickId) {
      this.eventEmitter.emit(Scheduler.tickEventName, this.time);
      id = this.scheduler.next();
    }

    return id;
  }

  public setDuration(time: number): this {
    this.scheduler.setDuration(time);
    return this;
  }

  public onTick(listener: (time: number) => void, context?: unknown): this {
    this.eventEmitter.on(Scheduler.tickEventName, listener, context);
    return this;
  }
}
