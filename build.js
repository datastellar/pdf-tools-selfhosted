const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const os = require('os');

// Parse command line arguments
const args = process.argv.slice(2);
const isPortable = args.includes('--portable');
const isInstaller = args.includes('--installer');
const buildMode = isPortable ? 'portable' : isInstaller ? 'installer' : 'standard';

console.log(`🚀 Building PDF Tools Executable (${buildMode} mode)...`);

// Create appropriate directories
const baseDistPath = 'dist';
const distPath = isPortable ? path.join(baseDistPath, 'portable') : baseDistPath;

if (!fs.existsSync(baseDistPath)) {
    fs.mkdirSync(baseDistPath, { recursive: true });
}
if (!fs.existsSync(distPath)) {
    fs.mkdirSync(distPath, { recursive: true });
}

// Function to find available port
function findAvailablePort(startPort = 3000) {
    const net = require('net');
    return new Promise((resolve) => {
        const server = net.createServer();
        server.listen(startPort, () => {
            const port = server.address().port;
            server.close(() => resolve(port));
        });
        server.on('error', () => {
            resolve(findAvailablePort(startPort + 1));
        });
    });
}

// Copy public folder to dist
console.log('📁 Copying static assets...');
if (fs.existsSync('public')) {
    const copyRecursiveSync = (src, dest) => {
        const exists = fs.existsSync(src);
        const stats = exists && fs.statSync(src);
        const isDirectory = exists && stats.isDirectory();

        if (isDirectory) {
            if (!fs.existsSync(dest)) {
                fs.mkdirSync(dest);
            }
            fs.readdirSync(src).forEach(childItemName => {
                copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
            });
        } else {
            fs.copyFileSync(src, dest);
        }
    };

    copyRecursiveSync('public', path.join(distPath, 'public'));
}

// Build executable with pkg
console.log('⚙️ Building executable...');
try {
    const pkgCommand = `pkg . --out-path "${distPath}" --targets node18-win-x64`;
    execSync(pkgCommand, { stdio: 'inherit' });
    console.log('✅ Executable built successfully!');

    // Try to compress with UPX if available (optional)
    try {
        const exePath = path.join(distPath, 'pdf-tools-selfhosted.exe');
        if (fs.existsSync(exePath)) {
            console.log('🗜️ Attempting to compress executable with UPX...');
            execSync(`upx --best "${exePath}"`, { stdio: 'pipe' });
            console.log('✅ Executable compressed successfully!');
        }
    } catch (upxError) {
        console.log('ℹ️ UPX compression skipped (UPX not available)');
    }
} catch (error) {
    console.error('❌ Build failed:', error.message);
    process.exit(1);
}

// Create startup script with auto browser launch
console.log('📝 Creating startup script...');
const port = isPortable ? 'auto' : '3000';
const autoLaunch = isPortable || isInstaller;

const startupScript = `@echo off
title PDF Tools Self-Hosted
echo Starting PDF Tools Server...
echo.

REM Start the server in background
start /B "%~dp0pdf-tools-selfhosted.exe"

REM Wait for server to start
ping -n 3 127.0.0.1 > nul

REM Auto-launch browser if enabled
${autoLaunch ? 'start http://localhost:3000' : 'echo Server available at: http://localhost:3000'}

${autoLaunch ? '' : 'echo Press any key to stop the server...'}
${autoLaunch ? '' : 'pause > nul'}

REM Kill the server when script ends
taskkill /F /IM pdf-tools-selfhosted.exe > nul 2>&1
`;

fs.writeFileSync(path.join(distPath, 'start-pdf-tools.bat'), startupScript);

// Create installer script
console.log('📦 Creating installer script...');
const installerScript = `@echo off
title PDF Tools Self-Hosted - Installer
echo Installing PDF Tools Self-Hosted...
echo.

REM Create installation directory
set INSTALL_DIR=%PROGRAMFILES%\\PDF Tools Self-Hosted
if not exist "%INSTALL_DIR%" mkdir "%INSTALL_DIR%"

REM Copy files
echo Copying files...
copy "pdf-tools-selfhosted.exe" "%INSTALL_DIR%\\" >nul
copy "start-pdf-tools.bat" "%INSTALL_DIR%\\" >nul
xcopy "public" "%INSTALL_DIR%\\public" /E /I /H /R /Y >nul

REM Create desktop shortcut
echo Creating desktop shortcut...
set DESKTOP=%USERPROFILE%\\Desktop
echo [InternetShortcut] > "%DESKTOP%\\PDF Tools Self-Hosted.url"
echo URL=http://localhost:3000 >> "%DESKTOP%\\PDF Tools Self-Hosted.url"
echo IconFile=%INSTALL_DIR%\\pdf-tools-selfhosted.exe >> "%DESKTOP%\\PDF Tools Self-Hosted.url"
echo IconIndex=0 >> "%DESKTOP%\\PDF Tools Self-Hosted.url"

REM Create start menu entry
set STARTMENU=%APPDATA%\\Microsoft\\Windows\\Start Menu\\Programs
if not exist "%STARTMENU%\\PDF Tools" mkdir "%STARTMENU%\\PDF Tools"
copy "%DESKTOP%\\PDF Tools Self-Hosted.url" "%STARTMENU%\\PDF Tools\\" >nul

echo.
echo ✅ Installation completed successfully!
echo.
echo You can now:
echo 1. Start the server by running: "%INSTALL_DIR%\\start-pdf-tools.bat"
echo 2. Access the web interface at: http://localhost:3000
echo 3. Use the desktop shortcut to open the web interface
echo.
pause
`;

fs.writeFileSync(path.join(distPath, 'install.bat'), installerScript);

// Create uninstaller
const uninstallerScript = `@echo off
title PDF Tools Self-Hosted - Uninstaller
echo Uninstalling PDF Tools Self-Hosted...
echo.

set INSTALL_DIR=%PROGRAMFILES%\\PDF Tools Self-Hosted
set DESKTOP=%USERPROFILE%\\Desktop
set STARTMENU=%APPDATA%\\Microsoft\\Windows\\Start Menu\\Programs

REM Remove desktop shortcut
if exist "%DESKTOP%\\PDF Tools Self-Hosted.url" del "%DESKTOP%\\PDF Tools Self-Hosted.url"

REM Remove start menu entries
if exist "%STARTMENU%\\PDF Tools" rmdir /S /Q "%STARTMENU%\\PDF Tools"

REM Remove installation directory
if exist "%INSTALL_DIR%" rmdir /S /Q "%INSTALL_DIR%"

echo.
echo ✅ Uninstallation completed successfully!
echo.
pause
`;

fs.writeFileSync(path.join(distPath, 'uninstall.bat'), uninstallerScript);

// Create README for distribution
const readmeContent = `# PDF Tools Self-Hosted

## Installation

1. Run 'install.bat' as Administrator to install the application
2. After installation, use 'start-pdf-tools.bat' to start the server
3. Open your browser and go to http://localhost:3000

## Features

- Merge multiple PDF files
- Split PDF into separate pages
- Compress PDF files
- Convert images to PDF
- Convert PDF to images or text
- Extract text from PDF

## System Requirements

- Windows 10/11 (64-bit)
- At least 4GB RAM
- 500MB free disk space

## Uninstallation

Run 'uninstall.bat' as Administrator to remove the application.

## Support

For support and issues, please contact the administrator.
`;

fs.writeFileSync(path.join(distPath, 'README.txt'), readmeContent);

// Create portable configuration if needed
if (isPortable) {
    console.log('💻 Creating portable configuration...');

    // Create portable config file
    const portableConfig = {
        portable: true,
        autoLaunch: true,
        dataDir: './data',
        tempDir: './temp',
        port: 3000
    };

    fs.writeFileSync(path.join(distPath, 'config.json'), JSON.stringify(portableConfig, null, 2));

    // Create data and temp directories
    fs.mkdirSync(path.join(distPath, 'data'), { recursive: true });
    fs.mkdirSync(path.join(distPath, 'temp'), { recursive: true });

    // Create portable readme
    const portableReadme = `# PDF Tools Portable

This is a portable version that requires no installation.

## Usage
1. Extract this folder anywhere
2. Run 'start-pdf-tools.bat'
3. Browser will open automatically

## Features
- No installation required
- Runs from any folder
- All data stored locally
- Auto-launches browser

System Requirements: Windows 10/11 (64-bit)`;

    fs.writeFileSync(path.join(distPath, 'PORTABLE-README.txt'), portableReadme);
}

// Create quick installer for installer mode
if (isInstaller) {
    console.log('📦 Creating quick installer...');

    const quickInstallerScript = `@echo off
title PDF Tools - Quick Install
cls
echo.
echo  ┌─────────────────────────────────┐
echo  │      PDF Tools Self-Hosted Setup      │
echo  └─────────────────────────────────┘
echo.
echo This will install PDF Tools to your computer.
echo.
echo Press any key to continue or close this window to cancel...
pause > nul

echo.
echo Installing PDF Tools...
call install.bat

echo.
echo Installation complete! Would you like to start PDF Tools now?
echo.
set /p choice="Start now? (Y/N): "
if /i "%choice%"=="Y" (
    echo Starting PDF Tools...
    call start-pdf-tools.bat
)

echo.
echo Setup completed successfully!
pause`;

    fs.writeFileSync(path.join(distPath, 'SETUP.bat'), quickInstallerScript);
}

console.log('🎉 Build completed successfully!');
console.log(`📁 Files are available in the "${distPath}" folder:`);
console.log('   - pdf-tools-selfhosted.exe (Main executable)');

if (isPortable) {
    console.log('   - start-pdf-tools.bat (Portable launcher)');
    console.log('   - config.json (Portable configuration)');
    console.log('   - PORTABLE-README.txt (Portable instructions)');
} else {
    console.log('   - install.bat (Installer script)');
    console.log('   - uninstall.bat (Uninstaller script)');
    console.log('   - start-pdf-tools.bat (Startup script)');
    if (isInstaller) {
        console.log('   - SETUP.bat (Quick installer)');
    }
}

console.log('   - README.txt (Documentation)');
console.log('');

if (isPortable) {
    console.log('🚀 Portable version ready:');
    console.log('   1. Extract anywhere on target computer');
    console.log('   2. Run "start-pdf-tools.bat"');
    console.log('   3. Browser opens automatically');
} else if (isInstaller) {
    console.log('🚀 Installer version ready:');
    console.log('   1. Run "SETUP.bat" for guided installation');
    console.log('   2. Or run "install.bat" directly as Administrator');
} else {
    console.log('🚀 To create distributable package:');
    console.log('   1. Zip the entire "dist" folder');
    console.log('   2. Share the zip file with clients');
    console.log('   3. Clients should extract and run "install.bat" as Administrator');
}

// Show file sizes for optimization info
try {
    const exePath = path.join(distPath, 'pdf-tools-selfhosted.exe');
    if (fs.existsSync(exePath)) {
        const stats = fs.statSync(exePath);
        const sizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
        console.log(`📊 Executable size: ${sizeInMB} MB`);
    }
} catch (err) {
    // Ignore size calculation errors
}