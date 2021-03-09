import { CreatureEntity } from '../../entities';
import { Level } from '../../level';

import { Effect } from '../effect';
import { EffectFactory } from '../effect-factory';
import { EffectType } from '../effect-type';
import { isLevelCellsCulled } from '../is-level-cells-culled';
import { refreshLevelCells } from '../refresh-level-cells';

import { MoveEffectData } from './move-effect-data';

export const creatureMoveEffectFactory: EffectFactory<
  MoveEffectData,
  CreatureEntity
> = function creatureMoveEffectFactory(
  timestamp: number,
  creature: CreatureEntity,
  level: Level,
  { srcCell, dstCell }: MoveEffectData,
  skip = false
): Effect[] {
  if (!creature.gameobject) {
    return [];
  }

  const gameobject = (creature.gameobject as unknown) as Phaser.GameObjects.Components.Transform;

  const dx = dstCell.worldX - srcCell.worldX;
  const dy = dstCell.worldY - srcCell.worldY;

  const finalX = dstCell.worldX + dstCell.tile.width / 2;
  const finalY = dstCell.worldY + dstCell.tile.height / 2;

  if (skip || !gameobject || isLevelCellsCulled(level, [srcCell, dstCell])) {
    if (gameobject) {
      gameobject.setPosition(finalX, finalY);
    }

    refreshLevelCells([srcCell, dstCell]);

    return [];
  }

  const scene = level.levelScene;

  const type = EffectType.Async;
  const ids = [creature.id];

  const duration = 250;
  let halfwayThreshold = false;

  return [
    {
      type,
      ids,
      timestamp,
      run: (callback: () => void, context?: unknown): void => {
        scene.tweens.add({
          targets: gameobject,
          props: {
            x: { value: `+=${dx}`, duration },
            y: { value: `+=${dy}`, duration }
          },
          onUpdate: (tween: Phaser.Tweens.Tween, target: any, ...param: any[]) => {
            if (!halfwayThreshold && tween.progress >= 0.5) {
              halfwayThreshold = true;
              refreshLevelCells([srcCell, dstCell]);
            }
          },
          onUpdateScope: this,
          onComplete: (tween: Phaser.Tweens.Tween, targets: any[], ...param: any[]) => {
            gameobject.setPosition(finalX, finalY);
            callback.call(context || scene);
          },
          onCompleteScope: this
        });
      }
    }
  ];
};
