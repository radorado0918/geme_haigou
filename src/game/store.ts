// 遊んでいる最中のデータを画面どうしで共有する
import { loadGame, newGame, saveGame, type GameState } from './progress';

let current: GameState | undefined;

export function hasSave(): boolean {
  return loadGame() !== undefined;
}

export function startNew(): GameState {
  current = newGame();
  saveGame(current);
  return current;
}

export function continueGame(): GameState {
  current = loadGame() ?? newGame();
  return current;
}

export function state(): GameState {
  current ??= loadGame() ?? newGame();
  return current;
}

export function persist(): void {
  if (current) saveGame(current);
}
