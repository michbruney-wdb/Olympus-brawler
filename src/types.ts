export type FighterId =
  | "zeus"
  | "athena"
  | "ares"
  | "poseidon"
  | "artemis"
  | "hades"
  | "heracles"
  | "achilles"
  | "odysseus";

export type StageId = "olympus" | "underworld" | "poseidon";

export type GameMode = "story" | "pvc" | "pvp";

export type AnimationKey =
  | "idle"
  | "run"
  | "jump"
  | "quick"
  | "heavy"
  | "special"
  | "ult"
  | "hurt";

export type AttackType = "quick" | "heavy" | "special" | "ultimate";

export interface FighterConfig {
  id: FighterId;
  name: string;
  epithet: string;
  folder: string;
  color: number;
  accent: number;
  portraitColor: string;
  speed: number;
  jump: number;
  quick: number;
  heavy: number;
  special: number;
  ultimate: number;
  ultimateName: string;
  knockback: number;
  projectile: "bolt" | "spear" | "wave" | "arrow" | "shadow" | "rock" | "blade" | "trick";
  storyRole: string;
}

export interface StageConfig {
  id: StageId;
  name: string;
  background: string;
  accent: number;
  platform: number;
}

export interface RectLike {
  x: number;
  y: number;
  w: number;
  h: number;
}
