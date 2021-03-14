import { InputConfig, InputName } from '../input';

export const defaultInputConfig: InputConfig[] = [
  { name: InputName.TriggerGameOver, key: { name: 'K', altKey: true, ctrlKey: true, shiftKey: true } },
  { name: InputName.MoveOrDefaultActionNorth, key: { name: 'UP', emitOnRepeat: true } },
  { name: InputName.MoveOrDefaultActionNorth, key: { name: 'W', emitOnRepeat: true } },
  { name: InputName.MoveOrDefaultActionNortheast, key: { name: 'PAGE_UP', emitOnRepeat: true } },
  { name: InputName.MoveOrDefaultActionNortheast, key: { name: 'E', emitOnRepeat: true } },
  { name: InputName.MoveOrDefaultActionEast, key: { name: 'RIGHT', emitOnRepeat: true } },
  { name: InputName.MoveOrDefaultActionEast, key: { name: 'D', emitOnRepeat: true } },
  { name: InputName.MoveOrDefaultActionSoutheast, key: { name: 'PAGE_DOWN', emitOnRepeat: true } },
  { name: InputName.MoveOrDefaultActionSoutheast, key: { name: 'C', emitOnRepeat: true } },
  { name: InputName.MoveOrDefaultActionSouth, key: { name: 'DOWN', emitOnRepeat: true } },
  { name: InputName.MoveOrDefaultActionSouth, key: { name: 'X', emitOnRepeat: true } },
  { name: InputName.MoveOrDefaultActionSouthwest, key: { name: 'END', emitOnRepeat: true } },
  { name: InputName.MoveOrDefaultActionSouthwest, key: { name: 'Z', emitOnRepeat: true } },
  { name: InputName.MoveOrDefaultActionWest, key: { name: 'LEFT', emitOnRepeat: true } },
  { name: InputName.MoveOrDefaultActionWest, key: { name: 'A', emitOnRepeat: true } },
  { name: InputName.MoveOrDefaultActionNorthwest, key: { name: 'HOME', emitOnRepeat: true } },
  { name: InputName.MoveOrDefaultActionNorthwest, key: { name: 'Q', emitOnRepeat: true } }
];
