import { MoveActionDirection } from '../../actions';
import { CardinalDirection, IntercardinalDirection } from '../../map';
import { enumValues } from '../../utils';

export function getRandomMoveActionDirection(rng: Phaser.Math.RandomDataGenerator): MoveActionDirection {
  return rng.pick([...enumValues(CardinalDirection), ...enumValues(IntercardinalDirection)]);
}
