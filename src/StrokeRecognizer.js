import { GeometryUtil } from './GeometryUtil.js';

export class StrokeRecognizer {
    constructor(options = {}) {
        // Configuration options
        this.options = {
            passThreshold: 15,           // Average pixel deviation allowed for success
            startDistThreshold: 40,      // Max pixels start point can be off
            lengthRatioMin: 0.5,         // Minimum length ratio (user/target)
            lengthRatioMax: 1.5,         // Maximum length ratio (user/target)
            resamplingPoints: 64,        // Number of points to resample to
            ...options
        };

        // Create or reuse hidden SVG container (singleton pattern)
        if (!StrokeRecognizer.hiddenSVG) {
            const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            svg.style.position = 'absolute';
            svg.style.visibility = 'hidden';
            svg.style.width = '0';
            svg.style.height = '0';
            svg.setAttribute('aria-hidden', 'true');
            document.body.appendChild(svg);
            StrokeRecognizer.hiddenSVG = svg;
        }

        // Create measurement path and attach to DOM for reliable calculations
        this.measurePath = document.createElementNS("http://www.w3.org/2000/svg", "path");
        StrokeRecognizer.hiddenSVG.appendChild(this.measurePath);
    }

    /**
     * Convert an SVG path data string (d attribute) into an array of points.
     */
    getPathPoints(dString, numPoints = null) {
        // Use configured resampling points if not specified
        const pointCount = numPoints !== null ? numPoints : this.options.resamplingPoints;

        this.measurePath.setAttribute('d', dString);
        const totalLength = this.measurePath.getTotalLength();
        const points = [];

        for (let i = 0; i < pointCount; i++) {
            const point = this.measurePath.getPointAtLength((i / (pointCount - 1)) * totalLength);
            points.push({ x: point.x, y: point.y });
        }
        return points;
    }

    /**
     * Evaluate a user's stroke against the target kanji data.
     * @param {Array<{x, y}>} userMsgPoints - Raw points from mouse/touch
     * @param {string} targetD - The SVG path data of the *expected* next stroke
     */
    evaluate(userPoints, targetD) {
        if (!userPoints || userPoints.length < 2) {
            return { success: false, score: Infinity, message: "Too short" };
        }

        const targetPoints = this.getPathPoints(targetD);

        // Check basic length ratio to prevent tiny ticks passing for long lines
        const userLen = GeometryUtil.getPathLength(userPoints);
        const targetLen = GeometryUtil.getPathLength(targetPoints);
        const ratio = userLen / targetLen;

        if (ratio < this.options.lengthRatioMin || ratio > this.options.lengthRatioMax) {
            return { success: false, score: 100, message: "Length mismatch" };
        }

        const score = GeometryUtil.compareStrokes(userPoints, targetPoints, this.options.startDistThreshold);

        return {
            success: score < this.options.passThreshold,
            score: score,
            message: score < this.options.passThreshold ? "Good!" : "Try again"
        };
    }
}
