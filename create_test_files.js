const fs = require('fs');
const sharp = require('sharp');

async function createTestFiles() {
  console.log('Creating test files for conversion testing...');

  // Create simple test images
  try {
    // Create a simple JPG image with text
    const jpgBuffer = await sharp({
      create: {
        width: 400,
        height: 300,
        channels: 3,
        background: { r: 255, g: 200, b: 100 }
      }
    })
    .jpeg({ quality: 90 })
    .toBuffer();

    fs.writeFileSync('test_image1.jpg', jpgBuffer);

    // Create a simple PNG image with text
    const pngBuffer = await sharp({
      create: {
        width: 400,
        height: 300,
        channels: 4,
        background: { r: 100, g: 200, b: 255, alpha: 1 }
      }
    })
    .png()
    .toBuffer();

    fs.writeFileSync('test_image2.png', pngBuffer);

    console.log('Created test_image1.jpg and test_image2.png');

    // Create a simple DOCX file content
    const simpleDocContent = `
Test Document for PDF Conversion

This is a simple test document that will be converted to PDF.

Features to test:
- Text content
- Multiple paragraphs
- Basic formatting

This document is created for testing the Word to PDF conversion functionality.
`;

    // Since we can't easily create a real DOCX without additional libraries,
    // let's create a text file that we can rename for testing
    fs.writeFileSync('test_document.txt', simpleDocContent);
    console.log('Created test_document.txt (simulating DOCX functionality)');

    // Create a test HTML file for potential conversion
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <title>Test HTML Document</title>
</head>
<body>
    <h1>Test HTML Document</h1>
    <p>This is a test HTML document for PDF conversion.</p>
    <p>It contains basic HTML elements for testing.</p>
</body>
</html>
`;
    fs.writeFileSync('test_document.html', htmlContent);
    console.log('Created test_document.html');

    console.log('All test files created successfully!');

  } catch (error) {
    console.error('Error creating test files:', error);
  }
}

createTestFiles();