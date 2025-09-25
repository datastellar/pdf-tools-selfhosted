const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('📦 Creating Single-Click Installer...');

// Create self-extracting installer script
const singleInstallerScript = `@echo off
setlocal EnableDelayedExpansion

title PDF Tools Self-Hosted - One-Click Installer
color 0A
cls

echo.
echo  ╔═══════════════════════════════════════════════════════════╗
echo  ║                                                           ║
echo  ║         PDF Tools Self-Hosted - One-Click Setup          ║
echo  ║                      Version 1.0.0                       ║
echo  ║                                                           ║
echo  ╚═══════════════════════════════════════════════════════════╝
echo.
echo  This installer will:
echo  • Install PDF Tools to your computer
echo  • Create desktop and start menu shortcuts
echo  • Set up the service for easy access
echo  • Launch the application when complete
echo.
echo  Requirements: Windows 10/11 (64-bit), 4GB RAM, 500MB disk space
echo.
echo  Press any key to continue or close this window to cancel...
pause > nul

cls
echo.
echo  ╔═══════════════════════════════════════════════════════════╗
echo  ║                      Installing...                        ║
echo  ╚═══════════════════════════════════════════════════════════╝
echo.

REM Check for administrator privileges
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo  [ERROR] This installer requires administrator privileges.
    echo.
    echo  Please right-click and select "Run as Administrator"
    echo.
    pause
    exit /b 1
)

REM Create temporary extraction directory
set TEMP_DIR=%TEMP%\\PDFToolsInstaller_%RANDOM%
mkdir "%TEMP_DIR%" 2>nul

echo  [1/6] Extracting files...

REM Extract the embedded ZIP file (this will be replaced by the actual installer)
REM The ZIP file is embedded at the end of this batch file
findstr /V "^REM_ZIP_START" "%~f0" > "%TEMP_DIR%\\installer_data.zip"

REM Use PowerShell to extract
powershell -Command "Expand-Archive -Path '%TEMP_DIR%\\installer_data.zip' -DestinationPath '%TEMP_DIR%\\extracted' -Force"

if not exist "%TEMP_DIR%\\extracted\\pdf-tools-selfhosted.exe" (
    echo  [ERROR] Extraction failed. Please contact support.
    rmdir /S /Q "%TEMP_DIR%" 2>nul
    pause
    exit /b 1
)

echo  [2/6] Creating installation directory...

set INSTALL_DIR=%PROGRAMFILES%\\PDF Tools Self-Hosted
if exist "%INSTALL_DIR%" rmdir /S /Q "%INSTALL_DIR%" 2>nul
mkdir "%INSTALL_DIR%"

echo  [3/6] Copying files...

xcopy "%TEMP_DIR%\\extracted\\*" "%INSTALL_DIR%\\" /E /I /H /R /Y >nul

echo  [4/6] Creating shortcuts...

REM Create desktop shortcut
set DESKTOP=%USERPROFILE%\\Desktop
echo [InternetShortcut] > "%DESKTOP%\\PDF Tools.url"
echo URL=http://localhost:3000 >> "%DESKTOP%\\PDF Tools.url"
echo IconFile=%INSTALL_DIR%\\pdf-tools-selfhosted.exe >> "%DESKTOP%\\PDF Tools.url"
echo IconIndex=0 >> "%DESKTOP%\\PDF Tools.url"

REM Create start menu entry
set STARTMENU=%APPDATA%\\Microsoft\\Windows\\Start Menu\\Programs
if not exist "%STARTMENU%\\PDF Tools" mkdir "%STARTMENU%\\PDF Tools"
copy "%DESKTOP%\\PDF Tools.url" "%STARTMENU%\\PDF Tools\\" >nul

REM Create start server shortcut
echo @echo off > "%STARTMENU%\\PDF Tools\\Start PDF Tools Server.bat"
echo cd /d "%INSTALL_DIR%" >> "%STARTMENU%\\PDF Tools\\Start PDF Tools Server.bat"
echo start "" "%INSTALL_DIR%\\start-pdf-tools.bat" >> "%STARTMENU%\\PDF Tools\\Start PDF Tools Server.bat"

echo  [5/6] Registering uninstaller...

REM Create uninstaller entry in Control Panel
reg add "HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\PDFToolsSelfHosted" /v "DisplayName" /t REG_SZ /d "PDF Tools Self-Hosted" /f >nul
reg add "HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\PDFToolsSelfHosted" /v "UninstallString" /t REG_SZ /d "\"%INSTALL_DIR%\\uninstall.bat\"" /f >nul
reg add "HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\PDFToolsSelfHosted" /v "DisplayVersion" /t REG_SZ /d "1.0.0" /f >nul
reg add "HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\PDFToolsSelfHosted" /v "Publisher" /t REG_SZ /d "PDF Tools Self-Hosted" /f >nul
reg add "HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\PDFToolsSelfHosted" /v "InstallLocation" /t REG_SZ /d "%INSTALL_DIR%" /f >nul

echo  [6/6] Cleaning up...

REM Clean up temporary files
rmdir /S /Q "%TEMP_DIR%" 2>nul

cls
echo.
echo  ╔═══════════════════════════════════════════════════════════╗
echo  ║                                                           ║
echo  ║               Installation Completed!                     ║
echo  ║                                                           ║
echo  ╚═══════════════════════════════════════════════════════════╝
echo.
echo  PDF Tools has been successfully installed to:
echo  %INSTALL_DIR%
echo.
echo  You can now:
echo  • Access PDF Tools at: http://localhost:3000
echo  • Use the desktop shortcut: "PDF Tools"
echo  • Find it in Start Menu under "PDF Tools"
echo.
echo  Would you like to start PDF Tools now?
echo.
set /p choice="Start PDF Tools? (Y/N): "
if /i "!choice!"=="Y" (
    echo.
    echo  Starting PDF Tools...
    start "" "%INSTALL_DIR%\\start-pdf-tools.bat"
    timeout /t 3 >nul
    start http://localhost:3000
)

echo.
echo  Installation complete! You can close this window now.
echo.
pause
exit /b 0

REM_ZIP_START
`;

// Create the self-extracting installer
if (!fs.existsSync('dist')) {
    fs.mkdirSync('dist', { recursive: true });
}

fs.writeFileSync('dist/PDF-Tools-Installer.bat', singleInstallerScript);

console.log('✅ Single-click installer created: dist/PDF-Tools-Installer.bat');
console.log('');
console.log('📋 To create the final installer:');
console.log('   1. Build all versions: npm run build:all');
console.log('   2. Run: node create-final-installer.js');
console.log('   3. Share the resulting PDF-Tools-Setup.exe file');