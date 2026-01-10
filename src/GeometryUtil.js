export class GeometryUtil {
    /**
     * Calculate distance between two points
     */
    static distance(p1, p2) {
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    /**
     * Get total length of a path of points
     */
    static getPathLength(points) {
        let len = 0;
        for (let i = 1; i < points.length; i++) {
            len += this.distance(points[i - 1], points[i]);
        }
        return len;
    }

    /**
     * Resample points to a fixed number of equidistant points
     */
    static resample(points, numPoints = 64) {
        if (points.length <= 1) return points;

        const pathLen = this.getPathLength(points);
        const step = pathLen / (numPoints - 1);

        const newPoints = [points[0]];
        let currentLen = 0;
        let nextStep = step;

        for (let i = 1; i < points.length; i++) {
            let p1 = points[i - 1];
            let p2 = points[i];
            let dist = this.distance(p1, p2);

            while (currentLen + dist >= nextStep) {
                let t = (nextStep - currentLen) / dist;
                let newX = p1.x + (p2.x - p1.x) * t;
                let newY = p1.y + (p2.y - p1.y) * t;
                newPoints.push({ x: newX, y: newY });
                nextStep += step;

                // Safety break if floating point issues cause infinite loop
                if (newPoints.length >= numPoints) break;
            }
            currentLen += dist;
        }

        while (newPoints.length < numPoints) {
            newPoints.push(points[points.length - 1]);
        }

        return newPoints;
    }

    /**
     * Get the centroid (center of mass) of a set of points
     */
    static getCentroid(points) {
        if (!points || points.length === 0) return { x: 0, y: 0 };
        let sumX = 0;
        let sumY = 0;
        for (const p of points) {
            sumX += p.x;
            sumY += p.y;
        }
        return { x: sumX / points.length, y: sumY / points.length };
    }

    /**
     * Compare two strokes. Returns a score (lower is better, 0 is perfect).
     * Now includes translation normalization to be more robust.
     * @param {Array} userPoints - User's drawn points
     * @param {Array} targetPoints - Target stroke points
     * @param {Object} options - Thresholds and weights
     */
    static compareStrokes(userPoints, targetPoints, options = {}) {
        const {
            startDistThreshold = 50,
            translationWeight = 0.3, // How much absolute position matters (0-1)
            shapeWeight = 0.7        // How much shape accuracy matters (0-1)
        } = options;

        const resampledUser = this.resample(userPoints);
        const resampledTarget = this.resample(targetPoints);

        // 1. Initial Position Check
        // We still want the stroke to start *somewhere* near the expected start
        const startDist = this.distance(resampledUser[0], resampledTarget[0]);
        if (startDist > startDistThreshold) return Infinity;

        // 2. Alignment (Translation Normalization)
        // Calculate centroids
        const userCentroid = this.getCentroid(resampledUser);
        const targetCentroid = this.getCentroid(resampledTarget);

        // Calculate translation cost (distance between centroids)
        const translationCost = this.distance(userCentroid, targetCentroid);

        // 3. Shape Check (Aligned average distance)
        let shapeDist = 0;
        const dx = targetCentroid.x - userCentroid.x;
        const dy = targetCentroid.y - userCentroid.y;

        for (let i = 0; i < resampledUser.length; i++) {
            // Compare user point (shifted to target space) vs target point
            const shiftedUserPoint = {
                x: resampledUser[i].x + dx,
                y: resampledUser[i].y + dy
            };
            shapeDist += this.distance(shiftedUserPoint, resampledTarget[i]);
        }
        const shapeCost = shapeDist / resampledUser.length;

        // 4. Combined weighted score
        // This is more robust because if you draw the right shape slightly shifted,
        // the shapeCost will be low, and translationCost will be moderate,
        // allowing it to pass even if the absolute coordinates are off.
        const totalScore = (shapeCost * shapeWeight) + (translationCost * translationWeight);

        console.log(`Recognition Debug - Shape: ${shapeCost.toFixed(2)}, Trans: ${translationCost.toFixed(2)}, Total: ${totalScore.toFixed(2)}`);

        return totalScore;
    }
}
