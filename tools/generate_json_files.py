import os
import json

def write_json(filepath, data):
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
        f.write('\n')
    print(f"Generated: {filepath}")

def generate_items(bp_dir):
    items_dir = os.path.join(bp_dir, "items")
    
    # 1. Non-edible basic items (max stack 64)
    basic_items = {
        # Seeds with block placers
        "onion_seeds": {"icon": "onion_seeds", "block": "breakfast:onion_crop", "use_on": ["minecraft:farmland"]},
        "tomato_seeds": {"icon": "tomato_seeds", "block": "breakfast:tomato_crop", "use_on": ["minecraft:farmland"]},
        "pepper_seeds": {"icon": "pepper_seeds", "block": "breakfast:pepper_crop", "use_on": ["minecraft:farmland"]},
        "spinach_seeds": {"icon": "spinach_seeds", "block": "breakfast:spinach_crop", "use_on": ["minecraft:farmland"]},
        "rosemary_seeds": {"icon": "rosemary_seeds", "block": "breakfast:herb_crop_rosemary", "use_on": ["minecraft:farmland"]},
        "thyme_seeds": {"icon": "thyme_seeds", "block": "breakfast:herb_crop_thyme", "use_on": ["minecraft:farmland"]},
        "sage_seeds": {"icon": "sage_seeds", "block": "breakfast:herb_crop_sage", "use_on": ["minecraft:farmland"]},
        "oregano_seeds": {"icon": "oregano_seeds", "block": "breakfast:herb_crop_oregano", "use_on": ["minecraft:farmland"]},
        
        # Prepped vegetables & spices
        "onion_slices": {"icon": "onion_slices"},
        "tomato_slice": {"icon": "tomato_slice"},
        "pepper_slices": {"icon": "pepper_slices"},
        "spinach_leaves": {"icon": "spinach_leaves"},
        "chopped_rosemary": {"icon": "rosemary_chopped"},
        "chopped_thyme": {"icon": "thyme_chopped"},
        "chopped_sage": {"icon": "sage_chopped"},
        "chopped_oregano": {"icon": "oregano_chopped"},
        "herb_rosemary": {"icon": "rosemary"},
        "herb_thyme": {"icon": "thyme"},
        "herb_sage": {"icon": "sage"},
        "herb_oregano": {"icon": "oregano"},
        "spices": {"icon": "spices"},
        "salt": {"icon": "salt"},
        
        # Fats
        "suet": {"icon": "suet"},
        "tallow": {"icon": "tallow"},
        
        # Meat cuts raw
        "beef_flank": {"icon": "beef_flank"},
        "steak_strips": {"icon": "steak_strips_raw"},
        "chicken_breast": {"icon": "chicken_breast"},
        "mutton_ribs": {"icon": "mutton_ribs"},
        "mutton_strips": {"icon": "mutton_strips_raw"},
        "rabbit_backstrap": {"icon": "rabbit_backstrap"},
        "rabbit_sausage_raw": {"icon": "rabbit_sausage_raw"}
    }
    
    for item_name, config in basic_items.items():
        item_id = f"breakfast:{item_name}"
        data = {
            "format_version": "1.21.0",
            "minecraft:item": {
                "description": {
                    "identifier": item_id,
                    "menu_category": {
                        "category": "items"
                    }
                },
                "components": {
                    "minecraft:icon": config["icon"],
                    "minecraft:max_stack_size": 64
                }
            }
        }
        if "block" in config:
            data["minecraft:item"]["components"]["minecraft:block_placer"] = {
                "block": config["block"],
                "use_on": config["use_on"]
            }
        
        write_json(os.path.join(items_dir, f"{item_name}.json"), data)
        
    # 2. Edible food items
    food_items = {
        "onion": {"icon": "onion", "nut": 1, "sat": 0.1},
        "grilled_onion": {"icon": "onion_grilled", "nut": 2, "sat": 0.3},
        "tomato": {"icon": "tomato", "nut": 2, "sat": 0.2},
        "grilled_tomato": {"icon": "tomato_grilled", "nut": 3, "sat": 0.4},
        "pepper": {"icon": "pepper", "nut": 2, "sat": 0.2},
        "grilled_pepper": {"icon": "pepper_grilled", "nut": 3, "sat": 0.4},
        "spinach": {"icon": "spinach", "nut": 1, "sat": 0.1},
        "cheese_curds": {"icon": "cheese_curds", "nut": 2, "sat": 0.3},
        "cheese_slice": {"icon": "cheese_slice", "nut": 1, "sat": 0.2},
        "cheese_wheel": {"icon": "cheese_wheel", "nut": 6, "sat": 0.6, "dur": 2.4},
        "cooked_steak_strips": {"icon": "steak_strips_cooked", "nut": 4, "sat": 0.6},
        "cooked_mutton_strips": {"icon": "mutton_strips_cooked", "nut": 4, "sat": 0.6},
        "rabbit_sausage": {"icon": "rabbit_sausage_cooked", "nut": 5, "sat": 0.6}
    }
    
    for item_name, config in food_items.items():
        item_id = f"breakfast:{item_name}"
        data = {
            "format_version": "1.21.0",
            "minecraft:item": {
                "description": {
                    "identifier": item_id,
                    "menu_category": {
                        "category": "items"
                    }
                },
                "components": {
                    "minecraft:icon": config["icon"],
                    "minecraft:max_stack_size": 64,
                    "minecraft:food": {
                        "nutrition": config["nut"],
                        "saturation_modifier": config["sat"],
                        "can_always_eat": False
                    },
                    "minecraft:use_animation": "eat",
                    "minecraft:use_modifiers": {
                        "use_duration": config.get("dur", 1.6),
                        "movement_modifier": 0.35
                    }
                }
            }
        }
        write_json(os.path.join(items_dir, f"{item_name}.json"), data)

def generate_blocks(bp_dir):
    blocks_dir = os.path.join(bp_dir, "blocks")
    
    # 1. Custom Trellis & Herb Pot
    trellis_data = {
        "format_version": "1.26.0",
        "minecraft:block": {
            "description": {
                "identifier": "breakfast:tomato_trellis",
                "menu_category": {
                    "category": "items"
                }
            },
            "components": {
                "minecraft:geometry": "geometry.tomato_trellis",
                "minecraft:material_instances": {
                    "*": {
                        "texture": "tomato_trellis",
                        "render_method": "alpha_test"
                    }
                },
                "minecraft:destructible_by_mining": {
                    "seconds_to_destroy": 1.0
                },
                "minecraft:collision_box": False,
                "minecraft:selection_box": {
                    "origin": [-8, 0, -8],
                    "size": [16, 16, 16]
                }
            }
        }
    }
    write_json(os.path.join(blocks_dir, "tomato_trellis.json"), trellis_data)
    
    herb_pot_data = {
        "format_version": "1.26.0",
        "minecraft:block": {
            "description": {
                "identifier": "breakfast:herb_pot",
                "menu_category": {
                    "category": "items"
                }
            },
            "components": {
                "breakfast:herb_pot_component": {},
                "minecraft:geometry": "geometry.herb_pot",
                "minecraft:material_instances": {
                    "*": {
                        "texture": "herb_pot",
                        "render_method": "opaque"
                    }
                },
                "minecraft:destructible_by_mining": {
                    "seconds_to_destroy": 1.5
                },
                "minecraft:selection_box": {
                    "origin": [-5, 0, -5],
                    "size": [10, 8, 10]
                },
                "minecraft:collision_box": {
                    "origin": [-5, 0, -5],
                    "size": [10, 8, 10]
                },
                "minecraft:tick": {
                    "interval_range": [200, 400],
                    "looping": True
                }
            }
        }
    }
    write_json(os.path.join(blocks_dir, "herb_pot.json"), herb_pot_data)

    # 2. Crops (Onion, Tomato, Pepper, Spinach, Rosemary, Thyme, Sage, Oregano)
    crops = [
        "onion_crop",
        "tomato_crop",
        "pepper_crop",
        "spinach_crop",
        "herb_crop_rosemary",
        "herb_crop_thyme",
        "herb_crop_sage",
        "herb_crop_oregano"
    ]
    
    for crop_name in crops:
        crop_data = {
            "format_version": "1.26.0",
            "minecraft:block": {
                "description": {
                    "identifier": f"breakfast:{crop_name}",
                    "properties": {
                        "breakfast:growth_stage": [0, 1, 2, 3]
                    },
                    "menu_category": {
                        "category": "commands"
                    }
                },
                "components": {
                    f"breakfast:{crop_name}_component": {},
                    "minecraft:geometry": "minecraft:geometry.cross",
                    "minecraft:material_instances": {
                        "*": {
                            "texture": f"{crop_name}_0",
                            "render_method": "alpha_test"
                        }
                    },
                    "minecraft:destructible_by_mining": {
                        "seconds_to_destroy": 0.1
                    },
                    "minecraft:collision_box": False,
                    "minecraft:selection_box": {
                        "origin": [-8, 0, -8],
                        "size": [16, 8, 16]
                    },
                    "minecraft:tick": {
                        "interval_range": [200, 400],
                        "looping": True
                    }
                },
                "permutations": [
                    {
                        "condition": f"q.block_state('breakfast:growth_stage') == {stage}",
                        "components": {
                            "minecraft:material_instances": {
                                "*": {
                                    "texture": f"{crop_name}_{stage}",
                                    "render_method": "alpha_test"
                                }
                            }
                        }
                    }
                    for stage in range(4)
                ]
            }
        }
        write_json(os.path.join(blocks_dir, f"{crop_name}.json"), crop_data)

def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(script_dir)
    bp_dir = os.path.join(project_root, "Breakfast_BP")
    
    print("Generating item files...")
    generate_items(bp_dir)
    
    print("\nGenerating block files...")
    generate_blocks(bp_dir)
    
    print("\nGeneration finished successfully!")

if __name__ == "__main__":
    main()
