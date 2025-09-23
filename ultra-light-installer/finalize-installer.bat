@echo off
echo 🔧 Finalizing Ultra-Light Installer...
echo.

REM Check if source files exist
if not exist "..\src\index.js" (
    echo ❌ Error: Source files not found.
    echo Please run this from the project root directory.
    pause
    exit /b 1
)

echo 📦 Creating embedded source package...
cd ..
node ultra-light-installer\create-source-package.js

if exist "pdf-tools-source.zip" (
    echo ✅ Source package created successfully.

    REM Calculate final size
    for %%I in (pdf-tools-source.zip) do set size=%%~zI
    set /a sizeMB=!size!/1024/1024

    echo 📊 Source package size: !sizeMB! MB
    echo.
    echo 🎯 Ready for distribution!
    echo    - Share: ultra-light-installer\PDF-Tools-Ultra-Light-Setup.bat
    echo    - Total download for users: ~20MB + dependencies
    echo    - 90%+ smaller than traditional installers!

) else (
    echo ❌ Failed to create source package.
)

echo.
pause