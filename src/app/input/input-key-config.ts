export interface InputKeyConfig {
  name: keyof typeof Phaser.Input.Keyboard.KeyCodes;
  altKey?: boolean;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  enableCapture?: boolean;
  emitOnRepeat?: boolean;
}
