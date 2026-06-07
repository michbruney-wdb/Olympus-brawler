import { FIGHTER_IDS, getFighter } from "../data/fighters";
import type { FighterId, GameMode } from "../types";
import { MenuSceneBase } from "./MenuSceneBase";

export class FighterSelectScene extends MenuSceneBase {
  private cardObjects: Phaser.GameObjects.GameObject[] = [];
  private renderedIndex = -1;

  constructor() {
    super("FighterSelectScene");
  }

  create(): void {
    this.selectedIndex = 0;
    this.drawBackdrop("stage-olympus", 0.52);
    this.addTitle("Choose Champion", "Select a mythic fighter for PvP or PvC");
    this.createMenuInput();
    this.drawFighterCards();
    this.renderedIndex = this.selectedIndex;
    this.addFooter("Enter: select fighter  |  Next: choose arena");
  }

  update(): void {
    this.handleMenuInput(FIGHTER_IDS.length, () => {
      const playerFighter = FIGHTER_IDS[this.selectedIndex];
      const mode = this.registry.get("mode") as GameMode;
      const opponentFighter = this.getOpponentForMode(playerFighter, mode);

      this.registry.set("playerFighter", playerFighter);
      this.registry.set("opponentFighter", opponentFighter);
      this.scene.start("StageSelectScene");
    });

    if (this.renderedIndex !== this.selectedIndex) {
      this.redrawFighterCards();
    }
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

  private getOpponentForMode(playerFighter: FighterId, mode: GameMode): FighterId {
    if (mode === "pvp") {
      return playerFighter === "zeus" ? "athena" : "zeus";
    }

    return playerFighter === "zeus" ? "athena" : "zeus";
  }
}
