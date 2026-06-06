import Phaser from "phaser";
import { STORY_INTRO_LINES, STORY_WIN_LINES } from "../data/story";

interface StorySceneData {
  afterBattle?: boolean;
}

export class StoryScene extends Phaser.Scene {
  private lineIndex = 0;
  private lines = STORY_INTRO_LINES;
  private enter?: Phaser.Input.Keyboard.Key;
  private lineObjects: Phaser.GameObjects.GameObject[] = [];

  constructor() {
    super("StoryScene");
  }

  init(data: StorySceneData): void {
    this.lines = data.afterBattle ? STORY_WIN_LINES : STORY_INTRO_LINES;
    this.lineIndex = 0;
  }

  create(): void {
    const { width, height } = this.scale;
    this.add.image(width / 2, height / 2, "stage-olympus").setDisplaySize(width, height);
    this.add.rectangle(width / 2, height / 2, width, height, 0x050713, 0.52);

    this.add
      .text(width / 2, 90, "Story Mode", {
        fontFamily: "Georgia, serif",
        fontSize: "56px",
        color: "#f0d48a",
        stroke: "#101522",
        strokeThickness: 6
      })
      .setOrigin(0.5);

    this.drawLine();
    this.enter = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
  }

  update(): void {
    if (!this.enter || !Phaser.Input.Keyboard.JustDown(this.enter)) return;

    this.lineIndex += 1;

    if (this.lineIndex >= this.lines.length) {
      this.scene.start("BattleScene");
      return;
    }

    this.drawLine();
  }

  private drawLine(): void {
    const { width, height } = this.scale;
    const line = this.lines[this.lineIndex];
    this.lineObjects.forEach((item) => item.destroy());
    this.lineObjects = [];

    const panel = this.add.rectangle(width / 2, height - 145, 900, 160, 0x101522, 0.9);
    panel.setStrokeStyle(3, 0xf0d48a, 0.9);
    this.lineObjects.push(panel);

    this.lineObjects.push(
      this.add
      .text(width / 2 - 410, height - 198, line.speaker, {
        fontFamily: "Georgia, serif",
        fontSize: "28px",
        color: "#f0d48a"
      })
      .setOrigin(0, 0.5)
    );

    this.lineObjects.push(
      this.add
      .text(width / 2 - 410, height - 146, line.text, {
        fontFamily: "Arial, sans-serif",
        fontSize: "23px",
        color: "#f7efe1",
        wordWrap: { width: 820 }
      })
      .setOrigin(0, 0.5)
    );

    this.lineObjects.push(
      this.add
      .text(width / 2 + 350, height - 82, "Enter", {
        fontFamily: "Arial, sans-serif",
        fontSize: "18px",
        color: "#d7deef"
      })
      .setOrigin(0.5)
    );
  }
}
