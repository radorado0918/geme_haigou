import type { Skill } from '../types';

export const SKILLS: Skill[] = [
  { id: 'bread_shuriken', name: 'パン手裏剣', kind: 'shot', description: '焼きたてのパンを3枚まとめて投げる' },
  { id: 'hot_press', name: 'ホットプレス', kind: 'dash', description: '熱いアイロンで一直線に突っ込み、通った跡を焦がす' },
  { id: 'steam_burst', name: '炊きあがりバースト', kind: 'area', description: '溜めた蒸気を周囲に一気に噴き出す' },
  { id: 'gentleman_bow', name: '紳士の一礼', kind: 'counter', description: '一礼している間に攻撃されると、ステッキで反撃する' },
  { id: 'harite', name: 'シャリ張り手', kind: 'dash', description: '前に踏み込みながら連続の張り手' },
  { id: 'oden_spin', name: '串回転', kind: 'area', description: '串ごと回転して周りをまとめて叩く' },
  { id: 'genki_shout', name: '元気!!', kind: 'buff', description: '叫んで自分と仲間の攻撃を少しの間上げる' },
  { id: 'bandage_trap', name: '包帯罠', kind: 'trap', description: '地面に包帯を仕掛け、踏んだ敵を足止めする' },
  { id: 'spiral_gaze', name: 'うずまき凝視', kind: 'status', description: '正面の敵を混乱させ、動きをでたらめにする' },
  { id: 'water_gun', name: '水鉄砲', kind: 'shot', description: '連射できる弱い水弾。当てると敵が少し遅くなる' },
  { id: 'electric_floor', name: '電撃床', kind: 'trap', description: '足元に電気の床を張り、上の敵をしびれさせる' },
  { id: 'tank_charge', name: '重戦車チャージ', kind: 'dash', description: '止まらない突進。途中で攻撃されてもひるまない' },
  { id: 'garuda_dive', name: 'ガルーダダイブ', kind: 'aerial', description: '高く跳んで急降下し、着地点を叩く' },
  { id: 'iron_suplex', name: '鉄腕スープレックス', kind: 'throw', description: 'つかんで後ろへ投げ飛ばす。大きな敵も投げられる' },
  { id: 'yokozuna_dohyo', name: '横綱土俵入り', kind: 'area', description: '四股を踏み、周囲の敵をまとめて浮かせる' },
  { id: 'mummy_tea', name: '男爵のティータイム', kind: 'buff', description: '紅茶を飲んで体力を少し回復し、包帯で身を守る' },
  { id: 'admiral_torpedo', name: '提督魚雷', kind: 'shot', description: '追いかけて爆発する光る魚雷を撃つ' },
  { id: 'ghost_arm', name: '浮遊鉄腕', kind: 'throw', description: '離れた場所の敵を鉄の腕でつかんで引き寄せる' },
  { id: 'shell_tail', name: '殻尾の一閃', kind: 'counter', description: '尾で攻撃を受け流し、すぐに鋭く突き返す' },
  { id: 'seven_horns', name: '七角の審判', kind: 'area', description: '7本の角から光を放ち、画面全体を薙ぎ払う' },
];

export const SKILL_MAP: Record<string, Skill> = Object.fromEntries(SKILLS.map((s) => [s.id, s]));
