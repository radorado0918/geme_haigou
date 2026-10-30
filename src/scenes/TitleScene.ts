import Phaser from 'phaser';

export class TitleScene extends Phaser.Scene {
  constructor() {
    super('Title');
  }

  create() {
    const { width, height } = this.scale;
    this.add
      .text(width / 2, height / 2, 'ハイゴウ！モンスター牧場', { fontSize: '56px', color: '#ffffff' })
      .setOrigin(0.5);
    this.add
      .text(width / 2, height / 2 + 70, '試作版 v0.0.1', { fontSize: '24px', color: '#aab' })
      .setOrigin(0.5);
  }
}
