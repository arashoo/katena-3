@echo off
echo Creating Node.js deployment package (like deployment-files 1.00)...
echo.

REM Clean previous builds
if exist katena3-nodejs-deployment.zip del katena3-nodejs-deployment.zip
if exist deployment-build rmdir /s /q deployment-build

REM Create deployment directory
mkdir deployment-build

REM Build the frontend first
echo Building frontend...
call npm run build

REM Copy built frontend files to root of deployment
echo Copying frontend build...
xcopy /E /I dist\* deployment-build\

REM Copy backend files
echo Copying backend server...
copy backend\server.js deployment-build\
copy backend\package.json deployment-build\

REM Copy data files
echo Copying data...
mkdir deployment-build\data
copy backend\data\*.json deployment-build\data\

REM Create deployment instructions
echo Creating deployment instructions...
echo # Katena3 Node.js Deployment Package > deployment-build\DEPLOY_INSTRUCTIONS.md
echo. >> deployment-build\DEPLOY_INSTRUCTIONS.md
echo ## Installation on cPanel/Hosting >> deployment-build\DEPLOY_INSTRUCTIONS.md
echo. >> deployment-build\DEPLOY_INSTRUCTIONS.md
echo ### Files Included >> deployment-build\DEPLOY_INSTRUCTIONS.md
echo - Frontend: Built React app (index.html, assets/) >> deployment-build\DEPLOY_INSTRUCTIONS.md
echo - Backend: server.js (Node.js server) >> deployment-build\DEPLOY_INSTRUCTIONS.md
echo - Backend: package.json (dependencies) >> deployment-build\DEPLOY_INSTRUCTIONS.md
echo - Data: Complete glass inventory and orders >> deployment-build\DEPLOY_INSTRUCTIONS.md
echo. >> deployment-build\DEPLOY_INSTRUCTIONS.md
echo ### Installation Steps >> deployment-build\DEPLOY_INSTRUCTIONS.md
echo. >> deployment-build\DEPLOY_INSTRUCTIONS.md
echo 1. **Upload Files**: Extract and upload all files to your web directory >> deployment-build\DEPLOY_INSTRUCTIONS.md
echo. >> deployment-build\DEPLOY_INSTRUCTIONS.md
echo 2. **Install Dependencies**: >> deployment-build\DEPLOY_INSTRUCTIONS.md
echo    ```bash >> deployment-build\DEPLOY_INSTRUCTIONS.md
echo    npm install >> deployment-build\DEPLOY_INSTRUCTIONS.md
echo    ``` >> deployment-build\DEPLOY_INSTRUCTIONS.md
echo. >> deployment-build\DEPLOY_INSTRUCTIONS.md
echo 3. **Start Server**: >> deployment-build\DEPLOY_INSTRUCTIONS.md
echo    ```bash >> deployment-build\DEPLOY_INSTRUCTIONS.md
echo    npm start >> deployment-build\DEPLOY_INSTRUCTIONS.md
echo    ``` >> deployment-build\DEPLOY_INSTRUCTIONS.md
echo    Or: >> deployment-build\DEPLOY_INSTRUCTIONS.md
echo    ```bash >> deployment-build\DEPLOY_INSTRUCTIONS.md
echo    node server.js >> deployment-build\DEPLOY_INSTRUCTIONS.md
echo    ``` >> deployment-build\DEPLOY_INSTRUCTIONS.md
echo. >> deployment-build\DEPLOY_INSTRUCTIONS.md
echo 4. **Access Application**: Open your domain in browser >> deployment-build\DEPLOY_INSTRUCTIONS.md
echo. >> deployment-build\DEPLOY_INSTRUCTIONS.md
echo 5. **Login**: Use passkey "9220katena" >> deployment-build\DEPLOY_INSTRUCTIONS.md
echo. >> deployment-build\DEPLOY_INSTRUCTIONS.md
echo ### Features >> deployment-build\DEPLOY_INSTRUCTIONS.md
echo - Complete glass inventory (2,330+ pieces) >> deployment-build\DEPLOY_INSTRUCTIONS.md
echo - Password protection with 24-hour sessions >> deployment-build\DEPLOY_INSTRUCTIONS.md
echo - Advanced filtering and search >> deployment-build\DEPLOY_INSTRUCTIONS.md
echo - Reservation management >> deployment-build\DEPLOY_INSTRUCTIONS.md
echo - Export functionality >> deployment-build\DEPLOY_INSTRUCTIONS.md
echo - Backlog management >> deployment-build\DEPLOY_INSTRUCTIONS.md
echo. >> deployment-build\DEPLOY_INSTRUCTIONS.md
echo ### Troubleshooting >> deployment-build\DEPLOY_INSTRUCTIONS.md
echo - Ensure Node.js is available on your hosting >> deployment-build\DEPLOY_INSTRUCTIONS.md
echo - Check that port 3001 is available or configure different port >> deployment-build\DEPLOY_INSTRUCTIONS.md
echo - Verify all files uploaded correctly >> deployment-build\DEPLOY_INSTRUCTIONS.md
echo - Check server logs for any errors >> deployment-build\DEPLOY_INSTRUCTIONS.md
echo. >> deployment-build\DEPLOY_INSTRUCTIONS.md
echo ### Technical Details >> deployment-build\DEPLOY_INSTRUCTIONS.md
echo - Server: Node.js/Express on port 3001 >> deployment-build\DEPLOY_INSTRUCTIONS.md
echo - Frontend: React (served as static files) >> deployment-build\DEPLOY_INSTRUCTIONS.md
echo - Data: JSON files with full inventory >> deployment-build\DEPLOY_INSTRUCTIONS.md
echo - API: RESTful endpoints for data management >> deployment-build\DEPLOY_INSTRUCTIONS.md

REM Create package.json if it doesn't exist or is missing dependencies
echo Ensuring package.json has all dependencies...
echo { > deployment-build\package-temp.json
echo   "name": "katena3-deployment", >> deployment-build\package-temp.json
echo   "version": "1.02", >> deployment-build\package-temp.json
echo   "description": "Katena3 Glass Inventory Management System", >> deployment-build\package-temp.json
echo   "main": "server.js", >> deployment-build\package-temp.json
echo   "scripts": { >> deployment-build\package-temp.json
echo     "start": "node server.js" >> deployment-build\package-temp.json
echo   }, >> deployment-build\package-temp.json
echo   "dependencies": { >> deployment-build\package-temp.json
echo     "express": "^4.18.2", >> deployment-build\package-temp.json
echo     "cors": "^2.8.5", >> deployment-build\package-temp.json
echo     "fs-extra": "^11.1.1", >> deployment-build\package-temp.json
echo     "uuid": "^9.0.0" >> deployment-build\package-temp.json
echo   } >> deployment-build\package-temp.json
echo } >> deployment-build\package-temp.json

REM Replace package.json with the corrected version
move deployment-build\package-temp.json deployment-build\package.json

REM Create zip file
echo Creating deployment package...
powershell -command "Add-Type -AssemblyName System.IO.Compression.FileSystem; [System.IO.Compression.ZipFile]::CreateFromDirectory('deployment-build', 'katena3-nodejs-deployment.zip')"

REM Clean up temporary directory
rmdir /s /q deployment-build

echo.
echo ========================================
echo 🚀 NODE.JS DEPLOYMENT PACKAGE CREATED!
echo ========================================
echo File: katena3-nodejs-deployment.zip
echo.
dir katena3-nodejs-deployment.zip
echo.
echo Package includes:
echo ✅ Built React frontend (index.html, assets/)
echo ✅ Node.js backend server (server.js)
echo ✅ Dependencies (package.json)
echo ✅ Complete glass inventory data
echo ✅ Deployment instructions
echo.
echo Next steps:
echo 1. Upload katena3-nodejs-deployment.zip to cPanel
echo 2. Extract all files
echo 3. Run: npm install
echo 4. Run: npm start (or node server.js)
echo 5. Access your site and login with: 9220katena
echo ========================================