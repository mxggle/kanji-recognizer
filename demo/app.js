import { KanjiWriter, KanjiVGParser } from '../src/index.js';

const statusEl = document.getElementById('status-text');
const inputEl = document.getElementById('kanji-input');
const loadBtn = document.getElementById('load-btn');
const instructionsEl = document.getElementById('instructions');
const containerEl = document.getElementById('writer-container');

// Control Buttons
const hintBtn = document.getElementById('hint-btn');
const animateBtn = document.getElementById('animate-btn');
const clearBtn = document.getElementById('clear-btn');
const checkBtn = document.getElementById('check-btn');
const exportBtn = document.getElementById('export-btn');

const exportModal = document.getElementById('export-modal');
const exportPreview = document.getElementById('export-preview');
const closeModal = document.getElementById('close-modal');

// Settings Inputs
const checkModeSelect = document.getElementById('check-mode');
const strokeColorInput = document.getElementById('stroke-color');
const correctColorInput = document.getElementById('correct-color');
const incorrectColorInput = document.getElementById('incorrect-color');
const hintColorInput = document.getElementById('hint-color');
const ghostColorInput = document.getElementById('ghost-color');
const gridColorInput = document.getElementById('grid-color');
const ghostToggle = document.getElementById('ghost-toggle');
const gridToggle = document.getElementById('grid-toggle');
const speedInput = document.getElementById('speed-input');

let writer = null;

function getOptions() {
    return {
        width: 300,
        height: 300,
        strokeColor: strokeColorInput.value,
        correctColor: correctColorInput.value,
        incorrectColor: incorrectColorInput.value,
        hintColor: hintColorInput.value,
        ghostColor: ghostColorInput.value,
        gridColor: gridColorInput.value,
        showGhost: ghostToggle.checked,
        showGrid: gridToggle.checked,
        checkMode: checkModeSelect.value,
        stepDuration: parseInt(speedInput.value, 10) || 500
    };
}

async function loadKanji(char) {
    if (!char) return;

    statusEl.textContent = "Loading...";
    statusEl.style.color = "#666";

    // Use the parser's new helper to fetch data
    // Use absolute path to ensure we hit the server's configured route
    KanjiVGParser.baseUrl = "/kanjivg/kanji/";

    const url = KanjiVGParser.baseUrl + char.codePointAt(0).toString(16).toLowerCase().padStart(5, '0') + ".svg";
    console.log("Attempting to fetch:", url);

    try {
        const kanjiData = await KanjiVGParser.fetchData(char);

        // Clean up previous writer instance to prevent memory leaks
        if (writer) {
            writer.destroy();
        }

        // Clear container (already done by destroy, but just to be safe)
        containerEl.innerHTML = '';

        // Init new writer with current settings
        writer = new KanjiWriter('writer-container', kanjiData, getOptions());

        // Setup callbacks for UI updates
        setupCallbacks(writer);

        instructionsEl.textContent = `Practice: ${char}`;
        statusEl.textContent = "Ready!";
    } catch (e) {
        console.error(e);
        statusEl.textContent = `Error: ${e.message}`;
        statusEl.style.color = "red";

        // Add a small debug help
        const debugInfo = document.createElement('div');
        debugInfo.style.fontSize = "0.8rem";
        debugInfo.style.marginTop = "5px";
        debugInfo.textContent = `Failed URL: ${url || 'unknown'}`;
        statusEl.appendChild(debugInfo);
    }
}

function setupCallbacks(w) {
    // We wrap the internal methods to add UI status updates
    // Ideally KanjiWriter would emit events, but this works for now

    const originalOnCorrect = w.onCorrect.bind(w);
    w.onCorrect = async function () {
        await originalOnCorrect();
        statusEl.textContent = "Correct!";
        statusEl.style.color = "green";
    };

    const originalOnIncorrect = w.onIncorrect.bind(w);
    w.onIncorrect = function () {
        originalOnIncorrect();
        statusEl.textContent = "Try again.";
        statusEl.style.color = "red";
    };

    w.onComplete = function () {
        statusEl.textContent = "KANJI COMPLETE!";
        statusEl.style.color = "blue";
    };

    w.onClear = function () {
        statusEl.textContent = "Cleared.";
        statusEl.style.color = "#666";
    };

    // Handle animation errors
    w.container.addEventListener('kanji:error', (e) => {
        statusEl.textContent = `Error: ${e.detail.message}`;
        statusEl.style.color = "red";
        console.error('Kanji error:', e.detail);
    });
}

// Event Listeners
loadBtn.addEventListener('click', () => loadKanji(inputEl.value));
inputEl.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') loadKanji(inputEl.value);
});

// Control Events
hintBtn.addEventListener('click', () => {
    if (writer) writer.hint();
});

animateBtn.addEventListener('click', () => {
    if (writer) writer.animate();
});

clearBtn.addEventListener('click', () => {
    if (writer) writer.clear();
});

checkBtn.addEventListener('click', () => {
    if (writer) {
        const result = writer.check();
        if (result.success) {
            statusEl.textContent = "Correct!";
            statusEl.style.color = "green";
        } else {
            statusEl.textContent = "Some strokes are wrong. Try again.";
            statusEl.style.color = "red";
        }
    }
});

exportBtn.addEventListener('click', async () => {
    if (writer) {
        try {
            statusEl.textContent = "Exporting...";
            const dataUrl = await writer.exportImage({
                includeGrid: gridToggle.checked, // Use grid toggle setting for export too
                backgroundColor: "#ffffff"
            });
            exportPreview.src = dataUrl;
            exportModal.style.display = 'flex';
            statusEl.textContent = "Export complete!";
        } catch (e) {
            console.error("Export failed:", e);
            statusEl.textContent = "Export failed.";
            statusEl.style.color = "red";
        }
    }
});

closeModal.addEventListener('click', () => {
    exportModal.style.display = 'none';
});

// Close modal when clicking outside content
exportModal.addEventListener('click', (e) => {
    if (e.target === exportModal) {
        exportModal.style.display = 'none';
    }
});

// Settings Changes
const updateSettings = () => {
    if (writer) {
        writer.setOptions(getOptions());
        // Toggle Check button visibility
        if (checkModeSelect.value === 'full') {
            checkBtn.style.display = 'block';
        } else {
            checkBtn.style.display = 'none';
        }
    }
};

[
    strokeColorInput, correctColorInput, incorrectColorInput,
    hintColorInput, ghostColorInput, gridColorInput,
    ghostToggle, gridToggle, speedInput, checkModeSelect
].forEach(el => {
    el.addEventListener('change', () => {
        if (el === checkModeSelect && writer) {
            writer.clear();
        }
        updateSettings();
    });
    // For sliders/colors, might want 'input' event for live preview, but 'change' is safer for now
    if (el !== checkModeSelect) {
        el.addEventListener('input', updateSettings);
    }
});


// Initial load
loadKanji(inputEl.value);
