# 🔧 PDF Tools Self-Hosted

A modern, privacy-focused self-hosted web application for PDF processing and manipulation. This project provides a beautiful, responsive interface and powerful PDF tools that run entirely on your server - no data ever leaves your control.

![PDF Tools Self-Hosted](public/images/screenshot.png)

## ✨ Features

### Core PDF Tools
- **📋 PDF Merge** - Combine multiple PDF files into a single document with custom filenames
- **✂️ PDF Split** - Split PDFs into individual pages or extract specific page ranges
- **🗜️ PDF Compress** - Reduce file size with quality control (high/medium/low compression)
- **🔄 PDF Convert** - Convert PDFs to high-quality images (JPEG, PNG, WebP) with custom DPI

### User Experience
- **🎨 Modern Web Interface** - Beautiful, responsive design that works on all devices
- **📁 Drag & Drop Support** - Simply drag files into the browser or click to browse
- **⚡ Real-time Progress** - Visual progress indicators and processing status
- **📱 Mobile Friendly** - Fully responsive design for smartphones and tablets
- **🔒 Privacy First** - All processing happens locally, no data transmitted externally

### Technical Features
- **🚀 High Performance** - Optimized for fast processing of large PDF files
- **🛡️ Security** - Automatic file cleanup, secure temporary storage
- **📦 Easy Deployment** - Multiple installation options including ultra-light installer
- **⚙️ API Ready** - RESTful API for integration with other applications

## 🚀 Quick Start

### Option 1: Web Interface (Recommended)
Perfect for most users who want a simple point-and-click interface.

```bash
# Clone the repository
git clone https://github.com/datastellar/pdf-tools-selfhosted.git
cd pdf-tools-selfhosted

# Install dependencies
npm install

# Start the application
npm start
```

🌐 Open `http://localhost:3000` in your browser and start processing PDFs!

### Option 2: Development Mode
For developers who want to modify the application.

```bash
# Install dependencies
npm install

# Start in development mode with auto-reload
npm run dev
```

### Option 3: Ultra Light Installer
For Windows users who want a one-click installation.

```bash
# Generate the ultra-light installer
node installers/create-ultra-light-installer.js

# Run the generated installer
cd installers/ultra-light-installer
# Double-click PDF-Tools-Ultra-Light-Setup.bat
```

## 🎯 Usage Guide

### Web Interface
1. **Select a Tool** - Choose from Merge, Split, Compress, or Convert
2. **Upload Files** - Drag & drop PDF files or click "Browse Files"
3. **Configure Options** - Set tool-specific options (filename, quality, format, etc.)
4. **Process** - Click "Process Files" and watch the progress
5. **Download** - Download your processed files automatically

### API Usage
The application also provides a RESTful API for programmatic access:

#### Merge PDFs
```bash
curl -X POST http://localhost:3000/api/merge \
  -F 'files=@document1.pdf' \
  -F 'files=@document2.pdf' \
  -F 'filename=combined-document' \
  --output merged.pdf
```

#### Split PDF
```bash
curl -X POST http://localhost:3000/api/split \
  -F 'files=@document.pdf' \
  -F 'mode=range' \
  -F 'range=1-5' \
  --output pages1-5.zip
```

#### Compress PDF
```bash
curl -X POST http://localhost:3000/api/compress \
  -F 'files=@document.pdf' \
  -F 'quality=medium' \
  --output compressed.pdf
```

#### Convert PDF
```bash
curl -X POST http://localhost:3000/api/convert \
  -F 'files=@document.pdf' \
  -F 'format=jpg' \
  -F 'dpi=150' \
  --output images.zip
```

## ⚙️ Configuration

Create a `.env` file in the root directory for custom configuration:

```env
# Server configuration
PORT=3000
NODE_ENV=production

# Upload limits
UPLOAD_LIMIT=50mb
MAX_FILES=10

# Storage paths
TEMP_DIR=./temp
OUTPUT_DIR=./temp/output

# Processing options
DEFAULT_QUALITY=medium
DEFAULT_DPI=150
CLEANUP_INTERVAL=300000
```

## 📦 Installation Methods

### Method 1: Standard Installation
```bash
git clone https://github.com/datastellar/pdf-tools-selfhosted.git
cd pdf-tools-selfhosted
npm install
npm start
```

### Method 2: Docker Installation
```bash
docker build -t pdf-tools-selfhosted .
docker run -p 3000:3000 pdf-tools-selfhosted
```

### Method 3: Ultra Light Installer (Windows)
- Download size: ~20MB
- Installed size: ~45MB
- Auto-downloads dependencies
- No admin rights required
- One-click installation

See `installers/README.md` for detailed installer instructions.

## 🛠️ Development

### Project Structure
```
pdf-tools-selfhosted/
├── public/                 # Web interface files
│   ├── css/               # Stylesheets
│   ├── js/                # Frontend JavaScript
│   └── index.html         # Main web interface
├── src/                   # Backend source code
│   ├── services/          # PDF processing services
│   └── index.js           # Main server file
├── installers/            # Installation scripts
│   ├── ultra-light-installer/
│   └── README.md
├── docs/                  # Documentation
└── tests/                 # Test files
```

### Available Scripts
- `npm start` - Start production server
- `npm run dev` - Start development server with auto-reload
- `npm test` - Run test suite
- `npm run lint` - Lint code
- `npm run build:exe` - Build executable
- `npm run build:all` - Build all distribution formats

### Testing
```bash
# Run all tests
npm test

# Run specific tests
npm test -- --grep "merge"

# Generate coverage report
npm run test:coverage
```

## 🔧 API Reference

### Authentication
No authentication required for local deployment. For production deployment, consider adding authentication middleware.

### Endpoints

#### `POST /api/merge`
Merge multiple PDF files into one.

**Parameters:**
- `files` (multipart) - Array of PDF files to merge
- `filename` (string) - Custom filename for output (optional)

**Response:** Binary PDF file

#### `POST /api/split`
Split a PDF file into separate pages or ranges.

**Parameters:**
- `files` (multipart) - PDF file to split
- `mode` (string) - Split mode: `pages` or `range`
- `range` (string) - Page range when mode is `range` (e.g., "1-5,10-15")

**Response:** ZIP file containing split pages

#### `POST /api/compress`
Compress PDF files to reduce size.

**Parameters:**
- `files` (multipart) - PDF files to compress
- `quality` (string) - Compression quality: `low`, `medium`, `high`

**Response:** Binary PDF file or ZIP for multiple files

#### `POST /api/convert`
Convert PDF to images.

**Parameters:**
- `files` (multipart) - PDF files to convert
- `format` (string) - Output format: `jpg`, `png`, `webp`
- `dpi` (number) - Resolution: `72`, `150`, `300`

**Response:** ZIP file containing converted images

## 🔒 Security & Privacy

### Privacy Features
- **Local Processing**: All files processed locally, never transmitted externally
- **Automatic Cleanup**: Temporary files deleted after 30 seconds
- **No Data Storage**: No persistent storage of user files
- **Secure Upload**: File validation and size limits prevent abuse

### Security Measures
- File type validation (PDF only)
- Upload size limits (configurable, default 50MB)
- Automatic temporary file cleanup
- Path traversal protection
- Input sanitization for all parameters

## 🐳 Docker Support

### Basic Docker Usage
```dockerfile
# Build image
docker build -t pdf-tools-selfhosted .

# Run container
docker run -d \
  --name pdf-tools \
  -p 3000:3000 \
  pdf-tools-selfhosted
```

### Docker Compose
```yaml
version: '3.8'
services:
  pdf-tools:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
    volumes:
      - ./temp:/app/temp
```

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass (`npm test`)
6. Lint your code (`npm run lint`)
7. Commit your changes (`git commit -m 'Add amazing feature'`)
8. Push to the branch (`git push origin feature/amazing-feature`)
9. Open a Pull Request

### Development Setup
```bash
git clone https://github.com/your-username/pdf-tools-selfhosted.git
cd pdf-tools-selfhosted
npm install
npm run dev
```

## 📋 System Requirements

### Minimum Requirements
- Node.js 16.0.0 or higher
- 512MB RAM
- 1GB free disk space
- Modern web browser

### Recommended Requirements
- Node.js 18.0.0 or higher
- 2GB RAM
- 5GB free disk space
- Chrome, Firefox, Safari, or Edge

## 🆘 Support & Troubleshooting

### Common Issues

**Q: Files not uploading?**
A: Check file size limits and ensure files are valid PDFs.

**Q: Server won't start?**
A: Verify Node.js version and check if port 3000 is available.

**Q: Processing fails?**
A: Check server logs and ensure sufficient disk space.

### Getting Help
- Check the [Troubleshooting Guide](QUICK-FIX-GUIDE.md)
- Review [Deployment Guide](DEPLOYMENT-GUIDE.md)
- Open an issue on GitHub
- Check existing issues for solutions

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with Express.js and Node.js
- PDF processing powered by pdf-lib
- UI components inspired by modern design systems
- Thanks to all contributors and users

---

**Made with ❤️ for privacy-conscious users who need reliable PDF tools.**