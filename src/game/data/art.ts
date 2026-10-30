/** 絵が用意できている種族（public/monsters/<種族ID>.png）。ない種族は仮の図形で表示する */
export const MONSTER_ART: string[] = ['mukimeshi', 'toaster_ninja'];

/** 絵が左を向いている種族（右向きで描かれたものはここに入れない） */
export const ART_FACES_LEFT: string[] = ['toaster_ninja'];

export const artKey = (speciesId: string) => `mon_${speciesId}`;
