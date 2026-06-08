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
