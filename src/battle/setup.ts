import { createWild } from '../game/monster';
import type { Monster } from '../game/types';

/** 試遊用の編成（ステップ3で牧場から選べるようにする） */
export function demoParty(): Monster[] {
  // 企画書の例: ムキメシに「包帯罠」と「電撃床」を継承させた個体
  const mukimeshi = createWild('mukimeshi', 12);
  mukimeshi.skills.push('bandage_trap', 'electric_floor');
  mukimeshi.plus = 1;

  const garuda = createWild('mask_garuda', 10);
  garuda.skills.push('water_gun');

  const sharizeki = createWild('sharizeki', 12);
  sharizeki.skills.push('genki_shout', 'spiral_gaze');

  return [mukimeshi, garuda, sharizeki];
}

export interface WaveEnemy {
  monster: Monster;
  hpMul?: number;
  boss?: boolean;
}

export function demoWaves(): WaveEnemy[][] {
  return [
    [
      { monster: createWild('toaster_ninja', 12) },
      { monster: createWild('jaga_lord', 12) },
      { monster: createWild('snorke', 12) },
      { monster: createWild('makimaki', 12) },
    ],
    [
      { monster: createWild('iron_banchou', 12) },
      { monster: createWild('neon_jelly', 12) },
      { monster: createWild('uzumen', 12) },
    ],
    [{ monster: createWild('tank_kabuto', 14), hpMul: 6, boss: true }],
  ];
}
