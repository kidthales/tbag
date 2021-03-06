export interface Type<T, P extends Array<unknown> = unknown[]> extends Function {
  new (...args: P): T;
}

export type JSONPrimitive = string | number | boolean | null;
export type JSONValue = JSONPrimitive | JSONObject | JSONArray;
export type JSONObject = { [key: string]: JSONValue };
export interface JSONArray extends Array<JSONValue> {}

export function enumKeys<T>(e: T): string[] {
  return Object.keys(e).filter((k) => typeof k === 'string' && isNaN((k as unknown) as number));
}

export function enumValues<T>(e: T): T[keyof T][] {
  return enumKeys(e).map((k) => e[k]);
}
