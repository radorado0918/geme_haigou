// 手持ち・パーティ・図鑑・経験値など、遊びの進み具合を扱う（画面に依存しない）
import { breed, type BreedChoice } from './breeding';
import { STAGE_MAP, type StageEnemy } from './data/stages';
import { createWild, getSpecies, levelCap } from './monster';
import type { Monster } from './types';

export const PARTY_SIZE = 3;

export interface GameState {
  monsters: Monster[];
  /** パーティに入っている個体の uid（最大3） */
  party: string[];
  /** 一度でも手に入れた種族 */
  dex: string[];
  /** 勝利したステージ */
  cleared: string[];
  /** 個体ごとの、次のレベルまでの経験値 */
  exp: Record<string, number>;
}

export function newGame(): GameState {
  const starters = [createWild('jaga_lord', 3), createWild('genki_rei', 3), createWild('snorke', 3)];
  return {
    monsters: starters,
    party: starters.map((m) => m.uid),
    dex: starters.map((m) => m.speciesId),
    cleared: [],
    exp: {},
  };
}

export function partyMonsters(state: GameState): Monster[] {
  return state.party
    .map((uid) => state.monsters.find((m) => m.uid === uid))
    .filter((m): m is Monster => m !== undefined);
}

/** パーティに入れる／外す。満員なら何もしない */
export function togglePartyMember(state: GameState, uid: string): void {
  if (state.party.includes(uid)) {
    state.party = state.party.filter((u) => u !== uid);
  } else if (state.party.length < PARTY_SIZE && state.monsters.some((m) => m.uid === uid)) {
    state.party.push(uid);
  }
}

/** ステージに出撃できるか（解放条件: 1つ前のステージをクリア済み） */
export function isStageUnlocked(state: GameState, stageIndex: number, stageIds: string[]): boolean {
  return stageIndex === 0 || state.cleared.includes(stageIds[stageIndex - 1]);
}

// ---------------------------------------------------------------- 経験値

export function expToNext(level: number): number {
  return 6 + level * 4;
}

/** 倒した敵から得られる経験値（パーティの各メンバーに同じだけ入る） */
export function battleExp(defeated: StageEnemy[], won: boolean): number {
  const total = defeated.reduce((sum, e) => sum + e.level * (e.boss ? 12 : 4), 0);
  return won ? total : Math.floor(total / 2);
}

export interface LevelUp {
  uid: string;
  from: number;
  to: number;
}

export function gainExp(state: GameState, uids: string[], amount: number): LevelUp[] {
  const result: LevelUp[] = [];
  for (const uid of uids) {
    const m = state.monsters.find((x) => x.uid === uid);
    if (!m) continue;
    const from = m.level;
    let pool = (state.exp[uid] ?? 0) + amount;
    const cap = levelCap(m);
    while (m.level < cap && pool >= expToNext(m.level)) {
      pool -= expToNext(m.level);
      m.level += 1;
    }
    state.exp[uid] = m.level >= cap ? 0 : pool;
    if (m.level > from) result.push({ uid, from, to: m.level });
  }
  return result;
}

// ---------------------------------------------------------------- 仲間加入

/**
 * 勝利後に仲間になりたがるモンスターを1体選ぶ。いなければ undefined。
 * ボスと配合限定の種族は仲間にならない。
 */
export function recruitCandidate(defeated: StageEnemy[], rand: () => number = Math.random): StageEnemy | undefined {
  const pool = defeated.filter((e) => !e.boss && getSpecies(e.speciesId).wild);
  if (pool.length === 0 || rand() > 0.6) return undefined;
  return pool[Math.floor(rand() * pool.length) % pool.length];
}

export function recruit(state: GameState, enemy: StageEnemy): Monster {
  const m = createWild(enemy.speciesId, Math.max(1, enemy.level - 2));
  state.monsters.push(m);
  if (!state.dex.includes(m.speciesId)) state.dex.push(m.speciesId);
  if (state.party.length < PARTY_SIZE) state.party.push(m.uid);
  return m;
}

export function markCleared(state: GameState, stageId: string): void {
  if (STAGE_MAP[stageId] && !state.cleared.includes(stageId)) state.cleared.push(stageId);
}

// ---------------------------------------------------------------- 配合

/** 配合して子を手持ちに加え、親2体を手放す */
export function breedInState(state: GameState, uidA: string, uidB: string, choice: BreedChoice): Monster {
  const a = state.monsters.find((m) => m.uid === uidA);
  const b = state.monsters.find((m) => m.uid === uidB);
  if (!a || !b) throw new Error('親が手持ちにいない');
  const child = breed(a, b, choice);
  const parentInParty = state.party.includes(uidA) || state.party.includes(uidB);
  state.monsters = state.monsters.filter((m) => m.uid !== uidA && m.uid !== uidB);
  state.party = state.party.filter((u) => u !== uidA && u !== uidB);
  delete state.exp[uidA];
  delete state.exp[uidB];
  state.monsters.push(child);
  if (!state.dex.includes(child.speciesId)) state.dex.push(child.speciesId);
  // 親がパーティにいたなら、子がその枠に入る
  if (parentInParty && state.party.length < PARTY_SIZE) state.party.push(child.uid);
  return child;
}

// ---------------------------------------------------------------- セーブ

const SAVE_KEY = 'haigou-save-v1';

export function saveGame(state: GameState): void {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  } catch {
    // 保存できない環境（プライベートモードなど）でも遊べるようにする
  }
}

export function loadGame(): GameState | undefined {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return undefined;
    const s = JSON.parse(raw) as GameState;
    if (!Array.isArray(s.monsters) || !Array.isArray(s.party)) return undefined;
    s.dex ??= [];
    s.cleared ??= [];
    s.exp ??= {};
    return s;
  } catch {
    return undefined;
  }
}
