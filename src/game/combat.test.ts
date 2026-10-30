import { describe, expect, it } from 'vitest';
import { damage, moveSpeed, switchCooldown, SWITCH_COOLDOWN } from './combat';

describe('バトルの数値', () => {
  it('攻撃が守りより高いほどダメージが大きく、最低1は入る', () => {
    expect(damage(40, 100, 50)).toBeGreaterThan(damage(40, 50, 100));
    expect(damage(1, 1, 1000)).toBe(1);
  });

  it('同じすばやさなら小さい体のほうが速い', () => {
    expect(moveSpeed(60, 'S')).toBeGreaterThan(moveSpeed(60, 'M'));
    expect(moveSpeed(60, 'M')).toBeGreaterThan(moveSpeed(60, 'L'));
  });

  it('特性「はやがわり」で交代のクールダウンが短くなる', () => {
    expect(switchCooldown({ id: 'heavy_body', level: 1 })).toBe(SWITCH_COOLDOWN);
    expect(switchCooldown({ id: 'quick_switch', level: 1 })).toBeLessThan(SWITCH_COOLDOWN);
    expect(switchCooldown({ id: 'quick_switch', level: 2 })).toBeLessThan(switchCooldown({ id: 'quick_switch', level: 1 }));
  });
});
