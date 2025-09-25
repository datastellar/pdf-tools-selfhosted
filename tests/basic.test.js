// Basic smoke tests to verify core functionality

const fs = require('fs');
const path = require('path');

describe('Project Structure', () => {
  test('should have required directories', () => {
    expect(fs.existsSync('src')).toBeTruthy();
    expect(fs.existsSync('public')).toBeTruthy();
    expect(fs.existsSync('installers')).toBeTruthy();
  });

  test('should have main server file', () => {
    expect(fs.existsSync('src/index.js')).toBeTruthy();
  });

  test('should have web interface files', () => {
    expect(fs.existsSync('public/index.html')).toBeTruthy();
    expect(fs.existsSync('public/css/style.css')).toBeTruthy();
    expect(fs.existsSync('public/js/app.js')).toBeTruthy();
  });

  test('should have documentation', () => {
    expect(fs.existsSync('README.md')).toBeTruthy();
    expect(fs.existsSync('USER-GUIDE.md')).toBeTruthy();
  });
});

describe('Configuration', () => {
  test('package.json should exist and be valid', () => {
    expect(fs.existsSync('package.json')).toBeTruthy();
    const packageData = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    expect(packageData.name).toBe('pdf-tools-selfhosted');
    expect(packageData.scripts).toHaveProperty('start');
    expect(packageData.scripts).toHaveProperty('dev');
  });

  test('should have proper gitignore', () => {
    expect(fs.existsSync('.gitignore')).toBeTruthy();
    const gitignore = fs.readFileSync('.gitignore', 'utf8');
    expect(gitignore).toContain('node_modules/');
    expect(gitignore).toContain('dist/');
    expect(gitignore).toContain('temp/');
  });
});

describe('Server Module', () => {
  test('server file should be syntactically valid', () => {
    expect(() => {
      require('../src/index.js');
    }).not.toThrow();
  });
});