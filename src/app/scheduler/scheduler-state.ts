import { HeapState } from '../utils';

import { SchedulerNode } from './scheduler-node';

export interface SchedulerState {
  duration: number;
  current: string;
  repeat: string[];
  time: number;
  insertionId: number;
  heap: HeapState<string, number, SchedulerNode>;
}
