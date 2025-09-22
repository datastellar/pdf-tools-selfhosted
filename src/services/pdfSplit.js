const fs = require('fs');
const { PDFDocument } = require('pdf-lib');

class PDFSplitService {
  async splitPDF(inputPath, outputDir, options = {}) {
    try {
      const pdfBytes = fs.readFileSync(inputPath);
      const pdf = await PDFDocument.load(pdfBytes);
      const totalPages = pdf.getPageCount();

      const results = [];

      if (options.pageRanges) {
        for (let i = 0; i < options.pageRanges.length; i++) {
          const range = options.pageRanges[i];
          const startPage = Math.max(0, range.start - 1);
          const endPage = Math.min(totalPages - 1, range.end - 1);

          const newPdf = await PDFDocument.create();
          const copiedPages = await newPdf.copyPages(pdf, Array.from(
            { length: endPage - startPage + 1 },
            (_, i) => startPage + i
          ));

          copiedPages.forEach(page => newPdf.addPage(page));

          const outputPath = `${outputDir}/pages_${range.start}-${range.end}.pdf`;
          const newPdfBytes = await newPdf.save();
          fs.writeFileSync(outputPath, newPdfBytes);

          results.push({
            outputPath,
            pageRange: `${range.start}-${range.end}`,
            pageCount: copiedPages.length,
            fileSize: newPdfBytes.length
          });
        }
      } else if (options.specificPages) {
        for (const pageNum of options.specificPages) {
          if (pageNum <= totalPages && pageNum > 0) {
            const newPdf = await PDFDocument.create();
            const [copiedPage] = await newPdf.copyPages(pdf, [pageNum - 1]);
            newPdf.addPage(copiedPage);

            const outputPath = `${outputDir}/page_${pageNum}.pdf`;
            const newPdfBytes = await newPdf.save();
            fs.writeFileSync(outputPath, newPdfBytes);

            results.push({
              outputPath,
              pageNumber: pageNum,
              pageCount: 1,
              fileSize: newPdfBytes.length
            });
          }
        }
      } else {
        for (let i = 0; i < totalPages; i++) {
          const newPdf = await PDFDocument.create();
          const [copiedPage] = await newPdf.copyPages(pdf, [i]);
          newPdf.addPage(copiedPage);

          const outputPath = `${outputDir}/page_${i + 1}.pdf`;
          const newPdfBytes = await newPdf.save();
          fs.writeFileSync(outputPath, newPdfBytes);

          results.push({
            outputPath,
            pageNumber: i + 1,
            pageCount: 1,
            fileSize: newPdfBytes.length
          });
        }
      }

      return {
        success: true,
        totalPages,
        splitFiles: results,
        outputDirectory: outputDir
      };
    } catch (error) {
      throw new Error(`PDF split failed: ${error.message}`);
    }
  }

  async extractPages(inputPath, outputPath, pageNumbers) {
    try {
      const pdfBytes = fs.readFileSync(inputPath);
      const pdf = await PDFDocument.load(pdfBytes);
      const newPdf = await PDFDocument.create();

      const validPages = pageNumbers.filter(num => num > 0 && num <= pdf.getPageCount());
      const pageIndices = validPages.map(num => num - 1);

      const copiedPages = await newPdf.copyPages(pdf, pageIndices);
      copiedPages.forEach(page => newPdf.addPage(page));

      const newPdfBytes = await newPdf.save();
      fs.writeFileSync(outputPath, newPdfBytes);

      return {
        success: true,
        outputPath,
        extractedPages: validPages,
        pageCount: validPages.length,
        fileSize: newPdfBytes.length
      };
    } catch (error) {
      throw new Error(`Page extraction failed: ${error.message}`);
    }
  }
}

module.exports = new PDFSplitService();