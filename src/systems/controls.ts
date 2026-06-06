import Phaser from "phaser";
import type { AttackType } from "../types";
import type { BattleControls } from "./controlState";
export type { BattleControls } from "./controlState";

export interface KeyboardBindings {
  left: Phaser.Input.Keyboard.Key;
  right: Phaser.Input.Keyboard.Key;
  jump: Phaser.Input.Keyboard.Key;
  quick: Phaser.Input.Keyboard.Key;
  heavy: Phaser.Input.Keyboard.Key;
  special: Phaser.Input.Keyboard.Key;
  ultimate: Phaser.Input.Keyboard.Key;
  shield: Phaser.Input.Keyboard.Key;
  dash: Phaser.Input.Keyboard.Key;
}

const P1_BINDINGS = {
  left: Phaser.Input.Keyboard.KeyCodes.A,
  right: Phaser.Input.Keyboard.KeyCodes.D,
  jump: Phaser.Input.Keyboard.KeyCodes.W,
  quick: Phaser.Input.Keyboard.KeyCodes.F,
  heavy: Phaser.Input.Keyboard.KeyCodes.G,
  special: Phaser.Input.Keyboard.KeyCodes.H,
  ultimate: Phaser.Input.Keyboard.KeyCodes.J,
  shield: Phaser.Input.Keyboard.KeyCodes.K,
  dash: Phaser.Input.Keyboard.KeyCodes.L
};

const P2_BINDINGS = {
  left: Phaser.Input.Keyboard.KeyCodes.LEFT,
  right: Phaser.Input.Keyboard.KeyCodes.RIGHT,
  jump: Phaser.Input.Keyboard.KeyCodes.UP,
  quick: Phaser.Input.Keyboard.KeyCodes.N,
  heavy: Phaser.Input.Keyboard.KeyCodes.M,
  special: Phaser.Input.Keyboard.KeyCodes.COMMA,
  ultimate: Phaser.Input.Keyboard.KeyCodes.PERIOD,
  shield: Phaser.Input.Keyboard.KeyCodes.FORWARD_SLASH,
  dash: Phaser.Input.Keyboard.KeyCodes.SHIFT
};

export function createKeyboardBindings(
  keyboard: Phaser.Input.Keyboard.KeyboardPlugin,
  playerNumber: 1 | 2
): KeyboardBindings {
  return keyboard.addKeys(playerNumber === 1 ? P1_BINDINGS : P2_BINDINGS) as KeyboardBindings;
}

export function readKeyboardControls(keys: KeyboardBindings): BattleControls {
  const rawDirection = Number(keys.right.isDown) - Number(keys.left.isDown);

  return {
    direction: rawDirection === 0 ? 0 : rawDirection > 0 ? 1 : -1,
    jumpPressed: Phaser.Input.Keyboard.JustDown(keys.jump),
    dashPressed: Phaser.Input.Keyboard.JustDown(keys.dash),
    shieldHeld: keys.shield.isDown,
    attackPressed: readAttack(keys)
  };
}

function readAttack(keys: KeyboardBindings): AttackType | undefined {
  if (Phaser.Input.Keyboard.JustDown(keys.quick)) return "quick";
  if (Phaser.Input.Keyboard.JustDown(keys.heavy)) return "heavy";
  if (Phaser.Input.Keyboard.JustDown(keys.special)) return "special";
  if (Phaser.Input.Keyboard.JustDown(keys.ultimate)) return "ultimate";
  return undefined;
}
