# Breakfast Addon - Release Notes v1.0.22

Welcome to the **v1.0.22** release of the *Breakfast* Minecraft Bedrock Addon! This version introduces high-quality 32x32 resolution item textures, resolves transparency-rendering artifacts in the Minecraft game engine, and adds powerful new audit and build automation tools to the developer environment.

## Key Updates & Visual Upgrades

### 1. High-Resolution 32x32 Texture Upgrade
* **Lanczos 32x32 Quantization:** We upgraded all 30 custom item textures to a detailed `32x32` resolution using high-quality Lanczos scaling.
* **Quantized Retro Palette:** Textures are color-quantized to a 24-color retro palette. This limits gradients and creates sharp, vintage color steps that blend seamlessly with standard Minecraft pixel-art styles.
* **Vector Art Aesthetics:** Replaced simple drawn outlines with clean, borderless flat-vector illustrations generated on a solid background, creating much more cohesive and detailed item designs.

### 2. Rendering Glitch Resolution (Binary Alpha)
* **Eliminated Halos and Artifacts:** Resolved a common Bedrock engine bug where semi-transparent border pixels (alpha between 1 and 254) created glitched, multicolored halos or dark outlines.
* **Strict Binary Transparency:** The texture compilation script now strictly enforces binary alpha. Every pixel in the item textures is now either fully visible (alpha `255`) or fully invisible (alpha `0`). This ensures perfect, glitch-free edge rendering under all game graphic and mipmapping settings.

---

## Developer Tooling & Automation

We added three new automation scripts to the `tools/` folder to streamline maintenance and updates:

### 1. Custom Texture Post-Processor (`generate_textures.py`)
A hybrid script that can batch-process base assets (downloaded from Gemini Web UI or generated via the Google GenAI API) using:
* Corner-based auto-detection of background colors (e.g. keying out `#FF00FF` magenta).
* Centering and square padding with a 6% boundary margin.
* Lanczos 32x32 scaling and adaptive quantization.
* Automated file backups of active textures before modification.

### 2. Dependency Audit Script (`audit_textures.py`)
A validation tool that cross-references all Behavior Pack item configurations with Resource Pack files to ensure 100% data integrity:
* Verifies that every Behavior Pack item has a valid `minecraft:icon`.
* Checks that every icon is registered in `item_texture.json`.
* Confirms that every texture path maps to an existing PNG file.
* Scans the textures folder to identify and list any orphaned/unused images.

### 3. Version Increment Tool (`increment_version.py`)
A script that updates the target version string across manifests simultaneously. It automatically modifies header names, module entries, and link dependencies, keeping the Behavior and Resource Packs synchronized.

---

## Deploy & Package Builds

* **Compiled Build:** `Breakfast_1.0.22.mcaddon` is compiled and available in the project root.
* **Local Development Synced:** Direct UWP deployment is synced to the standard Mojang directories (`development_behavior_packs` and `development_resource_packs`), allowing you to load the game and immediately test the new 32x32 quantized textures.
