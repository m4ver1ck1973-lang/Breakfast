import { world, system, ItemStack, GameMode } from "@minecraft/server";

// Crop Growth Balancing Configuration
const CROP_GROWTH_CHANCE = 0.05;      // 5% chance to advance growing stage (stages 0 -> 1 -> 2)
const FRUIT_REGROWTH_CHANCE = 0.03;   // 3% chance to regrow fruit (stage 2 -> 3)
const SPINACH_GROWTH_CHANCE = 0.02;   // 2% chance for spinach to grow onto second block
const TRELLIS_GROWTH_CHANCE = 0.02;   // 2% chance for tomato to grow onto trellis

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
  "breakfast:oregano_seeds": 77,
  "breakfast:omelet": 78,
  "breakfast:bacon_omelet": 79,
  "breakfast:ham_omelet": 80,
  "breakfast:mushroom_omelet": 81,
  "breakfast:nether_fungi_omelet": 82,
  "minecraft:sweet_berries": 83,
  "minecraft:glow_berries": 84,
  "minecraft:brown_mushroom": 85,
  "minecraft:red_mushroom": 86,
  "minecraft:crimson_fungus": 87,
  "minecraft:warped_fungus": 88,
  "breakfast:skillet": 89,
  "breakfast:miners_skillet": 90,
  "breakfast:carrot_slices": 91,
  "breakfast:grilled_carrot": 92,
  "breakfast:beetroot_slices": 93,
  "breakfast:grilled_beetroot": 94,
  "breakfast:brown_mushroom_slices": 95,
  "breakfast:grilled_brown_mushroom": 96,
  "breakfast:red_mushroom_slices": 97,
  "breakfast:grilled_red_mushroom": 98,
  "breakfast:crimson_fungus_slices": 99,
  "breakfast:grilled_crimson_fungus": 100,
  "breakfast:warped_fungus_slices": 101,
  "breakfast:grilled_warped_fungus": 102
};

function getVariantFromItem(itemTypeId) {
  return ITEM_TO_VARIANT[itemTypeId] || 0;
}

function getGriddleSlotOffsets(index) {
  switch (index) {
    case 0: return { x: 0.25, z: 0.25 };    // Slot 1 (SE)
    case 1: return { x: -0.25, z: 0.25 };   // Slot 2 (SW)
    case 2: return { x: 0.25, z: -0.25 };   // Slot 3 (NE)
    case 3: return { x: -0.25, z: -0.25 };  // Slot 4 (NW)
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
    let zShift = zOffset;
    if (itemTypeId === "minecraft:brown_mushroom" ||
        itemTypeId === "minecraft:red_mushroom" ||
        itemTypeId === "minecraft:crimson_fungus" ||
        itemTypeId === "minecraft:warped_fungus") {
      zShift -= 0.08;
    }

    const spawnLoc = {
      x: block.location.x + 0.5 + xOffset,
      y: block.location.y + yOffset,
      z: block.location.z + 0.5 + zShift
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
  "breakfast:rabbit_backstrap": { output: "breakfast:rabbit_sausage_raw", count: 2 },
  "minecraft:carrot": { output: "breakfast:carrot_slices", count: 3 },
  "minecraft:beetroot": { output: "breakfast:beetroot_slices", count: 3 },
  "minecraft:brown_mushroom": { output: "breakfast:brown_mushroom_slices", count: 3 },
  "minecraft:red_mushroom": { output: "breakfast:red_mushroom_slices", count: 3 },
  "minecraft:crimson_fungus": { output: "breakfast:crimson_fungus_slices", count: 3 },
  "minecraft:warped_fungus": { output: "breakfast:warped_fungus_slices", count: 3 }
};

const GRIDDLE_RECIPES = {
  // Custom Add-on Cooking
  "breakfast:bacon": { output: "breakfast:cooked_bacon", cookTime: 15 },
  "minecraft:egg": { output: "breakfast:fried_egg", cookTime: 12 },
  "breakfast:bread_slice": { output: "breakfast:toast", cookTime: 12 },
  "breakfast:raw_hash_browns": { output: "breakfast:hash_browns", cookTime: 12 },
  "breakfast:raw_sausage": { output: "breakfast:sausage", cookTime: 15 },
  "breakfast:onion_slices": { output: "breakfast:grilled_onion", cookTime: 12 },
  "breakfast:tomato_slice": { output: "breakfast:grilled_tomato", cookTime: 12 },
  "breakfast:pepper_slices": { output: "breakfast:grilled_pepper", cookTime: 12 },
  "breakfast:steak_strips": { output: "breakfast:cooked_steak_strips", cookTime: 15 },
  "breakfast:mutton_strips": { output: "breakfast:cooked_mutton_strips", cookTime: 15 },
  "breakfast:rabbit_sausage_raw": { output: "breakfast:rabbit_sausage", cookTime: 15 },
  "minecraft:water_bucket": { output: "breakfast:salt", count: 3, cookTime: 15 },
  "minecraft:milk_bucket": { output: "breakfast:cheese_curds", count: 1, cookTime: 15 },
  "breakfast:carrot_slices": { output: "breakfast:grilled_carrot", cookTime: 12 },
  "breakfast:beetroot_slices": { output: "breakfast:grilled_beetroot", cookTime: 12 },
  "breakfast:brown_mushroom_slices": { output: "breakfast:grilled_brown_mushroom", cookTime: 12 },
  "breakfast:red_mushroom_slices": { output: "breakfast:grilled_red_mushroom", cookTime: 12 },
  "breakfast:crimson_fungus_slices": { output: "breakfast:grilled_crimson_fungus", cookTime: 12 },
  "breakfast:warped_fungus_slices": { output: "breakfast:grilled_warped_fungus", cookTime: 12 },

  // Omelet Fusion Outputs
  "breakfast:omelet": { output: "breakfast:omelet", cookTime: 30 },
  "breakfast:bacon_omelet": { output: "breakfast:bacon_omelet", cookTime: 30 },
  "breakfast:ham_omelet": { output: "breakfast:ham_omelet", cookTime: 30 },
  "breakfast:mushroom_omelet": { output: "breakfast:mushroom_omelet", cookTime: 30 },
  "breakfast:nether_fungi_omelet": { output: "breakfast:nether_fungi_omelet", cookTime: 30 },
  "breakfast:miners_skillet": { output: "breakfast:miners_skillet", cookTime: 30 },

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
const EGGS = ["minecraft:egg"];
const MEATS = [
  "breakfast:bacon", "breakfast:cooked_bacon", "breakfast:ham", "breakfast:sausage", "breakfast:raw_sausage",
  "minecraft:porkchop", "minecraft:cooked_porkchop", "minecraft:beef", "minecraft:cooked_beef",
  "minecraft:chicken", "minecraft:cooked_chicken", "minecraft:mutton", "minecraft:cooked_mutton",
  "minecraft:rabbit", "minecraft:cooked_rabbit"
];
const VEGGIES = [
  "breakfast:onion", "breakfast:onion_slices", "breakfast:pepper", "breakfast:pepper_slices",
  "breakfast:spinach", "breakfast:spinach_leaves", "minecraft:sweet_berries", "minecraft:glow_berries",
  "minecraft:brown_mushroom", "minecraft:red_mushroom", "breakfast:herb_rosemary",
  "breakfast:herb_thyme", "breakfast:herb_sage", "breakfast:herb_oregano",
  "minecraft:crimson_fungus", "minecraft:warped_fungus",
  "breakfast:carrot_slices", "breakfast:grilled_carrot", "breakfast:beetroot_slices", "breakfast:grilled_beetroot",
  "breakfast:brown_mushroom_slices", "breakfast:grilled_brown_mushroom", "breakfast:red_mushroom_slices", "breakfast:grilled_red_mushroom",
  "breakfast:crimson_fungus_slices", "breakfast:grilled_crimson_fungus", "breakfast:warped_fungus_slices", "breakfast:grilled_warped_fungus"
];

function isPlaceableOnGriddle(itemTypeId) {
  return GRIDDLE_RECIPES[itemTypeId] !== undefined ||
         EGGS.includes(itemTypeId) ||
         MEATS.includes(itemTypeId) ||
         VEGGIES.includes(itemTypeId) ||
         itemTypeId === "breakfast:skillet" ||
         itemTypeId === "breakfast:miners_skillet";
}

function placeItemInSlot(player, block, blockData, slotIndex, itemInHand, container, selectedIndex) {
  blockData.slots[slotIndex] = {
    item: itemInHand.typeId,
    progress: 0,
    count: 1
  };
  saveBlockData(block, blockData);
  
  const offsets = getGriddleSlotOffsets(slotIndex);
  updatePlacedEntity(block, "breakfast:slot_" + slotIndex, itemInHand.typeId, 1.01, offsets.x, offsets.z);

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
  player.onScreenDisplay.setActionBar("Placed " + itemInHand.typeId.split(":")[1] + " in slot " + (slotIndex + 1));

  // Check griddle recipe fusion
  checkGriddleRecipes(block, blockData);
}

function retrieveSlotItem(player, block, blockData, slotIndex) {
  const slot = blockData.slots[slotIndex];
  if (!slot) return;

  const count = slot.count || 1;
  const spawnStack = new ItemStack(slot.item, count);
  block.dimension.spawnItem(spawnStack, { x: block.location.x + 0.5, y: block.location.y + 1.1, z: block.location.z + 0.5 });

  checkShortOrderCook(player, slot.item);
  removePlacedEntity(block, "breakfast:slot_" + slotIndex);
  blockData.slots[slotIndex] = null;
  
  // Clean up block data if completely empty
  const isStillOccupied = blockData.slots.some(s => s !== null);
  saveBlockData(block, isStillOccupied ? blockData : null);

  block.dimension.playSound("random.pop", block.location);
  player.onScreenDisplay.setActionBar("Retrieved item from slot " + (slotIndex + 1));
}

function checkGriddleRecipes(block, blockData) {
  // Collect all non-null items on the griddle
  const presentItems = [];
  for (let i = 0; i < 4; i++) {
    if (blockData.slots[i]) {
      presentItems.push(blockData.slots[i].item);
    }
  }

  let outputOmelet = null;

  if (presentItems.length === 4) {
    // Check Miner's Skillet fusion: skillet + egg + bacon + potato/hash brown
    const hasSkillet = presentItems.includes("breakfast:skillet");
    const hasEgg = presentItems.includes("minecraft:egg") || presentItems.includes("breakfast:fried_egg");
    const hasBacon = presentItems.includes("breakfast:bacon") || presentItems.includes("breakfast:cooked_bacon");
    const hasPotato = presentItems.includes("breakfast:raw_hash_browns") || presentItems.includes("breakfast:hash_browns");
    
    if (hasSkillet && hasEgg && hasBacon && hasPotato) {
      outputOmelet = "breakfast:miners_skillet";
    }
  } else if (presentItems.length === 3) {
    const eggsCount = presentItems.filter(item => EGGS.includes(item)).length;
    const meatsCount = presentItems.filter(item => MEATS.includes(item)).length;
    const veggiesCount = presentItems.filter(item => VEGGIES.includes(item)).length;

    // 1. Nether Fungi Omelet: Egg + Crimson + Warped
    if (eggsCount === 1 && presentItems.includes("minecraft:crimson_fungus") && presentItems.includes("minecraft:warped_fungus")) {
      outputOmelet = "breakfast:nether_fungi_omelet";
    }
    // 2. Mushroom Omelet: Egg + Brown + Red
    else if (eggsCount === 1 && presentItems.includes("minecraft:brown_mushroom") && presentItems.includes("minecraft:red_mushroom")) {
      outputOmelet = "breakfast:mushroom_omelet";
    }
    // 3. Egg + Meat + Veggie/Mushroom/Berry combo
    else if (eggsCount === 1 && meatsCount === 1 && veggiesCount === 1) {
      const meat = presentItems.find(item => MEATS.includes(item));
      if (meat === "breakfast:bacon" || meat === "breakfast:cooked_bacon") {
        outputOmelet = "breakfast:bacon_omelet";
      } else if (meat === "breakfast:ham") {
        outputOmelet = "breakfast:ham_omelet";
      } else {
        outputOmelet = "breakfast:omelet";
      }
    }
  } else {
    return;
  }

  if (outputOmelet) {
    // Fuse ingredients!
    for (let i = 0; i < 4; i++) {
      blockData.slots[i] = null;
      removePlacedEntity(block, "breakfast:slot_" + i);
    }

    blockData.slots[0] = {
      item: outputOmelet,
      progress: 0,
      count: 1,
      isFusedCook: true
    };
    saveBlockData(block, blockData);

    // Render output visual in the center of the griddle
    updatePlacedEntity(block, "breakfast:slot_0", outputOmelet, 1.01, 0, 0);

    block.dimension.playSound("random.fizz", block.location);
    const pLoc = { x: block.location.x + 0.5, y: block.location.y + 1.1, z: block.location.z + 0.5 };
    try {
      block.dimension.spawnParticle("minecraft:campfire_smoke_particle", pLoc);
    } catch (e) {}
  }
}

function handleGriddleInteract(event) {
  const { block, player } = event;
  if (!player) return;

  const inventory = player.getComponent("minecraft:inventory");
  if (!inventory || !inventory.container) return;

  const container = inventory.container;
  const selectedIndex = player.selectedSlotIndex;
  const itemInHand = container.getItem(selectedIndex);
  const blockData = getBlockData(block) || { slots: [null, null, null, null] };

  const face = event.face;
  const faceLoc = event.faceLocation;
  
  let clickedSlot = -1;
  const faceStr = String(face);
  if ((faceStr === "Up" || faceStr === "up") && faceLoc) {
    const clickX = faceLoc.x;
    const clickZ = faceLoc.z;
    
    // Absolute coordinate mapping relative to block space:
    // NW corner is at x < 0.5, z < 0.5
    // NE corner is at x >= 0.5, z < 0.5
    // SW corner is at x < 0.5, z >= 0.5
    // SE corner is at x >= 0.5, z >= 0.5
    if (clickX < 0.5 && clickZ < 0.5) clickedSlot = 0;        // NW
    else if (clickX >= 0.5 && clickZ < 0.5) clickedSlot = 1;  // NE
    else if (clickX < 0.5 && clickZ >= 0.5) clickedSlot = 2;  // SW
    else if (clickX >= 0.5 && clickZ >= 0.5) clickedSlot = 3; // SE
  }

  if (itemInHand && isPlaceableOnGriddle(itemInHand.typeId)) {
    // Player is holding a griddle-placeable item
    if (clickedSlot === -1 || blockData.slots[clickedSlot] !== null) {
      if (clickedSlot !== -1 && blockData.slots[clickedSlot] !== null) {
        // Retrieve from the clicked slot
        retrieveSlotItem(player, block, blockData, clickedSlot);
      } else {
        // Fallback: place in first empty slot
        let emptyIndex = -1;
        for (let i = 0; i < 4; i++) {
          if (!blockData.slots[i]) {
            emptyIndex = i;
            break;
          }
        }
        if (emptyIndex !== -1) {
          placeItemInSlot(player, block, blockData, emptyIndex, itemInHand, container, selectedIndex);
        } else {
          player.onScreenDisplay.setActionBar("Griddle is full!");
        }
      }
    } else {
      // Place in targeted slot
      placeItemInSlot(player, block, blockData, clickedSlot, itemInHand, container, selectedIndex);
    }
  } else {
    // Player holding non-cookable item or empty hand -> Retrieve
    if (clickedSlot === -1) {
      // Fallback: retrieve first occupied slot
      let occupiedIndex = -1;
      for (let i = 0; i < 4; i++) {
        if (blockData.slots[i]) {
          occupiedIndex = i;
          break;
        }
      }
      if (occupiedIndex !== -1) {
        retrieveSlotItem(player, block, blockData, occupiedIndex);
      } else {
        player.onScreenDisplay.setActionBar("Griddle is empty. Hold cookable items to place.");
      }
    } else {
      if (blockData.slots[clickedSlot]) {
        retrieveSlotItem(player, block, blockData, clickedSlot);
      } else {
        player.onScreenDisplay.setActionBar("Slot " + (clickedSlot + 1) + " is empty.");
      }
    }
  }
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
          const isOmelet = slot.item.includes("omelet");
          const xOff = isOmelet ? 0 : offsets.x;
          const zOff = isOmelet ? 0 : offsets.z;
          const pLoc = {
            x: block.location.x + 0.5 + xOff,
            y: block.location.y + 1.1,
            z: block.location.z + 0.5 + zOff
          };
          try {
            block.dimension.spawnParticle("minecraft:campfire_smoke_particle", pLoc);
          } catch (pe) {}
        }

        // Cook completed -> Campfire-style eject!
        if (slot.progress >= recipe.cookTime) {
          const count = slot.count || 1;
          const spawnLoc = {
            x: block.location.x + 0.5 + (Math.random() * 0.2 - 0.1),
            y: block.location.y + 1.2,
            z: block.location.z + 0.5 + (Math.random() * 0.2 - 0.1)
          };
          try {
            const cookedStack = new ItemStack(recipe.output, count);
            block.dimension.spawnItem(cookedStack, spawnLoc);
          } catch (err) {
            console.warn("[Breakfast] Error spawning cooked item: " + err);
          }

          block.dimension.playSound("random.pop", block.location);
          block.dimension.playSound("random.fizz", block.location);

          // Clear visual placed item and slot data
          removePlacedEntity(block, "breakfast:slot_" + i);
          blockData.slots[i] = null;
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

// Helper to drop items for a crop block based on its permutation
function dropCropItems(dimension, location, blockTypeId, permutation) {
  try {
    const stageState = permutation ? permutation.getState("breakfast:growth_stage") : undefined;
    const stage = (typeof stageState === "number") ? stageState : 0;
    let seeds = "";
    let cropItem = "";
    let minCrop = 1, maxCrop = 1;
    
    if (blockTypeId === "breakfast:onion_crop") {
      seeds = "breakfast:onion_seeds";
      cropItem = "breakfast:onion";
    } else if (blockTypeId === "breakfast:tomato_crop") {
      seeds = "breakfast:tomato_seeds";
      cropItem = "breakfast:tomato";
      // Recover trellis if it was climbing
      const isClimbingState = permutation ? permutation.getState("breakfast:is_climbing") : undefined;
      if (isClimbingState === true) {
        const trellisStack = new ItemStack("breakfast:tomato_trellis", 1);
        dimension.spawnItem(trellisStack, { x: location.x + 0.5, y: location.y + 0.5, z: location.z + 0.5 });
      }
    } else if (blockTypeId === "breakfast:pepper_crop") {
      seeds = "breakfast:pepper_seeds";
      cropItem = "breakfast:pepper";
    } else if (blockTypeId === "breakfast:spinach_crop") {
      let isTop = false;
      try {
        const below = dimension.getBlock({ x: location.x, y: location.y - 1, z: location.z });
        if (below && below.typeId === "breakfast:spinach_crop") {
          isTop = true;
        }
      } catch (e) {}
      
      if (isTop) {
        seeds = "";
      } else {
        seeds = "breakfast:spinach_seeds";
      }
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
  } catch (err) {
    console.warn("[Breakfast] Error in dropCropItems: " + err);
  }
}

// Helper to recursively break crops and drop items above a given location
function checkAndBreakCropAbove(location, dimension) {
  try {
    let currentLoc = { x: location.x, y: location.y + 1, z: location.z };
    while (true) {
      const blockAbove = dimension.getBlock(currentLoc);
      if (!blockAbove) break;
      
      const blockAboveId = blockAbove.typeId;
      if (blockAboveId.startsWith("breakfast:") && (blockAboveId.endsWith("_crop") || blockAboveId.startsWith("breakfast:herb_crop_"))) {
        const perm = blockAbove.permutation;
        // Break the crop block and drop its items
        dropCropItems(dimension, currentLoc, blockAboveId, perm);
        blockAbove.setType("minecraft:air");
        
        // Clean up entities at that location
        const searchLoc = { x: currentLoc.x + 0.5, y: currentLoc.y + 0.5, z: currentLoc.z + 0.5 };
        const entities = dimension.getEntities({
          type: "breakfast:placed_item",
          location: searchLoc,
          maxDistance: 1.2
        });
        for (const ent of entities) {
          ent.remove();
        }
        
        // Move Y up
        currentLoc.y += 1;
      } else {
        break;
      }
    }
  } catch (err) {
    console.warn("[Breakfast] Error in checkAndBreakCropAbove: " + err);
  }
}

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
    if (blockTypeId.startsWith("breakfast:") && (blockTypeId.endsWith("_crop") || blockTypeId.startsWith("breakfast:herb_crop_"))) {
      dropCropItems(dimension, location, blockTypeId, brokenBlockPermutation);
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

const CUSTOM_SEEDS = [
  "breakfast:onion_seeds",
  "breakfast:tomato_seeds",
  "breakfast:pepper_seeds",
  "breakfast:spinach_seeds",
  "breakfast:rosemary_seeds",
  "breakfast:thyme_seeds",
  "breakfast:sage_seeds",
  "breakfast:oregano_seeds"
];

// Helper to determine drop chance based on tool
function getSeedDropChance(toolTypeId) {
  if (!KNIVES.includes(toolTypeId)) {
    return 0.0;
  }
  // Boosted rates for testing (temporary)
  const isBoosted = true;
  if (isBoosted) {
    if (toolTypeId === "breakfast:knife_diamond") return 0.70;
    if (toolTypeId === "breakfast:knife_iron") return 0.50;
    if (toolTypeId === "breakfast:knife_copper") return 0.40;
    if (toolTypeId === "breakfast:knife_flint") return 0.30;
    return 0.0;
  } else {
    // Normal rates
    if (toolTypeId === "breakfast:knife_diamond") return 0.30;
    if (toolTypeId === "breakfast:knife_iron") return 0.20;
    if (toolTypeId === "breakfast:knife_copper") return 0.15;
    if (toolTypeId === "breakfast:knife_flint") return 0.10;
    return 0.0;
  }
}

function handleGrassBreak(event) {
  const { block, dimension, player } = event;
  if (!player) return;

  const tool = event.itemStackBeforeBreak;
  const toolTypeId = tool ? tool.typeId : "";
  
  // Calculate drop chance
  const chance = getSeedDropChance(toolTypeId);
  
  if (Math.random() < chance) {
    const seedId = CUSTOM_SEEDS[Math.floor(Math.random() * CUSTOM_SEEDS.length)];
    const spawnLoc = {
      x: block.location.x + 0.5,
      y: block.location.y + 0.5,
      z: block.location.z + 0.5
    };
    try {
      dimension.spawnItem(new ItemStack(seedId, 1), spawnLoc);
    } catch (err) {
      console.warn("[Breakfast] Error spawning custom seed drop: " + err);
    }
  }

  // Handle knife durability damage
  if (tool && KNIVES.includes(toolTypeId)) {
    const durability = tool.getComponent("minecraft:durability");
    if (durability) {
      durability.damage += 1;
      
      const inventory = player.getComponent("minecraft:inventory");
      if (inventory && inventory.container) {
        const container = inventory.container;
        const selectedIndex = player.selectedSlotIndex;
        
        if (durability.damage >= durability.maxDurability) {
          container.setItem(selectedIndex, undefined);
          dimension.playSound("random.break", block.location);
        } else {
          container.setItem(selectedIndex, tool);
        }
      }
    }
  }
}

// Global after events for block breaks
world.afterEvents.playerBreakBlock.subscribe((event) => {
  const { block, brokenBlockPermutation, dimension, player } = event;
  const blockId = brokenBlockPermutation.type.id;
  if (blockId.startsWith("breakfast:")) {
    handleBlockBreak(block.location, dimension, blockId, brokenBlockPermutation);
  }
  
  // Trigger cascading crop breaks above
  checkAndBreakCropAbove(block.location, dimension);

  if (player && (
    blockId === "minecraft:short_grass" ||
    blockId === "minecraft:tallgrass" ||
    blockId === "minecraft:tall_grass" ||
    blockId === "minecraft:fern" ||
    blockId === "minecraft:large_fern"
  )) {
    handleGrassBreak(event);
  }
});


world.afterEvents.blockExplode.subscribe((event) => {
  const { block, explodedBlockPermutation, dimension } = event;
  const blockId = explodedBlockPermutation.type.id;
  if (blockId.startsWith("breakfast:")) {
    handleBlockBreak(block.location, dimension, blockId, explodedBlockPermutation);
  }
  checkAndBreakCropAbove(block.location, dimension);
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

// 2. Most Important Meal (Obtain Berry Pancakes) & Short Order Cook
system.runInterval(() => {
  try {
    for (const player of world.getAllPlayers()) {
      const inventory = player.getComponent("minecraft:inventory");
      if (inventory && inventory.container) {
        const container = inventory.container;
        for (let i = 0; i < container.size; i++) {
          const item = container.getItem(i);
          if (item) {
            if (item.typeId === "breakfast:berry_pancakes") {
              awardAchievement(player, "most_important_meal", "Most Important Meal", "Obtain Berry Pancakes");
            }
            if (COOKED_INGREDIENTS.includes(item.typeId)) {
              checkShortOrderCook(player, item.typeId);
            }
          }
        }
      }
    }
  } catch (err) {
    console.warn("[Breakfast] Error in pancakes/short-order achievement scan: " + err);
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

    if (stage < 2) {
      // Growing plant structure
      if (Math.random() < CROP_GROWTH_CHANCE) {
        const nextPerm = block.permutation.withState("breakfast:growth_stage", stage + 1);
        block.setPermutation(nextPerm);
      }
    } else if (stage === 2) {
      // Regrowing fruit / mature stage
      if (Math.random() < FRUIT_REGROWTH_CHANCE) {
        const nextPerm = block.permutation.withState("breakfast:growth_stage", 3);
        block.setPermutation(nextPerm);
      }
    } else if (stage === 3) {
      if (block.typeId === "breakfast:tomato_crop") {
        // Enforce 3-block max height limit (base + 2 climbing blocks)
        let height = 1;
        let current = block.below();
        while (current && current.typeId === "breakfast:tomato_crop") {
          height++;
          current = current.below();
        }
        
        if (height < 3) {
          const above = block.above();
          if (above && above.typeId === "breakfast:tomato_trellis") {
            if (Math.random() < TRELLIS_GROWTH_CHANCE) {
              above.setType("breakfast:tomato_crop");
              const perm = above.permutation
                .withState("breakfast:growth_stage", 0)
                .withState("breakfast:is_climbing", true);
              above.setPermutation(perm);
              block.dimension.playSound("dig.wood", above.location);
            }
          }
        }
      } else if (block.typeId === "breakfast:spinach_crop") {
        const below = block.below();
        if (below && below.typeId === "minecraft:farmland") {
          const above = block.above();
          if (above && above.typeId === "minecraft:air") {
            if (Math.random() < SPINACH_GROWTH_CHANCE) {
              above.setType("breakfast:spinach_crop");
              const perm = above.permutation.withState("breakfast:growth_stage", 0);
              above.setPermutation(perm);
              block.dimension.playSound("dig.grass", above.location);
            }
          }
        }
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

    let heldItem = undefined;
    const inventory = player.getComponent("minecraft:inventory");
    if (inventory && inventory.container) {
      heldItem = inventory.container.getItem(player.selectedSlotIndex);
    }
    
    // 1. Prevent harvest when holding bone meal
    if (heldItem && heldItem.typeId === "minecraft:bone_meal") {
      return;
    }
    
    // 2. Tomato and Pepper harvest: drops fruit and resets stage to 2
    if (stage === 3 && (block.typeId === "breakfast:tomato_crop" || block.typeId === "breakfast:pepper_crop")) {
      const isTomato = block.typeId === "breakfast:tomato_crop";
      const harvestItem = isTomato ? "breakfast:tomato" : "breakfast:pepper";
      const count = 1 + Math.floor(Math.random() * 2);
      
      const stack = new ItemStack(harvestItem, count);
      block.dimension.spawnItem(stack, { x: block.location.x + 0.5, y: block.location.y + 0.5, z: block.location.z + 0.5 });
      
      const resetPerm = block.permutation.withState("breakfast:growth_stage", 2);
      block.setPermutation(resetPerm);
      
      block.dimension.playSound("item.sweet_berries.pick", block.location);
      player.onScreenDisplay.setActionBar("Harvested " + harvestItem.split(":")[1]);
      return;
    }

    // 2.2 Onion harvest: drops onion and resets stage to 0 (replants)
    if (stage === 3 && block.typeId === "breakfast:onion_crop") {
      const harvestItem = "breakfast:onion";
      const stack = new ItemStack(harvestItem, 1);
      block.dimension.spawnItem(stack, { x: block.location.x + 0.5, y: block.location.y + 0.5, z: block.location.z + 0.5 });
      
      const resetPerm = block.permutation.withState("breakfast:growth_stage", 0);
      block.setPermutation(resetPerm);
      
      if (Math.random() < 0.5) {
        const seedStack = new ItemStack("breakfast:onion_seeds", 1);
        block.dimension.spawnItem(seedStack, { x: block.location.x + 0.5, y: block.location.y + 0.5, z: block.location.z + 0.5 });
      }
      
      block.dimension.playSound("item.sweet_berries.pick", block.location);
      player.onScreenDisplay.setActionBar("Harvested and replanted onion");
      return;
    }
    
    // 2.5 Herb crop harvest: drops raw herb and resets stage to 2
    if (stage === 3 && block.typeId.startsWith("breakfast:herb_crop_")) {
      const herbName = block.typeId.replace("breakfast:herb_crop_", "");
      
      if (heldItem && KNIVES.includes(heldItem.typeId)) {
        // Knife harvest: drops 2 chopped herbs and damages the knife
        const harvestItem = `breakfast:chopped_${herbName}`;
        const stack = new ItemStack(harvestItem, 2);
        block.dimension.spawnItem(stack, { x: block.location.x + 0.5, y: block.location.y + 0.5, z: block.location.z + 0.5 });
        
        const durability = heldItem.getComponent("minecraft:durability");
        if (durability) {
          durability.damage += 1;
          if (durability.damage >= durability.maxDurability) {
            if (inventory && inventory.container) {
              inventory.container.setItem(player.selectedSlotIndex, undefined);
            }
            block.dimension.playSound("random.break", block.location);
          } else {
            if (inventory && inventory.container) {
              inventory.container.setItem(player.selectedSlotIndex, heldItem);
            }
          }
        }
        
        const resetPerm = block.permutation.withState("breakfast:growth_stage", 2);
        block.setPermutation(resetPerm);
        
        block.dimension.playSound("mob.sheep.shear", block.location);
        player.onScreenDisplay.setActionBar("Harvested chopped " + herbName);
        return;
      } else {
        // Hand/other harvest: drops 1 raw herb
        const harvestItem = `breakfast:herb_${herbName}`;
        const stack = new ItemStack(harvestItem, 1);
        block.dimension.spawnItem(stack, { x: block.location.x + 0.5, y: block.location.y + 0.5, z: block.location.z + 0.5 });
        
        const resetPerm = block.permutation.withState("breakfast:growth_stage", 2);
        block.setPermutation(resetPerm);
        
        block.dimension.playSound("item.sweet_berries.pick", block.location);
        player.onScreenDisplay.setActionBar("Harvested " + herbName);
        return;
      }
    }
    
    // 3. Spinach top-block harvest: shears or knife, sets to air, drops leaves
    if (block.typeId === "breakfast:spinach_crop" && stage === 3) {
      const below = block.below();
      if (below && below.typeId === "breakfast:spinach_crop") {
        if (heldItem && (heldItem.typeId === "minecraft:shears" || KNIVES.includes(heldItem.typeId))) {
          const count = 1 + Math.floor(Math.random() * 2);
          const stack = new ItemStack("breakfast:spinach", count);
          block.dimension.spawnItem(stack, { x: block.location.x + 0.5, y: block.location.y + 0.5, z: block.location.z + 0.5 });
          
          block.setType("minecraft:air");
          
          // Damage the tool
          const durability = heldItem.getComponent("minecraft:durability");
          if (durability) {
            durability.damage += 1;
            if (durability.damage >= durability.maxDurability) {
              if (inventory && inventory.container) {
                inventory.container.setItem(player.selectedSlotIndex, undefined);
              }
              block.dimension.playSound("random.break", block.location);
            } else {
              if (inventory && inventory.container) {
                inventory.container.setItem(player.selectedSlotIndex, heldItem);
              }
            }
          }
          
          block.dimension.playSound("mob.sheep.shear", block.location);
          player.onScreenDisplay.setActionBar("Harvested Spinach");
          return;
        }
      }
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
    }
  } catch (err) {
    console.warn("[Breakfast] Error in handleHerbPotTick: " + err);
  }
}

// Helper to safely consume a single item from the player's hand
function consumePlayerItem(player, item) {
  try {
    let isCreative = false;
    try {
      isCreative = (player.getGameMode() === "creative" || player.getGameMode() === GameMode.creative);
    } catch (e) {}

    if (!isCreative) {
      const inventory = player.getComponent("minecraft:inventory");
      if (inventory && inventory.container) {
        const container = inventory.container;
        const selectedIndex = player.selectedSlotIndex;
        const handItem = container.getItem(selectedIndex);
        if (handItem && handItem.typeId === item.typeId) {
          if (handItem.amount > 1) {
            handItem.amount -= 1;
            container.setItem(selectedIndex, handItem);
          } else {
            container.setItem(selectedIndex, undefined);
          }
        }
      }
    }
  } catch (err) {
    console.warn("[Breakfast] Error consuming item: " + err);
  }
}

// Global after events for block interactions (specifically bone meal)
world.afterEvents.playerInteractWithBlock.subscribe((event) => {
  const { player, block, beforeItemStack } = event;

  if (!player || !block || !beforeItemStack) return;

  if (beforeItemStack.typeId === "minecraft:bone_meal") {
    const blockId = block.typeId;

    // 1. Check if the block is a custom crop
    if (blockId.startsWith("breakfast:") && (blockId.endsWith("_crop") || blockId.startsWith("breakfast:herb_crop_"))) {
      try {
        const stage = block.permutation.getState("breakfast:growth_stage");
        if (stage !== undefined) {
          if (stage < 3) {
            // Advance growth stage
            const growth = 1 + (Math.random() < 0.5 ? 1 : 0);
            const newStage = Math.min(3, stage + growth);
            const newPerm = block.permutation.withState("breakfast:growth_stage", newStage);
            block.setPermutation(newPerm);

            // Play effects
            block.dimension.playSound("item.bone_meal.use", block.location);
            const pLoc = { x: block.location.x + 0.5, y: block.location.y + 0.5, z: block.location.z + 0.5 };
            try {
              block.dimension.spawnParticle("minecraft:crop_growth_area_emitter", pLoc);
            } catch (e) {}

            // Consume bone meal
            consumePlayerItem(player, beforeItemStack);
          } else if (stage === 3) {
            if (blockId === "breakfast:tomato_crop") {
              const above = block.above();
              if (above && above.typeId === "breakfast:tomato_trellis") {
                above.setType("breakfast:tomato_crop");
                const perm = above.permutation
                  .withState("breakfast:growth_stage", 0)
                  .withState("breakfast:is_climbing", true);
                above.setPermutation(perm);

                // Play effects
                above.dimension.playSound("dig.wood", above.location);
                above.dimension.playSound("item.bone_meal.use", above.location);
                const pLoc = { x: above.location.x + 0.5, y: above.location.y + 0.5, z: above.location.z + 0.5 };
                try {
                  above.dimension.spawnParticle("minecraft:crop_growth_area_emitter", pLoc);
                } catch (e) {}

                // Consume bone meal
                consumePlayerItem(player, beforeItemStack);
              }
            } else if (blockId === "breakfast:spinach_crop") {
              const below = block.below();
              if (below && below.typeId === "minecraft:farmland") {
                const above = block.above();
                if (above && above.typeId === "minecraft:air") {
                  above.setType("breakfast:spinach_crop");
                  const perm = above.permutation.withState("breakfast:growth_stage", 0);
                  above.setPermutation(perm);

                  // Play effects
                  above.dimension.playSound("dig.grass", above.location);
                  above.dimension.playSound("item.bone_meal.use", above.location);
                  const pLoc = { x: above.location.x + 0.5, y: above.location.y + 0.5, z: above.location.z + 0.5 };
                  try {
                    above.dimension.spawnParticle("minecraft:crop_growth_area_emitter", pLoc);
                  } catch (e) {}

                  // Consume bone meal
                  consumePlayerItem(player, beforeItemStack);
                }
              }
            }
          }
        }
      } catch (err) {
        console.warn("[Breakfast] Error in crop bonemeal: " + err);
      }
    }
    // 2. Check if the block is a custom herb pot
    else if (blockId === "breakfast:herb_pot") {
      try {
        const blockData = getBlockData(block);
        if (blockData && blockData.herbType && blockData.stage < 3) {
          const growth = 1 + (Math.random() < 0.5 ? 1 : 0);
          blockData.stage = Math.min(3, blockData.stage + growth);
          saveBlockData(block, blockData);

          const itemVisual = blockData.stage >= 2 ? `breakfast:herb_${blockData.herbType}` : `breakfast:${blockData.herbType}_seeds`;
          updatePlacedEntity(block, "breakfast:herb_pot_plant", itemVisual, 0.5);

          // Play effects
          block.dimension.playSound("item.bone_meal.use", block.location);
          const pLoc = { x: block.location.x + 0.5, y: block.location.y + 0.8, z: block.location.z + 0.5 };
          try {
            block.dimension.spawnParticle("minecraft:crop_growth_area_emitter", pLoc);
          } catch (e) {}

          // Consume bone meal
          consumePlayerItem(player, beforeItemStack);
        }
      } catch (err) {
        console.warn("[Breakfast] Error in herb pot bonemeal: " + err);
      }
    }
  }
});

// Global custom entity drops handler (knife-only drops with looting enchantment support)
world.afterEvents.entityDie.subscribe((event) => {
  const { deadEntity, damageSource } = event;
  if (!deadEntity || !damageSource) return;

  const attacker = damageSource.damagingEntity;
  if (!attacker || attacker.typeId !== "minecraft:player") return;

  try {
    const inventory = attacker.getComponent("minecraft:inventory");
    if (!inventory || !inventory.container) return;

    const heldItem = inventory.container.getItem(attacker.selectedSlotIndex);
    const toolTypeId = heldItem ? heldItem.typeId : "";

    if (!KNIVES.includes(toolTypeId)) return;

    // Determine custom drops based on entity type
    let drops = [];
    const typeId = deadEntity.typeId;

    if (typeId === "minecraft:cow") {
      drops.push("breakfast:beef_flank");
      drops.push("breakfast:suet");
    } else if (typeId === "minecraft:pig") {
      drops.push("breakfast:pork_belly");
    } else if (typeId === "minecraft:sheep") {
      drops.push("breakfast:mutton_ribs");
    } else if (typeId === "minecraft:chicken") {
      drops.push("breakfast:chicken_breast");
    } else if (typeId === "minecraft:rabbit") {
      drops.push("breakfast:rabbit_backstrap");
    }

    if (drops.length === 0) return;

    // Check looting level
    let lootingLevel = 0;
    try {
      const enchantable = heldItem.getComponent("minecraft:enchantable");
      if (enchantable) {
        const lootingEnchant = enchantable.getEnchantment("looting");
        if (lootingEnchant) {
          lootingLevel = lootingEnchant.level;
        }
      }
    } catch (e) {}

    const dimension = deadEntity.dimension;
    const location = deadEntity.location;

    for (const dropItem of drops) {
      let count = 0;
      if (Math.random() < 0.5) count++; // Base 50% chance for 1 drop
      
      // Bonus drops for looting level (each level gives a 50% chance for +1 item)
      for (let i = 0; i < lootingLevel; i++) {
        if (Math.random() < 0.5) count++;
      }

      if (count > 0) {
        const stack = new ItemStack(dropItem, count);
        dimension.spawnItem(stack, { x: location.x, y: location.y + 0.5, z: location.z });
      }
    }
  } catch (err) {
    console.warn("[Breakfast] Error in entityDie custom drops: " + err);
  }
});
