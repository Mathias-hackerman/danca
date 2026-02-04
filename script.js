const displayContainer = document.getElementById('content-display');
const randomBtn = document.getElementById('random-btn');

// Google Apps Script URL
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwWyN2-YZqwIpffvi4UpXca6Bru3ZJa0ZcwenmhCYfz3nfA0FkazzBVZiP50BE2Avsv/exec';

let files = [];

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

    // Randomly select content
    const randomIndex = Math.floor(Math.random() * files.length);
    const item = files[randomIndex];

    console.log("Playing:", item.name, item.mimeType);
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
    else if (mime.startsWith('video/')) {
        element = document.createElement('video');
        element.controls = true;
        element.autoplay = true;
        element.src = `https://drive.google.com/uc?export=download&id=${item.id}`;
    }
    else if (mime.startsWith('audio/')) {
        element = document.createElement('audio');
        element.controls = true;
        element.autoplay = true;
        element.src = `https://drive.google.com/uc?export=download&id=${item.id}`;
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
