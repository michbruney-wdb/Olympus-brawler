# Olympus Brawler Asset Pipeline

## Principle

Production art should be authored as source files, exported into runtime assets, audited, then packed into atlases when animation counts grow. Runtime assets live under `public/assets`; source files should stay outside that folder.

This plan intentionally does not depend on AI-generated concept art. Use original hand-painted work, commissioned art, or internally authored placeholder-to-production passes.

## Folder Layout

```text
art-source/
  characters/
    zeus/
      character_sheet.psd
      animation_source.aseprite
      notes.md
  stages/
    olympus/
      background_source.psd
      platform_source.psd
      notes.md

public/assets/
  fighters/
    zeus/
      idle_1.png
      run_1.png
      ...
  backgrounds/
    olympus.png
  atlases/
    fighters/
    stages/
```

`art-source/` is the working-art area. `public/assets/` is the game runtime area.

## Fighter Export Naming

Loose frame naming:

```text
public/assets/fighters/{fighter}/{animation}_{frame}.png
```

Examples:

```text
public/assets/fighters/zeus/idle_1.png
public/assets/fighters/zeus/quick_7.png
public/assets/fighters/athena/ult_18.png
```

Required production animations:

- `idle`
- `run`
- `jump`
- `fall`
- `hurt`
- `ko`
- `quick`
- `heavy`
- `special`
- `ult`

## Stage Export Naming

Production stage exports:

```text
public/assets/stages/{stage}/background.png
public/assets/stages/{stage}/midground.png
public/assets/stages/{stage}/foreground.png
public/assets/stages/{stage}/platforms.png
public/assets/stages/{stage}/lighting.png
public/assets/stages/{stage}/thumbnail.png
```

The current prototype still uses:

```text
public/assets/backgrounds/{stage}.png
```

Move to the stage folder format when the first production arena is ready.

## Texture Atlas Plan

Loose PNGs are fine for the prototype. Production should move fighter frames into atlases:

```text
public/assets/atlases/fighters/zeus.png
public/assets/atlases/fighters/zeus.json
```

Atlas JSON should include stable frame keys matching the existing animation names:

```text
zeus/idle_1
zeus/run_1
zeus/quick_1
```

Switch to atlases when either condition is true:

- A fighter has more than 40 runtime PNG frames.
- Stage/fighter loading becomes visibly slow.

## Export Settings

- Transparent PNG for fighters and VFX.
- Full-frame exports should keep a consistent canvas size per fighter.
- Keep feet aligned to a stable baseline.
- Avoid baked shadows in fighter frames; game shadows are rendered separately.
- Use premultiplied-alpha-safe edges where possible.
- Export stages at 1280x720 minimum, with larger source files preserved.

## Acceptance Checklist

A production fighter is ready when:

- Every required animation exists.
- The fighter reads in silhouette at gameplay scale.
- All attacks have clear anticipation, active, and recovery frames.
- Hitboxes can be tuned without fighting the art.
- The portrait, select icon, and dialogue bust match the gameplay design.
- Exports pass `npm run asset:audit`.

A production stage is ready when:

- The arena has background, midground, foreground, platform, lighting, and thumbnail assets.
- Platforms align with gameplay collision.
- Fighters remain readable against the background.
- The stage has a distinct mood from the other arenas.
- The stage has a hazard or interactive idea documented.

## Current Placeholder Gap

The current game has complete prototype frame folders for nine fighters and three background plates. It does not yet have production-grade:

- `fall` and `ko` fighter animations.
- Fighter portraits, select icons, and story busts.
- Stage parallax layers and platform-specific art.
- Texture atlases.
- Authored VFX sheets.

Those gaps are expected at this stage. The point of the pipeline is to make each gap visible and replace it deliberately.
