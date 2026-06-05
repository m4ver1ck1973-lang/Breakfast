# Handoff Summary - Breakfast Addon Development

This document provides a clean handoff summary of the Breakfast Minecraft Bedrock Addon project at the end of the session ending on **June 5, 2026** (as of Version **1.0.19**).

---

## 1. Project Overview & Current State
* **Addon Name**: Breakfast
* **Target Version**: Minecraft Bedrock UWP client `1.26.x`
* **Script API Module**: `@minecraft/server` v`2.7.0` (stable)
* **Latest Pack Version**: `1.0.19`
* **Build File**: [Breakfast_1.0.19.mcaddon](file:///c:/Users/brett/Code/2026/Antigravity/Breakfast/Breakfast_1.0.19.mcaddon)
* **Status**: **All core mechanics, visual renderings, hazard damage, and advancement tracking are fully operational.** Custom blocks are craftable, right-click interactions place/retrieve items, foods render flat on cooktops, cooktops emit smoke and crackling noises, and players can achieve custom in-game advancements.

---

## 2. Key Directories & Core Files

### Behavior Pack (`Breakfast_BP`)
* [manifest.json](file:///c:/Users/brett/Code/2026/Antigravity/Breakfast/Breakfast_BP/manifest.json) — Version `1.0.19` with fresh UUIDs and stable `@minecraft/server` v`2.7.0` mappings.
* [blocks/](file:///c:/Users/brett/Code/2026/Antigravity/Breakfast/Breakfast_BP/blocks) — Custom blocks:
  * `butcher_block.json` and `griddle.json` (format version `"1.21.0"`) mapping their custom components.
* [items/](file:///c:/Users/brett/Code/2026/Antigravity/Breakfast/Breakfast_BP/items) — Includes raw, processed, and cooked food items, plus the custom knife tool. Added `raw_sausage.json` in v1.0.19.
* [recipes/](file:///c:/Users/brett/Code/2026/Antigravity/Breakfast/Breakfast_BP/recipes) — Recipes for workstations, tools, and custom foods:
  * Modified `sausage_craft.json` to yield `breakfast:raw_sausage` instead of cooking it instantly.
  * Added `sausage_cook.json` for furnace/smoker/campfire cooking.
* [scripts/main.js](file:///c:/Users/brett/Code/2026/Antigravity/Breakfast/Breakfast_BP/scripts/main.js) — Main controller logic. Implements:
  * **Interactions**: Right-click placing/retrieving items, cutting on the Butcher Block with a Knife.
  * **Griddle Tick Mechanics**: Updates progress of 4 independent food slots, plays sizzling sound effects, emits campfire smoke particles, and applies fire damage (1 point per tick) to entities stepping or standing on top.
  * **Hunger Workaround**: Subscribes to `world.beforeEvents.itemUse` to block eating of custom items when full, overriding Bedrock bug MCPE-188410.
  * **Custom Advancements**: Tracks and displays achievements using player dynamic properties.
  * **Cleanup**: Cleans up visual helper entities and drops items when blocks are broken/exploded.

### Resource Pack (`Breakfast_RP`)
* [manifest.json](file:///c:/Users/brett/Code/2026/Antigravity/Breakfast/Breakfast_RP/manifest.json) — Version `1.0.19` with matching dependencies.
* [entity/placed_item.entity.json](file:///c:/Users/brett/Code/2026/Antigravity/Breakfast/Breakfast_RP/entity/placed_item.entity.json) — Helper entity linking placed items to dynamic textures.
* [models/blocks/griddle.geo.json](file:///c:/Users/brett/Code/2026/Antigravity/Breakfast/Breakfast_RP/models/blocks/griddle.geo.json) — Updated 3D geometry with a 4-pixel tall plate (origin coordinates shifted to Y=12) and detailed UV mappings.
* [textures/blocks/](file:///c:/Users/brett/Code/2026/Antigravity/Breakfast/Breakfast_RP/textures/blocks) — Custom pixel-art textures for butcher blocks and griddles.
* [textures/items/](file:///c:/Users/brett/Code/2026/Antigravity/Breakfast/Breakfast_RP/textures/items) — Holds custom item pixel art, including newly generated textures for raw/cooked meats and tools.

### Development Tools (`tools/`)
* [deploy_addon.ps1](file:///c:/Users/brett/Code/2026/Antigravity/Breakfast/tools/deploy_addon.ps1) — Purges older versions from standard game folders and copies pack folders directly to `development_behavior_packs` / `development_resource_packs` to support live reloading.
* [pack_addon.ps1](file:///c:/Users/brett/Code/2026/Antigravity/Breakfast/tools/pack_addon.ps1) — Zips directories into `.mcaddon` format using standard forward slashes.

---

## 3. Custom Advancements / Achievements System
Built custom script-driven advancements that announce globally, play toast sounds, and flash on-screen overlays:
1. **Rise and Shine**: Craft and place a Griddle block.
2. **Most Important Meal**: Obtain Berry Pancakes (tracked via inventory scans).
3. **Short Order Cook**: Cook all five ingredients (Bacon, Fried Egg, Toast, Hash Browns, Sausage) on the Griddle.
4. **Miner's Breakfast**: Eat a Miner's Skillet (clears Mining Fatigue and grants Haste).
5. **Nether Brunch**: Consume a Nether Fungi Omelet while in the Nether dimension.

---

## 4. Key Resolutions & Learnings (v1.0.15 - v1.0.19)
* **Hazard Implementation**: Adding damage triggers to the Griddle (stepping/standing) was mapped to script events (`onStepOn` / `onTick` damage scan). Placed item and dropped item entities are safely ignored during damage application.
* **Geometry Adjustments**: Griddle plate thickness was adjusted from 2px to 4px to match pixel proportions, lowering its legs from 14px to 12px. Detailed per-face UV maps were registered.
* **Hunger Restraints**: Since Bedrock bug MCPE-188410 causes custom items to ignore `can_always_eat: false`, a script-level verification cancels the use event if the hunger bar is at 20.
* **Texture Polish**: Placeholder flat-colored blocks were replaced with custom-designed texture maps.

---

## 5. Recommended Roadmap for Next Session

1. **Verify Live Gameplay Mechanics**:
   - Place a Griddle and check the advancement notification triggers.
   - Step on an active Griddle to verify the fire damage application (1 HP / tick) and ensure dropped items are not burned.
   - Consume a Miner's Skillet and Nether Fungi Omelet to verify effect removal/granting.
2. **Implement Future Asset Options**:
   - Integrate the untracked knife/pancake textures present in the Resource Pack (e.g. Copper Knife, Diamond Knife, Flint Knife, Iron Knife) into actual in-game items and recipes.
3. **Expand Meal Progression (v1.1)**:
   - Introduce drinks (Coffee, Tea) and other baked goods (Muffins, Bagels) as detailed in the original specification.

