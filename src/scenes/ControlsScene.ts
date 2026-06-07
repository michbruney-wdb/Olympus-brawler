import Phaser from "phaser";

const CONTROL_COLUMNS = [
  {
    title: "Player 1",
    rows: [
      ["Move", "A / D"],
      ["Jump", "W"],
      ["Quick", "F"],
      ["Heavy", "G"],
      ["Special", "H"],
      ["Ultimate", "J"],
      ["Shield", "K"],
      ["Dash", "L"]
    ]
  },
  {
    title: "Player 2",
    rows: [
      ["Move", "Left / Right"],
      ["Jump", "Up"],
      ["Quick", "N"],
      ["Heavy", "M"],
      ["Special", ","],
      ["Ultimate", "."],
      ["Shield", "/"],
      ["Dash", "Shift"]
    ]
  },
  {
    title: "Menus",
    rows: [
      ["Navigate", "Arrows / W/S"],
      ["Select", "Enter"],
      ["Pause", "P"],
      ["Rematch", "R"],
      ["Mode Select", "Enter after match"],
      ["Back", "Esc"]
    ]
  }
];

export class ControlsScene extends Phaser.Scene {
  private backKey?: Phaser.Input.Keyboard.Key;
  private enterKey?: Phaser.Input.Keyboard.Key;

  constructor() {
    super("ControlsScene");
  }

  create(): void {
    const { width, height } = this.scale;

    this.add.image(width / 2, height / 2, "stage-olympus").setDisplaySize(width, height);
    this.add.rectangle(width / 2, height / 2, width, height, 0x070a14, 0.62);

    this.add
      .text(width / 2, 76, "Controls", {
        fontFamily: "Georgia, serif",
        fontSize: "60px",
        color: "#f0d48a",
        stroke: "#1c1420",
        strokeThickness: 8
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, 128, "Local keyboard bindings for the current vertical slice", {
        fontFamily: "Arial, sans-serif",
        fontSize: "19px",
        color: "#f7efe1"
      })
      .setOrigin(0.5);

    CONTROL_COLUMNS.forEach((column, index) => {
      this.drawControlColumn(236 + index * 404, 208, column.title, column.rows);
    });

    this.add
      .text(width / 2, height - 46, "Esc or Enter: back to main menu", {
        fontFamily: "Arial, sans-serif",
        fontSize: "18px",
        color: "#d7deef"
      })
      .setOrigin(0.5);

    this.backKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    this.enterKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
  }

  update(): void {
    if (
      (this.backKey && Phaser.Input.Keyboard.JustDown(this.backKey)) ||
      (this.enterKey && Phaser.Input.Keyboard.JustDown(this.enterKey))
    ) {
      this.scene.start("MainMenuScene");
    }
  }

  private drawControlColumn(x: number, y: number, title: string, rows: string[][]): void {
    const panel = this.add.rectangle(x, y + 178, 326, 390, 0x101522, 0.9);
    panel.setStrokeStyle(2, 0xf0d48a, 0.72);

    this.add
      .text(x, y, title, {
        fontFamily: "Georgia, serif",
        fontSize: "30px",
        color: "#f0d48a"
      })
      .setOrigin(0.5);

    rows.forEach(([action, key], index) => {
      const rowY = y + 58 + index * 38;

      this.add
        .text(x - 126, rowY, action, {
          fontFamily: "Arial, sans-serif",
          fontSize: "19px",
          color: "#f7efe1"
        })
        .setOrigin(0, 0.5);

      this.add
        .text(x + 126, rowY, key, {
          fontFamily: "Arial, sans-serif",
          fontSize: "19px",
          color: "#9fd7ff"
        })
        .setOrigin(1, 0.5);
    });
  }
}
