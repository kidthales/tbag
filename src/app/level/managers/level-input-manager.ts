import { MoveAction, MoveActionDirection } from '../../actions';
import { defaultInputConfig } from '../../configs';
import { EffectUnion } from '../../effects';
import { PositionComponentData, positionComponentKey } from '../../entities';
import { InputName } from '../../input';
import { Direction, translate } from '../../map';
import { validate } from '../../rules';

import { Level } from '../level';

export class LevelInputManager {
  public allowInput = false;

  protected inputMap: Record<InputName, () => void> = {
    [InputName.MoveOrDefaultActionNorth]: () => this.onMoveOrDefaultActionNorth(),
    [InputName.MoveOrDefaultActionNortheast]: () => this.onMoveOrDefaultActionNortheast(),
    [InputName.MoveOrDefaultActionEast]: () => this.onMoveOrDefaultActionEast(),
    [InputName.MoveOrDefaultActionSoutheast]: () => this.onMoveOrDefaultActionSoutheast(),
    [InputName.MoveOrDefaultActionSouth]: () => this.onMoveOrDefaultActionSouth(),
    [InputName.MoveOrDefaultActionSouthwest]: () => this.onMoveOrDefaultActionSouthwest(),
    [InputName.MoveOrDefaultActionWest]: () => this.onMoveOrDefaultActionWest(),
    [InputName.MoveOrDefaultActionNorthwest]: () => this.onMoveOrDefaultActionNorthwest()
  };

  public constructor(
    protected readonly level: Level,
    protected readonly rng: Phaser.Math.RandomDataGenerator,
    protected readonly afterAction: (effects: EffectUnion[]) => void
  ) {
    const scene = level.levelScene;

    defaultInputConfig.forEach((config) => {
      const {
        name: inputName,
        key: { name: keyName, altKey, ctrlKey, shiftKey, emitOnRepeat }
      } = config;
      let {
        key: { enableCapture }
      } = config;

      if (enableCapture === undefined) {
        enableCapture = true;
      }

      const key = scene.input.keyboard.addKey(keyName, enableCapture, emitOnRepeat);

      key.on(
        Phaser.Input.Keyboard.Events.DOWN,
        (event: KeyboardEvent) => {
          if (!this.allowInput || (altKey && !key.altKey) || (ctrlKey && !key.ctrlKey) || (shiftKey && !key.shiftKey)) {
            return;
          }

          if (this.inputMap[inputName]) {
            this.allowInput = false;
            this.inputMap[inputName]();
          }
        },
        this
      );
    });
  }

  protected onMoveOrDefaultActionNorth(): void {
    this.attemptMoveOrDefaultAction(Direction.North);
  }

  protected onMoveOrDefaultActionNortheast(): void {
    this.attemptMoveOrDefaultAction(Direction.Northeast);
  }

  protected onMoveOrDefaultActionEast(): void {
    this.attemptMoveOrDefaultAction(Direction.East);
  }

  protected onMoveOrDefaultActionSoutheast(): void {
    this.attemptMoveOrDefaultAction(Direction.Southeast);
  }

  protected onMoveOrDefaultActionSouth(): void {
    this.attemptMoveOrDefaultAction(Direction.South);
  }

  protected onMoveOrDefaultActionSouthwest(): void {
    this.attemptMoveOrDefaultAction(Direction.Southwest);
  }

  protected onMoveOrDefaultActionWest(): void {
    this.attemptMoveOrDefaultAction(Direction.West);
  }

  protected onMoveOrDefaultActionNorthwest(): void {
    this.attemptMoveOrDefaultAction(Direction.Northwest);
  }

  protected attemptMoveOrDefaultAction(direction: MoveActionDirection): void {
    const { x: srcX, y: srcY } = this.level.levelScene.avatar.getComponent<PositionComponentData>(positionComponentKey);
    const [dstX, dstY] = translate(srcX, srcY, direction);

    const dstCell = this.level.getCell(dstX, dstY);

    if (dstCell.creature) {
      // TODO: Resolve default action based on dstCell contents...
      this.allowInput = true;
    } else {
      this.attemptMove(direction);
    }
  }

  protected attemptMove(direction: MoveActionDirection): void {
    const level = this.level;
    const rng = this.rng;
    const scene = level.levelScene;

    const {
      avatar,
      world: { scheduler }
    } = scene;

    const moveAction = new MoveAction({ actor: avatar, direction });
    const applyAction = validate(moveAction, level, scheduler, rng);

    if (applyAction) {
      const effects = applyAction();
      this.afterAction(effects);
    } else {
      this.allowInput = true;
    }
  }
}
