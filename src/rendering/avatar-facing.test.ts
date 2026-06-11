import { describe, expect, it } from "vitest";
import { avatarAttackYaw, avatarFacingYaw } from "./avatar-facing";

describe("avatarFacingYaw", () => {
  it("turns avatars toward the direction they are facing", () => {
    expect(avatarFacingYaw(1)).toBeGreaterThan(0);
    expect(avatarFacingYaw(-1)).toBeLessThan(0);
    expect(Math.abs(avatarFacingYaw(1))).toBe(Math.abs(avatarFacingYaw(-1)));
  });

  it("turns heavy attacks deeper into their attack direction", () => {
    expect(avatarAttackYaw(1, "heavy")).toBeGreaterThan(avatarFacingYaw(1));
    expect(avatarAttackYaw(-1, "heavy")).toBeLessThan(avatarFacingYaw(-1));
    expect(avatarAttackYaw(1, "quick")).toBe(avatarFacingYaw(1));
  });
});
