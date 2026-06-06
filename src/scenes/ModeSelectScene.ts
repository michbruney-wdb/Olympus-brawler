import type { GameMode } from "../types";
import { MenuSceneBase } from "./MenuSceneBase";

const OPTIONS: Array<{ label: string; mode: GameMode }> = [
  { label: "Story Mode", mode: "story" },
  { label: "Player vs Computer", mode: "pvc" },
  { label: "Player vs Player", mode: "pvp" }
];

export class ModeSelectScene extends MenuSceneBase {
  constructor() {
    super("ModeSelectScene");
  }

  create(): void {
    this.selectedIndex = 0;
    this.drawBackdrop("stage-olympus", 0.48);
    this.addTitle("Choose Mode", "Story, practice, or local rivalry");
    this.addMenuOptions(OPTIONS.map((option) => option.label), 252);
    this.addFooter("Story opens with Zeus and Athena. PvP uses shared keyboard controls.");
    this.createMenuInput();
  }

  update(): void {
    this.handleMenuInput(OPTIONS.length, () => {
      const option = OPTIONS[this.selectedIndex];
      this.registry.set("mode", option.mode);

      if (option.mode === "story") {
        this.registry.set("playerFighter", "zeus");
        this.registry.set("opponentFighter", "athena");
        this.registry.set("stage", "olympus");
        this.scene.start("StoryScene", { afterBattle: false });
        return;
      }

      this.scene.start("FighterSelectScene");
    });
  }
}
