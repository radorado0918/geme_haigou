import Phaser from 'phaser';
import { TitleScene } from './scenes/TitleScene';

new Phaser.Game({
  type: Phaser.AUTO,
  width: 1280,
  height: 720,
  backgroundColor: '#1d2330',
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  scene: [TitleScene],
});
