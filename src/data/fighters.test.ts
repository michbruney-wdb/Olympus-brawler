import { describe, expect, it } from "vitest";
import { FIGHTER_IDS, FIGHTERS } from "./fighters";

describe("fighter roster", () => {
  it("gives every fighter a unique named ultimate", () => {
    const ultimateNames = FIGHTER_IDS.map((fighterId) => FIGHTERS[fighterId].ultimateName);

    ultimateNames.forEach((name) => expect(name.trim()).not.toBe(""));
    expect(new Set(ultimateNames).size).toBe(FIGHTER_IDS.length);
  });
});
