import { describe, expect, it } from 'vitest';
import { breed, inheritableSkills, inheritableTraits, previewChild } from './breeding';
import { RECIPES } from './data/recipes';
import { SPECIES } from './data/species';
import { createWild, levelCap, statsOf } from './monster';
import type { Monster } from './types';

const firstChoice = (a: Monster, b: Monster) => ({
  skills: inheritableSkills(a, b).slice(0, 2),
  trait: inheritableTraits(a, b)[0],
});

describe('特殊配合', () => {
  it('シャリ関 × ムキメシ = 横綱おひつ（順番を逆にしても同じ）', () => {
    const a = createWild('sharizeki');
    const b = createWild('mukimeshi');
    expect(previewChild(a, b)).toMatchObject({ byRecipe: true, species: { id: 'yokozuna_ohitsu' } });
    expect(previewChild(b, a).species.id).toBe('yokozuna_ohitsu');
  });

  it('野生のモンスターだけから七角魔王ヘプタまでたどり着ける', () => {
    const make = (x: string, y: string) => {
      const a = createWild(x, 10);
      const b = createWild(y, 10);
      return breed(a, b, firstChoice(a, b));
    };
    const noxx = make('uzumen', 'tank_kabuto');
    const geist = make('genki_rei', 'iron_goliath');
    expect(noxx.speciesId).toBe('noxx');
    expect(geist.speciesId).toBe('muscle_geist');
    const hepta = breed(noxx, geist, firstChoice(noxx, geist));
    expect(hepta.speciesId).toBe('hepta');
    expect(hepta.plus).toBe(2);
  });
});

describe('系統配合', () => {
  it('1体目の親の系統から、ランク平均以下で一番高いランクの野生種が生まれる', () => {
    // 日用品(D) × 生きもの(B) → 目標ランクC → 日用品のCランク
    const child = previewChild(createWild('toaster_ninja'), createWild('tank_kabuto')).species;
    expect(child.family).toBe('tool');
    expect(child.rank).toBe(2);
  });

  it('配合限定の種族は系統配合では生まれない', () => {
    for (const a of SPECIES) {
      for (const b of SPECIES) {
        const p = previewChild(createWild(a.id), createWild(b.id));
        if (!p.byRecipe && !p.species.wild) expect(p.species.id).toBe(a.id);
      }
    }
  });

  it('魔王同士などレシピ外で候補がなければ1体目の親と同じ種族', () => {
    const child = previewChild(createWild('hepta'), createWild('noxx')).species;
    expect(child.id).toBe('hepta');
  });

  it('レシピの組み合わせはすべて特殊配合として扱われる', () => {
    for (const r of RECIPES) {
      expect(previewChild(createWild(r.parents[0]), createWild(r.parents[1])).species.id).toBe(r.child);
    }
  });
});

describe('継承', () => {
  it('子は固有技＋選んだ親の技2つを持つ', () => {
    const a = createWild('mukimeshi');
    a.skills.push('bandage_trap');
    const b = createWild('neon_jelly');
    // ムキメシ(日用品C) × ネオンクラゲ(生きものC) → 日用品C
    const pool = inheritableSkills(a, b);
    expect(pool).toEqual(expect.arrayContaining(['bandage_trap', 'electric_floor']));
    const child = breed(a, b, { skills: ['bandage_trap', 'electric_floor'], trait: 'buddy_power' });
    expect(child.skills).toHaveLength(3);
    expect(child.skills.slice(1)).toEqual(['bandage_trap', 'electric_floor']);
  });

  it('子の固有技は継承候補に出ない', () => {
    const a = createWild('sharizeki');
    const b = createWild('mukimeshi');
    const child = previewChild(a, b).species;
    expect(inheritableSkills(a, b)).not.toContain(child.signatureSkill);
  });

  it('3つ以上の技や、親が持っていない技は継承できない', () => {
    const a = createWild('mukimeshi');
    a.skills.push('bandage_trap', 'water_gun');
    const b = createWild('neon_jelly');
    expect(() => breed(a, b, { skills: ['bandage_trap', 'water_gun', 'electric_floor'], trait: 'buddy_power' })).toThrow();
    expect(() => breed(a, b, { skills: ['seven_horns'], trait: 'buddy_power' })).toThrow();
    expect(() => breed(a, b, { skills: [], trait: 'overlord_aura' })).toThrow();
  });

  it('両親が同じ特性なら強化版になる', () => {
    const a = createWild('sharizeki'); // どっしり
    const b = createWild('tank_kabuto'); // どっしり
    const child = breed(a, b, { skills: [], trait: 'heavy_body' });
    expect(child.trait).toEqual({ id: 'heavy_body', level: 2 });
  });

  it('同じ個体同士は配合できない', () => {
    const a = createWild('sharizeki');
    expect(() => breed(a, a, { skills: [], trait: 'heavy_body' })).toThrow();
  });
});

describe('レベルと＋値', () => {
  it('子は親のレベル合計の1/4を引き継ぎ、＋値が1上がる', () => {
    const a = createWild('sharizeki', 20);
    const b = createWild('mukimeshi', 20);
    const child = breed(a, b, firstChoice(a, b));
    expect(child.level).toBe(10);
    expect(child.plus).toBe(1);
  });

  it('＋値が上がるとレベル上限と能力が伸びる', () => {
    const base = { speciesId: 'mukimeshi', level: 20 };
    expect(levelCap({ ...base, plus: 2 })).toBeGreaterThan(levelCap({ ...base, plus: 0 }));
    expect(statsOf({ ...base, plus: 2 }).atk).toBeGreaterThan(statsOf({ ...base, plus: 0 }).atk);
  });
});
