# Breakfast Addon - Official Wiki & Guide

Welcome to the **Breakfast Addon** official guide! This wiki explains all the mechanics, workstations, recipes, crops, and advancements added by this addon.

---

## 1. Workstations

### A. The Butcher Block
The **Butcher Block** is used to prepare raw ingredients by slicing or processing them with a knife.

#### How to Use:
1. **Place the item**: Right-click/interact on the top of the Butcher Block with a raw item in your hand.
2. **Process the item**: Equip any **Knife** (Flint, Copper, Iron, or Diamond) in your main hand and right-click/interact on the block.
3. **Retrieve the item**: Right-click/interact with an empty hand to retrieve a placed item without processing it.

#### Processing Recipes:
| Input Block/Item | Tool Required | Output Item | Base Count | Bonus/Byproducts |
| :--- | :--- | :--- | :---: | :--- |
| `minecraft:porkchop` | Knife | `breakfast:ham` | 1 | |
| `breakfast:ham` | Knife | `breakfast:ground_pork` | 1 | |
| `breakfast:pork_belly` | Knife | `breakfast:bacon` | 2 | 50% chance for `breakfast:lard` |
| `minecraft:potato` | Knife | `breakfast:raw_hash_browns` | 1 | |
| `minecraft:bread` | Knife | `breakfast:bread_slice` | 3 | |
| `breakfast:onion` | Knife | `breakfast:onion_slices` | 3 | |
| `breakfast:tomato` | Knife | `breakfast:tomato_slice` | 3 | |
| `breakfast:pepper` | Knife | `breakfast:pepper_slices` | 3 | |
| `breakfast:cheese_wheel` | Knife | `breakfast:cheese_slice` | 4 | |
| `breakfast:beef_flank` | Knife | `breakfast:steak_strips` | 2 | |
| `breakfast:suet` | Knife | `breakfast:tallow` | 2 | |
| `breakfast:mutton_ribs` | Knife | `breakfast:mutton_strips` | 2 | |
| `breakfast:rabbit_backstrap` | Knife | `breakfast:rabbit_sausage_raw` | 2 | |
| `minecraft:carrot` | Knife | `breakfast:carrot_slices` | 3 | |
| `minecraft:beetroot` | Knife | `breakfast:beetroot_slices` | 3 | |
| `minecraft:brown_mushroom`| Knife | `breakfast:brown_mushroom_slices` | 3 | |
| `minecraft:red_mushroom`  | Knife | `breakfast:red_mushroom_slices` | 3 | |
| `minecraft:crimson_fungus` | Knife | `breakfast:crimson_fungus_slices` | 3 | |
| `minecraft:warped_fungus`  | Knife | `breakfast:warped_fungus_slices` | 3 | |
| Herbs (Rosemary, Thyme, etc.) | Knife | Chopped variant | 2 | |

*Note: Diamond Knives guarantee +1 bonus slice and 100% byproduct drops, while Flint Knives have a 20% failure rate and drop no byproducts.*

---

### B. The Griddle
The **Griddle** is a hot cooking surface used to fry meats, bake bread, evaporate liquids, and fuse complex dishes like Omelets.

#### How to Use:
1. **Place raw items**: Right-click/interact on any of the 4 slots of the griddle with a cookable item to place it.
2. **Retrieve items**: Right-click/interact with an empty hand to retrieve a cooking or cooked item from a slot.
3. **Crackle & Eject**: Placing cookable items will start a crackling animation. Once cooked, the item is ejected from the griddle.

> [!CAUTION]
> **Burn Hazard**: Walking or standing on an active Griddle inflicts **1 fire damage per tick** to players and mobs.

#### Cooking Recipes (Single Items):
| Raw Input | Cooked Output | Cook Time (sec) |
| :--- | :--- | :---: |
| `breakfast:bacon` | `breakfast:cooked_bacon` | 7.5 |
| `minecraft:egg` | `breakfast:fried_egg` | 6.0 |
| `breakfast:bread_slice` | `breakfast:toast` | 6.0 |
| `breakfast:raw_hash_browns`| `breakfast:hash_browns` | 6.0 |
| `breakfast:raw_sausage` | `breakfast:sausage` | 7.5 |
| `breakfast:onion_slices` | `breakfast:grilled_onion` | 6.0 |
| `breakfast:tomato_slice` | `breakfast:grilled_tomato` | 6.0 |
| `breakfast:pepper_slices` | `breakfast:grilled_pepper` | 6.0 |
| `breakfast:steak_strips` | `breakfast:cooked_steak_strips` | 7.5 |
| `breakfast:mutton_strips` | `breakfast:cooked_mutton_strips` | 7.5 |
| `breakfast:rabbit_sausage_raw`| `breakfast:rabbit_sausage` | 7.5 |
| `breakfast:carrot_slices` | `breakfast:grilled_carrot` | 6.0 |
| `breakfast:beetroot_slices`| `breakfast:grilled_beetroot` | 6.0 |
| `breakfast:brown_mushroom_slices`| `breakfast:grilled_brown_mushroom`| 6.0 |
| `breakfast:red_mushroom_slices`| `breakfast:grilled_red_mushroom` | 6.0 |
| `breakfast:crimson_fungus_slices`| `breakfast:grilled_crimson_fungus`| 6.0 |
| `breakfast:warped_fungus_slices` | `breakfast:grilled_warped_fungus` | 6.0 |
| `minecraft:water_bucket` | `breakfast:salt` x3 (returns empty bucket) | 7.5 |
| `minecraft:milk_bucket` | `breakfast:cheese_curds` x1 (returns empty bucket)| 7.5 |

#### Omelet Fusion Recipes:
Griddle fusions occur when the correct ingredients are placed together on the Griddle top:
* **Plain Omelet**: 1 Egg
* **Bacon Omelet**: 1 Egg + 1 Raw/Cooked Bacon
* **Ham Omelet**: 1 Egg + 1 Ham
* **Mushroom Omelet**: 1 Egg + 1 Brown Mushroom Slices + 1 Red Mushroom Slices
* **Nether Fungi Omelet**: 1 Egg + 1 Crimson Fungus Slices + 1 Warped Fungus Slices
* **Miner's Skillet**: 1 Egg + 1 Raw/Cooked Sausage + 1 Raw/Cooked Hash Browns

---

## 2. Agriculture & Farming

### A. Crops
| Crop Type | Soil | Growth Stages | Harvest Behavior |
| :--- | :--- | :---: | :--- |
| **Onion** | Farmland | 0 - 3 | Drops Onion. Resets to Stage 0 (replants itself). |
| **Tomato** | Farmland / Trellis | 0 - 3 | Interacting harvests tomatoes and resets stage to 2. Can grow vertically up to 3 blocks high when placed next to **Tomato Trellises**. |
| **Pepper** | Farmland | 0 - 3 | Interacting harvests bell peppers and resets stage to 2. |
| **Spinach** | Farmland | 0 - 3 | Grows up to 2 blocks tall. Harvest the top block with **Shears** or a **Knife** to gather leaves while leaving the base block to regrow. |

---

### B. The Herb Pot
The **Herb Pot** is a decorative block used to cultivate garden herbs.

#### Cultivation:
1. Interact with **Herb Seeds** (Rosemary, Thyme, Sage, Oregano) to plant them.
2. The herb will grow through stages 0 to 3.
3. **Harvesting**:
   - **Empty Hand**: Interacting retrieves the entire plant/seeds, resetting the pot.
   - **Knife / Shears**: Interacting harvests **2 Chopped Herbs** and damages the tool, resetting the growth progress back to stage 1 for continuous regrowth.

---

## 3. Advancements

The addon registers 5 custom advancements that broadcast to all players in chat upon completion:

1. **Rise and Shine**: Craft and place a Griddle.
2. **Most Important Meal**: Obtain Berry Pancakes.
3. **Short Order Cook**: Cook every single basic ingredient on the Griddle (Bacon, Eggs, Toast, Hash Browns, Sausage).
4. **Miner's Breakfast**: Eat a Miner's Skillet (clears Mining Fatigue and grants Haste I for 90 seconds).
5. **Nether Brunch**: Consume a Nether Fungi Omelet while standing inside the Nether dimension.
