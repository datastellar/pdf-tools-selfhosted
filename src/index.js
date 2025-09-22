const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const archiver = require('archiver');

// Utility function to sanitize filename
function sanitizeFilename(filename) {
  if (!filename) return 'merged';

  return filename
    .replace(/[<>:"/\\|?*]/g, '') // Remove invalid characters
    .replace(/\s+/g, '_') // Replace spaces with underscores
    .replace(/\.+$/, '') // Remove trailing dots
    .substring(0, 200) // Limit length
    .trim() || 'merged'; // Fallback if empty
}

const pdfMergeService = require('./services/pdfMerge');
const pdfSplitService = require('./services/pdfSplit');
const pdfCompressService = require('./services/pdfCompress');
const pdfConvertService = require('./services/pdfConvert');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Configure multer for file uploads
const upload = multer({
  dest: 'temp/',
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  }
});

// Ensure temp directory exists
if (!fs.existsSync('temp')) {
  fs.mkdirSync('temp');
}
if (!fs.existsSync('temp/output')) {
  fs.mkdirSync('temp/output', { recursive: true });
}

// Routes
app.get('/', (req, res) => {
  res.json({
    message: 'PDF Tools Self-Hosted API',
    version: '1.0.0',
    endpoints: [
      'POST /api/merge - Merge multiple PDF files',
      'POST /api/split - Split PDF file',
      'POST /api/compress - Compress PDF file',
      'POST /api/convert/to-pdf - Convert files to PDF',
      'POST /api/convert/from-pdf - Convert PDF to other formats',
      'GET /api/health - Health check'
    ]
  });
});

// PDF Merge endpoint
app.post('/api/merge', upload.array('pdfs'), async (req, res) => {
  try {
    if (!req.files || req.files.length < 2) {
      return res.status(400).json({ error: 'At least 2 PDF files are required' });
    }

    const filePaths = req.files.map(file => file.path);
    const outputPath = `temp/output/merged_${Date.now()}.pdf`;

    const metadata = {
      title: req.body.title || 'Merged PDF',
      author: req.body.author || 'PDF Tools Self-Hosted'
    };

    const result = await pdfMergeService.mergeWithMetadata(filePaths, outputPath, metadata);

    filePaths.forEach(filePath => {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    });

    // Generate custom filename from title
    const customTitle = req.body.title || 'Merged PDF';
    const sanitizedTitle = sanitizeFilename(customTitle);
    const downloadFilename = `${sanitizedTitle}.pdf`;

    res.download(outputPath, downloadFilename, (err) => {
      if (err) {
        console.error('Download error:', err);
      }
      setTimeout(() => {
        if (fs.existsSync(outputPath)) {
          fs.unlinkSync(outputPath);
        }
      }, 30000);
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PDF Split endpoint
app.post('/api/split', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'PDF file is required' });
    }

    const inputPath = req.file.path;
    const outputDir = `temp/output/split_${Date.now()}`;
    fs.mkdirSync(outputDir, { recursive: true });

    let options = {};

    if (req.body.pageRanges) {
      options.pageRanges = JSON.parse(req.body.pageRanges);
    } else if (req.body.specificPages) {
      options.specificPages = JSON.parse(req.body.specificPages);
    }

    const result = await pdfSplitService.splitPDF(inputPath, outputDir, options);

    if (fs.existsSync(inputPath)) {
      fs.unlinkSync(inputPath);
    }

    if (result.splitFiles.length === 1) {
      const singleFile = result.splitFiles[0];
      res.download(singleFile.outputPath, `page_${singleFile.pageNumber || 'extracted'}.pdf`, (err) => {
        if (err) console.error('Download error:', err);
        setTimeout(() => {
          if (fs.existsSync(outputDir)) {
            fs.rmSync(outputDir, { recursive: true, force: true });
          }
        }, 30000);
      });
    } else {
      const archive = archiver('zip', { zlib: { level: 9 } });
      const zipPath = `temp/output/split_pages_${Date.now()}.zip`;
      const output = fs.createWriteStream(zipPath);

      archive.pipe(output);

      result.splitFiles.forEach(file => {
        archive.file(file.outputPath, { name: path.basename(file.outputPath) });
      });

      await archive.finalize();

      res.download(zipPath, 'split_pages.zip', (err) => {
        if (err) console.error('Download error:', err);
        setTimeout(() => {
          if (fs.existsSync(outputDir)) {
            fs.rmSync(outputDir, { recursive: true, force: true });
          }
          if (fs.existsSync(zipPath)) {
            fs.unlinkSync(zipPath);
          }
        }, 30000);
      });
    }

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PDF Compress endpoint
app.post('/api/compress', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'PDF file is required' });
    }

    const inputPath = req.file.path;
    const outputPath = `temp/output/compressed_${Date.now()}.pdf`;
    const quality = req.body.quality || 'medium';

    const result = await pdfCompressService.compressPDF(inputPath, outputPath, quality);

    if (fs.existsSync(inputPath)) {
      fs.unlinkSync(inputPath);
    }

    res.download(outputPath, 'compressed.pdf', (err) => {
      if (err) {
        console.error('Download error:', err);
      }
      setTimeout(() => {
        if (fs.existsSync(outputPath)) {
          fs.unlinkSync(outputPath);
        }
      }, 30000);
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Convert to PDF endpoints
app.post('/api/convert/to-pdf', upload.array('files'), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'At least one file is required' });
    }

    const file = req.files[0];
    const ext = path.extname(file.originalname).toLowerCase();
    const outputPath = `temp/output/converted_${Date.now()}.pdf`;

    let result;

    if (['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff'].includes(ext)) {
      const filePaths = req.files.map(f => f.path);
      result = await pdfConvertService.imageToPDF(filePaths, outputPath, {
        title: req.body.title || 'Converted Images',
        author: req.body.author || 'PDF Tools Self-Hosted'
      });
    } else if (ext === '.docx') {
      result = await pdfConvertService.wordToPDF(file.path, outputPath);
    } else {
      return res.status(400).json({ error: 'Unsupported file format' });
    }

    req.files.forEach(file => {
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
    });

    res.download(outputPath, 'converted.pdf', (err) => {
      if (err) console.error('Download error:', err);
      setTimeout(() => {
        if (fs.existsSync(outputPath)) {
          fs.unlinkSync(outputPath);
        }
      }, 30000);
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Convert from PDF endpoints
app.post('/api/convert/from-pdf', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'PDF file is required' });
    }

    const inputPath = req.file.path;
    const convertTo = req.body.convertTo || 'png';

    let result;

    if (['png', 'jpeg', 'gif'].includes(convertTo)) {
      const outputDir = `temp/output/pdf_to_images_${Date.now()}`;
      fs.mkdirSync(outputDir, { recursive: true });

      result = await pdfConvertService.pdfToImages(inputPath, outputDir, {
        format: convertTo,
        density: parseInt(req.body.density) || 300,
        quality: parseInt(req.body.quality) || 90
      });

      if (fs.existsSync(inputPath)) {
        fs.unlinkSync(inputPath);
      }

      const archive = archiver('zip', { zlib: { level: 9 } });
      const zipPath = `temp/output/pdf_images_${Date.now()}.zip`;
      const output = fs.createWriteStream(zipPath);

      archive.pipe(output);

      result.files.forEach(file => {
        archive.file(file.path, { name: file.name });
      });

      await archive.finalize();

      res.download(zipPath, `pdf_images.zip`, (err) => {
        if (err) console.error('Download error:', err);
        setTimeout(() => {
          if (fs.existsSync(outputDir)) {
            fs.rmSync(outputDir, { recursive: true, force: true });
          }
          if (fs.existsSync(zipPath)) {
            fs.unlinkSync(zipPath);
          }
        }, 30000);
      });

    } else if (convertTo === 'txt') {
      const outputPath = `temp/output/extracted_text_${Date.now()}.txt`;
      result = await pdfConvertService.pdfToText(inputPath, outputPath);

      if (fs.existsSync(inputPath)) {
        fs.unlinkSync(inputPath);
      }

      res.download(outputPath, 'extracted_text.txt', (err) => {
        if (err) console.error('Download error:', err);
        setTimeout(() => {
          if (fs.existsSync(outputPath)) {
            fs.unlinkSync(outputPath);
          }
        }, 30000);
      });

    } else {
      return res.status(400).json({ error: 'Unsupported conversion format' });
    }

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0',
    services: {
      pdfLibrary: 'pdf-lib',
      imageProcessing: 'sharp',
      documentProcessing: 'mammoth'
    }
  });
});

// Supported formats endpoint
app.get('/api/formats', async (req, res) => {
  try {
    const formats = await pdfConvertService.getSupportedFormats();
    res.json(formats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large' });
    }
  }
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

app.listen(PORT, () => {
  console.log(`PDF Tools server running on port ${PORT}`);
  console.log(`API documentation available at http://localhost:${PORT}`);
});

module.exports = app;