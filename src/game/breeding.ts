import { RECIPES } from './data/recipes';
import { SPECIES } from './data/species';
import { getSpecies, levelCap, newUid } from './monster';
import type { Monster, Rank, Species } from './types';

export const MAX_INHERITED_SKILLS = 2;

export interface BreedPreview {
  species: Species;
  /** 特殊配合で決まったか */
  byRecipe: boolean;
}

function findRecipe(a: string, b: string): string | undefined {
  return RECIPES.find(
    (r) => (r.parents[0] === a && r.parents[1] === b) || (r.parents[0] === b && r.parents[1] === a),
  )?.child;
}

/**
 * 生まれる子の種族を決める。
 * 1. 特殊配合レシピに当てはまればその子
 * 2. それ以外は「1体目の親の系統」から、両親のランク平均（切り上げ）以下で一番高いランクの野生種
 * 3. 該当がなければ1体目の親と同じ種族
 */
export function previewChild(parentA: Monster, parentB: Monster): BreedPreview {
  const recipeChild = findRecipe(parentA.speciesId, parentB.speciesId);
  if (recipeChild) return { species: getSpecies(recipeChild), byRecipe: true };

  const a = getSpecies(parentA.speciesId);
  const b = getSpecies(parentB.speciesId);
  const targetRank = Math.ceil((a.rank + b.rank) / 2) as Rank;
  const candidates = SPECIES.filter((s) => s.wild && s.family === a.family && s.rank <= targetRank);
  if (candidates.length === 0) return { species: a, byRecipe: false };

  const bestRank = Math.max(...candidates.map((s) => s.rank));
  const top = candidates.filter((s) => s.rank === bestRank);
  // 同ランクが複数いるときは、親の種族以外を優先して新しい顔ぶれが出やすくする
  const fresh = top.filter((s) => s.id !== a.id && s.id !== b.id);
  return { species: (fresh[0] ?? top[0]), byRecipe: false };
}

/** 子に継承させられる技の候補（子の固有技は除く） */
export function inheritableSkills(parentA: Monster, parentB: Monster): string[] {
  const child = previewChild(parentA, parentB).species;
  const all = [...parentA.skills, ...parentB.skills].filter((id) => id !== child.signatureSkill);
  return [...new Set(all)];
}

/** 子に継承させられる特性の候補 */
export function inheritableTraits(parentA: Monster, parentB: Monster): string[] {
  return [...new Set([parentA.trait.id, parentB.trait.id])];
}

export interface BreedChoice {
  /** 継承させる技（最大2つ、inheritableSkills の中から） */
  skills: string[];
  /** 継承させる特性（inheritableTraits の中から） */
  trait: string;
}

export function breed(parentA: Monster, parentB: Monster, choice: BreedChoice): Monster {
  if (parentA.uid === parentB.uid) throw new Error('同じモンスター同士は配合できない');

  const { species } = previewChild(parentA, parentB);
  const skillPool = inheritableSkills(parentA, parentB);
  const traitPool = inheritableTraits(parentA, parentB);

  const pickedSkills = [...new Set(choice.skills)];
  if (pickedSkills.length > MAX_INHERITED_SKILLS) throw new Error(`継承できる技は${MAX_INHERITED_SKILLS}つまで`);
  for (const id of pickedSkills) {
    if (!skillPool.includes(id)) throw new Error(`継承できない技: ${id}`);
  }
  if (!traitPool.includes(choice.trait)) throw new Error(`継承できない特性: ${choice.trait}`);

  // 両親が同じ特性なら強化版になる
  const traitLevel = parentA.trait.id === parentB.trait.id ? 2 : 1;

  const child: Monster = {
    uid: newUid(),
    speciesId: species.id,
    level: 1,
    plus: Math.floor((parentA.plus + parentB.plus) / 2) + 1,
    skills: [species.signatureSkill, ...pickedSkills],
    trait: { id: choice.trait, level: traitLevel },
  };
  // 親のレベル合計の1/4を引き継ぐ（配合直後からすぐ戦えるように）
  child.level = Math.max(1, Math.min(levelCap(child), Math.floor((parentA.level + parentB.level) / 4)));
  return child;
}
