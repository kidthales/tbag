import { enumKeys } from './enum-keys';

export function enumValues<T>(e: T): T[keyof T][] {
  return enumKeys(e).map((k) => e[k]);
}
