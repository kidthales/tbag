import { CreatureEntity } from '../entities';

import { AvatarData } from './avatar-data';

export class AvatarEntity extends CreatureEntity<AvatarData> {
  public static readonly id = 'avatar';

  public constructor(staticDataId: number, data?: AvatarData, gameobject?: Phaser.GameObjects.GameObject) {
    super(AvatarEntity.id, staticDataId, data, gameobject);
  }

  public refresh(): this {
    if (!this.gameobject) {
      return this;
    }

    return this;
  }
}
