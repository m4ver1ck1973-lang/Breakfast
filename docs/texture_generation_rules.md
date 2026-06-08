# Texture Generation Pipeline and Standing Rules

This document outlines the workflow and standing rules for producing and modifying item textures in the Breakfast Addon project.

---

## The Standing Rule

> [!IMPORTANT]
> **All item textures must be generated via Gemini Web UI (or Google GenAI API when quotas allow) and processed using the project's post-processing script.**
> 
> * Do **not** run the procedural image generator (i.e. `--procedural`) unless explicitly requested. Running procedural drawing will overwrite customized hand-tuned assets.
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
