import { PathFinderNode } from './path-finder-node';

export class PathFinder {
  public static manhattanDistance(begin: Phaser.Geom.Point, end: Phaser.Geom.Point): number {
    return Math.abs(begin.x - end.x) + Math.abs(begin.y - end.y);
  }

  public static diagonalDistance(begin: Phaser.Geom.Point, end: Phaser.Geom.Point): number {
    return Math.max(Math.abs(begin.x - end.x), Math.abs(begin.y - end.y));
  }

  public static euclideanDistance(begin: Phaser.Geom.Point, end: Phaser.Geom.Point): number {
    return Math.sqrt(Math.pow(begin.x - end.x, 2) + Math.pow(begin.y - end.y, 2));
  }

  protected readonly open = new Map<string, PathFinderNode>();

  protected readonly closed = new Map<string, PathFinderNode>();

  public find(
    begin: Phaser.Geom.Point,
    end: Phaser.Geom.Point,
    fringe: (node: PathFinderNode) => PathFinderNode[],
    g: (node: PathFinderNode) => number = (node) => (node.parent?.g || 0) + 1,
    h: (goal: Phaser.Geom.Point, node: PathFinderNode) => number = (goal, { x, y }) =>
      PathFinder.manhattanDistance(new Phaser.Geom.Point(x, y), goal)
  ): Phaser.Geom.Point[] {
    const { open } = this;

    this.initSearch(begin);

    let found = false;

    while (!found && open.size) {
      const q = this.getFromOpenSet();
      const successors = fringe(q);

      for (let successor of successors) {
        successor.parent = q;

        if (successor.x === end.x && successor.y === end.y) {
          this.addToClosedSet(successor);
          found = true;
          break;
        }

        successor.g = g(successor);
        successor.h = h(end, successor);
        successor.f = successor.g + successor.h;

        if (this.isInOpenSet(successor)) {
          continue;
        }

        if (this.isInClosedSet(successor)) {
          continue;
        }

        this.addToOpenSet(successor);
      }

      this.addToClosedSet(q);
    }

    if (!found) {
      return;
    }

    return this.getPath(end);
  }

  protected initSearch(begin: Phaser.Geom.Point): void {
    this.open.clear();
    this.closed.clear();

    const { x, y } = begin;
    this.addToOpenSet({ x, y, f: 0, g: 0 });
  }

  protected addToOpenSet(node: PathFinderNode): void {
    const { x, y } = node;
    this.open.set(`${x},${y}`, node);
  }

  protected isInOpenSet(node: PathFinderNode): boolean {
    const open = this.open;
    const { x, y, f } = node;
    const key = `${x},${y}`;

    return open.has(key) && open.get(key).f < f;
  }

  protected getFromOpenSet(): PathFinderNode {
    const open = this.open;
    const best = { key: '', f: Infinity };

    open.forEach((node, key) => {
      if (node.f < best.f) {
        best.key = key;
        best.f = node.f;
      }
    });

    const key = best.key;
    const node = open.get(key);

    open.delete(key);

    return node;
  }

  protected addToClosedSet(node: PathFinderNode): void {
    const { x, y } = node;
    this.closed.set(`${x},${y}`, node);
  }

  protected isInClosedSet(node: PathFinderNode): boolean {
    const closed = this.closed;
    const { x, y, f } = node;
    const key = `${x},${y}`;

    return closed.has(key) && closed.get(key).f < f;
  }

  protected getPath(end: Phaser.Geom.Point): Phaser.Geom.Point[] {
    const closed = this.closed;
    const path: Phaser.Geom.Point[] = [];

    let node = closed.get(`${end.x},${end.y}`);

    while (node) {
      path.push(new Phaser.Geom.Point(node.x, node.y));
      node = closed.get(`${node.parent?.x},${node.parent?.y}`);
    }

    return path.reverse();
  }
}
