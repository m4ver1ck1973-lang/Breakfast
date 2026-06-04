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
      }
    });
  } catch (err) {
    console.warn("[Breakfast] Error registering block components: " + err);
  }
});

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
  "minecraft:potato": { output: "breakfast:raw_hash_browns", count: 1 }
};

const GRIDDLE_RECIPES = {
  // Custom Add-on Cooking
  "breakfast:bacon": { output: "breakfast:cooked_bacon", cookTime: 10 },
  "minecraft:egg": { output: "breakfast:fried_egg", cookTime: 8 },
  "minecraft:bread": { output: "breakfast:toast", cookTime: 6 },
  "breakfast:raw_hash_browns": { output: "breakfast:hash_browns", cookTime: 12 },

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

  const inventory = player.getComponent("inventory");
  if (!inventory || !inventory.container) return;

  const container = inventory.container;
  const selectedIndex = player.selectedSlotIndex;
  const itemInHand = container.getItem(selectedIndex);
  const blockData = getBlockData(block) || { placedItem: null };

  // Case 1: Empty hand right click on a placed item -> retrieve it
  if (!itemInHand && blockData.placedItem) {
    const returnItem = new ItemStack(blockData.placedItem, 1);
    block.dimension.spawnItem(returnItem, { x: block.location.x + 0.5, y: block.location.y + 1.1, z: block.location.z + 0.5 });
    
    blockData.placedItem = null;
    saveBlockData(block, null);
    block.dimension.playSound("random.pop", block.location);
    player.onScreenDisplay.setActionBar("Retrieved item");
    return;
  }

  if (!itemInHand) return;

  // Case 2: Holding a Knife -> Cut the placed item
  if (itemInHand.typeId === "breakfast:knife") {
    if (!blockData.placedItem) {
      player.onScreenDisplay.setActionBar("Place a pork chop, ham, pork belly, or potato first");
      return;
    }

    const recipe = BUTCHER_RECIPES[blockData.placedItem];
    if (recipe) {
      // Spawn processed items
      const outputStack = new ItemStack(recipe.output, recipe.count);
      block.dimension.spawnItem(outputStack, { x: block.location.x + 0.5, y: block.location.y + 1.1, z: block.location.z + 0.5 });

      // Handle extra drops like Lard
      if (recipe.extra && Math.random() < recipe.extraChance) {
        const extraStack = new ItemStack(recipe.extra, 1);
        block.dimension.spawnItem(extraStack, { x: block.location.x + 0.5, y: block.location.y + 1.1, z: block.location.z + 0.5 });
      }

      // Damage the Knife tool
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

      // Clear the block and play effects
      blockData.placedItem = null;
      saveBlockData(block, null);
      
      block.dimension.playSound("mob.sheep.shear", block.location);
      player.onScreenDisplay.setActionBar("Processed!");
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
      player.onScreenDisplay.setActionBar("Hold a pork chop, ham, pork belly, or potato to place");
    }
  }
}

// ----------------------------------------------------
// Griddle Logic
// ----------------------------------------------------
function handleGriddleInteract(event) {
  const { block, player } = event;
  if (!player) return;

  const inventory = player.getComponent("inventory");
  if (!inventory || !inventory.container) return;

  const container = inventory.container;
  const selectedIndex = player.selectedSlotIndex;
  const itemInHand = container.getItem(selectedIndex);
  const blockData = getBlockData(block) || { slots: [null, null, null, null] };

  // Case 1: Player interacts with empty hand -> Retrieve cooked or placed item
  if (!itemInHand || !GRIDDLE_RECIPES[itemInHand.typeId]) {
    // Find the first occupied slot to retrieve
    for (let i = 0; i < 4; i++) {
      const slot = blockData.slots[i];
      if (slot) {
        // Spawn item
        const spawnStack = new ItemStack(slot.item, 1);
        block.dimension.spawnItem(spawnStack, { x: block.location.x + 0.5, y: block.location.y + 0.6, z: block.location.z + 0.5 });

        blockData.slots[i] = null;
        
        // Clean up block data if completely empty
        const isStillOccupied = blockData.slots.some(s => s !== null);
        saveBlockData(block, isStillOccupied ? blockData : null);

        block.dimension.playSound("random.pop", block.location);
        player.onScreenDisplay.setActionBar("Retrieved item from slot " + (i + 1));
        return;
      }
    }
    player.onScreenDisplay.setActionBar("Griddle is empty. Hold bacon, egg, bread, or raw hash browns to cook");
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
        progress: 0
      };
      saveBlockData(block, blockData);

      // Consume item from player
      if (itemInHand.amount > 1) {
        itemInHand.amount -= 1;
        container.setItem(selectedIndex, itemInHand);
      } else {
        container.setItem(selectedIndex, undefined);
      }

      block.dimension.playSound("random.pop", block.location);
      player.onScreenDisplay.setActionBar("Placed " + itemInHand.typeId.split(":")[1] + " in slot " + (placedIndex + 1));
    } else {
      player.onScreenDisplay.setActionBar("Griddle is full!");
    }
  }
}

// Tick handler to cook items on Griddle
function handleGriddleTick(event) {
  const { block } = event;
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

        // Cook completed
        if (slot.progress >= recipe.cookTime) {
          slot.item = recipe.output;
          slot.progress = 0; // reset progress
          
          block.dimension.playSound("random.fizz", block.location);
        } else {
          // Play crackle sound occasionally
          if (Math.random() < 0.3) {
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
    } catch (err) {
      console.warn("[Breakfast] Error applying Miner's Skillet effects: " + err);
    }
  }
});
