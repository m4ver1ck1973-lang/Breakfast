# Texture Generation Pipeline and Standing Rules

This document outlines the workflow and standing rules for producing and modifying item textures in the Breakfast Addon project.

---

## The Standing Rule

> [!IMPORTANT]
> **All item textures must be generated via Gemini Web UI (or Google GenAI API when quotas allow) and processed using the project's post-processing script.**
> 
> * Do **not** use the previous Python image generation toolchain (procedural or API generation) for release textures. It is strictly reserved for generating temporary placeholders for new implementations.
> * Existing resource pack textures are protected by default and cannot be overwritten by the Python generator scripts unless using the `--force-placeholder` override flag.
> * All item textures must use **32x32 pixel resolution** (downscaled from high-resolution generations).
> * All textures must have **binary transparency** (fully opaque `255` or fully transparent `0` on the alpha channel) to avoid magenta/neon rendering halos in Minecraft Bedrock.

---

## The Image Generation Workflow

### 1. Generating Raw Assets
Generate new item textures using the Gemini Web Interface. 

**Recommended Prompt Template:**
```text
A clean, minimalist flat vector icon of [SUBJECT], detailed textures, soft shading, no outlines, no borders, isolated on a solid bright magenta background (#FF00FF)
```
*Using a solid magenta background (`#FF00FF`) ensures the background color keyer can easily isolate and remove the background without causing color bleed or conflicts with white textures (like lard or salt).*

### 2. Saving to Staging
Download the generated raw image and save it directly to the root of the raw staging folder:
```
Breakfast/staging/textures/items/raw/
```
Ensure the filename matches the texture ID registered in `item_texture.json` (e.g. `bacon_raw.png`, `onion.png`, `knife_iron.png`).

### 3. Running Post-Processing
Run the post-processing script from the project root directory:
```bash
python tools/generate_textures.py --post-process-only
```
If you only want to test/process a single item (e.g., `bacon_raw`), run:
```bash
python tools/generate_textures.py --post-process-only --test bacon_raw
```

---

## What the Script Does Automatically

When you run `--post-process-only`, the script automatically performs the following tasks for each raw image:

1. **Background Removal**: Auto-detects the background color from the four corners of the raw image and chroma keys it out (within a threshold distance of 45).
2. **Auto-Cropping & Centering**: Crops out empty transparent boundaries, then squares and centers the item with a 6% boundary margin.
3. **Lanczos Downscaling**: Downscales the high-resolution crop to exactly `32x32` pixels using Lanczos interpolation to preserve shape and details.
4. **Binary Transparency Enforcement**: Forces the alpha channel to binary values (alpha < 128 becomes `0` transparent, alpha >= 128 becomes `255` opaque). This fixes a known Minecraft Bedrock item shader glitch where semi-transparent pixels create neon rendering halos.
5. **Color Quantization**: Downsamples colors to a 24-color retro palette (using `MAXCOVERAGE`), providing a unified vintage RPG aesthetic.
6. **Automatic Resource Pack Deployment**: Copies the finalized quantized `32x32` texture directly into:
   ```
   Breakfast_RP/textures/items/
   ```
7. **Clean Staging (Archiving)**: Moves the raw source file from the root of `staging/textures/items/raw/` into a timestamped subdirectory under:
   ```
   staging/textures/items/raw/processed/YYYY-MM-DD_HH-MM-SS/
   ```
   This keeps the root of the raw folder clean, containing only new files that still need to be processed.

---

## Verifying Path Mappings
After adding or processing new items, run the dependency audit script to ensure all Behavior Pack items have valid icons and that there are no orphaned files:
```bash
python tools/audit_textures.py
```

---

## Herb Texture Automation (Aseprite)

For generating consistent, release-quality textures for the herb garden crops and items (rosemary, oregano, thyme, sage), you can use the Aseprite automation script:
[herb_generator.lua](file:///c:/Users/brett/Code/2026/Antigravity/Breakfast/tools/herb_generator.lua).

### How to Install the Script in Aseprite
1. Open Aseprite.
2. Go to **File > Scripts > Open Scripts Folder**.
3. Copy the [herb_generator.lua](file:///c:/Users/brett/Code/2026/Antigravity/Breakfast/tools/herb_generator.lua) file into that folder.
4. Go to **File > Scripts > Rescan Scripts Folder**.

### How to Use the Script
1. Create or open your **grayscale template canvas** (32x32 size).
   - Draw the shape using the four template shades:
     - `#000000` (Dark Shadow)
     - `#555555` (Base Leaf)
     - `#aaaaaa` (Mid-Tone)
     - `#ffffff` (Highlight)
   - Stems or other details painted in non-grayscale colors (e.g. brown stems `#543D2B`) will be automatically preserved.
2. Run the script: **File > Scripts > herb_generator**.
3. Select the export mode in the dialog:
   - **Crops (4 Frames -> 16 Block Textures)**: Expects a 4-frame sprite. Color-swaps and exports to `Breakfast_RP/textures/blocks/` as `herb_crop_<herb>_<0-3>.png`.
   - **Items (3 Frames -> 12 Item Textures)**: Expects a 3-frame sprite (Frame 1: Raw, Frame 2: Seeds, Frame 3: Chopped). Color-swaps and exports to `Breakfast_RP/textures/items/` as `<herb>.png`, `<herb>_seeds.png`, and `<herb>_chopped.png`.
   - **Single Item (Active Frame -> 4 Item Textures)**: Takes the current frame and exports it for the chosen item type (Raw, Seeds, or Chopped) for all 4 herbs.
