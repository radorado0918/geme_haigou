import Phaser from 'phaser';
import { SKILL_MAP } from '../game/data/skills';
import { STAGES } from '../game/data/stages';
import { TRAIT_MAP } from '../game/data/traits';
import { getSpecies, levelCap, statsOf } from '../game/monster';
import { expToNext, isStageUnlocked, PARTY_SIZE, partyMonsters, togglePartyMember } from '../game/progress';
import { persist, state } from '../game/store';
import { SPECIES } from '../game/data/species';
import { button, FAMILY_LABEL, monsterCard, panel, RANK_LABEL, TEXT } from '../ui/ui';

const PER_PAGE = 16;

/** 牧場：手持ち一覧、パーティ編成、出撃、配合への入口 */
export class RanchScene extends Phaser.Scene {
  private selected?: string;
  private page = 0;
  private layer?: Phaser.GameObjects.Container;

  constructor() {
    super('Ranch');
  }

  create() {
    this.selected = undefined;
    this.page = 0;
    this.add.rectangle(0, 0, 1280, 720, 0x141a22).setOrigin(0);
    this.render();
  }

  private render() {
    this.layer?.destroy(true);
    const L = this.add.container(0, 0);
    this.layer = L;
    const s = state();

    // ---- 見出し
    L.add(this.add.text(24, 16, '牧場', { ...TEXT, fontSize: '32px' }));
    L.add(
      this.add.text(130, 26, `手持ち ${s.monsters.length}体　図鑑 ${s.dex.length}/${SPECIES.length}`, {
        ...TEXT,
        fontSize: '18px',
        color: '#bcc6d6',
      }),
    );

    // ---- 手持ち一覧（4列×4行）
    L.add(panel(this, 16, 64, 860, 330));
    const pages = Math.max(1, Math.ceil(s.monsters.length / PER_PAGE));
    this.page = Math.min(this.page, pages - 1);
    const shown = s.monsters.slice(this.page * PER_PAGE, (this.page + 1) * PER_PAGE);
    shown.forEach((m, i) => {
      const x = 28 + (i % 4) * 210;
      const y = 76 + Math.floor(i / 4) * 72;
      const inParty = s.party.includes(m.uid);
      L.add(
        monsterCard(this, x, y, m, {
          selected: this.selected === m.uid,
          badge: inParty ? 'パーティ' : undefined,
          onClick: () => {
            this.selected = m.uid;
            this.render();
          },
        }),
      );
    });
    if (pages > 1) {
      L.add(button(this, 700, 375, 60, 28, '◀', () => this.flip(-1), { fontSize: 16, disabled: this.page === 0 }));
      L.add(this.add.text(746, 366, `${this.page + 1}/${pages}`, { ...TEXT, fontSize: '16px' }));
      L.add(button(this, 820, 375, 60, 28, '▶', () => this.flip(1), { fontSize: 16, disabled: this.page >= pages - 1 }));
    }

    // ---- 選んだモンスターの詳細
    L.add(panel(this, 16, 404, 860, 300));
    const sel = s.monsters.find((m) => m.uid === this.selected);
    if (sel) {
      const sp = getSpecies(sel.speciesId);
      const st = statsOf(sel);
      const nextExp = sel.level >= levelCap(sel) ? '上限' : `${(s.exp[sel.uid] ?? 0)}/${expToNext(sel.level)}`;
      const lines = [
        `${sp.name}　${FAMILY_LABEL[sp.family]}系　ランク${RANK_LABEL[sp.rank]}　体格${sp.size}`,
        `Lv${sel.level}/${levelCap(sel)}　＋${sel.plus}　経験値 ${nextExp}`,
        `HP ${st.hp}　ちから ${st.atk}　まもり ${st.def}　すばやさ ${st.spd}　わざ ${st.tec}`,
        '',
        `技：${sel.skills.map((id) => SKILL_MAP[id].name).join(' / ')}`,
        `登場技：${sp.entrySkill.name}`,
        `特性：${TRAIT_MAP[sel.trait.id].name}${sel.trait.level === 2 ? '（強化）' : ''} … ${
          sel.trait.level === 2 ? TRAIT_MAP[sel.trait.id].upgradedDescription : TRAIT_MAP[sel.trait.id].description
        }`,
        '',
        sp.look,
      ];
      L.add(this.add.text(32, 418, lines.join('\n'), { ...TEXT, fontSize: '17px', lineSpacing: 6, wordWrap: { width: 600 } }));
      const inParty = s.party.includes(sel.uid);
      const full = !inParty && s.party.length >= PARTY_SIZE;
      L.add(
        button(
          this,
          760,
          440,
          200,
          44,
          inParty ? 'パーティから外す' : full ? 'パーティが満員' : 'パーティに入れる',
          () => {
            togglePartyMember(s, sel.uid);
            persist();
            this.render();
          },
          { disabled: full, color: inParty ? 0x6b3b3b : 0x3d6fb6 },
        ),
      );
    } else {
      L.add(
        this.add.text(32, 420, 'モンスターをクリックすると詳しく見られます', {
          ...TEXT,
          fontSize: '18px',
          color: '#889',
        }),
      );
    }

    // ---- 右側：パーティ・配合・出撃
    L.add(panel(this, 892, 64, 372, 200));
    L.add(this.add.text(908, 74, `パーティ（${s.party.length}/${PARTY_SIZE}）`, { ...TEXT, fontSize: '20px' }));
    partyMonsters(s).forEach((m, i) => {
      L.add(
        monsterCard(this, 908, 104 + i * 52, m, {
          onClick: () => {
            this.selected = m.uid;
            this.render();
          },
        }).setScale(0.78),
      );
    });

    L.add(
      button(this, 1078, 300, 340, 56, '配合する', () => this.scene.start('Breed'), {
        color: 0x8a4fb8,
        fontSize: 24,
        disabled: s.monsters.length < 2,
      }),
    );

    L.add(panel(this, 892, 340, 372, 364));
    L.add(this.add.text(908, 350, '出撃先', { ...TEXT, fontSize: '20px' }));
    const ids = STAGES.map((st) => st.id);
    const noParty = s.party.length === 0;
    STAGES.forEach((st, i) => {
      const unlocked = isStageUnlocked(s, i, ids);
      const cleared = s.cleared.includes(st.id);
      const label = unlocked ? `${cleared ? '★ ' : ''}${st.name}（目安Lv${st.recommended}）` : '？？？';
      L.add(
        button(this, 1078, 404 + i * 50, 340, 42, label, () => this.scene.start('Battle', { stageId: st.id }), {
          disabled: !unlocked || noParty,
          fontSize: 17,
          color: 0x2f7a55,
        }),
      );
    });
    if (noParty) {
      L.add(this.add.text(908, 378, 'パーティに1体以上入れてください', { ...TEXT, fontSize: '14px', color: '#ff9090' }));
    }
  }

  private flip(d: number) {
    this.page += d;
    this.render();
  }
}
