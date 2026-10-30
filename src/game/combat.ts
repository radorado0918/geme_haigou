// バトルの数値ルール（画面に依存しない部分）
import type { AttackStyle, Size, SkillKind } from './types';

export const SIZE_PARAMS: Record<Size, { radius: number; speedMul: number; knockMul: number }> = {
  S: { radius: 22, speedMul: 1.15, knockMul: 1.3 },
  M: { radius: 30, speedMul: 1.0, knockMul: 1.0 },
  L: { radius: 42, speedMul: 0.8, knockMul: 0.55 },
};

/** バトル中の体力はステータスの何倍か（試作ではテンポ優先で調整しやすく） */
export const BATTLE_HP_MUL = 2;

export function damage(power: number, atk: number, def: number): number {
  return Math.max(1, Math.round((power * atk) / (atk + def)));
}

/** 移動速度（px/秒） */
export function moveSpeed(spd: number, size: Size): number {
  return (110 + spd * 0.7) * SIZE_PARAMS[size].speedMul;
}

export interface AttackParams {
  power: number;
  /** 次の通常攻撃までの秒数 */
  cooldown: number;
  /** 体の端から届く距離 */
  reach: number;
  /** 攻撃時に前へ踏み込む距離 */
  lunge: number;
  knock: number;
  /** 弾を撃つ型か */
  projectile?: boolean;
}

export const ATTACK_PARAMS: Record<AttackStyle, AttackParams> = {
  combo: { power: 16, cooldown: 0.28, reach: 40, lunge: 8, knock: 40 },
  charge: { power: 40, cooldown: 0.75, reach: 50, lunge: 4, knock: 160 },
  shot: { power: 16, cooldown: 0.4, reach: 0, lunge: 0, knock: 30, projectile: true },
  dash: { power: 24, cooldown: 0.5, reach: 40, lunge: 40, knock: 90 },
  throw: { power: 30, cooldown: 0.65, reach: 36, lunge: 6, knock: 220 },
  aerial: { power: 22, cooldown: 0.45, reach: 46, lunge: 28, knock: 80 },
  trap: { power: 18, cooldown: 0.4, reach: 44, lunge: 6, knock: 50 },
  status: { power: 18, cooldown: 0.4, reach: 50, lunge: 6, knock: 50 },
  area: { power: 20, cooldown: 0.5, reach: 54, lunge: 4, knock: 70 },
};

export interface SkillParams {
  cooldown: number;
  power: number;
}

export const SKILL_PARAMS: Record<SkillKind, SkillParams> = {
  area: { cooldown: 6, power: 45 },
  trap: { cooldown: 7, power: 10 }, // 0.5秒ごとのダメージ
  dash: { cooldown: 5, power: 50 },
  shot: { cooldown: 4, power: 26 }, // 弾1発あたり
  counter: { cooldown: 6, power: 70 },
  status: { cooldown: 8, power: 15 },
  throw: { cooldown: 6, power: 70 },
  aerial: { cooldown: 6, power: 60 },
  buff: { cooldown: 12, power: 0 },
};

export const SWITCH_COOLDOWN = 3;

/** 特性による交代クールダウン */
export function switchCooldown(trait?: { id: string; level: 1 | 2 }): number {
  if (trait?.id !== 'quick_switch') return SWITCH_COOLDOWN;
  return trait.level === 2 ? 1.2 : 2;
}
