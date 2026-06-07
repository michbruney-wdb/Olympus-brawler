import { MenuSceneBase } from "./MenuSceneBase";

const OPTIONS = ["Start", "Controls"];

export class MainMenuScene extends MenuSceneBase {
  constructor() {
    super("MainMenuScene");
  }

  create(): void {
    this.selectedIndex = 0;
    this.drawBackdrop("stage-olympus", 0.34);
    this.addTitle("OLYMPUS BRAWLER", "A mythic platform fighter vertical slice");
    this.addMenuOptions(OPTIONS, 300);
    this.addFooter("Enter: select  |  Arrow keys or W/S: navigate");
    this.createMenuInput();
  }

  update(): void {
    this.handleMenuInput(OPTIONS.length, () => {
      this.scene.start(this.selectedIndex === 0 ? "ModeSelectScene" : "ControlsScene");
    });
  }
}
