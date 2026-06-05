# Project Progress & Status Tracker

This file tracks the current state, next steps, and specific task checklist items for the Breakfast Minecraft Addon project.

---

## Current State & Next Steps

### Current State:
* **All code changes are complete** for the v1.0.19 release.
* Target engine version aligned to `1.26.0` (matching standard script module version 2.7.0 requirements) to solve the script loading issue in Minecraft client.
* Switched manifest headers from localized keys to explicit plain text names (`Breakfast BP v1.0.19` / `Breakfast RP v1.0.19`) to make the version easily recognizable in-game.
* Generated a square pixel-art `pack_icon.png` depicting a fried egg and the text "Breakfast", and copied it to the root of both packs as their thumbnail.
* Generated fresh UUIDs for all headers and modules to force Minecraft to register them as clean, brand-new packs and bypass any corrupted caching.
* Cleaned up legacy `Breakfast` folders from the local `development_` directories to avoid registration conflicts.
* Refactored custom block definitions (`butcher_block.json` and `griddle.json`) to use **inline (V2) custom components** during the transition, and then restored to stable array-based components under version `1.21.0` block schema mapping to avoid engine registry conflicts.
* Fixed item/recipe tags so custom blocks are fully craftable.
* Batch-updated 19 food item files with correct animation/modifiers and configured them so they cannot be eaten when the player's hunger bar is full (`can_always_eat: false`).
* Added `raw_sausage` intermediate item and modified sausage crafting recipe to require cooking/griddling raw sausage.
* Implemented Griddle physical burn hazards (players and mobs standing/stepping on an active griddle take 1 fire damage per tick).
* Polished Griddle 3D model geometry (4px plate, Y=12 plate origin, exact UV wraps) and updated blocks to use high-resolution textures.
* Implemented 5 custom in-game advancements/achievements (Rise and Shine, Most Important Meal, Short Order Cook, Miner's Breakfast, Nether Brunch) using player dynamic properties.
* Built a new version of the addon: `Breakfast_1.0.19.mcaddon`.
* Created a local deployment utility `deploy_addon.ps1` to bypass Minecraft's UWP zip caching by copying files directly to the local game folders.

### Next Steps:
1. **In-game Verification**: Since the deployment script has been run and files successfully copied, open Minecraft Bedrock, activate the v1.0.19 packs on a world, and verify:
   * Right-click interactions on the **Butcher Block**.
   * Right-click interactions on the **Griddle** (placing, cooking raw sausage, retrieving).
   * Physical griddle damage when stepping/standing on top.
   * Advancements system trigger behavior and screen overlays.
   * Eating behavior of custom foods (verifying eating animation, time-to-consume, and hunger bar conditions).
3. **Commit changes** to git repository once verification passes.

---

## Tasks Checklist

- [x] **Upgrade Target Versioning**
  - [x] Align `min_engine_version` to `[1, 26, 0]` in Behavior/Resource manifests
  - [x] Align `format_version` to `"1.21.0"` in custom block JSON files
- [x] **Fix Custom Block Script Components**
  - [x] Resolve namespace reference for player inventory (`minecraft:inventory`) in script handlers
  - [x] Restore blocks to standard array-based `minecraft:custom_components` format
- [x] **Fix Custom Block Recipes**
  - [x] Update recipe ingredient keys to use `"tag": "minecraft:planks"` instead of deprecated `"item"`
  - [x] Align recipe `format_version` to `"1.12.0"` for standard item compatibility
- [x] **Update Custom Food Items**
  - [x] Add `"minecraft:use_animation": "eat"` component to all food items
  - [x] Add `"minecraft:use_modifiers"` specifying consumption times (0.8s for eggs, 1.6s for others)
  - [x] Explicitly set `"can_always_eat": false` for all food items
- [x] **Develop Tools & Packaging**
  - [x] Write `pack_addon.py` / `pack_addon.ps1` supporting standard zip folder separators (`/`)
  - [x] Create direct dev folder copy script `deploy_addon.ps1` to handle live reload testing
- [x] **Implement Advanced Mechanics (v1.0.15 - v1.0.19)**
  - [x] Add raw sausage item, furnace recipe, and griddle cooking support
  - [x] Implement Griddle burn damage physical hazards (standing/stepping)
  - [x] Polish Griddle block 3D geometry layout and per-face UV maps
  - [x] Switch block placeholders to high-resolution texture maps
  - [x] Build custom in-game advancement system tracking 5 achievements
- [ ] **Verification & Validation**
  - [x] Deploy files locally using `deploy_addon.ps1`
  - [ ] Load Minecraft Bedrock and activate packs (verify version `1.0.19`)
  - [ ] Test Butcher Block placement and interaction in-game
  - [ ] Test Griddle placement and interaction in-game
  - [ ] Test physical griddle hazards (player and mob burn damage)
  - [ ] Verify advancements trigger (text chat broadcast, toast sound, screen subtitle)
  - [ ] Test consuming custom foods (eating animation, hunger restriction, and Miner's Skillet/Nether Fungi Omelet effects)

