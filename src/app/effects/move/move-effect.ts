import { Effect } from '../effect';
import { EffectPlaybackMode } from '../effect-playback-mode';
import { EffectType } from '../effect-type';
import { EffectUnion } from '../effect-union';

import { MoveEffectPayload } from './move-effect-payload';

export class MoveEffect extends Effect<MoveEffectPayload> {
  public readonly type = EffectType.Move;

  public readonly playbackMode = EffectPlaybackMode.Async;

  public run(callback?: (effect: EffectUnion) => void, context?: unknown): void {
    const { trigger, skip, srcCell, dstCell } = this.payload;

    const scene = this.level.levelScene;
    const actor = trigger.payload?.actor;

    const gameobject = (actor.gameobject as unknown) as Phaser.GameObjects.Components.Transform;

    const dx = dstCell.worldX - srcCell.worldX;
    const dy = dstCell.worldY - srcCell.worldY;

    const finalX = dstCell.worldX + dstCell.tile.width / 2;
    const finalY = dstCell.worldY + dstCell.tile.height / 2;

    if (skip || !gameobject || this.isCulled([srcCell, dstCell])) {
      if (gameobject) {
        gameobject.setPosition(finalX, finalY);
      }

      Effect.refresh([srcCell, dstCell]);
      callback.call(context || scene);

      return;
    }

    const duration = 250;
    let halfwayThreshold = false;

    scene.tweens.add({
      targets: gameobject,
      props: {
        x: { value: `+=${dx}`, duration },
        y: { value: `+=${dy}`, duration }
      },
      onUpdate: (tween: Phaser.Tweens.Tween, target: any, ...param: any[]) => {
        if (!halfwayThreshold && tween.progress >= 0.5) {
          halfwayThreshold = true;
          Effect.refresh([srcCell, dstCell]);
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

  public getEntityIds(): string[] {
    return [this.payload.trigger.payload.actor.id];
  }
}
