# Excel to HTML Converter

A Python script that converts Excel files to beautifully styled HTML tables. Perfect for creating web-viewable reports from your Excel data.

## Features

- ✅ Converts Excel files (.xlsx, .xls) to HTML tables
- ✅ Select specific columns to extract
- ✅ Automatic styling with responsive design
- ✅ Highlights reserved projects and zero stock items
- ✅ Sticky headers for large tables
- ✅ Export information and timestamps

## Quick Start

### Method 1: Easy Batch File (Windows)
1. Place your Excel file in this folder
2. Double-click `convert_excel.bat`
3. Enter your Excel filename when prompted
4. The HTML file will be generated automatically

### Method 2: Command Line

```bash
# Install dependencies (first time only)
pip install -r requirements.txt

# Convert entire Excel file
python excel_to_html.py inventory.xlsx

# Convert specific columns only
python excel_to_html.py inventory.xlsx -c "Width" "Height" "Stock" "Rack"

# For glass inventory specifically
python excel_to_html.py inventory.xlsx -c wide height "RESERV PROJET" STOCKS38 Rack
```

## Usage Examples

### Basic Conversion
```bash
python excel_to_html.py data.xlsx
```

### Select Specific Columns
```bash
python excel_to_html.py inventory.xlsx -c "Product" "Price" "Stock"
```

### Custom Output File and Title
```bash
python excel_to_html.py data.xlsx -o report.html -t "Monthly Sales Report"
```

### Glass Inventory (Your Use Case)
```bash
python excel_to_html.py glass_inventory.xlsx -c wide height "RESERV PROJET" STOCKS38 Rack -t "Glass Inventory"
```

## Command Line Options

- `excel_file` - Path to your Excel file (required)
- `-c, --columns` - Specific columns to extract (optional)
- `-o, --output` - Output HTML file path (optional, auto-generated if not specified)
- `-t, --title` - HTML page title (optional, default: "Data Table")

## Column Matching

The script automatically handles:
- Case-insensitive column matching
- Partial column name matching
- Displays available columns if specified columns aren't found

## Styling Features

### Automatic Highlighting
- **Yellow background**: Rows with reserved projects (QUEEN, ROCKWELL, STOCK, etc.)
- **Pink background**: Rows with zero stock
- **Hover effects**: Better readability when browsing large tables

### Responsive Design
- Mobile-friendly layout
- Horizontal scroll for wide tables
- Sticky headers that stay visible when scrolling

## File Structure

```
excel_to_html.py          # Main conversion script
convert_excel.bat         # Windows batch file for easy use
requirements.txt          # Python dependencies
README_excel_converter.md # This documentation
```

## Installation

### Prerequisites
- Python 3.6 or higher
- pip (Python package installer)

### Install Dependencies
```bash
pip install -r requirements.txt
```

Or manually:
```bash
pip install pandas openpyxl
```

## Troubleshooting

### "Module not found" Error
```bash
pip install pandas openpyxl
```

### "File not found" Error
- Check the Excel file path is correct
- Use quotes around file paths with spaces
- Ensure the file has .xlsx or .xls extension

### Column Names Not Found
- The script will show available column names
- Column matching is case-insensitive
- Check for typos in column names

## Example Output

The generated HTML file includes:
- Professional styling with gradients and shadows
- Export metadata (timestamp, source file, columns)
- Row count statistics
- Responsive table with sticky headers
- Automatic highlighting for special conditions

## Performance

- Handles large Excel files efficiently
- Tested with 400+ rows
- Memory-efficient processing
- Fast HTML generation

## License

Free to use and modify for your projects.