export interface Type<T, P extends Array<unknown> = unknown[]> extends Function {
  new (...args: P): T;
}
