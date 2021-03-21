import PreciseShadowcasting from 'rot-js/lib/fov/precise-shadowcasting';

import { FieldOfViewCell } from './field-of-view-cell';

export class FieldOfView {
  protected readonly fov: PreciseShadowcasting;

  public constructor(visibility: (x: number, y: number) => boolean) {
    this.fov = new PreciseShadowcasting(visibility);
  }

  public find(x: number, y: number, radius: number): FieldOfViewCell[] {
    const cells: FieldOfViewCell[] = [];
    this.fov.compute(x, y, radius, (x, y, radius, visibility) => cells.push({ x, y, radius, visibility }));
    return cells;
  }
}
