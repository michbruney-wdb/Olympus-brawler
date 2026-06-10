import { describe, expect, it } from "vitest";
import { avatarFacingYaw } from "./avatar-facing";

describe("avatarFacingYaw", () => {
  it("turns avatars toward the direction they are facing", () => {
    expect(avatarFacingYaw(1)).toBeGreaterThan(0);
    expect(avatarFacingYaw(-1)).toBeLessThan(0);
    expect(Math.abs(avatarFacingYaw(1))).toBe(Math.abs(avatarFacingYaw(-1)));
  });
});
