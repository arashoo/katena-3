@echo off
echo Creating Katena 3 Deployment Package...
echo.

REM Create deployment directory
if exist katena3-deployment rmdir /s /q katena3-deployment
mkdir katena3-deployment

REM Copy frontend build files
echo Copying frontend build files...
xcopy /e /i /y dist katena3-deployment\dist

REM Copy backend files
echo Copying backend files...
mkdir katena3-deployment\backend
xcopy /e /i /y backend katena3-deployment\backend

REM Copy deployment specific files
echo Copying deployment files...
if exist "deployment-files 1.01" (
    copy "deployment-files 1.01\*.js" katena3-deployment\ >nul 2>&1
    copy "deployment-files 1.01\*.json" katena3-deployment\ >nul 2>&1
    copy "deployment-files 1.01\.htaccess" katena3-deployment\ >nul 2>&1
    copy "deployment-files 1.01\TROUBLESHOOTING.md" katena3-deployment\ >nul 2>&1
)

REM Copy additional files
echo Copying additional files...
copy README.md katena3-deployment\ >nul 2>&1
copy DEPLOYMENT_READY.md katena3-deployment\ >nul 2>&1
copy glass-shipment-table.html katena3-deployment\ >nul 2>&1

REM Create zip file
echo Creating zip file...
powershell Compress-Archive -Path katena3-deployment\* -DestinationPath katena3-deployment.zip -Force

REM Cleanup temporary directory
rmdir /s /q katena3-deployment

echo.
echo ✅ Deployment package created: katena3-deployment.zip
echo.
echo Contents:
echo - Frontend: Optimized build files (dist/)
echo - Backend: API server and data files
echo - Configuration: Package.json, server files
echo - Documentation: README and troubleshooting guide
echo - Glass Shipment: HTML table reference
echo.
echo Ready for deployment to web server!
pause