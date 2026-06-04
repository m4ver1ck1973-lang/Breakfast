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
