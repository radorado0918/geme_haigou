import Phaser from 'phaser';
import { FAMILY_COLORS } from '../battle/Unit';
import { artKey } from '../game/data/art';
import { getSpecies } from '../game/monster';
import type { Family, Monster } from '../game/types';

export const RANK_LABEL = ['', 'D', 'C', 'B', 'A', 'S'];

export const FAMILY_LABEL: Record<Family, string> = {
  tool: '日用品',
  food: '食べもの',
  weird: '怪異',
  beast: '生きもの',
  warrior: '闘士',
  overlord: '魔王',
};

export const TEXT = { fontFamily: 'sans-serif', color: '#ffffff' };

/** クリックできるボタン。disabled のときは押せない */
export function button(
  scene: Phaser.Scene,
  x: number,
  y: number,
  w: number,
  h: number,
  label: string,
  onClick: () => void,
  opts: { disabled?: boolean; color?: number; fontSize?: number } = {},
): Phaser.GameObjects.Container {
  const color = opts.disabled ? 0x3a3f4a : (opts.color ?? 0x3d6fb6);
  const bg = scene.add.rectangle(0, 0, w, h, color).setStrokeStyle(2, 0xffffff, opts.disabled ? 0.2 : 0.6);
  const text = scene.add
    .text(0, 0, label, { ...TEXT, fontSize: `${opts.fontSize ?? 20}px`, color: opts.disabled ? '#888' : '#fff' })
    .setOrigin(0.5);
  const c = scene.add.container(x, y, [bg, text]);
  if (!opts.disabled) {
    bg.setInteractive({ useHandCursor: true })
      .on('pointerover', () => bg.setFillStyle(Phaser.Display.Color.ValueToColor(color).lighten(15).color))
      .on('pointerout', () => bg.setFillStyle(color))
      .on('pointerdown', onClick);
  }
  return c;
}

/** モンスターの小さなカード（仮の絵として系統の色の丸を描く） */
export function monsterCard(
  scene: Phaser.Scene,
  x: number,
  y: number,
  m: Monster,
  opts: { selected?: boolean; badge?: string; onClick?: () => void; dim?: boolean } = {},
): Phaser.GameObjects.Container {
  const s = getSpecies(m.speciesId);
  const w = 200;
  const h = 64;
  const bg = scene.add
    .rectangle(0, 0, w, h, opts.selected ? 0x4a4520 : 0x232a36)
    .setOrigin(0)
    .setStrokeStyle(2, opts.selected ? 0xffe066 : 0x445066);
  const r = s.size === 'L' ? 22 : s.size === 'M' ? 18 : 14;
  const icon = monsterIcon(scene, 32, h / 2, s.id, r);
  const name = scene.add.text(62, 8, s.name, { ...TEXT, fontSize: '15px' });
  const info = scene.add.text(62, 32, `${RANK_LABEL[s.rank]}  Lv${m.level}${m.plus ? `  +${m.plus}` : ''}`, {
    ...TEXT,
    fontSize: '14px',
    color: '#bcc6d6',
  });
  const items: Phaser.GameObjects.GameObject[] = [bg, icon, name, info];
  if (opts.badge) {
    items.push(
      scene.add.text(w - 6, h - 6, opts.badge, { ...TEXT, fontSize: '13px', color: '#ffe066' }).setOrigin(1, 1),
    );
  }
  const c = scene.add.container(x, y, items);
  if (opts.dim) c.setAlpha(0.4);
  if (opts.onClick) bg.setInteractive({ useHandCursor: true }).on('pointerdown', opts.onClick);
  return c;
}

export function panel(scene: Phaser.Scene, x: number, y: number, w: number, h: number) {
  return scene.add.rectangle(x, y, w, h, 0x1a2029).setOrigin(0).setStrokeStyle(2, 0x334055);
}

/** モンスターの絵（なければ系統の色の丸）。size はおおよその半径 */
export function monsterIcon(
  scene: Phaser.Scene,
  x: number,
  y: number,
  speciesId: string,
  size: number,
  opts: { silhouette?: boolean } = {},
): Phaser.GameObjects.GameObject & Phaser.GameObjects.Components.Transform {
  const key = artKey(speciesId);
  if (scene.textures.exists(key)) {
    const img = scene.add.image(x, y, key);
    img.setScale((size * 2.6) / Math.max(img.width, img.height));
    if (opts.silhouette) img.setTintFill(0x000000);
    return img;
  }
  const s = getSpecies(speciesId);
  return scene.add
    .circle(x, y, size, opts.silhouette ? 0x000000 : FAMILY_COLORS[s.family])
    .setStrokeStyle(2, opts.silhouette ? 0x8a6fb0 : 0xffffff);
}
