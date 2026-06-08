-- Save this file as 'herb_generator.lua' in your Aseprite scripts folder or tools folder
local sprite = app.activeSprite
if not sprite then
    return app.alert("Error: You must have a grayscale template sprite open in Aseprite!")
end

-- 1. PALETTE DEFINITIONS (Hex values for 🌿 Rosemary, 🍃 Oregano, 🌱 Thyme, 🦝 Sage)
local herbs = {
    rosemary = { "1A2F25", "2D523E", "467C60", "6DAA8A" },
    oregano  = { "272B13", "424923", "657239", "8E9E56" },
    thyme    = { "243317", "3E5727", "60843D", "8DB859" },
    sage     = { "2E3A36", "485A54", "6A827B", "93ADA6" }
}

-- Convert hex string to Aseprite Color
local function hexToColor(hexStr)
    local r = tonumber(hexStr:sub(1,2), 16)
    local g = tonumber(hexStr:sub(3,4), 16)
    local b = tonumber(hexStr:sub(5,6), 16)
    return Color{ r=r, g=g, b=b, a=255 }
end

-- Map template grayscale value to palette index (1 to 4)
local function getTemplateIndex(color)
    if color.alpha < 128 then return nil end
    local r = color.red
    local g = color.green
    local b = color.blue
    
    -- Preserve non-grayscale colors (like custom brown stems)
    local maxDiff = math.max(math.abs(r - g), math.abs(g - b), math.abs(b - r))
    if maxDiff > 15 then
        return nil
    end
    
    local v = (r + g + b) / 3
    if v < 40 then return 1       -- #000000 (Dark Shadow)
    elseif v < 120 then return 2   -- #555555 (Base Leaf)
    elseif v < 200 then return 3   -- #aaaaaa (Mid-Tone)
    else return 4                  -- #ffffff (Highlight)
    end
end

-- Swap colors of an image clone using the selected herb palette
local function generateHerbImage(srcImg, palette)
    local imgCopy = srcImg:clone()
    for pixel in imgCopy:pixels() do
        local pixelColor = Color(pixel())
        local targetIndex = getTemplateIndex(pixelColor)
        if targetIndex then
            local newColor = hexToColor(palette[targetIndex])
            pixel(newColor.pixel)
        end
    end
    return imgCopy
end

-- GUI Setup
local dlg = Dialog("Herb Texture Generator")
dlg:combobox{
    id = "mode",
    label = "Export Mode:",
    options = {
        "Crops (4 Frames -> 16 Block Textures)",
        "Items (3 Frames -> 12 Item Textures)",
        "Single Item (Active Frame -> 4 Item Textures)"
    }
}
dlg:combobox{
    id = "itemType",
    label = "Item Type (Single Item Mode only):",
    options = { "Raw (Sprig)", "Seeds", "Chopped" }
}
dlg:entry{
    id = "blocksPath",
    label = "Output Blocks Path:",
    text = "c:/Users/brett/Code/2026/Antigravity/Breakfast/Breakfast_RP/textures/blocks/"
}
dlg:entry{
    id = "itemsPath",
    label = "Output Items Path:",
    text = "c:/Users/brett/Code/2026/Antigravity/Breakfast/Breakfast_RP/textures/items/"
}

dlg:button{ id="ok", text="&Generate" }
dlg:button{ id="cancel", text="&Cancel" }
dlg:show()

local data = dlg.data
if not data.ok then return end

-- Process paths (ensure trailing slash)
local blocksPath = data.blocksPath
if not (blocksPath:sub(-1) == "/" or blocksPath:sub(-1) == "\\") then
    blocksPath = blocksPath .. "/"
end
local itemsPath = data.itemsPath
if not (itemsPath:sub(-1) == "/" or itemsPath:sub(-1) == "\\") then
    itemsPath = itemsPath .. "/"
end

-- Run Generator
app.transaction(function()
    local frames = sprite.frames
    
    if data.mode == "Crops (4 Frames -> 16 Block Textures)" then
        if #frames < 4 then
            return app.alert("Error: Active sprite must have at least 4 frames for Crops mode!")
        end
        
        local count = 0
        for herbName, palette in pairs(herbs) do
            for fIdx = 1, 4 do
                local cel = sprite:getFrameCel(frames[fIdx])
                if cel then
                    local herbImg = generateHerbImage(cel.image, palette)
                    local filename = string.format("%sherb_crop_%s_%d.png", blocksPath, herbName, fIdx - 1)
                    herbImg:saveAs(filename)
                    count = count + 1
                end
            end
        end
        app.alert("Success! Generated " .. count .. " crop textures in " .. blocksPath)
        
    elseif data.mode == "Items (3 Frames -> 12 Item Textures)" then
        if #frames < 3 then
            return app.alert("Error: Active sprite must have at least 3 frames for Items mode!")
        end
        
        local itemSuffixes = {
            [1] = "",          -- e.g. rosemary.png
            [2] = "_seeds",    -- e.g. rosemary_seeds.png
            [3] = "_chopped"   -- e.g. rosemary_chopped.png
        }
        
        local count = 0
        for herbName, palette in pairs(herbs) do
            for fIdx = 1, 3 do
                local cel = sprite:getFrameCel(frames[fIdx])
                if cel then
                    local herbImg = generateHerbImage(cel.image, palette)
                    local filename = string.format("%s%s%s.png", itemsPath, herbName, itemSuffixes[fIdx])
                    herbImg:saveAs(filename)
                    count = count + 1
                end
            end
        end
        app.alert("Success! Generated " .. count .. " item textures in " .. itemsPath)
        
    elseif data.mode == "Single Item (Active Frame -> 4 Item Textures)" then
        local activeFrame = app.activeFrame
        if not activeFrame then
            return app.alert("Error: No active frame selected!")
        end
        
        local suffix = ""
        if data.itemType == "Seeds" then
            suffix = "_seeds"
        elseif data.itemType == "Chopped" then
            suffix = "_chopped"
        end
        
        local count = 0
        for herbName, palette in pairs(herbs) do
            local cel = sprite:getFrameCel(activeFrame)
            if cel then
                local herbImg = generateHerbImage(cel.image, palette)
                local filename = string.format("%s%s%s.png", itemsPath, herbName, suffix)
                herbImg:saveAs(filename)
                count = count + 1
            else
                return app.alert("Error: Active frame contains no image/cel!")
            end
        end
        app.alert("Success! Generated " .. count .. " " .. data.itemType:lower() .. " textures in " .. itemsPath)
    end
end)
