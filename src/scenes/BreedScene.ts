import Phaser from 'phaser';
import { FAMILY_COLORS } from '../battle/Unit';
import { inheritableSkills, inheritableTraits, MAX_INHERITED_SKILLS, previewChild } from '../game/breeding';
import { SKILL_KIND_INFO, SKILL_MAP } from '../game/data/skills';
import { TRAIT_MAP } from '../game/data/traits';
import { getSpecies, levelCap } from '../game/monster';
import { breedInState } from '../game/progress';
import { persist, state } from '../game/store';
import type { Monster } from '../game/types';
import { button, FAMILY_LABEL, monsterCard, monsterIcon, panel, RANK_LABEL, TEXT } from '../ui/ui';

const PER_PAGE = 12;

/** 配合：親を2体選び、継承する技と特性を決めて子を生む */
export class BreedScene extends Phaser.Scene {
  private parentA?: string;
  private parentB?: string;
  private pickedSkills: string[] = [];
  private pickedTrait?: string;
  private page = 0;
  private layer?: Phaser.GameObjects.Container;

  constructor() {
    super('Breed');
  }

  create() {
    this.parentA = undefined;
    this.parentB = undefined;
    this.resetChoices();
    this.page = 0;
    this.add.rectangle(0, 0, 1280, 720, 0x1a1424).setOrigin(0);
    this.render();
  }

  private resetChoices() {
    this.pickedSkills = [];
    this.pickedTrait = undefined;
  }

  private find(uid?: string): Monster | undefined {
    return state().monsters.find((m) => m.uid === uid);
  }

  private pick(uid: string) {
    if (this.parentA === uid) this.parentA = undefined;
    else if (this.parentB === uid) this.parentB = undefined;
    else if (!this.parentA) this.parentA = uid;
    else if (!this.parentB) this.parentB = uid;
    else this.parentB = uid;
    this.resetChoices();
    this.render();
  }

  private render() {
    this.layer?.destroy(true);
    const L = this.add.container(0, 0);
    this.layer = L;
    const s = state();

    L.add(this.add.text(24, 16, '配合', { ...TEXT, fontSize: '32px' }));
    L.add(
      this.add.text(130, 26, '1体目の親の系統を受け継ぎます。配合した親はいなくなります。', {
        ...TEXT,
        fontSize: '17px',
        color: '#c9b8e0',
      }),
    );
    L.add(button(this, 1180, 36, 160, 40, '牧場へ戻る', () => this.scene.start('Ranch'), { color: 0x555f70 }));

    // ---- 親の候補
    L.add(panel(this, 16, 64, 660, 640));
    const pages = Math.max(1, Math.ceil(s.monsters.length / PER_PAGE));
    this.page = Math.min(this.page, pages - 1);
    s.monsters.slice(this.page * PER_PAGE, (this.page + 1) * PER_PAGE).forEach((m, i) => {
      const badge = m.uid === this.parentA ? '親1' : m.uid === this.parentB ? '親2' : undefined;
      L.add(
        monsterCard(this, 28 + (i % 3) * 214, 78 + Math.floor(i / 3) * 76, m, {
          selected: badge !== undefined,
          badge,
          onClick: () => this.pick(m.uid),
        }),
      );
    });
    if (pages > 1) {
      L.add(button(this, 480, 680, 60, 30, '◀', () => this.flip(-1), { fontSize: 16, disabled: this.page === 0 }));
      L.add(this.add.text(526, 670, `${this.page + 1}/${pages}`, { ...TEXT, fontSize: '16px' }));
      L.add(button(this, 610, 680, 60, 30, '▶', () => this.flip(1), { fontSize: 16, disabled: this.page >= pages - 1 }));
    }

    // ---- プレビュー
    L.add(panel(this, 692, 64, 572, 640));
    const a = this.find(this.parentA);
    const b = this.find(this.parentB);
    if (!a || !b) {
      L.add(
        this.add.text(712, 84, a ? '2体目の親を選んでください' : '1体目の親を選んでください\n（子はこの親の系統になります）', {
          ...TEXT,
          fontSize: '20px',
          color: '#c9b8e0',
          lineSpacing: 8,
        }),
      );
      return;
    }

    const { species, byRecipe } = previewChild(a, b);
    const known = s.dex.includes(species.id);
    const r = species.size === 'L' ? 54 : species.size === 'M' ? 44 : 34;
    L.add(monsterIcon(this, 800, 160, species.id, r, { silhouette: !known }));
    if (!known) L.add(this.add.text(800, 160, '？', { ...TEXT, fontSize: '40px' }).setOrigin(0.5));
    const plus = Math.floor((a.plus + b.plus) / 2) + 1;
    const level = Math.max(1, Math.floor((a.level + b.level) / 4));
    L.add(
      this.add.text(
        880,
        100,
        [
          byRecipe ? '★ 特殊配合！' : '系統配合',
          known ? species.name : '？？？',
          `${FAMILY_LABEL[species.family]}系　ランク${RANK_LABEL[species.rank]}`,
          `生まれたときのLv${Math.min(level, levelCap({ speciesId: species.id, plus }))}　＋${plus}`,
        ].join('\n'),
        { ...TEXT, fontSize: '20px', lineSpacing: 8, color: byRecipe ? '#ffe066' : '#fff' },
      ),
    );

    // 継承する技
    const pool = inheritableSkills(a, b);
    L.add(
      this.add.text(712, 240, `引き継ぐ技を選ぶ（${this.pickedSkills.length}/${MAX_INHERITED_SKILLS}）　固有技：${known ? SKILL_MAP[species.signatureSkill].name : '？？？'}`, {
        ...TEXT,
        fontSize: '17px',
      }),
    );
    pool.forEach((id, i) => {
      const on = this.pickedSkills.includes(id);
      const full = !on && this.pickedSkills.length >= MAX_INHERITED_SKILLS;
      const sk = SKILL_MAP[id];
      L.add(
        button(
          this,
          850 + (i % 2) * 270,
          290 + Math.floor(i / 2) * 50,
          256,
          40,
          `${on ? '✔ ' : ''}${sk.name}（${SKILL_KIND_INFO[sk.kind].label}）`,
          () => {
            this.pickedSkills = on ? this.pickedSkills.filter((x) => x !== id) : [...this.pickedSkills, id];
            this.render();
          },
          { fontSize: 16, disabled: full, color: on ? 0x8a4fb8 : 0x3a3550 },
        ),
      );
    });
    if (pool.length === 0) L.add(this.add.text(712, 270, '引き継げる技がありません', { ...TEXT, fontSize: '16px', color: '#889' }));

    // 特性
    const traitTop = 300 + Math.ceil(Math.max(pool.length, 1) / 2) * 50;
    const traits = inheritableTraits(a, b);
    const same = a.trait.id === b.trait.id;
    L.add(
      this.add.text(712, traitTop, `引き継ぐ特性を選ぶ${same ? '（両親が同じ特性なので強化版になる！）' : ''}`, {
        ...TEXT,
        fontSize: '17px',
        color: same ? '#ffe066' : '#fff',
      }),
    );
    if (!this.pickedTrait || !traits.includes(this.pickedTrait)) this.pickedTrait = traits[0];
    traits.forEach((id, i) => {
      const on = this.pickedTrait === id;
      L.add(
        button(
          this,
          850 + i * 270,
          traitTop + 50,
          256,
          40,
          `${on ? '✔ ' : ''}${TRAIT_MAP[id].name}`,
          () => {
            this.pickedTrait = id;
            this.render();
          },
          { fontSize: 16, color: on ? 0x8a4fb8 : 0x3a3550 },
        ),
      );
    });
    if (this.pickedTrait) {
      const t = TRAIT_MAP[this.pickedTrait];
      L.add(
        this.add.text(712, traitTop + 80, same ? t.upgradedDescription : t.description, {
          ...TEXT,
          fontSize: '15px',
          color: '#bcc6d6',
        }),
      );
    }

    L.add(
      button(this, 978, 660, 400, 56, '配合する！', () => this.doBreed(a, b), { color: 0xb8487a, fontSize: 26 }),
    );
  }

  private doBreed(a: Monster, b: Monster) {
    const s = state();
    const child = breedInState(s, a.uid, b.uid, { skills: this.pickedSkills, trait: this.pickedTrait! });
    persist();
    this.parentA = undefined;
    this.parentB = undefined;
    this.resetChoices();
    this.render();
    this.showBirth(child);
  }

  private showBirth(child: Monster) {
    const sp = getSpecies(child.speciesId);
    const overlay = this.add.container(0, 0).setDepth(1000);
    overlay.add(this.add.rectangle(0, 0, 1280, 720, 0x000000, 0.75).setOrigin(0).setInteractive());
    const r = sp.size === 'L' ? 90 : sp.size === 'M' ? 72 : 56;
    const body = monsterIcon(this, 640, 280, sp.id, r);
    const full = body.scaleX;
    body.setScale(0);
    overlay.add(body);
    this.tweens.add({ targets: body, scale: full, duration: 600, ease: 'Back.Out' });
    overlay.add(
      this.add
        .text(640, 430, `${sp.name} が生まれた！`, { ...TEXT, fontSize: '40px', color: '#ffe066' })
        .setOrigin(0.5),
    );
    overlay.add(
      this.add
        .text(
          640,
          486,
          `Lv${child.level}　＋${child.plus}　技：${child.skills.map((id) => SKILL_MAP[id].name).join(' / ')}`,
          { ...TEXT, fontSize: '20px' },
        )
        .setOrigin(0.5),
    );
    overlay.add(
      button(this, 520, 580, 220, 50, '続けて配合', () => overlay.destroy(true), { color: 0x8a4fb8 }),
    );
    overlay.add(button(this, 760, 580, 220, 50, '牧場へ', () => this.scene.start('Ranch')));
  }

  private flip(d: number) {
    this.page += d;
    this.render();
  }
}
