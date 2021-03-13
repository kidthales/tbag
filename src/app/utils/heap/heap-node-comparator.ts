import { HeapNode } from './heap-node';

export type HeapNodeComparator<T = unknown, U = number, V extends HeapNode<T, U> = HeapNode<T, U>> = (
  a: V,
  b: V
) => boolean;
