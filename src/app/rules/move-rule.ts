import { MoveAction } from '../actions';
import { EffectUnion, MoveEffect } from '../effects';
import { CreatureEntity, EntityType, PositionComponentData, positionComponentKey } from '../entities';
import { LevelCell } from '../level';
import { translate } from '../map';

import { Rule } from './rule';

export class MoveRule extends Rule<MoveAction> {
  public validate(): ((skipEffects?: boolean) => EffectUnion[]) | false {
    const { actor, direction } = this.action.payload;

    const position = actor.getComponent<PositionComponentData>(positionComponentKey);

    if (!position) {
      return false;
    }

    const { x: srcX, y: srcY } = position;
    const [dstX, dstY] = translate(srcX, srcY, direction);

    const map = this.level.map;
    const srcCell = map.getCell(srcX, srcY);
    const dstCell = map.getCell(dstX, dstY);

    switch (actor.type) {
      case EntityType.Creature:
        return this.validateCreatureMove(actor, srcCell, dstCell);
      case EntityType.Ephemeral:
      case EntityType.Terrain:
      case EntityType.Item:
      default:
        return false;
    }
  }

  protected validateCreatureMove(
    creature: CreatureEntity,
    srcCell: LevelCell,
    dstCell: LevelCell
  ): ((skipEffects?: boolean) => EffectUnion[]) | false {
    if (dstCell.creature || dstCell.blockMove) {
      return false;
    }

    return (skip?: boolean) => {
      const position = creature.getComponent<PositionComponentData>(positionComponentKey);

      srcCell.removeEntity(creature);
      dstCell.addEntity(creature);

      position.x = dstCell.x;
      position.y = dstCell.y;

      this.scheduler.setDuration(this.rng.integerInRange(1, 2));

      return [new MoveEffect(this.scheduler.currentTime, this.level, { trigger: this.action, skip, srcCell, dstCell })];
    };
  }
}
