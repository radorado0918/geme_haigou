import Phaser from 'phaser';

export class TitleScene extends Phaser.Scene {
  constructor() {
    super('Title');
  }

  create() {
    const { width, height } = this.scale;
    this.add
      .text(width / 2, height / 2 - 40, 'ハイゴウ！モンスター牧場', { fontSize: '56px', color: '#ffffff' })
      .setOrigin(0.5);
    this.add
      .text(width / 2, height / 2 + 30, '試作版 v0.0.2（バトル試遊）', { fontSize: '24px', color: '#aab' })
      .setOrigin(0.5);
    const start = this.add
      .text(width / 2, height / 2 + 120, 'Enter またはクリックでバトル開始', { fontSize: '28px', color: '#ffe066' })
      .setOrigin(0.5);
    this.tweens.add({ targets: start, alpha: 0.3, yoyo: true, repeat: -1, duration: 700 });

    const go = () => this.scene.start('Battle');
    this.input.keyboard!.once('keydown-ENTER', go);
    this.input.once('pointerdown', go);
  }
}
