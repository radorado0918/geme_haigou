// ゲーム全体で使うデータの型

/** 系統 */
export type Family = 'tool' | 'food' | 'weird' | 'beast' | 'warrior' | 'overlord';

/** ランク: 1=D, 2=C, 3=B, 4=A, 5=S */
export type Rank = 1 | 2 | 3 | 4 | 5;

/** 体格。バトルでの速さ・被弾判定・ふっとばされにくさに影響 */
export type Size = 'S' | 'M' | 'L';

/** 通常攻撃の型 */
export type AttackStyle = 'combo' | 'charge' | 'shot' | 'dash' | 'throw' | 'aerial' | 'trap' | 'status' | 'area';

/** 技の動きの種類 */
export type SkillKind = 'area' | 'trap' | 'dash' | 'shot' | 'counter' | 'status' | 'throw' | 'aerial' | 'buff';

export interface Stats {
  hp: number;
  atk: number;
  def: number;
  spd: number;
  tec: number;
}

export interface Skill {
  id: string;
  name: string;
  kind: SkillKind;
  description: string;
}

export interface Trait {
  id: string;
  name: string;
  description: string;
  /** 同じ特性の親同士で配合したときの強化版の説明 */
  upgradedDescription: string;
}

export interface Species {
  id: string;
  name: string;
  family: Family;
  rank: Rank;
  size: Size;
  attackStyle: AttackStyle;
  baseStats: Stats;
  /** 種族固有技（必ず持つ） */
  signatureSkill: string;
  /** 交代で入ったときに出す登場技 */
  entrySkill: { name: string; kind: SkillKind };
  /** 野生で出会ったときに持っている特性 */
  defaultTrait: string;
  /** false なら特殊配合でしか生まれない */
  wild: boolean;
  /** 見た目の説明（AI画像生成のプロンプトの元にもする） */
  look: string;
}

/** プレイヤーが持っている1体 */
export interface Monster {
  uid: string;
  speciesId: string;
  level: number;
  /** 配合を重ねた回数のようなもの。レベル上限と能力が伸びる */
  plus: number;
  /** [固有技, 継承技, 継承技]。継承技は空でもよい */
  skills: string[];
  trait: { id: string; level: 1 | 2 };
}
