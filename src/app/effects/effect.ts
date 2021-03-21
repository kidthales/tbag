import { Level, LevelCell } from '../level';
import { EffectPayload } from './effect-payload';
import { EffectPlaybackMode } from './effect-playback-mode';
import { EffectType } from './effect-type';
import { EffectUnion } from './effect-union';

export abstract class Effect<P extends EffectPayload = EffectPayload> {
  public static shareEntityIds(a: Effect, b: Effect): boolean {
    const entityIdsA = a.getEntityIds();
    const entityIdsB = b.getEntityIds();

    return entityIdsA.some((id) => entityIdsB.includes(id));
  }

  protected static refresh(cells: LevelCell[]): void {
    cells.forEach((cell) => cell.refresh());
  }

  public abstract readonly type: EffectType;

  public abstract readonly playbackMode: EffectPlaybackMode;

  public constructor(public readonly timestamp: number, protected level: Level, public readonly payload: P) {}

  public abstract run(callback: (effect?: EffectUnion) => void, context?: unknown): void;

  public abstract getEntityIds(): string[];

  protected isCulled(cells: LevelCell[]): boolean {
    const bounds = this.level.map.cullBounds();
    return !cells.some(({ x, y }) => bounds.contains(x, y) && this.level.visibility.isVisibleToAvatar(x, y));
  }
}
