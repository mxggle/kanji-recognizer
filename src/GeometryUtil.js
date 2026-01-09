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
     * Compare two strokes. Returns a score (lower is better, 0 is perfect).
     * Checks shape and direction.
     * @param {Array} userPoints - User's drawn points
     * @param {Array} targetPoints - Target stroke points
     * @param {number} startDistThreshold - Maximum allowed start point distance (default: 40)
     */
    static compareStrokes(userPoints, targetPoints, startDistThreshold = 40) {
        const resampledUser = this.resample(userPoints);
        const resampledTarget = this.resample(targetPoints);

        // 1. Direction Check: Check if start and end points match roughly
        const startDist = this.distance(resampledUser[0], resampledTarget[0]);
        const endDist = this.distance(resampledUser[resampledUser.length - 1], resampledTarget[resampledTarget.length - 1]);

        // If start is far from start, it's definitely wrong (or drawn backwards)
        // We penalize this heavily.
        if (startDist > startDistThreshold) return Infinity; // Way off

        // 2. Shape Check: Average distance between points
        let totalDist = 0;
        for (let i = 0; i < resampledUser.length; i++) {
            totalDist += this.distance(resampledUser[i], resampledTarget[i]);
        }
        const avgDist = totalDist / resampledUser.length;

        return avgDist;
    }
}
