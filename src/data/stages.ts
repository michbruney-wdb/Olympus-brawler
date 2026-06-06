import type { StageConfig, StageId } from "../types";

export const STAGES: Record<StageId, StageConfig> = {
  olympus: {
    id: "olympus",
    name: "Mount Olympus",
    background: "/assets/backgrounds/olympus.png",
    accent: 0xf0d48a,
    platform: 0xe4c27a
  },
  underworld: {
    id: "underworld",
    name: "The Underworld",
    background: "/assets/backgrounds/underworld.png",
    accent: 0xc866ff,
    platform: 0x9063af
  },
  poseidon: {
    id: "poseidon",
    name: "Poseidon's Temple",
    background: "/assets/backgrounds/poseidon_temple.png",
    accent: 0xd5ffff,
    platform: 0x82dbeb
  }
};

export const STAGE_IDS = Object.keys(STAGES) as StageId[];

export function getStage(id: StageId): StageConfig {
  return STAGES[id];
}
