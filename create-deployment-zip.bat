@echo off
echo Creating Katena 3 Deployment Package...
echo.

REM Create zip file with deployment files
cd "deployment-files"
tar -a -c -f "../katena3-deployment.zip" *

cd ..
echo.
echo ✅ Deployment package created: katena3-deployment.zip
echo.
echo 📁 Contents:
echo    - server.js (Production server)
echo    - package.json (Dependencies)
echo    - dist/ (Built React app)
echo    - data/ (Your current inventory data)
echo    - DEPLOY_INSTRUCTIONS.md (Step-by-step guide)
echo.
echo 🚀 Ready to upload to cPanel!
echo.
pause