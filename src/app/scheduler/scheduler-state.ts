import { HeapWrapper } from 'rot-js/lib/MinHeap';

export interface SchedulerState {
  defaultDuration: number;
  duration: number;
  current: string;
  repeat: string[];
  queue: {
    time: number;
    events: {
      heap: HeapWrapper<string>[];
      timestamp: number;
    };
  };
}
