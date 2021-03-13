export function enumKeys<T>(e: T): string[] {
  return Object.keys(e).filter((k) => typeof k === 'string' && isNaN((k as unknown) as number));
}
