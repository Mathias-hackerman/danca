const displayContainer = document.getElementById('content-display');
const randomBtn = document.getElementById('random-btn');

// Google Apps Script URL
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwWyN2-YZqwIpffvi4UpXca6Bru3ZJa0ZcwenmhCYfz3nfA0FkazzBVZiP50BE2Avsv/exec';

let files = [];
let playedHistory = [];

// Fetch the file list when the page loads
async function fetchFiles() {
    if (APPS_SCRIPT_URL === 'PLACEHOLDER_URL_FROM_USER') {
        console.warn("API URL not set.");
        return;
    }

    try {
        randomBtn.textContent = "Carregando...";
        randomBtn.disabled = true;

        const response = await fetch(APPS_SCRIPT_URL);
        const data = await response.json();

        // Filter out trash or folders if necessary, usually GAS returns valid files
        files = data;

        console.log("Loaded " + files.length + " files.");
        randomBtn.textContent = "Reproduzir Aleatório";
        randomBtn.disabled = false;
    } catch (error) {
        console.error("Error fetching files:", error);
        randomBtn.textContent = "Erro ao carregar";
        displayContainer.innerHTML = `<div class='placeholder-text' style='color:red'>Erro ao carregar lista de arquivos.<br>Verifique o console.</div>`;
    }
}

// Initial fetch
fetchFiles();

randomBtn.addEventListener('click', () => {
    if (files.length === 0) {
        alert("Nenhum arquivo carregado ainda ou lista vazia.");
        return;
    }

    // Calculate max history size (50% of total files)
    const maxHistorySize = Math.max(1, Math.floor(files.length / 2));

    // Filter out files that are currently in the history
    const availableFiles = files.filter(file => !playedHistory.includes(file.id));

    // Fallback: This should theoretically not happen if logic is correct, 
    // but if available is empty, reset history to avoid crash
    let pool = availableFiles.length > 0 ? availableFiles : files;
    if (availableFiles.length === 0) {
        playedHistory = [];
        pool = files;
    }

    // Randomly select content from the available pool
    const randomIndex = Math.floor(Math.random() * pool.length);
    const item = pool[randomIndex];

    // Add to history
    playedHistory.push(item.id);
    // Keep history within size limit
    if (playedHistory.length > maxHistorySize) {
        playedHistory.shift(); // Remove oldest
    }

    console.log(`Playing: ${item.name} | History: ${playedHistory.length}/${maxHistorySize}`);
    renderContent(item);
});

function renderContent(item) {
    displayContainer.innerHTML = ''; // Clear previous content
    let element;

    const mime = item.mimeType;

    // Determine type based on MIME
    if (mime.startsWith('image/')) {
        element = document.createElement('img');
        element.src = `https://drive.google.com/thumbnail?id=${item.id}&sz=w2048`;
        element.alt = item.name;
    }
    else if (mime.startsWith('video/') || mime.startsWith('audio/')) {
        // Use Google Drive Preview Iframe for reliable playback
        element = document.createElement('iframe');
        element.src = `https://drive.google.com/file/d/${item.id}/preview`;
        element.allow = "autoplay; fullscreen";
    }
    else {
        // Fallback for PDF, Text, Docs, etc. -> Iframe Preview
        element = document.createElement('iframe');
        element.src = `https://drive.google.com/file/d/${item.id}/preview`;
        element.allow = "autoplay";
    }

    if (element) {
        displayContainer.appendChild(element);
    }
}
