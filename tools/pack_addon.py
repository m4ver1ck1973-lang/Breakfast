import os
import json
import zipfile

def pack_addon():
    # Get the parent directory of this script (project root)
    project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    
    # Read version dynamically from Behavior Pack manifest
    bp_manifest_path = os.path.join(project_root, "Breakfast_BP", "manifest.json")
    version_str = "1.0.4"  # Default fallback
    try:
        with open(bp_manifest_path, 'r', encoding='utf-8') as f:
            manifest = json.load(f)
            version_array = manifest.get("header", {}).get("version", [1, 0, 4])
            version_str = ".".join(map(str, version_array))
    except Exception as e:
        print(f"Warning: Could not read version from manifest.json: {e}. Defaulting to {version_str}")
        
    addon_name = f"Breakfast_{version_str}.mcaddon"
    output_path = os.path.join(project_root, addon_name)
    
    folders_to_pack = ["Breakfast_BP", "Breakfast_RP"]
    
    print(f"Starting packaging into {addon_name}...")
    
    # Remove existing mcaddon if it exists
    if os.path.exists(output_path):
        try:
            os.remove(output_path)
            print(f"Removed existing {addon_name}")
        except Exception as e:
            print(f"Error removing existing package: {e}")
            return
            
    with zipfile.ZipFile(output_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for folder in folders_to_pack:
            folder_path = os.path.join(project_root, folder)
            if not os.path.exists(folder_path):
                print(f"Warning: Folder {folder} not found, skipping.")
                continue
            
            print(f"Packing {folder}...")
            for root, dirs, files in os.walk(folder_path):
                for file in files:
                    file_path = os.path.join(root, file)
                    # Compute relative path from project root to keep folder hierarchy
                    arcname = os.path.relpath(file_path, project_root)
                    zipf.write(file_path, arcname)
                    
    print(f"Successfully packaged addon to {output_path}")

if __name__ == "__main__":
    pack_addon()
