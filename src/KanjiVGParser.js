export class KanjiVGParser {
    /**
     * Parse a KanjiVG SVG string and return an array of stroke paths.
     * @param {string} svgContent - The raw XML content of the SVG file
     * @returns {string[]} Array of path data strings (d attributes) ordered by stroke index
     */
    static parse(svgContent) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(svgContent, "image/svg+xml");

        // KanjiVG stores strokes as paths with ids like "kvg:XXXXX-s1", "kvg:XXXXX-s2", etc.
        // We can find all paths that look like stroke paths.
        // However, sometimes paths are nested in groups.
        // A reliable way is to query all paths and sort them by their id number.

        const paths = Array.from(doc.querySelectorAll('path[id*="-s"]'));

        // Sort by the stroke number at the end of the id (e.g. "kvg:04e8c-s1" -> 1)
        paths.sort((a, b) => {
            const getNum = (el) => {
                const match = el.id.match(/-s(\d+)$/);
                return match ? parseInt(match[1], 10) : 999;
            };
            return getNum(a) - getNum(b);
        });

        return paths.map(p => p.getAttribute('d'));
    }

    // Default base URL for KanjiVG files (can be local or remote)
    static baseUrl = "kanjivg/kanji/";

    /**
     * Convert a character to its unicode hex string (lowercase, 5 chars usually).
     * @param {string} char 
     * @returns {string} e.g. "6c49"
     */
    static getHex(char) {
        if (typeof char !== 'string' || char.length === 0) {
            throw new Error('Invalid character: must be a non-empty string');
        }

        let code = char.codePointAt(0).toString(16).toLowerCase();
        while (code.length < 5) code = "0" + code;
        return code;
    }

    /**
     * Fetch standard KanjiVG data for a given character using the configured baseUrl.
     * @param {string} char - A single kanji character (e.g. "漢") or directly the hex code.
     */
    static async fetchData(char) {
        if (!char || typeof char !== 'string') {
            throw new Error('Invalid character: must be a non-empty string');
        }

        let hex = char;
        // If it looks like a single character (including surrogate pairs), convert to hex
        if (Array.from(char).length === 1) {
            hex = this.getHex(char);
        }

        // Validate hex format (basic check)
        if (!/^[0-9a-f]{5}$/i.test(hex)) {
            // If not valid hex, might be a character - try converting
            if (char.length === 1) {
                hex = this.getHex(char);
            } else {
                throw new Error(`Invalid kanji hex code: ${hex}`);
            }
        }

        const url = `${this.baseUrl}${hex}.svg`;
        return this.fetchAndParse(url);
    }

    /**
     * Fetch a KanjiVG file from a URL/Path and parse it.
     * @param {string} url - URL to the .svg file
     */
    static async fetchAndParse(url) {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed to fetch kanji: ${response.statusText}`);
        const text = await response.text();
        return this.parse(text);
    }
}
