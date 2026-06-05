# Handoff Summary - Breakfast Addon Development

This document provides a clean handoff summary of the Breakfast Minecraft Bedrock Addon project at the end of the session ending on **June 5, 2026** (as of Version **1.0.21**).

---

## 1. Project Overview & Current State
* **Addon Name**: Breakfast
* **Target Version**: Minecraft Bedrock UWP client `1.26.x`
* **Script API Module**: `@minecraft/server` v`2.7.0` (stable)
* **Latest Pack Version**: `1.0.21`
* **Build File**: [Breakfast_1.0.21.mcaddon](file:///c:/Users/brett/Code/2026/Antigravity/Breakfast/Breakfast_1.0.21.mcaddon)
* **Status**: **All core mechanics, visual renderings, hazard damage, tool progression, and advancement tracking are fully operational.** Custom blocks are craftable, right-click interactions place/retrieve items, foods render flat on cooktops, cooktops emit smoke/crackle sounds, players can achieve advancements, knives are tiered, and bread slicing yields individual slice items that must be cooked on the griddle to make toast.

---

## 2. Key Directories & Core Files

### Behavior Pack (`Breakfast_BP`)
* [manifest.json](file:///c:/Users/brett/Code/2026/Antigravity/Breakfast/Breakfast_BP/manifest.json) — Version `1.0.21` with fresh UUIDs and stable `@minecraft/server` v`2.7.0` mappings.
* [blocks/](file:///c:/Users/brett/Code/2026/Antigravity/Breakfast/Breakfast_BP/blocks) — Custom blocks: `butcher_block.json` and `griddle.json` (format version `"1.21.0"`) mapping custom components.
* [items/](file:///c:/Users/brett/Code/2026/Antigravity/Breakfast/Breakfast_BP/items) — Includes raw, processed, and cooked food items, plus 4 tiered knives (Flint, Copper, Iron, Diamond). Added `bread_slice.json` in v1.0.21.
* [recipes/](file:///c:/Users/brett/Code/2026/Antigravity/Breakfast/Breakfast_BP/recipes) — Crafting and cooking recipes. Tiered knives use a 2x2 diagonal pattern, and Breakfast Sandwich requires toast.
* [scripts/main.js](file:///c:/Users/brett/Code/2026/Antigravity/Breakfast/Breakfast_BP/scripts/main.js) — Main controller logic:
  * **Interactions**: Placing/retrieving items, cutting on the Butcher Block with a Knife ( Flint fails 20%, Iron has mutual exclusivity rolls, Diamond has bonus count and bones/poisonous potato scraps).
  * **Griddle Tick Mechanics**: Sizzling, particles, and fire damage (1 HP / tick) to entities standing on top.
  * **Workstation Recipes**: Bread loaf cuts to 3 bread slices; bread slice cooks on griddle to toast.
  * **Hunger Workaround**: Enforces hunger bar constraints for custom food items.
  * **Custom Advancements**: Announcement/toast framework for in-game achievements.

### Resource Pack (`Breakfast_RP`)
* [manifest.json](file:///c:/Users/brett/Code/2026/Antigravity/Breakfast/Breakfast_RP/manifest.json) — Version `1.0.21` with matching dependencies.
* [entity/placed_item.entity.json](file:///c:/Users/brett/Code/2026/Antigravity/Breakfast/Breakfast_RP/entity/placed_item.entity.json) — Maps visual helper entities to dynamic textures (including bread slice variant Y=33).
* [models/blocks/griddle.geo.json](file:///c:/Users/brett/Code/2026/Antigravity/Breakfast/Breakfast_RP/models/blocks/griddle.geo.json) — Updated 3D geometry with 4-pixel tall plate and detailed UV maps.
* [textures/items/](file:///c:/Users/brett/Code/2026/Antigravity/Breakfast/Breakfast_RP/textures/items) — Holds custom item pixel art (including bread slice, tiered knives, and raw meats).

---

## 3. Custom Advancements / Achievements System
1. **Rise and Shine**: Craft and place a Griddle block.
2. **Most Important Meal**: Obtain Berry Pancakes.
3. **Short Order Cook**: Cook all five ingredients (Bacon, Fried Egg, Toast, Hash Browns, Sausage) on the Griddle.
4. **Miner's Breakfast**: Eat a Miner's Skillet (clears Mining Fatigue and grants Haste).
5. **Nether Brunch**: Consume a Nether Fungi Omelet while inside the Nether.

---

## 4. Key Resolutions & Learnings (v1.0.15 - v1.0.21)
* **Tiered Knives & Diagonal Recipes**: Implemented Flint, Copper, Iron, and Diamond knives with distinct durabilities and diagonal 2x2 recipes enabling personal inventory grid crafting.
* **Knife Effectiveness**: Programmed Flint to fail 20% of the time, Iron to trigger either double slices or guaranteed byproducts, and Diamond to always double slice, guarantee byproducts, and yield bones/poisonous potato scraps.
* **Bread Slicing Progression**: Shifted `minecraft:bread` from cooking directly on the griddle to processing into 3 `breakfast:bread_slice` items on the Butcher Block. Slices are then cooked on the griddle into Toast.

---

## 5. Recommended Roadmap for Next Session

1. **Verify Bread Slice & Knife Effectiveness Mechanics**:
   - Verify bread slices drop from loaves and render properly when placed to cook on the griddle.
   - Verify Flint/Iron/Diamond knife slice mechanics and outputs.
2. **Implement Remaining espec texture assets**:
   - Integrate other untracked textures inside `Breakfast_RP/textures/items/` (e.g., `glowberry_pancakes.png`, `pancakes.png`, raw/cooked bacons, and biscuits) into items and recipes.


