import { StrokeRecognizer } from './StrokeRecognizer.js';

export class KanjiWriter {
    constructor(elementId, kanjiData, options = {}) {
        this.container = document.getElementById(elementId);
        this.kanjiData = kanjiData; // Expects array of path strings
        this.options = {
            width: 109,
            height: 109,
            // Colors
            strokeColor: "#333",          // Main stroke color
            correctColor: "#4CAF50",      // Green flash on success
            incorrectColor: "#F44336",    // Red stroke on error
            hintColor: "cyan",            // Hint animation color
            gridColor: "#ddd",            // Background grid color
            ghostColor: "#ff0000",        // Color of next stroke ghost

            // Toggles
            showGhost: true,              // Show red guide for next stroke
            showGrid: true,               // Show the background grid

            // Appearance
            strokeWidth: 4,
            gridWidth: 0.5,
            ghostOpacity: "0.1",

            // Animations
            stepDuration: 500,
            hintDuration: 800,
            snapDuration: 200,

            ...options
        };

        // Initialize recognizer with threshold options
        this.recognizer = new StrokeRecognizer({
            passThreshold: this.options.passThreshold || 15,
            startDistThreshold: this.options.startDistThreshold || 40,
            lengthRatioMin: this.options.lengthRatioMin || 0.5,
            lengthRatioMax: this.options.lengthRatioMax || 1.5,
            resamplingPoints: this.options.resamplingPoints || 64
        });

        this.currentStrokeIndex = 0;
        this.isDrawing = false;
        this.currentPoints = [];

        // Use options.width/height in initSVG
        this.width = this.options.width;
        this.height = this.options.height;

        console.log("Kanji data loaded:", kanjiData);

        this.initSVG();
        this.attachEvents();
        this.drawGrid();
        this.renderUpcomingStrokes(); // Show ghosts or just hint
    }

    initSVG() {
        this.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        // KanjiVG uses a standard 109x109 viewBox coordinate system
        // We keep this fixed regardless of container size for correct rendering
        this.svg.setAttribute("viewBox", "0 0 109 109");
        this.svg.style.width = "100%";
        this.svg.style.height = "100%";
        this.svg.style.border = "1px solid #ccc";
        this.svg.style.touchAction = "none"; // Prevent scrolling
        this.svg.style.background = "#fff";

        // Groups
        this.gridGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
        this.bgGroup = document.createElementNS("http://www.w3.org/2000/svg", "g"); // For background/ghost characters
        this.drawnGroup = document.createElementNS("http://www.w3.org/2000/svg", "g"); // Completed correct strokes
        this.currentGroup = document.createElementNS("http://www.w3.org/2000/svg", "g"); // Current active stroke

        this.svg.appendChild(this.gridGroup);
        this.svg.appendChild(this.bgGroup);
        this.svg.appendChild(this.drawnGroup);
        this.svg.appendChild(this.currentGroup);

        this.container.appendChild(this.svg);
    }

    drawGrid() {
        if (!this.options.showGrid) return;

        const opts = { stroke: this.options.gridColor, "stroke-width": this.options.gridWidth, "stroke-dasharray": "3,3" };
        // Use KanjiVG's 109x109 coordinate system
        const size = 109;
        // Diagonal lines
        this.addLine(0, 0, size, size, this.gridGroup, opts);
        this.addLine(size, 0, 0, size, this.gridGroup, opts);
        // Center lines
        this.addLine(size / 2, 0, size / 2, size, this.gridGroup, opts);
        this.addLine(0, size / 2, size, size / 2, this.gridGroup, opts);
    }

    addLine(x1, y1, x2, y2, parent, attrs = {}) {
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", x1);
        line.setAttribute("y1", y1);
        line.setAttribute("x2", x2);
        line.setAttribute("y2", y2);
        for (const [k, v] of Object.entries(attrs)) {
            line.setAttribute(k, v);
        }
        parent.appendChild(line);
    }

    renderUpcomingStrokes() {
        // Optional: render faint outline of the next stroke
        this.bgGroup.innerHTML = '';

        if (!this.options.showGhost) return;

        // If we want to show the full ghost:
        this.kanjiData.forEach((d, i) => {
            const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
            path.setAttribute("d", d);
            path.setAttribute("fill", "none");
            path.setAttribute("stroke", i === this.currentStrokeIndex ? this.options.ghostColor : "#eee");
            path.setAttribute("stroke-width", "2");
            path.style.opacity = i === this.currentStrokeIndex ? this.options.ghostOpacity : "0.1";
            this.bgGroup.appendChild(path);
        });
    }

    getPointerPos(e) {
        const pt = this.svg.createSVGPoint();
        pt.x = e.clientX;
        pt.y = e.clientY;
        return pt.matrixTransform(this.svg.getScreenCTM().inverse());
    }

    attachEvents() {
        // Store bound functions as instance properties for cleanup
        this.boundStart = (e) => {
            if (this.currentStrokeIndex >= this.kanjiData.length) return; // Finished
            e.preventDefault();
            this.isDrawing = true;
            this.currentPoints = [];
            const pos = this.getPointerPos(e);
            this.currentPoints.push(pos);

            // Start visual path
            this.currentPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
            this.currentPath.setAttribute("fill", "none");
            this.currentPath.setAttribute("stroke", this.options.strokeColor);
            this.currentPath.setAttribute("stroke-width", this.options.strokeWidth);
            this.currentPath.setAttribute("stroke-linecap", "round");
            this.currentPath.setAttribute("stroke-linejoin", "round");
            this.currentPath.setAttribute("d", `M ${pos.x} ${pos.y}`);
            this.currentGroup.appendChild(this.currentPath);
        };

        this.boundMove = (e) => {
            if (!this.isDrawing) return;
            e.preventDefault();
            const pos = this.getPointerPos(e);
            this.currentPoints.push(pos);

            // Update visual path
            const d = this.currentPath.getAttribute("d");
            this.currentPath.setAttribute("d", `${d} L ${pos.x} ${pos.y}`);
        };

        this.boundEnd = (e) => {
            if (!this.isDrawing) return;
            this.isDrawing = false;
            this.evaluateStroke();
        };

        this.svg.addEventListener('pointerdown', this.boundStart);
        this.svg.addEventListener('pointermove', this.boundMove);
        this.svg.addEventListener('pointerup', this.boundEnd);
        this.svg.addEventListener('pointerleave', this.boundEnd);
    }

    /**
     * Clean up resources and remove event listeners
     * Call this before destroying the writer instance
     * @public
     */
    destroy() {
        if (this.svg && this.boundStart) {
            this.svg.removeEventListener('pointerdown', this.boundStart);
            this.svg.removeEventListener('pointermove', this.boundMove);
            this.svg.removeEventListener('pointerup', this.boundEnd);
            this.svg.removeEventListener('pointerleave', this.boundEnd);
        }

        // Clear all content
        if (this.container) {
            this.container.innerHTML = '';
        }

        // Clear references
        this.boundStart = null;
        this.boundMove = null;
        this.boundEnd = null;
        this.svg = null;
        this.recognizer = null;
    }

    evaluateStroke() {
        const targetD = this.kanjiData[this.currentStrokeIndex];
        if (!targetD) return;

        const result = this.recognizer.evaluate(this.currentPoints, targetD);
        console.log("Evaluation result:", result);

        if (result.success) {
            this.onCorrect();
        } else {
            this.onIncorrect();
        }
    }

    async onCorrect() {
        // 1. Visual feedback on user stroke (Green)
        this.currentPath.setAttribute("stroke", this.options.correctColor);

        // 2. Fade out user stroke
        const userPath = this.currentPath;
        userPath.style.transition = "opacity 0.3s";
        userPath.style.opacity = "0";
        setTimeout(() => userPath.remove(), 300);

        // 3. Animate the perfect stroke taking its place
        const targetD = this.kanjiData[this.currentStrokeIndex];

        // We block interaction briefly for the animation
        this.isDrawing = false;

        await this.animateStroke(targetD, {
            duration: this.options.snapDuration, // Fast snap
            color: this.options.strokeColor,
            removeAfter: false,
            targetGroup: this.drawnGroup
        });

        this.currentStrokeIndex++;
        this.renderUpcomingStrokes();

        if (this.currentStrokeIndex >= this.kanjiData.length) {
            console.log("Kanji Complete!");
            if (this.onComplete) this.onComplete();
        }
    }

    onIncorrect() {
        this.currentPath.setAttribute("stroke", this.options.incorrectColor);
        // Fade out and remove
        const pathRef = this.currentPath;
        pathRef.style.transition = "opacity 0.5s";
        setTimeout(() => { pathRef.style.opacity = "0"; }, 100);
        setTimeout(() => { pathRef.remove(); }, 600);
    }

    /**
     * Public API: Clear the canvas and reset progress
     */
    clear() {
        this.currentStrokeIndex = 0;
        this.drawnGroup.innerHTML = '';
        this.currentGroup.innerHTML = '';
        this.bgGroup.innerHTML = '';
        this.renderUpcomingStrokes();
        console.log("Canvas cleared");
        if (this.onClear) this.onClear();
    }

    /**
     * Public API: Update options
     */
    setOptions(newOptions) {
        this.options = { ...this.options, ...newOptions };
        this.renderUpcomingStrokes(); // Re-render to reflect changes (e.g. ghost visibility)
        // Need to redraw grid if grid settings changed or toggled
        this.gridGroup.innerHTML = '';
        this.drawGrid();
    }

    /**
     * Public API: Briefly show the next expected stroke
     */
    hint() {
        if (this.currentStrokeIndex >= this.kanjiData.length) return;

        const d = this.kanjiData[this.currentStrokeIndex];
        if (!d) return;

        this.animateStroke(d, {
            duration: this.options.hintDuration,
            color: this.options.hintColor,
            strokeOpacity: "0.5",
            removeAfter: true,
            targetGroup: this.bgGroup
        });
    }

    /**
     * Public API: Animate the correct strokes
     */
    async animate() {
        this.clear(); // Start fresh

        // Disable interaction during animation
        const originalPointerEvents = this.svg.style.pointerEvents;
        this.svg.style.pointerEvents = "none";

        for (let i = 0; i < this.kanjiData.length; i++) {
            await this.animateStroke(this.kanjiData[i], {
                duration: this.options.stepDuration,
                color: this.options.strokeColor,
                removeAfter: false,
                targetGroup: this.drawnGroup
            });
        }

        // Re-enable interaction
        this.svg.style.pointerEvents = originalPointerEvents;
        this.currentStrokeIndex = this.kanjiData.length; // Mark as done
        if (this.onComplete) this.onComplete();
    }

    animateStroke(d, options = {}) {
        const {
            duration = 500,
            color = "#333",
            removeAfter = true,
            strokeWidth = 4,
            strokeOpacity = "1",
            targetGroup = this.currentGroup
        } = options;

        return new Promise((resolve, reject) => {
            try {
                // Validate path data
                if (!d || typeof d !== 'string') {
                    throw new Error('Invalid path data: must be a non-empty string');
                }

                const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
                path.setAttribute("d", d);
                path.setAttribute("fill", "none");
                path.setAttribute("stroke", color);
                path.setAttribute("stroke-width", strokeWidth);
                path.setAttribute("stroke-opacity", strokeOpacity);
                path.setAttribute("stroke-linecap", "round");
                path.setAttribute("stroke-linejoin", "round");

                targetGroup.appendChild(path);

                const length = path.getTotalLength();

                // Validate length
                if (!length || length === 0 || isNaN(length)) {
                    path.remove();
                    throw new Error('Invalid path: unable to calculate length');
                }

                path.style.strokeDasharray = length;
                path.style.strokeDashoffset = length; // Hidden initially

                // Trigger reflow
                path.getBoundingClientRect();

                path.style.transition = `stroke-dashoffset ${duration}ms ease-in-out`;
                path.style.strokeDashoffset = "0"; // Show

                setTimeout(() => {
                    if (removeAfter) {
                        path.remove();
                    }
                    resolve(path);
                }, duration + 50);

            } catch (error) {
                console.error('Animation error:', error);
                // Dispatch error event for UI handling
                if (this.container) {
                    this.container.dispatchEvent(
                        new CustomEvent('kanji:error', { detail: error })
                    );
                }
                reject(error);
            }
        });
    }
}
