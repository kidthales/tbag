import RNG from 'rot-js/lib/rng';

import { Dimensions } from './dimensions';

export function getRandomDimensions(min: Dimensions, max: Dimensions): Dimensions {
  return {
    width: RNG.getUniformInt(min.width, max.width),
    height: RNG.getUniformInt(min.height, max.height)
  };
}
