const fs = require('fs');
const { PDFDocument } = require('pdf-lib');

class PDFCompressService {
  async compressPDF(inputPath, outputPath, quality = 'medium') {
    try {
      const pdfBytes = fs.readFileSync(inputPath);
      const pdf = await PDFDocument.load(pdfBytes);

      const compressionSettings = this.getCompressionSettings(quality);

      // Instead of recreating the PDF, optimize the existing one
      const compressedBytes = await pdf.save({
        useObjectStreams: compressionSettings.useObjectStreams,
        addDefaultPage: false,
        objectsPerTick: compressionSettings.objectsPerTick,
        updateFieldAppearances: false
      });

      fs.writeFileSync(outputPath, compressedBytes);

      const originalSize = pdfBytes.length;
      const compressedSize = compressedBytes.length;
      const compressionRatio = ((originalSize - compressedSize) / originalSize * 100).toFixed(2);

      // Additional compression attempt for better results
      if (compressionSettings.additionalOptimization) {
        try {
          const secondPassPdf = await PDFDocument.load(compressedBytes);
          const secondPassBytes = await secondPassPdf.save({
            useObjectStreams: true,
            addDefaultPage: false,
            objectsPerTick: 50
          });

          if (secondPassBytes.length < compressedBytes.length) {
            fs.writeFileSync(outputPath, secondPassBytes);
            const finalCompressionRatio = ((originalSize - secondPassBytes.length) / originalSize * 100).toFixed(2);

            return {
              success: true,
              outputPath,
              originalSize,
              compressedSize: secondPassBytes.length,
              compressionRatio: `${finalCompressionRatio}%`,
              quality,
              pageCount: pdf.getPageCount(),
              optimization: 'two-pass'
            };
          }
        } catch (secondPassError) {
          console.warn('Second pass optimization failed, using first pass result');
        }
      }

      return {
        success: true,
        outputPath,
        originalSize,
        compressedSize,
        compressionRatio: `${compressionRatio}%`,
        quality,
        pageCount: pdf.getPageCount(),
        optimization: 'single-pass'
      };
    } catch (error) {
      throw new Error(`PDF compression failed: ${error.message}`);
    }
  }

  getCompressionSettings(quality) {
    const settings = {
      low: {
        useObjectStreams: true,
        objectsPerTick: 25,
        additionalOptimization: true
      },
      medium: {
        useObjectStreams: true,
        objectsPerTick: 50,
        additionalOptimization: true
      },
      high: {
        useObjectStreams: false,
        objectsPerTick: 100,
        additionalOptimization: false
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