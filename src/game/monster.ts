import { SPECIES_MAP } from './data/species';
import type { Monster, Species, Stats } from './types';

let uidCounter = 0;
export function newUid(): string {
  uidCounter += 1;
  return `m${Date.now().toString(36)}${uidCounter}`;
}

export function getSpecies(id: string): Species {
  const s = SPECIES_MAP[id];
  if (!s) throw new Error(`unknown species: ${id}`);
  return s;
}

const BASE_LEVEL_CAP: Record<number, number> = { 1: 20, 2: 25, 3: 30, 4: 40, 5: 50 };

/** レベル上限。ランクが高いほど、＋値が大きいほど高い */
export function levelCap(m: Pick<Monster, 'speciesId' | 'plus'>): number {
  const rank = getSpecies(m.speciesId).rank;
  return Math.min(99, BASE_LEVEL_CAP[rank] + m.plus * 5);
}

/** 現在の能力値 */
export function statsOf(m: Pick<Monster, 'speciesId' | 'level' | 'plus'>): Stats {
  const base = getSpecies(m.speciesId).baseStats;
  const mult = (1 + m.level * 0.08) * (1 + m.plus * 0.03);
  return {
    hp: Math.round(base.hp * mult),
    atk: Math.round(base.atk * mult),
    def: Math.round(base.def * mult),
    spd: Math.round(base.spd * mult),
    tec: Math.round(base.tec * mult),
  };
}

/** 野生で出会ったモンスターを作る */
export function createWild(speciesId: string, level = 1): Monster {
  const s = getSpecies(speciesId);
  const m: Monster = {
    uid: newUid(),
    speciesId,
    level: 1,
    plus: 0,
    skills: [s.signatureSkill],
    trait: { id: s.defaultTrait, level: 1 },
  };
  m.level = Math.min(level, levelCap(m));
  return m;
}
