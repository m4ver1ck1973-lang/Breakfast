import os
import json

def run_audit():
    # Resolve project root (parent directory of this script's directory)
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(script_dir)
    
    bp_items_dir = os.path.join(project_root, 'Breakfast_BP', 'items')
    rp_dir = os.path.join(project_root, 'Breakfast_RP')
    item_tex_path = os.path.join(rp_dir, 'textures', 'item_texture.json')
    
    if not os.path.exists(item_tex_path):
        print(f"Error: Could not find item_texture.json at {item_tex_path}")
        return False

    # 1. Load item_texture.json
    with open(item_tex_path, 'r', encoding='utf-8') as f:
        item_texture_data = json.load(f).get('texture_data', {})

    # 2. Iterate through BP items
    issues = []
    all_items = []
    
    if not os.path.exists(bp_items_dir):
        print(f"Error: BP items directory not found at {bp_items_dir}")
        return False
        
    for file in os.listdir(bp_items_dir):
        if file.endswith('.json'):
            filepath = os.path.join(bp_items_dir, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                try:
                    data = json.load(f)
                    item_desc = data.get('minecraft:item', {}).get('description', {})
                    item_id = item_desc.get('identifier', 'unknown')
                    components = data.get('minecraft:item', {}).get('components', {})
                    icon = components.get('minecraft:icon')
                    
                    all_items.append((item_id, icon, file))
                    
                    if not icon:
                        issues.append(f"Item '{item_id}' (file: {file}) has no 'minecraft:icon' component.")
                        continue
                        
                    # Resolve icon in item_texture.json
                    tex_val = item_texture_data.get(icon)
                    if not tex_val:
                        issues.append(f"Icon '{icon}' referenced by item '{item_id}' (file: {file}) is missing from item_texture.json.")
                        continue
                        
                    tex_path = tex_val.get('textures')
                    if isinstance(tex_path, list):
                        tex_path = tex_path[0]
                        
                    # Check if png file exists
                    png_path = os.path.join(rp_dir, tex_path + '.png')
                    # Standardize slash direction for validation display
                    disp_path = png_path.replace("\\", "/")
                    if not os.path.exists(png_path):
                        issues.append(f"Texture file '{disp_path}' (icon: '{icon}', item: '{item_id}') does not exist.")
                except Exception as e:
                    issues.append(f"Error reading file {file}: {e}")

    # 3. Check for orphaned PNG files in active textures directory
    stale_files = []
    active_textures_dir = os.path.join(rp_dir, "textures", "items")
    if os.path.exists(active_textures_dir):
        active_pngs = [f for f in os.listdir(active_textures_dir) if f.endswith('.png')]
        
        # Build set of registered png basenames
        registered_basenames = set()
        for tex_key, tex_val in item_texture_data.items():
            path = tex_val.get('textures')
            if isinstance(path, list):
                path = path[0]
            if path and path.startswith("textures/items/"):
                registered_basenames.add(path.replace("textures/items/", "") + ".png")
                
        for png in active_pngs:
            if png not in registered_basenames:
                stale_files.append(png)

    print('========================================')
    print('          Breakfast Addon Audit          ')
    print('========================================')
    print(f'Total behavior pack items checked: {len(all_items)}')
    
    if issues:
        print(f'\nFound {len(issues)} mapping issues:')
        for issue in issues:
            print(f'  [ERROR] {issue}')
    else:
        print('\n[SUCCESS] No mapping issues found! All items have valid icon configurations and matching files.')

    if stale_files:
        print(f'\nFound {len(stale_files)} unregistered PNG files in textures/items directory (stale files):')
        for stale in sorted(stale_files):
            print(f'  [UNUSED] {stale}')
    else:
        print('\n[SUCCESS] No unregistered PNG files found in the active textures directory.')
        
    print('========================================')
    return len(issues) == 0

if __name__ == "__main__":
    run_audit()
