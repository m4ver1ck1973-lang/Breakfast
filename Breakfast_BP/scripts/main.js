import { world, system, ItemStack } from "@minecraft/server";

// Register the block custom components
system.beforeEvents.startup.subscribe((event) => {
  try {
    event.blockComponentRegistry.registerCustomComponent("breakfast:butcher_block_component", {
      onPlayerInteract: (e) => {
        handleButcherBlockInteract(e);
      }
    });

    event.blockComponentRegistry.registerCustomComponent("breakfast:griddle_component", {
      onPlayerInteract: (e) => {
        handleGriddleInteract(e);
      },
      onTick: (e) => {
        handleGriddleTick(e);
      },
      onStepOn: (e) => {
        handleGriddleStepOn(e);
      }
    });

    event.blockComponentRegistry.registerCustomComponent("breakfast:herb_pot_component", {
      onPlayerInteract: (e) => {
        handleHerbPotInteract(e);
      },
      onTick: (e) => {
        handleHerbPotTick(e);
      }
    });

    const crops = [
      "onion_crop", "tomato_crop", "pepper_crop", "spinach_crop",
      "herb_crop_rosemary", "herb_crop_thyme", "herb_crop_sage", "herb_crop_oregano"
    ];
    for (const crop of crops) {
      event.blockComponentRegistry.registerCustomComponent(`breakfast:${crop}_component`, {
        onPlayerInteract: (e) => {
          handleCropInteract(e);
        },
        onTick: (e) => {
          handleCropTick(e);
        }
      });
    }
  } catch (err) {
    console.warn("[Breakfast] Error registering block components: " + err);
  }
});

// Item to visual variant mapping
const ITEM_TO_VARIANT = {
  "minecraft:porkchop": 1,
  "minecraft:potato": 2,
  "minecraft:egg": 3,
  "minecraft:bread": 4,
  "minecraft:beef": 5,
  "minecraft:chicken": 6,
  "minecraft:mutton": 7,
  "minecraft:rabbit": 8,
  "minecraft:cod": 9,
  "minecraft:salmon": 10,
  "minecraft:kelp": 11,
  "minecraft:cooked_beef": 12,
  "minecraft:cooked_chicken": 13,
  "minecraft:cooked_porkchop": 14,
  "minecraft:cooked_mutton": 15,
  "minecraft:cooked_rabbit": 16,
  "minecraft:cooked_cod": 17,
  "minecraft:cooked_salmon": 18,
  "minecraft:dried_kelp": 19,
  "minecraft:baked_potato": 20,
  "breakfast:bacon": 21,
  "breakfast:cooked_bacon": 22,
  "breakfast:fried_egg": 23,
  "breakfast:toast": 24,
  "breakfast:hash_browns": 25,
  "breakfast:raw_hash_browns": 26,
  "breakfast:sausage": 27,
  "breakfast:ham": 28,
  "breakfast:pork_belly": 29,
  "breakfast:ground_pork": 30,
  "breakfast:lard": 31,
  "breakfast:raw_sausage": 32,
  "breakfast:bread_slice": 33,
  "breakfast:onion": 34,
  "breakfast:onion_slices": 35,
  "breakfast:grilled_onion": 36,
  "breakfast:tomato": 37,
  "breakfast:tomato_slice": 38,
  "breakfast:grilled_tomato": 39,
  "breakfast:pepper": 40,
  "breakfast:pepper_slices": 41,
  "breakfast:grilled_pepper": 42,
  "breakfast:spinach": 43,
  "breakfast:spinach_leaves": 44,
  "breakfast:herb_rosemary": 45,
  "breakfast:chopped_rosemary": 46,
  "breakfast:herb_thyme": 47,
  "breakfast:chopped_thyme": 48,
  "breakfast:herb_sage": 49,
  "breakfast:chopped_sage": 50,
  "breakfast:herb_oregano": 51,
  "breakfast:chopped_oregano": 52,
  "breakfast:spices": 53,
  "breakfast:salt": 54,
  "breakfast:cheese_curds": 55,
  "breakfast:cheese_wheel": 56,
  "breakfast:cheese_slice": 57,
  "breakfast:beef_flank": 58,
  "breakfast:steak_strips": 59,
  "breakfast:cooked_steak_strips": 60,
  "breakfast:suet": 61,
  "breakfast:tallow": 62,
  "breakfast:chicken_breast": 63,
  "breakfast:mutton_ribs": 64,
  "breakfast:mutton_strips": 65,
  "breakfast:cooked_mutton_strips": 66,
  "breakfast:rabbit_backstrap": 67,
  "breakfast:rabbit_sausage_raw": 68,
  "breakfast:rabbit_sausage": 69,
  "breakfast:onion_seeds": 70,
  "breakfast:tomato_seeds": 71,
  "breakfast:pepper_seeds": 72,
  "breakfast:spinach_seeds": 73,
  "breakfast:rosemary_seeds": 74,
  "breakfast:thyme_seeds": 75,
  "breakfast:sage_seeds": 76,
  "breakfast:oregano_seeds": 77
};

function getVariantFromItem(itemTypeId) {
  return ITEM_TO_VARIANT[itemTypeId] || 0;
}

function getGriddleSlotOffsets(index) {
  switch (index) {
    case 0: return { x: -0.25, z: -0.25 };
    case 1: return { x: 0.25, z: -0.25 };
    case 2: return { x: -0.25, z: 0.25 };
    case 3: return { x: 0.25, z: 0.25 };
    default: return { x: 0, z: 0 };
  }
}

// Helper to remove any placed visual entities in a slot or butcher block
function removePlacedEntity(block, slotTag) {
  try {
    const searchLoc = { x: block.location.x + 0.5, y: block.location.y + 0.5, z: block.location.z + 0.5 };
    const entities = block.dimension.getEntities({
      type: "breakfast:placed_item",
      location: searchLoc,
      maxDistance: 1.2
    });
    for (const ent of entities) {
      if (ent.hasTag(slotTag)) {
        ent.remove();
      }
    }
  } catch (e) {
    console.warn("[Breakfast] Error removing entity: " + e);
  }
}

// Helper to spawn/update a placed visual entity
function updatePlacedEntity(block, slotTag, itemTypeId, yOffset, xOffset = 0, zOffset = 0) {
  try {
    // First remove any existing entity in that slot
    removePlacedEntity(block, slotTag);
    
    // Spawn new entity
    const spawnLoc = {
      x: block.location.x + 0.5 + xOffset,
      y: block.location.y + yOffset,
      z: block.location.z + 0.5 + zOffset
    };
    
    const entity = block.dimension.spawnEntity("breakfast:placed_item", spawnLoc);
    entity.addTag(slotTag);
    
    const variant = getVariantFromItem(itemTypeId);
    entity.setProperty("breakfast:item_variant", variant);
  } catch (e) {
    console.warn("[Breakfast] Error updating entity: " + e);
  }
}

const KNIVES = [
  "breakfast:knife_flint",
  "breakfast:knife_copper",
  "breakfast:knife_iron",
  "breakfast:knife_diamond"
];

// Recipe Definitions
const BUTCHER_RECIPES = {
  "minecraft:porkchop": { output: "breakfast:ham", count: 1 },
  "breakfast:ham": { output: "breakfast:ground_pork", count: 1 },
  "breakfast:pork_belly": { 
    output: "breakfast:bacon", 
    count: 2, 
    extra: "breakfast:lard", 
    extraChance: 0.5 
  },
  "minecraft:potato": { output: "breakfast:raw_hash_browns", count: 1 },
  "minecraft:bread": { output: "breakfast:bread_slice", count: 3 },
  "breakfast:onion": { output: "breakfast:onion_slices", count: 3 },
  "breakfast:tomato": { output: "breakfast:tomato_slice", count: 3 },
  "breakfast:pepper": { output: "breakfast:pepper_slices", count: 3 },
  "breakfast:herb_rosemary": { output: "breakfast:chopped_rosemary", count: 2 },
  "breakfast:herb_thyme": { output: "breakfast:chopped_thyme", count: 2 },
  "breakfast:herb_sage": { output: "breakfast:chopped_sage", count: 2 },
  "breakfast:herb_oregano": { output: "breakfast:chopped_oregano", count: 2 },
  "breakfast:cheese_wheel": { output: "breakfast:cheese_slice", count: 4 },
  "breakfast:beef_flank": { output: "breakfast:steak_strips", count: 2 },
  "breakfast:suet": { output: "breakfast:tallow", count: 2 },
  "breakfast:mutton_ribs": { output: "breakfast:mutton_strips", count: 2 },
  "breakfast:rabbit_backstrap": { output: "breakfast:rabbit_sausage_raw", count: 2 }
};

const GRIDDLE_RECIPES = {
  // Custom Add-on Cooking
  "breakfast:bacon": { output: "breakfast:cooked_bacon", cookTime: 10 },
  "minecraft:egg": { output: "breakfast:fried_egg", cookTime: 8 },
  "breakfast:bread_slice": { output: "breakfast:toast", cookTime: 6 },
  "breakfast:raw_hash_browns": { output: "breakfast:hash_browns", cookTime: 12 },
  "breakfast:raw_sausage": { output: "breakfast:sausage", cookTime: 10 },
  "breakfast:onion_slices": { output: "breakfast:grilled_onion", cookTime: 6 },
  "breakfast:tomato_slice": { output: "breakfast:grilled_tomato", cookTime: 6 },
  "breakfast:pepper_slices": { output: "breakfast:grilled_pepper", cookTime: 6 },
  "breakfast:steak_strips": { output: "breakfast:cooked_steak_strips", cookTime: 10 },
  "breakfast:mutton_strips": { output: "breakfast:cooked_mutton_strips", cookTime: 10 },
  "breakfast:rabbit_sausage_raw": { output: "breakfast:rabbit_sausage", cookTime: 10 },
  "minecraft:water_bucket": { output: "breakfast:salt", count: 3, cookTime: 15 },
  "minecraft:milk_bucket": { output: "breakfast:cheese_curds", count: 1, cookTime: 15 },

  // Vanilla Campfire Cooking
  "minecraft:beef": { output: "minecraft:cooked_beef", cookTime: 30 },
  "minecraft:chicken": { output: "minecraft:cooked_chicken", cookTime: 30 },
  "minecraft:porkchop": { output: "minecraft:cooked_porkchop", cookTime: 30 },
  "minecraft:mutton": { output: "minecraft:cooked_mutton", cookTime: 30 },
  "minecraft:rabbit": { output: "minecraft:cooked_rabbit", cookTime: 30 },
  "minecraft:cod": { output: "minecraft:cooked_cod", cookTime: 30 },
  "minecraft:salmon": { output: "minecraft:cooked_salmon", cookTime: 30 },
  "minecraft:kelp": { output: "minecraft:dried_kelp", cookTime: 30 },
  "minecraft:potato": { output: "minecraft:baked_potato", cookTime: 30 }
};

// Data Helper Functions
function getGlobalData() {
  try {
    const dataStr = world.getDynamicProperty("breakfast:data");
    return dataStr ? JSON.parse(dataStr) : {};
  } catch (e) {
    return {};
  }
}

function saveGlobalData(data) {
  try {
    world.setDynamicProperty("breakfast:data", JSON.stringify(data));
  } catch (e) {
    console.warn("[Breakfast] Error saving global data: " + e);
  }
}

function getBlockData(block) {
  const data = getGlobalData();
  const key = `${block.dimension.id}:${block.location.x},${block.location.y},${block.location.z}`;
  return data[key] || null;
}

function saveBlockData(block, blockData) {
  const data = getGlobalData();
  const key = `${block.dimension.id}:${block.location.x},${block.location.y},${block.location.z}`;
  if (blockData === null) {
    delete data[key];
  } else {
    data[key] = blockData;
  }
  saveGlobalData(data);
}

// ----------------------------------------------------
// Butcher Block Logic
// ----------------------------------------------------
function handleButcherBlockInteract(event) {
  const { block, player } = event;
  if (!player) return;

  const inventory = player.getComponent("minecraft:inventory");
  if (!inventory || !inventory.container) return;

  const container = inventory.container;
  const selectedIndex = player.selectedSlotIndex;
  const itemInHand = container.getItem(selectedIndex);
  const blockData = getBlockData(block) || { placedItem: null };

  // Case 1: Empty hand right click on a placed item -> retrieve it
  if (!itemInHand && blockData.placedItem) {
    const returnItem = new ItemStack(blockData.placedItem, 1);
    block.dimension.spawnItem(returnItem, { x: block.location.x + 0.5, y: block.location.y + 1.1, z: block.location.z + 0.5 });
    
    removePlacedEntity(block, "breakfast:butcher");
    blockData.placedItem = null;
    saveBlockData(block, null);
    block.dimension.playSound("random.pop", block.location);
    player.onScreenDisplay.setActionBar("Retrieved item");
    return;
  }

  if (!itemInHand) return;

  // Case 2: Holding a Knife -> Cut the placed item
  if (KNIVES.includes(itemInHand.typeId)) {
    if (!blockData.placedItem) {
      player.onScreenDisplay.setActionBar("Place a pork chop, ham, pork belly, potato, or bread first");
      return;
    }

    const recipe = BUTCHER_RECIPES[blockData.placedItem];
    if (recipe) {
      const knifeType = itemInHand.typeId;

      // 1. Damage the Knife tool (happens regardless of success)
      const durability = itemInHand.getComponent("minecraft:durability");
      if (durability) {
        durability.damage += 1;
        if (durability.damage >= durability.maxDurability) {
          container.setItem(selectedIndex, undefined);
          block.dimension.playSound("random.break", block.location);
        } else {
          container.setItem(selectedIndex, itemInHand);
        }
      }

      // 2. Flint Knife fail check (20% failure rate)
      if (knifeType === "breakfast:knife_flint" && Math.random() < 0.20) {
        block.dimension.playSound("dig.stone", block.location);
        player.onScreenDisplay.setActionBar("Failed to slice! Try again.");
        return;
      }

      // 3. Process outcomes based on knife tier
      let count = recipe.count;
      let extraChance = recipe.extraChance || 0;
      let hasBonusSlice = false;
      let hasBonusExtra = false;
      let hasBonusScraps = false;

      if (knifeType === "breakfast:knife_flint") {
        // Flint drops no byproducts
        extraChance = 0;
      } else if (knifeType === "breakfast:knife_iron") {
        // Iron has a 20% chance for a special trigger
        if (Math.random() < 0.20) {
          if (recipe.extra && Math.random() < 0.5) {
            // Option A: Guaranteed byproduct
            extraChance = 1.0;
            hasBonusExtra = true;
          } else {
            // Option B: Double output
            count += 1;
            hasBonusSlice = true;
          }
        }
      } else if (knifeType === "breakfast:knife_diamond") {
        // Diamond always produces +1 output
        count += 1;
        // Diamond guarantees recipe byproduct
        if (recipe.extra) {
          extraChance = 1.0;
        }
        // Diamond has 30% chance for extra scraps (bone for meats, poisonous potato for potato)
        if (Math.random() < 0.30) {
          hasBonusScraps = true;
        }
      }

      // Spawn processed items
      const outputStack = new ItemStack(recipe.output, count);
      block.dimension.spawnItem(outputStack, { x: block.location.x + 0.5, y: block.location.y + 1.1, z: block.location.z + 0.5 });

      // Handle extra drops like Lard
      if (recipe.extra && Math.random() < extraChance) {
        const extraStack = new ItemStack(recipe.extra, 1);
        block.dimension.spawnItem(extraStack, { x: block.location.x + 0.5, y: block.location.y + 1.1, z: block.location.z + 0.5 });
      }

      // Spawn Diamond scraps
      if (hasBonusScraps) {
        let scrapItem = "minecraft:bone";
        if (blockData.placedItem === "minecraft:potato") {
          scrapItem = "minecraft:poisonous_potato";
        }
        const scrapStack = new ItemStack(scrapItem, 1);
        block.dimension.spawnItem(scrapStack, { x: block.location.x + 0.5, y: block.location.y + 1.1, z: block.location.z + 0.5 });
      }

      // Display feedback
      if (hasBonusSlice) {
        player.onScreenDisplay.setActionBar("Bonus Slice!");
      } else if (hasBonusExtra) {
        player.onScreenDisplay.setActionBar("Bonus Byproduct!");
      } else if (hasBonusScraps) {
        player.onScreenDisplay.setActionBar("Bonus Scraps!");
      } else if (knifeType === "breakfast:knife_diamond") {
        player.onScreenDisplay.setActionBar("Diamond Quality Cut!");
      } else {
        player.onScreenDisplay.setActionBar("Processed!");
      }

      // Clear the block and play effects
      removePlacedEntity(block, "breakfast:butcher");
      blockData.placedItem = null;
      saveBlockData(block, null);
      
      block.dimension.playSound("mob.sheep.shear", block.location);
    } else {
      player.onScreenDisplay.setActionBar("Cannot process this item on the butcher block");
    }
    return;
  }

  // Case 3: Placing an item on the butcher block
  if (!blockData.placedItem) {
    if (BUTCHER_RECIPES[itemInHand.typeId]) {
      // Place the item
      blockData.placedItem = itemInHand.typeId;
      saveBlockData(block, blockData);
      updatePlacedEntity(block, "breakfast:butcher", itemInHand.typeId, 1.01);

      // Consume 1 item from player's hand
      if (itemInHand.amount > 1) {
        itemInHand.amount -= 1;
        container.setItem(selectedIndex, itemInHand);
      } else {
        container.setItem(selectedIndex, undefined);
      }

      block.dimension.playSound("dig.wood", block.location);
      player.onScreenDisplay.setActionBar("Placed " + itemInHand.typeId.split(":")[1]);
    } else {
      player.onScreenDisplay.setActionBar("Hold a pork chop, ham, pork belly, potato, or bread to place");
    }
  }
}

// ----------------------------------------------------
// Griddle Logic
// ----------------------------------------------------
function handleGriddleInteract(event) {
  const { block, player } = event;
  if (!player) return;

  const inventory = player.getComponent("minecraft:inventory");
  if (!inventory || !inventory.container) return;

  const container = inventory.container;
  const selectedIndex = player.selectedSlotIndex;
  const itemInHand = container.getItem(selectedIndex);
  const blockData = getBlockData(block) || { slots: [null, null, null, null] };

  // Case 1: Player interacts with empty hand -> Retrieve first item (cooked or raw)
  if (!itemInHand) {
    for (let i = 0; i < 4; i++) {
      const slot = blockData.slots[i];
      if (slot) {
        // Spawn item with correct count
        const count = slot.count || 1;
        const spawnStack = new ItemStack(slot.item, count);
        block.dimension.spawnItem(spawnStack, { x: block.location.x + 0.5, y: block.location.y + 1.1, z: block.location.z + 0.5 });

        checkShortOrderCook(player, slot.item);
        removePlacedEntity(block, "breakfast:slot_" + i);
        blockData.slots[i] = null;
        
        // Clean up block data if completely empty
        const isStillOccupied = blockData.slots.some(s => s !== null);
        saveBlockData(block, isStillOccupied ? blockData : null);

        block.dimension.playSound("random.pop", block.location);
        player.onScreenDisplay.setActionBar("Retrieved item from slot " + (i + 1));
        return;
      }
    }
    player.onScreenDisplay.setActionBar("Griddle is empty. Hold cookable items to place.");
    return;
  }

  // Case 2: Holding a cookable item -> Place it on the griddle
  if (itemInHand && GRIDDLE_RECIPES[itemInHand.typeId]) {
    // Find first empty slot
    let placedIndex = -1;
    for (let i = 0; i < 4; i++) {
      if (!blockData.slots[i]) {
        placedIndex = i;
        break;
      }
    }

    if (placedIndex !== -1) {
      blockData.slots[placedIndex] = {
        item: itemInHand.typeId,
        progress: 0,
        count: 1
      };
      saveBlockData(block, blockData);
      
      const offsets = getGriddleSlotOffsets(placedIndex);
      updatePlacedEntity(block, "breakfast:slot_" + placedIndex, itemInHand.typeId, 1.01, offsets.x, offsets.z);

      // Handle item consumption and returns
      if (itemInHand.typeId === "minecraft:water_bucket" || itemInHand.typeId === "minecraft:milk_bucket") {
        const emptyBucket = new ItemStack("minecraft:bucket", 1);
        container.setItem(selectedIndex, emptyBucket);
      } else {
        if (itemInHand.amount > 1) {
          itemInHand.amount -= 1;
          container.setItem(selectedIndex, itemInHand);
        } else {
          container.setItem(selectedIndex, undefined);
        }
      }

      block.dimension.playSound("random.pop", block.location);
      player.onScreenDisplay.setActionBar("Placed " + itemInHand.typeId.split(":")[1] + " in slot " + (placedIndex + 1));
    } else {
      player.onScreenDisplay.setActionBar("Griddle is full!");
    }
    return;
  }

  // Case 3: Holding a non-cookable item -> Retrieve first COOKED item if any exists
  for (let i = 0; i < 4; i++) {
    const slot = blockData.slots[i];
    if (slot && !GRIDDLE_RECIPES[slot.item]) {
      // Cooked item found -> retrieve it!
      const count = slot.count || 1;
      const spawnStack = new ItemStack(slot.item, count);
      block.dimension.spawnItem(spawnStack, { x: block.location.x + 0.5, y: block.location.y + 1.1, z: block.location.z + 0.5 });

      checkShortOrderCook(player, slot.item);
      removePlacedEntity(block, "breakfast:slot_" + i);
      blockData.slots[i] = null;
      
      const isStillOccupied = blockData.slots.some(s => s !== null);
      saveBlockData(block, isStillOccupied ? blockData : null);

      block.dimension.playSound("random.pop", block.location);
      player.onScreenDisplay.setActionBar("Retrieved cooked " + slot.item.split(":")[1] + " from slot " + (i + 1));
      return;
    }
  }

  // Case 4: Holding a non-cookable item and no cooked items exist -> Show warning
  player.onScreenDisplay.setActionBar("Cannot cook this item on the griddle");
}

// Tick handler to cook items on Griddle
function handleGriddleTick(event) {
  const { block } = event;

  // Deal damage to entities standing on top of the griddle
  dealGriddleBurnDamage(block);

  const blockData = getBlockData(block);
  if (!blockData || !blockData.slots) return;

  let dataChanged = false;
  let hasItems = false;

  for (let i = 0; i < 4; i++) {
    const slot = blockData.slots[i];
    if (slot) {
      hasItems = true;
      const recipe = GRIDDLE_RECIPES[slot.item];
      if (recipe) {
        slot.progress += 1;
        dataChanged = true;

        // Spawn cooking steam/smoke particle
        if (Math.random() < 0.4) {
          const offsets = getGriddleSlotOffsets(i);
          const pLoc = {
            x: block.location.x + 0.5 + offsets.x,
            y: block.location.y + 1.1,
            z: block.location.z + 0.5 + offsets.z
          };
          try {
            block.dimension.spawnParticle("minecraft:campfire_smoke_particle", pLoc);
          } catch (pe) {}
        }

        // Cook completed
        if (slot.progress >= recipe.cookTime) {
          slot.item = recipe.output;
          slot.count = recipe.count || 1;
          slot.progress = 0; // reset progress
          
          block.dimension.playSound("random.fizz", block.location);

          // Update texture on the visual entity
          try {
            const entities = block.dimension.getEntities({
              type: "breakfast:placed_item",
              location: { x: block.location.x + 0.5, y: block.location.y + 0.5, z: block.location.z + 0.5 },
              maxDistance: 1.2
            });
            for (const ent of entities) {
              if (ent.hasTag("breakfast:slot_" + i)) {
                ent.setProperty("breakfast:item_variant", getVariantFromItem(recipe.output));
                break;
              }
            }
          } catch (e) {
            console.warn("[Breakfast] Error updating griddle item texture: " + e);
          }
        } else {
          // Play crackle sound occasionally
          if (Math.random() < 0.6) {
            block.dimension.playSound("block.campfire.crackle", block.location);
          }
        }
      }
    }
  }

  // Clean up if no items left
  if (!hasItems) {
    saveBlockData(block, null);
  } else if (dataChanged) {
    saveBlockData(block, blockData);
  }
}

function dealGriddleBurnDamage(block) {
  try {
    const topLoc = {
      x: block.location.x + 0.5,
      y: block.location.y + 1.2,
      z: block.location.z + 0.5
    };
    const entities = block.dimension.getEntities({
      location: topLoc,
      maxDistance: 0.8
    });
    
    for (const entity of entities) {
      if (entity.typeId === "breakfast:placed_item") continue;
      if (entity.typeId === "minecraft:item") continue;
      
      const health = entity.getComponent("minecraft:health");
      if (health) {
        entity.applyDamage(1, { cause: "fire" });
      }
    }
  } catch (err) {
    console.warn("[Breakfast] Error in dealGriddleBurnDamage: " + err);
  }
}

function handleGriddleStepOn(event) {
  const { entity } = event;
  if (!entity) return;
  
  if (entity.typeId === "breakfast:placed_item") return;
  if (entity.typeId === "minecraft:item") return;

  try {
    const health = entity.getComponent("minecraft:health");
    if (health) {
      entity.applyDamage(1, { cause: "fire" });
    }
  } catch (err) {
    console.warn("[Breakfast] Error in handleGriddleStepOn: " + err);
  }
}

// ----------------------------------------------------
// Custom Item Consumption Logic
// ----------------------------------------------------
world.afterEvents.itemCompleteUse.subscribe((event) => {
  const { itemStack, source: player } = event;
  if (!player || !itemStack) return;

  if (itemStack.typeId === "breakfast:miners_skillet") {
    try {
      // Remove Mining Fatigue
      player.removeEffect("mining_fatigue");

      // Grant Haste I for 90 seconds (1800 ticks)
      player.addEffect("haste", 1800, { amplifier: 0 });

      player.onScreenDisplay.setActionBar("Mining Fatigue cleared!");

      // Award achievement
      awardAchievement(player, "miners_breakfast", "Miner's Breakfast", "Consume a Miner's Skillet");
    } catch (err) {
      console.warn("[Breakfast] Error applying Miner's Skillet effects: " + err);
    }
  }

  if (itemStack.typeId === "breakfast:nether_fungi_omelet") {
    try {
      if (player.dimension.id === "minecraft:the_nether") {
        awardAchievement(player, "nether_brunch", "Nether Brunch", "Consume a Nether Fungi Omelet in the Nether");
      }
    } catch (err) {
      console.warn("[Breakfast] Error checking Nether Brunch achievement: " + err);
    }
  }
});

// Clean up and drop contents when Griddle or Butcher Block is broken
function handleBlockBreak(location, dimension, blockTypeId, brokenBlockPermutation) {
  try {
    const key = `${dimension.id}:${location.x},${location.y},${location.z}`;
    const globalData = getGlobalData();
    const blockData = globalData[key];
    
    if (blockData) {
      if (blockTypeId === "breakfast:butcher_block" && blockData.placedItem) {
        const itemStack = new ItemStack(blockData.placedItem, 1);
        dimension.spawnItem(itemStack, { x: location.x + 0.5, y: location.y + 0.5, z: location.z + 0.5 });
      } else if (blockTypeId === "breakfast:griddle" && blockData.slots) {
        for (let i = 0; i < 4; i++) {
          const slot = blockData.slots[i];
          if (slot) {
            const count = slot.count || 1;
            const itemStack = new ItemStack(slot.item, count);
            dimension.spawnItem(itemStack, { x: location.x + 0.5, y: location.y + 0.5, z: location.z + 0.5 });
          }
        }
      } else if (blockTypeId === "breakfast:herb_pot" && blockData.herbType) {
        let dropItem = "";
        if (blockData.stage < 3) {
          dropItem = `breakfast:${blockData.herbType}_seeds`;
        } else {
          dropItem = `breakfast:herb_${blockData.herbType}`;
        }
        dimension.spawnItem(new ItemStack(dropItem, 1), { x: location.x + 0.5, y: location.y + 0.5, z: location.z + 0.5 });
      }
      
      // Remove data
      delete globalData[key];
      saveGlobalData(globalData);
    }
    
    // Crop block breaking drops
    if (blockTypeId.startsWith("breakfast:") && blockTypeId.endsWith("_crop")) {
      const stage = brokenBlockPermutation ? brokenBlockPermutation.getState("breakfast:growth_stage") : 0;
      let seeds = "";
      let cropItem = "";
      let minCrop = 1, maxCrop = 1;
      
      if (blockTypeId === "breakfast:onion_crop") {
        seeds = "breakfast:onion_seeds";
        cropItem = "breakfast:onion";
      } else if (blockTypeId === "breakfast:tomato_crop") {
        seeds = "breakfast:tomato_seeds";
        cropItem = "breakfast:tomato";
        // Recover trellis
        try {
          const below = dimension.getBlock({ x: location.x, y: location.y - 1, z: location.z });
          if (below && below.typeId === "breakfast:tomato_crop") {
            const trellisStack = new ItemStack("breakfast:tomato_trellis", 1);
            dimension.spawnItem(trellisStack, { x: location.x + 0.5, y: location.y + 0.5, z: location.z + 0.5 });
          }
        } catch (e) {}
      } else if (blockTypeId === "breakfast:pepper_crop") {
        seeds = "breakfast:pepper_seeds";
        cropItem = "breakfast:pepper";
      } else if (blockTypeId === "breakfast:spinach_crop") {
        seeds = "breakfast:spinach_seeds";
        cropItem = "breakfast:spinach";
        minCrop = 1; maxCrop = 2;
      } else if (blockTypeId.startsWith("breakfast:herb_crop_")) {
        const herbType = blockTypeId.replace("breakfast:herb_crop_", "");
        seeds = `breakfast:${herbType}_seeds`;
        cropItem = `breakfast:herb_${herbType}`;
      }
      
      if (stage < 3) {
        if (seeds) {
          dimension.spawnItem(new ItemStack(seeds, 1), { x: location.x + 0.5, y: location.y + 0.5, z: location.z + 0.5 });
        }
      } else {
        if (cropItem) {
          const count = minCrop + Math.floor(Math.random() * (maxCrop - minCrop + 1));
          dimension.spawnItem(new ItemStack(cropItem, count), { x: location.x + 0.5, y: location.y + 0.5, z: location.z + 0.5 });
        }
        if (seeds) {
          const seedCount = Math.random() < 0.5 ? 2 : 1;
          dimension.spawnItem(new ItemStack(seeds, seedCount), { x: location.x + 0.5, y: location.y + 0.5, z: location.z + 0.5 });
        }
      }
    }
    
    // Clean up entities
    const searchLoc = { x: location.x + 0.5, y: location.y + 0.5, z: location.z + 0.5 };
    const entities = dimension.getEntities({
      type: "breakfast:placed_item",
      location: searchLoc,
      maxDistance: 1.2
    });
    for (const ent of entities) {
      ent.remove();
    }
  } catch (err) {
    console.warn("[Breakfast] Error in handleBlockBreak: " + err);
  }
}

// Global after events for block breaks
world.afterEvents.playerBreakBlock.subscribe((event) => {
  const { block, brokenBlockPermutation, dimension } = event;
  const blockId = brokenBlockPermutation.type.id;
  if (blockId.startsWith("breakfast:")) {
    handleBlockBreak(block.location, dimension, blockId, brokenBlockPermutation);
  }
});

world.afterEvents.blockExplode.subscribe((event) => {
  const { block, explodedBlockPermutation, dimension } = event;
  const blockId = explodedBlockPermutation.type.id;
  if (blockId.startsWith("breakfast:")) {
    handleBlockBreak(block.location, dimension, blockId, explodedBlockPermutation);
  }
});

// Workaround for Bedrock bug MCPE-188410 where custom foods ignore can_always_eat: false
world.beforeEvents.itemUse.subscribe((event) => {
  const { itemStack, source: player } = event;
  if (!player || !itemStack) return;

  const typeId = itemStack.typeId;
  if (typeId.startsWith("breakfast:")) {
    const nonFoods = [
      "breakfast:knife_flint",
      "breakfast:knife_copper",
      "breakfast:knife_iron",
      "breakfast:knife_diamond",
      "breakfast:lard",
      "breakfast:griddle",
      "breakfast:butcher_block"
    ];
    if (nonFoods.includes(typeId)) return;

    try {
      const hunger = player.getComponent("minecraft:player.hunger");
      if (hunger && hunger.currentValue >= 20) {
        event.cancel = true;
      }
    } catch (e) {
      console.warn("[Breakfast] Error in itemUse hunger check: " + e);
    }
  }
});

// ----------------------------------------------------
// Custom Achievements / Advancements System
// ----------------------------------------------------
function awardAchievement(player, id, name, description) {
  try {
    const propKey = `breakfast:ach_${id}`;
    if (player.getDynamicProperty(propKey)) return; // already awarded

    player.setDynamicProperty(propKey, true);

    // Broadcast message to everyone in the world
    world.sendMessage(`[§6Advancement§r] §a${player.name}§r has made the advancement [§a${name}§r]: ${description}`);

    // Play standard advancement sound
    player.dimension.playSound("ui.toast", player.location);

    // Show screen title/subtitle
    player.onScreenDisplay.setTitle("§aAdvancement Made!");
    player.onScreenDisplay.setSubtitle("§6" + name);
  } catch (err) {
    console.warn(`[Breakfast] Error awarding achievement ${id}: ` + err);
  }
}

// 1. Rise and Shine (Place Griddle)
world.afterEvents.playerPlaceBlock.subscribe((event) => {
  const { player, block } = event;
  if (!player || !block) return;

  if (block.typeId === "breakfast:griddle") {
    awardAchievement(player, "rise_and_shine", "Rise and Shine", "Craft and place a Griddle");
  }
});

// 2. Most Important Meal (Obtain Berry Pancakes)
system.runInterval(() => {
  try {
    for (const player of world.getAllPlayers()) {
      const inventory = player.getComponent("minecraft:inventory");
      if (inventory && inventory.container) {
        const container = inventory.container;
        for (let i = 0; i < container.size; i++) {
          const item = container.getItem(i);
          if (item && item.typeId === "breakfast:berry_pancakes") {
            awardAchievement(player, "most_important_meal", "Most Important Meal", "Obtain Berry Pancakes");
            break;
          }
        }
      }
    }
  } catch (err) {
    console.warn("[Breakfast] Error in pancakes achievement scan: " + err);
  }
}, 20);

// 3. Short Order Cook (Cook every ingredient)
const COOKED_INGREDIENTS = [
  "breakfast:cooked_bacon",
  "breakfast:fried_egg",
  "breakfast:toast",
  "breakfast:hash_browns",
  "breakfast:sausage"
];

function checkShortOrderCook(player, itemTypeId) {
  if (!COOKED_INGREDIENTS.includes(itemTypeId)) return;

  try {
    const cookedListStr = player.getDynamicProperty("breakfast:cooked_list") || "";
    const cookedList = cookedListStr ? cookedListStr.split(",") : [];
    
    if (!cookedList.includes(itemTypeId)) {
      cookedList.push(itemTypeId);
      player.setDynamicProperty("breakfast:cooked_list", cookedList.join(","));
      
      if (cookedList.length === 5) {
        awardAchievement(player, "short_order_cook", "Short Order Cook", "Cook every breakfast ingredient on the Griddle");
      }
    }
  } catch (err) {
    console.warn("[Breakfast] Error in checkShortOrderCook: " + err);
  }
}

// ----------------------------------------------------
// Custom Crop and Herb Pot Logic
// ----------------------------------------------------
function handleCropTick(event) {
  const { block } = event;
  try {
    const stage = block.permutation.getState("breakfast:growth_stage");
    if (stage === undefined) return;

    if (stage < 3) {
      const nextPerm = block.permutation.withState("breakfast:growth_stage", stage + 1);
      block.setPermutation(nextPerm);
    } else if (stage === 3 && block.typeId === "breakfast:tomato_crop") {
      const above = block.above();
      if (above && above.typeId === "breakfast:tomato_trellis") {
        above.setType("breakfast:tomato_crop");
        const perm = above.permutation.withState("breakfast:growth_stage", 0);
        above.setPermutation(perm);
        block.dimension.playSound("dig.wood", above.location);
      }
    }
  } catch (err) {
    console.warn("[Breakfast] Error in handleCropTick: " + err);
  }
}

function handleCropInteract(event) {
  const { block, player } = event;
  if (!player) return;

  try {
    const stage = block.permutation.getState("breakfast:growth_stage");
    if (stage === undefined) return;

    if (stage === 3 && (block.typeId === "breakfast:tomato_crop" || block.typeId === "breakfast:pepper_crop")) {
      const isTomato = block.typeId === "breakfast:tomato_crop";
      const harvestItem = isTomato ? "breakfast:tomato" : "breakfast:pepper";
      const count = 1 + Math.floor(Math.random() * 2);
      
      const stack = new ItemStack(harvestItem, count);
      block.dimension.spawnItem(stack, { x: block.location.x + 0.5, y: block.location.y + 0.5, z: block.location.z + 0.5 });
      
      const resetPerm = block.permutation.withState("breakfast:growth_stage", 1);
      block.setPermutation(resetPerm);
      
      block.dimension.playSound("item.sweet_berries.pick", block.location);
      player.onScreenDisplay.setActionBar("Harvested " + harvestItem.split(":")[1]);
    }
  } catch (err) {
    console.warn("[Breakfast] Error in handleCropInteract: " + err);
  }
}

function handleHerbPotInteract(event) {
  const { block, player } = event;
  if (!player) return;

  try {
    const inventory = player.getComponent("minecraft:inventory");
    if (!inventory || !inventory.container) return;

    const container = inventory.container;
    const selectedIndex = player.selectedSlotIndex;
    const itemInHand = container.getItem(selectedIndex);
    
    const blockData = getBlockData(block) || { herbType: null, stage: 0 };

    // Case 1: Empty hand -> Retrieve plant or seeds
    if (!itemInHand) {
      if (blockData.herbType) {
        let dropItem = "";
        if (blockData.stage < 3) {
          dropItem = `breakfast:${blockData.herbType}_seeds`;
        } else {
          dropItem = `breakfast:herb_${blockData.herbType}`;
        }
        
        const spawnStack = new ItemStack(dropItem, 1);
        block.dimension.spawnItem(spawnStack, { x: block.location.x + 0.5, y: block.location.y + 0.9, z: block.location.z + 0.5 });
        
        removePlacedEntity(block, "breakfast:herb_pot_plant");
        saveBlockData(block, null);
        block.dimension.playSound("random.pop", block.location);
        player.onScreenDisplay.setActionBar("Retrieved plant from pot");
      } else {
        player.onScreenDisplay.setActionBar("Pot is empty. Plant seeds to grow herbs!");
      }
      return;
    }

    // Case 2: Holding a Knife -> Shearing/harvesting mature herbs
    if (KNIVES.includes(itemInHand.typeId)) {
      if (!blockData.herbType) {
        player.onScreenDisplay.setActionBar("Pot is empty");
        return;
      }
      
      if (blockData.stage < 3) {
        player.onScreenDisplay.setActionBar("Herb is not fully grown yet");
        return;
      }

      const choppedItem = `breakfast:chopped_${blockData.herbType}`;
      const outputStack = new ItemStack(choppedItem, 2);
      block.dimension.spawnItem(outputStack, { x: block.location.x + 0.5, y: block.location.y + 0.9, z: block.location.z + 0.5 });

      const durability = itemInHand.getComponent("minecraft:durability");
      if (durability) {
        durability.damage += 1;
        if (durability.damage >= durability.maxDurability) {
          container.setItem(selectedIndex, undefined);
          block.dimension.playSound("random.break", block.location);
        } else {
          container.setItem(selectedIndex, itemInHand);
        }
      }

      blockData.stage = 1;
      saveBlockData(block, blockData);
      
      updatePlacedEntity(block, "breakfast:herb_pot_plant", `breakfast:${blockData.herbType}_seeds`, 0.5);

      block.dimension.playSound("mob.sheep.shear", block.location);
      player.onScreenDisplay.setActionBar("Harvested " + blockData.herbType);
      return;
    }

    // Case 3: Planting seeds
    if (itemInHand.typeId.endsWith("_seeds")) {
      const typeId = itemInHand.typeId;
      if (typeId.includes("rosemary") || typeId.includes("thyme") || typeId.includes("sage") || typeId.includes("oregano")) {
        if (blockData.herbType) {
          player.onScreenDisplay.setActionBar("Pot is already occupied");
          return;
        }

        const herbName = typeId.split(":")[1].replace("_seeds", "");
        blockData.herbType = herbName;
        blockData.stage = 0;
        saveBlockData(block, blockData);

        updatePlacedEntity(block, "breakfast:herb_pot_plant", typeId, 0.5);

        if (itemInHand.amount > 1) {
          itemInHand.amount -= 1;
          container.setItem(selectedIndex, itemInHand);
        } else {
          container.setItem(selectedIndex, undefined);
        }

        block.dimension.playSound("dig.sand", block.location);
        player.onScreenDisplay.setActionBar("Planted " + herbName + " seeds");
        return;
      }
    }

    player.onScreenDisplay.setActionBar("Hold seeds to plant, a knife to harvest, or use an empty hand.");
  } catch (err) {
    console.warn("[Breakfast] Error in handleHerbPotInteract: " + err);
  }
}

function handleHerbPotTick(event) {
  const { block } = event;
  try {
    const blockData = getBlockData(block);
    if (!blockData || !blockData.herbType) return;

    if (blockData.stage < 3) {
      blockData.stage += 1;
      saveBlockData(block, blockData);

      const itemVisual = blockData.stage >= 2 ? `breakfast:herb_${blockData.herbType}` : `breakfast:${blockData.herbType}_seeds`;
      updatePlacedEntity(block, "breakfast:herb_pot_plant", itemVisual, 0.5);

      const pLoc = { x: block.location.x + 0.5, y: block.location.y + 0.8, z: block.location.z + 0.5 };
      try {
        block.dimension.spawnParticle("minecraft:crop_growth_area_emitter", pLoc);
      } catch (e) {}
    }
  } catch (err) {
    console.warn("[Breakfast] Error in handleHerbPotTick: " + err);
  }
}
