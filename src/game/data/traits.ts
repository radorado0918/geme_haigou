import type { Trait } from '../types';

export const TRAITS: Trait[] = [
  { id: 'entry_guard', name: '登場ガード', description: '交代で入ってから1秒間、ダメージを受けない', upgradedDescription: '無敵が2秒になる' },
  { id: 'buddy_power', name: 'なかよしパワー', description: '仲間が近くにいると攻撃が10%上がる', upgradedDescription: '20%上がる' },
  { id: 'heavy_body', name: 'どっしり', description: 'ふっとばされにくい', upgradedDescription: 'ほとんどふっとばされない' },
  { id: 'quick_switch', name: 'はやがわり', description: '交代のクールダウンが短くなる', upgradedDescription: 'さらに短くなる' },
  { id: 'tough_spirit', name: 'ねばり', description: '一度だけ体力1で耐える', upgradedDescription: '耐えたあと少し回復する' },
  { id: 'trap_master', name: 'しかけ上手', description: '設置技が長持ちする', upgradedDescription: '設置技を2つ同時に置ける' },
  { id: 'long_reach', name: 'とどく', description: '射撃と投げの届く距離が伸びる', upgradedDescription: 'さらに伸びる' },
  { id: 'night_owl', name: '夜ふかし', description: '体力が半分以下になると技の回転が速くなる', upgradedDescription: '回転がさらに速くなる' },
  { id: 'proud_pose', name: '決めポーズ', description: '登場技の威力が上がる', upgradedDescription: '登場技が2回出る' },
  { id: 'overlord_aura', name: '覇気', description: '近くの敵の攻撃が少し下がる', upgradedDescription: '大きく下がる' },
];

export const TRAIT_MAP: Record<string, Trait> = Object.fromEntries(TRAITS.map((t) => [t.id, t]));
