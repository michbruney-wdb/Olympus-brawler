import type { AnimationKey, FighterConfig, FighterId } from "../types";

export const ANIMATION_FRAME_COUNTS: Record<AnimationKey, number> = {
  idle: 2,
  run: 4,
  jump: 1,
  quick: 2,
  heavy: 2,
  special: 2,
  ult: 2,
  hurt: 1
};

export const FIGHTERS: Record<FighterId, FighterConfig> = {
  zeus: {
    id: "zeus",
    name: "Zeus",
    epithet: "Storm King",
    folder: "zeus",
    color: 0xf7edb7,
    accent: 0xfff15b,
    portraitColor: "#f7edb7",
    speed: 330,
    jump: 650,
    quick: 10,
    heavy: 18,
    special: 14,
    ultimate: 34,
    knockback: 1.12,
    projectile: "bolt",
    storyRole: "Host of the divine tournament and master of thunder."
  },
  athena: {
    id: "athena",
    name: "Athena",
    epithet: "Shield of Wisdom",
    folder: "athena",
    color: 0xd7deef,
    accent: 0x6d86c6,
    portraitColor: "#d7deef",
    speed: 345,
    jump: 635,
    quick: 10,
    heavy: 16,
    special: 12,
    ultimate: 33,
    knockback: 1.04,
    projectile: "spear",
    storyRole: "The first strategic trial, testing discipline over raw power."
  }
};

export const FIGHTER_IDS = Object.keys(FIGHTERS) as FighterId[];

export function getFighter(id: FighterId): FighterConfig {
  return FIGHTERS[id];
}
