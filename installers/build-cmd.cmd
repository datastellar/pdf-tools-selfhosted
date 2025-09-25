@echo off
REM CMD-compatible build script untuk menghindari PowerShell execution policy issues
setlocal EnableDelayedExpansion

title PDF Tools - CMD Build System
echo.
echo ========================================
echo    PDF Tools Self-Hosted Builder
echo    CMD Compatible Version
echo ========================================
echo.

REM Parse arguments
set BUILD_TYPE=standard
if "%1"=="portable" set BUILD_TYPE=portable
if "%1"=="installer" set BUILD_TYPE=installer
if "%1"=="all" set BUILD_TYPE=all

echo Build Type: %BUILD_TYPE%
echo.

REM Check if Node.js is available
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js tidak ditemukan.
    echo Silakan install Node.js dari https://nodejs.org
    echo.
    pause
    exit /b 1
)

echo [OK] Node.js tersedia
echo.

REM Create directories
echo [1/5] Membuat direktori...
if not exist "dist" mkdir "dist"
if "%BUILD_TYPE%"=="portable" (
    if not exist "dist\portable" mkdir "dist\portable"
    set DIST_PATH=dist\portable
) else (
    set DIST_PATH=dist
)

REM Copy public files
echo [2/5] Menyalin file assets...
if exist "public" (
    xcopy "public" "!DIST_PATH!\public" /E /I /H /R /Y >nul
    echo [OK] Public files copied
) else (
    echo [WARNING] Public folder tidak ditemukan
)

REM Build executable jika pkg tersedia
echo [3/5] Building executable...
if "%BUILD_TYPE%" neq "portable" (
    REM Coba build dengan pkg, tapi jangan fail jika tidak ada
    pkg . --out-path "!DIST_PATH!" --targets node18-win-x64 >nul 2>&1
    if exist "!DIST_PATH!\pdf-tools-selfhosted.exe" (
        echo [OK] Executable berhasil dibuild
    ) else (
        echo [INFO] PKG build gagal, akan menggunakan node script
    )
)

REM Create startup scripts
echo [4/5] Membuat startup scripts...

REM Universal startup script yang work di semua environment
set STARTUP_SCRIPT=!DIST_PATH!\Start-PDF-Tools.bat
echo @echo off > "!STARTUP_SCRIPT!"
echo setlocal EnableDelayedExpansion >> "!STARTUP_SCRIPT!"
echo title PDF Tools Self-Hosted Server >> "!STARTUP_SCRIPT!"
echo color 0A >> "!STARTUP_SCRIPT!"
echo cls >> "!STARTUP_SCRIPT!"
echo. >> "!STARTUP_SCRIPT!"
echo echo ======================================== >> "!STARTUP_SCRIPT!"
echo echo    PDF Tools Self-Hosted Starting... >> "!STARTUP_SCRIPT!"
echo echo ======================================== >> "!STARTUP_SCRIPT!"
echo echo. >> "!STARTUP_SCRIPT!"
echo. >> "!STARTUP_SCRIPT!"
echo REM Determine the correct path to run from >> "!STARTUP_SCRIPT!"
echo set "SCRIPT_DIR=%%~dp0" >> "!STARTUP_SCRIPT!"
echo cd /d "%%SCRIPT_DIR%%" >> "!STARTUP_SCRIPT!"
echo. >> "!STARTUP_SCRIPT!"
echo REM Check if executable exists >> "!STARTUP_SCRIPT!"
echo if exist "pdf-tools-selfhosted.exe" ( >> "!STARTUP_SCRIPT!"
echo     echo [INFO] Menggunakan executable mode >> "!STARTUP_SCRIPT!"
echo     set "LAUNCH_CMD=pdf-tools-selfhosted.exe" >> "!STARTUP_SCRIPT!"
echo ^) else ( >> "!STARTUP_SCRIPT!"
echo     echo [INFO] Menggunakan Node.js mode >> "!STARTUP_SCRIPT!"
echo     set "LAUNCH_CMD=node ..\src\index.js" >> "!STARTUP_SCRIPT!"
echo ^) >> "!STARTUP_SCRIPT!"
echo. >> "!STARTUP_SCRIPT!"
echo echo Starting server... >> "!STARTUP_SCRIPT!"
echo echo Server akan tersedia di: http://localhost:3000 >> "!STARTUP_SCRIPT!"
echo echo. >> "!STARTUP_SCRIPT!"
echo echo Tunggu beberapa detik untuk server startup... >> "!STARTUP_SCRIPT!"
echo. >> "!STARTUP_SCRIPT!"
echo REM Start server in background >> "!STARTUP_SCRIPT!"
echo start /B "" %%LAUNCH_CMD%% >> "!STARTUP_SCRIPT!"
echo. >> "!STARTUP_SCRIPT!"
echo REM Wait for server to start dengan timeout >> "!STARTUP_SCRIPT!"
echo echo Menunggu server startup... >> "!STARTUP_SCRIPT!"
echo timeout /t 5 /nobreak ^>nul >> "!STARTUP_SCRIPT!"
echo. >> "!STARTUP_SCRIPT!"
echo REM Test if server is running >> "!STARTUP_SCRIPT!"
echo set "SERVER_READY=0" >> "!STARTUP_SCRIPT!"
echo for /L %%%%i in (1,1,10^) do ( >> "!STARTUP_SCRIPT!"
echo     curl -s http://localhost:3000 ^>nul 2^>^&1 >> "!STARTUP_SCRIPT!"
echo     if not errorlevel 1 ( >> "!STARTUP_SCRIPT!"
echo         set "SERVER_READY=1" >> "!STARTUP_SCRIPT!"
echo         goto :server_ready >> "!STARTUP_SCRIPT!"
echo     ^) >> "!STARTUP_SCRIPT!"
echo     timeout /t 1 /nobreak ^>nul >> "!STARTUP_SCRIPT!"
echo ^) >> "!STARTUP_SCRIPT!"
echo. >> "!STARTUP_SCRIPT!"
echo :server_ready >> "!STARTUP_SCRIPT!"
echo if "%%SERVER_READY%%"=="1" ( >> "!STARTUP_SCRIPT!"
echo     echo. >> "!STARTUP_SCRIPT!"
echo     echo ======================================== >> "!STARTUP_SCRIPT!"
echo     echo     SERVER BERHASIL STARTED! >> "!STARTUP_SCRIPT!"
echo     echo ======================================== >> "!STARTUP_SCRIPT!"
echo     echo. >> "!STARTUP_SCRIPT!"
echo     echo Membuka browser... >> "!STARTUP_SCRIPT!"
echo     start http://localhost:3000 >> "!STARTUP_SCRIPT!"
echo     echo. >> "!STARTUP_SCRIPT!"
echo     echo PDF Tools sekarang berjalan di: >> "!STARTUP_SCRIPT!"
echo     echo ^=^=^> http://localhost:3000 >> "!STARTUP_SCRIPT!"
echo     echo. >> "!STARTUP_SCRIPT!"
echo     echo Tekan Ctrl+C untuk stop server >> "!STARTUP_SCRIPT!"
echo     echo Atau tutup window ini >> "!STARTUP_SCRIPT!"
echo     echo. >> "!STARTUP_SCRIPT!"
echo ^) else ( >> "!STARTUP_SCRIPT!"
echo     echo. >> "!STARTUP_SCRIPT!"
echo     echo [ERROR] Server gagal start! >> "!STARTUP_SCRIPT!"
echo     echo. >> "!STARTUP_SCRIPT!"
echo     echo Troubleshooting: >> "!STARTUP_SCRIPT!"
echo     echo 1. Pastikan port 3000 tidak digunakan aplikasi lain >> "!STARTUP_SCRIPT!"
echo     echo 2. Coba restart sebagai Administrator >> "!STARTUP_SCRIPT!"
echo     echo 3. Check firewall settings >> "!STARTUP_SCRIPT!"
echo     echo. >> "!STARTUP_SCRIPT!"
echo     echo Coba buka manual: http://localhost:3000 >> "!STARTUP_SCRIPT!"
echo     echo. >> "!STARTUP_SCRIPT!"
echo ^) >> "!STARTUP_SCRIPT!"
echo. >> "!STARTUP_SCRIPT!"
echo pause >> "!STARTUP_SCRIPT!"

echo [OK] Startup script created: !STARTUP_SCRIPT!

REM Create installation scripts if needed
if "%BUILD_TYPE%" neq "portable" (
    echo [5/5] Membuat installer scripts...

    REM Simple installer
    set INSTALLER_SCRIPT=!DIST_PATH!\Install.cmd
    echo @echo off > "!INSTALLER_SCRIPT!"
    echo title PDF Tools - Installer >> "!INSTALLER_SCRIPT!"
    echo echo Installing PDF Tools Self-Hosted... >> "!INSTALLER_SCRIPT!"
    echo echo. >> "!INSTALLER_SCRIPT!"
    echo set INSTALL_DIR=%%USERPROFILE%%\PDF-Tools-Self-Hosted >> "!INSTALLER_SCRIPT!"
    echo if exist "%%INSTALL_DIR%%" rmdir /S /Q "%%INSTALL_DIR%%" >> "!INSTALLER_SCRIPT!"
    echo mkdir "%%INSTALL_DIR%%" >> "!INSTALLER_SCRIPT!"
    echo xcopy "*" "%%INSTALL_DIR%%" /E /I /H /R /Y ^>nul >> "!INSTALLER_SCRIPT!"
    echo echo Desktop shortcut akan dibuat... >> "!INSTALLER_SCRIPT!"
    echo echo [InternetShortcut] ^> "%%USERPROFILE%%\Desktop\PDF Tools.url" >> "!INSTALLER_SCRIPT!"
    echo echo URL=http://localhost:3000 ^>^> "%%USERPROFILE%%\Desktop\PDF Tools.url" >> "!INSTALLER_SCRIPT!"
    echo echo Installation complete! >> "!INSTALLER_SCRIPT!"
    echo pause >> "!INSTALLER_SCRIPT!"

    echo [OK] Installer created: !INSTALLER_SCRIPT!
) else (
    echo [5/5] Portable mode - no installer needed
)

echo.
echo ========================================
echo       BUILD COMPLETED SUCCESSFULLY!
echo ========================================
echo.
echo Build type: %BUILD_TYPE%
echo Output directory: !DIST_PATH!
echo.
echo Files created:
echo - Start-PDF-Tools.bat (Main launcher)
if "%BUILD_TYPE%" neq "portable" echo - Install.cmd (Simple installer)
if exist "!DIST_PATH!\pdf-tools-selfhosted.exe" echo - pdf-tools-selfhosted.exe (Executable)
echo - public\ (Web assets)
echo.
echo To test: Run "!DIST_PATH!\Start-PDF-Tools.bat"
echo.
pause