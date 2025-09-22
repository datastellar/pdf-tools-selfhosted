const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

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

// Routes
app.get('/', (req, res) => {
  res.json({
    message: 'PDF Tools Self-Hosted API',
    version: '1.0.0',
    endpoints: [
      'POST /api/merge - Merge multiple PDF files',
      'POST /api/split - Split PDF file',
      'POST /api/compress - Compress PDF file',
      'POST /api/convert - Convert PDF to other formats'
    ]
  });
});

// PDF Merge endpoint
app.post('/api/merge', upload.array('pdfs'), async (req, res) => {
  try {
    // TODO: Implement PDF merge functionality
    res.status(501).json({ error: 'PDF merge not implemented yet' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PDF Split endpoint
app.post('/api/split', upload.single('pdf'), async (req, res) => {
  try {
    // TODO: Implement PDF split functionality
    res.status(501).json({ error: 'PDF split not implemented yet' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PDF Compress endpoint
app.post('/api/compress', upload.single('pdf'), async (req, res) => {
  try {
    // TODO: Implement PDF compress functionality
    res.status(501).json({ error: 'PDF compress not implemented yet' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PDF Convert endpoint
app.post('/api/convert', upload.single('pdf'), async (req, res) => {
  try {
    // TODO: Implement PDF convert functionality
    res.status(501).json({ error: 'PDF convert not implemented yet' });
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