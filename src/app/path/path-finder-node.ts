export interface PathFinderNode {
  x: number;
  y: number;
  f?: number;
  g?: number;
  h?: number;
  parent?: PathFinderNode;
}
