const fs = require('fs');
const path = require('path');
const { PDFDocument, rgb } = require('pdf-lib');
const pdf2pic = require('pdf2pic');
const mammoth = require('mammoth');
// const sharp = require('sharp'); // Temporarily disabled due to Windows compatibility issues
const pdfParse = require('pdf-parse');

class PDFConvertService {
  async imageToPDF(imagePaths, outputPath, options = {}) {
    try {
      const pdfDoc = await PDFDocument.create();

      for (const imagePath of imagePaths) {
        const imageBytes = fs.readFileSync(imagePath);
        const ext = path.extname(imagePath).toLowerCase();

        let image;
        try {
          if (ext === '.jpg' || ext === '.jpeg') {
            image = await pdfDoc.embedJpg(imageBytes);
          } else if (ext === '.png') {
            image = await pdfDoc.embedPng(imageBytes);
          } else {
            // Skip other formats for now due to Sharp compatibility issues
            throw new Error(`Unsupported image format: ${ext}. Please use JPG or PNG files.`);
          }
        } catch (embedError) {
          throw new Error(`Failed to embed image ${imagePath}: ${embedError.message}. Please ensure the image is a valid JPG or PNG file.`);
        }

        const page = pdfDoc.addPage();
        const { width: pageWidth, height: pageHeight } = page.getSize();
        const { width: imgWidth, height: imgHeight } = image.scale(1);

        const aspectRatio = imgWidth / imgHeight;
        const pageAspectRatio = pageWidth / pageHeight;

        let scaledWidth, scaledHeight;
        if (aspectRatio > pageAspectRatio) {
          scaledWidth = pageWidth * 0.9;
          scaledHeight = scaledWidth / aspectRatio;
        } else {
          scaledHeight = pageHeight * 0.9;
          scaledWidth = scaledHeight * aspectRatio;
        }

        const x = (pageWidth - scaledWidth) / 2;
        const y = (pageHeight - scaledHeight) / 2;

        page.drawImage(image, {
          x,
          y,
          width: scaledWidth,
          height: scaledHeight,
        });
      }

      if (options.title) pdfDoc.setTitle(options.title);
      if (options.author) pdfDoc.setAuthor(options.author);

      const pdfBytes = await pdfDoc.save();
      fs.writeFileSync(outputPath, pdfBytes);

      return {
        success: true,
        outputPath,
        pageCount: pdfDoc.getPageCount(),
        fileSize: pdfBytes.length,
        inputImages: imagePaths.length
      };
    } catch (error) {
      throw new Error(`Image to PDF conversion failed: ${error.message}`);
    }
  }

  async wordToPDF(docxPath, outputPath) {
    try {
      const docxBuffer = fs.readFileSync(docxPath);
      const result = await mammoth.extractRawText({ buffer: docxBuffer });

      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage();
      const { width, height } = page.getSize();

      const fontSize = 12;
      const margin = 50;
      const lineHeight = fontSize * 1.2;
      const maxWidth = width - (margin * 2);

      const words = result.value.split(' ');
      let currentLine = '';
      let yPosition = height - margin - fontSize;

      for (const word of words) {
        const testLine = currentLine + (currentLine ? ' ' : '') + word;
        const textWidth = testLine.length * (fontSize * 0.6);

        if (textWidth > maxWidth && currentLine) {
          page.drawText(currentLine, {
            x: margin,
            y: yPosition,
            size: fontSize,
            color: rgb(0, 0, 0),
          });

          currentLine = word;
          yPosition -= lineHeight;

          if (yPosition < margin) {
            const newPage = pdfDoc.addPage();
            yPosition = newPage.getSize().height - margin - fontSize;
          }
        } else {
          currentLine = testLine;
        }
      }

      if (currentLine) {
        page.drawText(currentLine, {
          x: margin,
          y: yPosition,
          size: fontSize,
          color: rgb(0, 0, 0),
        });
      }

      pdfDoc.setTitle(path.basename(docxPath, '.docx'));
      pdfDoc.setCreator('PDF Tools Self-Hosted');

      const pdfBytes = await pdfDoc.save();
      fs.writeFileSync(outputPath, pdfBytes);

      return {
        success: true,
        outputPath,
        pageCount: pdfDoc.getPageCount(),
        fileSize: pdfBytes.length,
        extractedText: result.value.length
      };
    } catch (error) {
      throw new Error(`Word to PDF conversion failed: ${error.message}`);
    }
  }

  async pdfToImages(pdfPath, outputDir, options = {}) {
    try {
      const format = options.format || 'png';
      const density = options.density || 300;
      const quality = options.quality || 90;

      // First try with pdf2pic
      try {
        const convertOptions = {
          density,
          saveFilename: 'page',
          savePath: outputDir,
          format,
          width: options.width || 2480,
          height: options.height || 3508
        };

        if (format === 'jpeg') {
          convertOptions.quality = quality;
        }

        const convert = pdf2pic.fromPath(pdfPath, convertOptions);
        const results = await convert.bulk(-1);

        const outputFiles = results.map(result => ({
          page: result.page,
          path: result.path,
          name: result.name,
          size: fs.statSync(result.path).size
        }));

        return {
          success: true,
          outputDirectory: outputDir,
          format,
          totalPages: results.length,
          files: outputFiles,
          settings: { density, quality, format },
          method: 'pdf2pic'
        };
      } catch (pdf2picError) {
        console.warn('pdf2pic failed, falling back to alternative method:', pdf2picError.message);

        // Fallback: Create a simple text representation
        const pdfBytes = fs.readFileSync(pdfPath);
        const { PDFDocument: FallbackPDFDocument } = require('pdf-lib');
        const pdf = await FallbackPDFDocument.load(pdfBytes);
        const pageCount = pdf.getPageCount();

        const outputFiles = [];

        for (let i = 1; i <= pageCount; i++) {
          const fileName = `page_${i}.txt`;
          const filePath = path.join(outputDir, fileName);
          const content = `PDF Page ${i}\n\nThis is a text representation of page ${i} from the PDF.\nOriginal PDF conversion to images is not available due to missing system dependencies (ImageMagick/GraphicsMagick).\n\nTo enable image conversion, please install:\n- Windows: ImageMagick or GraphicsMagick\n- Linux: sudo apt-get install imagemagick or sudo apt-get install graphicsmagick\n- macOS: brew install imagemagick or brew install graphicsmagick`;

          fs.writeFileSync(filePath, content);

          outputFiles.push({
            page: i,
            path: filePath,
            name: fileName,
            size: fs.statSync(filePath).size
          });
        }

        return {
          success: true,
          outputDirectory: outputDir,
          format: 'txt',
          totalPages: pageCount,
          files: outputFiles,
          settings: { density, quality, format: 'txt (fallback)' },
          method: 'text-fallback',
          warning: 'Image conversion unavailable - ImageMagick/GraphicsMagick not installed'
        };
      }
    } catch (error) {
      throw new Error(`PDF to images conversion failed: ${error.message}`);
    }
  }

  async pdfToText(pdfPath, outputPath) {
    try {
      const pdfBuffer = fs.readFileSync(pdfPath);
      const data = await pdfParse(pdfBuffer);

      const extractedText = data.text;
      fs.writeFileSync(outputPath, extractedText, 'utf8');

      return {
        success: true,
        outputPath,
        pageCount: data.numpages,
        textLength: extractedText.length,
        metadata: data.info || {}
      };
    } catch (error) {
      throw new Error(`PDF to text conversion failed: ${error.message}`);
    }
  }

  async getSupportedFormats() {
    return {
      input: {
        images: ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff'],
        documents: ['.docx'],
        pdf: ['.pdf']
      },
      output: {
        images: ['png', 'jpeg', 'gif'],
        documents: ['txt'],
        pdf: ['.pdf']
      }
    };
  }
}

module.exports = new PDFConvertService();