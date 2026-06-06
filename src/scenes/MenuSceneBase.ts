import Phaser from "phaser";

export abstract class MenuSceneBase extends Phaser.Scene {
  protected selectedIndex = 0;
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private enter?: Phaser.Input.Keyboard.Key;
  private w?: Phaser.Input.Keyboard.Key;
  private s?: Phaser.Input.Keyboard.Key;
  private menuPanels: Phaser.GameObjects.Rectangle[] = [];
  private menuTexts: Phaser.GameObjects.Text[] = [];
  private menuOptions: string[] = [];

  protected createMenuInput(): void {
    this.cursors = this.input.keyboard?.createCursorKeys();
    this.enter = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    this.w = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.s = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.S);
  }

  protected handleMenuInput(optionCount: number, onSelect: () => void): void {
    if (!this.cursors || !this.enter || !this.w || !this.s) return;

    if (Phaser.Input.Keyboard.JustDown(this.cursors.up) || Phaser.Input.Keyboard.JustDown(this.w)) {
      this.selectedIndex = Phaser.Math.Wrap(this.selectedIndex - 1, 0, optionCount);
      this.soundSelected();
      this.refreshMenuOptions();
    }

    if (Phaser.Input.Keyboard.JustDown(this.cursors.down) || Phaser.Input.Keyboard.JustDown(this.s)) {
      this.selectedIndex = Phaser.Math.Wrap(this.selectedIndex + 1, 0, optionCount);
      this.soundSelected();
      this.refreshMenuOptions();
    }

    if (Phaser.Input.Keyboard.JustDown(this.enter)) {
      onSelect();
    }
  }

  protected drawBackdrop(texture = "stage-olympus", overlay = 0.46): void {
    const { width, height } = this.scale;
    this.add.image(width / 2, height / 2, texture).setDisplaySize(width, height);
    this.add.rectangle(width / 2, height / 2, width, height, 0x070a14, overlay);
  }

  protected addTitle(title: string, subtitle?: string): void {
    const { width } = this.scale;

    this.add
      .text(width / 2, 82, title, {
        fontFamily: "Georgia, serif",
        fontSize: "64px",
        color: "#f0d48a",
        stroke: "#1c1420",
        strokeThickness: 8
      })
      .setOrigin(0.5);

    if (subtitle) {
      this.add
        .text(width / 2, 136, subtitle, {
          fontFamily: "Arial, sans-serif",
          fontSize: "20px",
          color: "#f7efe1"
        })
        .setOrigin(0.5);
    }
  }

  protected addMenuOptions(options: string[], startY = 250): void {
    const { width } = this.scale;
    this.menuOptions = options;
    this.menuPanels.forEach((panel) => panel.destroy());
    this.menuTexts.forEach((text) => text.destroy());
    this.menuPanels = [];
    this.menuTexts = [];

    options.forEach((option, index) => {
      const selected = index === this.selectedIndex;
      const y = startY + index * 72;

      const panel = this.add.rectangle(width / 2, y, 430, 52, selected ? 0xf0d48a : 0x151b2c, selected ? 0.94 : 0.78);
      panel.setStrokeStyle(2, selected ? 0xffffff : 0x6d86c6, selected ? 1 : 0.6);
      this.menuPanels.push(panel);

      const text = this.add
        .text(width / 2, y, option, {
          fontFamily: "Arial, sans-serif",
          fontSize: "24px",
          color: selected ? "#15100f" : "#f7efe1"
        })
        .setOrigin(0.5);
      this.menuTexts.push(text);
    });
  }

  protected refreshMenuOptions(): void {
    this.menuOptions.forEach((_, index) => {
      const selected = index === this.selectedIndex;
      const panel = this.menuPanels[index];
      const text = this.menuTexts[index];

      panel.setFillStyle(selected ? 0xf0d48a : 0x151b2c, selected ? 0.94 : 0.78);
      panel.setStrokeStyle(2, selected ? 0xffffff : 0x6d86c6, selected ? 1 : 0.6);
      text.setColor(selected ? "#15100f" : "#f7efe1");
    });
  }

  protected addFooter(text: string): void {
    const { width, height } = this.scale;
    this.add
      .text(width / 2, height - 42, text, {
        fontFamily: "Arial, sans-serif",
        fontSize: "16px",
        color: "#d7deef"
      })
      .setOrigin(0.5);
  }

  private soundSelected(): void {
    this.cameras.main.shake(42, 0.0015);
  }
}
