import { expect, test } from "@playwright/test";

test("loads a battle with 3D avatars without console errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  const activeScenes = () =>
    page.evaluate(() => {
      const game = (window as Window & { __PHASER_GAME__?: { scene?: { getScenes?: (active?: boolean) => Array<{ scene: { key: string } }> } } })
        .__PHASER_GAME__;
      return game?.scene?.getScenes?.(true).map((scene) => scene.scene.key) ?? [];
    });

  await page.goto("/");
  await expect(page).toHaveTitle(/Olympus Brawler/);
  await expect(page.locator("canvas")).toBeVisible();
  await expect(page.locator("canvas")).toHaveCount(1);

  await page.locator("canvas").click();
  await expect.poll(activeScenes).toContain("MainMenuScene");

  await page.evaluate(() => {
    const game = (window as Window & {
      __PHASER_GAME__?: {
        registry: { set: (key: string, value: unknown) => void };
        scene: {
          getScenes: (active?: boolean) => Array<{ scene: { key: string } }>;
          start: (key: string) => void;
          stop: (key: string) => void;
        };
      };
    }).__PHASER_GAME__;
    if (!game) throw new Error("Phaser game debug handle is not available.");

    game.registry.set("mode", "pvc");
    game.registry.set("stage", "olympus");
    game.registry.set("playerFighter", "zeus");
    game.registry.set("opponentFighter", "athena");
    game.scene.getScenes(true).forEach((scene) => game.scene.stop(scene.scene.key));
    game.scene.start("BattleScene");
  });

  await expect.poll(activeScenes).toContain("BattleScene");

  await expect
    .poll(async () =>
      page.evaluate(() => {
        const game = (window as Window & { __PHASER_GAME__?: { textures?: { list?: Record<string, unknown> } } })
          .__PHASER_GAME__;
        return Object.keys(game?.textures?.list ?? {}).filter((key) => key.startsWith("avatar3d-")).length;
      })
    )
    .toBeGreaterThanOrEqual(2);

  expect(errors).toEqual([]);
});

test("cleans up 3D avatars across story fights through Achilles", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  const activeScenes = () =>
    page.evaluate(() => {
      const game = (window as Window & { __PHASER_GAME__?: { scene?: { getScenes?: (active?: boolean) => Array<{ scene: { key: string } }> } } })
        .__PHASER_GAME__;
      return game?.scene?.getScenes?.(true).map((scene) => scene.scene.key) ?? [];
    });
  const avatarTextureCount = () =>
    page.evaluate(() => {
      const game = (window as Window & { __PHASER_GAME__?: { textures?: { list?: Record<string, unknown> } } })
        .__PHASER_GAME__;
      return Object.keys(game?.textures?.list ?? {}).filter((key) => key.startsWith("avatar3d-")).length;
    });
  const trials = [
    { index: 0, title: "Trial 1: Shield Counsel", stage: "olympus", opponent: "athena" },
    { index: 1, title: "Trial 2: Break The Tide", stage: "poseidon", opponent: "poseidon" },
    { index: 2, title: "Trial 3: Shadow Interruption", stage: "underworld", opponent: "hades" },
    { index: 3, title: "Trial 4: War Answers", stage: "olympus", opponent: "ares" },
    { index: 4, title: "Trial 5: Moonlit Hunt", stage: "olympus", opponent: "artemis" },
    { index: 5, title: "Trial 6: Twelve-Labor Titan", stage: "olympus", opponent: "heracles" },
    { index: 6, title: "Trial 7: Bright Spear", stage: "olympus", opponent: "achilles" }
  ];

  await page.goto("/");
  await expect(page.locator("canvas")).toBeVisible();
  await expect.poll(activeScenes).toContain("MainMenuScene");

  for (const trial of trials) {
    await page.evaluate((trial) => {
      const game = (window as Window & {
        __PHASER_GAME__?: {
          registry: { set: (key: string, value: unknown) => void };
          scene: {
            getScenes: (active?: boolean) => Array<{ scene: { key: string } }>;
            start: (key: string) => void;
            stop: (key: string) => void;
          };
        };
      }).__PHASER_GAME__;
      if (!game) throw new Error("Phaser game debug handle is not available.");

      game.registry.set("mode", "story");
      game.registry.set("storyTrialIndex", trial.index);
      game.registry.set("storyTrialTitle", trial.title);
      game.registry.set("stage", trial.stage);
      game.registry.set("playerFighter", "zeus");
      game.registry.set("opponentFighter", trial.opponent);
      game.scene.getScenes(true).forEach((scene) => game.scene.stop(scene.scene.key));
      game.scene.start("BattleScene");
    }, trial);

    await expect.poll(activeScenes).toContain("BattleScene");
    await expect.poll(avatarTextureCount).toBeGreaterThanOrEqual(2);

    await page.evaluate(() => {
      const game = (window as Window & { __PHASER_GAME__?: { scene?: { stop: (key: string) => void } } }).__PHASER_GAME__;
      game?.scene?.stop("BattleScene");
    });

    await expect.poll(avatarTextureCount).toBe(0);
  }

  expect(errors).toEqual([]);
});
