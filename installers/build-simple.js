const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Building PDF Tools Executable (Simple Version)...');

// Create dist directory
if (!fs.existsSync('dist')) {
    fs.mkdirSync('dist', { recursive: true });
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

    copyRecursiveSync('public', 'dist/public');
}

// Create a simple startup script
console.log('📝 Creating startup script...');
const startupScript = `@echo off
title PDF Tools Self-Hosted
echo.
echo ======================================
echo    PDF Tools Self-Hosted Server
echo ======================================
echo.
echo Starting server...

REM Start the server
node "%~dp0..\\src\\index.js"

echo.
echo Server stopped. Press any key to exit...
pause > nul
`;

fs.writeFileSync('dist/start-server.bat', startupScript);

// Create a portable package script
const portableScript = `@echo off
title PDF Tools Self-Hosted - Portable
echo.
echo ======================================
echo    PDF Tools Self-Hosted (Portable)
echo ======================================
echo.
echo This is a portable version that runs directly from this folder.
echo.
echo Starting server on http://localhost:3000
echo.

REM Check if Node.js is available
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH.
    echo.
    echo Please install Node.js from https://nodejs.org
    echo Then run this script again.
    echo.
    pause
    exit /b 1
)

REM Start the server
echo Starting PDF Tools server...
start http://localhost:3000
node "%~dp0..\\src\\index.js"
`;

fs.writeFileSync('dist/start-portable.bat', portableScript);

// Create install script for when Node.js is available
const installScript = `@echo off
title PDF Tools - Quick Install
echo.
echo ======================================
echo    PDF Tools Self-Hosted Setup
echo ======================================
echo.

REM Check for Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Node.js is required but not installed.
    echo.
    echo Would you like to:
    echo 1. Install Node.js automatically (Recommended)
    echo 2. Download Node.js manually
    echo 3. Cancel installation
    echo.
    set /p choice="Enter your choice (1-3): "

    if "!choice!"=="1" (
        echo Downloading Node.js installer...
        powershell -Command "Invoke-WebRequest -Uri 'https://nodejs.org/dist/v18.18.0/node-v18.18.0-x64.msi' -OutFile 'nodejs-installer.msi'"
        echo Installing Node.js...
        msiexec /i nodejs-installer.msi /quiet
        echo Node.js installation completed.
        del nodejs-installer.msi
    ) else if "!choice!"=="2" (
        echo Please download Node.js from: https://nodejs.org
        start https://nodejs.org
        echo After installing Node.js, run this script again.
        pause
        exit /b 0
    ) else (
        echo Installation cancelled.
        pause
        exit /b 0
    )
)

echo Installing PDF Tools dependencies...
npm install --production

echo.
echo ======================================
echo    Installation Complete!
echo ======================================
echo.
echo PDF Tools has been set up successfully.
echo.
echo To start the server:
echo   - Run: start-server.bat
echo   - Or run: node src\\index.js
echo.
echo Then open: http://localhost:3000
echo.
pause
`;

fs.writeFileSync('dist/install-with-nodejs.bat', installScript);

// Create README for distribution
const readmeContent = `# PDF Tools Self-Hosted - Distribution Package

## Quick Start Options

### Option 1: Portable Mode (Node.js Required)
1. Ensure Node.js is installed on your system
2. Run 'start-portable.bat'
3. Browser opens automatically at http://localhost:3000

### Option 2: Full Installation
1. Run 'install-with-nodejs.bat' (installs Node.js if needed)
2. Use 'start-server.bat' to launch the server
3. Open http://localhost:3000 in your browser

### Option 3: Manual Setup
1. Install Node.js from https://nodejs.org
2. Open command prompt in this folder
3. Run: npm install --production
4. Run: node src/index.js
5. Open http://localhost:3000

## Features
- Merge multiple PDF files
- Split PDF into separate pages
- Compress PDF files
- Convert images to PDF
- Convert PDF to images
- Extract text from PDF

## System Requirements
- Windows 10/11, macOS, or Linux
- Node.js 16+ (installed automatically with Option 2)
- 4GB RAM recommended
- 500MB free disk space

## File Structure
- src/           - Application source code
- public/        - Web interface files
- dist/          - Distribution scripts
- package.json   - Dependencies configuration

## Support
For issues or questions, check the documentation or contact support.

Total Package Size: ~15-25MB (after Node.js dependencies)
Portable Size: ~500MB (with all dependencies bundled)
`;

fs.writeFileSync('dist/README-DISTRIBUTION.txt', readmeContent);

console.log('🎉 Simple build completed successfully!');
console.log('📁 Files created in dist/ folder:');
console.log('   - start-portable.bat (For systems with Node.js)');
console.log('   - install-with-nodejs.bat (Auto-installs Node.js)');
console.log('   - start-server.bat (Simple server launcher)');
console.log('   - README-DISTRIBUTION.txt (Setup instructions)');
console.log('');
console.log('📦 Distribution options:');
console.log('   1. ZIP the entire project folder for full distribution');
console.log('   2. Use start-portable.bat for quick setup on Node.js systems');
console.log('   3. Use install-with-nodejs.bat for automated setup');
console.log('');
console.log('🎯 This approach is lighter and more compatible than PKG executable!');