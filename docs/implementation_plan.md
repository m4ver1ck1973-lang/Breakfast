# Implementation Plan - Custom Block Interaction Fix

This plan details the debugging and fixing of custom block interaction (right-clicking to place items) on the Butcher Block and Griddle, as well as the creation of packaging tools and documentation.

## User Review Required

> [vanilla-friendly-art-style]
> Minecraft Bedrock Edition introduced stable custom block components in version `1.21.10`. Because the existing block JSON definitions target `format_version` `"1.21.0"` and the manifests target `min_engine_version` `[1, 21, 0]`, the `minecraft:custom_components` property is ignored by the game engine, preventing the script callbacks from triggering.
>
> We will upgrade the format and engine versions to `"1.26.20"` to ensure full support for stable custom block components.

## Proposed Changes

### Configuration Updates
Update the format versions and minimum engine versions to enable custom component parsing.

#### [MODIFY] [butcher_block.json](file:///c:/Users/brett/Code/2026/Antigravity/Breakfast/Breakfast_BP/blocks/butcher_block.json)
* Upgrade `format_version` from `"1.21.0"` to `"1.26.0"`.

#### [MODIFY] [griddle.json](file:///c:/Users/brett/Code/2026/Antigravity/Breakfast/Breakfast_BP/blocks/griddle.json)
* Upgrade `format_version` from `"1.21.0"` to `"1.26.0"`.

#### [MODIFY] [manifest.json](file:///c:/Users/brett/Code/2026/Antigravity/Breakfast/Breakfast_BP/manifest.json)
* Upgrade `min_engine_version` from `[1, 21, 0]` to `[1, 26, 20]`.

#### [MODIFY] [manifest.json](file:///c:/Users/brett/Code/2026/Antigravity/Breakfast/Breakfast_RP/manifest.json)
* Upgrade `min_engine_version` from `[1, 21, 0]` to `[1, 26, 20]`.

#### [MODIFY] [butcher_block_craft.json](file:///c:/Users/brett/Code/2026/Antigravity/Breakfast/Breakfast_BP/recipes/butcher_block_craft.json) and [griddle_craft.json](file:///c:/Users/brett/Code/2026/Antigravity/Breakfast/Breakfast_BP/recipes/griddle_craft.json)
* Change `"item": "minecraft:planks"` to `"tag": "minecraft:planks"` and raise `format_version` to `"1.21.0"` to support tag parsing.

#### [MODIFY] [butcher_block.json](file:///c:/Users/brett/Code/2026/Antigravity/Breakfast/Breakfast_BP/blocks/butcher_block.json) and [griddle.json](file:///c:/Users/brett/Code/2026/Antigravity/Breakfast/Breakfast_BP/blocks/griddle.json)
* Flatten custom components to V2 inline format.

#### [MODIFY] all items in [items/](file:///c:/Users/brett/Code/2026/Antigravity/Breakfast/Breakfast_BP/items) containing `"minecraft:food"`
* Add `"minecraft:use_animation": "eat"`, `"minecraft:use_modifiers"` components, and set `"can_always_eat": false` inside `"minecraft:food"`.

---

### Documentation and Tools

#### [NEW] [issues_resolutions.md](file:///c:/Users/brett/Code/2026/Antigravity/Breakfast/docs/issues_resolutions.md)
* Record the interaction bug analysis and how upgrading version properties resolved it.

#### [NEW] [pack_addon.py](file:///c:/Users/brett/Code/2026/Antigravity/Breakfast/tools/pack_addon.py)
* A Python script to compile and zip the `Breakfast_BP` and `Breakfast_RP` directories into a `.mcaddon` file for easy deployment/sharing.

## Verification Plan

### Automated / Scripted Checks
* Use a Python script to verify all JSON syntax after changes.
* Run the python packaging script to verify that a valid `.mcaddon` file is produced.

### Manual Verification
* The user can load the newly packaged `.mcaddon` into Minecraft Bedrock Edition and verify that right-clicking the Butcher Block or Griddle with valid items (like raw porkchop, egg, bread, etc.) successfully places them.

---

# Implementation Plan - 32x32 High-Resolution Texture Upgrade

This plan details the upgrade of all 30 custom item textures to a high-resolution 32x32 format, replacing simple pixel art lines with detailed, borderless vector art that downscales cohesively without outlines.

## User Review Required

> [vanilla-friendly-art-style]
> * Outlines on small 32x32 icons cause high-frequency visual noise when downscaled. We will switch to an outline-free flat vector style.
> * Downscaling high-res images to 32x32 creates semi-transparent border pixels. Minecraft Bedrock's rendering engine does not support semi-transparent pixels on items (causes neon glitches). We must enforce binary transparency in the post-processing script.

## Proposed Changes

### Scripting & Tooling

#### [NEW] [generate_textures.py](file:///c:/Users/brett/Code/Antigravity/Breakfast/tools/generate_textures.py)
A pipeline script that:
1. Backs up existing Resource Pack textures.
2. Generates outline-free flat vector images on a solid magenta background (`#FF00FF`) to prevent white-on-white keying conflicts.
3. Automatically detects the background color from the four corners of the image.
4. Key-outs background pixels, auto-crops boundaries, and square-pads the object with a 6% margin.
5. Downscales using Lanczos interpolation to `32x32` for maximum shape and color cohesiveness.
6. Enforces binary transparency (forcing alpha to `0` or `255`) to eliminate in-game rendering artifacts.
7. Saves standard and 24-color quantized versions to the staging directory.

#### [NEW] [audit_textures.py](file:///c:/Users/brett/Code/Antigravity/Breakfast/tools/audit_textures.py)
* Validation script that cross-checks all Behavior Pack items against Resource Pack registrations to ensure 100% path integrity and catch orphaned files.

#### [NEW] [increment_version.py](file:///c:/Users/brett/Code/Antigravity/Breakfast/tools/increment_version.py)
* Automated version bump script to synchronize pack version changes in manifests.

## Verification Plan

### Automated Checks
* Run `python tools/audit_textures.py` to confirm that all 30 items are correctly bound and mapped.
* Verify that output files in staging are strictly `[0, 255]` on the alpha channel.

### Manual Verification
* Run the packaging and deployment scripts, load Minecraft, and verify in-game that textures render cleanly on the Griddle and in player hand without glitches.
