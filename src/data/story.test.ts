import { describe, expect, it } from "vitest";
import { getStoryTrial, STORY_COMPLETE_LINES, STORY_TRIALS } from "./story";

describe("story ladder", () => {
  it("advances through distinct trials instead of repeating one matchup", () => {
    const matchups = STORY_TRIALS.map((trial) => `${trial.stage}:${trial.opponentFighter}`);

    expect(STORY_TRIALS.length).toBeGreaterThan(1);
    expect(new Set(matchups).size).toBe(STORY_TRIALS.length);
    expect(matchups).toEqual(["olympus:athena", "poseidon:poseidon", "underworld:hades", "olympus:ares"]);
  });

  it("provides dialogue before and after each trial", () => {
    STORY_TRIALS.forEach((trial) => {
      expect(trial.introLines.length).toBeGreaterThan(0);
      expect(trial.winLines.length).toBeGreaterThan(0);
    });

    expect(STORY_COMPLETE_LINES.length).toBeGreaterThan(0);
  });

  it("returns undefined when the ladder is complete", () => {
    expect(getStoryTrial(STORY_TRIALS.length)).toBeUndefined();
  });
});
