import os
import io
import json
import shutil
import argparse
from PIL import Image

# ==========================================
# Hybrid Procedural Pixel Art Drawing Code
# ==========================================

def create_canvas(width=16, height=16):
    return Image.new("RGBA", (width, height), (0, 0, 0, 0))

# Colors
C_TRANSPARENT = (0, 0, 0, 0)
C_BLACK = (20, 20, 20, 255)
C_DARK_GRAY = (60, 60, 60, 255)
C_MED_GRAY = (120, 120, 120, 255)
C_LIGHT_GRAY = (180, 180, 180, 255)
C_WHITE = (245, 245, 245, 255)
C_EGG_WHITE = (240, 240, 235, 255)
C_YOLK = (255, 200, 0, 255)
C_DARK_YOLK = (220, 150, 0, 255)
C_WOOD = (100, 65, 35, 255)
C_COPPER = (200, 100, 50, 255)
C_COPPER_SHINE = (240, 150, 90, 255)
C_DIAMOND = (0, 220, 220, 255)
C_DIAMOND_SHINE = (150, 255, 255, 255)
C_RAW_MEAT = (225, 90, 90, 255)
C_RAW_FAT = (245, 220, 220, 255)
C_COOKED_MEAT = (130, 45, 35, 255)
C_COOKED_FAT = (195, 120, 100, 255)
C_HAM_MEAT = (235, 125, 140, 255)
C_HAM_RIND = (125, 75, 45, 255)
C_SAUSAGE_COOKED = (110, 55, 30, 255)
C_SAUSAGE_RAW = (220, 130, 130, 255)
C_LARD = (250, 245, 240, 255)
C_LARD_SHADOW = (215, 215, 220, 255)
C_CRUST = (120, 70, 30, 255)
C_CRUMB = (245, 230, 195, 255)
C_TOAST_CRUST = (85, 45, 15, 255)
C_TOAST_CRUMB = (190, 140, 80, 255)
C_JAM = (200, 15, 45, 255)
C_GLOWBERRY = (255, 175, 0, 255)
C_GLOWBERRY_GREEN = (100, 180, 40, 255)
C_BUTTER = (255, 235, 100, 255)
C_SYRUP = (95, 45, 10, 255)
C_MUSHROOM = (140, 110, 85, 255)
C_CRIMSON_FUNGI = (200, 25, 60, 255)
C_WARPED_FUNGI = (0, 175, 155, 255)
C_BISCUIT = (210, 150, 80, 255)
C_GRAVY = (235, 230, 215, 255)

def draw_knife(color_blade, color_shine):
    img = create_canvas()
    # Draw handle (diagonal bottom-left)
    for i in range(5):
        img.putpixel((1 + i, 14 - i), C_WOOD)
        img.putpixel((1 + i, 13 - i), C_BLACK)
        img.putpixel((2 + i, 14 - i), C_BLACK)
    
    # Hand guard
    img.putpixel((5, 9), C_DARK_GRAY)
    img.putpixel((6, 10), C_DARK_GRAY)
    
    # Blade (diagonal top-right)
    for i in range(8):
        x, y = 6 + i, 9 - i
        img.putpixel((x, y), color_blade)
        img.putpixel((x, y - 1), C_BLACK)
        img.putpixel((x + 1, y), C_BLACK)
        if i > 2:
            img.putpixel((x, y + 1), color_shine)
    return img

def draw_bacon(is_cooked):
    img = create_canvas()
    # Wavy bacon strip diagonal
    c1 = C_COOKED_MEAT if is_cooked else C_RAW_MEAT
    c2 = C_COOKED_FAT if is_cooked else C_RAW_FAT
    c3 = C_BLACK
    
    pixels = [
        (2,13,c3), (3,13,c3), (3,12,c1), (4,12,c1), (4,11,c2), (5,11,c2),
        (5,10,c1), (6,10,c1), (6,9,c2), (7,9,c2), (7,8,c1), (8,8,c1),
        (8,7,c2), (9,7,c2), (9,6,c1), (10,6,c1), (10,5,c2), (11,5,c2),
        (11,4,c1), (12,4,c1), (12,3,c3), (13,3,c3)
    ]
    # Add width to the strip
    for x, y, c in pixels:
        img.putpixel((x, y), c)
        if c != c3:
            img.putpixel((x + 1, y), c)
            img.putpixel((x - 1, y + 1), c3)
            img.putpixel((x + 2, y - 1), c3)
    return img

def draw_pork_belly():
    img = create_canvas()
    # Slab shape
    for y in range(4, 12):
        for x in range(3, 13):
            # Outline
            if x == 3 or x == 12 or y == 4 or y == 11:
                img.putpixel((x, y), C_BLACK)
            else:
                # Layers
                if y == 5:
                    img.putpixel((x, y), C_CRUST)
                elif y in (6, 7):
                    img.putpixel((x, y), C_RAW_FAT)
                elif y == 8:
                    img.putpixel((x, y), C_RAW_MEAT)
                elif y == 9:
                    img.putpixel((x, y), C_RAW_FAT)
                else:
                    img.putpixel((x, y), C_RAW_MEAT)
    return img

def draw_ham():
    img = create_canvas()
    # Large rounded shape
    for x in range(2, 14):
        for y in range(3, 13):
            # Simple oval checks
            dx = (x - 7.5) / 5.5
            dy = (y - 7.5) / 4.5
            dist = dx*dx + dy*dy
            if dist <= 1.0:
                if dist > 0.85:
                    img.putpixel((x, y), C_BLACK)
                elif dist > 0.70:
                    img.putpixel((x, y), C_HAM_RIND)
                else:
                    img.putpixel((x, y), C_HAM_MEAT)
    # Add bone in center
    img.putpixel((7, 7), C_WHITE)
    img.putpixel((8, 7), C_LIGHT_GRAY)
    img.putpixel((7, 8), C_LIGHT_GRAY)
    return img

def draw_ground_pork():
    img = create_canvas()
    # Textured mound
    import random
    random.seed(42) # Deterministic
    for y in range(8, 14):
        for x in range(3, 13):
            # Mound shape
            dx = (x - 7.5) / 4.5
            dy = (y - 12.0) / 4.0
            dist = dx*dx + dy*dy
            if dist <= 1.0:
                if dist > 0.85:
                    img.putpixel((x, y), C_BLACK)
                else:
                    r = random.random()
                    if r < 0.4:
                        img.putpixel((x, y), C_RAW_MEAT)
                    elif r < 0.7:
                        img.putpixel((x, y), C_RAW_FAT)
                    else:
                        img.putpixel((x, y), (200, 70, 70, 255))
    return img

def draw_sausage(is_cooked):
    img = create_canvas()
    c = C_SAUSAGE_COOKED if is_cooked else C_SAUSAGE_RAW
    c_dark = C_BLACK
    # Simple sausage link
    for x in range(3, 13):
        y = int(8 + 2 * ( (x-7.5)/4.5 )**2)
        img.putpixel((x, y), c)
        img.putpixel((x, y-1), c_dark)
        img.putpixel((x, y+1), c_dark)
    img.putpixel((2, 9), c_dark)
    img.putpixel((13, 9), c_dark)
    return img

def draw_lard():
    img = create_canvas()
    # Cube shape
    for y in range(4, 12):
        for x in range(3, 13):
            if x == 3 or x == 12 or y == 4 or y == 11:
                img.putpixel((x, y), C_BLACK)
            else:
                # Top face lighter
                if y in (5, 6):
                    img.putpixel((x, y), C_LARD)
                else:
                    img.putpixel((x, y), C_LARD_SHADOW)
    return img

def draw_fried_egg():
    img = create_canvas()
    # White blob
    for x in range(2, 14):
        for y in range(2, 14):
            dx = (x - 7.5)/5.0
            dy = (y - 7.5)/5.0
            dist = dx*dx + dy*dy
            if dist <= 1.0:
                if dist > 0.85:
                    img.putpixel((x, y), C_BLACK)
                else:
                    img.putpixel((x, y), C_EGG_WHITE)
    # Yellow yolk
    for x in range(6, 9):
        for y in range(6, 9):
            img.putpixel((x, y), C_YOLK)
    img.putpixel((6, 6), C_DARK_YOLK)
    img.putpixel((8, 8), C_DARK_YOLK)
    return img

def draw_hash_browns(is_cooked):
    img = create_canvas()
    c = C_TOAST_CRUMB if is_cooked else C_WHITE
    c_shadow = C_TOAST_CRUST if is_cooked else C_LIGHT_GRAY
    # Oval patty
    for x in range(3, 13):
        for y in range(5, 11):
            dx = (x - 7.5)/4.5
            dy = (y - 7.5)/2.5
            dist = dx*dx + dy*dy
            if dist <= 1.0:
                if dist > 0.85:
                    img.putpixel((x, y), C_BLACK)
                else:
                    img.putpixel((x, y), c if (x+y)%2 == 0 else c_shadow)
    return img

def draw_bread_slice(style="bread"):
    img = create_canvas()
    # Slice shape
    crust = C_CRUST if style == "bread" else C_TOAST_CRUST
    crumb = C_CRUMB if style == "bread" else C_TOAST_CRUMB
    
    for y in range(3, 13):
        for x in range(3, 13):
            # Make top rounded
            if y == 3 and (x < 5 or x > 10):
                continue
            if y == 4 and (x < 4 or x > 11):
                continue
            
            # Border
            is_border = False
            if y == 3 or (y == 4 and (x in (4, 11))) or x == 3 or x == 12 or y == 12:
                is_border = True
                
            if is_border:
                img.putpixel((x, y), C_BLACK)
            elif y in (4, 5) or x == 4 or x == 11 or y == 11:
                img.putpixel((x, y), crust)
            else:
                img.putpixel((x, y), crumb)
                
    # Jam topping
    if style == "jam":
        for x in range(6, 10):
            for y in range(7, 10):
                img.putpixel((x, y), C_JAM)
    # Glowberry topping
    elif style == "glowberry":
        img.putpixel((6, 6), C_GLOWBERRY)
        img.putpixel((7, 6), C_GLOWBERRY_GREEN)
        img.putpixel((8, 8), C_GLOWBERRY)
        img.putpixel((9, 8), C_GLOWBERRY_GREEN)
        
    return img

def draw_pancakes():
    img = create_canvas()
    # Stack of pancakes
    # Draw lower pancake
    for y in range(8, 12):
        for x in range(2, 14):
            if (x-7.5)**2/5.5**2 + (y-9.5)**2/1.5**2 <= 1.0:
                img.putpixel((x, y), C_CRUST)
    # Middle pancake
    for y in range(6, 10):
        for x in range(2, 14):
            if (x-7.5)**2/5.5**2 + (y-7.5)**2/1.5**2 <= 1.0:
                img.putpixel((x, y), C_TOAST_CRUMB)
    # Outline & Butter
    for x in range(2, 14):
        img.putpixel((x, 11), C_BLACK)
        img.putpixel((x, 8), C_BLACK)
    # Butter cube
    for x in range(6, 9):
        for y in range(4, 7):
            img.putpixel((x, y), C_BUTTER)
    # Syrup lines
    img.putpixel((5, 6), C_SYRUP)
    img.putpixel((5, 7), C_SYRUP)
    img.putpixel((9, 6), C_SYRUP)
    img.putpixel((9, 7), C_SYRUP)
    
    # Berries
    img.putpixel((4, 8), (220, 20, 60, 255))
    img.putpixel((10, 8), (30, 80, 220, 255))
    return img

def draw_omelet(style="plain"):
    img = create_canvas()
    # Folded oval
    for x in range(2, 14):
        for y in range(4, 12):
            dx = (x - 7.5)/5.0
            dy = (y - 7.5)/3.5
            dist = dx*dx + dy*dy
            if dist <= 1.0:
                if dist > 0.85:
                    img.putpixel((x, y), C_BLACK)
                else:
                    img.putpixel((x, y), C_YOLK if (x+y)%3 != 0 else C_DARK_YOLK)
    # Ingredients on top
    if style == "mushroom":
        img.putpixel((5, 7), C_MUSHROOM)
        img.putpixel((9, 8), C_MUSHROOM)
    elif style == "bacon":
        img.putpixel((6, 6), C_COOKED_MEAT)
        img.putpixel((8, 8), C_COOKED_MEAT)
    elif style == "ham":
        img.putpixel((5, 7), C_HAM_MEAT)
        img.putpixel((9, 7), C_HAM_MEAT)
    elif style == "nether":
        img.putpixel((5, 7), C_CRIMSON_FUNGI)
        img.putpixel((6, 8), C_WARPED_FUNGI)
        img.putpixel((9, 6), C_WARPED_FUNGI)
    return img

def draw_biscuit():
    img = create_canvas()
    for x in range(3, 13):
        for y in range(4, 12):
            dx = (x - 7.5)/4.5
            dy = (y - 7.5)/3.5
            dist = dx*dx + dy*dy
            if dist <= 1.0:
                if dist > 0.85:
                    img.putpixel((x, y), C_BLACK)
                else:
                    img.putpixel((x, y), C_BISCUIT if (x+y)%2 == 0 else C_CRUMB)
    return img

def draw_biscuit_sandwich():
    img = create_canvas()
    # Top Bun
    for x in range(3, 13):
        for y in range(3, 6):
            img.putpixel((x, y), C_BISCUIT)
    # Patty
    for x in range(2, 14):
        img.putpixel((x, 7), C_SAUSAGE_COOKED)
        img.putpixel((x, 8), C_BLACK)
    # Egg
    for x in range(3, 13):
        img.putpixel((x, 9), C_YOLK)
    # Bottom Bun
    for x in range(3, 13):
        for y in range(10, 13):
            img.putpixel((x, y), C_BISCUIT)
    # Outline borders
    for x in range(3, 13):
        img.putpixel((x, 2), C_BLACK)
        img.putpixel((x, 13), C_BLACK)
    return img

def draw_breakfast_sandwich():
    img = create_canvas()
    # Toast layers
    # Top Toast
    for x in range(3, 13):
        img.putpixel((x, 3), C_TOAST_CRUST)
        img.putpixel((x, 4), C_TOAST_CRUMB)
    # Cheese (Orange)
    for x in range(2, 14):
        img.putpixel((x, 5), (255, 150, 0, 255))
    # Egg & Bacon
    for x in range(3, 13):
        img.putpixel((x, 6), C_YOLK)
        img.putpixel((x + 1, 7), C_COOKED_MEAT)
    # Bottom Toast
    for x in range(3, 13):
        img.putpixel((x, 8), C_TOAST_CRUMB)
        img.putpixel((x, 9), C_TOAST_CRUST)
    # Outer bounds black
    for x in range(2, 14):
        img.putpixel((x, 2), C_BLACK)
        img.putpixel((x, 10), C_BLACK)
    return img

def draw_biscuits_and_gravy():
    img = create_canvas()
    # Plate base
    for x in range(2, 14):
        img.putpixel((x, 12), C_BLACK)
        img.putpixel((x, 11), C_LIGHT_GRAY)
    # Biscuit mounds
    for x in range(4, 8):
        img.putpixel((x, 8), C_BISCUIT)
    for x in range(8, 12):
        img.putpixel((x, 8), C_BISCUIT)
    # Gravy layers
    for x in range(3, 13):
        for y in range(6, 11):
            if (x+y)%3 != 0 and y > 6:
                img.putpixel((x, y), C_GRAVY)
            elif y > 7:
                img.putpixel((x, y), C_SAUSAGE_COOKED) # Sausage bits in gravy
    # Outline gravy
    for x in range(3, 13):
        img.putpixel((x, 5), C_BLACK)
    return img

def draw_miners_skillet():
    img = create_canvas()
    # Skillet outline
    for x in range(2, 12):
        img.putpixel((x, 4), C_BLACK)
        img.putpixel((x, 12), C_BLACK)
    for y in range(4, 13):
        img.putpixel((1, y), C_BLACK)
        img.putpixel((12, y), C_BLACK)
    # Handle
    for i in range(4):
        img.putpixel((12 + i, 12 - i), C_BLACK)
    
    # Skillet contents (potatoes, eggs, bacon)
    # Eggs
    img.putpixel((4, 6), C_YOLK)
    img.putpixel((5, 6), C_EGG_WHITE)
    img.putpixel((4, 7), C_EGG_WHITE)
    
    # Potatoes (brown/yellow cubes)
    img.putpixel((8, 6), C_TOAST_CRUMB)
    img.putpixel((9, 7), C_TOAST_CRUMB)
    
    # Bacon / Sausage (dark red bits)
    img.putpixel((5, 9), C_COOKED_MEAT)
    img.putpixel((8, 9), C_SAUSAGE_COOKED)
    
    # Rest is dark skillet surface
    for x in range(2, 12):
        for y in range(5, 12):
            if img.getpixel((x, y)) == C_TRANSPARENT:
                img.putpixel((x, y), C_DARK_GRAY)
                
    return img

def draw_onion(style):
    img = create_canvas()
    c_skin = (225, 160, 100, 255)
    c_inside = (245, 240, 245, 255)
    c_purple = (180, 70, 140, 255)
    c_dark = C_BLACK
    if style == "raw":
        for x in range(3, 13):
            for y in range(4, 13):
                dx = (x - 7.5)/4.5
                dy = (y - 8.5)/4.0
                dist = dx*dx + dy*dy
                if dist <= 1.0:
                    if dist > 0.85:
                        img.putpixel((x, y), c_dark)
                    else:
                        img.putpixel((x, y), c_skin if (x+y)%2 == 0 else c_purple)
        img.putpixel((7, 13), c_dark)
        img.putpixel((8, 13), c_dark)
        img.putpixel((7, 3), (100, 180, 50, 255))
    elif style == "seeds":
        img.putpixel((5, 7), c_purple)
        img.putpixel((6, 6), c_dark)
        img.putpixel((9, 8), c_purple)
        img.putpixel((8, 9), c_dark)
    elif style == "slices":
        for x in range(3, 13):
            for y in range(3, 13):
                dx = (x - 7.5)/4.5
                dy = (y - 7.5)/4.5
                dist = dx*dx + dy*dy
                if dist <= 1.0:
                    if dist > 0.85:
                        img.putpixel((x, y), c_dark)
                    elif dist > 0.55:
                        img.putpixel((x, y), c_purple)
                    elif dist > 0.35:
                        img.putpixel((x, y), c_inside)
                    elif dist > 0.15:
                        img.putpixel((x, y), c_purple)
                    else:
                        img.putpixel((x, y), c_inside)
    elif style == "grilled":
        for x in range(3, 13):
            for y in range(3, 13):
                dx = (x - 7.5)/4.5
                dy = (y - 7.5)/4.5
                dist = dx*dx + dy*dy
                if dist <= 1.0:
                    if dist > 0.85:
                        img.putpixel((x, y), c_dark)
                    elif dist > 0.55:
                        img.putpixel((x, y), (130, 90, 50, 255))
                    elif dist > 0.35:
                        img.putpixel((x, y), (210, 170, 120, 255))
                    else:
                        img.putpixel((x, y), (130, 90, 50, 255))
    return img

def draw_tomato(style):
    img = create_canvas()
    c_red = (230, 30, 20, 255)
    c_dark_red = (160, 15, 10, 255)
    c_green = (60, 160, 40, 255)
    c_dark = C_BLACK
    if style == "raw":
        for x in range(3, 13):
            for y in range(4, 13):
                dx = (x - 7.5)/4.5
                dy = (y - 8.5)/4.0
                dist = dx*dx + dy*dy
                if dist <= 1.0:
                    if dist > 0.85:
                        img.putpixel((x, y), c_dark)
                    else:
                        img.putpixel((x, y), c_red if x > 6 else c_dark_red)
        img.putpixel((7, 3), c_green)
        img.putpixel((6, 3), c_dark)
        img.putpixel((8, 3), c_dark)
        img.putpixel((7, 4), c_green)
    elif style == "seeds":
        img.putpixel((5, 7), (220, 160, 40, 255))
        img.putpixel((6, 7), c_dark)
        img.putpixel((9, 8), (220, 160, 40, 255))
        img.putpixel((8, 8), c_dark)
    elif style == "slice":
        for x in range(3, 13):
            for y in range(3, 13):
                dx = (x - 7.5)/4.5
                dy = (y - 7.5)/4.5
                dist = dx*dx + dy*dy
                if dist <= 1.0:
                    if dist > 0.85:
                        img.putpixel((x, y), c_dark)
                    elif dist > 0.70:
                        img.putpixel((x, y), c_red)
                    else:
                        if abs(x - 7.5) < 1.0 or abs(y - 7.5) < 1.0:
                            img.putpixel((x, y), c_red)
                        else:
                            img.putpixel((x, y), (200, 150, 30, 255))
    elif style == "grilled":
        for x in range(3, 13):
            for y in range(3, 13):
                dx = (x - 7.5)/4.5
                dy = (y - 7.5)/4.5
                dist = dx*dx + dy*dy
                if dist <= 1.0:
                    if dist > 0.85:
                        img.putpixel((x, y), c_dark)
                    else:
                        if (x+y)%4 == 0:
                            img.putpixel((x, y), (50, 45, 45, 255))
                        else:
                            img.putpixel((x, y), c_dark_red)
    return img

def draw_pepper(style):
    img = create_canvas()
    c_green = (40, 160, 50, 255)
    c_dark_green = (20, 95, 30, 255)
    c_dark = C_BLACK
    if style == "raw":
        for x in range(3, 13):
            for y in range(4, 13):
                is_body = False
                if 4 <= x <= 11 and 5 <= y <= 11:
                    is_body = True
                elif (x in (3, 12)) and 6 <= y <= 10:
                    is_body = True
                elif (y in (4, 12)) and 5 <= x <= 10:
                    is_body = True
                
                if is_body:
                    if x in (3, 12) or y in (4, 12) or (x==4 and y==5) or (x==11 and y==5):
                        img.putpixel((x, y), c_dark)
                    else:
                        img.putpixel((x, y), c_green if x > 7 else c_dark_green)
        img.putpixel((7, 3), (85, 120, 50, 255))
        img.putpixel((7, 4), (85, 120, 50, 255))
    elif style == "seeds":
        img.putpixel((6, 7), (235, 235, 180, 255))
        img.putpixel((7, 6), c_dark)
        img.putpixel((8, 8), (235, 235, 180, 255))
    elif style == "slices":
        for x in range(3, 13):
            for y in range(3, 13):
                dx = (x - 7.5)/4.5
                dy = (y - 7.5)/4.5
                dist = dx*dx + dy*dy
                if dist <= 1.0:
                    if dist > 0.85:
                        img.putpixel((x, y), c_dark)
                    elif dist > 0.55:
                        img.putpixel((x, y), c_green)
                    elif dist > 0.40:
                        img.putpixel((x, y), c_dark)
    elif style == "grilled":
        for x in range(3, 13):
            for y in range(3, 13):
                dx = (x - 7.5)/4.5
                dy = (y - 7.5)/4.5
                dist = dx*dx + dy*dy
                if dist <= 1.0:
                    if dist > 0.85:
                        img.putpixel((x, y), c_dark)
                    elif dist > 0.55:
                        if (x+y)%3 == 0:
                            img.putpixel((x, y), (50, 45, 40, 255))
                        else:
                            img.putpixel((x, y), c_dark_green)
                    elif dist > 0.40:
                        img.putpixel((x, y), c_dark)
    return img

def draw_spinach(style):
    img = create_canvas()
    c_leaf = (46, 139, 87, 255)
    c_dark_leaf = (25, 90, 55, 255)
    c_dark = C_BLACK
    if style == "raw":
        for x in range(3, 13):
            for y in range(3, 13):
                dx = (x - 7.5)/4.5
                dy = (y - 7.5)/5.0 - 0.1 * (x - 7.5)
                dist = dx*dx + dy*dy
                if dist <= 0.8:
                    if dist > 0.65:
                        img.putpixel((x, y), c_dark)
                    else:
                        img.putpixel((x, y), c_leaf if y < 8 else c_dark_leaf)
        img.putpixel((7, 12), (100, 160, 80, 255))
        img.putpixel((8, 12), c_dark)
    elif style == "seeds":
        img.putpixel((6, 7), (120, 110, 80, 255))
        img.putpixel((7, 6), c_dark)
        img.putpixel((8, 8), (120, 110, 80, 255))
    elif style == "leaves":
        for x in range(4, 12):
            for y in range(5, 12):
                if (x+y)%2 == 0:
                    img.putpixel((x, y), c_leaf)
                elif (x+y)%3 == 0:
                    img.putpixel((x, y), c_dark_leaf)
                else:
                    img.putpixel((x, y), c_dark)
    return img

def draw_herb(herb_type, style):
    img = create_canvas()
    if herb_type == "rosemary":
        c_green = (46, 125, 50, 255)
        c_dark_green = (27, 94, 32, 255)
    elif herb_type == "thyme":
        c_green = (124, 179, 66, 255)
        c_dark_green = (85, 139, 47, 255)
    elif herb_type == "sage":
        c_green = (120, 144, 156, 255)
        c_dark_green = (84, 110, 122, 255)
    else:
        c_green = (104, 159, 56, 255)
        c_dark_green = (68, 108, 33, 255)
    c_dark = C_BLACK
    if style == "raw":
        for y in range(3, 13):
            img.putpixel((7, y), (120, 90, 60, 255))
            if y % 2 == 0:
                img.putpixel((6, y), c_green)
                img.putpixel((5, y), c_dark)
                img.putpixel((8, y), c_green)
                img.putpixel((9, y), c_dark)
            else:
                img.putpixel((6, y), c_dark)
                img.putpixel((8, y), c_dark)
        img.putpixel((7, 2), c_green)
        img.putpixel((7, 1), c_dark)
    elif style == "seeds":
        img.putpixel((6, 7), (100, 75, 45, 255))
        img.putpixel((7, 8), (100, 75, 45, 255))
        img.putpixel((7, 6), c_dark)
    elif style == "chopped":
        import random
        random.seed(len(herb_type))
        for _ in range(15):
            x = random.randint(3, 12)
            y = random.randint(4, 12)
            img.putpixel((x, y), c_green if random.random() < 0.6 else c_dark_green)
            if random.random() < 0.4:
                img.putpixel((x+1, y), c_dark)
    return img

def draw_spices():
    img = create_canvas()
    import random
    random.seed(99)
    colors = [
        (210, 95, 30, 255),
        (230, 145, 40, 255),
        (130, 70, 30, 255),
        (90, 45, 20, 255)
    ]
    for y in range(7, 13):
        for x in range(3, 13):
            dx = (x - 7.5)/4.5
            dy = (y - 12.0)/4.5
            dist = dx*dx + dy*dy
            if dist <= 1.0:
                if dist > 0.85:
                    img.putpixel((x, y), C_BLACK)
                else:
                    img.putpixel((x, y), random.choice(colors))
    return img

def draw_salt():
    img = create_canvas()
    for y in range(8, 13):
        for x in range(3, 13):
            dx = (x - 7.5)/4.5
            dy = (y - 12.0)/4.0
            dist = dx*dx + dy*dy
            if dist <= 1.0:
                if dist > 0.85:
                    img.putpixel((x, y), C_BLACK)
                else:
                    img.putpixel((x, y), C_WHITE if (x+y)%3 != 0 else C_LIGHT_GRAY)
    return img

def draw_cheese(style):
    img = create_canvas()
    c_yellow = (255, 210, 50, 255)
    c_dark_yellow = (235, 175, 20, 255)
    c_dark = C_BLACK
    if style == "curds":
        import random
        random.seed(11)
        for y in range(8, 13):
            for x in range(3, 13):
                dx = (x - 7.5)/4.5
                dy = (y - 12.0)/4.0
                dist = dx*dx + dy*dy
                if dist <= 1.0:
                    if dist > 0.85:
                        img.putpixel((x, y), c_dark)
                    else:
                        img.putpixel((x, y), (250, 240, 200, 255) if random.random() < 0.5 else (235, 215, 150, 255))
    elif style == "wheel":
        for y in range(5, 12):
            for x in range(3, 13):
                is_border = False
                if x == 3 or x == 12 or y == 5 or y == 11:
                    is_border = True
                if is_border:
                    img.putpixel((x, y), c_dark)
                else:
                    img.putpixel((x, y), c_yellow if y < 8 else c_dark_yellow)
    elif style == "slice":
        for x in range(3, 13):
            for y in range(3, 13):
                if x == 3 or x == 12 or y == 3 or y == 12:
                    img.putpixel((x, y), c_dark)
                else:
                    if (x==5 and y==5) or (x==9 and y==6) or (x==6 and y==9):
                        img.putpixel((x, y), C_TRANSPARENT)
                    elif (x==6 and y==5) or (x==10 and y==6) or (x==7 and y==9) or (x==5 and y==6):
                        img.putpixel((x, y), c_dark)
                    else:
                        img.putpixel((x, y), c_yellow)
    return img

def draw_meat_cut(meat_type, style):
    img = create_canvas()
    c_dark = C_BLACK
    if meat_type == "beef":
        c_meat = (165, 30, 30, 255)
        c_cooked = (85, 35, 25, 255)
        c_fat = (245, 225, 225, 255)
    elif meat_type == "chicken":
        c_meat = (245, 205, 195, 255)
        c_fat = (255, 255, 255, 255)
        c_cooked = (185, 140, 100, 255)
    elif meat_type == "mutton":
        c_meat = (150, 45, 60, 255)
        c_cooked = (95, 45, 45, 255)
        c_fat = (235, 220, 220, 255)
    else:
        c_meat = (195, 80, 75, 255)
        c_cooked = (115, 65, 55, 255)
        c_fat = (245, 225, 225, 255)

    if style == "flank":
        for y in range(4, 12):
            for x in range(3, 13):
                if x == 3 or x == 12 or y == 4 or y == 11:
                    img.putpixel((x, y), c_dark)
                else:
                    img.putpixel((x, y), c_fat if (x+y)%4 == 0 else c_meat)
    elif style == "strips_raw":
        for x in range(4, 12):
            y = int(8 + 1.5 * ((x-7.5)/3.5)**2)
            img.putpixel((x, y), c_meat)
            img.putpixel((x, y-1), c_dark)
            img.putpixel((x, y+1), c_dark)
    elif style == "strips_cooked":
        for x in range(4, 12):
            y = int(8 + 1.5 * ((x-7.5)/3.5)**2)
            img.putpixel((x, y), c_cooked)
            img.putpixel((x, y-1), c_dark)
            img.putpixel((x, y+1), c_dark)
    elif style == "suet":
        for y in range(5, 12):
            for x in range(3, 13):
                if x == 3 or x == 12 or y == 5 or y == 11:
                    img.putpixel((x, y), c_dark)
                else:
                    img.putpixel((x, y), (245, 240, 210, 255) if (x+y)%2 == 0 else (230, 225, 195, 255))
    elif style == "tallow":
        for y in range(7, 13):
            for x in range(4, 12):
                if x == 4 or x == 11 or y == 7 or y == 12:
                    img.putpixel((x, y), c_dark)
                else:
                    img.putpixel((x, y), (250, 250, 245, 255))
    elif style == "chicken_breast":
        for x in range(3, 13):
            for y in range(4, 12):
                dx = (x - 7.5)/4.5
                dy = (y - 7.5)/3.5
                dist = dx*dx + dy*dy
                if dist <= 1.0:
                    if dist > 0.85:
                        img.putpixel((x, y), c_dark)
                    else:
                        img.putpixel((x, y), c_meat)
    elif style == "mutton_ribs":
        for y in range(5, 12):
            for x in range(3, 13):
                if x == 3 or x == 12 or y == 5 or y == 11:
                    img.putpixel((x, y), c_dark)
                else:
                    img.putpixel((x, y), c_meat)
        img.putpixel((5, 4), C_WHITE)
        img.putpixel((5, 3), c_dark)
        img.putpixel((8, 4), C_WHITE)
        img.putpixel((8, 3), c_dark)
    elif style == "rabbit_backstrap":
        for x in range(3, 13):
            for y in range(6, 11):
                dx = (x - 7.5)/4.5
                dy = (y - 8.0)/2.0
                dist = dx*dx + dy*dy
                if dist <= 1.0:
                    if dist > 0.85:
                        img.putpixel((x, y), c_dark)
                    else:
                        img.putpixel((x, y), c_meat)
    elif style == "sausage_raw":
        return draw_sausage(is_cooked=False)
    elif style == "sausage_cooked":
        return draw_sausage(is_cooked=True)
    return img

def draw_procedural(item_id):
    """Draws a procedurally generated pixel art representation of the item."""
    if "knife_flint" in item_id:
        return draw_knife(C_MED_GRAY, C_LIGHT_GRAY)
    elif "knife_copper" in item_id:
        return draw_knife(C_COPPER, C_COPPER_SHINE)
    elif "knife_iron" in item_id:
        return draw_knife(C_LIGHT_GRAY, C_WHITE)
    elif "knife_diamond" in item_id:
        return draw_knife(C_DIAMOND, C_DIAMOND_SHINE)
    elif "bacon_raw" in item_id or "bacon" == item_id:
        return draw_bacon(is_cooked=False)
    elif "bacon_cooked" in item_id or "cooked_bacon" in item_id:
        return draw_bacon(is_cooked=True)
    elif "pork_belly" in item_id:
        return draw_pork_belly()
    elif "ham" == item_id:
        return draw_ham()
    elif "ground_pork" in item_id:
        return draw_ground_pork()
    elif "raw_sausage" in item_id:
        return draw_sausage(is_cooked=False)
    elif "sausage" in item_id:
        return draw_sausage(is_cooked=True)
    elif "lard" in item_id:
        return draw_lard()
    elif "fried_egg" in item_id:
        return draw_fried_egg()
    elif "raw_hash_browns" in item_id or "hash_browns_raw" in item_id:
        return draw_hash_browns(is_cooked=False)
    elif "hash_browns" in item_id:
        return draw_hash_browns(is_cooked=True)
    elif "toast_jam" in item_id:
        return draw_bread_slice("jam")
    elif "glowberry_toast" in item_id:
        return draw_bread_slice("glowberry")
    elif "toast" in item_id:
        return draw_bread_slice("toast")
    elif "bread_slice" in item_id:
        return draw_bread_slice("bread")
    elif "pancakes" in item_id:
        return draw_pancakes()
    elif "mushroom_omelet" in item_id:
        return draw_omelet("mushroom")
    elif "bacon_omelet" in item_id:
        return draw_omelet("bacon")
    elif "ham_omelet" in item_id:
        return draw_omelet("ham")
    elif "nether_fungi_omelet" in item_id:
        return draw_omelet("nether")
    elif "omelet" in item_id:
        return draw_omelet("plain")
    elif "biscuit_sandwich" in item_id:
        return draw_biscuit_sandwich()
    elif "biscuit" in item_id:
        return draw_biscuit()
    elif "breakfast_sandwich" in item_id or "toaster_sandwich" in item_id:
        return draw_breakfast_sandwich()
    elif "biscuits_and_gravy" in item_id:
        return draw_biscuits_and_gravy()
    elif "miners_skillet" in item_id:
        return draw_miners_skillet()
    elif "onion_seeds" in item_id:
        return draw_onion("seeds")
    elif "onion_slices" in item_id:
        return draw_onion("slices")
    elif "onion_grilled" in item_id or "grilled_onion" in item_id:
        return draw_onion("grilled")
    elif "onion" in item_id:
        return draw_onion("raw")
    elif "tomato_seeds" in item_id:
        return draw_tomato("seeds")
    elif "tomato_slice" in item_id:
        return draw_tomato("slice")
    elif "tomato_grilled" in item_id or "grilled_tomato" in item_id:
        return draw_tomato("grilled")
    elif "tomato" in item_id:
        return draw_tomato("raw")
    elif "pepper_seeds" in item_id:
        return draw_pepper("seeds")
    elif "pepper_slices" in item_id:
        return draw_pepper("slices")
    elif "pepper_grilled" in item_id or "grilled_pepper" in item_id:
        return draw_pepper("grilled")
    elif "pepper" in item_id:
        return draw_pepper("raw")
    elif "spinach_seeds" in item_id:
        return draw_spinach("seeds")
    elif "spinach_leaves" in item_id:
        return draw_spinach("leaves")
    elif "spinach" in item_id:
        return draw_spinach("raw")
    elif "rosemary_seeds" in item_id:
        return draw_herb("rosemary", "seeds")
    elif "rosemary_chopped" in item_id or "chopped_rosemary" in item_id:
        return draw_herb("rosemary", "chopped")
    elif "rosemary" in item_id:
        return draw_herb("rosemary", "raw")
    elif "thyme_seeds" in item_id:
        return draw_herb("thyme", "seeds")
    elif "thyme_chopped" in item_id or "chopped_thyme" in item_id:
        return draw_herb("thyme", "chopped")
    elif "thyme" in item_id:
        return draw_herb("thyme", "raw")
    elif "sage_seeds" in item_id:
        return draw_herb("sage", "seeds")
    elif "sage_chopped" in item_id or "chopped_sage" in item_id:
        return draw_herb("sage", "chopped")
    elif "sage" in item_id:
        return draw_herb("sage", "raw")
    elif "oregano_seeds" in item_id:
        return draw_herb("oregano", "seeds")
    elif "oregano_chopped" in item_id or "chopped_oregano" in item_id:
        return draw_herb("oregano", "chopped")
    elif "oregano" in item_id:
        return draw_herb("oregano", "raw")
    elif "spices" in item_id:
        return draw_spices()
    elif "salt" in item_id:
        return draw_salt()
    elif "cheese_curds" in item_id:
        return draw_cheese("curds")
    elif "cheese_wheel" in item_id:
        return draw_cheese("wheel")
    elif "cheese_slice" in item_id:
        return draw_cheese("slice")
    elif "beef_flank" in item_id:
        return draw_meat_cut("beef", "flank")
    elif "steak_strips_raw" in item_id or "steak_strips" == item_id:
        return draw_meat_cut("beef", "strips_raw")
    elif "steak_strips_cooked" in item_id or "cooked_steak_strips" in item_id:
        return draw_meat_cut("beef", "strips_cooked")
    elif "suet" in item_id:
        return draw_meat_cut("beef", "suet")
    elif "tallow" in item_id:
        return draw_meat_cut("beef", "tallow")
    elif "chicken_breast" in item_id:
        return draw_meat_cut("chicken", "chicken_breast")
    elif "mutton_ribs" in item_id:
        return draw_meat_cut("mutton", "mutton_ribs")
    elif "mutton_strips_raw" in item_id or "mutton_strips" == item_id:
        return draw_meat_cut("mutton", "strips_raw")
    elif "mutton_strips_cooked" in item_id or "cooked_mutton_strips" in item_id:
        return draw_meat_cut("mutton", "strips_cooked")
    elif "rabbit_backstrap" in item_id:
        return draw_meat_cut("rabbit", "rabbit_backstrap")
    elif "rabbit_sausage_raw" in item_id:
        return draw_meat_cut("rabbit", "sausage_raw")
    elif "rabbit_sausage_cooked" in item_id or "rabbit_sausage" == item_id:
        return draw_meat_cut("rabbit", "sausage_cooked")
    else:
        img = create_canvas()
        for x in range(4, 12):
            for y in range(4, 12):
                img.putpixel((x, y), C_MED_GRAY if (x+y)%2 == 0 else C_LIGHT_GRAY)
        return img

# ==========================================
# File management and setup functions
# ==========================================

# Detailed descriptions mapping texture filenames in item_texture.json to prompts for API mode.
PROMPT_MAP = {
    "knife_flint": "a simple flint kitchen knife with a dark wooden handle",
    "knife_copper": "a simple kitchen knife with a shiny copper blade and wooden handle",
    "knife_iron": "a sleek iron kitchen knife",
    "knife_diamond": "a kitchen knife with a glowing cyan diamond blade",
    "pork_belly": "a raw slab of pork belly, showcasing layers of pink meat and white fat",
    "bacon_raw": "a raw strip of bacon, wavy with marbled red meat and white fat stripes",
    "bacon_cooked": "a crispy, wavy, dark reddish-brown cooked strip of bacon",
    "ham": "a thick, juicy round slice of cooked pink ham with a dark edge",
    "ground_pork": "a small raw mound of fresh ground pork meat",
    "sausage": "a single golden-brown cooked breakfast sausage link",
    "raw_sausage": "a single raw pinkish breakfast sausage link",
    "lard": "a solid white block of pure lard cooking fat",
    "fried_egg": "a fried egg with a perfectly round bright yellow yolk in the center of clean white egg white",
    "hash_browns": "a crispy golden-brown fried hash brown patty",
    "hash_browns_raw": "a neat pile of raw shredded white potatoes for hash browns",
    "bread_slice": "a clean slice of white bread with a light brown crust",
    "toast": "a golden-brown toasted slice of bread",
    "toast_jam": "a toasted slice of bread spread with shiny red strawberry jam",
    "glowberry_toast": "a toasted slice of bread topped with bright glowing yellow-orange glowberries",
    "berry_pancakes": "a stack of fluffy pancakes topped with melting butter and blueberries and raspberries",
    "omelet": "a folded golden-yellow fluffy egg omelet",
    "mushroom_omelet": "a folded egg omelet with cooked brown mushrooms showing inside the fold",
    "bacon_omelet": "a folded egg omelet stuffed with crispy red-brown bacon bits",
    "ham_omelet": "a folded egg omelet stuffed with small pink diced ham cubes",
    "nether_fungi_omelet": "a folded egg omelet filled with red and blue nether fungi mushrooms",
    "breakfast_sandwich": "a toasted breakfast sandwich with layers of cooked egg, melted cheese, and bacon",
    "biscuit_sandwich": "a flaky southern biscuit sliced open with a sausage patty and egg inside",
    "biscuit": "a single fluffy golden-brown southern biscuit",
    "biscuits_and_gravy": "two warm biscuits on a plate covered in thick white country gravy with sausage chunks",
    "miners_skillet": "a small black cast iron skillet filled with scrambled eggs, cooked sausage, and cubed potatoes",
    "onion": "a raw purple red onion bulb",
    "onion_seeds": "a few small black onion seeds",
    "onion_slices": "raw concentric red onion ring slices",
    "onion_grilled": "caramelized grilled onion slices",
    "tomato": "a raw ripe red tomato",
    "tomato_seeds": "yellowish tomato seeds",
    "tomato_slice": "a clean slice of red tomato showing seeds",
    "tomato_grilled": "a lightly charred grilled tomato slice",
    "pepper": "a raw green bell pepper",
    "pepper_seeds": "small white bell pepper seeds",
    "pepper_slices": "hollow green bell pepper rings",
    "pepper_grilled": "grilled charred green bell pepper rings",
    "spinach": "a fresh green spinach leaf",
    "spinach_seeds": "spinach crop seeds",
    "spinach_leaves": "a heap of chopped green spinach leaves",
    "rosemary": "a sprig of fresh green rosemary herb",
    "rosemary_seeds": "rosemary herb seeds",
    "rosemary_chopped": "chopped rosemary needles",
    "thyme": "a sprig of fresh green thyme herb",
    "thyme_seeds": "thyme herb seeds",
    "thyme_chopped": "chopped green thyme leaves",
    "sage": "broad oval fuzzy grey-green sage leaves",
    "sage_seeds": "sage herb seeds",
    "sage_chopped": "chopped sage leaves",
    "oregano": "a sprig of fresh green oregano herb",
    "oregano_seeds": "oregano herb seeds",
    "oregano_chopped": "chopped green oregano leaves",
    "spices": "a bowl of mixed ground spices powder",
    "salt": "a pile of white salt crystals",
    "cheese_curds": "fresh white and yellow cheese curds",
    "cheese_wheel": "a round yellow cheese wheel block",
    "cheese_slice": "a flat yellow cheese slice with holes",
    "beef_flank": "a raw red beef flank steak marbled with fat",
    "steak_strips_raw": "raw red steak meat strips",
    "steak_strips_cooked": "cooked brown grilled steak strips",
    "suet": "a block of solid raw white suet beef fat",
    "tallow": "a jar of white rendered beef tallow fat",
    "chicken_breast": "a raw boneless skinless chicken breast cut",
    "mutton_ribs": "raw red mutton rib chops with exposed white bones",
    "mutton_strips_raw": "raw red mutton strips",
    "mutton_strips_cooked": "cooked brown grilled mutton strips",
    "rabbit_backstrap": "a raw lean dark-red rabbit backstrap cut",
    "rabbit_sausage_raw": "a raw pink rabbit sausage link",
    "rabbit_sausage_cooked": "a cooked golden-brown rabbit sausage link"
}

def load_texture_list(rp_dir):
    """Parses item_texture.json to find all registered texture filenames."""
    json_path = os.path.join(rp_dir, "textures", "item_texture.json")
    if not os.path.exists(json_path):
        print(f"Error: Could not find item_texture.json at {json_path}")
        return []
    
    with open(json_path, 'r') as f:
        data = json.load(f)
    
    textures = []
    texture_data = data.get("texture_data", {})
    for tex_key, tex_val in texture_data.items():
        tex_path = tex_val.get("textures")
        if isinstance(tex_path, list):
            tex_path = tex_path[0]
        
        # We expect paths like "textures/items/bacon_raw"
        if tex_path and tex_path.startswith("textures/items/"):
            filename = tex_path.replace("textures/items/", "")
            if filename not in textures:
                textures.append(filename)
                
    return sorted(textures)

def backup_textures(rp_dir, backup_dir):
    """Backs up existing textures from the RP items directory to the backup directory."""
    src_dir = os.path.join(rp_dir, "textures", "items")
    if not os.path.exists(src_dir):
        print(f"No source items directory found at {src_dir} to backup.")
        return
        
    os.makedirs(backup_dir, exist_ok=True)
    print(f"Backing up current textures to: {backup_dir}...")
    for filename in os.listdir(src_dir):
        if filename.endswith(".png"):
            src_file = os.path.join(src_dir, filename)
            dest_file = os.path.join(backup_dir, filename)
            shutil.copy2(src_file, dest_file)
    print("Backup complete!")

def chroma_key_magenta(img, threshold=45):
    """Converts magenta (#FF00FF) pixels to transparent."""
    img = img.convert("RGBA")
    data = img.getdata()
    
    new_data = []
    for item in data:
        r, g, b, a = item
        # Calculate distance to pure magenta (255, 0, 255)
        dist = ((r - 255) ** 2 + (g - 0) ** 2 + (b - 255) ** 2) ** 0.5
        if dist < threshold:
            new_data.append((0, 0, 0, 0)) # Transparent
        else:
            new_data.append(item)
            
    img.putdata(new_data)
    return img

def autocrop_and_pad(img, pad_percent=0.06):
    """Crops empty alpha boundaries and pads the image to a centered square."""
    bbox = img.getbbox()
    if not bbox:
        return img
        
    # Crop to bounding box of content
    cropped = img.crop(bbox)
    
    # Calculate dimensions
    w, h = cropped.size
    max_dim = max(w, h)
    
    # Add padding percentage
    pad_px = int(max_dim * pad_percent)
    new_dim = max_dim + 2 * pad_px
    
    # Create transparent square canvas
    padded = Image.new("RGBA", (new_dim, new_dim), (0, 0, 0, 0))
    paste_x = (new_dim - w) // 2
    paste_y = (new_dim - h) // 2
    padded.paste(cropped, (paste_x, paste_y))
    
    return padded

def enforce_binary_alpha(img, threshold=128):
    """Enforces binary alpha (0 or 255) to prevent Minecraft Bedrock transparency artifacts."""
    img = img.convert("RGBA")
    data = img.getdata()
    new_data = []
    for item in data:
        r, g, b, a = item
        if a < threshold:
            new_data.append((0, 0, 0, 0)) # Fully transparent black
        else:
            new_data.append((r, g, b, 255)) # Fully opaque
    img.putdata(new_data)
    return img

def quantize_retro(img, num_colors=16):
    """Reduces the color count of the image while maintaining transparency."""
    alpha = img.getchannel('A')
    rgb = img.convert('RGB')
    
    # Quantize using fast octree or max coverage
    quantized_rgb = rgb.quantize(colors=num_colors, method=Image.Quantize.MAXCOVERAGE)
    rgba_quantized = quantized_rgb.convert('RGBA')
    
    # Re-apply transparency mask
    rgba_quantized.putalpha(alpha)
    return enforce_binary_alpha(rgba_quantized)

def generate_texture_api(client, item_id, staging_dir):
    """Generates a texture using the Google GenAI API."""
    description = PROMPT_MAP.get(item_id)
    if not description:
        description = item_id.replace("_", " ")
        
    prompt_text = (
        f"A clean, minimalist flat vector icon of {description}, detailed textures, "
        "soft shading, no outlines, no borders, isolated on a solid bright magenta background (#FF00FF)"
    )
    
    print(f"Generating texture via API for: {item_id}...")
    
    try:
        from google.genai import types
        result = client.models.generate_images(
            model="imagen-4.0-generate-001",
            prompt=prompt_text,
            config=types.GenerateImagesConfig(
                number_of_images=1,
                aspect_ratio="1:1",
                output_mime_type="image/png"
            )
        )
        
        if not result.generated_images:
            print(f"Error: No images generated for {item_id}")
            return None
            
        gen_img_bytes = result.generated_images[0].image.image_bytes
        img = Image.open(io.BytesIO(gen_img_bytes))
        
        # Save raw output (includes magenta background)
        raw_dir = os.path.join(staging_dir, "raw")
        os.makedirs(raw_dir, exist_ok=True)
        img.save(os.path.join(raw_dir, f"{item_id}.png"))
        
        # Chroma key & Crop
        keyed = chroma_key_magenta(img)
        return autocrop_and_pad(keyed)
        
    except Exception as e:
        print(f"Error generating texture via API for {item_id}: {e}")
        return None

def process_and_save(img, item_id, staging_dir):
    """Resizes and saves processed images in staging folders."""
    os.makedirs(os.path.join(staging_dir, "32x32"), exist_ok=True)
    os.makedirs(os.path.join(staging_dir, "32x32_quantized"), exist_ok=True)
    
    # Resize using Lanczos for high quality cohesiveness
    size_32 = img.resize((32, 32), Image.Resampling.LANCZOS)
    size_32 = enforce_binary_alpha(size_32)
    
    # Save normal resized version
    size_32.save(os.path.join(staging_dir, "32x32", f"{item_id}.png"))
    
    # Apply retro color quantization and save
    quant_32 = quantize_retro(size_32, num_colors=24)
    quant_32.save(os.path.join(staging_dir, "32x32_quantized", f"{item_id}.png"))
    print(f"Saved staged textures for {item_id} (32x32).")

def main():
    parser = argparse.ArgumentParser(description="Batch generate item textures using PIL or Gemini Imagen API.")
    parser.add_argument("--rp-dir", default="../Breakfast_RP", help="Path to Resource Pack directory.")
    parser.add_argument("--backup-dir", default="../backup/textures/items", help="Path to save backed up textures.")
    parser.add_argument("--staging-dir", default="../staging/textures/items", help="Path to save staged textures.")
    parser.add_argument("--test", type=str, default=None, help="Generate a test image for a single texture ID (e.g. 'bacon_raw').")
    parser.add_argument("--backup-only", action="store_true", help="Perform only backup of existing textures.")
    parser.add_argument("--item-list", action="store_true", help="Print all registered item texture IDs and exit.")
    parser.add_argument("--api", action="store_true", help="Use Google GenAI API instead of procedural PIL generator.")
    parser.add_argument("--post-process-only", action="store_true", help="Post-process raw images already in the raw staging folder.")
    
    args = parser.parse_args()
    
    # Resolve relative paths based on script directory
    script_dir = os.path.dirname(os.path.abspath(__file__))
    rp_dir = os.path.abspath(os.path.join(script_dir, args.rp_dir))
    backup_dir = os.path.abspath(os.path.join(script_dir, args.backup_dir))
    staging_dir = os.path.abspath(os.path.join(script_dir, args.staging_dir))
    
    # Get all textures mapped in item_texture.json
    textures = load_texture_list(rp_dir)
    print(f"Found {len(textures)} texture targets defined in item_texture.json.")
    
    if args.item_list:
        print("Registered texture IDs:")
        for t in textures:
            print(f"  - {t}")
        return
        
    # 1. Backup phase
    backup_textures(rp_dir, backup_dir)
    if args.backup_only:
        return
        
    # 2. Post-process-only phase
    if args.post_process_only:
        raw_dir = os.path.join(staging_dir, "raw")
        if not os.path.exists(raw_dir):
            print(f"Error: Raw directory does not exist at {raw_dir}")
            return
            
        print("Running post-processing on raw images in staging...")
        success_count = 0
        for item_id in textures:
            raw_path = os.path.join(raw_dir, f"{item_id}.png")
            if os.path.exists(raw_path):
                print(f"Post-processing: {item_id}...")
                img = Image.open(raw_path).convert("RGBA")
                # Auto-detect background color from the four corners of the image
                corners = [
                    img.getpixel((0, 0)),
                    img.getpixel((0, img.height - 1)),
                    img.getpixel((img.width - 1, 0)),
                    img.getpixel((img.width - 1, img.height - 1))
                ]
                # Find the most common RGB color in corners
                from collections import Counter
                bg_color = Counter([c[:3] for c in corners]).most_common(1)[0][0]
                
                # Chroma key out detected background color
                data = img.getdata()
                new_data = []
                for item in data:
                    r, g, b, a = item
                    dist = ((r - bg_color[0]) ** 2 + (g - bg_color[1]) ** 2 + (b - bg_color[2]) ** 2) ** 0.5
                    if dist < 45: # Chroma-key threshold
                        new_data.append((0, 0, 0, 0))
                    else:
                        new_data.append(item)
                img.putdata(new_data)
                
                # Crop and pad
                cropped = autocrop_and_pad(img)
                
                # Resize and save using LANCZOS for 32x32
                os.makedirs(os.path.join(staging_dir, "32x32"), exist_ok=True)
                size_32 = cropped.resize((32, 32), Image.Resampling.LANCZOS)
                size_32 = enforce_binary_alpha(size_32)
                size_32.save(os.path.join(staging_dir, "32x32", f"{item_id}.png"))
                
                # Quantized versions
                os.makedirs(os.path.join(staging_dir, "32x32_quantized"), exist_ok=True)
                quant_32 = quantize_retro(size_32, num_colors=24)
                quant_32.save(os.path.join(staging_dir, "32x32_quantized", f"{item_id}.png"))
                
                success_count += 1
            else:
                print(f"Skipping: {item_id}.png not found in {raw_dir}")
        print(f"Finished. Successfully processed {success_count}/{len(textures)} textures.")
        return

    # Initialize API client if needed
    client = None
    if args.api:
        from google import genai
        client = genai.Client()
        
    # 3. Generation phase
    target_textures = [args.test] if args.test else textures
    
    if args.test:
        print(f"Running single-item test for '{args.test}'...")
    else:
        print(f"Starting batch generation of {len(target_textures)} textures...")
        
    success_count = 0
    for item_id in target_textures:
        if args.api:
            img = generate_texture_api(client, item_id, staging_dir)
        else:
            print(f"Procedurally drawing: {item_id}...")
            img = draw_procedural(item_id)
            
        if img:
            process_and_save(img, item_id, staging_dir)
            success_count += 1
        else:
            print(f"Failed to generate texture for {item_id}")
            
    print(f"Generation finished. Successfully generated {success_count}/{len(target_textures)} textures.")

if __name__ == "__main__":
    main()
