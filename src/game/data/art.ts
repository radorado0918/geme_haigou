/** 絵が用意できている種族（public/monsters/<種族ID>.png）。ない種族は仮の図形で表示する */
export const MONSTER_ART: string[] = [
  'mukimeshi',
  'toaster_ninja',
  'iron_banchou',
  'jaga_lord',
  'iron_goliath',
  'mask_garuda',
  'tank_kabuto',
  'neon_jelly',
  'snorke',
  'uzumen',
  'makimaki',
  'genki_rei',
  'oden_bros',
  'sharizeki',
  'yokozuna_ohitsu',
];

/** 絵が左を向いている種族（右向きで描かれたものはここに入れない） */
export const ART_FACES_LEFT: string[] = ['toaster_ninja', 'iron_banchou', 'mask_garuda', 'snorke', 'sharizeki', 'mummy_baron', 'admiral_duck'];

export const artKey = (speciesId: string) => `mon_${speciesId}`;
