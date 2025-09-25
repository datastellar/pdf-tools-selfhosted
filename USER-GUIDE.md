# 📖 PDF Tools Self-Hosted - User Guide

Welcome to PDF Tools Self-Hosted! This guide will help you get the most out of your privacy-focused PDF processing application.

## 🏁 Getting Started

### First Launch
1. Start the application with `npm start`
2. Open your web browser
3. Navigate to `http://localhost:3000`
4. You'll see the main interface with four PDF tools

### System Overview
PDF Tools Self-Hosted provides four main PDF processing tools:
- **Merge**: Combine multiple PDFs into one
- **Split**: Separate PDFs into individual pages or ranges
- **Compress**: Reduce file sizes while maintaining quality
- **Convert**: Transform PDFs into image formats

## 🛠️ Using the Tools

### 📋 PDF Merge
Combine multiple PDF files into a single document.

**How to use:**
1. Click "Select Tool" on the Merge card
2. Drag & drop multiple PDF files or click "Browse Files"
3. Optional: Enter a custom filename
4. Click "Process Files"
5. Download your merged PDF

**Tips:**
- You need at least 2 PDF files to merge
- Files are combined in the order you uploaded them
- Custom filenames should not include file extensions
- The tool automatically handles file cleanup

**Use cases:**
- Combining scanned documents
- Merging reports or presentations
- Creating document packages

### ✂️ PDF Split
Extract pages from PDF files.

**How to use:**
1. Click "Select Tool" on the Split card
2. Upload a single PDF file
3. Choose split mode:
   - **All pages separately**: Creates individual files for each page
   - **Page range**: Extract specific pages (e.g., "1-5" or "1-3,7-10")
4. Click "Process Files"
5. Download the ZIP file containing split pages

**Page Range Format:**
- Single page: `5`
- Page range: `1-10`
- Multiple ranges: `1-5,8-12,15-20`
- Mixed format: `1,3-5,8,10-15`

**Tips:**
- Page numbers start from 1
- Invalid ranges are ignored
- Large PDFs may take longer to split
- Each page becomes a separate PDF file

**Use cases:**
- Extracting specific chapters from documents
- Creating individual handouts from presentations
- Separating forms or applications

### 🗜️ PDF Compress
Reduce file sizes while maintaining readability.

**How to use:**
1. Click "Select Tool" on the Compress card
2. Upload one or more PDF files
3. Select compression quality:
   - **High**: Minimal compression, best quality
   - **Medium**: Balanced compression and quality (recommended)
   - **Low**: Maximum compression, smaller files
4. Click "Process Files"
5. Download compressed files

**Quality Guidelines:**
- **High (90-95% quality)**: For professional documents, contracts, presentations
- **Medium (70-85% quality)**: For general use, email attachments, web sharing
- **Low (50-70% quality)**: For archival purposes, very large files

**Tips:**
- Compression results vary based on original content
- Image-heavy PDFs compress more than text-only documents
- Test different quality levels for optimal results
- Original files are never modified

**Use cases:**
- Reducing email attachment sizes
- Saving storage space
- Faster web uploads and downloads

### 🔄 PDF Convert
Transform PDFs into image formats.

**How to use:**
1. Click "Select Tool" on the Convert card
2. Upload one or more PDF files
3. Select output format:
   - **JPEG**: Universal compatibility, smaller files
   - **PNG**: Better quality, supports transparency
   - **WebP**: Modern format, excellent compression
4. Choose DPI (resolution):
   - **72 DPI**: Web/screen viewing
   - **150 DPI**: Standard printing (recommended)
   - **300 DPI**: High-quality printing
5. Click "Process Files"
6. Download ZIP file containing images

**Format Comparison:**
| Format | File Size | Quality | Compatibility | Best For |
|--------|-----------|---------|---------------|----------|
| JPEG   | Smallest  | Good    | Universal     | Web, email |
| PNG    | Large     | Excellent | High        | Graphics, transparency |
| WebP   | Small     | Excellent | Modern browsers | Web optimization |

**Tips:**
- Higher DPI creates larger files but better quality
- Each PDF page becomes a separate image
- Multi-page PDFs create numbered images
- Consider your intended use when choosing format and DPI

**Use cases:**
- Creating thumbnails for web galleries
- Converting documents for image editing
- Archiving documents as images

## 📱 Interface Guide

### Navigation
- **Home**: Click the logo or "Back to Tools" to return to the main menu
- **Tool Selection**: Click any tool card to start processing
- **File Management**: Add, remove, and reorder files before processing

### File Upload Options
1. **Drag & Drop**: Simply drag PDF files from your file explorer into the upload area
2. **Browse Button**: Click "Browse Files" to open file picker
3. **Multiple Selection**: Hold Ctrl (Windows) or Cmd (Mac) to select multiple files

### Progress Indicators
- **Upload Progress**: Shows file upload status
- **Processing Bar**: Visual progress during PDF processing
- **Completion Status**: Success message with download links

### Download Management
- **Automatic Downloads**: Files download automatically when ready
- **Manual Downloads**: Click download links if automatic download fails
- **Multiple Files**: ZIP archives for multiple output files

## 🔧 Advanced Features

### Custom Filenames
- **Merge Tool**: Specify output filename (without extension)
- **Automatic Naming**: Uses sanitized, web-safe filenames
- **Timestamp Addition**: Prevents filename conflicts

### Batch Processing
- **Multiple Files**: Process several PDFs simultaneously
- **Consistent Settings**: Same settings applied to all files
- **ZIP Downloads**: Organized output for multiple files

### Error Handling
- **File Validation**: Only PDF files accepted
- **Size Limits**: 50MB per file by default
- **Format Checking**: Verifies PDF integrity before processing

## ⚠️ Troubleshooting

### Common Issues

**Files Not Uploading**
- Check file size (must be under 50MB)
- Ensure files are valid PDFs
- Try uploading one file at a time
- Clear browser cache and try again

**Processing Fails**
- Verify PDF is not corrupted or password-protected
- Check available disk space
- Try with a smaller file first
- Restart the application

**Slow Performance**
- Large files take more time to process
- Close other applications to free memory
- Process files individually for better performance
- Consider using compression before other operations

**Download Issues**
- Check browser download settings
- Disable popup blockers
- Try right-click "Save As" on download links
- Check downloads folder for completed files

### Browser Compatibility
**Fully Supported:**
- Chrome 70+
- Firefox 65+
- Safari 12+
- Edge 79+

**Limited Support:**
- Internet Explorer (basic functionality only)
- Older mobile browsers

### Performance Tips
1. **File Size**: Keep individual files under 50MB for best performance
2. **Batch Size**: Process 5-10 files at once for optimal speed
3. **Browser**: Use modern browsers for best experience
4. **Memory**: Close unused tabs during large file processing
5. **Network**: Use local installation for fastest processing

## 🔒 Privacy & Security

### Data Protection
- **Local Processing**: All files processed on your server
- **No External Transmission**: Data never leaves your system
- **Automatic Cleanup**: Files deleted after 30 seconds
- **No Storage**: No permanent file storage

### File Security
- **Temporary Files**: Stored in secure temporary directories
- **Access Control**: Files only accessible during processing
- **Path Protection**: Prevents directory traversal attacks
- **Input Validation**: All parameters validated and sanitized

### Best Practices
1. **Private Network**: Use on trusted networks only
2. **Regular Updates**: Keep Node.js and dependencies updated
3. **Firewall**: Consider firewall rules for production use
4. **HTTPS**: Use reverse proxy with SSL for internet access

## 📞 Support

### Getting Help
1. **Documentation**: Check README.md and other docs
2. **Troubleshooting**: Review QUICK-FIX-GUIDE.md
3. **Issues**: Report bugs on GitHub
4. **Community**: Join discussions for tips and tricks

### Reporting Issues
When reporting problems, please include:
- Operating system and version
- Node.js version
- Browser and version
- File types and sizes being processed
- Complete error messages
- Steps to reproduce the issue

---

**Happy PDF processing! 🎉**

This application is designed to be intuitive and powerful. Take your time exploring the features, and don't hesitate to experiment with different settings to find what works best for your needs.