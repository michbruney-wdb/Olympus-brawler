#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const publicAssets = path.join(root, "public", "assets");

const fighters = [
  "zeus",
  "athena",
  "ares",
  "poseidon",
  "artemis",
  "hades",
  "heracles",
  "achilles",
  "odysseus"
];

const runtimeAnimations = {
  idle: 2,
  run: 4,
  jump: 1,
  quick: 2,
  heavy: 2,
  special: 2,
  ult: 2,
  hurt: 1
};

const productionAnimations = ["idle", "run", "jump", "fall", "hurt", "ko", "quick", "heavy", "special", "ult"];
const productionUiAssets = ["portrait.png", "select_icon.png", "story_bust.png"];
const productionStages = [
  { id: "olympus", prototypeBackground: "olympus.png" },
  { id: "poseidon", prototypeBackground: "poseidon_temple.png" },
  { id: "underworld", prototypeBackground: "underworld.png" }
];
const productionStageAssets = ["background.png", "midground.png", "foreground.png", "platforms.png", "lighting.png", "thumbnail.png"];

const failures = [];
const warnings = [];

function exists(...segments) {
  return fs.existsSync(path.join(...segments));
}

function countFrames(folder, animation) {
  if (!fs.existsSync(folder)) return 0;
  const matcher = new RegExp(`^${animation}_\\d+\\.png$`);
  return fs.readdirSync(folder).filter((file) => matcher.test(file)).length;
}

for (const fighter of fighters) {
  const folder = path.join(publicAssets, "fighters", fighter);

  if (!fs.existsSync(folder)) {
    failures.push(`Missing fighter folder: ${fighter}`);
    continue;
  }

  for (const [animation, requiredCount] of Object.entries(runtimeAnimations)) {
    const frameCount = countFrames(folder, animation);
    if (frameCount < requiredCount) {
      failures.push(`${fighter}: ${animation} has ${frameCount}/${requiredCount} runtime frames`);
    }
  }

  for (const animation of productionAnimations) {
    const frameCount = countFrames(folder, animation);
    if (frameCount === 0) {
      warnings.push(`${fighter}: missing production animation "${animation}"`);
    }
  }

  for (const asset of productionUiAssets) {
    if (!exists(folder, asset)) {
      warnings.push(`${fighter}: missing production UI asset ${asset}`);
    }
  }
}

for (const stage of productionStages) {
  if (!exists(publicAssets, "backgrounds", stage.prototypeBackground)) {
    failures.push(`Missing prototype background: ${stage.prototypeBackground}`);
  }

  for (const asset of productionStageAssets) {
    if (!exists(publicAssets, "stages", stage.id, asset)) {
      warnings.push(`${stage.id}: missing production stage asset ${asset}`);
    }
  }
}

const atlasRoot = path.join(publicAssets, "atlases");
if (!fs.existsSync(atlasRoot)) {
  warnings.push("Missing atlas output folder: public/assets/atlases");
}

console.log("Olympus Brawler asset audit");
console.log(`Runtime failures: ${failures.length}`);
console.log(`Production warnings: ${warnings.length}`);

if (failures.length > 0) {
  console.log("\nRuntime failures");
  failures.forEach((item) => console.log(`- ${item}`));
}

if (warnings.length > 0) {
  console.log("\nProduction warnings");
  warnings.forEach((item) => console.log(`- ${item}`));
}

if (failures.length > 0) {
  process.exit(1);
}
