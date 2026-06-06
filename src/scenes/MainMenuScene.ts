import { MenuSceneBase } from "./MenuSceneBase";

export class MainMenuScene extends MenuSceneBase {
  constructor() {
    super("MainMenuScene");
  }

  create(): void {
    this.selectedIndex = 0;
    this.drawBackdrop("stage-olympus", 0.34);
    this.addTitle("OLYMPUS BRAWLER", "A mythic platform fighter vertical slice");
    this.addMenuOptions(["Start"], 322);
    this.addFooter("Enter: select  |  Arrow keys or W/S: navigate");
    this.createMenuInput();
  }

  update(): void {
    this.handleMenuInput(1, () => {
      this.scene.start("ModeSelectScene");
    });
  }
}
