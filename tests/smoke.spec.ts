import { expect, test } from "@playwright/test";
import { FIGHTER_IDS } from "../src/data/fighters";
import type { FighterId } from "../src/types";

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

test("each fighter can fire a unique ultimate without console errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });

  await page.goto("/");
  await expect(page.locator("canvas")).toBeVisible();

  for (const fighterId of FIGHTER_IDS) {
    const opponentFighter: FighterId = fighterId === "athena" ? "zeus" : "athena";
    const result = await page.evaluate(
      async ({ fighterId, opponentFighter }) => {
        const game = (window as Window & {
          __PHASER_GAME__?: {
            registry: { set: (key: string, value: unknown) => void };
            scene: {
              getScene: (key: string) => unknown;
              getScenes: (active?: boolean) => Array<{ scene: { key: string } }>;
              start: (key: string) => void;
              stop: (key: string) => void;
            };
          };
        }).__PHASER_GAME__;
        if (!game) throw new Error("Phaser game debug handle is not available.");

        game.registry.set("mode", "pvc");
        game.registry.set("stage", "olympus");
        game.registry.set("playerFighter", fighterId);
        game.registry.set("opponentFighter", opponentFighter);
        game.scene.getScenes(true).forEach((scene) => game.scene.stop(scene.scene.key));
        game.scene.start("BattleScene");
        await new Promise((resolve) => window.setTimeout(resolve, 90));

        const scene = game.scene.getScene("BattleScene") as {
          player?: {
            attack: string;
            attackFacing: -1 | 1;
            ultMeter: number;
            invuln: number;
            stun: number;
            shielding: boolean;
            cooldowns: { ultimate: number };
            config: { id: string; ultimateName: string };
            sprite: { setPosition: (x: number, y: number) => void; body: { setVelocity: (x: number, y: number) => void } };
          };
          opponent?: {
            damage: number;
            invuln: number;
            stun: number;
            shielding: boolean;
            shield: number;
            sprite: { setPosition: (x: number, y: number) => void; body: { setVelocity: (x: number, y: number) => void } };
          };
          updateCombatant: (
            fighter: unknown,
            enemy: unknown,
            controls: {
              direction: number;
              facing: -1 | 1;
              jumpPressed: boolean;
              dashPressed: boolean;
              shieldHeld: boolean;
              attackPressed: "ultimate";
            }
          ) => void;
        };

        if (!scene.player || !scene.opponent) throw new Error("Battle combatants were not created.");

        scene.player.sprite.setPosition(560, 330);
        scene.opponent.sprite.setPosition(720, 330);
        scene.player.sprite.body.setVelocity(0, 0);
        scene.opponent.sprite.body.setVelocity(0, 0);
        scene.player.attack = "idle";
        scene.player.attackFacing = 1;
        scene.player.ultMeter = 100;
        scene.player.invuln = 0;
        scene.player.stun = 0;
        scene.player.shielding = false;
        scene.player.cooldowns.ultimate = 0;
        scene.opponent.invuln = 0;
        scene.opponent.stun = 0;
        scene.opponent.shielding = false;
        scene.opponent.shield = 100;

        scene.updateCombatant(scene.player, scene.opponent, {
          direction: 0,
          facing: 1,
          jumpPressed: false,
          dashPressed: false,
          shieldHeld: false,
          attackPressed: "ultimate"
        });

        await new Promise((resolve) => window.setTimeout(resolve, 90));

        return {
          attack: scene.player.attack,
          fighterId: scene.player.config.id,
          ultimateName: scene.player.config.ultimateName,
          ultMeter: scene.player.ultMeter,
          opponentDamage: scene.opponent.damage
        };
      },
      { fighterId, opponentFighter }
    );

    expect(result.fighterId).toBe(fighterId);
    expect(result.ultimateName.trim()).not.toBe("");
    expect(result.attack).toBe("ultimate");
    expect(result.ultMeter).toBe(0);
    expect(result.opponentDamage).toBeGreaterThanOrEqual(0);
  }

  expect(errors).toEqual([]);
});
