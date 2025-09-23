@echo off
echo ================================
echo Katena 3 v1.02 Deployment Package
echo ================================
echo.

REM Clean up existing files
if exist "katena3-v1.02-deployment" rmdir /s /q "katena3-v1.02-deployment"
if exist "katena3-v1.02-deployment.zip" del "katena3-v1.02-deployment.zip"

REM Create deployment directory
mkdir "katena3-v1.02-deployment"

echo [1/6] Copying frontend build files...
xcopy /e /i /y dist "katena3-v1.02-deployment\dist" >nul

echo [2/6] Copying backend files...
xcopy /e /i /y backend "katena3-v1.02-deployment\backend" >nul

echo [3/6] Copying deployment configuration...
if exist "deployment-files 1.01" (
    copy "deployment-files 1.01\*.js" "katena3-v1.02-deployment\" >nul 2>&1
    copy "deployment-files 1.01\*.json" "katena3-v1.02-deployment\" >nul 2>&1
    copy "deployment-files 1.01\.htaccess" "katena3-v1.02-deployment\" >nul 2>&1
    copy "deployment-files 1.01\*.md" "katena3-v1.02-deployment\" >nul 2>&1
)

echo [4/6] Copying documentation and references...
copy README.md "katena3-v1.02-deployment\" >nul 2>&1
copy DEPLOYMENT_READY.md "katena3-v1.02-deployment\" >nul 2>&1
copy glass-shipment-table.html "katena3-v1.02-deployment\" >nul 2>&1
copy package.json "katena3-v1.02-deployment\" >nul 2>&1

echo [5/6] Creating deployment README...
echo # Katena 3 Glass Inventory Management System v1.02 > "katena3-v1.02-deployment\DEPLOYMENT_README.md"
echo ## Production Deployment Package >> "katena3-v1.02-deployment\DEPLOYMENT_README.md"
echo. >> "katena3-v1.02-deployment\DEPLOYMENT_README.md"
echo ### What's New in v1.02: >> "katena3-v1.02-deployment\DEPLOYMENT_README.md"
echo - Password Protection: Secure access with 24-hour session persistence >> "katena3-v1.02-deployment\DEPLOYMENT_README.md"
echo - Thickness Column: Complete glass thickness tracking and filtering >> "katena3-v1.02-deployment\DEPLOYMENT_README.md"
echo - Glass Shipment: Imported 2,330 pieces from JOYO-KR-250001/0002 >> "katena3-v1.02-deployment\DEPLOYMENT_README.md"
echo - Enhanced Security: Login/logout functionality with localStorage >> "katena3-v1.02-deployment\DEPLOYMENT_README.md"
echo. >> "katena3-v1.02-deployment\DEPLOYMENT_README.md"
echo ### Quick Setup: >> "katena3-v1.02-deployment\DEPLOYMENT_README.md"
echo 1. Upload all files to your web server >> "katena3-v1.02-deployment\DEPLOYMENT_README.md"
echo 2. Install Node.js dependencies: npm install >> "katena3-v1.02-deployment\DEPLOYMENT_README.md"
echo 3. Start backend server: npm start (runs on port 3001^) >> "katena3-v1.02-deployment\DEPLOYMENT_README.md"
echo 4. Configure web server to serve frontend files >> "katena3-v1.02-deployment\DEPLOYMENT_README.md"
echo 5. Access system with passkey: 9220katena >> "katena3-v1.02-deployment\DEPLOYMENT_README.md"
echo. >> "katena3-v1.02-deployment\DEPLOYMENT_README.md"
echo ### Security: >> "katena3-v1.02-deployment\DEPLOYMENT_README.md"
echo - Default passkey: 9220katena >> "katena3-v1.02-deployment\DEPLOYMENT_README.md"
echo - 24-hour session persistence >> "katena3-v1.02-deployment\DEPLOYMENT_README.md"
echo - Secure logout functionality >> "katena3-v1.02-deployment\DEPLOYMENT_README.md"

echo [6/6] Creating deployment package...
powershell Compress-Archive -Path "katena3-v1.02-deployment\*" -DestinationPath "katena3-v1.02-deployment.zip" -Force

REM Cleanup
rmdir /s /q "katena3-v1.02-deployment"

echo.
echo ================================
echo   DEPLOYMENT PACKAGE CREATED!
echo ================================
echo.
echo Package: katena3-v1.02-deployment.zip
echo Version: 1.02
echo Passkey: 9220katena
echo.
echo Ready for production deployment!
echo.
pause