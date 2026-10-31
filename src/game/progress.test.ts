import { describe, expect, it } from 'vitest';
import { inheritableSkills, inheritableTraits } from './breeding';
import { SPECIES_MAP } from './data/species';
import { STAGES } from './data/stages';
import { createWild, levelCap } from './monster';
import {
  battleExp,
  breedInState,
  expToNext,
  gainExp,
  isStageUnlocked,
  newGame,
  PARTY_SIZE,
  recruit,
  recruitCandidate,
  togglePartyMember,
} from './progress';

describe('はじめから', () => {
  it('3体の手持ちがパーティに入り、図鑑に載っている', () => {
    const s = newGame();
    expect(s.monsters).toHaveLength(3);
    expect(s.party).toHaveLength(3);
    expect(s.dex).toHaveLength(3);
  });
});

describe('パーティ編成', () => {
  it('3体まで。外すと空きができる', () => {
    const s = newGame();
    const extra = createWild('mukimeshi');
    s.monsters.push(extra);
    togglePartyMember(s, extra.uid);
    expect(s.party).toHaveLength(PARTY_SIZE);
    expect(s.party).not.toContain(extra.uid);
    togglePartyMember(s, s.party[0]);
    togglePartyMember(s, extra.uid);
    expect(s.party).toContain(extra.uid);
  });
});

describe('経験値', () => {
  it('経験値がたまるとレベルが上がり、上限で止まる', () => {
    const s = newGame();
    const uid = s.monsters[0].uid;
    const ups = gainExp(s, [uid], expToNext(3) + expToNext(4));
    expect(ups).toEqual([{ uid, from: 3, to: 5 }]);
    gainExp(s, [uid], 100000);
    expect(s.monsters[0].level).toBe(levelCap(s.monsters[0]));
  });

  it('負けると経験値は半分、ボスは多くもらえる', () => {
    const enemies = [{ speciesId: 'jaga_lord', level: 5 }];
    expect(battleExp(enemies, false)).toBe(Math.floor(battleExp(enemies, true) / 2));
    expect(battleExp([{ speciesId: 'noxx', level: 5, boss: true }], true)).toBeGreaterThan(battleExp(enemies, true));
  });
});

describe('仲間加入', () => {
  it('ボスや配合限定の種族は仲間にならない', () => {
    const always = () => 0;
    expect(recruitCandidate([{ speciesId: 'tank_kabuto', level: 20, boss: true }], always)).toBeUndefined();
    expect(recruitCandidate([{ speciesId: 'noxx', level: 20 }], always)).toBeUndefined();
    expect(recruitCandidate([{ speciesId: 'snorke', level: 5 }], always)?.speciesId).toBe('snorke');
  });

  it('加入すると手持ちと図鑑に増える', () => {
    const s = newGame();
    const m = recruit(s, { speciesId: 'mukimeshi', level: 10 });
    expect(s.monsters).toContain(m);
    expect(s.dex).toContain('mukimeshi');
  });

  it('野生の14種はすべてどこかのステージで仲間にできる', () => {
    const recruitable = new Set(STAGES.flatMap((st) => st.waves.flat().filter((e) => !e.boss).map((e) => e.speciesId)));
    for (const s of Object.values(SPECIES_MAP).filter((s) => s.wild)) expect(recruitable.has(s.id), s.id).toBe(true);
  });
});

describe('ステージ解放', () => {
  it('最初のステージだけ最初から行け、クリアすると次が開く', () => {
    const s = newGame();
    const ids = STAGES.map((x) => x.id);
    expect(isStageUnlocked(s, 0, ids)).toBe(true);
    expect(isStageUnlocked(s, 1, ids)).toBe(false);
    s.cleared.push(ids[0]);
    expect(isStageUnlocked(s, 1, ids)).toBe(true);
  });
});

describe('配合（手持ち）', () => {
  it('親2体が手持ちとパーティから抜け、子がパーティの空きに入る', () => {
    const s = newGame();
    const [a, b] = s.monsters;
    const child = breedInState(s, a.uid, b.uid, {
      skills: inheritableSkills(a, b).slice(0, 2),
      trait: inheritableTraits(a, b)[0],
    });
    expect(s.monsters.map((m) => m.uid)).not.toContain(a.uid);
    expect(s.monsters.map((m) => m.uid)).not.toContain(b.uid);
    expect(s.party).toContain(child.uid);
    expect(s.party).toHaveLength(2);
    expect(s.dex).toContain(child.speciesId);
  });
});
