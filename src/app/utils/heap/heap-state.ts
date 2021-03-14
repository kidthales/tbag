import { JSONObject } from '../json';

import { HeapNode } from './heap-node';

export interface HeapState<T = unknown, U = number, V extends HeapNode<T, U> & JSONObject = HeapNode<T, U> & JSONObject>
  extends JSONObject {
  nodes: V[];
}
