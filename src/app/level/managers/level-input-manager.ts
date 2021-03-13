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
    [InputName.MoveOrMeleeAttackNorth]: () => this.onMoveOrMeleeAttackNorth(),
    [InputName.MoveOrMeleeAttackNortheast]: () => this.onMoveOrMeleeAttackNortheast(),
    [InputName.MoveOrMeleeAttackEast]: () => this.onMoveOrMeleeAttackEast(),
    [InputName.MoveOrMeleeAttackSoutheast]: () => this.onMoveOrMeleeAttackSoutheast(),
    [InputName.MoveOrMeleeAttackSouth]: () => this.onMoveOrMeleeAttackSouth(),
    [InputName.MoveOrMeleeAttackSouthwest]: () => this.onMoveOrMeleeAttackSouthwest(),
    [InputName.MoveOrMeleeAttackWest]: () => this.onMoveOrMeleeAttackWest(),
    [InputName.MoveOrMeleeAttackNorthwest]: () => this.onMoveOrMeleeAttackNorthwest()
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

  protected onMoveOrMeleeAttackNorth(): void {
    this.attemptMoveOrMeleeAttack(Direction.North);
  }

  protected onMoveOrMeleeAttackNortheast(): void {
    this.attemptMoveOrMeleeAttack(Direction.Northeast);
  }

  protected onMoveOrMeleeAttackEast(): void {
    this.attemptMoveOrMeleeAttack(Direction.East);
  }

  protected onMoveOrMeleeAttackSoutheast(): void {
    this.attemptMoveOrMeleeAttack(Direction.Southeast);
  }

  protected onMoveOrMeleeAttackSouth(): void {
    this.attemptMoveOrMeleeAttack(Direction.South);
  }

  protected onMoveOrMeleeAttackSouthwest(): void {
    this.attemptMoveOrMeleeAttack(Direction.Southwest);
  }

  protected onMoveOrMeleeAttackWest(): void {
    this.attemptMoveOrMeleeAttack(Direction.West);
  }

  protected onMoveOrMeleeAttackNorthwest(): void {
    this.attemptMoveOrMeleeAttack(Direction.Northwest);
  }

  protected attemptMoveOrMeleeAttack(direction: MoveActionDirection): void {
    const { x: srcX, y: srcY } = this.level.levelScene.avatar.getComponent<PositionComponentData>(positionComponentKey);
    const [dstX, dstY] = translate(srcX, srcY, direction);

    const dstCell = this.level.getCell(dstX, dstY);

    if (dstCell.creature) {
      // TODO: Attack...
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
