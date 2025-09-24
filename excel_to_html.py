#!/usr/bin/env python3
"""
Excel to HTML Table Converter
Extracts specified columns from an Excel file and creates a styled HTML table
"""

import pandas as pd
import sys
import argparse
from pathlib import Path

def create_html_template(title="Data Table"):
    """Create the HTML template with styling"""
    return """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>""" + title + """</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 20px;
            background-color: #f5f5f5;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background-color: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
        }
        
        h1 {
            text-align: center;
            color: #333;
            margin-bottom: 30px;
            font-size: 2em;
        }
        
        .table-container {
            overflow-x: auto;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
            font-size: 14px;
        }
        
        th {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 15px 12px;
            text-align: left;
            font-weight: 600;
            position: sticky;
            top: 0;
            z-index: 10;
        }
        
        th:first-child {
            border-top-left-radius: 8px;
        }
        
        th:last-child {
            border-top-right-radius: 8px;
        }
        
        td {
            padding: 12px;
            border-bottom: 1px solid #e0e0e0;
        }
        
        tr:hover {
            background-color: #f8f9ff;
        }
        
        tr:nth-child(even) {
            background-color: #f9f9f9;
        }
        
        /* Highlight reserved projects */
        .reserved {
            background-color: #fff3cd !important;
            font-weight: bold;
        }
        
        /* Highlight zero stock */
        .zero-stock {
            background-color: #f8d7da !important;
            color: #721c24;
        }
        
        .stats {
            margin-top: 20px;
            text-align: center;
            color: #666;
            font-size: 14px;
        }
        
        .export-info {
            margin-bottom: 20px;
            padding: 10px;
            background-color: #e7f3ff;
            border-left: 4px solid #2196F3;
            border-radius: 4px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>""" + title + """</h1>
        <div class="export-info">
            <strong>Generated:</strong> {timestamp}<br>
            <strong>Source:</strong> {source_file}<br>
            <strong>Columns:</strong> {columns}
        </div>
        <div class="table-container">
            <table>
                <thead>
                    <tr>
{header_row}
                    </tr>
                </thead>
                <tbody>
{table_rows}
                </tbody>
            </table>
        </div>
        <div class="stats">
            Total rows: {row_count} | Generated with Excel to HTML Converter
        </div>
    </div>
</body>
</html>"""

def process_excel_to_html(excel_file, columns=None, output_file=None, title="Glass Inventory"):
    """
    Convert Excel file to HTML table
    
    Args:
        excel_file (str): Path to Excel file
        columns (list): List of column names to extract (None = all columns)
        output_file (str): Output HTML file path (None = auto-generate)
        title (str): Title for the HTML page
    """
    
    try:
        # Read Excel file
        print(f"Reading Excel file: {excel_file}")
        df = pd.read_excel(excel_file)
        
        print(f"Found {len(df)} rows and {len(df.columns)} columns")
        print(f"Available columns: {list(df.columns)}")
        
        # Select specific columns if specified
        if columns:
            # Handle case-insensitive column matching
            available_cols = {col.lower(): col for col in df.columns}
            selected_cols = []
            
            for col in columns:
                col_lower = col.lower()
                if col_lower in available_cols:
                    selected_cols.append(available_cols[col_lower])
                else:
                    print(f"Warning: Column '{col}' not found. Available columns: {list(df.columns)}")
            
            if selected_cols:
                df = df[selected_cols]
                print(f"Selected columns: {selected_cols}")
            else:
                print("No valid columns found. Using all columns.")
        
        # Generate output filename if not specified
        if not output_file:
            input_path = Path(excel_file)
            output_file = input_path.parent / f"{input_path.stem}_table.html"
        
        # Create HTML content
        template = create_html_template(title)
        
        # Generate header row
        header_cells = []
        for col in df.columns:
            header_cells.append(f"                        <th>{col}</th>")
        header_row = "\n".join(header_cells)
        
        # Generate table rows
        table_rows = []
        for _, row in df.iterrows():
            cells = []
            row_classes = []
            
            # Check for reserved projects and zero stock
            has_reserved = False
            has_zero_stock = False
            
            for col in df.columns:
                value = row[col]
                
                # Handle NaN values
                if pd.isna(value):
                    display_value = ""
                else:
                    display_value = str(value)
                
                # Check for reserved projects (common project names)
                if any(keyword in str(value).upper() for keyword in ['QUEEN', 'ROCKWELL', 'STOCK', 'WESTMOUNT', 'MARLSTONE', 'SOUTHTOWER']):
                    has_reserved = True
                
                # Check for zero stock (if column might be stock-related)
                if col.upper() in ['STOCK', 'STOCKS38', 'INVENTORY'] and str(value) == '0':
                    has_zero_stock = True
                
                cells.append(f"                        <td>{display_value}</td>")
            
            # Apply row styling
            row_class = ""
            if has_reserved:
                row_class = ' class="reserved"'
            elif has_zero_stock:
                row_class = ' class="zero-stock"'
            
            row_html = f"                    <tr{row_class}>\n" + "\n".join(cells) + "\n                    </tr>"
            table_rows.append(row_html)
        
        table_rows_html = "\n".join(table_rows)
        
        # Fill template
        from datetime import datetime
        html_content = template.replace("{timestamp}", datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
        html_content = html_content.replace("{source_file}", Path(excel_file).name)
        html_content = html_content.replace("{columns}", ", ".join(df.columns))
        html_content = html_content.replace("{header_row}", header_row)
        html_content = html_content.replace("{table_rows}", table_rows_html)
        html_content = html_content.replace("{row_count}", str(len(df)))
        
        # Write HTML file
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(html_content)
        
        print(f"✅ HTML table created successfully: {output_file}")
        print(f"📊 Processed {len(df)} rows with {len(df.columns)} columns")
        
        return output_file
        
    except FileNotFoundError:
        print(f"❌ Error: Excel file not found: {excel_file}")
        return None
    except Exception as e:
        print(f"❌ Error processing file: {str(e)}")
        return None

def main():
    parser = argparse.ArgumentParser(description='Convert Excel file to styled HTML table')
    parser.add_argument('excel_file', help='Path to Excel file')
    parser.add_argument('-c', '--columns', nargs='+', 
                      help='Specific columns to extract (e.g., -c "Width" "Height" "Stock")')
    parser.add_argument('-o', '--output', help='Output HTML file path')
    parser.add_argument('-t', '--title', default='Data Table', help='HTML page title')
    
    # If no arguments provided, show usage example
    if len(sys.argv) == 1:
        print("Excel to HTML Table Converter")
        print("=" * 40)
        print("\nUsage examples:")
        print("  python excel_to_html.py inventory.xlsx")
        print("  python excel_to_html.py inventory.xlsx -c Width Height Stock38 Rack")
        print("  python excel_to_html.py inventory.xlsx -o output.html -t 'Glass Inventory'")
        print("\nFor glass inventory specifically:")
        print("  python excel_to_html.py inventory.xlsx -c wide height 'RESERV PROJET' STOCKS38 Rack")
        return
    
    args = parser.parse_args()
    
    # Process the file
    result = process_excel_to_html(
        excel_file=args.excel_file,
        columns=args.columns,
        output_file=args.output,
        title=args.title
    )
    
    if result:
        print(f"\n🎉 Success! Open {result} in your browser to view the table.")

if __name__ == "__main__":
    main()