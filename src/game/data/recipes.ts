/** 特殊配合のレシピ。親の順番は問わない */
export interface Recipe {
  parents: [string, string];
  child: string;
}

export const RECIPES: Recipe[] = [
  { parents: ['sharizeki', 'mukimeshi'], child: 'yokozuna_ohitsu' },
  { parents: ['makimaki', 'jaga_lord'], child: 'mummy_baron' },
  { parents: ['snorke', 'neon_jelly'], child: 'admiral_duck' },
  { parents: ['genki_rei', 'iron_goliath'], child: 'muscle_geist' },
  { parents: ['uzumen', 'tank_kabuto'], child: 'noxx' },
  { parents: ['noxx', 'muscle_geist'], child: 'hepta' },
];
