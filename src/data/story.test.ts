import { describe, expect, it } from "vitest";
import { FIGHTER_IDS } from "./fighters";
import { getStoryTrial, STORY_COMPLETE_LINES, STORY_TRIALS } from "./story";
import { STAGE_IDS } from "./stages";

describe("story ladder", () => {
  it("builds a full-length ladder that uses the available roster", () => {
    const ids = STORY_TRIALS.map((trial) => trial.id);
    const opponents = new Set(STORY_TRIALS.map((trial) => trial.opponentFighter));
    const expectedOpponents = FIGHTER_IDS.filter((fighterId) => fighterId !== "zeus");

    expect(STORY_TRIALS.length).toBeGreaterThanOrEqual(12);
    expect(new Set(ids).size).toBe(STORY_TRIALS.length);
    expectedOpponents.forEach((fighterId) => expect(opponents.has(fighterId)).toBe(true));
    expect(STORY_TRIALS[0]?.opponentFighter).toBe("athena");
    expect(STORY_TRIALS.at(-1)?.opponentFighter).toBe("hades");
  });

  it("provides dialogue before and after each trial", () => {
    STORY_TRIALS.forEach((trial) => {
      expect(STAGE_IDS).toContain(trial.stage);
      expect(FIGHTER_IDS).toContain(trial.playerFighter);
      expect(FIGHTER_IDS).toContain(trial.opponentFighter);
      expect(trial.introLines.length).toBeGreaterThanOrEqual(2);
      expect(trial.winLines.length).toBeGreaterThanOrEqual(2);
      trial.introLines.concat(trial.winLines).forEach((line) => {
        expect(line.speaker.trim()).not.toBe("");
        expect(line.text.trim()).not.toBe("");
      });
    });

    expect(STORY_COMPLETE_LINES.length).toBeGreaterThanOrEqual(3);
  });

  it("returns undefined when the ladder is complete", () => {
    expect(getStoryTrial(STORY_TRIALS.length)).toBeUndefined();
  });
});
