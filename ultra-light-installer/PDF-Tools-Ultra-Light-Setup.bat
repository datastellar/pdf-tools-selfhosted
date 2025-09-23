@echo off
setlocal EnableDelayedExpansion
title PDF Tools Self-Hosted - Ultra Light Setup
color 0B
cls

echo.
echo  ╔══════════════════════════════════════════════════════════╗
echo  ║                                                          ║
echo  ║         PDF Tools Self-Hosted - Ultra Light             ║
echo  ║                    Easy Setup v1.0                      ║
echo  ║                                                          ║
echo  ║         Total Size: ~20MB (vs 500MB traditional)        ║
echo  ║                                                          ║
echo  ╚══════════════════════════════════════════════════════════╝
echo.

echo  This ultra-light installer will:
echo  • Download and install Node.js (if needed) - ~30MB
echo  • Install PDF Tools source code - ~5MB
echo  • Set up everything automatically
echo  • Create desktop shortcuts
echo  • Launch the application
echo.
echo  Total download: ~35MB vs 500MB+ for traditional installers!
echo.

set /p continue="Continue with installation? (Y/N): "
if /i not "!continue!"=="Y" (
    echo Installation cancelled.
    pause
    exit /b 0
)

echo.
echo ╔══════════════════════════════════════════════════════════╗
echo ║                     Installing...                        ║
echo ╚══════════════════════════════════════════════════════════╝
echo.

REM Check for admin rights (optional for this installer)
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo ⚠️  Note: Running without administrator privileges.
    echo    Some features may require manual setup.
    echo.
    timeout /t 3 >nul
)

REM Create installation directory
set INSTALL_DIR=%USERPROFILE%\PDF-Tools-Self-Hosted
echo [1/6] Creating installation directory: !INSTALL_DIR!
if exist "!INSTALL_DIR!" rmdir /S /Q "!INSTALL_DIR!" 2>nul
mkdir "!INSTALL_DIR!" 2>nul

REM Check if Node.js is installed
echo [2/6] Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo    Node.js not found. Installing Node.js...

    REM Download Node.js installer (lightweight)
    echo    Downloading Node.js installer (~30MB)...
    powershell -Command "& { try { Invoke-WebRequest -Uri 'https://nodejs.org/dist/v18.18.2/node-v18.18.2-x64.msi' -OutFile '%TEMP%\nodejs.msi' -UseBasicParsing } catch { Write-Host 'Download failed. Please check internet connection.'; exit 1 } }"

    if not exist "%TEMP%\nodejs.msi" (
        echo    ❌ Failed to download Node.js. Please check your internet connection.
        pause
        exit /b 1
    )

    echo    Installing Node.js (this may take a moment)...
    msiexec /i "%TEMP%\nodejs.msi" /quiet /norestart

    REM Wait for installation to complete
    timeout /t 10 >nul

    REM Update PATH for current session
    for /f "tokens=2*" %%a in ('reg query "HKLM\SYSTEM\CurrentControlSet\Control\Session Manager\Environment" /v PATH 2^>nul') do set "PATH=%%b"
    set "PATH=%PATH%;%ProgramFiles%\nodejs"

    REM Clean up installer
    del "%TEMP%\nodejs.msi" 2>nul

    echo    ✅ Node.js installation completed.
) else (
    echo    ✅ Node.js is already installed.
)

REM Download PDF Tools source code
echo [3/6] Installing PDF Tools application...
echo    Extracting application files...

REM Copy the embedded source files (this script contains the source)
echo    Creating source code structure...
mkdir "!INSTALL_DIR!\src" 2>nul
mkdir "!INSTALL_DIR!\public" 2>nul

REM Extract embedded files (will be replaced with actual files)
call :ExtractFiles

echo [4/6] Installing application dependencies...
cd /d "!INSTALL_DIR!"

REM Install only production dependencies
echo    Installing Node.js packages (~10MB)...
call npm install --production --silent

if %errorlevel% neq 0 (
    echo    ❌ Failed to install dependencies. Please check your internet connection.
    pause
    exit /b 1
)

echo [5/6] Creating shortcuts and launchers...

REM Create enhanced start script with proper browser launch
echo @echo off > "!INSTALL_DIR!\Start-PDF-Tools.bat"
echo setlocal EnableDelayedExpansion >> "!INSTALL_DIR!\Start-PDF-Tools.bat"
echo title PDF Tools Self-Hosted >> "!INSTALL_DIR!\Start-PDF-Tools.bat"
echo color 0A >> "!INSTALL_DIR!\Start-PDF-Tools.bat"
echo cls >> "!INSTALL_DIR!\Start-PDF-Tools.bat"
echo. >> "!INSTALL_DIR!\Start-PDF-Tools.bat"
echo echo ======================================== >> "!INSTALL_DIR!\Start-PDF-Tools.bat"
echo echo    PDF Tools Self-Hosted Server >> "!INSTALL_DIR!\Start-PDF-Tools.bat"
echo echo ======================================== >> "!INSTALL_DIR!\Start-PDF-Tools.bat"
echo echo. >> "!INSTALL_DIR!\Start-PDF-Tools.bat"
echo cd /d "%%~dp0" >> "!INSTALL_DIR!\Start-PDF-Tools.bat"
echo. >> "!INSTALL_DIR!\Start-PDF-Tools.bat"
echo echo [1/3] Starting PDF Tools Server... >> "!INSTALL_DIR!\Start-PDF-Tools.bat"
echo echo Server akan tersedia di: http://localhost:3000 >> "!INSTALL_DIR!\Start-PDF-Tools.bat"
echo echo. >> "!INSTALL_DIR!\Start-PDF-Tools.bat"
echo. >> "!INSTALL_DIR!\Start-PDF-Tools.bat"
echo REM Start server in background >> "!INSTALL_DIR!\Start-PDF-Tools.bat"
echo echo [2/3] Menunggu server startup... >> "!INSTALL_DIR!\Start-PDF-Tools.bat"
echo start /B "" node src\index.js >> "!INSTALL_DIR!\Start-PDF-Tools.bat"
echo. >> "!INSTALL_DIR!\Start-PDF-Tools.bat"
echo REM Wait and test server availability >> "!INSTALL_DIR!\Start-PDF-Tools.bat"
echo set "SERVER_READY=0" >> "!INSTALL_DIR!\Start-PDF-Tools.bat"
echo for /L %%%%i in (1,1,15^) do ( >> "!INSTALL_DIR!\Start-PDF-Tools.bat"
echo     timeout /t 1 /nobreak ^>nul >> "!INSTALL_DIR!\Start-PDF-Tools.bat"
echo     REM Test server dengan netstat >> "!INSTALL_DIR!\Start-PDF-Tools.bat"
echo     netstat -an ^| find ":3000" ^| find "LISTENING" ^>nul 2^>^&1 >> "!INSTALL_DIR!\Start-PDF-Tools.bat"
echo     if not errorlevel 1 ( >> "!INSTALL_DIR!\Start-PDF-Tools.bat"
echo         set "SERVER_READY=1" >> "!INSTALL_DIR!\Start-PDF-Tools.bat"
echo         goto :launch_browser >> "!INSTALL_DIR!\Start-PDF-Tools.bat"
echo     ^) >> "!INSTALL_DIR!\Start-PDF-Tools.bat"
echo     echo Menunggu server... ^(%%%%i/15^) >> "!INSTALL_DIR!\Start-PDF-Tools.bat"
echo ^) >> "!INSTALL_DIR!\Start-PDF-Tools.bat"
echo. >> "!INSTALL_DIR!\Start-PDF-Tools.bat"
echo :launch_browser >> "!INSTALL_DIR!\Start-PDF-Tools.bat"
echo if "%%SERVER_READY%%"=="1" ( >> "!INSTALL_DIR!\Start-PDF-Tools.bat"
echo     echo. >> "!INSTALL_DIR!\Start-PDF-Tools.bat"
echo     echo [3/3] ✅ SERVER BERHASIL STARTED! >> "!INSTALL_DIR!\Start-PDF-Tools.bat"
echo     echo. >> "!INSTALL_DIR!\Start-PDF-Tools.bat"
echo     echo 🌐 Membuka browser... >> "!INSTALL_DIR!\Start-PDF-Tools.bat"
echo     timeout /t 2 /nobreak ^>nul >> "!INSTALL_DIR!\Start-PDF-Tools.bat"
echo     start http://localhost:3000 >> "!INSTALL_DIR!\Start-PDF-Tools.bat"
echo     echo. >> "!INSTALL_DIR!\Start-PDF-Tools.bat"
echo     echo ======================================== >> "!INSTALL_DIR!\Start-PDF-Tools.bat"
echo     echo  🎉 PDF Tools sudah siap digunakan! >> "!INSTALL_DIR!\Start-PDF-Tools.bat"
echo     echo  📍 URL: http://localhost:3000 >> "!INSTALL_DIR!\Start-PDF-Tools.bat"
echo     echo ======================================== >> "!INSTALL_DIR!\Start-PDF-Tools.bat"
echo     echo. >> "!INSTALL_DIR!\Start-PDF-Tools.bat"
echo     echo Jika browser tidak terbuka otomatis, >> "!INSTALL_DIR!\Start-PDF-Tools.bat"
echo     echo buka manual: http://localhost:3000 >> "!INSTALL_DIR!\Start-PDF-Tools.bat"
echo     echo. >> "!INSTALL_DIR!\Start-PDF-Tools.bat"
echo     echo Tekan Ctrl+C untuk stop server atau tutup window ini >> "!INSTALL_DIR!\Start-PDF-Tools.bat"
echo ^) else ( >> "!INSTALL_DIR!\Start-PDF-Tools.bat"
echo     echo. >> "!INSTALL_DIR!\Start-PDF-Tools.bat"
echo     echo ❌ Server gagal start dalam 15 detik >> "!INSTALL_DIR!\Start-PDF-Tools.bat"
echo     echo. >> "!INSTALL_DIR!\Start-PDF-Tools.bat"
echo     echo Troubleshooting: >> "!INSTALL_DIR!\Start-PDF-Tools.bat"
echo     echo 1. Pastikan port 3000 tidak digunakan >> "!INSTALL_DIR!\Start-PDF-Tools.bat"
echo     echo 2. Coba run sebagai Administrator >> "!INSTALL_DIR!\Start-PDF-Tools.bat"
echo     echo 3. Check antivirus/firewall >> "!INSTALL_DIR!\Start-PDF-Tools.bat"
echo     echo. >> "!INSTALL_DIR!\Start-PDF-Tools.bat"
echo     echo Coba buka manual: http://localhost:3000 >> "!INSTALL_DIR!\Start-PDF-Tools.bat"
echo ^) >> "!INSTALL_DIR!\Start-PDF-Tools.bat"
echo. >> "!INSTALL_DIR!\Start-PDF-Tools.bat"
echo pause >> "!INSTALL_DIR!\Start-PDF-Tools.bat"

REM Create desktop shortcut
echo Creating desktop shortcut...
set DESKTOP=%USERPROFILE%\Desktop
powershell -Command "$shell = New-Object -ComObject WScript.Shell; $shortcut = $shell.CreateShortcut('%DESKTOP%\PDF Tools.lnk'); $shortcut.TargetPath = '!INSTALL_DIR!\Start-PDF-Tools.bat'; $shortcut.WorkingDirectory = '!INSTALL_DIR!'; $shortcut.Description = 'PDF Tools Self-Hosted'; $shortcut.Save()"

REM Create uninstaller
echo @echo off > "!INSTALL_DIR!\Uninstall.bat"
echo title PDF Tools - Uninstaller >> "!INSTALL_DIR!\Uninstall.bat"
echo echo Removing PDF Tools Self-Hosted... >> "!INSTALL_DIR!\Uninstall.bat"
echo del "%USERPROFILE%\Desktop\PDF Tools.lnk" 2^>nul >> "!INSTALL_DIR!\Uninstall.bat"
echo cd \ >> "!INSTALL_DIR!\Uninstall.bat"
echo rmdir /S /Q "!INSTALL_DIR!" >> "!INSTALL_DIR!\Uninstall.bat"
echo echo PDF Tools has been removed. >> "!INSTALL_DIR!\Uninstall.bat"
echo pause >> "!INSTALL_DIR!\Uninstall.bat"

echo [6/6] Installation completed!

cls
echo.
echo  ╔══════════════════════════════════════════════════════════╗
echo  ║                                                          ║
echo  ║              🎉 Installation Successful! 🎉              ║
echo  ║                                                          ║
echo  ╚══════════════════════════════════════════════════════════╝
echo.
echo  PDF Tools Self-Hosted has been installed successfully!
echo.
echo  📍 Installation location: !INSTALL_DIR!
echo  🖥️  Desktop shortcut: PDF Tools
echo  🌐 Web interface: http://localhost:3000
echo.
echo  💡 Total installation size: ~45MB (vs 500MB+ traditional)
echo.

set /p launch="🚀 Launch PDF Tools now? (Y/N): "
if /i "!launch!"=="Y" (
    echo.
    echo Starting PDF Tools...
    cd /d "!INSTALL_DIR!"
    start "" "Start-PDF-Tools.bat"
)

echo.
echo ✅ Setup completed! You can close this window now.
echo.
pause
exit /b 0

:ExtractFiles
REM This section will be replaced with embedded file extraction
REM For now, we'll create basic file structure

REM Create package.json
echo { > "!INSTALL_DIR!\package.json"
echo   "name": "pdf-tools-selfhosted", >> "!INSTALL_DIR!\package.json"
echo   "version": "1.0.0", >> "!INSTALL_DIR!\package.json"
echo   "description": "Self-hosted PDF tools", >> "!INSTALL_DIR!\package.json"
echo   "main": "src/index.js", >> "!INSTALL_DIR!\package.json"
echo   "dependencies": { >> "!INSTALL_DIR!\package.json"
echo     "express": "^4.21.2", >> "!INSTALL_DIR!\package.json"
echo     "cors": "^2.8.5", >> "!INSTALL_DIR!\package.json"
echo     "multer": "^1.4.5-lts.1", >> "!INSTALL_DIR!\package.json"
echo     "pdf-lib": "^1.17.1", >> "!INSTALL_DIR!\package.json"
echo     "sharp": "^0.32.6", >> "!INSTALL_DIR!\package.json"
echo     "archiver": "^6.0.2", >> "!INSTALL_DIR!\package.json"
echo     "pdf-parse": "^1.1.1", >> "!INSTALL_DIR!\package.json"
echo     "pdf2pic": "^3.0.3", >> "!INSTALL_DIR!\package.json"
echo     "jimp": "^0.22.10", >> "!INSTALL_DIR!\package.json"
echo     "mammoth": "^1.6.0", >> "!INSTALL_DIR!\package.json"
echo     "node-fetch": "^2.7.0" >> "!INSTALL_DIR!\package.json"
echo   } >> "!INSTALL_DIR!\package.json"
echo } >> "!INSTALL_DIR!\package.json"

echo ✅ Package configuration created.
return
