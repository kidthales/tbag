import { CreatureEntity, EntityType, EntityUnion } from '../entity';
import { Level, LevelCell } from '../level';

import { CreateEffect, Effect, EffectType } from './effect';

export interface MoveEffectData {
  srcCell: LevelCell;
  dstCell: LevelCell;
}

export const createMoveEffect: CreateEffect<MoveEffectData> = function createMoveEffect(
  timestamp: number,
  entity: EntityUnion,
  level: Level,
  data: MoveEffectData,
  skip = false
): Effect[] {
  switch (entity.type) {
    case EntityType.Creature:
      return createCreatureMoveEffect(timestamp, entity, level, data, skip);
    case EntityType.Ephemeral:
    case EntityType.Terrain:
    case EntityType.Item:
    default:
      return [];
  }
};

function createCreatureMoveEffect(
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

  if (skip || !gameobject || isCulled(level, srcCell, dstCell)) {
    if (gameobject) {
      gameobject.x += dx;
      gameobject.y += dy;
    }

    updateCreatureMoveEffectCells(srcCell, dstCell);
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
              updateCreatureMoveEffectCells(srcCell, dstCell);
            }
          },
          onUpdateScope: this,
          onComplete: (tween: Phaser.Tweens.Tween, targets: any[], ...param: any[]) => callback.call(context || scene),
          onCompleteScope: this
        });
      }
    }
  ];
}

function isCulled(level: Level, srcCell: LevelCell, dstCell: LevelCell): boolean {
  const bounds = level.cullBounds();
  return !bounds.contains(srcCell.x, srcCell.y) && !bounds.contains(dstCell.x, dstCell.y);
}

function updateCreatureMoveEffectCells(src: LevelCell, dst: LevelCell): void {
  src.refresh();
  dst.refresh();
}
