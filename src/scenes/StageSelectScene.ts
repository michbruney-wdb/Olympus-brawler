import { STAGE_IDS, getStage } from "../data/stages";
import { MenuSceneBase } from "./MenuSceneBase";

export class StageSelectScene extends MenuSceneBase {
  private cardObjects: Phaser.GameObjects.GameObject[] = [];
  private renderedIndex = -1;

  constructor() {
    super("StageSelectScene");
  }

  create(): void {
    this.selectedIndex = 0;
    this.drawBackdrop("stage-olympus", 0.55);
    this.addTitle("Choose Arena", "Three mythic battlegrounds are available");
    this.createMenuInput();
    this.drawStageCards();
    this.renderedIndex = this.selectedIndex;
    this.addFooter("Enter: begin battle");
  }

  update(): void {
    this.handleMenuInput(STAGE_IDS.length, () => {
      this.registry.set("stage", STAGE_IDS[this.selectedIndex]);
      this.scene.start("BattleScene");
    });

    if (this.renderedIndex !== this.selectedIndex) {
      this.redrawStageCards();
    }
  }

  private drawStageCards(): void {
    const { width } = this.scale;
    const startX = width / 2 - 350;

    STAGE_IDS.forEach((id, index) => {
      const stage = getStage(id);
      const selected = index === this.selectedIndex;
      const x = startX + index * 350;
      const y = 300;

      const panel = this.add.rectangle(x, y, 305, 245, selected ? 0xf0d48a : 0x151b2c, selected ? 0.15 : 0.82);
      panel.setStrokeStyle(4, selected ? 0xffffff : stage.accent, selected ? 1 : 0.7);
      this.cardObjects.push(panel);

      this.cardObjects.push(this.add.image(x, y - 28, `stage-${id}`).setDisplaySize(252, 132));

      this.cardObjects.push(
        this.add
        .text(x, y + 78, stage.name, {
          fontFamily: "Georgia, serif",
          fontSize: "24px",
          color: "#f7efe1",
          stroke: "#101522",
          strokeThickness: 4
        })
        .setOrigin(0.5)
      );
    });
  }

  private redrawStageCards(): void {
    this.cardObjects.forEach((item) => item.destroy());
    this.cardObjects = [];
    this.drawStageCards();
    this.renderedIndex = this.selectedIndex;
  }
}
