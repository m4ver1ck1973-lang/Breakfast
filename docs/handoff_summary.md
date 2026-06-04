# Handoff Summary - Breakfast Addon Development

This document provides a clean handoff summary of the Breakfast Minecraft Bedrock Addon project at the end of the session on **June 4, 2026**.

---

## 1. Project Overview & Current State
* **Addon Name**: Breakfast
* **Target Version**: Minecraft Bedrock UWP client `1.26.x`
* **Script API Module**: `@minecraft/server` v`2.7.0` (stable)
* **Latest Pack Version**: `1.0.14`
* **Build File**: [Breakfast_1.0.14.mcaddon](file:///c:/Users/brett/Code/2026/Antigravity/Breakfast/Breakfast_1.0.14.mcaddon)
* **Status**: **All core mechanics are fully operational.** Custom blocks are craftable, right-click interactions place items, foods render flat on cooktops, smoke particles emit, sizzling sounds play, and smart retrieval of cooked items works cleanly.

---

## 2. Key Directories & Core Files

### Behavior Pack (`Breakfast_BP`)
* [manifest.json](file:///c:/Users/brett/Code/2026/Antigravity/Breakfast/Breakfast_BP/manifest.json) — Version `1.0.14` with fresh UUIDs and stable `@minecraft/server` module mappings.
* [blocks/](file:///c:/Users/brett/Code/2026/Antigravity/Breakfast/Breakfast_BP/blocks) — Contains `butcher_block.json` and `griddle.json` mapping their custom components.
* [entities/placed_item.json](file:///c:/Users/brett/Code/2026/Antigravity/Breakfast/Breakfast_BP/entities/placed_item.json) — Server-side custom helper entity with gravity/collision disabled and the synced property `breakfast:item_variant`.
* [recipes/](file:///c:/Users/brett/Code/2026/Antigravity/Breakfast/Breakfast_BP/recipes) — Recipes for workstations, tools, and custom foods (using tag matching and format `1.12.0` for oak planks crafting table compatibility).
* [scripts/main.js](file:///c:/Users/brett/Code/2026/Antigravity/Breakfast/Breakfast_BP/scripts/main.js) — Main logic controller. Handles:
  * Interaction (right-click placing and retrieving items, cutting with knife).
  * Workstation entity syncing (spawning/despawning helper entities, variant property updates).
  * Tick-based campfire sounds and rising steam/smoke particles.
  * Block break drop logic and visual entity removal.

### Resource Pack (`Breakfast_RP`)
* [manifest.json](file:///c:/Users/brett/Code/2026/Antigravity/Breakfast/Breakfast_RP/manifest.json) — Version `1.0.14` with matching dependencies.
* [entity/placed_item.entity.json](file:///c:/Users/brett/Code/2026/Antigravity/Breakfast/Breakfast_RP/entity/placed_item.entity.json) — Client-side definition linking the helper entity to the alpha-tested material and 31 food item textures.
* [models/entity/placed_item.geo.json](file:///c:/Users/brett/Code/2026/Antigravity/Breakfast/Breakfast_RP/models/entity/placed_item.geo.json) — Zero-thickness flat plane geometry mapping only the `"up"` face.
* [render_controllers/placed_item.render_controllers.json](file:///c:/Users/brett/Code/2026/Antigravity/Breakfast/Breakfast_RP/render_controllers/placed_item.render_controllers.json) — MoLang controller mapping `query.property('breakfast:item_variant')` to select textures dynamically.
* [textures/items/](file:///c:/Users/brett/Code/2026/Antigravity/Breakfast/Breakfast_RP/textures/items) — Holds custom pixel-art texture files for all new foods and tools.

### Development Tools (`tools/`)
* [deploy_addon.ps1](file:///c:/Users/brett/Code/2026/Antigravity/Breakfast/tools/deploy_addon.ps1) — PowerShell script to automatically delete conflicting imported standard packs from Minecraft's directory and copy development folders to `development_behavior_packs`/`development_resource_packs`.
* [pack_addon.ps1](file:///c:/Users/brett/Code/2026/Antigravity/Breakfast/tools/pack_addon.ps1) — PowerShell script to zip directories into `.mcaddon` format.

---

## 3. Recommended Roadmap for Next Session

1. **Verify All Food Consumptions**:
   * Test eating custom food items in survival mode: verify eating speed (e.g., egg eating speed reduced by 50%), hunger recovery, and saturation metrics.
   * Verify Miner's Skillet removes Mining Fatigue and grants Haste.
   * Verify Nether Fungi Omelet grants Fire Resistance and short Nausea.
2. **Expansion to v1.1 Recipes**:
   * Code custom crafting or griddle processes for remaining meals in the design specification (e.g. Omelet variants, Toast with Jam, Pancakes, Gravy Biscuits).
3. **Advancement Integrations**:
   * Implement achievements from the spec text (e.g. "Short Order Cook" for cooking every ingredient, "Rise and Shine" for crafting a Griddle).
