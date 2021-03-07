export function normalizeSeed(seed: string | string[]): number {
  return (Array.isArray(seed) ? seed : [seed]).reduce((t, s) => {
    for (let i = 0; i < s.length; ++i) {
      t += s.codePointAt(i);
    }

    return t;
  }, 0);
}
