# Handoff Summary - Breakfast Addon Development

This document provides a clean handoff summary of the Breakfast Minecraft Bedrock Addon project at the end of the session ending on **June 6, 2026** (as of Version **1.1.0**).

---

## 1. Project Overview & Current State
* **Addon Name**: Breakfast
* **Target Version**: Minecraft Bedrock UWP client `1.26.x`
* **Script API Module**: `@minecraft/server` v`2.7.0` (stable)
* **Latest Pack Version**: `1.1.0`
* **Build File**: [Breakfast_1.1.0.mcaddon](file:///c:/Users/brett/Code/Antigravity/Breakfast/Breakfast_1.1.0.mcaddon)
* **Status**: **All core mechanics, visual renderings, item/block texture bindings, agricultural growth, dairy processing, and animal harvesting drops are fully operational, audited, and verified.** 

---

## 2. Key Directories & Core Files

### Behavior Pack (`Breakfast_BP`)
* [manifest.json](file:///c:/Users/brett/Code/Antigravity/Breakfast/Breakfast_BP/manifest.json) — Version `1.1.0` with stable `@minecraft/server` v`2.7.0` mappings.
* [blocks/](file:///c:/Users/brett/Code/Antigravity/Breakfast/Breakfast_BP/blocks) — Inline block components: `butcher_block.json`, `griddle.json`, `herb_pot.json`, and the 8 crop blocks.
* [items/](file:///c:/Users/brett/Code/Antigravity/Breakfast/Breakfast_BP/items) — Includes vegetables (onion, tomato, pepper, spinach), herbs, seeds, processed cuts, cheeses, seasoning, and knives.
* [recipes/](file:///c:/Users/brett/Code/Antigravity/Breakfast/Breakfast_BP/recipes) — Crafting table recipes for cheese wheel, spices, trellises, herb pots, and sausages.
* [loot_tables/](file:///c:/Users/brett/Code/Antigravity/Breakfast/Breakfast_BP/loot_tables) — Custom mob drops (beef flank, suet, chicken breast, mutton ribs, rabbit backstrap) only dropped when killed by knives. Tall grass drops crop/herb seeds with a 5% chance.

### Resource Pack (`Breakfast_RP`)
* [manifest.json](file:///c:/Users/brett/Code/Antigravity/Breakfast/Breakfast_RP/manifest.json) — Version `1.1.0` with matching dependencies.
* [textures/items/](file:///c:/Users/brett/Code/Antigravity/Breakfast/Breakfast_RP/textures/items) — Holds custom item 32x32 textures (quantized, transparent, and outline-free).
* [textures/blocks/](file:///c:/Users/brett/Code/Antigravity/Breakfast/Breakfast_RP/textures/blocks) — Custom 16x16 block textures for griddle, butcher block, trellis, herb pot, and crop stages.
* [textures/item_texture.json](file:///c:/Users/brett/Code/Antigravity/Breakfast/Breakfast_RP/textures/item_texture.json) — Maps item texture identifiers to PNG files.
* [textures/terrain_texture.json](file:///c:/Users/brett/Code/Antigravity/Breakfast/Breakfast_RP/textures/terrain_texture.json) — Maps block/crop textures to their PNG files.
* [models/blocks/](file:///c:/Users/brett/Code/Antigravity/Breakfast/Breakfast_RP/models/blocks) — Custom 3D geometries for the griddle, tomato trellis, and herb pot.

### Developer Tools (`Breakfast/tools/`)
* [generate_textures.py](file:///c:/Users/brett/Code/Antigravity/Breakfast/tools/generate_textures.py) — Downscaling, quantizing, and binary alpha processing for items.
* [audit_textures.py](file:///c:/Users/brett/Code/Antigravity/Breakfast/tools/audit_textures.py) — Audits item and texture coordinate matching.

---

## 3. Key Resolutions & Learnings (v1.0.23)
* **Custom Components V2 Inline Format**: Custom block components in Minecraft Bedrock UWP must be declared directly inside `"components"` (e.g. `"breakfast:herb_pot_component": {}`) rather than using the legacy `"minecraft:custom_components": [ ... ]` array wrapper.
* **Crop Permutations**: We implemented clean, performance-optimized crop growth stages (0-3) using the `"breakfast:growth_stage"` block state property and permutations inside block JSON files. This maps each stage to a separate texture (e.g. `onion_crop_0` to `onion_crop_3`).
* **Visual Helpers for Pot/Planters**: The `placed_item` entity acts as a visual child element on the `herb_pot` to display seeds (stages 0-1) and raw plants (stages 2-3) dynamically based on the block's current growth progress.
* **Alternative Mob Loot Conditions**: Using Bedrock's `"condition": "alternative"` term lists allows checking for multiple tools (e.g. flint, copper, iron, diamond knives) to trigger special drops while letting vanilla drops fall naturally.
* **Salt Evaporation & Milk Curdling**: Interacting with water/milk buckets immediately returns an empty bucket to the player's inventory while pouring the contents on the griddle to boil.
* **Quantized Retro Pixel-Art**: Quantization with Pillow's `MAXCOVERAGE` preserves distinct 16/24-color retro palettes, while enforcing binary alpha prevents edge neon rendering halos in-game.

---

## 4. Recommended Roadmap for Next Session
1. **3D Extrusion Modeling for Knives/Foods**:
   - Model placed foods and knives with thickness (e.g., 3D voxel look) rather than completely flat quads for added visual depth.
2. **Cheese Aging and Cutting Station**:
   - Introduce a multi-stage cheese wheel aging process (soft curd $\rightarrow$ wax coat $\rightarrow$ aged wheel) before slicing it on the butcher block.
3. **Pest Control / Fertilizer System**:
   - Expand farming with custom composters and crop pests that need shears or bone meal treatments to protect the herb garden.




