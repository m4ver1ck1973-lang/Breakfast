#!/usr/bin/env python3
import os
import re
import json
import html

# Resolve project paths relative to this script
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.dirname(SCRIPT_DIR)
WIKI_MD_PATH = os.path.join(PROJECT_DIR, "docs", "WIKI_GUIDE.md")
WIKI_HTML_PATH = os.path.join(PROJECT_DIR, "docs", "wiki.html")
ITEM_TEXTURE_JSON = os.path.join(PROJECT_DIR, "Breakfast_RP", "textures", "item_texture.json")

# 1. Load RP item textures mapping
texture_mapping = {}
if os.path.exists(ITEM_TEXTURE_JSON):
    try:
        with open(ITEM_TEXTURE_JSON, "r", encoding="utf-8") as f:
            data = json.load(f)
            texture_data = data.get("texture_data", {})
            for key, val in texture_data.items():
                tex = val.get("textures")
                if isinstance(tex, list) and len(tex) > 0:
                    texture_mapping[key] = tex[0]
                elif isinstance(tex, str):
                    texture_mapping[key] = tex
    except Exception as e:
        print(f"Warning: Failed to load item_texture.json: {e}")

# Helper to escape & parse inline formatting
def parse_inline(text):
    text = html.escape(text)
    
    # Bold: **text**
    text = re.sub(r'\*\*(.*?)\*\*', r'<strong>\1</strong>', text)
    
    # Italic: *text* or _text_
    text = re.sub(r'\*(.*?)\*', r'<em>\1</em>', text)
    
    # Links: [text](url)
    text = re.sub(r'\[(.*?)\]\((.*?)\)', r'<a href="\2">\1</a>', text)
    
    # Inline code with icons
    def replace_code(match):
        code_content = match.group(1)
        unescaped = html.unescape(code_content).strip()
        
        # Check namespace items e.g., breakfast:miners_skillet
        ns_match = re.match(r'^(breakfast|minecraft):([a-z0-9_]+)$', unescaped)
        if ns_match:
            ns = ns_match.group(1)
            name = ns_match.group(2)
            
            icon_url = ""
            if ns == "breakfast":
                tex_path = texture_mapping.get(name)
                if tex_path:
                    icon_url = f"../Breakfast_RP/{tex_path}.png"
                else:
                    # Guess location
                    if os.path.exists(os.path.join(PROJECT_DIR, "Breakfast_RP", "textures", "items", f"{name}.png")):
                        icon_url = f"../Breakfast_RP/textures/items/{name}.png"
                    elif os.path.exists(os.path.join(PROJECT_DIR, "Breakfast_RP", "textures", "blocks", f"{name}.png")):
                        icon_url = f"../Breakfast_RP/textures/blocks/{name}.png"
                    else:
                        icon_url = f"../Breakfast_RP/textures/items/{name}.png"
            elif ns == "minecraft":
                # Remote assets fallback
                if name in ["crimson_fungus", "warped_fungus", "planks", "short_grass", "tall_grass"]:
                    block_name = "oak_planks" if name == "planks" else name
                    icon_url = f"https://raw.githubusercontent.com/InventivetalentDev/minecraft-assets/1.20.4/assets/minecraft/textures/block/{block_name}.png"
                else:
                    icon_url = f"https://raw.githubusercontent.com/InventivetalentDev/minecraft-assets/1.20.4/assets/minecraft/textures/item/{name}.png"
            
            return f'<span class="item-id-badge"><img class="item-mini-icon pixelated" src="{icon_url}" alt="{name}" onerror="this.style.display=\'none\'"><code>{code_content}</code></span>'
        
        return f'<code>{code_content}</code>'
        
    text = re.sub(r'`(.*?)`', replace_code, text)
    return text

# Generate CSS slugs for anchor links
def slugify(text):
    text = re.sub(r'<[^>]+>', '', text)  # Strip HTML tags
    text = text.lower().strip()
    text = re.sub(r'[^a-z0-9_]+', '-', text)
    return text.strip('-')

def compile_markdown_to_html(md_text):
    lines = md_text.splitlines()
    html_blocks = []
    
    in_list = False
    in_table = False
    in_blockquote = False
    blockquote_type = ""
    blockquote_lines = []
    table_rows = []
    
    # Skip frontmatter/meta
    for line in lines:
        stripped = line.strip()
        
        # Handle lists
        if in_list and not (stripped.startswith("-") or stripped.startswith("*") or re.match(r'^\d+\.', stripped) or stripped == ""):
            html_blocks.append("</ul>")
            in_list = False
            
        # Handle tables
        if in_table and not stripped.startswith("|"):
            # Process table
            html_blocks.append(parse_table(table_rows))
            table_rows = []
            in_table = False
            
        # Handle blockquotes / alerts
        if in_blockquote and not stripped.startswith(">"):
            html_blocks.append(parse_blockquote(blockquote_type, blockquote_lines))
            blockquote_lines = []
            in_blockquote = False
            blockquote_type = ""
            
        # Parse headings
        header_match = re.match(r'^(#{1,6})\s+(.*)$', line)
        if header_match:
            level = len(header_match.group(1))
            title = header_match.group(2).strip()
            parsed_title = parse_inline(title)
            slug = slugify(parsed_title)
            html_blocks.append(f'<h{level} id="{slug}" class="heading-{level}">{parsed_title}</h{level}>')
            continue
            
        # Parse horizontal rules
        if stripped in ["---", "***", "___"]:
            html_blocks.append('<hr class="wiki-hr">')
            continue
            
        # Parse list items
        list_match = re.match(r'^[-*]\s+(.*)$', line)
        if list_match:
            if not in_list:
                html_blocks.append('<ul class="wiki-list">')
                in_list = True
            content = parse_inline(list_match.group(1))
            html_blocks.append(f'<li>{content}</li>')
            continue
            
        # Parse ordered lists
        ol_match = re.match(r'^\d+\.\s+(.*)$', line)
        if ol_match:
            if not in_list:
                html_blocks.append('<ol class="wiki-list-ordered">')
                in_list = True
            content = parse_inline(ol_match.group(1))
            html_blocks.append(f'<li>{content}</li>')
            continue
            
        # Parse blockquotes / alerts
        if stripped.startswith(">"):
            if not in_blockquote:
                in_blockquote = True
                alert_match = re.match(r'^>\s*\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]', stripped, re.IGNORECASE)
                if alert_match:
                    blockquote_type = alert_match.group(1).upper()
                    continue
                else:
                    blockquote_type = "STANDARD"
            content = stripped[1:].strip()
            blockquote_lines.append(content)
            continue
            
        # Parse tables
        if stripped.startswith("|"):
            in_table = True
            table_rows.append(stripped)
            continue
            
        # Parse markdown images
        img_match = re.match(r'^!\[(.*?)\]\((.*?)\)$', stripped)
        if img_match:
            alt = html.escape(img_match.group(1))
            src = html.escape(img_match.group(2))
            html_blocks.append(f'<figure class="wiki-figure"><img src="{src}" alt="{alt}" class="wiki-img"><figcaption>{alt}</figcaption></figure>')
            continue
            
        # Standard paragraph
        if stripped != "":
            html_blocks.append(f'<p>{parse_inline(line)}</p>')
            
    # Clean up residual open blocks
    if in_list:
        html_blocks.append("</ul>")
    if in_table:
        html_blocks.append(parse_table(table_rows))
    if in_blockquote:
        html_blocks.append(parse_blockquote(blockquote_type, blockquote_lines))
        
    return "\n".join(html_blocks)

def parse_blockquote(type_str, lines):
    content = "<br>".join([parse_inline(l) for l in lines])
    if type_str == "STANDARD":
        return f'<blockquote class="wiki-blockquote">{content}</blockquote>'
    else:
        badge = f'<span class="alert-badge">{type_str}</span>'
        return f'<div class="wiki-alert alert-{type_str.lower()}">{badge}<p>{content}</p></div>'

def parse_table(rows):
    if len(rows) < 1:
        return ""
        
    # Split cells and clean
    def split_cells(row_str):
        cells = row_str.split("|")[1:-1]
        return [c.strip() for c in cells]
        
    headers = split_cells(rows[0])
    has_separator = len(rows) > 1 and all(c.replace("-", "").replace(":", "").replace(" ", "") == "" for c in split_cells(rows[1]))
    
    data_start = 2 if has_separator else 1
    
    thead_html = "".join([f'<th>{parse_inline(h)}</th>' for h in headers])
    
    tbody_rows = []
    for r in rows[data_start:]:
        cells = split_cells(r)
        while len(cells) < len(headers):
            cells.append("")
        row_html = "".join([f'<td>{parse_inline(c)}</td>' for c in cells])
        tbody_rows.append(f'<tr>{row_html}</tr>')
        
    tbody_html = "\n".join(tbody_rows)
    
    # Check if this table is a food reference table
    is_food_table = len(headers) >= 5 and "nutrition" in headers[2].lower() and "saturation" in headers[3].lower()
    
    table_id = ""
    table_class = "wiki-table"
    
    if is_food_table:
        table_id = "food-table-temp"
        table_class = "wiki-table food-reference-table"
        
    id_attr = f' id="{table_id}"' if table_id else ""
    
    return f'<div class="table-container"><table class="{table_class}"{id_attr}><thead><tr>{thead_html}</tr></thead><tbody>{tbody_html}</tbody></table></div>'

# Main compiler execution
def main():
    if not os.path.exists(WIKI_MD_PATH):
        print(f"Error: WIKI_GUIDE.md not found at {WIKI_MD_PATH}")
        return
        
    with open(WIKI_MD_PATH, "r", encoding="utf-8") as f:
        md_content = f.read()
        
    compiled_body = compile_markdown_to_html(md_content)
    
    # Extract food items
    food_records = []
    tables = re.findall(r'((?:\|.*\|[\r\n]*)+)', md_content)
    for table_block in tables:
        rows = [r.strip() for r in table_block.strip().split("\n") if r.strip()]
        if len(rows) < 3:
            continue
        headers = [c.strip() for c in rows[0].split("|")[1:-1]]
        if len(headers) >= 5 and "nutrition" in headers[2].lower() and "saturation" in headers[3].lower():
            # Find closest preceding heading
            table_pos = md_content.find(table_block)
            preceding_text = md_content[:table_pos]
            headings = re.findall(r'###\s+(.*)', preceding_text)
            tier_name = headings[-1].strip() if headings else "Unknown"
            tier_name = re.sub(r'[^\w\s\(\)]', '', tier_name)
            
            tier_slug = "meals"
            if "snack" in tier_name.lower():
                tier_slug = "snacks"
            elif "feast" in tier_name.lower() or "advanced" in tier_name.lower():
                tier_slug = "feasts"
                
            for row in rows[2:]:
                cells = [c.strip() for c in row.split("|")[1:-1]]
                if len(cells) < 5:
                    continue
                
                name = re.sub(r'\*\*|\*', '', cells[0])
                identifier = re.sub(r'`', '', cells[1])
                
                raw_id = identifier.replace("breakfast:", "").replace("minecraft:", "")
                icon_path = ""
                if "breakfast:" in identifier:
                    tex_path = texture_mapping.get(raw_id)
                    if tex_path:
                        icon_path = f"../Breakfast_RP/{tex_path}.png"
                    else:
                        if os.path.exists(os.path.join(PROJECT_DIR, "Breakfast_RP", "textures", "items", f"{raw_id}.png")):
                            icon_path = f"../Breakfast_RP/textures/items/{raw_id}.png"
                        else:
                            icon_path = f"../Breakfast_RP/textures/items/{raw_id}.png"
                else:
                    if raw_id in ["crimson_fungus", "warped_fungus", "planks", "short_grass", "tall_grass"]:
                        block_name = "oak_planks" if raw_id == "planks" else raw_id
                        icon_path = f"https://raw.githubusercontent.com/InventivetalentDev/minecraft-assets/1.20.4/assets/minecraft/textures/block/{block_name}.png"
                    else:
                        icon_path = f"https://raw.githubusercontent.com/InventivetalentDev/minecraft-assets/1.20.4/assets/minecraft/textures/item/{raw_id}.png"
                
                food_records.append({
                    "name": name,
                    "id": identifier,
                    "nutrition": cells[2],
                    "saturation": cells[3],
                    "speed": cells[4],
                    "buffs": cells[5] if len(cells) > 5 else "",
                    "tier": tier_slug,
                    "tierName": tier_name,
                    "icon": icon_path
                })

    food_json = json.dumps(food_records, indent=2)

    # 3. Read template and insert compiled code
    html_template = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Breakfast Addon - Official Wiki & Guide</title>
  <!-- Google Fonts Outfit & Inter -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Outfit:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  
  <style>
    :root {{
      --primary-hsl: 28, 95%, 50%;
      --primary: hsl(var(--primary-hsl));
      --primary-hover: hsl(28, 95%, 45%);
      --primary-light: hsl(28, 100%, 95%);
      
      /* Light Mode Palette */
      --bg: hsl(38, 50%, 96%);
      --card-bg: hsl(0, 0%, 100%);
      --card-border: hsl(38, 30%, 88%);
      --text: hsl(220, 20%, 15%);
      --text-muted: hsl(220, 10%, 45%);
      --heading: hsl(24, 95%, 35%);
      --sidebar-bg: hsl(38, 35%, 92%);
      --shadow: 0 4px 20px rgba(139, 94, 26, 0.08);
      --inner-shadow: inset 0 2px 4px rgba(0,0,0,0.03);
      --tag-bg: hsl(38, 40%, 90%);
      
      --accent-snack: hsl(145, 60%, 40%);
      --accent-snack-light: hsl(145, 70%, 94%);
      --accent-meal: hsl(38, 95%, 45%);
      --accent-meal-light: hsl(38, 100%, 94%);
      --accent-feast: hsl(5, 80%, 55%);
      --accent-feast-light: hsl(5, 90%, 95%);
      
      --transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    }}

    /* Dark Mode Palette */
    [data-theme="dark"] {{
      --bg: hsl(220, 20%, 10%);
      --card-bg: hsl(220, 15%, 15%);
      --card-border: hsl(220, 15%, 22%);
      --text: hsl(220, 10%, 88%);
      --text-muted: hsl(220, 10%, 60%);
      --heading: hsl(28, 95%, 60%);
      --sidebar-bg: hsl(220, 18%, 12%);
      --shadow: 0 4px 30px rgba(0, 0, 0, 0.4);
      --tag-bg: hsl(220, 15%, 22%);
      --primary-light: hsl(28, 50%, 15%);
      
      --accent-snack: hsl(145, 50%, 55%);
      --accent-snack-light: hsl(145, 50%, 15%);
      --accent-meal: hsl(38, 80%, 55%);
      --accent-meal-light: hsl(38, 80%, 15%);
      --accent-feast: hsl(5, 75%, 60%);
      --accent-feast-light: hsl(5, 75%, 18%);
    }}

    * {{
      box-sizing: border-box;
      scroll-behavior: smooth;
    }}

    body {{
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      background-color: var(--bg);
      color: var(--text);
      margin: 0;
      padding: 0;
      display: flex;
      min-height: 100vh;
      transition: var(--transition);
      overflow-x: hidden;
    }}

    /* Pixelated image rendering for Minecraft textures */
    .pixelated {{
      image-rendering: pixelated;
      image-rendering: crisp-edges;
    }}

    /* Top Controls Container */
    .top-controls-container {{
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 1000;
      display: flex;
      gap: 10px;
    }}

    .btn-toggle {{
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      color: var(--text);
      padding: 10px 14px;
      border-radius: 30px;
      cursor: pointer;
      font-family: 'Outfit', sans-serif;
      font-weight: 600;
      font-size: 0.85rem;
      display: flex;
      align-items: center;
      gap: 8px;
      box-shadow: var(--shadow);
      transition: var(--transition);
    }}

    .btn-toggle:hover {{
      transform: translateY(-2px);
      border-color: var(--primary);
    }}

    /* Floating Menu Open Button */
    .sidebar-toggle-floating {{
      position: fixed;
      top: 20px;
      left: 20px;
      z-index: 99;
      display: none;
      transition: var(--transition);
    }}

    /* Navigation Sidebar */
    aside {{
      width: 300px;
      background: var(--sidebar-bg);
      border-right: 1px solid var(--card-border);
      position: fixed;
      top: 0;
      bottom: 0;
      left: 0;
      padding: 30px 20px;
      display: flex;
      flex-direction: column;
      gap: 25px;
      overflow-y: auto;
      z-index: 90;
      transition: var(--transition);
    }}

    /* Collapsed state styles */
    body.sidebar-collapsed aside {{
      transform: translateX(-100%);
    }}

    body.sidebar-collapsed main {{
      margin-left: 0;
      padding-left: 60px;
      padding-right: 60px;
    }}

    body.sidebar-collapsed .sidebar-toggle-floating {{
      display: block;
    }}

    .sidebar-header {{
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: 12px;
    }}

    .sidebar-title-row {{
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      gap: 10px;
    }}

    .btn-close-sidebar {{
      background: transparent;
      border: 0;
      color: var(--text-muted);
      cursor: pointer;
      font-size: 1rem;
      padding: 6px;
      border-radius: 6px;
      transition: var(--transition);
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1px solid transparent;
    }}

    .btn-close-sidebar:hover {{
      color: var(--primary);
      background: var(--card-bg);
      border-color: var(--card-border);
    }}

    .sidebar-logo {{
      width: 80px;
      height: 80px;
      border-radius: 16px;
      border: 4px solid var(--primary);
      box-shadow: var(--shadow);
    }}

    .sidebar-title {{
      font-family: 'Outfit', sans-serif;
      font-size: 1.25rem;
      font-weight: 800;
      color: var(--heading);
      margin: 0;
      text-align: left;
    }}

    .sidebar-subtitle {{
      font-size: 0.8rem;
      color: var(--text-muted);
      margin: 0;
    }}

    .sidebar-nav {{
      display: flex;
      flex-direction: column;
      gap: 5px;
    }}

    .nav-item {{
      padding: 10px 15px;
      border-radius: 8px;
      text-decoration: none;
      color: var(--text);
      font-family: 'Outfit', sans-serif;
      font-weight: 600;
      font-size: 0.95rem;
      transition: var(--transition);
      border-left: 3px solid transparent;
      display: flex;
      align-items: center;
      gap: 10px;
    }}

    .nav-item:hover {{
      background: var(--card-bg);
      color: var(--primary);
      transform: translateX(4px);
    }}

    .nav-item.active {{
      background: var(--card-bg);
      color: var(--primary);
      border-left-color: var(--primary);
      box-shadow: var(--inner-shadow);
    }}

    .nav-sub-item {{
      padding-left: 25px;
      font-size: 0.85rem;
      font-weight: 400;
      opacity: 0.8;
    }}

    /* Main Content Area */
    main {{
      margin-left: 300px;
      padding: 60px 80px;
      max-width: 1200px;
      flex: 1;
      transition: var(--transition);
    }}

    h1.main-title {{
      font-family: 'Outfit', sans-serif;
      font-size: 3rem;
      font-weight: 900;
      color: var(--heading);
      margin-top: 0;
      margin-bottom: 40px;
      border-bottom: 4px solid var(--primary);
      padding-bottom: 20px;
      letter-spacing: -1px;
    }}

    h2 {{
      font-family: 'Outfit', sans-serif;
      font-size: 1.85rem;
      font-weight: 700;
      color: var(--heading);
      margin-top: 50px;
      margin-bottom: 20px;
      display: flex;
      align-items: center;
      gap: 10px;
    }}

    h3 {{
      font-family: 'Outfit', sans-serif;
      font-size: 1.35rem;
      font-weight: 700;
      color: var(--heading);
      margin-top: 35px;
      margin-bottom: 15px;
    }}

    h4 {{
      font-family: 'Outfit', sans-serif;
      font-size: 1.1rem;
      font-weight: 600;
      margin-top: 25px;
      margin-bottom: 10px;
    }}

    p {{
      line-height: 1.7;
      margin-bottom: 25px;
      font-size: 1.05rem;
    }}

    a {{
      color: var(--primary);
      text-decoration: none;
      font-weight: 500;
      border-bottom: 1px dashed transparent;
      transition: var(--transition);
    }}

    a:hover {{
      color: var(--primary-hover);
      border-bottom-color: var(--primary-hover);
    }}

    /* Inline Badges and Icons */
    .item-id-badge {{
      display: inline-flex;
      align-items: center;
      background: var(--tag-bg);
      border-radius: 6px;
      padding: 2px 8px;
      margin: 0 4px;
      font-size: 0.9em;
      border: 1px solid var(--card-border);
      vertical-align: middle;
      gap: 6px;
    }}

    .item-mini-icon {{
      width: 18px;
      height: 18px;
      object-fit: contain;
    }}

    code {{
      font-family: 'Courier New', Courier, monospace;
      font-weight: bold;
      color: var(--primary);
      background: var(--primary-light);
      padding: 2px 5px;
      border-radius: 4px;
    }}

    /* Lists */
    ul.wiki-list, ol.wiki-list-ordered {{
      padding-left: 25px;
      margin-bottom: 30px;
    }}

    ul.wiki-list li, ol.wiki-list-ordered li {{
      margin-bottom: 10px;
      line-height: 1.6;
      font-size: 1.05rem;
    }}

    /* Divider */
    .wiki-hr {{
      border: 0;
      height: 2px;
      background: var(--card-border);
      margin: 50px 0;
    }}

    /* Tables */
    .table-container {{
      width: 100%;
      overflow-x: auto;
      margin: 30px 0;
      border-radius: 12px;
      box-shadow: var(--shadow);
      border: 1px solid var(--card-border);
      background: var(--card-bg);
    }}

    table.wiki-table {{
      width: 100%;
      border-collapse: collapse;
      text-align: left;
    }}

    table.wiki-table th, table.wiki-table td {{
      padding: 14px 18px;
      border-bottom: 1px solid var(--card-border);
      font-size: 0.95rem;
    }}

    table.wiki-table th {{
      background-color: var(--sidebar-bg);
      font-family: 'Outfit', sans-serif;
      font-weight: 700;
      color: var(--heading);
      letter-spacing: 0.5px;
      text-transform: uppercase;
      font-size: 0.85rem;
    }}

    table.wiki-table tbody tr:last-child td {{
      border-bottom: 0;
    }}

    table.wiki-table tbody tr:hover {{
      background-color: var(--primary-light);
    }}

    /* Blockquotes and Alerts */
    .wiki-blockquote {{
      border-left: 4px solid var(--primary);
      padding: 15px 20px;
      background: var(--sidebar-bg);
      border-radius: 0 12px 12px 0;
      margin: 30px 0;
      font-style: italic;
    }}

    .wiki-alert {{
      border-left: 5px solid transparent;
      border-radius: 8px;
      padding: 16px 20px;
      margin: 30px 0;
      display: flex;
      flex-direction: column;
      gap: 10px;
      box-shadow: var(--shadow);
    }}

    .alert-badge {{
      font-family: 'Outfit', sans-serif;
      font-weight: 800;
      font-size: 0.8rem;
      letter-spacing: 1px;
      text-transform: uppercase;
      padding: 2px 8px;
      border-radius: 4px;
      width: max-content;
    }}

    .wiki-alert p {{
      margin: 0;
      font-size: 1rem;
      line-height: 1.6;
    }}

    /* Alert Types styling */
    .alert-note {{
      border-left-color: #3498db;
      background-color: hsl(204, 80%, 96%);
    }}
    .alert-note .alert-badge {{
      background: #3498db;
      color: white;
    }}
    [data-theme="dark"] .alert-note {{
      background-color: hsl(204, 40%, 15%);
    }}

    .alert-tip {{
      border-left-color: #2ecc71;
      background-color: hsl(145, 80%, 96%);
    }}
    .alert-tip .alert-badge {{
      background: #2ecc71;
      color: white;
    }}
    [data-theme="dark"] .alert-tip {{
      background-color: hsl(145, 40%, 12%);
    }}

    .alert-important {{
      border-left-color: #9b59b6;
      background-color: hsl(283, 80%, 97%);
    }}
    .alert-important .alert-badge {{
      background: #9b59b6;
      color: white;
    }}
    [data-theme="dark"] .alert-important {{
      background-color: hsl(283, 40%, 15%);
    }}

    .alert-warning {{
      border-left-color: #e67e22;
      background-color: hsl(28, 80%, 96%);
    }}
    .alert-warning .alert-badge {{
      background: #e67e22;
      color: white;
    }}
    [data-theme="dark"] .alert-warning {{
      background-color: hsl(28, 40%, 14%);
    }}

    .alert-caution {{
      border-left-color: #e74c3c;
      background-color: hsl(5, 80%, 96%);
    }}
    .alert-caution .alert-badge {{
      background: #e74c3c;
      color: white;
    }}
    [data-theme="dark"] .alert-caution {{
      background-color: hsl(5, 40%, 14%);
    }}

    /* Figures and Images */
    .wiki-figure {{
      margin: 40px auto;
      max-width: 650px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      padding: 15px;
      border-radius: 16px;
      box-shadow: var(--shadow);
      transition: var(--transition);
    }}

    .wiki-figure:hover {{
      transform: translateY(-4px);
    }}

    .wiki-img {{
      max-width: 100%;
      border-radius: 10px;
      object-fit: cover;
    }}

    figcaption {{
      font-size: 0.9rem;
      color: var(--text-muted);
      font-style: italic;
      font-family: 'Outfit', sans-serif;
    }}

    /* --- Interactive Catalog / Food grid --- */
    .catalog-controls {{
      display: flex;
      flex-direction: column;
      gap: 15px;
      margin: 30px 0;
      padding: 20px;
      background: var(--sidebar-bg);
      border-radius: 12px;
      border: 1px solid var(--card-border);
    }}

    .catalog-search-row {{
      display: flex;
      gap: 10px;
      width: 100%;
    }}

    .catalog-search {{
      flex: 1;
      padding: 12px 18px;
      border-radius: 8px;
      border: 1px solid var(--card-border);
      background: var(--card-bg);
      color: var(--text);
      font-size: 1rem;
      outline: none;
      transition: var(--transition);
    }}

    .catalog-search:focus {{
      border-color: var(--primary);
      box-shadow: 0 0 0 3px var(--primary-light);
    }}

    .filter-buttons {{
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }}

    .btn-filter {{
      padding: 8px 16px;
      border-radius: 30px;
      border: 1px solid var(--card-border);
      background: var(--card-bg);
      color: var(--text);
      cursor: pointer;
      font-family: 'Outfit', sans-serif;
      font-weight: 600;
      font-size: 0.85rem;
      transition: var(--transition);
    }}

    .btn-filter:hover {{
      border-color: var(--primary);
      color: var(--primary);
    }}

    .btn-filter.active {{
      background: var(--primary);
      color: white;
      border-color: var(--primary);
      box-shadow: var(--shadow);
    }}

    .view-toggle {{
      padding: 8px 16px;
      border-radius: 8px;
      border: 1px solid var(--card-border);
      background: var(--card-bg);
      color: var(--text);
      cursor: pointer;
      font-family: 'Outfit', sans-serif;
      font-weight: 600;
      font-size: 0.85rem;
      display: flex;
      align-items: center;
      gap: 6px;
    }}

    .catalog-grid {{
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 20px;
      margin-top: 30px;
    }}

    .catalog-card {{
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 16px;
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 15px;
      box-shadow: var(--shadow);
      transition: var(--transition);
      position: relative;
      overflow: hidden;
    }}

    .catalog-card:hover {{
      transform: translateY(-6px);
      box-shadow: 0 10px 25px rgba(0,0,0,0.15);
      border-color: var(--primary);
    }}

    .card-tier-indicator {{
      position: absolute;
      top: 0;
      right: 0;
      padding: 4px 12px;
      font-family: 'Outfit', sans-serif;
      font-weight: 700;
      font-size: 0.75rem;
      border-radius: 0 0 0 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }}

    .card-tier-snacks {{
      background: var(--accent-snack-light);
      color: var(--accent-snack);
    }}
    .card-tier-meals {{
      background: var(--accent-meal-light);
      color: var(--accent-meal);
    }}
    .card-tier-feasts {{
      background: var(--accent-feast-light);
      color: var(--accent-feast);
    }}

    .card-header {{
      display: flex;
      align-items: center;
      gap: 15px;
    }}

    .card-icon-frame {{
      width: 54px;
      height: 54px;
      border-radius: 12px;
      background: var(--sidebar-bg);
      border: 1px solid var(--card-border);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: var(--inner-shadow);
      padding: 8px;
    }}

    .card-icon {{
      width: 100%;
      height: 100%;
      object-fit: contain;
    }}

    .card-title-group {{
      display: flex;
      flex-direction: column;
      gap: 4px;
    }}

    .card-title {{
      font-family: 'Outfit', sans-serif;
      font-size: 1.15rem;
      font-weight: 700;
      margin: 0;
    }}

    .card-id {{
      font-family: monospace;
      font-size: 0.75rem;
      color: var(--text-muted);
    }}

    .card-stats {{
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;
      border-top: 1px dashed var(--card-border);
      border-bottom: 1px dashed var(--card-border);
      padding: 10px 0;
    }}

    .card-stat-box {{
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: 2px;
    }}

    .card-stat-label {{
      font-size: 0.7rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--text-muted);
      font-family: 'Outfit', sans-serif;
      font-weight: 600;
    }}

    .card-stat-value {{
      font-size: 0.95rem;
      font-weight: 700;
      color: var(--text);
    }}

    .card-buffs {{
      font-size: 0.85rem;
      line-height: 1.5;
      flex-grow: 1;
    }}

    .buff-highlight {{
      display: block;
      margin-top: 5px;
      font-weight: 600;
      color: var(--primary);
    }}

    .hidden {{
      display: none !important;
    }}

    /* Footer */
    footer {{
      margin-top: 80px;
      border-top: 1px solid var(--card-border);
      padding-top: 30px;
      text-align: center;
      color: var(--text-muted);
      font-size: 0.85rem;
    }}

    /* Responsive adjustments */
    @media (max-width: 1200px) {{
      aside {{
        transform: translateX(-100%);
      }}
      body {{
        flex-direction: column;
      }}
      main {{
        margin-left: 0;
        padding: 30px;
        padding-left: 40px;
        padding-right: 40px;
      }}
      .sidebar-toggle-floating {{
        display: block;
      }}
    }}
  </style>
</head>
<body>

  <div class="sidebar-toggle-floating">
    <button class="btn-toggle" onclick="toggleSidebar()">
      ☰ Menu
    </button>
  </div>

  <div class="top-controls-container">
    <button class="btn-toggle" onclick="toggleTheme()" id="themeBtn">
      🌙 Dark Mode
    </button>
  </div>

  <aside>
    <div class="sidebar-header">
      <div class="sidebar-title-row">
        <h2 class="sidebar-title">Breakfast Addon</h2>
        <button class="btn-close-sidebar" onclick="toggleSidebar()" title="Collapse Sidebar">
          ◀
        </button>
      </div>
      <img src="../Breakfast_RP/pack_icon.png" alt="Breakfast Addon Icon" class="sidebar-logo pixelated" onerror="this.src='breakfast_icon.png'">
      <p class="sidebar-subtitle">Official Guide &amp; Wiki</p>
    </div>
    <div class="sidebar-nav" id="sidebarNav">
      <!-- Auto-populated by JS -->
    </div>
  </aside>

  <main>
    <h1 class="main-title">Breakfast Addon Wiki</h1>
    
    <div id="compiled-content">
      {compiled_body}
    </div>

    <!-- Insert Food Reference Interactive Catalog -->
    <div id="interactive-catalog-placeholder" class="hidden">
      <div class="catalog-controls">
        <div class="catalog-search-row">
          <input type="text" class="catalog-search" id="catalogSearch" placeholder="Search foods, effects, or identifiers...">
          <button class="view-toggle" onclick="toggleCatalogView()" id="viewToggleBtn">
            📋 Table View
          </button>
        </div>
        <div class="filter-buttons">
          <button class="btn-filter active" onclick="filterCatalog('all')" id="filter-all">All Tiers</button>
          <button class="btn-filter" onclick="filterCatalog('snacks')" id="filter-snacks">Quick Snacks</button>
          <button class="btn-filter" onclick="filterCatalog('meals')" id="filter-meals">Hearty Meals</button>
          <button class="btn-filter" onclick="filterCatalog('feasts')" id="filter-feasts">Feasts &amp; Advanced</button>
        </div>
      </div>
      
      <div class="catalog-grid" id="catalogGrid">
        <!-- Rendered by JS -->
      </div>
    </div>

    <footer>
      <p>Breakfast Addon Wiki &bull; Keep your mornings delicious.</p>
    </footer>
  </main>

  <script>
    // Embedded JSON data for food items
    const FOOD_ITEMS_DATA = {food_json};

    // Sidebar Collapsible State Management
    function toggleSidebar() {{
      document.body.classList.toggle("sidebar-collapsed");
      const isCollapsed = document.body.classList.contains("sidebar-collapsed");
      localStorage.setItem("wiki-sidebar-collapsed", isCollapsed);
    }}

    // Restore sidebar state
    const isSidebarCollapsed = localStorage.getItem("wiki-sidebar-collapsed") === "true";
    if (isSidebarCollapsed) {{
      document.body.classList.add("sidebar-collapsed");
    }} else if (window.innerWidth <= 1200) {{
      document.body.classList.add("sidebar-collapsed");
    }}

    // Theme Management
    function toggleTheme() {{
      const currentTheme = document.documentElement.getAttribute("data-theme");
      const targetTheme = currentTheme === "dark" ? "light" : "dark";
      setTheme(targetTheme);
    }}

    function setTheme(theme) {{
      document.documentElement.setAttribute("data-theme", theme);
      localStorage.setItem("wiki-theme", theme);
      const btn = document.getElementById("themeBtn");
      if (theme === "dark") {{
        btn.innerHTML = "☀️ Light Mode";
      }} else {{
        btn.innerHTML = "🌙 Dark Mode";
      }}
    }}

    // Auto-detect theme preference
    const savedTheme = localStorage.getItem("wiki-theme");
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (savedTheme) {{
      setTheme(savedTheme);
    }} else if (systemPrefersDark) {{
      setTheme("dark");
    }} else {{
      setTheme("light");
    }}

    // Client-side Navigation Sidebar Generation & Active Highlighting
    const sidebarNav = document.getElementById("sidebarNav");
    const headings = document.querySelectorAll("h2, h3");
    
    headings.forEach(h => {{
      if (!h.id) return;
      const link = document.createElement("a");
      link.href = "#" + h.id;
      link.innerText = h.innerText;
      link.className = "nav-item";
      if (h.tagName === "H3") {{
        link.classList.add("nav-sub-item");
      }}
      sidebarNav.appendChild(link);
    }});

    // Intersection Observer to highlight current active header
    const observerOptions = {{
      root: null,
      rootMargin: "0px 0px -60% 0px",
      threshold: 0
    }};

    const observer = new IntersectionObserver(entries => {{
      entries.forEach(entry => {{
        if (entry.isIntersecting) {{
          const activeId = entry.target.id;
          document.querySelectorAll(".nav-item").forEach(item => {{
            item.classList.toggle("active", item.getAttribute("href") === "#" + activeId);
          }});
        }}
      }});
    }}, observerOptions);

    headings.forEach(h => observer.observe(h));

    // Interactive Food Catalog Injection & View toggling
    let catalogViewMode = "cards"; // cards or table
    let activeFilter = "all";

    function initCatalog() {{
      // Try both possible heading IDs due to heading numbering
      const foodGuideHeader = document.getElementById("4-food-reference-guide") || document.getElementById("food-reference-guide");
      if (!foodGuideHeader) {{
        console.warn("Could not find food reference guide element to insert interactive catalog.");
        return;
      }}
      
      // Move catalog controls to directly after Section 4 Header
      const catalogEl = document.getElementById("interactive-catalog-placeholder");
      catalogEl.classList.remove("hidden");
      foodGuideHeader.parentNode.insertBefore(catalogEl, foodGuideHeader.nextSibling);
      
      renderCatalogCards();
      
      // Hook up search listener
      document.getElementById("catalogSearch").addEventListener("input", () => {{
        if (catalogViewMode === "cards") {{
          renderCatalogCards();
        }} else {{
          filterCatalogTable();
        }}
      }});
    }}

    function renderCatalogCards() {{
      const grid = document.getElementById("catalogGrid");
      grid.innerHTML = "";
      
      const searchVal = document.getElementById("catalogSearch").value.toLowerCase();
      
      const filtered = FOOD_ITEMS_DATA.filter(item => {{
        const matchesFilter = activeFilter === "all" || item.tier === activeFilter;
        const matchesSearch = item.name.toLowerCase().includes(searchVal) || 
                              item.id.toLowerCase().includes(searchVal) || 
                              item.buffs.toLowerCase().includes(searchVal);
        return matchesFilter && matchesSearch;
      }});

      if (filtered.length === 0) {{
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 40px;">No items match your search or filter.</p>';
        return;
      }}
      
      filtered.forEach(item => {{
        const card = document.createElement("div");
        card.className = "catalog-card";
        
        card.innerHTML = `
          <div class="card-tier-indicator card-tier-${{item.tier}}">${{item.tierName}}</div>
          <div class="card-header">
            <div class="card-icon-frame">
              <img src="${{item.icon}}" class="card-icon pixelated" alt="${{item.name}}" onerror="this.src='breakfast_icon.png'">
            </div>
            <div class="card-title-group">
              <h4 class="card-title">${{item.name}}</h4>
              <span class="card-id">${{item.id}}</span>
            </div>
          </div>
          <div class="card-stats">
            <div class="card-stat-box">
              <span class="card-stat-label">Nutrition</span>
              <span class="card-stat-value">${{item.nutrition}}</span>
            </div>
            <div class="card-stat-box">
              <span class="card-stat-label">Saturation</span>
              <span class="card-stat-value">${{item.saturation}}</span>
            </div>
            <div class="card-stat-box">
              <span class="card-stat-label">Eat Speed</span>
              <span class="card-stat-value">${{item.speed}}</span>
            </div>
          </div>
          <div class="card-buffs">
            ${{item.buffs}}
          </div>
        `;
        grid.appendChild(card);
      }});
    }}

    function filterCatalog(tier) {{
      activeFilter = tier;
      document.querySelectorAll(".btn-filter").forEach(b => {{
        b.classList.toggle("active", b.id === "filter-" + tier);
      }});
      if (catalogViewMode === "cards") {{
        renderCatalogCards();
      }} else {{
        filterCatalogTable();
      }}
    }}

    function toggleCatalogView() {{
      const mdTables = document.querySelectorAll(".food-reference-table");
      const grid = document.getElementById("catalogGrid");
      const toggleBtn = document.getElementById("viewToggleBtn");
      
      if (catalogViewMode === "cards") {{
        catalogViewMode = "table";
        toggleBtn.innerHTML = "🎴 Card View";
        grid.classList.add("hidden");
        // Show markdown tables and filter them instead
        mdTables.forEach(t => t.closest(".table-container").classList.remove("hidden"));
        filterCatalogTable();
      }} else {{
        catalogViewMode = "cards";
        toggleBtn.innerHTML = "📋 Table View";
        grid.classList.remove("hidden");
        // Hide markdown tables
        mdTables.forEach(t => t.closest(".table-container").classList.add("hidden"));
        renderCatalogCards();
      }}
    }}

    function filterCatalogTable() {{
      const searchVal = document.getElementById("catalogSearch").value.toLowerCase();
      const tables = document.querySelectorAll(".food-reference-table");
      
      tables.forEach(table => {{
        let precedingHeading = table.closest(".table-container").previousElementSibling;
        while (precedingHeading && !["H3", "H2"].includes(precedingHeading.tagName)) {{
          precedingHeading = precedingHeading.previousElementSibling;
        }}
        const tierName = precedingHeading ? precedingHeading.innerText.toLowerCase() : "";
        
        let showTable = true;
        if (activeFilter === "snacks" && !tierName.includes("snack")) showTable = false;
        else if (activeFilter === "meals" && !tierName.includes("meals")) showTable = false;
        else if (activeFilter === "feasts" && !(tierName.includes("feast") || tierName.includes("advanced"))) showTable = false;
        
        const tableContainer = table.closest(".table-container");
        if (!showTable) {{
          tableContainer.classList.add("hidden");
          if (precedingHeading && precedingHeading.tagName === "H3") precedingHeading.classList.add("hidden");
          return;
        }}
        
        tableContainer.classList.remove("hidden");
        if (precedingHeading && precedingHeading.tagName === "H3") precedingHeading.classList.remove("hidden");
        
        const rows = table.querySelectorAll("tbody tr");
        let visibleRows = 0;
        
        rows.forEach(row => {{
          const cells = row.innerText.toLowerCase();
          const matchesSearch = cells.includes(searchVal);
          row.classList.toggle("hidden", !matchesSearch);
          if (matchesSearch) visibleRows++;
        }});
        
        if (visibleRows === 0) {{
          tableContainer.classList.add("hidden");
          if (precedingHeading && precedingHeading.tagName === "H3") precedingHeading.classList.add("hidden");
        }}
      }});
    }}

    // Initialize catalog and view mode
    window.addEventListener("DOMContentLoaded", () => {{
      initCatalog();
      // Initially hide standard tables in favor of cards
      const mdTables = document.querySelectorAll(".food-reference-table");
      mdTables.forEach(t => t.closest(".table-container").classList.add("hidden"));
    }});
  </script>
</body>
</html>
"""

    with open(WIKI_HTML_PATH, "w", encoding="utf-8") as f:
        f.write(html_template)
        
    print(f"Success! Compiled docs/WIKI_GUIDE.md -> docs/wiki.html")
    print(f"Total resolved food catalog records: {len(food_records)}")

if __name__ == "__main__":
    main()
