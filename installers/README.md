# PDF Tools Self-Hosted - Installers

This directory contains all installer generation scripts and components for PDF Tools Self-Hosted.

## Available Installer Types

### 1. Ultra Light Installer (Recommended)
- **Size**: ~20MB distribution, ~45MB installed
- **Features**: Auto-download dependencies, single-click installation, no admin rights needed
- **Script**: `create-ultra-light-installer.js`
- **Output**: `ultra-light-installer/` folder with batch installer

### 2. Single Installer
- **Size**: Medium size
- **Script**: `create-single-installer.js`

### 3. Final Installer
- **Size**: Full package
- **Script**: `create-final-installer.js`

## Build Scripts

- `build.js` - Main build script for executables
- `build-simple.js` - Simplified build process
- `build-cmd.cmd` - Windows batch build command

## Usage

```bash
# Create ultra light installer (recommended)
node installers/create-ultra-light-installer.js

# Create single installer
node installers/create-single-installer.js

# Create full installer
node installers/create-final-installer.js

# Build executables
node installers/build.js
```

## Output Directories

All installer outputs will be created in the project root `dist/` directory.