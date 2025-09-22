# PDF Tools Self-Hosted

A self-hosted web application for PDF processing and manipulation tools. This project provides a simple, privacy-focused alternative to online PDF services.

## Features

- **PDF Merge** - Combine multiple PDF files into one
- **PDF Split** - Split PDF into separate pages or ranges
- **PDF Compress** - Reduce PDF file size
- **PDF Convert** - Convert PDFs to images and other formats
- **Privacy First** - All processing happens locally on your server

## Quick Start

### Prerequisites

- Node.js 16.0.0 or higher
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/datastellar/pdf-tools-selfhosted.git
cd pdf-tools-selfhosted

# Install dependencies
npm install

# Start the development server
npm run dev
```

The application will be available at `http://localhost:3000`

### Production

```bash
# Install dependencies
npm install --production

# Start the server
npm start
```

## API Endpoints

- `POST /api/merge` - Merge multiple PDF files
- `POST /api/split` - Split PDF file
- `POST /api/compress` - Compress PDF file
- `POST /api/convert` - Convert PDF to other formats

## Configuration

Create a `.env` file in the root directory:

```env
PORT=3000
UPLOAD_LIMIT=50mb
TEMP_DIR=./temp
```

## Docker Support

```bash
# Build the image
docker build -t pdf-tools-selfhosted .

# Run the container
docker run -p 3000:3000 pdf-tools-selfhosted
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Security

This application processes files locally and does not send data to external services. All uploaded files are temporarily stored and automatically cleaned up after processing.