import Phaser from "phaser";
import { getStage } from "../data/stages";
import { getStoryTrial, STORY_COMPLETE_LINES, type StoryLine, type StoryTrial } from "../data/story";

type StoryPhase = "intro" | "win" | "complete";

interface StorySceneData {
  phase?: StoryPhase;
  trialIndex?: number;
}

export class StoryScene extends Phaser.Scene {
  private phase: StoryPhase = "intro";
  private trialIndex = 0;
  private trial?: StoryTrial;
  private lineIndex = 0;
  private lines: StoryLine[] = [];
  private enter?: Phaser.Input.Keyboard.Key;
  private lineObjects: Phaser.GameObjects.GameObject[] = [];

  constructor() {
    super("StoryScene");
  }

  init(data: StorySceneData): void {
    this.phase = data.phase ?? "intro";
    this.trialIndex = data.trialIndex ?? ((this.registry.get("storyTrialIndex") as number | undefined) ?? 0);
    this.trial = getStoryTrial(this.trialIndex);
    this.lines = this.phase === "complete" ? STORY_COMPLETE_LINES : this.getTrialLines();
    this.lineIndex = 0;
  }

  create(): void {
    const { width, height } = this.scale;
    const stage = getStage(this.trial?.stage ?? "olympus");

    this.add.image(width / 2, height / 2, `stage-${stage.id}`).setDisplaySize(width, height);
    this.add.rectangle(width / 2, height / 2, width, height, 0x050713, 0.52);

    this.add
      .text(width / 2, 78, "Story Mode", {
        fontFamily: "Georgia, serif",
        fontSize: "56px",
        color: "#f0d48a",
        stroke: "#101522",
        strokeThickness: 6
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, 132, this.titleText(), {
        fontFamily: "Arial, sans-serif",
        fontSize: "21px",
        color: "#f7efe1"
      })
      .setOrigin(0.5);

    this.drawLine();
    this.enter = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
  }

  update(): void {
    if (!this.enter || !Phaser.Input.Keyboard.JustDown(this.enter)) return;

    this.lineIndex += 1;

    if (this.lineIndex >= this.lines.length) {
      this.advanceStory();
      return;
    }

    this.drawLine();
  }

  private getTrialLines(): StoryLine[] {
    if (!this.trial) return STORY_COMPLETE_LINES;
    return this.phase === "win" ? this.trial.winLines : this.trial.introLines;
  }

  private titleText(): string {
    if (this.phase === "complete") return "First ladder complete";
    return this.trial?.title ?? "Story ladder complete";
  }

  private advanceStory(): void {
    if (this.phase === "complete" || !this.trial) {
      this.registry.set("storyTrialIndex", 0);
      this.scene.start("ModeSelectScene");
      return;
    }

    if (this.phase === "intro") {
      this.applyTrialToRegistry(this.trial);
      this.scene.start("BattleScene");
      return;
    }

    const nextTrialIndex = this.trialIndex + 1;
    this.registry.set("storyTrialIndex", nextTrialIndex);

    if (getStoryTrial(nextTrialIndex)) {
      this.scene.start("StoryScene", { phase: "intro", trialIndex: nextTrialIndex });
      return;
    }

    this.scene.start("StoryScene", { phase: "complete", trialIndex: this.trialIndex });
  }

  private applyTrialToRegistry(trial: StoryTrial): void {
    this.registry.set("mode", "story");
    this.registry.set("storyTrialIndex", this.trialIndex);
    this.registry.set("storyTrialTitle", trial.title);
    this.registry.set("playerFighter", trial.playerFighter);
    this.registry.set("opponentFighter", trial.opponentFighter);
    this.registry.set("stage", trial.stage);
  }

  private drawLine(): void {
    const { width, height } = this.scale;
    const line = this.lines[this.lineIndex];
    this.lineObjects.forEach((item) => item.destroy());
    this.lineObjects = [];

    const panel = this.add.rectangle(width / 2, height - 145, 930, 166, 0x101522, 0.9);
    panel.setStrokeStyle(3, 0xf0d48a, 0.9);
    this.lineObjects.push(panel);

    this.lineObjects.push(
      this.add
      .text(width / 2 - 425, height - 200, line.speaker, {
        fontFamily: "Georgia, serif",
        fontSize: "28px",
        color: "#f0d48a"
      })
      .setOrigin(0, 0.5)
    );

    this.lineObjects.push(
      this.add
      .text(width / 2 - 425, height - 146, line.text, {
        fontFamily: "Arial, sans-serif",
        fontSize: "23px",
        color: "#f7efe1",
        wordWrap: { width: 850 }
      })
      .setOrigin(0, 0.5)
    );

    this.lineObjects.push(
      this.add
      .text(width / 2 + 362, height - 82, "Enter", {
        fontFamily: "Arial, sans-serif",
        fontSize: "18px",
        color: "#d7deef"
      })
      .setOrigin(0.5)
    );
  }
}
