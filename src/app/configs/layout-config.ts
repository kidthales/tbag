import { Font } from '../plugins/glyph';

const maxWidth = 1600;
const maxHeight = 900;

export const layoutConfig = {
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: maxWidth,
    height: maxHeight
  },
  mainScene: {
    newGame: {
      newGamePopup: new Phaser.Geom.Rectangle(0, 0, maxWidth, maxHeight)
    },
    inWorld: {
      font: new Font(28, 'monospace'),
      leftHud: new Phaser.Geom.Rectangle(0, 0, 100, maxHeight),
      worldViewport: new Phaser.Geom.Rectangle(110, 10, 1250, 720),
      rightHud: new Phaser.Geom.Rectangle(1350, 0, 250, maxHeight),
      bottomHud: new Phaser.Geom.Rectangle(100, 720, 1250, 200)
    }
  }
};
