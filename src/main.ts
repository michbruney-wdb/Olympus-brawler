import Phaser from "phaser";
import "./styles.css";
import { BattleScene } from "./scenes/BattleScene";
import { FighterSelectScene } from "./scenes/FighterSelectScene";
import { MainMenuScene } from "./scenes/MainMenuScene";
import { ModeSelectScene } from "./scenes/ModeSelectScene";
import { PreloadScene } from "./scenes/PreloadScene";
import { StageSelectScene } from "./scenes/StageSelectScene";
import { StoryScene } from "./scenes/StoryScene";

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: "app",
  width: 1280,
  height: 720,
  backgroundColor: "#090b12",
  pixelArt: false,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  physics: {
    default: "arcade",
    arcade: {
      gravity: { x: 0, y: 1450 },
      debug: false
    }
  },
  scene: [
    PreloadScene,
    MainMenuScene,
    ModeSelectScene,
    FighterSelectScene,
    StageSelectScene,
    StoryScene,
    BattleScene
  ]
};

new Phaser.Game(config);
