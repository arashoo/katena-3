@echo off
echo Excel to HTML Converter
echo ======================
echo.

REM Check if pandas is installed
python -c "import pandas" 2>nul
if errorlevel 1 (
    echo Installing required packages...
    pip install pandas openpyxl
    echo.
)

REM Check if file argument is provided
if "%~1"=="" (
    echo Usage: convert_excel.bat "path\to\your\file.xlsx"
    echo.
    echo Examples:
    echo   convert_excel.bat inventory.xlsx
    echo   convert_excel.bat "C:\path\to\inventory.xlsx"
    echo.
    pause
    exit /b
)

REM Run the conversion
echo Converting %1 to HTML...
python excel_to_html.py "%~1" -c wide height "RESERV PROJET" STOCKS38 Rack -t "Glass Inventory"

echo.
echo Conversion complete!
pause