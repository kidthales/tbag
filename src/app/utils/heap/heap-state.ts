import { HeapNode } from './heap-node';

export interface HeapState<T = unknown, U = number, V extends HeapNode<T, U> = HeapNode<T, U>> {
  nodes: V[];
}
