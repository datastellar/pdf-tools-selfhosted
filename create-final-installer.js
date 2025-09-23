const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Creating Final Self-Extracting Installer...');

// Check if dist folder exists and has the main executable
const distPath = 'dist';
const exePath = path.join(distPath, 'pdf-tools-selfhosted.exe');

if (!fs.existsSync(exePath)) {
    console.error('❌ Error: pdf-tools-selfhosted.exe not found in dist folder.');
    console.log('Please run "npm run build:exe" first.');
    process.exit(1);
}

// Create a ZIP file containing all the necessary files
console.log('📦 Creating distribution package...');

try {
    // Create a temporary zip with all dist contents
    const zipCommand = `powershell Compress-Archive -Path "${distPath}\\*" -DestinationPath "temp-installer.zip" -Force`;
    execSync(zipCommand, { stdio: 'inherit' });

    // Read the installer template and the ZIP file
    const installerTemplate = fs.readFileSync('dist/PDF-Tools-Installer.bat', 'utf8');
    const zipData = fs.readFileSync('temp-installer.zip');

    // Create the final self-extracting installer
    const finalInstaller = installerTemplate + '\\n' + zipData.toString('base64');

    // Write the final installer
    fs.writeFileSync('PDF-Tools-Setup.exe.bat', finalInstaller);

    // Clean up temporary zip
    fs.unlinkSync('temp-installer.zip');

    console.log('✅ Final installer created: PDF-Tools-Setup.exe.bat');

} catch (error) {
    console.error('❌ Error creating final installer:', error.message);

    // Fallback: Create a simple batch file that downloads and extracts
    console.log('📝 Creating fallback installer...');

    const fallbackInstaller = `@echo off
title PDF Tools Self-Hosted - Setup
echo.
echo ╔══════════════════════════════════════════════════════════╗
echo ║              PDF Tools Self-Hosted Setup                ║
echo ╚══════════════════════════════════════════════════════════╝
echo.
echo This setup will guide you through the installation process.
echo.
echo Requirements:
echo • Windows 10/11 (64-bit)
echo • 4GB RAM minimum
echo • 500MB free disk space
echo • Administrator privileges
echo.
echo Press any key to continue...
pause > nul

echo.
echo Please follow these steps:
echo.
echo 1. Extract all files from this ZIP to a folder
echo 2. Right-click "install.bat" and select "Run as Administrator"
echo 3. Follow the installation prompts
echo 4. Use the desktop shortcut to start PDF Tools
echo.
echo After installation, access PDF Tools at: http://localhost:3000
echo.
pause`;

    fs.writeFileSync('PDF-Tools-Setup-Instructions.bat', fallbackInstaller);
    console.log('✅ Fallback installer created: PDF-Tools-Setup-Instructions.bat');
}

// Create a simple PowerShell installer as an alternative
console.log('🔧 Creating PowerShell installer...');

const psInstaller = `# PDF Tools Self-Hosted Installer
param(
    [switch]$Silent
)

$ErrorActionPreference = "Stop"
$InformationPreference = "Continue"

function Write-ColoredOutput {
    param([string]$Message, [string]$Color = "White")
    Write-Host $Message -ForegroundColor $Color
}

function Test-AdminRights {
    $currentUser = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($currentUser)
    return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

# Check admin rights
if (-not (Test-AdminRights)) {
    Write-ColoredOutput "This installer requires administrator privileges." "Red"
    Write-ColoredOutput "Please run PowerShell as Administrator and try again." "Yellow"
    exit 1
}

if (-not $Silent) {
    Clear-Host
    Write-ColoredOutput "╔══════════════════════════════════════════════════════════╗" "Cyan"
    Write-ColoredOutput "║              PDF Tools Self-Hosted Setup                ║" "Cyan"
    Write-ColoredOutput "║                      Version 1.0.0                      ║" "Cyan"
    Write-ColoredOutput "╚══════════════════════════════════════════════════════════╝" "Cyan"
    Write-Host ""
    Write-ColoredOutput "This will install PDF Tools to your computer." "White"
    Write-Host ""
    $confirm = Read-Host "Continue with installation? (Y/N)"
    if ($confirm -ne "Y" -and $confirm -ne "y") {
        Write-ColoredOutput "Installation cancelled." "Yellow"
        exit 0
    }
}

try {
    $installDir = "$env:ProgramFiles\\PDF Tools Self-Hosted"

    Write-ColoredOutput "[1/5] Creating installation directory..." "Green"
    if (Test-Path $installDir) {
        Remove-Item $installDir -Recurse -Force
    }
    New-Item -ItemType Directory -Path $installDir -Force | Out-Null

    Write-ColoredOutput "[2/5] Copying files..." "Green"
    # Copy all files from current directory to install directory
    Copy-Item "*.exe" $installDir -Force
    Copy-Item "*.bat" $installDir -Force
    Copy-Item "*.txt" $installDir -Force
    if (Test-Path "public") {
        Copy-Item "public" $installDir -Recurse -Force
    }

    Write-ColoredOutput "[3/5] Creating shortcuts..." "Green"
    # Desktop shortcut
    $desktopPath = [Environment]::GetFolderPath("Desktop")
    $shortcutPath = "$desktopPath\\PDF Tools.lnk"
    $shell = New-Object -ComObject WScript.Shell
    $shortcut = $shell.CreateShortcut($shortcutPath)
    $shortcut.TargetPath = "$installDir\\start-pdf-tools.bat"
    $shortcut.WorkingDirectory = $installDir
    $shortcut.Description = "PDF Tools Self-Hosted"
    $shortcut.Save()

    Write-ColoredOutput "[4/5] Registering with Windows..." "Green"
    # Add to Programs and Features
    $regPath = "HKLM:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\PDFToolsSelfHosted"
    New-Item -Path $regPath -Force | Out-Null
    Set-ItemProperty -Path $regPath -Name "DisplayName" -Value "PDF Tools Self-Hosted"
    Set-ItemProperty -Path $regPath -Name "UninstallString" -Value "$installDir\\uninstall.bat"
    Set-ItemProperty -Path $regPath -Name "DisplayVersion" -Value "1.0.0"
    Set-ItemProperty -Path $regPath -Name "Publisher" -Value "PDF Tools"
    Set-ItemProperty -Path $regPath -Name "InstallLocation" -Value $installDir

    Write-ColoredOutput "[5/5] Installation complete!" "Green"
    Write-Host ""
    Write-ColoredOutput "PDF Tools has been installed to: $installDir" "White"
    Write-ColoredOutput "Desktop shortcut created: PDF Tools" "White"
    Write-Host ""

    if (-not $Silent) {
        $startNow = Read-Host "Would you like to start PDF Tools now? (Y/N)"
        if ($startNow -eq "Y" -or $startNow -eq "y") {
            Write-ColoredOutput "Starting PDF Tools..." "Green"
            Start-Process "$installDir\\start-pdf-tools.bat"
            Start-Sleep 3
            Start-Process "http://localhost:3000"
        }
    }

    Write-ColoredOutput "Installation completed successfully!" "Green"

} catch {
    Write-ColoredOutput "Installation failed: $($_.Exception.Message)" "Red"
    exit 1
}`;

fs.writeFileSync('Install-PDFTools.ps1', psInstaller);

// Create a simple launcher for the PowerShell script
const psLauncher = `@echo off
echo Starting PDF Tools Installer...
powershell -ExecutionPolicy Bypass -File "%~dp0Install-PDFTools.ps1"
pause`;

fs.writeFileSync('PDF-Tools-PowerShell-Setup.bat', psLauncher);

console.log('✅ PowerShell installer created: Install-PDFTools.ps1');
console.log('✅ PowerShell launcher created: PDF-Tools-PowerShell-Setup.bat');

console.log('');
console.log('🎉 Installation packages created successfully!');
console.log('');
console.log('📋 Available installers:');
console.log('   • PDF-Tools-PowerShell-Setup.bat (Recommended)');
console.log('   • PDF-Tools-Setup-Instructions.bat (Manual)');
console.log('');
console.log('📊 Distribution options:');
console.log('   • Copy dist/ folder + PowerShell setup for easy distribution');
console.log('   • Single ZIP with all files and setup instructions');
console.log('   • Individual components for advanced users');

// Show final file sizes
try {
    const stats = fs.statSync(exePath);
    const sizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
    console.log(`');
    console.log(`📏 Main executable size: ${sizeInMB} MB`);
} catch (err) {
    // Ignore
}