import type { AttackType } from "../types";
import { type BattleControls, idleControls } from "./controlState";

export interface CpuBrainState {
  selfX: number;
  selfY: number;
  enemyX: number;
  enemyY: number;
  onGround: boolean;
  arenaLeft: number;
  arenaRight: number;
  shield: number;
  ultMeter: number;
  enemyAttack: AttackType | "idle";
  cooldowns: Record<AttackType | "dash", number>;
}

type RandomSource = () => number;

export function chooseCpuControls(state: CpuBrainState, random: RandomSource = Math.random): BattleControls {
  const distance = state.enemyX - state.selfX;
  const verticalDistance = state.enemyY - state.selfY;
  const absDistance = Math.abs(distance);
  const controls = idleControls({
    direction: chooseDirection(state, distance, absDistance),
    facing: distance >= 0 ? 1 : -1
  });

  controls.jumpPressed = state.onGround && (verticalDistance < -74 || random() < 0.006);

  if (absDistance < 82 && Math.abs(verticalDistance) < 75) {
    if (state.cooldowns.quick === 0 && random() < 0.05) {
      controls.attackPressed = "quick";
    } else if (state.cooldowns.heavy === 0 && random() < 0.018) {
      controls.attackPressed = "heavy";
    }
  } else if (absDistance < 330 && state.cooldowns.special === 0 && random() < 0.02) {
    controls.attackPressed = "special";
  }

  if (
    state.ultMeter >= 100 &&
    state.cooldowns.ultimate === 0 &&
    absDistance < 210 &&
    random() < 0.018
  ) {
    controls.attackPressed = "ultimate";
  }

  controls.shieldHeld = state.enemyAttack !== "idle" && absDistance < 92 && state.shield > 25 && random() < 0.05;

  return controls;
}

function chooseDirection(state: CpuBrainState, distance: number, absDistance: number): -1 | 0 | 1 {
  if (state.selfX < state.arenaLeft + 60) return 1;
  if (state.selfX > state.arenaRight - 60) return -1;
  if (absDistance > 92) return distance >= 0 ? 1 : -1;
  return distance >= 0 ? -1 : 1;
}
