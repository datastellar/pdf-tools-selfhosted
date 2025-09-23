const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

console.log('📦 Creating Ultra-Light Source Package...');

// Create package with only essential files
const output = fs.createWriteStream('pdf-tools-source.zip');
const archive = archiver('zip', {
    zlib: { level: 9 } // Maximum compression
});

output.on('close', function() {
    const sizeInMB = (archive.pointer() / (1024 * 1024)).toFixed(2);
    console.log(`✅ Source package created: ${sizeInMB} MB`);
    console.log('📁 Files included:');
    console.log('   - Source code (src/)');
    console.log('   - Public assets (public/)');
    console.log('   - Package configuration');
    console.log('   - Essential configuration files');
});

archive.on('error', function(err) {
    throw err;
});

archive.pipe(output);

// Add only essential files
archive.directory('src/', 'src/');
archive.directory('public/', 'public/');
archive.file('package.json', { name: 'package.json' });

// Add services if they exist
if (fs.existsSync('src/services')) {
    archive.directory('src/services/', 'src/services/');
}

archive.finalize();