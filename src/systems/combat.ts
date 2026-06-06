import type { RectLike } from "../types";

export interface HitResult {
  damage: number;
  knockbackX: number;
  knockbackY: number;
  attackerMeter: number;
  defenderMeter: number;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function rectsOverlap(a: RectLike, b: RectLike): boolean {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

export function calculateKnockback(
  defenderDamage: number,
  knockbackMultiplier: number,
  facing: -1 | 1
): { x: number; y: number } {
  const power = (7 + defenderDamage * 0.115) * knockbackMultiplier;

  return {
    x: facing * power * 34,
    y: -(250 + defenderDamage * 1.6)
  };
}

export function applyShieldDamage(shield: number, attackDamage: number): number {
  return clamp(shield - attackDamage * 3, 0, 100);
}

export function resolveHit(params: {
  currentDamage: number;
  attackDamage: number;
  knockbackMultiplier: number;
  facing: -1 | 1;
}): HitResult {
  const damage = params.currentDamage + params.attackDamage;
  const knockback = calculateKnockback(damage, params.knockbackMultiplier, params.facing);

  return {
    damage,
    knockbackX: knockback.x,
    knockbackY: knockback.y,
    attackerMeter: clamp(params.attackDamage * 0.9, 0, 100),
    defenderMeter: clamp(params.attackDamage * 0.3, 0, 100)
  };
}

export function meleeRangeForAttack(attack: "quick" | "heavy" | "ultimate"): number {
  if (attack === "ultimate") return 132;
  if (attack === "heavy") return 94;
  return 62;
}
