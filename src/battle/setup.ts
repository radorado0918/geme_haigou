import { STAGE_MAP, type StageEnemy } from '../game/data/stages';
import { createWild } from '../game/monster';
import type { Monster } from '../game/types';

export interface WaveEnemy {
  monster: Monster;
  hpMul?: number;
  boss?: boolean;
  /** 報酬計算用に、ステージ定義の元データを持っておく */
  source: StageEnemy;
}

export function stageWaves(stageId: string): WaveEnemy[][] {
  const stage = STAGE_MAP[stageId];
  if (!stage) throw new Error(`unknown stage: ${stageId}`);
  return stage.waves.map((wave) =>
    wave.map((e) => ({ monster: createWild(e.speciesId, e.level), hpMul: e.hpMul, boss: e.boss, source: e })),
  );
}
