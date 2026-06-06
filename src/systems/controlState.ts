import type { AttackType } from "../types";

export interface BattleControls {
  direction: -1 | 0 | 1;
  facing?: -1 | 1;
  jumpPressed: boolean;
  dashPressed: boolean;
  shieldHeld: boolean;
  attackPressed?: AttackType;
}

export function idleControls(overrides: Partial<BattleControls> = {}): BattleControls {
  return {
    direction: 0,
    jumpPressed: false,
    dashPressed: false,
    shieldHeld: false,
    ...overrides
  };
}
