import type { Species } from '../types';

// 能力値の合計の目安: D=250, C=300, B=360, A=430, S=520
export const SPECIES: Species[] = [
  // ---- 野生 ----
  {
    id: 'toaster_ninja', name: 'トースター忍者', family: 'tool', rank: 1, size: 'S', attackStyle: 'shot',
    baseStats: { hp: 40, atk: 45, def: 35, spd: 75, tec: 55 },
    signatureSkill: 'bread_shuriken', entrySkill: { name: 'チン!', kind: 'shot' }, defaultTrait: 'quick_switch', wild: true,
    look: '手足の生えた銀色のトースター。黒い忍者の覆面を巻き、差し込み口から食パンがのぞく',
  },
  {
    id: 'iron_banchou', name: 'アイロン番長', family: 'tool', rank: 2, size: 'M', attackStyle: 'dash',
    baseStats: { hp: 65, atk: 70, def: 60, spd: 55, tec: 50 },
    signatureSkill: 'hot_press', entrySkill: { name: 'シワ伸ばし', kind: 'dash' }, defaultTrait: 'proud_pose', wild: true,
    look: 'アイロンの頭に熱々のリーゼント。学ランを羽織り、コードを鎖のように肩にかける',
  },
  {
    id: 'mukimeshi', name: 'ムキメシ', family: 'tool', rank: 2, size: 'M', attackStyle: 'charge',
    baseStats: { hp: 75, atk: 75, def: 65, spd: 35, tec: 50 },
    signatureSkill: 'steam_burst', entrySkill: { name: 'ご飯行こう!!', kind: 'buff' }, defaultTrait: 'buddy_power', wild: true,
    look: '真顔の炊飯器の頭に、はち切れそうな筋肉の白い体。茶碗と箸を持つ',
  },
  {
    id: 'jaga_lord', name: 'ジャガ卿', family: 'food', rank: 1, size: 'S', attackStyle: 'combo',
    baseStats: { hp: 50, atk: 50, def: 45, spd: 55, tec: 50 },
    signatureSkill: 'gentleman_bow', entrySkill: { name: 'お願いします〜', kind: 'counter' }, defaultTrait: 'tough_spirit', wild: true,
    look: 'じゃがいもの体にシルクハット、片眼鏡、燕尾服。ステッキを持ち丁寧にお辞儀する',
  },
  {
    id: 'sharizeki', name: 'シャリ関', family: 'food', rank: 2, size: 'L', attackStyle: 'combo',
    baseStats: { hp: 85, atk: 70, def: 70, spd: 30, tec: 45 },
    signatureSkill: 'harite', entrySkill: { name: 'どすこい', kind: 'dash' }, defaultTrait: 'heavy_body', wild: true,
    look: 'シャリの体に海苔のまわしを締めた力士。頭にマグロのまげをのせる',
  },
  {
    id: 'oden_bros', name: 'おでん三兄弟', family: 'food', rank: 2, size: 'M', attackStyle: 'area',
    baseStats: { hp: 60, atk: 60, def: 60, spd: 50, tec: 70 },
    signatureSkill: 'oden_spin', entrySkill: { name: '三兄弟参上', kind: 'area' }, defaultTrait: 'buddy_power', wild: true,
    look: '大根・こんにゃく・ちくわが1本の串に刺さり、それぞれ違う表情をしている',
  },
  {
    id: 'genki_rei', name: 'ゲンキ霊', family: 'weird', rank: 1, size: 'M', attackStyle: 'combo',
    baseStats: { hp: 55, atk: 60, def: 40, spd: 50, tec: 45 },
    signatureSkill: 'genki_shout', entrySkill: { name: '元気!!', kind: 'buff' }, defaultTrait: 'tough_spirit', wild: true,
    look: '灰色の半透明のおばけ。マントを羽織り、力こぶを作ってにっこり笑う',
  },
  {
    id: 'makimaki', name: 'マキマキ', family: 'weird', rank: 1, size: 'M', attackStyle: 'trap',
    baseStats: { hp: 50, atk: 40, def: 50, spd: 50, tec: 60 },
    signatureSkill: 'bandage_trap', entrySkill: { name: 'もう定時や', kind: 'trap' }, defaultTrait: 'trap_master', wild: true,
    look: '全身包帯の細身の男。くたびれた目。包帯の端がトイレットペーパーのように垂れる',
  },
  {
    id: 'uzumen', name: 'ウズ面', family: 'weird', rank: 2, size: 'M', attackStyle: 'status',
    baseStats: { hp: 55, atk: 50, def: 55, spd: 60, tec: 80 },
    signatureSkill: 'spiral_gaze', entrySkill: { name: 'OK', kind: 'status' }, defaultTrait: 'night_owl', wild: true,
    look: '顔が黒いうずまき模様の痩せた男。腰布だけの姿で、律儀に正座している',
  },
  {
    id: 'snorke', name: 'シュノーケ', family: 'beast', rank: 1, size: 'S', attackStyle: 'shot',
    baseStats: { hp: 45, atk: 45, def: 40, spd: 70, tec: 50 },
    signatureSkill: 'water_gun', entrySkill: { name: 'ザブン', kind: 'shot' }, defaultTrait: 'long_reach', wild: true,
    look: '黄色いアヒル。水中メガネとシュノーケルをつけ、足は青いフィン',
  },
  {
    id: 'neon_jelly', name: 'ネオンクラゲ', family: 'beast', rank: 2, size: 'S', attackStyle: 'trap',
    baseStats: { hp: 50, atk: 50, def: 45, spd: 65, tec: 90 },
    signatureSkill: 'electric_floor', entrySkill: { name: 'ピカッ', kind: 'status' }, defaultTrait: 'night_owl', wild: true,
    look: 'ピンクと水色に光る半透明のクラゲ。触手の先が電球になっている',
  },
  {
    id: 'tank_kabuto', name: '重戦車カブト', family: 'beast', rank: 3, size: 'L', attackStyle: 'dash',
    baseStats: { hp: 95, atk: 85, def: 100, spd: 35, tec: 45 },
    signatureSkill: 'tank_charge', entrySkill: { name: '着弾', kind: 'area' }, defaultTrait: 'heavy_body', wild: true,
    look: '戦車の装甲と砲塔を背負った巨大なカブトムシ。角は鉄製',
  },
  {
    id: 'mask_garuda', name: '仮面闘士ガルーダ', family: 'warrior', rank: 3, size: 'M', attackStyle: 'aerial',
    baseStats: { hp: 70, atk: 80, def: 60, spd: 90, tec: 60 },
    signatureSkill: 'garuda_dive', entrySkill: { name: 'コーナーポストから参上', kind: 'aerial' }, defaultTrait: 'proud_pose', wild: true,
    look: '鳥のくちばしの付いた赤と金の覆面レスラー。背中に羽根のマント、引き締まった体',
  },
  {
    id: 'iron_goliath', name: '鉄腕ゴリアテ', family: 'warrior', rank: 3, size: 'L', attackStyle: 'throw',
    baseStats: { hp: 100, atk: 95, def: 80, spd: 35, tec: 50 },
    signatureSkill: 'iron_suplex', entrySkill: { name: 'ラリアット', kind: 'dash' }, defaultTrait: 'heavy_body', wild: true,
    look: '右腕だけが巨大な鉄でできた筋骨隆々の巨漢レスラー。チャンピオンベルトを巻く',
  },

  // ---- 特殊配合でしか生まれない ----
  {
    id: 'yokozuna_ohitsu', name: '横綱おひつ', family: 'food', rank: 3, size: 'L', attackStyle: 'charge',
    baseStats: { hp: 110, atk: 90, def: 85, spd: 30, tec: 45 },
    signatureSkill: 'yokozuna_dohyo', entrySkill: { name: '土俵入り', kind: 'area' }, defaultTrait: 'heavy_body', wild: false,
    look: '炊飯器の胴に化粧まわし。頭に山盛りのシャリをのせた堂々とした横綱',
  },
  {
    id: 'mummy_baron', name: 'ミイラ男爵', family: 'weird', rank: 3, size: 'M', attackStyle: 'trap',
    baseStats: { hp: 75, atk: 65, def: 75, spd: 60, tec: 85 },
    signatureSkill: 'mummy_tea', entrySkill: { name: 'ごきげんよう', kind: 'counter' }, defaultTrait: 'trap_master', wild: false,
    look: '包帯だらけの体にシルクハット、片眼鏡、燕尾服。ティーカップを持つ',
  },
  {
    id: 'admiral_duck', name: '深海提督アヒル', family: 'beast', rank: 3, size: 'M', attackStyle: 'shot',
    baseStats: { hp: 70, atk: 75, def: 65, spd: 70, tec: 80 },
    signatureSkill: 'admiral_torpedo', entrySkill: { name: '全艦発進', kind: 'shot' }, defaultTrait: 'long_reach', wild: false,
    look: '光る潜水服を着たアヒルの提督。勲章と提督帽、背中にクラゲのランプ',
  },
  {
    id: 'muscle_geist', name: '筋霊ガイスト', family: 'warrior', rank: 4, size: 'L', attackStyle: 'throw',
    baseStats: { hp: 110, atk: 110, def: 75, spd: 60, tec: 75 },
    signatureSkill: 'ghost_arm', entrySkill: { name: '憑依ラリアット', kind: 'dash' }, defaultTrait: 'tough_spirit', wild: false,
    look: '半透明の巨体の霊レスラー。体から離れて浮かぶ鉄の両腕。不敵な笑み',
  },
  {
    id: 'noxx', name: '殻帝ノクス', family: 'overlord', rank: 4, size: 'L', attackStyle: 'combo',
    baseStats: { hp: 95, atk: 95, def: 95, spd: 70, tec: 75 },
    signatureSkill: 'shell_tail', entrySkill: { name: '降臨', kind: 'area' }, defaultTrait: 'overlord_aura', wild: false,
    look: '黒く光沢のある外殻をまとった細身の帝王。胸にうずまき紋、長い尾、冷たい赤い目',
  },
  {
    id: 'hepta', name: '七角魔王ヘプタ', family: 'overlord', rank: 5, size: 'M', attackStyle: 'aerial',
    baseStats: { hp: 110, atk: 115, def: 95, spd: 105, tec: 95 },
    signatureSkill: 'seven_horns', entrySkill: { name: '七つの光', kind: 'area' }, defaultTrait: 'overlord_aura', wild: false,
    look: '外殻を脱ぎ捨てた白くなめらかな最終形。頭に7本の角、紫の模様、宙に浮く',
  },
];

export const SPECIES_MAP: Record<string, Species> = Object.fromEntries(SPECIES.map((s) => [s.id, s]));
