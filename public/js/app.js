// Global variables
let currentTool = null;
let selectedFiles = [];

// Tool configurations
const toolConfigs = {
    merge: {
        icon: 'fas fa-object-group',
        title: 'Merge PDFs',
        description: 'Combine multiple PDF files into a single document',
        endpoint: '/api/merge',
        acceptMultiple: true,
        minFiles: 2
    },
    split: {
        icon: 'fas fa-cut',
        title: 'Split PDF',
        description: 'Split PDF into separate pages or specific ranges',
        endpoint: '/api/split',
        acceptMultiple: false,
        minFiles: 1
    },
    compress: {
        icon: 'fas fa-compress',
        title: 'Compress PDF',
        description: 'Reduce PDF file size while maintaining quality',
        endpoint: '/api/compress',
        acceptMultiple: true,
        minFiles: 1
    },
    convert: {
        icon: 'fas fa-exchange-alt',
        title: 'Convert PDF',
        description: 'Convert PDF to images and other formats',
        endpoint: '/api/convert',
        acceptMultiple: true,
        minFiles: 1
    }
};

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    setupDragAndDrop();
});

// Initialize event listeners
function initializeEventListeners() {
    // File input change
    document.getElementById('fileInput').addEventListener('change', handleFileSelect);

    // Split mode radio buttons
    document.querySelectorAll('input[name="splitMode"]').forEach(radio => {
        radio.addEventListener('change', handleSplitModeChange);
    });
}

// Setup drag and drop functionality
function setupDragAndDrop() {
    const uploadArea = document.getElementById('upload-area');

    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleFileDrop);
}

// Handle drag over
function handleDragOver(e) {
    e.preventDefault();
    e.currentTarget.classList.add('drag-over');
}

// Handle drag leave
function handleDragLeave(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
}

// Handle file drop
function handleFileDrop(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');

    const files = Array.from(e.dataTransfer.files).filter(file => file.type === 'application/pdf');
    if (files.length > 0) {
        handleFiles(files);
    } else {
        showError('Please select PDF files only.');
    }
}

// Handle file select from input
function handleFileSelect(e) {
    const files = Array.from(e.target.files);
    handleFiles(files);
}

// Handle selected files
function handleFiles(files) {
    const config = toolConfigs[currentTool];

    if (!config.acceptMultiple && files.length > 1) {
        showError(`${config.title} accepts only one file at a time.`);
        return;
    }

    // Add files to selection
    files.forEach(file => {
        if (!selectedFiles.find(f => f.name === file.name && f.size === file.size)) {
            selectedFiles.push(file);
        }
    });

    updateFileList();
    updateProcessButton();

    // Clear file input
    document.getElementById('fileInput').value = '';
}

// Update file list display
function updateFileList() {
    const fileList = document.getElementById('file-list');

    if (selectedFiles.length === 0) {
        fileList.classList.add('hidden');
        return;
    }

    fileList.classList.remove('hidden');
    fileList.innerHTML = selectedFiles.map((file, index) => `
        <div class="file-item">
            <div class="file-info-left">
                <i class="fas fa-file-pdf file-icon"></i>
                <div class="file-details">
                    <h4>${file.name}</h4>
                    <p>${formatFileSize(file.size)}</p>
                </div>
            </div>
            <button class="remove-file" onclick="removeFile(${index})">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `).join('');
}

// Remove file from selection
function removeFile(index) {
    selectedFiles.splice(index, 1);
    updateFileList();
    updateProcessButton();
}

// Update process button state
function updateProcessButton() {
    const processBtn = document.getElementById('process-btn');
    const config = toolConfigs[currentTool];

    if (selectedFiles.length >= config.minFiles) {
        processBtn.classList.remove('hidden');
        processBtn.disabled = false;
    } else {
        processBtn.classList.add('hidden');
        processBtn.disabled = true;
    }
}

// Select tool and show upload interface
function selectTool(tool) {
    currentTool = tool;
    selectedFiles = [];

    const config = toolConfigs[tool];

    // Update tool header
    document.getElementById('current-tool-icon').className = config.icon;
    document.getElementById('current-tool-title').textContent = config.title;
    document.getElementById('current-tool-desc').textContent = config.description;

    // Update file input accept attribute
    const fileInput = document.getElementById('fileInput');
    fileInput.multiple = config.acceptMultiple;

    // Show/hide tool-specific options
    showToolOptions(tool);

    // Show upload section
    document.querySelector('.tools-grid').classList.add('hidden');
    document.getElementById('upload-section').classList.remove('hidden');

    // Reset UI state
    resetUploadState();
}

// Show tool-specific options
function showToolOptions(tool) {
    // Hide all option panels
    document.querySelectorAll('.options-panel').forEach(panel => {
        panel.classList.add('hidden');
    });

    // Show relevant options
    const optionsPanel = document.getElementById(`${tool}-options`);
    if (optionsPanel) {
        document.getElementById('tool-options').classList.remove('hidden');
        optionsPanel.classList.remove('hidden');
    } else {
        document.getElementById('tool-options').classList.add('hidden');
    }
}

// Handle split mode change
function handleSplitModeChange(e) {
    const rangeInput = document.getElementById('range-input');
    if (e.target.value === 'range') {
        rangeInput.classList.remove('hidden');
    } else {
        rangeInput.classList.add('hidden');
    }
}

// Go back to home
function backToHome() {
    document.querySelector('.tools-grid').classList.remove('hidden');
    document.getElementById('upload-section').classList.add('hidden');
    currentTool = null;
    selectedFiles = [];
}

// Start new task
function startNewTask() {
    resetUploadState();
    selectedFiles = [];
    updateFileList();
    updateProcessButton();
}

// Reset upload state
function resetUploadState() {
    document.getElementById('file-list').classList.add('hidden');
    document.getElementById('process-btn').classList.add('hidden');
    document.getElementById('progress-section').classList.add('hidden');
    document.getElementById('results-section').classList.add('hidden');
    document.getElementById('loading-overlay').classList.add('hidden');
}

// Process files
async function processFiles() {
    if (selectedFiles.length === 0) return;

    const config = toolConfigs[currentTool];

    // Show progress
    showProgress();

    try {
        // Prepare form data
        const formData = new FormData();

        selectedFiles.forEach((file, index) => {
            formData.append('files', file);
        });

        // Add tool-specific parameters
        addToolSpecificParams(formData);

        // Make request
        const response = await fetch(config.endpoint, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }

        // Handle response
        await handleProcessResponse(response);

    } catch (error) {
        hideProgress();
        showError('Processing failed: ' + error.message);
    }
}

// Add tool-specific parameters to form data
function addToolSpecificParams(formData) {
    switch (currentTool) {
        case 'merge':
            const mergeFilename = document.getElementById('merge-filename').value.trim();
            if (mergeFilename) {
                formData.append('filename', mergeFilename);
            }
            break;

        case 'split':
            const splitMode = document.querySelector('input[name="splitMode"]:checked').value;
            formData.append('mode', splitMode);
            if (splitMode === 'range') {
                const pageRange = document.getElementById('page-range').value.trim();
                formData.append('range', pageRange);
            }
            break;

        case 'compress':
            const quality = document.getElementById('quality').value;
            formData.append('quality', quality);
            break;

        case 'convert':
            const format = document.getElementById('format').value;
            const dpi = document.getElementById('dpi').value;
            formData.append('format', format);
            formData.append('dpi', dpi);
            break;
    }
}

// Handle process response
async function handleProcessResponse(response) {
    const contentType = response.headers.get('content-type');

    if (contentType && contentType.includes('application/json')) {
        // JSON response with download links
        const data = await response.json();
        showResults(data);
    } else {
        // Direct file download
        const blob = await response.blob();
        const contentDisposition = response.headers.get('content-disposition');
        let filename = 'processed-file.pdf';

        if (contentDisposition) {
            const matches = contentDisposition.match(/filename[^;=\\n]*=((['\"]).*?\\2|[^;\\n]*)/);
            if (matches && matches[1]) {
                filename = matches[1].replace(/['"]/g, '');
            }
        }

        downloadBlob(blob, filename);
        showResults({ success: true, message: 'File processed successfully!' });
    }

    hideProgress();
}

// Show processing progress
function showProgress() {
    document.getElementById('process-btn').classList.add('hidden');
    document.getElementById('progress-section').classList.remove('hidden');
    document.getElementById('loading-overlay').classList.remove('hidden');

    // Simulate progress (since we don't have real progress from server)
    let progress = 0;
    const progressFill = document.getElementById('progress-fill');
    const progressText = document.getElementById('progress-text');

    const interval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress > 90) progress = 90;

        progressFill.style.width = progress + '%';
        progressText.textContent = `Processing... ${Math.round(progress)}%`;
    }, 500);

    // Store interval for cleanup
    window.progressInterval = interval;
}

// Hide progress
function hideProgress() {
    document.getElementById('loading-overlay').classList.add('hidden');

    if (window.progressInterval) {
        clearInterval(window.progressInterval);
        window.progressInterval = null;
    }

    // Complete progress
    document.getElementById('progress-fill').style.width = '100%';
    document.getElementById('progress-text').textContent = 'Processing complete!';

    setTimeout(() => {
        document.getElementById('progress-section').classList.add('hidden');
    }, 1000);
}

// Show results
function showResults(data) {
    const resultsSection = document.getElementById('results-section');
    const downloadLinks = document.getElementById('download-links');

    if (data.downloadUrl || data.downloads) {
        downloadLinks.innerHTML = '';

        if (data.downloadUrl) {
            // Single download
            downloadLinks.innerHTML = `
                <a href="${data.downloadUrl}" class="download-link" download>
                    <i class="fas fa-download"></i>
                    Download ${data.filename || 'Processed File'}
                </a>
            `;
        } else if (data.downloads && data.downloads.length > 0) {
            // Multiple downloads
            downloadLinks.innerHTML = data.downloads.map(download => `
                <a href="${download.url}" class="download-link" download>
                    <i class="fas fa-download"></i>
                    Download ${download.filename}
                </a>
            `).join('');
        }
    } else if (data.message) {
        downloadLinks.innerHTML = `<p style="color: #48bb78; font-weight: 500;">${data.message}</p>`;
    }

    resultsSection.classList.remove('hidden');
}

// Download blob as file
function downloadBlob(blob, filename) {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}

// Show error message
function showError(message) {
    // Simple error display - could be enhanced with a proper modal/toast
    alert('Error: ' + message);
}

// Format file size
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Utility function to show/hide elements
function toggleElement(elementId, show) {
    const element = document.getElementById(elementId);
    if (show) {
        element.classList.remove('hidden');
    } else {
        element.classList.add('hidden');
    }
}