import os
from google import genai
from google.genai import types
from PIL import Image
import io

# Initialize the client. This automatically picks up your GEMINI_API_KEY environment variable.
client = genai.Client()

# List of item IDs and prompts tailored for Minecraft's square layout
items_to_generate = {
    "bacon_strip": "A 16-bit pixel art sprite of a raw bacon strip, 16x16 grid canvas, clean dark outline, flat lighting, retro game asset, isolated on a solid white background",
    "fried_egg": "A 16-bit pixel art sprite of a fried egg, 16x16 grid canvas, clean dark outline, flat lighting, retro game asset, isolated on a solid white background",
    "waffle": "A 16-bit pixel art sprite of a golden waffle, 16x16 grid canvas, clean dark outline, flat lighting, retro game asset, isolated on a solid white background"
}

# WARNING: This script is part of the deprecated Python image generation toolchain.
# Do NOT use this script or the generated assets for release-quality textures.
# It is only suitable for generating placeholders for new implementations.

import sys
print("="*75)
print("DEPRECATION WARNING: This script (imagen.py) is part of the deprecated")
print("Python image generation toolchain and is NOT allowed for release textures.")
print("Proceed only if you are generating placeholders for a new implementation.")
print("="*75)

# Optional prompt to continue
response = input("Do you want to continue generating placeholder textures? (y/N): ").strip().lower()
if response not in ('y', 'yes'):
    print("Execution aborted.")
    sys.exit(0)

output_dir = "./addon_textures"
os.makedirs(output_dir, exist_ok=True)

for item_id, prompt_text in items_to_generate.items():
    print(f"Generating texture for: {item_id}...")
    
    # Using the Imagen 4 generation model
    result = client.models.generate_images(
        model="imagen-4.0-generate-001",
        prompt=prompt_text,
        config=types.GenerateImagesConfig(
            number_of_images=1,
            aspect_ratio="1:1",
            output_mime_type="image/png"
        )
    )
    
    # Access and save the generated image bytes
    for generated_image in result.generated_images:
        image = Image.open(io.BytesIO(generated_image.image.image_bytes))
        image.save(os.path.join(output_dir, f"{item_id}.png"))

print("Batch texture generation complete!")