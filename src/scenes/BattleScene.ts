import Phaser from 'phaser';
import { ATTACK_PARAMS, SIZE_PARAMS, SKILL_PARAMS, damage, switchCooldown } from '../game/combat';
import type { SkillKind } from '../game/types';
import { demoParty, demoWaves, type WaveEnemy } from '../battle/setup';
import { Unit } from '../battle/Unit';

const ARENA = { left: 40, right: 1240, top: 170, bottom: 580 };

interface Projectile {
  x: number;
  y: number;
  vx: number;
  vy: number;
  owner: Unit;
  power: number;
  life: number;
  slow: boolean;
  gfx: Phaser.GameObjects.Arc;
}

interface Trap {
  x: number;
  y: number;
  r: number;
  owner: Unit;
  power: number;
  life: number;
  tick: number;
  gfx: Phaser.GameObjects.Ellipse;
}

const SKILL_KEYS = ['U', 'I', 'O'];

export class BattleScene extends Phaser.Scene {
  allies: Unit[] = [];
  enemies: Unit[] = [];
  controlledIdx = 0;
  switchCd = 0;
  elapsed = 0;
  ended: 'win' | 'lose' | null = null;
  private waves: WaveEnemy[][] = [];
  private waveIdx = 0;
  private waveDelay = 0;
  private projectiles: Projectile[] = [];
  private traps: Trap[] = [];
  private keys!: Record<string, Phaser.Input.Keyboard.Key>;
  private hud!: Phaser.GameObjects.Graphics;
  private hudTexts: Phaser.GameObjects.Text[] = [];
  private topText!: Phaser.GameObjects.Text;

  constructor() {
    super('Battle');
  }

  create() {
    this.allies = [];
    this.enemies = [];
    this.projectiles = [];
    this.traps = [];
    this.controlledIdx = 0;
    this.switchCd = 0;
    this.elapsed = 0;
    this.ended = null;
    this.waveIdx = 0;
    this.waveDelay = 0;

    this.drawArena();

    this.keys = this.input.keyboard!.addKeys('W,A,S,D,J,K,U,I,O,Q,E,R,T,SPACE') as Record<string, Phaser.Input.Keyboard.Key>;

    demoParty().forEach((m, i) => {
      this.allies.push(new Unit(this, m, 'ally', 220 - (i % 2) * 60, 260 + i * 120));
    });
    this.allies[0].setControlled(true);

    this.waves = demoWaves();
    this.spawnWave();

    this.hud = this.add.graphics().setDepth(10000);
    this.topText = this.add
      .text(20, 14, '', { fontSize: '20px', color: '#fff', stroke: '#000', strokeThickness: 4 })
      .setDepth(10001);
    this.add
      .text(
        1260,
        14,
        'WASD 移動 / J 攻撃 / K・Space 回避 / U I O 技 / Q E 交代',
        { fontSize: '16px', color: '#ccd', stroke: '#000', strokeThickness: 3 },
      )
      .setOrigin(1, 0)
      .setDepth(10001);
    this.hudTexts = [];
    for (let i = 0; i < 3; i++) {
      this.hudTexts.push(
        this.add.text(30 + i * 410, 610, '', { fontSize: '15px', color: '#fff', lineSpacing: 4 }).setDepth(10001),
      );
    }

    (window as unknown as { __battle: BattleScene }).__battle = this;
  }

  private drawArena() {
    const g = this.add.graphics().setDepth(-1000);
    g.fillStyle(0x2c3a2f).fillRect(0, 0, 1280, 720);
    g.fillStyle(0x3f5a43).fillRect(ARENA.left - 20, ARENA.top - 30, ARENA.right - ARENA.left + 40, ARENA.bottom - ARENA.top + 50);
    g.lineStyle(1, 0x4c6b50);
    for (let y = ARENA.top; y <= ARENA.bottom; y += 40) g.lineBetween(ARENA.left - 20, y, ARENA.right + 20, y);
    g.fillStyle(0x151a22).fillRect(0, 600, 1280, 120);
  }

  private spawnWave() {
    const wave = this.waves[this.waveIdx];
    wave.forEach((e, i) => {
      const y = wave.length === 1 ? 380 : 220 + i * (330 / Math.max(1, wave.length - 1));
      this.enemies.push(new Unit(this, e.monster, 'enemy', 1000 + (i % 2) * 120, y, e.hpMul ?? 1));
    });
    const boss = wave.some((e) => e.boss);
    this.banner(boss ? 'ボス出現！' : `WAVE ${this.waveIdx + 1}`);
  }

  // ---------------------------------------------------------------- update

  update(_time: number, deltaMs: number) {
    const dt = Math.min(deltaMs / 1000, 0.05);
    if (!this.ended) this.elapsed += dt;
    this.switchCd = Math.max(0, this.switchCd - dt);

    const all = [...this.allies, ...this.enemies];
    for (const u of all) if (u.alive) u.tick(dt);

    if (!this.ended) {
      this.handleInput(dt);
      for (const u of all) if (u.alive && !u.controlled) this.runAi(u, dt);
    }
    this.updateProjectiles(dt);
    this.updateTraps(dt);
    this.moveUnits(all, dt);
    for (const u of all) u.render();

    this.checkEnd(dt);
    this.drawHud();

    if (this.ended) {
      if (Phaser.Input.Keyboard.JustDown(this.keys.R)) this.scene.restart();
      if (Phaser.Input.Keyboard.JustDown(this.keys.T)) this.scene.start('Title');
    }
  }

  private get player(): Unit {
    return this.allies[this.controlledIdx];
  }

  private handleInput(dt: number) {
    const u = this.player;
    if (!u.alive) return;
    const k = this.keys;
    if (Phaser.Input.Keyboard.JustDown(k.Q)) return this.switchRelative(-1);
    if (Phaser.Input.Keyboard.JustDown(k.E)) return this.switchRelative(1);
    if (u.stun > 0 || u.dodging > 0) return;

    let mx = (k.D.isDown ? 1 : 0) - (k.A.isDown ? 1 : 0);
    let my = (k.S.isDown ? 1 : 0) - (k.W.isDown ? 1 : 0);
    if (u.confused > 0) {
      mx = -mx;
      my = -my;
    }
    if (mx !== 0) u.facing = mx > 0 ? 1 : -1;
    const len = Math.hypot(mx, my) || 1;
    const sp = u.speed * (u.slow > 0 ? 0.5 : 1);
    u.x += (mx / len) * sp * dt;
    u.y += (my / len) * sp * dt * 0.75;

    if ((Phaser.Input.Keyboard.JustDown(k.K) || Phaser.Input.Keyboard.JustDown(k.SPACE)) && u.dodgeCd <= 0) {
      const dx = mx === 0 && my === 0 ? u.facing : mx / len;
      const dy = mx === 0 && my === 0 ? 0 : my / len;
      u.dodging = 0.25;
      u.invuln = 0.3;
      u.dodgeCd = 0.6;
      u.vx = dx * 1000;
      u.vy = dy * 700;
      return;
    }
    if (k.J.isDown && u.attackCd <= 0) this.attack(u);
    SKILL_KEYS.forEach((key, i) => {
      if (Phaser.Input.Keyboard.JustDown(k[key])) this.trySkill(u, i);
    });
  }

  // ---------------------------------------------------------------- 交代

  private switchRelative(dir: 1 | -1) {
    for (let step = 1; step < this.allies.length; step++) {
      const idx = (this.controlledIdx + dir * step + this.allies.length * 2) % this.allies.length;
      if (this.allies[idx].alive) {
        this.switchTo(idx);
        return;
      }
    }
  }

  switchTo(idx: number, forced = false) {
    const next = this.allies[idx];
    if (idx === this.controlledIdx || !next.alive) return;
    if (!forced && this.switchCd > 0) return;
    this.player.setControlled(false);
    this.controlledIdx = idx;
    next.setControlled(true);
    next.windup = undefined;
    this.switchCd = switchCooldown(next.monster.trait);

    const trait = next.monster.trait;
    if (trait.id === 'entry_guard') next.invuln = Math.max(next.invuln, trait.level === 2 ? 2 : 1);
    if (forced) return;
    // 登場技
    const entry = next.species.entrySkill;
    const mul = trait.id === 'proud_pose' ? 1.5 : 1;
    this.popup(next.x, next.y - next.radius * 2.6 - 30, `交代！ ${entry.name}`, '#ffe066', 22);
    this.performSkill(next, entry.kind, mul);
    if (trait.id === 'proud_pose' && trait.level === 2) {
      this.time.delayedCall(450, () => next.alive && this.performSkill(next, entry.kind, mul));
    }
  }

  // ---------------------------------------------------------------- AI

  private runAi(u: Unit, dt: number) {
    if (u.stun > 0 || u.windup || u.dodging > 0) return;
    const foes = this.opponents(u);
    if (foes.length === 0) return;
    if (u.confused > 0) {
      u.x += Math.sin(this.elapsed * 7 + u.y) * u.speed * dt;
      return;
    }
    const t = this.nearest(u, foes)!;
    const dir = Math.sign(t.x - u.x) || 1;
    const ranged = ATTACK_PARAMS[u.species.attackStyle].projectile;
    const gap = ranged ? 260 : u.radius + t.radius + ATTACK_PARAMS[u.species.attackStyle].reach * 0.6;
    const tx = t.x - dir * gap;
    const ty = t.y;
    const dx = tx - u.x;
    const dy = ty - u.y;
    const dist = Math.hypot(dx, dy);
    // 敵は少しゆっくり動く（避けやすくする）
    const sp = u.speed * (u.slow > 0 ? 0.5 : 1) * (u.side === 'enemy' ? 0.75 : 1);
    if (dist > 10) {
      u.x += (dx / dist) * sp * dt;
      u.y += (dy / dist) * sp * dt;
    }
    u.facing = dir as 1 | -1;

    const inRange = Math.abs(dx) < 40 && Math.abs(dy) < 30;
    if (inRange && u.attackCd <= 0) {
      if (u.side === 'enemy') {
        u.attackCd = ATTACK_PARAMS[u.species.attackStyle].cooldown + 0.6;
        u.windup = { t: 0.35, action: () => this.attack(u) };
      } else {
        this.attack(u);
      }
    }

    u.aiThink -= dt;
    if (u.aiThink <= 0) {
      u.aiThink = u.side === 'enemy' ? 2 + Math.random() * 2.5 : 1.2 + Math.random() * 1.5;
      const ready = u.skills.map((s, i) => ({ s, i })).filter(({ s }) => s.cd <= 0);
      const near = Math.hypot(t.x - u.x, t.y - u.y) < 320;
      if (ready.length > 0 && near) {
        const pick = ready[Math.floor(Math.random() * ready.length)];
        if (u.side === 'enemy') {
          pick.s.cd = pick.s.cooldown;
          this.popup(u.x, u.y - u.radius * 2.6 - 30, pick.s.name, '#ff9090', 18);
          u.windup = { t: 0.55, action: () => this.performSkill(u, pick.s.kind, 1) };
        } else {
          this.trySkill(u, pick.i);
        }
      }
    }
  }

  // ---------------------------------------------------------------- 攻撃と技

  attack(u: Unit) {
    const p = ATTACK_PARAMS[u.species.attackStyle];
    u.attackCd = Math.max(u.attackCd, p.cooldown);
    if (p.projectile) {
      this.shoot(u, p.power, 0, false);
      return;
    }
    u.x += u.facing * p.lunge;
    this.slashFx(u, p.reach);
    this.meleeHit(u, p.reach, p.power, p.knock);
  }

  trySkill(u: Unit, slot: number) {
    const s = u.skills[slot];
    if (!s || s.cd > 0) return;
    s.cd = s.cooldown;
    this.popup(u.x, u.y - u.radius * 2.6 - 30, s.name, u.side === 'ally' ? '#9fe8ff' : '#ff9090', 18);
    this.performSkill(u, s.kind, 1);
  }

  performSkill(u: Unit, kind: SkillKind, mul: number) {
    const power = SKILL_PARAMS[kind].power * mul;
    switch (kind) {
      case 'area': {
        this.ringFx(u.x, u.y, 130, 0xffd27f);
        this.circleHit(u, u.x, u.y, 130, power, 180);
        this.cameras.main.shake(120, 0.004);
        break;
      }
      case 'trap': {
        const life = u.monster.trait.id === 'trap_master' ? 6 : 4;
        if (u.monster.trait.id !== 'trap_master' || u.monster.trait.level < 2) {
          // 1体が置ける罠は1つ（しかけ上手の強化版は2つ）
          for (const t of this.traps.filter((t) => t.owner === u)) t.life = 0;
        }
        const x = u.x + u.facing * 80;
        const gfx = this.add.ellipse(x, u.y, 160, 56, 0x9fe8ff, 0.25).setStrokeStyle(2, 0x9fe8ff).setDepth(-10);
        this.traps.push({ x, y: u.y, r: 80, owner: u, power, life, tick: 0, gfx });
        break;
      }
      case 'dash': {
        this.meleeHit(u, 220, power, 200);
        u.vx = u.facing * 1100;
        u.invuln = Math.max(u.invuln, 0.2);
        this.slashFx(u, 220);
        break;
      }
      case 'shot': {
        for (const a of [-0.22, 0, 0.22]) this.shoot(u, power, a, true);
        break;
      }
      case 'counter': {
        u.countering = 1.0;
        break;
      }
      case 'status': {
        this.slashFx(u, 180, 0xc59bff);
        for (const t of this.opponents(u)) {
          if (this.inFront(u, t, 180, 60)) {
            this.hit(u, t, power, 30);
            t.confused = 2.5;
            t.stun = Math.max(t.stun, 0.6);
            this.popup(t.x, t.y - t.radius * 2.6, '混乱', '#c59bff', 16);
          }
        }
        break;
      }
      case 'throw': {
        const t = this.opponents(u).find((t) => this.inFront(u, t, 110, 50));
        if (!t) break;
        this.hit(u, t, power, 0);
        t.vx = -u.facing * 900 * SIZE_PARAMS[t.species.size].knockMul;
        t.stun = Math.max(t.stun, 0.8);
        this.cameras.main.shake(150, 0.006);
        break;
      }
      case 'aerial': {
        const foes = this.opponents(u);
        const t = this.nearest(u, foes);
        const tx = t && Math.abs(t.x - u.x) < 400 ? t.x : u.x + u.facing * 200;
        const ty = t && Math.abs(t.x - u.x) < 400 ? t.y : u.y;
        u.invuln = Math.max(u.invuln, 0.5);
        this.tweens.add({ targets: u.container, scaleX: 1.3, scaleY: 1.3, yoyo: true, duration: 220 });
        this.time.delayedCall(450, () => {
          if (u.dead) return;
          u.x = tx;
          u.y = ty;
          this.ringFx(tx, ty, 100, 0xff8a65);
          this.circleHit(u, tx, ty, 100, power, 220);
          this.cameras.main.shake(140, 0.006);
        });
        break;
      }
      case 'buff': {
        for (const f of this.friends(u)) {
          f.buffAtk = 6;
          this.ringFx(f.x, f.y, f.radius * 1.5, 0xffe066);
        }
        break;
      }
    }
  }

  private shoot(u: Unit, power: number, angle: number, slow: boolean) {
    const range = u.monster.trait.id === 'long_reach' ? (u.monster.trait.level === 2 ? 1.6 : 1.3) : 1;
    const gfx = this.add.circle(u.x, u.y - u.radius, 8, u.side === 'ally' ? 0x9fe8ff : 0xff9090);
    this.projectiles.push({
      x: u.x + u.facing * u.radius,
      y: u.y,
      vx: u.facing * 620 * Math.cos(angle),
      vy: 620 * Math.sin(angle),
      owner: u,
      power,
      life: 0.7 * range,
      slow,
      gfx,
    });
  }

  private inFront(u: Unit, t: Unit, reach: number, depth: number) {
    const dx = (t.x - u.x) * u.facing;
    return dx > -t.radius && dx < u.radius + reach + t.radius && Math.abs(t.y - u.y) < depth + t.radius * 0.5;
  }

  private meleeHit(u: Unit, reach: number, power: number, knock: number) {
    for (const t of this.opponents(u)) if (this.inFront(u, t, reach, 30)) this.hit(u, t, power, knock);
  }

  private circleHit(u: Unit, x: number, y: number, r: number, power: number, knock: number) {
    for (const t of this.opponents(u)) {
      if (Math.hypot(t.x - x, (t.y - y) * 1.6) < r + t.radius) this.hit(u, t, power, knock, x);
    }
  }

  hit(src: Unit, t: Unit, power: number, knock: number, fromX = src.x) {
    if (t.dead || t.invuln > 0 || t.dodging > 0) return;
    if (t.countering > 0) {
      t.countering = 0;
      this.popup(t.x, t.y - t.radius * 2.6 - 30, 'カウンター！', '#66ccff', 22);
      this.hit(t, src, SKILL_PARAMS.counter.power, 200);
      return;
    }
    let mul = 1;
    if (src.monster.trait.id === 'buddy_power' && this.friends(src).some((f) => f !== src && Math.hypot(f.x - src.x, f.y - src.y) < 220)) {
      mul *= src.monster.trait.level === 2 ? 1.2 : 1.1;
    }
    if (this.opponents(src).some((o) => o.monster.trait.id === 'overlord_aura' && Math.hypot(o.x - src.x, o.y - src.y) < 260)) {
      mul *= 0.85;
    }
    const dmg = damage(power * mul, src.atk, t.stats.def);
    t.hp -= dmg;
    if (t.hp <= 0 && t.monster.trait.id === 'tough_spirit' && !t.toughUsed) {
      t.toughUsed = true;
      t.hp = t.monster.trait.level === 2 ? Math.round(t.maxHp * 0.2) : 1;
      this.popup(t.x, t.y - t.radius * 2.6 - 30, 'ねばった！', '#ffe066', 18);
    }
    let km = SIZE_PARAMS[t.species.size].knockMul;
    if (t.monster.trait.id === 'heavy_body') km *= t.monster.trait.level === 2 ? 0.2 : 0.5;
    const dir = Math.sign(t.x - fromX) || src.facing;
    t.vx += dir * knock * km * 3;
    this.popup(t.x + Phaser.Math.Between(-10, 10), t.y - t.radius * 2, String(dmg), t.side === 'enemy' ? '#ffffff' : '#ff7070', 18);
    if (t.hp <= 0) this.kill(t);
  }

  private kill(t: Unit) {
    t.hp = 0;
    t.dead = true;
    t.windup = undefined;
    this.popup(t.x, t.y - t.radius * 2, 'たおれた', '#aaaaaa', 16);
    if (t.controlled) {
      const next = this.allies.findIndex((a) => a.alive);
      if (next >= 0) this.switchTo(next, true);
    }
  }

  // ---------------------------------------------------------------- 弾・罠・物理

  private updateProjectiles(dt: number) {
    for (const p of this.projectiles) {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
      p.gfx.setPosition(p.x, p.y - p.owner.radius).setDepth(p.y + 1);
      for (const t of this.opponents(p.owner)) {
        if (Math.hypot(t.x - p.x, (t.y - p.y) * 1.4) < t.radius + 8) {
          this.hit(p.owner, t, p.power, 40, p.x - Math.sign(p.vx));
          if (p.slow) t.slow = Math.max(t.slow, 1.5);
          p.life = 0;
          break;
        }
      }
    }
    for (const p of this.projectiles.filter((p) => p.life <= 0)) p.gfx.destroy();
    this.projectiles = this.projectiles.filter((p) => p.life > 0);
  }

  private updateTraps(dt: number) {
    for (const t of this.traps) {
      t.life -= dt;
      t.tick -= dt;
      if (t.tick <= 0) {
        t.tick = 0.5;
        for (const o of this.opponents(t.owner)) {
          if (Math.hypot(o.x - t.x, (o.y - t.y) * 2.5) < t.r + o.radius * 0.5) {
            o.slow = Math.max(o.slow, 0.8);
            this.hit(t.owner, o, t.power, 0, o.x);
          }
        }
      }
      t.gfx.setAlpha(Math.min(1, t.life));
    }
    for (const t of this.traps.filter((t) => t.life <= 0)) t.gfx.destroy();
    this.traps = this.traps.filter((t) => t.life > 0);
  }

  private moveUnits(all: Unit[], dt: number) {
    const alive = all.filter((u) => u.alive);
    for (const u of alive) {
      u.x += u.vx * dt;
      u.y += u.vy * dt;
    }
    for (let i = 0; i < alive.length; i++) {
      for (let j = i + 1; j < alive.length; j++) {
        const a = alive[i];
        const b = alive[j];
        const dx = b.x - a.x;
        const dy = (b.y - a.y) * 1.8;
        const d = Math.hypot(dx, dy) || 0.01;
        const min = (a.radius + b.radius) * 0.8;
        if (d < min) {
          const push = (min - d) / 2;
          a.x -= (dx / d) * push;
          b.x += (dx / d) * push;
          a.y -= (dy / d) * push * 0.5;
          b.y += (dy / d) * push * 0.5;
        }
      }
    }
    for (const u of alive) {
      u.x = Phaser.Math.Clamp(u.x, ARENA.left + u.radius, ARENA.right - u.radius);
      u.y = Phaser.Math.Clamp(u.y, ARENA.top, ARENA.bottom);
    }
  }

  private checkEnd(dt: number) {
    if (this.ended) return;
    if (this.allies.every((a) => a.dead)) {
      this.finish('lose');
      return;
    }
    if (this.enemies.every((e) => e.dead)) {
      if (this.waveIdx + 1 < this.waves.length) {
        this.waveDelay += dt;
        if (this.waveDelay > 1) {
          this.waveDelay = 0;
          for (const e of this.enemies) e.destroy();
          this.enemies = [];
          this.waveIdx += 1;
          this.spawnWave();
        }
      } else {
        this.finish('win');
      }
    }
  }

  private finish(result: 'win' | 'lose') {
    this.ended = result;
    const msg = result === 'win' ? '勝利！' : '全滅…';
    const t = this.formatTime(this.elapsed);
    this.add.rectangle(640, 330, 1280, 220, 0x000000, 0.6).setDepth(20000);
    this.add
      .text(640, 300, msg, { fontSize: '64px', color: result === 'win' ? '#ffe066' : '#ff8080', stroke: '#000', strokeThickness: 6 })
      .setOrigin(0.5)
      .setDepth(20001);
    this.add
      .text(640, 380, `タイム ${t}    R: もう一回  T: タイトルへ`, { fontSize: '24px', color: '#fff' })
      .setOrigin(0.5)
      .setDepth(20001);
  }

  // ---------------------------------------------------------------- HUD・演出

  private formatTime(s: number) {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  }

  private drawHud() {
    this.topText.setText(
      `タイム ${this.formatTime(this.elapsed)}   WAVE ${this.waveIdx + 1}/${this.waves.length}   交代 ${this.switchCd > 0 ? this.switchCd.toFixed(1) + '秒' : 'OK'}`,
    );
    const g = this.hud;
    g.clear();
    this.allies.forEach((u, i) => {
      const x = 20 + i * 410;
      const y = 606;
      g.fillStyle(u.controlled ? 0x3b3a1c : 0x232a36).fillRoundedRect(x, y, 395, 106, 8);
      g.lineStyle(2, u.controlled ? 0xffe066 : 0x445066).strokeRoundedRect(x, y, 395, 106, 8);
      g.fillStyle(0x000000).fillRect(x + 10, y + 92, 375, 8);
      g.fillStyle(u.dead ? 0x555555 : 0x5be37a).fillRect(x + 10, y + 92, (375 * u.hp) / u.maxHp, 8);
      const key = i === this.controlledIdx ? '操作中' : i === (this.controlledIdx + 2) % 3 ? 'Q' : 'E';
      const skills = u.skills
        .map((s, si) => `${SKILL_KEYS[si]} ${s.name}${s.cd > 0 ? ` (${s.cd.toFixed(1)})` : ''}`)
        .join('\n');
      this.hudTexts[i].setText(
        `[${key}] ${u.species.name} Lv${u.monster.level}${u.monster.plus ? ` +${u.monster.plus}` : ''}\n${skills}`,
      );
      this.hudTexts[i].setColor(u.dead ? '#777' : '#fff');
    });
  }

  private popup(x: number, y: number, text: string, color: string, size: number) {
    x = Phaser.Math.Clamp(x, 120, 1160);
    const t = this.add
      .text(x, y, text, { fontSize: `${size}px`, color, stroke: '#000', strokeThickness: 4, fontStyle: 'bold' })
      .setOrigin(0.5)
      .setDepth(15000);
    this.tweens.add({ targets: t, y: y - 40, alpha: 0, duration: 800, onComplete: () => t.destroy() });
  }

  private banner(text: string) {
    const t = this.add
      .text(640, 200, text, { fontSize: '48px', color: '#ffe066', stroke: '#000', strokeThickness: 6 })
      .setOrigin(0.5)
      .setDepth(15000);
    this.tweens.add({ targets: t, alpha: 0, delay: 900, duration: 500, onComplete: () => t.destroy() });
  }

  private slashFx(u: Unit, reach: number, color = 0xffffff) {
    const w = u.radius + reach;
    const r = this.add
      .rectangle(u.x + (u.facing * w) / 2, u.y - u.radius, w, u.radius * 1.2, color, 0.35)
      .setDepth(u.y + 1);
    this.tweens.add({ targets: r, alpha: 0, duration: 160, onComplete: () => r.destroy() });
  }

  private ringFx(x: number, y: number, r: number, color: number) {
    const e = this.add.ellipse(x, y, r * 2, r * 1.25).setStrokeStyle(4, color).setDepth(y + 1);
    this.tweens.add({ targets: e, scaleX: 1.15, scaleY: 1.15, alpha: 0, duration: 300, onComplete: () => e.destroy() });
  }

  // ---------------------------------------------------------------- ユーティリティ

  private opponents(u: Unit) {
    return (u.side === 'ally' ? this.enemies : this.allies).filter((o) => o.alive);
  }

  private friends(u: Unit) {
    return (u.side === 'ally' ? this.allies : this.enemies).filter((o) => o.alive);
  }

  private nearest(u: Unit, list: Unit[]) {
    let best: Unit | undefined;
    let bd = Infinity;
    for (const o of list) {
      const d = Math.hypot(o.x - u.x, o.y - u.y);
      if (d < bd) {
        bd = d;
        best = o;
      }
    }
    return best;
  }
}
