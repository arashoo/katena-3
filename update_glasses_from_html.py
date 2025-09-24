#!/usr/bin/env python3
"""
Compare HTML table data with glasses.json and update the JSON file
"""

import pandas as pd
import json
import re
from pathlib import Path
from bs4 import BeautifulSoup
import sys

def parse_html_table(html_file):
    """Parse HTML table and return DataFrame"""
    print(f"Reading HTML file: {html_file}")
    
    with open(html_file, 'r', encoding='utf-8') as f:
        html_content = f.read()
    
    soup = BeautifulSoup(html_content, 'html.parser')
    table = soup.find('table')
    
    if not table:
        print("❌ No table found in HTML file")
        return None
    
    # Extract headers
    headers = []
    header_row = table.find('thead').find('tr')
    for th in header_row.find_all('th'):
        headers.append(th.get_text().strip())
    
    # Extract data rows
    data = []
    tbody = table.find('tbody')
    for tr in tbody.find_all('tr'):
        row = []
        for td in tr.find_all('td'):
            text = td.get_text().strip()
            # Try to convert numeric strings to numbers
            if text and text.replace('.', '').replace(',', '').isdigit():
                try:
                    row.append(float(text) if '.' in text else int(text))
                except ValueError:
                    row.append(text if text else None)
            elif text and text.replace('.', '').replace(',', '').replace('-', '').isdigit():
                # Handle negative numbers
                try:
                    row.append(float(text) if '.' in text else int(text))
                except ValueError:
                    row.append(text if text else None)
            else:
                row.append(text if text else None)
        data.append(row)
    
    df = pd.DataFrame(data, columns=headers)
    print(f"Found {len(df)} rows with columns: {headers}")
    return df

def normalize_color(color):
    """Normalize color names for consistent matching"""
    if not color or pd.isna(color):
        return "Clear"
    
    color = str(color).lower().strip()
    
    # Color mappings
    color_map = {
        'clear': 'Clear',
        'acid_div': 'Acid Etched',
        'acid-div': 'Acid Etched',
        'blue': 'Blue',
        'gray': 'Gray',
        'grey': 'Gray',
        'brown': 'Brown',
        'bronze': 'Bronze',
        'gris': 'Gray'
    }
    
    return color_map.get(color, color.title())

def create_glass_id(width, height, color):
    """Create standardized glass ID"""
    color_normalized = normalize_color(color)
    color_short = color_normalized.lower().replace(' ', '_').replace('-', '_')
    return f"{int(width)}x{int(height)}_{color_short}_group"

def parse_reserved_project(project_str):
    """Parse reserved project string and return project name"""
    if not project_str or pd.isna(project_str) or str(project_str).strip() == '':
        return None
    
    project_str = str(project_str).strip().upper()
    
    # List of known project names
    known_projects = [
        'QUEEN', 'ROCKWELL', 'STOCK', 'WESTMOUNT', 'MARLSTONE', 
        'SOUTHTOWER', 'PARKLAND', 'FINCH', 'BESLING', 'HOWTHORNE'
    ]
    
    for project in known_projects:
        if project in project_str:
            return project
    
    return project_str if project_str else None

def load_glasses_json(json_file):
    """Load existing glasses.json file"""
    try:
        with open(json_file, 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        print(f"❌ JSON file not found: {json_file}")
        return []
    except json.JSONDecodeError as e:
        print(f"❌ Error parsing JSON: {e}")
        return []

def update_glasses_json(html_file, json_file, output_file=None):
    """Update glasses.json based on HTML table data"""
    
    # Parse HTML table
    df = parse_html_table(html_file)
    if df is None:
        return False
    
    # Load existing JSON data
    existing_glasses = load_glasses_json(json_file)
    
    # Create lookup dictionary for existing glasses
    existing_lookup = {}
    for glass in existing_glasses:
        key = f"{glass['width']}x{glass['height']}_{normalize_color(glass['color']).lower().replace(' ', '_')}"
        existing_lookup[key] = glass
    
    print(f"Loaded {len(existing_glasses)} existing glass entries")
    
    # Process HTML data
    updated_glasses = []
    new_glasses = []
    updated_count = 0
    
    for _, row in df.iterrows():
        width = row['wide']
        height = row['height']
        reserved_project = parse_reserved_project(row.get('RESERV PROJET'))
        stock = row.get('STOCKS38', 0)
        rack = row.get('Rack', '')
        
        # Skip invalid entries
        if pd.isna(width) or pd.isna(height) or width <= 0 or height <= 0:
            continue
        
        # Try to infer color from existing data or default to Clear
        color = 'Clear'
        
        # Create lookup key
        lookup_key = f"{int(width)}x{int(height)}_clear"
        
        # Check if glass exists in JSON
        if lookup_key in existing_lookup:
            glass = existing_lookup[lookup_key].copy()
            
            # Update stock count
            old_stock = glass.get('count', 0)
            new_stock = int(stock) if not pd.isna(stock) else 0
            
            if old_stock != new_stock:
                glass['count'] = new_stock
                glass['availableCount'] = max(0, new_stock - glass.get('reservedCount', 0))
                updated_count += 1
                print(f"Updated {width}x{height} Clear: {old_stock} → {new_stock}")
            
            # Update reserved project
            if reserved_project:
                if reserved_project not in glass.get('reservedProjects', []):
                    glass['reservedProjects'] = glass.get('reservedProjects', [])
                    if reserved_project not in glass['reservedProjects']:
                        glass['reservedProjects'].append(reserved_project)
                glass['reservedProject'] = reserved_project
            
            # Update rack if provided
            if rack and str(rack).strip():
                if 'racks' not in glass:
                    glass['racks'] = []
                if str(rack) not in [str(r) for r in glass['racks']]:
                    glass['racks'].append(str(rack))
            
            updated_glasses.append(glass)
        else:
            # Create new glass entry
            glass_id = create_glass_id(width, height, color)
            new_stock = int(stock) if not pd.isna(stock) else 0
            
            new_glass = {
                "id": glass_id,
                "width": int(width),
                "height": int(height),
                "color": color,
                "heatSoaked": False,
                "racks": [str(rack)] if rack and str(rack).strip() else [],
                "count": new_stock,
                "availableCount": new_stock,
                "reservedCount": 0,
                "reservedProjects": [reserved_project] if reserved_project else [],
                "reservedProject": reserved_project,
                "thickness": "6mm"
            }
            
            new_glasses.append(new_glass)
            updated_glasses.append(new_glass)
            print(f"Created new entry: {width}x{height} Clear with stock {new_stock}")
    
    # Add existing glasses that weren't in the HTML (preserve them)
    html_keys = set()
    for _, row in df.iterrows():
        if not pd.isna(row['wide']) and not pd.isna(row['height']):
            key = f"{int(row['wide'])}x{int(row['height'])}_clear"
            html_keys.add(key)
    
    for key, glass in existing_lookup.items():
        if key not in html_keys:
            updated_glasses.append(glass)
    
    # Sort glasses for consistent output
    updated_glasses.sort(key=lambda x: (x['width'], x['height'], x['color']))
    
    # Save updated JSON
    output_file = output_file or json_file
    
    try:
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(updated_glasses, f, indent=2, ensure_ascii=False)
        
        print(f"\n✅ Successfully updated {output_file}")
        print(f"📊 Total glasses: {len(updated_glasses)}")
        print(f"🆕 New entries: {len(new_glasses)}")
        print(f"📝 Updated entries: {updated_count}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error saving JSON: {e}")
        return False

def main():
    html_file = "your_file_table.html"
    json_file = "backend/data/glasses.json"
    
    if len(sys.argv) > 1:
        html_file = sys.argv[1]
    if len(sys.argv) > 2:
        json_file = sys.argv[2]
    
    print("Glass Inventory JSON Updater")
    print("=" * 40)
    print(f"HTML Source: {html_file}")
    print(f"JSON Target: {json_file}")
    print()
    
    if not Path(html_file).exists():
        print(f"❌ HTML file not found: {html_file}")
        return
    
    if not Path(json_file).exists():
        print(f"❌ JSON file not found: {json_file}")
        return
    
    # Create backup
    backup_file = json_file.replace('.json', '_backup.json')
    import shutil
    shutil.copy2(json_file, backup_file)
    print(f"📋 Created backup: {backup_file}")
    
    # Update the JSON
    success = update_glasses_json(html_file, json_file)
    
    if success:
        print(f"\n🎉 Update complete! Check {json_file} for changes.")
    else:
        print("\n❌ Update failed.")

if __name__ == "__main__":
    main()