import Phaser from 'phaser';
import { BATTLE_HP_MUL, SIZE_PARAMS, SKILL_PARAMS, moveSpeed } from '../game/combat';
import { SKILL_MAP } from '../game/data/skills';
import { getSpecies, statsOf } from '../game/monster';
import type { Family, Monster, SkillKind, Species, Stats } from '../game/types';

export type Side = 'ally' | 'enemy';

export const FAMILY_COLORS: Record<Family, number> = {
  tool: 0x9aa7b8,
  food: 0xf2b35b,
  weird: 0x9b7fd1,
  beast: 0x6cc4a1,
  warrior: 0xe0584f,
  overlord: 0x3a3f5c,
};

export interface UnitSkill {
  name: string;
  kind: SkillKind;
  cooldown: number;
  /** 残りクールダウン（秒） */
  cd: number;
}

/** バトル中の1体。見た目は仮の図形 */
export class Unit {
  readonly species: Species;
  readonly stats: Stats;
  readonly radius: number;
  readonly speed: number;
  readonly skills: UnitSkill[];
  readonly maxHp: number;
  hp: number;
  facing: 1 | -1;
  vx = 0;
  vy = 0;
  attackCd = 0;
  invuln = 0;
  stun = 0;
  slow = 0;
  confused = 0;
  buffAtk = 0;
  countering = 0;
  dodging = 0;
  dodgeCd = 0;
  /** 敵の攻撃の予備動作（見てから避けられるように） */
  windup?: { t: number; action: () => void };
  aiThink = 0;
  toughUsed = false;
  dead = false;
  controlled = false;

  readonly container: Phaser.GameObjects.Container;
  private readonly bodyShape: Phaser.GameObjects.Ellipse;
  private readonly eye: Phaser.GameObjects.Triangle;
  private readonly ring: Phaser.GameObjects.Ellipse;
  private readonly hpBar: Phaser.GameObjects.Graphics;
  private readonly baseColor: number;

  constructor(
    readonly scene: Phaser.Scene,
    readonly monster: Monster,
    readonly side: Side,
    public x: number,
    public y: number,
    hpMul = 1,
  ) {
    this.species = getSpecies(monster.speciesId);
    this.stats = statsOf(monster);
    this.radius = SIZE_PARAMS[this.species.size].radius;
    this.speed = moveSpeed(this.stats.spd, this.species.size);
    this.maxHp = Math.round(this.stats.hp * BATTLE_HP_MUL * hpMul);
    this.hp = this.maxHp;
    this.facing = side === 'ally' ? 1 : -1;
    this.skills = monster.skills.map((id) => {
      const s = SKILL_MAP[id];
      return { name: s.name, kind: s.kind, cooldown: SKILL_PARAMS[s.kind].cooldown, cd: 0 };
    });

    const r = this.radius;
    this.baseColor = FAMILY_COLORS[this.species.family];
    const shadow = scene.add.ellipse(0, 0, r * 2.2, r * 0.7, 0x000000, 0.3);
    this.ring = scene.add.ellipse(0, 0, r * 2.6, r * 0.9).setStrokeStyle(3, 0xffe066).setVisible(false);
    this.bodyShape = scene.add
      .ellipse(0, -r, r * 2, r * 2.2, this.baseColor)
      .setStrokeStyle(3, side === 'ally' ? 0xffffff : 0x220000);
    this.eye = scene.add.triangle(r * 0.55, -r * 1.2, 0, -7, 0, 7, 12, 0, 0x111111);
    const label = scene.add
      .text(0, -r * 2.4 - 18, this.species.name, {
        fontSize: '14px',
        color: side === 'ally' ? '#ffffff' : '#ffb0b0',
        stroke: '#000',
        strokeThickness: 3,
      })
      .setOrigin(0.5);
    this.hpBar = scene.add.graphics();
    this.container = scene.add.container(x, y, [shadow, this.ring, this.bodyShape, this.eye, label, this.hpBar]);
  }

  get alive() {
    return !this.dead;
  }

  setControlled(v: boolean) {
    this.controlled = v;
    this.ring.setVisible(v);
  }

  /** 攻撃力（バフ込み） */
  get atk() {
    return this.stats.atk * (this.buffAtk > 0 ? 1.3 : 1);
  }

  tick(dt: number) {
    const dec = (v: number) => Math.max(0, v - dt);
    this.attackCd = dec(this.attackCd);
    this.invuln = dec(this.invuln);
    this.stun = dec(this.stun);
    this.slow = dec(this.slow);
    this.confused = dec(this.confused);
    this.buffAtk = dec(this.buffAtk);
    this.countering = dec(this.countering);
    this.dodging = dec(this.dodging);
    this.dodgeCd = dec(this.dodgeCd);
    for (const s of this.skills) s.cd = dec(s.cd);
    // ふっとびの減衰
    this.vx *= Math.pow(0.02, dt);
    this.vy *= Math.pow(0.02, dt);
    if (this.windup) {
      this.windup.t -= dt;
      if (this.windup.t <= 0) {
        const a = this.windup.action;
        this.windup = undefined;
        if (!this.dead && this.stun <= 0) a();
      }
    }
  }

  render() {
    const r = this.radius;
    this.container.setPosition(this.x, this.y);
    this.container.setDepth(this.y);
    this.eye.setX(this.facing * r * 0.55);
    this.eye.setScale(this.facing, 1);

    let color = this.baseColor;
    if (this.windup) color = 0xffffff; // 予備動作は白く光らせる
    else if (this.countering > 0) color = 0x66ccff;
    else if (this.stun > 0) color = 0x777777;
    this.bodyShape.setFillStyle(color);
    this.container.setAlpha(this.dead ? 0 : this.invuln > 0 || this.dodging > 0 ? 0.55 : 1);

    this.hpBar.clear();
    const w = r * 2;
    const yy = -r * 2.4 - 6;
    this.hpBar.fillStyle(0x000000, 0.7).fillRect(-w / 2 - 1, yy - 1, w + 2, 7);
    const ratio = Math.max(0, this.hp / this.maxHp);
    this.hpBar.fillStyle(this.side === 'ally' ? 0x5be37a : 0xe35b5b).fillRect(-w / 2, yy, w * ratio, 5);
  }

  destroy() {
    this.container.destroy();
  }
}
