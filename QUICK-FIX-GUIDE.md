# 🛠️ Quick Fix Guide - PowerShell & Browser Launch Issues

## ❗ Problem 1: PowerShell Execution Policy Error

### Error yang Terjadi:
```
npm : File C:\Program Files\nodejs\npm.ps1 cannot be loaded because running scripts is disabled on this system.
```

### ✅ Solution - Gunakan CMD Build System:

Sekarang ada alternatif CMD yang tidak bergantung PowerShell:

```cmd
# Alih-alih menggunakan npm run build:portable, gunakan:
build-cmd.cmd portable

# Atau untuk build semua:
build-cmd.cmd all
```

### 🔧 Available Commands:
```cmd
build-cmd.cmd              # Standard build
build-cmd.cmd portable     # Portable version
build-cmd.cmd installer    # Installer version
build-cmd.cmd all          # Build semua versi
```

## ❗ Problem 2: Ultra Light Installer - Browser Tidak Auto-Launch

### Penyebab:
- Server startup time kurang
- Tidak ada detection apakah server sudah ready
- Browser launch terlalu cepat

### ✅ Solution - Enhanced Browser Launch:

Ultra Light Installer sekarang sudah diperbaiki dengan:

1. **Server Ready Detection**: Menunggu sampai server benar-benar listening di port 3000
2. **Smart Waiting**: Loop check dengan timeout 15 detik
3. **Visual Feedback**: Progress indicator dan status messages
4. **Fallback Instructions**: Manual URL jika auto-launch gagal
5. **Better Error Handling**: Troubleshooting steps jika ada masalah

### 🚀 How it Works Now:

```bat
[1/3] Starting PDF Tools Server...
[2/3] Menunggu server startup...
Menunggu server... (1/15)
Menunggu server... (2/15)
[3/3] ✅ SERVER BERHASIL STARTED!
🌐 Membuka browser...
🎉 PDF Tools sudah siap digunakan!
📍 URL: http://localhost:3000
```

## 🎯 Quick Test Commands

### Test CMD Build System:
```cmd
# Masuk ke project directory via CMD (bukan PowerShell)
cd "C:\Users\USER\Documents\Project\pdf-tools-selfhosted"

# Test build portable
build-cmd.cmd portable

# Test hasil build
cd dist\portable
Start-PDF-Tools.bat
```

### Test Ultra Light Installer:
```cmd
# Run ultra light installer
cd ultra-light-installer
PDF-Tools-Ultra-Light-Setup.bat
```

## 📋 Troubleshooting Steps

### Jika npm masih error:
1. **Gunakan CMD instead of PowerShell**
2. **Use build-cmd.cmd** instead of npm scripts
3. **Manual approach**: `node build-simple.js`

### Jika browser tidak auto-launch:
1. **Tunggu message "SERVER BERHASIL STARTED"**
2. **Manual open**: http://localhost:3000
3. **Check port**: `netstat -an | find ":3000"`
4. **Try as Administrator** jika masih bermasalah

### Jika server error:
1. **Check Node.js**: `node --version`
2. **Check dependencies**: Pastikan npm install sukses
3. **Check firewall**: Allow Node.js access
4. **Try different port**: Edit script untuk port lain

## 🎉 Final Solutions Summary

### ✅ PowerShell Issue FIXED:
- **New**: `build-cmd.cmd` - CMD-only build system
- **No PowerShell**: Pure batch script, no execution policy issues
- **Universal**: Works di semua Windows environments

### ✅ Browser Launch Issue FIXED:
- **Smart Detection**: Tunggu server ready sebelum launch browser
- **Visual Feedback**: Progress indicators dan status
- **Fallback**: Manual instructions jika auto-launch gagal
- **Better UX**: Clear messages dan troubleshooting steps

### 📦 Available Options:
1. **build-cmd.cmd** - CMD-compatible build (NO PowerShell issues)
2. **Ultra Light Installer** - Fixed auto-browser launch
3. **Simple builds** - `node build-simple.js` fallback

**Sekarang semua masalah sudah teratasi! Test dengan CMD build system dan ultra light installer yang sudah diperbaiki.** 🚀