# 3D-Rendered Avatar Production Plan

## Goal

Make player avatars look dimensional, realistic, and game-ready while keeping Olympus Brawler as a 2D platform fighter. The recommended approach is not real-time 3D characters yet; it is 3D-rendered sprites: model, rig, animate, render frames, then load those frames in Phaser.

This gives the game realistic volume and lighting without rebuilding combat around a full 3D engine.

## Production Workflow

1. Model or sculpt the fighter in Blender, ZBrush, Nomad Sculpt, or a similar 3D tool.
2. Retopologize and rig the character for clean animation.
3. Create gameplay animations from the same list in `ART_DIRECTION.md`.
4. Render orthographic frames from a consistent side-view fighting camera.
5. Paint over renders where needed for mythic style and stronger silhouettes.
6. Export transparent PNG frames or texture atlases into `public/assets/fighters/{fighter}/`.
7. Tune hitboxes, scale, and timing in Phaser.

## Camera Standard

- Projection: orthographic.
- View: side-view with a slight three-quarter rotation, enough to show chest/armor volume.
- Lighting: warm key light from upper front, cool rim light from back, soft ground shadow.
- Scale: final gameplay avatar should occupy roughly 120-160 px height in the current game, with higher-resolution source retained.
- Consistency: every fighter should share the same camera height, ground plane, and baseline.

## First Avatar Pass

Start with Zeus and Athena only.

### Zeus

- 3D model priority: face, hair/beard mass, torso armor/robe, cape/sash, lightning props.
- Must read as broad, royal, and heavy.
- Signature render test: idle, run, quick attack, special lightning throw.

### Athena

- 3D model priority: helmet, shield, spear, disciplined armor plates, cloak/cloth accents.
- Must read as tactical, controlled, and faster than Zeus.
- Signature render test: idle, run, shield hold, spear strike.

## Export Acceptance

A 3D-rendered avatar is acceptable when:

- It reads clearly at gameplay scale.
- It has believable volume without muddy details.
- Feet stay locked to a stable baseline.
- The pose language works before VFX are added.
- The silhouette is distinct from every other fighter.
- Animation timing feels good in the game, not just in the 3D tool.

## Tooling

- Blender: free 3D modeling, rigging, animation, and orthographic sprite rendering.
- Krita or Photoshop: paintover and cleanup.
- Aseprite: frame checking, timing, and export review.
- Texture atlas packer: production export once frame counts increase.

## Implementation Note

The current code now adds pseudo-3D lighting, rim glow, contact shadows, and HUD polish around the existing placeholder sprites. That is a temporary presentation layer. The true upgrade requires replacing the fighter PNG frames with 3D-rendered production frames.
