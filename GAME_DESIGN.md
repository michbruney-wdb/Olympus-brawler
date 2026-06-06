# Olympus Brawler Game Design

## Vision

Olympus Brawler is an original 2D platform fighter where Greek gods and heroes clash in dramatic mythic arenas. The target feel is fast, readable, and theatrical: large silhouettes, punchy knockback, painterly lighting, and abilities that communicate each fighter's mythic identity.

The visual direction should be inspired by the energy and polish of modern mythic action games, but every character, portrait, animation, UI element, and story beat must be original.

## North Star

Build an original Greek-myth platform fighter with painterly, high-drama art direction inspired by games like *Hades*, while staying legally distinct through original gods, heroes, arenas, UI, animation style, story, and combat feel.

## Core Modes

- Story Mode: A sequence of trials across Olympus, the Underworld, and Poseidon's Temple. Dialogue frames set stakes before battles, then victories unlock the next divine challenge.
- PvP: Local player-vs-player platform fighting on the same keyboard or with future gamepad support.
- PvC: Player-vs-computer matches against a lightweight AI opponent for practice and casual play.

## Vertical Slice Target

- Fighters: Zeus and Athena.
- Stage: Mount Olympus first, with Underworld and Poseidon's Temple selectable.
- Combat: double jump, dash, shield, quick attack, heavy attack, special projectile, ultimate attack, percent damage, lives, ring-out.
- Story beat: Zeus announces the Trial of Thunder and Athena enters as the first serious test.
- Technical baseline: Vite, TypeScript, Phaser, Vitest, and Playwright.

## Roster Direction

- Zeus: lightning zoning, mid-speed control, strong ultimate.
- Athena: shield/counter identity, fast recovery, tactical spear pressure.
- Ares: heavy pressure and armor.
- Poseidon: wave control and stage pressure.
- Artemis: ranged mobility.
- Hades: traps, shadow status, and boss-mode variants.
- Heracles: grappler/bruiser.
- Achilles: fast duelist.
- Odysseus: feints, tricks, and positional play.

## Art Pipeline

- Use current PNGs as temporary game-ready placeholders.
- Move toward high-resolution painterly sprites or layered skeletal animation.
- Store source art outside runtime folders; export clean PNG frames or texture atlases into `public/assets`.
- Prefer texture atlases once animations become large enough to affect loading or draw calls.

## Visual Bible Targets

- Painterly mythic style with bold silhouettes and dramatic lighting.
- Each fighter needs idle, run, jump, fall, hurt, KO, quick, heavy, special, and ultimate animation coverage.
- Each fighter needs a portrait, select icon, and story bust.
- Each stage needs parallax background layers, readable foreground platforms, a hazard or interaction idea, and a clear mood palette.

## Development Roadmap

- Phase 1: Foundation. Keep GitHub pushes working, maintain the Vite + TypeScript + Phaser structure, keep combat/input/AI/stage/UI/story systems split, and protect the project with Vitest plus Playwright smoke tests.
- Phase 2: Playable Core. Polish the Zeus vs Athena Mount Olympus slice across Story, PvC, and local PvP until movement, attacks, shield, dodge, knockback, ring-out, pause, rematch, and menus feel fun with plain numbers.
- Phase 3: Art Direction. Lock the visual bible before expanding expensive production art.
- Phase 4: Story Mode. Build a fight ladder with dialogue, unlocks, lightweight boons, save progress, and a first arc where a mortal champion enters Zeus's divine trial before Hades disrupts the tournament.
- Phase 5: Full Roster. Add fighters in waves only after core combat feels good.

## Definition Of Awesome

- A first-time player can launch the game, pick a mode, and understand how to fight without reading docs.
- Hits feel powerful: effects, shake, hit pause, knockback, and sound sell the action.
- Each fighter has a clear fantasy and a clear gameplay identity.
- Story mode gives context and momentum without blocking replayable fighting.
- The project remains easy to run, test, and extend.
