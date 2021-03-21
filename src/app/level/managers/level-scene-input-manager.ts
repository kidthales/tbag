import { MoveAction, MoveActionDirection } from '../../actions';
import { defaultInputConfig } from '../../configs';
import { EffectUnion } from '../../effects';
import { PositionComponentData, positionComponentKey } from '../../entities';
import { InputName } from '../../input';
import { Direction, translate } from '../../map';
import { GlyphTilemapLayer } from '../../plugins/glyph';
import { validate } from '../../rules';
import { ConfirmGameOverPopup } from '../../ui';

import { Level } from '../level';
import { LevelCell } from '../level-cell';

export class LevelSceneInputManager {
  public allowInput = false;

  protected inputMap: Record<InputName, () => void> = {
    [InputName.TriggerGameOver]: () => this.onTriggerGameOver(),
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
            level.graphics.clearPathTooltip();
            this.allowInput = false;
            this.inputMap[inputName]();
          }
        },
        this
      );
    });

    scene.input.topOnly = false;

    //scene.input.on(Phaser.Input.Events.GAMEOBJECT_DOWN, (pointer, gameObject) => console.log(pointer, gameObject));
    //scene.input.on(Phaser.Input.Events.GAMEOBJECT_UP, (pointer, gameObject) => console.log(pointer, gameObject));

    let currentMoveCell: LevelCell;
    scene.input.on(Phaser.Input.Events.GAMEOBJECT_MOVE, (pointer, gameObject) => {
      if (!this.allowInput) {
        return;
      }

      if (gameObject instanceof GlyphTilemapLayer) {
        this.allowInput = false;

        const { worldX, worldY } = pointer;
        const cell = level.map.getCellAtWorldXY(worldX, worldY);

        if (currentMoveCell && currentMoveCell.x === cell.x && currentMoveCell.y === cell.y) {
          this.allowInput = true;
          return;
        }

        currentMoveCell = cell;

        if (!cell.exploredByAvatar || !cell.visibleToAvatar || cell.blockMove) {
          level.graphics.clearPathTooltip();
          this.allowInput = true;
          return;
        }

        const { x, y } = scene.avatar.getComponent<PositionComponentData>(positionComponentKey);

        const begin = new Phaser.Geom.Point(x, y);
        const end = new Phaser.Geom.Point(cell.x, cell.y);

        if (cell.creature) {
          const points = level.map.getBresenhamPath(begin, end).map(({ x, y }) => new Phaser.Geom.Point(x, y));
          level.graphics.clearPathTooltip().setPathTooltipStyle({ width: 5, color: 0xff0000 }).drawPathTooltip(points);

          this.allowInput = true;
          return;
        }

        const points = level.map
          .getPath(begin, end, (cell) =>
            level.map.getNeighbors(cell).filter((cell) => cell.exploredByAvatar && cell.visibleToAvatar)
          )
          .map(({ x, y }) => new Phaser.Geom.Point(x, y));
        level.graphics.clearPathTooltip().setPathTooltipStyle({ width: 5, color: 0x00ff00 }).drawPathTooltip(points);

        this.allowInput = true;
      }
    });

    scene.input.on(Phaser.Input.Events.GAMEOBJECT_OUT, (pointer, gameObject) => {
      if (gameObject instanceof GlyphTilemapLayer) {
        level.graphics.clearPathTooltip();
      }
    });
  }

  protected onTriggerGameOver(): void {
    const { centerX, centerY } = this.level.levelScene.levelCamera;
    const popup = new ConfirmGameOverPopup(
      this.level.world.scene,
      centerX,
      centerY,
      () => {
        popup.destroy();
        this.level.world.gameOver();
      },
      () => {
        popup.destroy();
        this.allowInput = true;
      }
    );
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

    const dstCell = this.level.map.getCell(dstX, dstY);

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
