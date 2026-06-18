import Phaser from "phaser";
import { FIGHTER_IDS, getFighter } from "../data/fighters";
import type { FighterId, GameMode } from "../types";
import { MenuSceneBase } from "./MenuSceneBase";

type FighterSelectStep = "player" | "opponent";

interface FighterSelectSceneData {
  step?: FighterSelectStep;
}

export class FighterSelectScene extends MenuSceneBase {
  private cardObjects: Phaser.GameObjects.GameObject[] = [];
  private renderedIndex = -1;
  private step: FighterSelectStep = "player";

  constructor() {
    super("FighterSelectScene");
  }

  init(data: FighterSelectSceneData = {}): void {
    this.step = data.step ?? "player";
  }

  create(): void {
    const mode = (this.registry.get("mode") as GameMode | undefined) ?? "pvc";
    this.selectedIndex = this.initialSelectedIndex(mode);
    this.cardObjects = [];
    this.renderedIndex = -1;
    this.drawBackdrop("stage-olympus", 0.52);
    this.addTitle(this.titleText(mode), this.subtitleText(mode));
    this.createMenuInput();
    this.drawFighterCards();
    this.renderedIndex = this.selectedIndex;
    this.addFooter(this.footerText(mode));
  }

  update(): void {
    this.handleMenuInput(FIGHTER_IDS.length, () => this.selectCurrentFighter());

    if (this.renderedIndex !== this.selectedIndex) {
      this.redrawFighterCards();
    }
  }

  private selectCurrentFighter(): void {
    const mode = this.registry.get("mode") as GameMode;
    const selectedFighter = FIGHTER_IDS[this.selectedIndex];

    if (mode === "story") {
      this.registry.set("storyPlayerFighter", selectedFighter);
      this.registry.set("playerFighter", selectedFighter);
      this.registry.set("storyTrialIndex", 0);
      this.scene.start("StoryScene", { phase: "intro", trialIndex: 0 });
      return;
    }

    if (this.step === "player") {
      this.registry.set("playerFighter", selectedFighter);
      this.scene.restart({ step: "opponent" });
      return;
    }

    this.registry.set("opponentFighter", selectedFighter);
    this.scene.start("StageSelectScene");
  }

  private drawFighterCards(): void {
    const { width } = this.scale;
    const slots = [
      { offset: -1, x: width / 2 - 330, scale: 0.9 },
      { offset: 0, x: width / 2, scale: 1 },
      { offset: 1, x: width / 2 + 330, scale: 0.9 }
    ];

    slots.forEach((slot) => {
      const index = Phaser.Math.Wrap(this.selectedIndex + slot.offset, 0, FIGHTER_IDS.length);
      const id = FIGHTER_IDS[index];
      const fighter = getFighter(id);
      const selected = slot.offset === 0;
      const x = slot.x;
      const y = 270;

      const panel = this.add.rectangle(
        x,
        y,
        390 * slot.scale,
        290 * slot.scale,
        selected ? 0xf0d48a : 0x151b2c,
        selected ? 0.18 : 0.76
      );
      panel.setStrokeStyle(4, selected ? 0xffffff : fighter.accent, selected ? 1 : 0.7);
      this.cardObjects.push(panel);

      this.cardObjects.push(this.add.image(x, y - 30, `${fighter.id}-idle-1`).setDisplaySize(150 * slot.scale, 175 * slot.scale));

      this.cardObjects.push(
        this.add
        .text(x, y + 94, fighter.name, {
          fontFamily: "Georgia, serif",
          fontSize: "34px",
          color: "#f7efe1",
          stroke: "#101522",
          strokeThickness: 5
        })
        .setOrigin(0.5)
      );

      this.cardObjects.push(
        this.add
        .text(x, y + 132, fighter.epithet, {
          fontFamily: "Arial, sans-serif",
          fontSize: "17px",
          color: fighter.portraitColor
        })
        .setOrigin(0.5)
      );
    });

    this.cardObjects.push(
      this.add
        .text(width / 2, 466, `${this.selectedIndex + 1} / ${FIGHTER_IDS.length}`, {
          fontFamily: "Arial, sans-serif",
          fontSize: "18px",
          color: "#d7deef"
        })
        .setOrigin(0.5)
    );
  }

  private redrawFighterCards(): void {
    this.cardObjects.forEach((item) => item.destroy());
    this.cardObjects = [];
    this.drawFighterCards();
    this.renderedIndex = this.selectedIndex;
  }

  private initialSelectedIndex(mode: GameMode): number {
    if (mode === "story") {
      return this.fighterIndex((this.registry.get("storyPlayerFighter") as FighterId | undefined) ?? "zeus");
    }

    if (this.step === "opponent") {
      const playerFighter = this.registry.get("playerFighter") as FighterId | undefined;
      const playerIndex = playerFighter ? this.fighterIndex(playerFighter) : 0;
      return Phaser.Math.Wrap(playerIndex + 1, 0, FIGHTER_IDS.length);
    }

    return this.fighterIndex((this.registry.get("playerFighter") as FighterId | undefined) ?? "zeus");
  }

  private fighterIndex(fighterId: FighterId): number {
    const index = FIGHTER_IDS.indexOf(fighterId);
    return index >= 0 ? index : 0;
  }

  private titleText(mode: GameMode): string {
    if (mode === "story") return "Choose Story Champion";
    if (this.step === "opponent") return mode === "pvp" ? "Choose Player 2" : "Choose CPU Rival";
    return "Choose Champion";
  }

  private subtitleText(mode: GameMode): string {
    if (mode === "story") return "Pick who climbs the divine ladder";
    if (this.step === "opponent") return "Any god or hero can answer the challenge";
    return "Select your mythic fighter";
  }

  private footerText(mode: GameMode): string {
    if (mode === "story") return "Enter: begin story";
    if (this.step === "opponent") return `Enter: select ${mode === "pvp" ? "player 2" : "CPU"}  |  Next: choose arena`;
    return "Enter: select player";
  }
}
