import Phaser from 'phaser';
import { continueGame, hasSave, startNew } from '../game/store';
import { button, TEXT } from '../ui/ui';

export class TitleScene extends Phaser.Scene {
  constructor() {
    super('Title');
  }

  create() {
    const { width, height } = this.scale;
    this.add
      .text(width / 2, height / 2 - 120, 'ハイゴウ！モンスター牧場', { ...TEXT, fontSize: '56px' })
      .setOrigin(0.5);
    this.add
      .text(width / 2, height / 2 - 50, '試作版 v0.0.3', { ...TEXT, fontSize: '22px', color: '#aab' })
      .setOrigin(0.5);

    const saved = hasSave();
    const cont = () => {
      continueGame();
      this.scene.start('Ranch');
    };
    const fresh = () => {
      startNew();
      this.scene.start('Ranch');
    };
    if (saved) {
      button(this, width / 2, height / 2 + 50, 320, 56, 'つづきから', cont, { fontSize: 24 });
      button(this, width / 2, height / 2 + 125, 320, 56, 'はじめから（データを消す）', fresh, { color: 0x6b3b3b });
    } else {
      button(this, width / 2, height / 2 + 50, 320, 56, 'はじめる', fresh, { fontSize: 24 });
    }
    this.add
      .text(width / 2, height - 40, 'Enter でも始められます', { ...TEXT, fontSize: '16px', color: '#889' })
      .setOrigin(0.5);
    this.input.keyboard!.once('keydown-ENTER', saved ? cont : fresh);
  }
}
