import { describe, expect, it } from "vitest";
import {
  applyShieldDamage,
  attackFacingForInput,
  calculateKnockback,
  clamp,
  meleeRangeForAttack,
  rectsOverlap,
  resolveHit
} from "./combat";

describe("combat helpers", () => {
  it("clamps values to the requested range", () => {
    expect(clamp(-10, 0, 100)).toBe(0);
    expect(clamp(44, 0, 100)).toBe(44);
    expect(clamp(140, 0, 100)).toBe(100);
  });

  it("detects overlapping hitboxes", () => {
    expect(rectsOverlap({ x: 0, y: 0, w: 20, h: 20 }, { x: 10, y: 10, w: 20, h: 20 })).toBe(true);
    expect(rectsOverlap({ x: 0, y: 0, w: 20, h: 20 }, { x: 30, y: 30, w: 20, h: 20 })).toBe(false);
  });

  it("scales knockback with damage and facing", () => {
    const early = calculateKnockback(20, 1, 1);
    const late = calculateKnockback(140, 1, -1);

    expect(early.x).toBeGreaterThan(0);
    expect(late.x).toBeLessThan(0);
    expect(Math.abs(late.x)).toBeGreaterThan(Math.abs(early.x));
    expect(Math.abs(late.y)).toBeGreaterThan(Math.abs(early.y));
  });

  it("applies shield damage without going below zero", () => {
    expect(applyShieldDamage(100, 10)).toBe(70);
    expect(applyShieldDamage(8, 10)).toBe(0);
  });

  it("turns a standing attack toward the target", () => {
    expect(attackFacingForInput({ currentFacing: 1, inputDirection: 0, selfX: 700, targetX: 500 })).toBe(-1);
    expect(attackFacingForInput({ currentFacing: -1, inputDirection: 0, selfX: 500, targetX: 700 })).toBe(1);
  });

  it("lets held direction override target-facing attacks", () => {
    expect(attackFacingForInput({ currentFacing: 1, inputDirection: -1, selfX: 500, targetX: 700 })).toBe(-1);
    expect(attackFacingForInput({ currentFacing: -1, inputDirection: 1, selfX: 700, targetX: 500 })).toBe(1);
    expect(attackFacingForInput({ currentFacing: -1, inputDirection: 0, selfX: 500, targetX: 500 })).toBe(-1);
  });

  it("resolves hit damage and meter gain", () => {
    const hit = resolveHit({
      currentDamage: 50,
      attackDamage: 18,
      knockbackMultiplier: 1.2,
      facing: 1
    });

    expect(hit.damage).toBe(68);
    expect(hit.knockbackX).toBeGreaterThan(0);
    expect(hit.knockbackY).toBeLessThan(0);
    expect(hit.attackerMeter).toBeCloseTo(16.2);
    expect(hit.defenderMeter).toBeCloseTo(5.4);
  });

  it("uses larger melee ranges for heavier attacks", () => {
    expect(meleeRangeForAttack("heavy")).toBeGreaterThan(meleeRangeForAttack("quick"));
    expect(meleeRangeForAttack("ultimate")).toBeGreaterThan(meleeRangeForAttack("heavy"));
  });
});
