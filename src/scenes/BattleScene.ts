import Phaser from "phaser";
import { getFighter } from "../data/fighters";
import { getStage } from "../data/stages";
import {
  applyShieldDamage,
  meleeRangeForAttack,
  rectsOverlap,
  resolveHit
} from "../systems/combat";
import {
  createKeyboardBindings,
  readKeyboardControls,
  type BattleControls,
  type KeyboardBindings
} from "../systems/controls";
import { chooseCpuControls } from "../systems/cpu";
import type { AnimationKey, AttackType, FighterConfig, FighterId, GameMode, RectLike, StageId } from "../types";

interface Combatant {
  config: FighterConfig;
  sprite: Phaser.Physics.Arcade.Sprite;
  rimSprite: Phaser.GameObjects.Sprite;
  shadow: Phaser.GameObjects.Ellipse;
  depthShadow: Phaser.GameObjects.Ellipse;
  label: Phaser.GameObjects.Text;
  playerNumber: 1 | 2;
  isCpu: boolean;
  facing: -1 | 1;
  damage: number;
  lives: number;
  shield: number;
  ultMeter: number;
  jumpsLeft: number;
  attack: AttackType | "idle";
  attackTimer: number;
  attackHit: boolean;
  invuln: number;
  stun: number;
  shielding: boolean;
  cooldowns: Record<AttackType | "dash", number>;
}

interface Projectile {
  owner: Combatant;
  body: Phaser.GameObjects.Arc;
  velocityX: number;
  damage: number;
  knockback: number;
  life: number;
  ultimate: boolean;
}

interface HudPanel {
  container: Phaser.GameObjects.Container;
  nameText: Phaser.GameObjects.Text;
  damageText: Phaser.GameObjects.Text;
  metaText: Phaser.GameObjects.Text;
  shieldFill: Phaser.GameObjects.Rectangle;
  ultFill: Phaser.GameObjects.Rectangle;
}

const ARENA = { x: 220, y: 522, w: 840, h: 28 };
const PLATFORMS = [
  { x: 280, y: 382, w: 180, h: 18 },
  { x: 820, y: 382, w: 180, h: 18 },
  { x: 550, y: 282, w: 180, h: 16 }
];

export class BattleScene extends Phaser.Scene {
  private mode: GameMode = "pvc";
  private stageId: StageId = "olympus";
  private platforms?: Phaser.Physics.Arcade.StaticGroup;
  private player?: Combatant;
  private opponent?: Combatant;
  private projectiles: Projectile[] = [];
  private p1Keys?: KeyboardBindings;
  private p2Keys?: KeyboardBindings;
  private pauseKey?: Phaser.Input.Keyboard.Key;
  private enterKey?: Phaser.Input.Keyboard.Key;
  private rematchKey?: Phaser.Input.Keyboard.Key;
  private winner?: Combatant;
  private paused = false;
  private gameOver = false;
  private hudPanels: HudPanel[] = [];
  private overlay?: Phaser.GameObjects.Container;

  constructor() {
    super("BattleScene");
  }

  create(): void {
    this.mode = (this.registry.get("mode") as GameMode | undefined) ?? "pvc";
    this.stageId = (this.registry.get("stage") as StageId | undefined) ?? "olympus";
    const playerFighter = (this.registry.get("playerFighter") as FighterId | undefined) ?? "zeus";
    const opponentFighter = (this.registry.get("opponentFighter") as FighterId | undefined) ?? "athena";

    this.physics.world.gravity.y = 1450;
    this.physics.resume();
    this.projectiles = [];
    this.winner = undefined;
    this.paused = false;
    this.gameOver = false;

    this.createInput();
    this.createArena();

    this.player = this.createCombatant(getFighter(playerFighter), 360, 330, 1, false);
    this.opponent = this.createCombatant(getFighter(opponentFighter), 920, 330, 2, this.mode !== "pvp");

    this.physics.add.collider(this.player.sprite, this.platforms!, () => this.onGrounded(this.player!));
    this.physics.add.collider(this.opponent.sprite, this.platforms!, () => this.onGrounded(this.opponent!));

    this.createHud();
    this.drawModeBanner();
  }

  update(): void {
    if (!this.player || !this.opponent || !this.p1Keys || !this.p2Keys) return;

    if (this.paused) {
      if (this.pauseKey && Phaser.Input.Keyboard.JustDown(this.pauseKey)) {
        this.togglePause();
      } else {
        this.handlePauseMenuInput();
      }
      return;
    }

    if (this.pauseKey && Phaser.Input.Keyboard.JustDown(this.pauseKey) && !this.gameOver) {
      this.togglePause();
      return;
    }

    if (this.gameOver) {
      this.handleGameOverInput();
      return;
    }

    this.updateCombatant(this.player, this.opponent, readKeyboardControls(this.p1Keys));

    if (this.opponent.isCpu) {
      this.updateCombatant(this.opponent, this.player, this.readCpuControls(this.opponent, this.player));
    } else {
      this.updateCombatant(this.opponent, this.player, readKeyboardControls(this.p2Keys));
    }

    this.updateProjectiles();
    this.updateHud();
  }

  private createInput(): void {
    const keyboard = this.input.keyboard;
    if (!keyboard) return;

    this.p1Keys = createKeyboardBindings(keyboard, 1);
    this.p2Keys = createKeyboardBindings(keyboard, 2);

    this.pauseKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P);
    this.enterKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    this.rematchKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
  }

  private createArena(): void {
    const stage = getStage(this.stageId);
    const { width, height } = this.scale;

    this.add.image(width / 2, height / 2, `stage-${stage.id}`).setDisplaySize(width, height).setDepth(-30);
    this.createStageAtmosphere(stage.accent);

    this.platforms = this.physics.add.staticGroup();
    this.addPlatform(ARENA.x, ARENA.y, ARENA.w, ARENA.h, stage.platform, true);
    PLATFORMS.forEach((platform) => {
      this.addPlatform(platform.x, platform.y, platform.w, platform.h, stage.platform, false);
    });
  }

  private createStageAtmosphere(accent: number): void {
    const { width, height } = this.scale;
    const beams = this.add.graphics().setDepth(-20);

    this.add.rectangle(width / 2, height / 2, width, height, 0x040712, 0.18).setDepth(-26);
    this.add.rectangle(width / 2, 84, width, 168, accent, 0.08).setDepth(-24).setBlendMode(Phaser.BlendModes.ADD);
    this.add.rectangle(width / 2, height - 52, width, 104, 0x02040a, 0.42).setDepth(-4);

    beams.fillStyle(accent, 0.09);
    beams.fillTriangle(110, 0, 245, 0, 390, height);
    beams.fillTriangle(width - 120, 0, width - 282, 0, width - 430, height);
    beams.fillStyle(0xffffff, 0.035);
    beams.fillTriangle(width / 2 - 75, 0, width / 2 + 75, 0, width / 2 + 10, height);

    const horizon = this.add.rectangle(width / 2, 454, width, 72, 0xffffff, 0.055).setDepth(-12);
    horizon.setBlendMode(Phaser.BlendModes.ADD);

    this.tweens.add({
      targets: horizon,
      alpha: { from: 0.035, to: 0.075 },
      duration: 2600,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut"
    });
  }

  private addPlatform(x: number, y: number, w: number, h: number, color: number, main: boolean): void {
    const centerX = x + w / 2;
    const centerY = y + h / 2;
    const shadow = this.add.rectangle(centerX, centerY + 13, w + 18, h + 18, 0x02040a, main ? 0.48 : 0.34);
    shadow.setDepth(2);

    const platform = this.add.rectangle(centerX, centerY, w, h, color, main ? 0.94 : 0.86);
    platform.setDepth(4);
    platform.setStrokeStyle(main ? 3 : 2, 0xf7efe1, main ? 0.86 : 0.5);

    const highlight = this.add.rectangle(centerX, y + 4, w - 10, 4, 0xffffff, main ? 0.36 : 0.22);
    highlight.setDepth(5);
    this.physics.add.existing(platform, true);
    this.platforms!.add(platform);
  }

  private createCombatant(
    config: FighterConfig,
    x: number,
    y: number,
    playerNumber: 1 | 2,
    isCpu: boolean
  ): Combatant {
    const shadow = this.add.ellipse(x, y + 66, 110, 24, 0x02040a, 0.54).setDepth(7);
    const depthShadow = this.add.ellipse(x - 5, y + 8, 78, 132, 0x02040a, 0.26).setDepth(8);
    const rimSprite = this.add.sprite(x + 5, y - 2, `${config.id}-idle-1`);
    rimSprite.setDisplaySize(128, 148);
    rimSprite.setDepth(9);
    rimSprite.setTint(config.accent);
    rimSprite.setAlpha(0.32);
    rimSprite.setBlendMode(Phaser.BlendModes.ADD);
    rimSprite.play(`${config.id}-idle`);

    const sprite = this.physics.add.sprite(x, y, `${config.id}-idle-1`);
    sprite.setDisplaySize(120, 140);
    sprite.setCollideWorldBounds(false);
    sprite.setMaxVelocity(620, 980);
    sprite.setDepth(10);
    this.applyAvatarRender(sprite, config, 1);
    sprite.play(`${config.id}-idle`);

    const body = sprite.body as Phaser.Physics.Arcade.Body;
    body.setSize(74, 112);
    body.setOffset(83, 88);

    const label = this.add
      .text(x, y - 95, `${config.name} ${isCpu ? "CPU" : playerNumber === 1 ? "P1" : "P2"}`, {
        fontFamily: "Arial, sans-serif",
        fontSize: "14px",
        color: "#f7efe1",
        backgroundColor: "rgba(8, 10, 18, 0.62)",
        padding: { x: 8, y: 4 }
      })
      .setDepth(22)
      .setOrigin(0.5);

    return {
      config,
      sprite,
      rimSprite,
      shadow,
      depthShadow,
      label,
      playerNumber,
      isCpu,
      facing: playerNumber === 1 ? 1 : -1,
      damage: 0,
      lives: 3,
      shield: 100,
      ultMeter: 0,
      jumpsLeft: 2,
      attack: "idle",
      attackTimer: 0,
      attackHit: false,
      invuln: 50,
      stun: 0,
      shielding: false,
      cooldowns: {
        quick: 0,
        heavy: 0,
        special: 0,
        ultimate: 0,
        dash: 0
      }
    };
  }

  private updateCombatant(fighter: Combatant, enemy: Combatant, controls: BattleControls): void {
    const body = fighter.sprite.body as Phaser.Physics.Arcade.Body;
    fighter.label.setPosition(fighter.sprite.x, fighter.sprite.y - 92);

    Object.keys(fighter.cooldowns).forEach((key) => {
      const cooldown = key as keyof Combatant["cooldowns"];
      fighter.cooldowns[cooldown] = Math.max(0, fighter.cooldowns[cooldown] - 1);
    });

    fighter.invuln = Math.max(0, fighter.invuln - 1);
    fighter.stun = Math.max(0, fighter.stun - 1);

    fighter.shielding = controls.shieldHeld && fighter.shield > 0 && fighter.stun === 0;

    if (fighter.shielding) {
      fighter.shield = Math.max(0, fighter.shield - 0.42);
      body.velocity.x *= 0.82;
    } else {
      fighter.shield = Math.min(100, fighter.shield + 0.18);
    }

    if (fighter.stun === 0 && !fighter.shielding) {
      const direction = controls.direction;
      fighter.facing = controls.facing ?? fighter.facing;

      if (direction !== 0) {
        fighter.facing = controls.facing ?? (direction > 0 ? 1 : -1);
        body.setVelocityX(Phaser.Math.Clamp(body.velocity.x + direction * fighter.config.speed * 0.08, -fighter.config.speed, fighter.config.speed));
      } else if (body.blocked.down) {
        body.setVelocityX(body.velocity.x * 0.82);
      }

      if (controls.jumpPressed && fighter.jumpsLeft > 0) {
        body.setVelocityY(-fighter.config.jump);
        fighter.jumpsLeft -= 1;
      }

      if (controls.dashPressed) {
        this.dash(fighter);
      }

      if (controls.attackPressed) this.startAttack(fighter, controls.attackPressed);
    }

    if (fighter.attack !== "idle") {
      fighter.attackTimer -= 1;
      this.handleMelee(fighter, enemy);

      if (fighter.attackTimer <= 0) {
        fighter.attack = "idle";
      }
    }

    this.updateAnimation(fighter);
    this.updateFighterVisuals(fighter);
    this.updateShieldVisual(fighter);
    this.checkRingOut(fighter);
  }

  private readCpuControls(fighter: Combatant, enemy: Combatant): BattleControls {
    const body = fighter.sprite.body as Phaser.Physics.Arcade.Body;
    return chooseCpuControls({
      selfX: fighter.sprite.x,
      selfY: fighter.sprite.y,
      enemyX: enemy.sprite.x,
      enemyY: enemy.sprite.y,
      onGround: body.blocked.down,
      arenaLeft: ARENA.x,
      arenaRight: ARENA.x + ARENA.w,
      shield: fighter.shield,
      ultMeter: fighter.ultMeter,
      enemyAttack: enemy.attack,
      cooldowns: fighter.cooldowns
    });
  }

  private startAttack(fighter: Combatant, attack: AttackType): void {
    if (fighter.cooldowns[attack] > 0 || fighter.attack !== "idle") return;

    if (attack === "ultimate" && fighter.ultMeter < 100) return;

    fighter.attack = attack;
    fighter.attackHit = false;
    fighter.attackTimer = attack === "quick" ? 12 : attack === "heavy" ? 22 : attack === "special" ? 20 : 38;
    fighter.cooldowns[attack] = attack === "quick" ? 18 : attack === "heavy" ? 38 : attack === "special" ? 58 : 230;

    const animation = attack === "ultimate" ? "ult" : attack;
    this.playFighterAnimation(fighter, animation);

    if (attack === "special" || attack === "ultimate") {
      this.spawnProjectile(fighter, attack === "ultimate");
    }

    if (attack === "ultimate") {
      fighter.ultMeter = 0;
      this.screenFlash(fighter.config.accent, 0.16);
      this.cameras.main.shake(160, 0.006);
    }
  }

  private handleMelee(attacker: Combatant, defender: Combatant): void {
    if (attacker.attackHit || attacker.attack === "idle" || attacker.attack === "special") return;

    const attack = attacker.attack === "ultimate" ? "ultimate" : attacker.attack;
    const range = meleeRangeForAttack(attack);
    const attackBox: RectLike = {
      x: attacker.facing === 1 ? attacker.sprite.x + 26 : attacker.sprite.x - range - 26,
      y: attacker.sprite.y - 58,
      w: range,
      h: 84
    };

    if (rectsOverlap(attackBox, this.boundsOf(defender))) {
      attacker.attackHit = true;
      const damage = attack === "quick" ? attacker.config.quick : attack === "heavy" ? attacker.config.heavy : attacker.config.ultimate;
      const knockback = attack === "quick" ? 0.98 : attack === "heavy" ? attacker.config.knockback : attacker.config.knockback * 1.42;
      this.applyHit(attacker, defender, damage, knockback);
    }
  }

  private applyHit(attacker: Combatant, defender: Combatant, damage: number, knockback: number): void {
    if (defender.invuln > 0) return;

    if (defender.shielding && defender.shield > 0) {
      defender.shield = applyShieldDamage(defender.shield, damage);
      this.burst(defender.sprite.x, defender.sprite.y - 20, 0x9fd7ff, 12);
      this.impactFlash(defender.sprite.x, defender.sprite.y - 24, 0x9fd7ff, false);

      if (defender.shield === 0) {
        defender.stun = 70;
        this.cameras.main.shake(140, 0.008);
      }

      return;
    }

    const result = resolveHit({
      currentDamage: defender.damage,
      attackDamage: damage,
      knockbackMultiplier: knockback,
      facing: attacker.facing
    });
    const defenderBody = defender.sprite.body as Phaser.Physics.Arcade.Body;

    defender.damage = result.damage;
    defenderBody.setVelocity(result.knockbackX, result.knockbackY);
    defender.invuln = damage >= 18 ? 16 : 10;
    defender.stun = damage >= 18 ? 12 : 4;
    attacker.ultMeter = Math.min(100, attacker.ultMeter + result.attackerMeter);
    defender.ultMeter = Math.min(100, defender.ultMeter + result.defenderMeter);

    this.burst(defender.sprite.x, defender.sprite.y - 28, attacker.config.accent, damage >= 18 ? 22 : 14);
    this.impactFlash(defender.sprite.x, defender.sprite.y - 30, attacker.config.accent, damage >= 18);
    this.cameras.main.shake(damage >= 18 ? 130 : 80, damage >= 18 ? 0.007 : 0.004);
  }

  private spawnProjectile(owner: Combatant, ultimate: boolean): void {
    const radius = ultimate ? 20 : owner.config.projectile === "spear" ? 9 : 13;
    const body = this.add.circle(owner.sprite.x + owner.facing * 72, owner.sprite.y - 36, radius, owner.config.accent, 0.96);
    body.setStrokeStyle(ultimate ? 3 : 1, 0xffffff, ultimate ? 0.92 : 0.35);
    body.setDepth(14);
    body.setBlendMode(Phaser.BlendModes.ADD);

    this.projectiles.push({
      owner,
      body,
      velocityX: owner.facing * (ultimate ? 620 : owner.config.projectile === "spear" ? 700 : 560),
      damage: ultimate ? owner.config.ultimate : owner.config.special,
      knockback: ultimate ? owner.config.knockback * 1.36 : owner.config.knockback,
      life: ultimate ? 94 : 74,
      ultimate
    });

    this.burst(owner.sprite.x + owner.facing * 58, owner.sprite.y - 38, owner.config.accent, ultimate ? 22 : 10);
  }

  private updateProjectiles(): void {
    const fighters = [this.player, this.opponent].filter(Boolean) as Combatant[];

    for (let i = this.projectiles.length - 1; i >= 0; i -= 1) {
      const projectile = this.projectiles[i];
      projectile.body.x += (projectile.velocityX * this.game.loop.delta) / 1000;
      projectile.life -= 1;
      projectile.body.setScale(1 + Math.sin(projectile.life * 0.32) * 0.08);

      if (projectile.life % 3 === 0) {
        this.projectileTrail(projectile);
      }

      const target = fighters.find((fighter) => fighter !== projectile.owner);
      if (target && rectsOverlap(this.projectileBounds(projectile), this.boundsOf(target))) {
        this.applyHit(projectile.owner, target, projectile.damage, projectile.knockback);
        projectile.body.destroy();
        this.projectiles.splice(i, 1);
        continue;
      }

      if (projectile.life <= 0 || projectile.body.x < -120 || projectile.body.x > this.scale.width + 120) {
        projectile.body.destroy();
        this.projectiles.splice(i, 1);
      }
    }
  }

  private dash(fighter: Combatant): void {
    if (fighter.cooldowns.dash > 0) return;

    const body = fighter.sprite.body as Phaser.Physics.Arcade.Body;
    body.setVelocityX(fighter.facing * 680);
    fighter.cooldowns.dash = 42;
    fighter.invuln = Math.max(fighter.invuln, 9);
    this.dashTrail(fighter);
    this.burst(fighter.sprite.x, fighter.sprite.y, fighter.config.accent, 8);
  }

  private updateAnimation(fighter: Combatant): void {
    const body = fighter.sprite.body as Phaser.Physics.Arcade.Body;
    const sprite = fighter.sprite;
    sprite.setFlipX(fighter.facing === -1);
    sprite.setAlpha(fighter.invuln > 0 && Math.floor(this.time.now / 70) % 2 === 0 ? 0.62 : 1);

    if (fighter.attack !== "idle") return;

    if (fighter.stun > 0) this.playFighterAnimation(fighter, "hurt");
    else if (!body.blocked.down) this.playFighterAnimation(fighter, "jump");
    else if (Math.abs(body.velocity.x) > 35) this.playFighterAnimation(fighter, "run");
    else this.playFighterAnimation(fighter, "idle");
  }

  private playFighterAnimation(fighter: Combatant, animation: AnimationKey): void {
    const key = `${fighter.config.id}-${animation}`;
    fighter.sprite.play(key, true);
    fighter.rimSprite.play(key, true);
  }

  private updateFighterVisuals(fighter: Combatant): void {
    const body = fighter.sprite.body as Phaser.Physics.Arcade.Body;
    const airborne = !body.blocked.down;
    const shadowScale = airborne ? 0.7 : 1;
    const rimOffset = fighter.facing === 1 ? 5 : -5;

    fighter.shadow.setPosition(fighter.sprite.x, fighter.sprite.y + 66);
    fighter.shadow.setScale(shadowScale, airborne ? 0.7 : 1);
    fighter.shadow.setAlpha(fighter.sprite.alpha * (airborne ? 0.28 : 0.48));
    fighter.depthShadow.setPosition(fighter.sprite.x - fighter.facing * 6, fighter.sprite.y + 8);
    fighter.depthShadow.setScale(airborne ? 0.82 : 1, airborne ? 0.88 : 1);
    fighter.depthShadow.setAlpha(fighter.sprite.alpha * (airborne ? 0.14 : 0.25));
    fighter.rimSprite.setPosition(fighter.sprite.x + rimOffset, fighter.sprite.y - 2);
    fighter.rimSprite.setFlipX(fighter.facing === -1);
    fighter.rimSprite.setAlpha(fighter.sprite.alpha * (fighter.ultMeter >= 100 ? 0.48 : 0.28));
    const rimPulse = 1 + Math.sin(this.time.now / 180) * (fighter.ultMeter >= 100 ? 0.025 : 0.01);
    fighter.rimSprite.setDisplaySize(128 * rimPulse, 148 * rimPulse);
    fighter.rimSprite.setTint(fighter.config.accent);
    fighter.label.setDepth(22);

    if (fighter.stun > 0) {
      fighter.sprite.setTint(0xffd2b8);
    } else if (fighter.attack !== "idle") {
      fighter.sprite.setTint(fighter.config.accent);
    } else {
      this.applyAvatarRender(fighter.sprite, fighter.config, fighter.playerNumber);
    }

    this.updateUltimateAura(fighter);
  }

  private applyAvatarRender(
    sprite: Phaser.GameObjects.Components.Tint,
    config: FighterConfig,
    playerNumber: 1 | 2
  ): void {
    const keyLight = playerNumber === 1 ? 0xfff3d6 : 0xe8f1ff;
    const rimLight = playerNumber === 1 ? config.color : config.accent;
    const coreShadow = 0x9a8f82;
    const contactShadow = 0x675f62;
    sprite.setTint(keyLight, rimLight, coreShadow, contactShadow);
  }

  private updateUltimateAura(fighter: Combatant): void {
    const existing = fighter.sprite.getData("ultAura") as Phaser.GameObjects.Arc | undefined;

    if (fighter.ultMeter >= 100) {
      const aura =
        existing ??
        this.add.circle(fighter.sprite.x, fighter.sprite.y - 10, 72).setStrokeStyle(3, fighter.config.accent, 0.58);
      aura.setPosition(fighter.sprite.x, fighter.sprite.y - 10);
      aura.setScale(1 + Math.sin(this.time.now / 130) * 0.05);
      aura.setDepth(8);
      aura.setVisible(true);
      aura.setBlendMode(Phaser.BlendModes.ADD);
      fighter.sprite.setData("ultAura", aura);
    } else if (existing) {
      existing.setVisible(false);
    }
  }

  private updateShieldVisual(fighter: Combatant): void {
    const existing = fighter.sprite.getData("shieldRing") as Phaser.GameObjects.Arc | undefined;

    if (fighter.shielding) {
      const ring =
        existing ??
        this.add.circle(fighter.sprite.x, fighter.sprite.y - 20, 56).setStrokeStyle(4, 0x9fd7ff, 0.82);
      ring.setPosition(fighter.sprite.x, fighter.sprite.y - 20);
      ring.setDepth(12);
      ring.setVisible(true);
      fighter.sprite.setData("shieldRing", ring);
    } else if (existing) {
      existing.setVisible(false);
    }
  }

  private onGrounded(fighter: Combatant): void {
    fighter.jumpsLeft = 2;
  }

  private checkRingOut(fighter: Combatant): void {
    if (fighter.sprite.y < -180 || fighter.sprite.y > 850 || fighter.sprite.x < -220 || fighter.sprite.x > 1500) {
      this.respawn(fighter);
    }
  }

  private respawn(fighter: Combatant): void {
    fighter.lives -= 1;

    if (fighter.lives <= 0) {
      this.finishMatch(fighter === this.player ? this.opponent! : this.player!);
      return;
    }

    const body = fighter.sprite.body as Phaser.Physics.Arcade.Body;
    fighter.sprite.setPosition(fighter.playerNumber === 1 ? 360 : 920, 320);
    body.setVelocity(0, 0);
    fighter.damage = 0;
    fighter.shield = 100;
    fighter.invuln = 90;
    fighter.stun = 0;
    fighter.attack = "idle";
    this.burst(fighter.sprite.x, fighter.sprite.y, 0xffffff, 28);
  }

  private finishMatch(winner: Combatant): void {
    this.winner = winner;
    this.gameOver = true;
    this.physics.pause();

    const { width, height } = this.scale;
    this.overlay = this.add.container(0, 0);
    this.overlay.add(this.add.rectangle(width / 2, height / 2, width, height, 0x050713, 0.72));
    this.overlay.add(
      this.add
        .text(width / 2, height / 2 - 56, `${winner.config.name} wins`, {
          fontFamily: "Georgia, serif",
          fontSize: "58px",
          color: "#f0d48a",
          stroke: "#101522",
          strokeThickness: 7
        })
        .setOrigin(0.5)
    );
    this.overlay.add(
      this.add
        .text(width / 2, height / 2 + 22, `R: rematch  |  Enter: ${this.storyWinContinues() ? "continue story" : "mode select"}`, {
          fontFamily: "Arial, sans-serif",
          fontSize: "22px",
          color: "#f7efe1"
        })
        .setOrigin(0.5)
    );
  }

  private handleGameOverInput(): void {
    if (this.rematchKey && Phaser.Input.Keyboard.JustDown(this.rematchKey)) {
      this.restartMatch();
    }

    if (this.enterKey && Phaser.Input.Keyboard.JustDown(this.enterKey)) {
      this.advanceAfterMatch();
    }
  }

  private handlePauseMenuInput(): void {
    if (this.rematchKey && Phaser.Input.Keyboard.JustDown(this.rematchKey)) {
      this.restartMatch();
    }

    if (this.enterKey && Phaser.Input.Keyboard.JustDown(this.enterKey)) {
      this.returnToModeSelect();
    }
  }

  private createHud(): void {
    this.hudPanels = [
      this.createHudPanel(18, 16),
      this.createHudPanel(this.scale.width - 342, 16)
    ];
    this.updateHud();
  }

  private updateHud(): void {
    if (!this.player || !this.opponent) return;

    [this.player, this.opponent].forEach((fighter, index) => {
      const panel = this.hudPanels[index];
      const label = fighter.isCpu ? "CPU" : fighter.playerNumber === 1 ? "P1" : "P2";
      const damage = Math.floor(fighter.damage);

      panel.nameText.setText(`${fighter.config.name} ${label}`);
      panel.nameText.setColor(fighter.config.portraitColor);
      panel.damageText.setText(`${damage}%`);
      panel.damageText.setColor(damage >= 100 ? "#ffb199" : damage >= 60 ? "#ffd28a" : "#f7efe1");
      panel.metaText.setText(`Lives ${fighter.lives}   Shield ${Math.floor(fighter.shield)}   Ult ${Math.floor(fighter.ultMeter)}%`);
      this.setHudBar(panel.shieldFill, fighter.shield / 100, 0x9fd7ff);
      this.setHudBar(panel.ultFill, fighter.ultMeter / 100, fighter.config.accent);
    });
  }

  private createHudPanel(x: number, y: number): HudPanel {
    const container = this.add.container(x, y);
    container.setDepth(80);

    const bg = this.add.rectangle(0, 0, 324, 112, 0x080a12, 0.78).setOrigin(0, 0);
    bg.setStrokeStyle(2, 0xf0d48a, 0.34);

    const glow = this.add.rectangle(0, 0, 324, 112, 0xf0d48a, 0.05).setOrigin(0, 0);
    const nameText = this.add.text(16, 13, "", {
      fontFamily: "Georgia, serif",
      fontSize: "20px",
      color: "#f7efe1"
    });
    const damageText = this.add.text(246, 12, "", {
      fontFamily: "Georgia, serif",
      fontSize: "32px",
      color: "#f7efe1"
    });
    const metaText = this.add.text(16, 50, "", {
      fontFamily: "Arial, sans-serif",
      fontSize: "14px",
      color: "#d7deef"
    });

    const shieldBack = this.add.rectangle(16, 78, 132, 8, 0x1b2133, 0.95).setOrigin(0, 0.5);
    const shieldFill = this.add.rectangle(16, 78, 132, 8, 0x9fd7ff, 0.95).setOrigin(0, 0.5);
    const ultBack = this.add.rectangle(174, 78, 132, 8, 0x1b2133, 0.95).setOrigin(0, 0.5);
    const ultFill = this.add.rectangle(174, 78, 132, 8, 0xf0d48a, 0.95).setOrigin(0, 0.5);

    const shieldLabel = this.add.text(16, 91, "SHIELD", {
      fontFamily: "Arial, sans-serif",
      fontSize: "10px",
      color: "#9fd7ff"
    });
    const ultLabel = this.add.text(174, 91, "ULTIMATE", {
      fontFamily: "Arial, sans-serif",
      fontSize: "10px",
      color: "#f0d48a"
    });

    container.add([bg, glow, nameText, damageText, metaText, shieldBack, shieldFill, ultBack, ultFill, shieldLabel, ultLabel]);

    return { container, nameText, damageText, metaText, shieldFill, ultFill };
  }

  private setHudBar(bar: Phaser.GameObjects.Rectangle, value: number, color: number): void {
    const width = 132 * Phaser.Math.Clamp(value, 0, 1);
    bar.setVisible(width > 0);
    bar.setFillStyle(color, 0.95);
    bar.setDisplaySize(Math.max(1, width), 8);
  }

  private drawModeBanner(): void {
    const label =
      this.mode === "story"
        ? ((this.registry.get("storyTrialTitle") as string | undefined) ?? "Story Trial")
        : this.mode === "pvp"
          ? "Local PvP"
          : "Player vs Computer";

    const text = this.add
      .text(this.scale.width / 2, 24, label, {
        fontFamily: "Georgia, serif",
        fontSize: "24px",
        color: "#f0d48a",
        backgroundColor: "rgba(8, 10, 18, 0.58)",
        padding: { x: 18, y: 8 }
      })
      .setOrigin(0.5, 0);

    this.tweens.add({
      targets: text,
      alpha: 0,
      delay: 1900,
      duration: 700,
      onComplete: () => text.destroy()
    });
  }

  private togglePause(): void {
    this.paused = !this.paused;

    if (this.paused) {
      this.physics.pause();
      const { width, height } = this.scale;
      this.overlay = this.add.container(0, 0);
      this.overlay.add(this.add.rectangle(width / 2, height / 2, width, height, 0x050713, 0.62));
      this.overlay.add(
        this.add
          .text(width / 2, height / 2, "PAUSED\nP: resume   R: rematch   Enter: mode select\nControls are on the main menu", {
            align: "center",
            fontFamily: "Georgia, serif",
            fontSize: "38px",
            color: "#f0d48a"
          })
          .setOrigin(0.5)
      );
    } else {
      this.physics.resume();
      this.overlay?.destroy();
      this.overlay = undefined;
    }
  }

  private restartMatch(): void {
    this.physics.resume();
    this.scene.restart();
  }

  private returnToModeSelect(): void {
    this.physics.resume();
    this.scene.start("ModeSelectScene");
  }

  private advanceAfterMatch(): void {
    this.physics.resume();

    if (this.storyWinContinues()) {
      this.scene.start("StoryScene", {
        phase: "win",
        trialIndex: (this.registry.get("storyTrialIndex") as number | undefined) ?? 0
      });
      return;
    }

    this.scene.start("ModeSelectScene");
  }

  private storyWinContinues(): boolean {
    return this.mode === "story" && this.winner === this.player;
  }

  private impactFlash(x: number, y: number, color: number, heavy: boolean): void {
    const slash = this.add.rectangle(x, y, heavy ? 118 : 74, heavy ? 9 : 6, color, 0.9);
    slash.setAngle(Phaser.Math.Between(-28, 28));
    slash.setDepth(30);
    slash.setBlendMode(Phaser.BlendModes.ADD);

    const ring = this.add.ellipse(x, y, heavy ? 112 : 72, heavy ? 52 : 34);
    ring.setStrokeStyle(heavy ? 4 : 3, 0xffffff, heavy ? 0.75 : 0.48);
    ring.setDepth(29);
    ring.setBlendMode(Phaser.BlendModes.ADD);

    this.tweens.add({
      targets: [slash, ring],
      alpha: 0,
      scaleX: heavy ? 1.65 : 1.35,
      scaleY: heavy ? 1.4 : 1.25,
      duration: heavy ? 210 : 150,
      ease: "Quad.easeOut",
      onComplete: () => {
        slash.destroy();
        ring.destroy();
      }
    });
  }

  private projectileTrail(projectile: Projectile): void {
    const trail = this.add.rectangle(
      projectile.body.x - Math.sign(projectile.velocityX) * 26,
      projectile.body.y,
      projectile.ultimate ? 72 : 44,
      projectile.ultimate ? 7 : 4,
      projectile.owner.config.accent,
      projectile.ultimate ? 0.38 : 0.28
    );
    trail.setAngle(projectile.velocityX > 0 ? 0 : 180);
    trail.setDepth(13);
    trail.setBlendMode(Phaser.BlendModes.ADD);

    this.tweens.add({
      targets: trail,
      alpha: 0,
      scaleX: 0.25,
      duration: 180,
      ease: "Sine.easeOut",
      onComplete: () => trail.destroy()
    });
  }

  private dashTrail(fighter: Combatant): void {
    const trail = this.add.rectangle(
      fighter.sprite.x - fighter.facing * 42,
      fighter.sprite.y - 6,
      92,
      42,
      fighter.config.accent,
      0.24
    );
    trail.setDepth(9);
    trail.setBlendMode(Phaser.BlendModes.ADD);

    this.tweens.add({
      targets: trail,
      alpha: 0,
      scaleX: 1.45,
      duration: 220,
      ease: "Quad.easeOut",
      onComplete: () => trail.destroy()
    });
  }

  private screenFlash(color: number, alpha: number): void {
    const { width, height } = this.scale;
    const flash = this.add.rectangle(width / 2, height / 2, width, height, color, alpha);
    flash.setDepth(90);
    flash.setBlendMode(Phaser.BlendModes.ADD);

    this.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 260,
      ease: "Quad.easeOut",
      onComplete: () => flash.destroy()
    });
  }

  private burst(x: number, y: number, color: number, count: number): void {
    for (let i = 0; i < count; i += 1) {
      const particle = this.add.circle(x, y, Phaser.Math.Between(2, 5), color, 0.85);
      particle.setDepth(28);
      particle.setBlendMode(Phaser.BlendModes.ADD);
      this.tweens.add({
        targets: particle,
        x: x + Phaser.Math.Between(-80, 80),
        y: y + Phaser.Math.Between(-90, 50),
        alpha: 0,
        scale: 0.35,
        duration: Phaser.Math.Between(260, 520),
        onComplete: () => particle.destroy()
      });
    }
  }

  private boundsOf(fighter: Combatant): RectLike {
    const bounds = fighter.sprite.getBounds();
    return { x: bounds.x + 18, y: bounds.y + 20, w: bounds.width - 36, h: bounds.height - 28 };
  }

  private projectileBounds(projectile: Projectile): RectLike {
    const radius = projectile.body.radius;
    return {
      x: projectile.body.x - radius,
      y: projectile.body.y - radius,
      w: radius * 2,
      h: radius * 2
    };
  }
}
