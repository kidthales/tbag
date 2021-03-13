import { HeapNode } from '../utils';

export interface SchedulerNode extends HeapNode<string, number> {
  insertionId: number;
}
