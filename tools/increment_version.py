import os
import json
import re
import argparse

def update_manifest(filepath, target_version):
    if not os.path.exists(filepath):
        print(f"Error: Manifest file not found at {filepath}")
        return False
        
    print(f"Updating manifest: {filepath}...")
    with open(filepath, 'r', encoding='utf-8') as f:
        data = json.load(f)
        
    # Update header version
    version_str = ".".join(map(str, target_version))
    if "header" in data:
        old_version = data["header"].get("version")
        data["header"]["version"] = target_version
        name = data["header"].get("name", "")
        # Replace vX.Y.Z with the new version
        new_name = re.sub(r'v\d+\.\d+\.\d+', f'v{version_str}', name)
        # Fallback if no vX.Y.Z was in name
        if new_name == name and " v" not in name:
            new_name = f"{name} v{version_str}"
        data["header"]["name"] = new_name
        print(f"  Header Name: '{name}' -> '{new_name}'")
        print(f"  Header Version: {old_version} -> {target_version}")
        
    # Update module versions
    if "modules" in data:
        for idx, module in enumerate(data["modules"]):
            if "version" in module:
                old_v = module["version"]
                module["version"] = target_version
                print(f"  Module {idx} Version: {old_v} -> {target_version}")
                
    # Update dependencies
    if "dependencies" in data:
        for idx, dep in enumerate(data["dependencies"]):
            if "version" in dep and isinstance(dep["version"], list) and len(dep["version"]) == 3:
                old_v = dep["version"]
                dep["version"] = target_version
                print(f"  Dependency {idx} Version: {old_v} -> {target_version}")
                
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
        # Minecraft manifests require a trailing newline for validation sometimes
        f.write('\n')
    print("Update complete!\n")
    return True

def main():
    parser = argparse.ArgumentParser(description="Increment versions across Behavior and Resource Pack manifests.")
    parser.add_argument("--version", default="1.0.22", help="The target version string (e.g. 1.0.22).")
    args = parser.parse_args()
    
    # Parse version string to integer list
    try:
        version_parts = [int(x) for x in args.version.split(".")]
        if len(version_parts) != 3:
            raise ValueError()
    except ValueError:
        print(f"Error: Version string must be in format 'X.Y.Z' (e.g., 1.0.22). Got '{args.version}'")
        return
        
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(script_dir)
    
    bp_manifest = os.path.join(project_root, "Breakfast_BP", "manifest.json")
    rp_manifest = os.path.join(project_root, "Breakfast_RP", "manifest.json")
    
    update_manifest(bp_manifest, version_parts)
    update_manifest(rp_manifest, version_parts)
    print("Manifest versions successfully updated!")

if __name__ == "__main__":
    main()
