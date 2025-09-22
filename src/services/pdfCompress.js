const fs = require('fs');
const { PDFDocument, PDFImage } = require('pdf-lib');

class PDFCompressService {
  async compressPDF(inputPath, outputPath, quality = 'medium') {
    try {
      const pdfBytes = fs.readFileSync(inputPath);
      const pdf = await PDFDocument.load(pdfBytes);

      const compressionSettings = this.getCompressionSettings(quality);

      const compressedPdf = await PDFDocument.create();

      const pages = pdf.getPages();
      for (const page of pages) {
        const newPage = compressedPdf.addPage([page.getWidth(), page.getHeight()]);

        try {
          const { width, height } = page.getSize();

          newPage.drawPage(page, {
            x: 0,
            y: 0,
            width,
            height,
          });
        } catch (error) {
          console.warn(`Warning: Could not process page: ${error.message}`);
        }
      }

      const metadata = {
        title: pdf.getTitle() || '',
        author: pdf.getAuthor() || '',
        subject: pdf.getSubject() || '',
        creator: 'PDF Tools Self-Hosted'
      };

      if (metadata.title) compressedPdf.setTitle(metadata.title);
      if (metadata.author) compressedPdf.setAuthor(metadata.author);
      if (metadata.subject) compressedPdf.setSubject(metadata.subject);
      compressedPdf.setCreator(metadata.creator);

      const compressedBytes = await compressedPdf.save({
        useObjectStreams: compressionSettings.useObjectStreams,
        addDefaultPage: false
      });

      fs.writeFileSync(outputPath, compressedBytes);

      const originalSize = pdfBytes.length;
      const compressedSize = compressedBytes.length;
      const compressionRatio = ((originalSize - compressedSize) / originalSize * 100).toFixed(2);

      return {
        success: true,
        outputPath,
        originalSize,
        compressedSize,
        compressionRatio: `${compressionRatio}%`,
        quality,
        pageCount: compressedPdf.getPageCount()
      };
    } catch (error) {
      throw new Error(`PDF compression failed: ${error.message}`);
    }
  }

  getCompressionSettings(quality) {
    const settings = {
      low: {
        useObjectStreams: true,
        imageQuality: 0.3
      },
      medium: {
        useObjectStreams: true,
        imageQuality: 0.6
      },
      high: {
        useObjectStreams: false,
        imageQuality: 0.8
      }
    };

    return settings[quality] || settings.medium;
  }

  async getCompressionEstimate(inputPath) {
    try {
      const pdfBytes = fs.readFileSync(inputPath);
      const pdf = await PDFDocument.load(pdfBytes);

      const fileSize = pdfBytes.length;
      const pageCount = pdf.getPageCount();

      const estimates = {
        low: Math.round(fileSize * 0.3),
        medium: Math.round(fileSize * 0.5),
        high: Math.round(fileSize * 0.7)
      };

      return {
        originalSize: fileSize,
        pageCount,
        estimates,
        recommendations: this.getRecommendations(fileSize, pageCount)
      };
    } catch (error) {
      throw new Error(`Compression estimate failed: ${error.message}`);
    }
  }

  getRecommendations(fileSize, pageCount) {
    const sizeMB = fileSize / (1024 * 1024);

    if (sizeMB > 10) {
      return {
        recommended: 'low',
        reason: 'Large file size - aggressive compression recommended'
      };
    } else if (sizeMB > 5) {
      return {
        recommended: 'medium',
        reason: 'Medium file size - balanced compression recommended'
      };
    } else {
      return {
        recommended: 'high',
        reason: 'Small file size - preserve quality'
      };
    }
  }
}

module.exports = new PDFCompressService();