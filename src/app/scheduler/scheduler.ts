import { Heap } from '../utils';

import { SchedulerNode } from './scheduler-node';
import { SchedulerState } from './scheduler-state';

export class Scheduler {
  protected static readonly tickId = 'tick';

  protected static readonly tickInsertionId = 0;

  protected static readonly tickEventName = 'tick';

  protected static readonly defaultDuration = 1;

  protected static clampTime(time: number): number {
    return time >= 0 ? time : Scheduler.defaultDuration;
  }

  protected readonly heap = new Heap<string, number, SchedulerNode>((a, b) =>
    a.metric === b.metric ? a.insertionId < b.insertionId : a.metric < b.metric
  );

  protected readonly eventEmitter = new Phaser.Events.EventEmitter();

  protected time = 0;

  protected insertionId = 0;

  protected repeat: string[] = [];

  protected current: string;

  protected duration = Scheduler.defaultDuration;

  public constructor(state?: SchedulerState) {
    if (!state) {
      this.initTick();
    } else {
      this.load(state);
    }
  }

  public get length(): number {
    return this.heap.size - 1;
  }

  public get currentTime(): number {
    return this.time;
  }

  public get state(): SchedulerState {
    return {
      duration: this.duration,
      current: this.current,
      repeat: this.repeat,
      time: this.time,
      insertionId: this.insertionId,
      heap: this.heap.state
    };
  }

  public load(state: SchedulerState): this {
    this.duration = state.duration;
    this.repeat = state.repeat;
    this.time = state.time;
    this.insertionId = state.insertionId;

    this.heap.clear();
    state.heap.nodes.forEach((node) => this.heap.push({ ...node }));

    this.heap.push({ data: state.current, metric: 0, insertionId: Scheduler.tickInsertionId });

    return this;
  }

  public add(id: string, repeat: boolean, initialDelay = Scheduler.defaultDuration): this {
    if (id === Scheduler.tickId) {
      return this;
    }

    this.heap.push({ data: id, metric: initialDelay, insertionId: ++this.insertionId });

    if (repeat) {
      this.repeat.push(id);
    }

    return this;
  }

  public getTimeUntil(id: string): number {
    const node = this.heap.find((node) => node.data === id);
    return node ? node.metric : undefined;
  }

  public reset(resetEventEmitter?: boolean): this {
    this.time = 0;
    return this.clear(resetEventEmitter);
  }

  public clear(resetEventEmitter?: boolean): this {
    this.resetDuration();

    this.heap.clear();
    this.insertionId = 0;
    this.repeat = [];
    this.current = undefined;

    if (resetEventEmitter) {
      this.eventEmitter.removeAllListeners();
    }

    this.initTick();

    return this;
  }

  public remove(id: string): boolean {
    if (id === Scheduler.tickId) {
      return false;
    }

    if (id === this.current) {
      this.resetDuration();
    }

    const result = this.heap.remove(id);
    const index = this.repeat.indexOf(id);

    if (index != -1) {
      this.repeat.splice(index, 1);
    }

    if (this.current === id) {
      this.current = undefined;
    }

    return result;
  }

  public next(): string {
    if (!this.length) {
      return;
    }

    const getNext = () => {
      if (this.current !== undefined && this.repeat.indexOf(this.current) != -1) {
        const { current: data, duration: metric } = this;

        const insertionId = data === Scheduler.tickId || metric === 0 ? Scheduler.tickInsertionId : ++this.insertionId;

        this.heap.push({ data, metric, insertionId });
        this.resetDuration();
      }

      return (this.current = this.getNext());
    };

    let id = getNext();

    while (id === Scheduler.tickId) {
      this.eventEmitter.emit(Scheduler.tickEventName, this.time);
      id = getNext();
    }

    return id;
  }

  public setDuration(time): this {
    if (this.current !== undefined) {
      this.duration = Scheduler.clampTime(time);
    }

    return this;
  }

  public onTick(listener: (time: number) => void, context?: unknown): this {
    this.eventEmitter.on(Scheduler.tickEventName, listener, context);
    return this;
  }

  protected initTick(): void {
    this.heap.push({ data: Scheduler.tickId, metric: 0, insertionId: Scheduler.tickInsertionId });
    this.repeat.push(Scheduler.tickId);
  }

  protected resetDuration(): void {
    this.duration = Scheduler.defaultDuration;
  }

  protected getNext(): string {
    if (!this.heap.size) {
      return;
    }

    let { metric: time, data: id } = this.heap.pop();

    if (time > 0) {
      this.time += time;
      this.heap.forEach((node) => (node.metric -= time));
    }

    return id;
  }
}
