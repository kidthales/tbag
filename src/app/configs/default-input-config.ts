import { InputConfig, InputName } from '../input';

export const defaultInputConfig: InputConfig[] = [
  { name: InputName.MoveOrMeleeAttackNorth, key: { name: 'UP', emitOnRepeat: true } },
  { name: InputName.MoveOrMeleeAttackNorth, key: { name: 'W', emitOnRepeat: true } },
  { name: InputName.MoveOrMeleeAttackNortheast, key: { name: 'PAGE_UP', emitOnRepeat: true } },
  { name: InputName.MoveOrMeleeAttackNortheast, key: { name: 'E', emitOnRepeat: true } },
  { name: InputName.MoveOrMeleeAttackEast, key: { name: 'RIGHT', emitOnRepeat: true } },
  { name: InputName.MoveOrMeleeAttackEast, key: { name: 'D', emitOnRepeat: true } },
  { name: InputName.MoveOrMeleeAttackSoutheast, key: { name: 'PAGE_DOWN', emitOnRepeat: true } },
  { name: InputName.MoveOrMeleeAttackSoutheast, key: { name: 'C', emitOnRepeat: true } },
  { name: InputName.MoveOrMeleeAttackSouth, key: { name: 'DOWN', emitOnRepeat: true } },
  { name: InputName.MoveOrMeleeAttackSouth, key: { name: 'X', emitOnRepeat: true } },
  { name: InputName.MoveOrMeleeAttackSouthwest, key: { name: 'END', emitOnRepeat: true } },
  { name: InputName.MoveOrMeleeAttackSouthwest, key: { name: 'Z', emitOnRepeat: true } },
  { name: InputName.MoveOrMeleeAttackWest, key: { name: 'LEFT', emitOnRepeat: true } },
  { name: InputName.MoveOrMeleeAttackWest, key: { name: 'A', emitOnRepeat: true } },
  { name: InputName.MoveOrMeleeAttackNorthwest, key: { name: 'HOME', emitOnRepeat: true } },
  { name: InputName.MoveOrMeleeAttackNorthwest, key: { name: 'Q', emitOnRepeat: true } }
];
