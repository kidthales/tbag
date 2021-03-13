import { HeapNode } from './heap-node';
import { HeapNodeComparator } from './heap-node-comparator';
import { HeapState } from './heap-state';

export class Heap<T = unknown, U = number, V extends HeapNode<T, U> = HeapNode<T, U>> {
  protected static getParentNodeIndex(childIndex: number): number {
    return Math.floor((childIndex - 1) / 2);
  }

  protected static getLeftChildNodeIndex(parentIndex: number): number {
    return 2 * parentIndex + 1;
  }

  protected static getRightChildNodeIndex(parentIndex: number): number {
    return 2 * parentIndex + 2;
  }

  protected readonly nodes: V[] = [];

  public constructor(
    public readonly comparator: HeapNodeComparator<T, U, V> = function defaultComparator(a: V, b: V): boolean {
      return a.metric < b.metric ? true : false;
    }
  ) {}

  public get size(): number {
    return this.nodes.length;
  }

  public get state(): HeapState<T, U, V> {
    return { nodes: this.nodes.map((node) => ({ ...node })) };
  }

  public push(node: V): this {
    const location = this.size;
    this.nodes.push(node);
    this.percolateUp(location);
    return this;
  }

  public pop(): V {
    if (!this.size) {
      return;
    }

    const best = this.nodes[0];

    if (this.size > 1) {
      this.nodes[0] = this.nodes.pop();
      this.percolateDown(0);
    } else {
      this.nodes.pop();
    }

    return best as V;
  }

  public find(predicate: (value: V, index: number, obj: V[]) => boolean): V {
    return this.nodes.find(predicate);
  }

  public forEach(callbackfn: (value: V, index: number, array: V[]) => void): void {
    return this.nodes.forEach(callbackfn);
  }

  public remove(
    data: T,
    cmp: (data: T, node: V) => boolean = function defaultCmp(data: T, node: V): boolean {
      return data === node.data;
    }
  ): boolean {
    let index: number;

    for (let i = 0; i < this.size; i++) {
      if (cmp(data, this.nodes[i])) {
        index = i;
      }
    }

    if (index === undefined) {
      return false;
    }

    if (this.size > 1) {
      // If the last one is being removed, do nothing.
      const last = this.nodes.pop();

      if (!cmp(data, last)) {
        this.nodes[index] = last;
        this.percolateDown(index);
      }
    } else {
      this.nodes.pop();
    }

    return true;
  }

  public clear(): void {
    this.nodes.length = 0;
  }

  protected isValidNodeIndex(index: number): boolean {
    return index >= 0 && index < this.nodes.length;
  }

  protected swapNodes(nodeIndexA: number, nodeIndexB: number): void {
    const nodeA = this.nodes[nodeIndexA];
    this.nodes[nodeIndexA] = this.nodes[nodeIndexB];
    this.nodes[nodeIndexB] = nodeA;
  }

  protected getBestNodeIndex(indexes: number[]): number {
    const validIndexes = indexes.filter((index) => this.isValidNodeIndex(index));

    let bestIndex = validIndexes[0];

    validIndexes.forEach((index) => {
      if (this.comparator(this.nodes[index], this.nodes[bestIndex])) {
        bestIndex = index;
      }
    });

    return bestIndex;
  }

  protected percolateUp(index: number): void {
    if (index === 0) {
      return;
    }

    const parentIndex = Heap.getParentNodeIndex(index);

    if (this.isValidNodeIndex(parentIndex) && this.comparator(this.nodes[index], this.nodes[parentIndex])) {
      this.swapNodes(index, parentIndex);
      this.percolateUp(parentIndex);
    }
  }

  protected percolateDown(index: number): void {
    const leftChildIndex = Heap.getLeftChildNodeIndex(index);
    const rightChildIndex = Heap.getRightChildNodeIndex(index);

    if (!this.isValidNodeIndex(leftChildIndex)) {
      return;
    }

    const bestIndex = this.getBestNodeIndex([index, leftChildIndex, rightChildIndex]);

    if (bestIndex !== index) {
      this.swapNodes(index, bestIndex);
      this.percolateDown(bestIndex);
    }
  }
}
