const fs = require('fs');
const { PDFDocument } = require('pdf-lib');

class PDFMergeService {
  async mergePDFs(filePaths, outputPath) {
    try {
      const mergedPdf = await PDFDocument.create();

      for (const filePath of filePaths) {
        const pdfBytes = fs.readFileSync(filePath);
        const pdf = await PDFDocument.load(pdfBytes);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());

        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }

      const pdfBytes = await mergedPdf.save();
      fs.writeFileSync(outputPath, pdfBytes);

      return {
        success: true,
        outputPath,
        pageCount: mergedPdf.getPageCount(),
        fileSize: pdfBytes.length
      };
    } catch (error) {
      throw new Error(`PDF merge failed: ${error.message}`);
    }
  }

  async mergeWithMetadata(filePaths, outputPath, metadata = {}) {
    try {
      const mergedPdf = await PDFDocument.create();

      if (metadata.title) mergedPdf.setTitle(metadata.title);
      if (metadata.author) mergedPdf.setAuthor(metadata.author);
      if (metadata.subject) mergedPdf.setSubject(metadata.subject);
      if (metadata.creator) mergedPdf.setCreator(metadata.creator);

      for (const filePath of filePaths) {
        const pdfBytes = fs.readFileSync(filePath);
        const pdf = await PDFDocument.load(pdfBytes);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());

        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }

      const pdfBytes = await mergedPdf.save();
      fs.writeFileSync(outputPath, pdfBytes);

      return {
        success: true,
        outputPath,
        pageCount: mergedPdf.getPageCount(),
        fileSize: pdfBytes.length,
        metadata
      };
    } catch (error) {
      throw new Error(`PDF merge with metadata failed: ${error.message}`);
    }
  }
}

module.exports = new PDFMergeService();