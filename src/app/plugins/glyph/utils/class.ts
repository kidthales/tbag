import { mixin } from 'phaser/src/utils/Class';

/**
 * Decorate class prototype with specified mixin objects.
 *
 * @param ctor Class constructor.
 */
export function Mixin(mixins: unknown[]): (ctor: unknown) => void {
  return function (ctor: unknown) {
    mixin(ctor, mixins);
  };
}
