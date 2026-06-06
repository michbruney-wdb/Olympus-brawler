import { describe, expect, it } from "vitest";
import { chooseCpuControls, type CpuBrainState } from "./cpu";

const READY_COOLDOWNS = {
  quick: 0,
  heavy: 0,
  special: 0,
  ultimate: 0,
  dash: 0
};

function cpuState(overrides: Partial<CpuBrainState> = {}): CpuBrainState {
  return {
    selfX: 360,
    selfY: 330,
    enemyX: 920,
    enemyY: 330,
    onGround: true,
    arenaLeft: 220,
    arenaRight: 1060,
    shield: 100,
    ultMeter: 0,
    enemyAttack: "idle",
    cooldowns: READY_COOLDOWNS,
    ...overrides
  };
}

function randomSequence(...values: number[]): () => number {
  let index = 0;
  return () => values[index++] ?? 1;
}

describe("chooseCpuControls", () => {
  it("moves toward a far opponent while facing them", () => {
    const controls = chooseCpuControls(cpuState());

    expect(controls.direction).toBe(1);
    expect(controls.facing).toBe(1);
  });

  it("backs away at close range without turning its attacks away", () => {
    const controls = chooseCpuControls(cpuState({ enemyX: 410 }), randomSequence(1, 1, 1));

    expect(controls.direction).toBe(-1);
    expect(controls.facing).toBe(1);
  });

  it("uses a quick attack when close and the timing roll passes", () => {
    const controls = chooseCpuControls(cpuState({ enemyX: 410 }), randomSequence(1, 0.01, 1));

    expect(controls.attackPressed).toBe("quick");
  });

  it("uses a special attack at mid range when the timing roll passes", () => {
    const controls = chooseCpuControls(cpuState({ enemyX: 610 }), randomSequence(1, 0.01, 1));

    expect(controls.attackPressed).toBe("special");
  });

  it("prioritizes an available ultimate in range", () => {
    const controls = chooseCpuControls(cpuState({ enemyX: 500, ultMeter: 100 }), randomSequence(1, 1, 0.01, 1));

    expect(controls.attackPressed).toBe("ultimate");
  });

  it("shields against nearby active attacks when the timing roll passes", () => {
    const controls = chooseCpuControls(
      cpuState({ enemyX: 410, enemyAttack: "heavy" }),
      randomSequence(1, 1, 1, 0.01)
    );

    expect(controls.shieldHeld).toBe(true);
  });
});
