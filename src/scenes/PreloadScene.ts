import Phaser from "phaser";
import { ANIMATION_FRAME_COUNTS, FIGHTER_IDS, getFighter } from "../data/fighters";
import { STAGE_IDS, getStage } from "../data/stages";

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super("PreloadScene");
  }

  preload(): void {
    const { width, height } = this.scale;

    const panel = this.add.rectangle(width / 2, height / 2, 520, 110, 0x101522, 0.9);
    panel.setStrokeStyle(2, 0xf0d48a, 0.9);

    this.add
      .text(width / 2, height / 2 - 24, "Summoning Olympus...", {
        fontFamily: "Georgia, serif",
        fontSize: "28px",
        color: "#f7efe1"
      })
      .setOrigin(0.5);

    const bar = this.add.rectangle(width / 2 - 180, height / 2 + 26, 0, 12, 0xf0d48a).setOrigin(0, 0.5);
    this.add.rectangle(width / 2, height / 2 + 26, 360, 12).setStrokeStyle(1, 0xf0d48a, 0.8);

    this.load.on("progress", (value: number) => {
      bar.width = 360 * value;
    });

    STAGE_IDS.forEach((id) => {
      const stage = getStage(id);
      this.load.image(`stage-${id}`, stage.background);
    });

    FIGHTER_IDS.forEach((fighterId) => {
      const fighter = getFighter(fighterId);

      Object.entries(ANIMATION_FRAME_COUNTS).forEach(([animation, count]) => {
        for (let i = 1; i <= count; i += 1) {
          this.load.image(
            `${fighter.id}-${animation}-${i}`,
            `/assets/fighters/${fighter.folder}/${animation}_${i}.png`
          );
        }
      });
    });
  }

  create(): void {
    FIGHTER_IDS.forEach((fighterId) => {
      Object.entries(ANIMATION_FRAME_COUNTS).forEach(([animation, count]) => {
        const frames = Array.from({ length: count }, (_, index) => ({
          key: `${fighterId}-${animation}-${index + 1}`
        }));

        this.anims.create({
          key: `${fighterId}-${animation}`,
          frames,
          frameRate: animation === "run" ? 9 : animation === "idle" ? 4 : 8,
          repeat: animation === "idle" || animation === "run" ? -1 : 0
        });
      });
    });

    this.scene.start("MainMenuScene");
  }
}
