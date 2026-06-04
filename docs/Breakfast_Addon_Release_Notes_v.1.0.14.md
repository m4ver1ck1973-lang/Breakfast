# Breakfast Addon - Release Notes v1.0.14

Welcome to the **v1.0.14** release of the *Breakfast* Minecraft Bedrock Addon! This version resolves critical block interaction, recipe crafting, and visual rendering bugs, providing a premium, fully-functional survival cooking experience.

## New Features & Visual Polish

### 1. Visual Item Rendering on Workstations
* **Workstation Displays**: Items placed on the Butcher Block (1 item) and Griddle (up to 4 items in a 2x2 grid) are now visually rendered flat on the workstations' surfaces.
* **Helper Entity (`breakfast:placed_item`)**: Spawns an invisible helper entity mapping item textures dynamically on the client side using synced entity properties and custom render controllers.
* **Overlapping Fix**: The model uses a zero-thickness flat plane (`geometry.placed_item`) mapping only the `"up"` face to prevent mirroring and double-layered texture overlap.
* **Full Textures**: Implemented per-face UV mapping to ensure the full 16x16 item texture renders perfectly at correct scale without truncation.

### 2. Cooking Particles & Auditory Feedback
* **Steam/Smoke Particles**: Spawns `minecraft:basic_smoke_particle` steam effects directly under active cooking slots during Griddle ticks.
* **Consistent Crackling**: Campfire crackling sounds are played more consistently (60% chance per second per cooking slot) to provide realistic cooking feedback.

### 3. Smart Workstation Retrieval
* **Empty Hand**: Retrieves any item (cooked or raw) from the workstation.
* **Cooked Food Retrieval**: Players can now right-click the Griddle with *any* item in hand (tools, blocks, weapons) to retrieve **cooked** items.
* **Raw Food Protection**: Right-clicking with non-cookable items will *not* retrieve raw/cooking items, protecting them from accidental removal and outputting a warning action-bar message.

### 4. Workstation Destruction Drops & Cleanup
* **Content Dropping**: Breaking a Griddle or Butcher Block (via mining or explosion) now safely drops all stored contents on the ground.
* **Entity Cleanup**: Automatically despawns the helper visual entities upon block destruction, preventing "ghost items" from floating in the air.

### 5. Addon Branding
* **Pack Icon**: Integrated a custom pixel-art `pack_icon.png` depicting a fried egg and "Breakfast" text as the official pack thumbnail.

---

## Technical & Compatibility Fixes

* **Survival Recipes**: Reverted Butcher Block and Griddle recipes to format version `1.12.0` using `minecraft:oak_planks` explicitly, fully restoring survival crafting table support.
* **API Stabilization**: Aligned manifests to `@minecraft/server` API **`2.7.0`** and `min_engine_version` **`[1, 26, 0]`** to resolve silent script initialization crashes in client version `1.26.x`.
* **Block Definition Format**: Aligned block JSON files to `format_version` `"1.21.0"` utilizing modern array-based `"minecraft:custom_components"` to restore script component connectivity.
* **UUID Refresh**: Manifest UUIDs were regenerated to enforce clean registration in the Minecraft UWP cache and bypass duplicate import errors.
* **Automated Conflict Cleanup**: Upgraded `deploy_addon.ps1` to automatically scan standard folders and purge older/conflicting versions of the "Breakfast" packs from the game directories.
