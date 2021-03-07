import RNG from 'rot-js/lib/rng';

export function setSeed(seed: number): void {
  RNG.setSeed(seed);
}
