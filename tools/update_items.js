const fs = require('fs');
const path = require('path');

const itemsDir = path.join(__dirname, '..', 'Breakfast_BP', 'items');
const files = fs.readdirSync(itemsDir);

files.forEach(file => {
  if (!file.endsWith('.json')) return;
  const filePath = path.join(itemsDir, file);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  
  const item = data['minecraft:item'];
  if (!item) return;
  
  const components = item.components;
  if (!components) return;
  
  if (components['minecraft:food']) {
    console.log(`Updating food item: ${file}`);
    
    // Remove legacy properties
    delete components['minecraft:use_duration'];
    
    // Add modern properties
    components['minecraft:use_animation'] = 'eat';
    
    const isFriedEgg = (file === 'fried_egg.json');
    components['minecraft:use_modifiers'] = {
      use_duration: isFriedEgg ? 0.8 : 1.6,
      movement_modifier: 0.35
    };
    
    // Explicitly enforce that food can only be eaten when the player is hungry
    components['minecraft:food']['can_always_eat'] = false;
    
    // Save updated JSON
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  }
});
console.log("All food items updated successfully!");
