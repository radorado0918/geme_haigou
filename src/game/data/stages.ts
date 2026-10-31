/** 出撃先。ウェーブごとに [種族, レベル] を並べる */
export interface StageEnemy {
  speciesId: string;
  level: number;
  hpMul?: number;
  boss?: boolean;
}

export interface Stage {
  id: string;
  name: string;
  /** 目安のレベル（画面表示用） */
  recommended: number;
  waves: StageEnemy[][];
}

const e = (speciesId: string, level: number): StageEnemy => ({ speciesId, level });
const boss = (speciesId: string, level: number, hpMul: number): StageEnemy => ({ speciesId, level, hpMul, boss: true });

export const STAGES: Stage[] = [
  {
    id: 'meadow',
    name: 'はじまりの原っぱ',
    recommended: 3,
    waves: [
      [e('toaster_ninja', 3), e('jaga_lord', 3), e('snorke', 3)],
      [e('genki_rei', 4), e('makimaki', 4)],
    ],
  },
  {
    id: 'shopping_street',
    name: '夜の商店街',
    recommended: 8,
    waves: [
      [e('makimaki', 7), e('neon_jelly', 7), e('toaster_ninja', 8)],
      [e('iron_banchou', 8), e('oden_bros', 8), e('neon_jelly', 8)],
    ],
  },
  {
    id: 'temple',
    name: 'うずまき寺',
    recommended: 12,
    waves: [
      [e('uzumen', 11), e('genki_rei', 11), e('jaga_lord', 12)],
      [e('mukimeshi', 12), e('sharizeki', 12), e('uzumen', 12)],
    ],
  },
  {
    id: 'arena',
    name: '地下闘技場',
    recommended: 16,
    waves: [
      [e('iron_banchou', 15), e('sharizeki', 15), e('oden_bros', 16)],
      [e('mask_garuda', 16), e('iron_goliath', 16)],
    ],
  },
  {
    id: 'iron_forest',
    name: '鉄の森',
    recommended: 20,
    waves: [
      [e('mask_garuda', 19), e('neon_jelly', 19), e('mukimeshi', 20)],
      [e('iron_goliath', 20), e('uzumen', 20)],
      [boss('tank_kabuto', 22, 5)],
    ],
  },
  {
    id: 'shell_throne',
    name: '殻帝の玉座',
    recommended: 30,
    waves: [
      [e('tank_kabuto', 28), e('mask_garuda', 28), e('uzumen', 28)],
      [boss('noxx', 32, 6)],
    ],
  },
];

export const STAGE_MAP: Record<string, Stage> = Object.fromEntries(STAGES.map((s) => [s.id, s]));
