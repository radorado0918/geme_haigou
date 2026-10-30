import { describe, expect, it } from 'vitest';
import { RECIPES } from './data/recipes';
import { SKILL_MAP } from './data/skills';
import { SPECIES, SPECIES_MAP } from './data/species';
import { TRAIT_MAP } from './data/traits';

describe('データの整合性', () => {
  it('試作の20体がそろっている（野生14・配合限定6）', () => {
    expect(SPECIES).toHaveLength(20);
    expect(SPECIES.filter((s) => s.wild)).toHaveLength(14);
    expect(new Set(SPECIES.map((s) => s.id)).size).toBe(20);
  });

  it('固有技と特性はすべて定義されている', () => {
    for (const s of SPECIES) {
      expect(SKILL_MAP[s.signatureSkill], s.id).toBeDefined();
      expect(TRAIT_MAP[s.defaultTrait], s.id).toBeDefined();
    }
  });

  it('レシピの親と子は実在し、配合限定の種族はすべてレシピで生まれる', () => {
    for (const r of RECIPES) {
      expect(SPECIES_MAP[r.parents[0]]).toBeDefined();
      expect(SPECIES_MAP[r.parents[1]]).toBeDefined();
      expect(SPECIES_MAP[r.child]?.wild).toBe(false);
    }
    const recipeChildren = new Set(RECIPES.map((r) => r.child));
    for (const s of SPECIES.filter((s) => !s.wild)) expect(recipeChildren.has(s.id), s.id).toBe(true);
  });
});
