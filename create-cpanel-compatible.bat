@echo off
echo Creating cPanel-compatible deployment package...
echo.

REM Clean previous builds
if exist katena3-cpanel-compatible.zip del katena3-cpanel-compatible.zip
if exist cpanel-deployment rmdir /s /q cpanel-deployment

REM Create deployment directory
mkdir cpanel-deployment

REM Build the frontend first
echo Building frontend...
call npm run build

REM Copy built frontend files to root of deployment
echo Copying frontend build...
xcopy /E /I dist\* cpanel-deployment\

REM Copy backend files
echo Copying backend server...
copy backend\server.js cpanel-deployment\
copy backend\package.json cpanel-deployment\

REM Copy data files
echo Copying data...
mkdir cpanel-deployment\data
copy backend\data\*.json cpanel-deployment\data\

REM Create simplified instructions
echo Creating instructions...
echo # Katena3 Deployment for cPanel > cpanel-deployment\README.txt
echo. >> cpanel-deployment\README.txt
echo INSTALLATION STEPS: >> cpanel-deployment\README.txt
echo. >> cpanel-deployment\README.txt
echo 1. Upload all files to your web directory >> cpanel-deployment\README.txt
echo 2. In cPanel Terminal, run: npm install >> cpanel-deployment\README.txt
echo 3. Run: npm start >> cpanel-deployment\README.txt
echo 4. Access your site and login with: 9220katena >> cpanel-deployment\README.txt
echo. >> cpanel-deployment\README.txt
echo FILES INCLUDED: >> cpanel-deployment\README.txt
echo - index.html (main app) >> cpanel-deployment\README.txt
echo - assets/ (CSS, JS, images) >> cpanel-deployment\README.txt
echo - server.js (Node.js backend) >> cpanel-deployment\README.txt
echo - package.json (dependencies) >> cpanel-deployment\README.txt
echo - data/ (glass inventory) >> cpanel-deployment\README.txt

REM Create package.json with correct dependencies
echo Ensuring correct package.json...
echo { > cpanel-deployment\package-correct.json
echo   "name": "katena3-cpanel", >> cpanel-deployment\package-correct.json
echo   "version": "1.02", >> cpanel-deployment\package-correct.json
echo   "description": "Katena3 Glass Inventory System", >> cpanel-deployment\package-correct.json
echo   "main": "server.js", >> cpanel-deployment\package-correct.json
echo   "scripts": { >> cpanel-deployment\package-correct.json
echo     "start": "node server.js" >> cpanel-deployment\package-correct.json
echo   }, >> cpanel-deployment\package-correct.json
echo   "dependencies": { >> cpanel-deployment\package-correct.json
echo     "express": "^4.18.2", >> cpanel-deployment\package-correct.json
echo     "cors": "^2.8.5", >> cpanel-deployment\package-correct.json
echo     "fs-extra": "^11.1.1", >> cpanel-deployment\package-correct.json
echo     "uuid": "^9.0.0" >> cpanel-deployment\package-correct.json
echo   } >> cpanel-deployment\package-correct.json
echo } >> cpanel-deployment\package-correct.json

REM Replace package.json
move cpanel-deployment\package-correct.json cpanel-deployment\package.json

REM Create ZIP using 7-Zip if available, otherwise use built-in compression
echo Creating cPanel-compatible zip...
where 7z >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo Using 7-Zip for better compatibility...
    7z a -tzip katena3-cpanel-compatible.zip cpanel-deployment\*
) else (
    echo Using PowerShell compression...
    powershell -command "Compress-Archive -Path 'cpanel-deployment\*' -DestinationPath 'katena3-cpanel-compatible.zip' -Force"
)

REM Also create TAR.GZ for better cPanel compatibility
echo Creating TAR.GZ alternative...
where tar >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    cd cpanel-deployment
    tar -czf ..\katena3-cpanel.tar.gz *
    cd ..
)

echo.
echo ========================================
echo cPanel-COMPATIBLE PACKAGES CREATED!
echo ========================================
echo.
dir katena3-cpanel-compatible.zip 2>nul
dir katena3-cpanel.tar.gz 2>nul
echo.
echo TRY THESE OPTIONS:
echo 1. Upload katena3-cpanel-compatible.zip
echo 2. If zip fails, try katena3-cpanel.tar.gz
echo 3. If both fail, upload files individually from cpanel-deployment folder
echo.
echo ========================================

REM Keep the folder for manual upload option
echo Keeping cpanel-deployment folder for manual upload option...
echo.
echo If extraction fails, you can manually upload these files:
dir cpanel-deployment