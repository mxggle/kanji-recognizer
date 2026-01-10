# Kanji Recognizer

A lightweight, dependency-free JavaScript library for Kanji stroke order recognition and validation using KanjiVG data.

[![npm version](https://img.shields.io/npm/v/kanji-recognizer.svg)](https://www.npmjs.com/package/kanji-recognizer)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

## ✨ Features

- **🎯 Accurate Recognition** - Uses geometric resampling algorithm with centroid-based alignment for robust recognition
- **📝 Multiple Modes** - Supports Stroke-by-Stroke validation, Full Kanji check, and Free Write
- **🖼️ Image Export** - Export your drawings as PNG images for AI analysis or saving
- **🎨 Fully Customizable** - Easy to style colors, animations, and recognition sensitivity
- **⚡ Lightweight** - Zero dependencies, pure SVG-based rendering
- **📱 Mobile-Friendly** - Touch-optimized with pointer events
- **🌐 Browser Compatible** - Works in Chrome, Firefox, Safari, and Edge

## 📦 Installation

```bash
npm install kanji-recognizer
```

Or use directly in browser:

```html
<script type="module">
  import { KanjiWriter, KanjiVGParser } from './kanji-recognizer/src/index.js';
</script>
```

## 🚀 Quick Start

```javascript
import { KanjiWriter, KanjiVGParser } from 'kanji-recognizer';

// 1. Fetch kanji data from KanjiVG
const kanjiData = await KanjiVGParser.fetchData('日');

// 2. Create a writer instance
const writer = new KanjiWriter('container-id', kanjiData, {
    width: 300,
    height: 300
});

// 3. Listen for events
writer.onCorrect = () => console.log("Correct stroke!");
writer.onComplete = () => console.log("Kanji complete!");
```

## 📖 API Reference

### KanjiWriter

Creates an interactive kanji writing canvas.

```javascript
const writer = new KanjiWriter(elementId, kanjiData, options);
```

#### Parameters

- **elementId** `string` - DOM element ID to mount the canvas
- **kanjiData** `string[]` - Array of SVG path strings from KanjiVG
- **options** `object` - Configuration options (optional)

#### Options

```javascript
{
  // Dimensions
  width: 300,                    // Canvas width in pixels
  height: 300,                   // Canvas height in pixels
  
  // Colors
  strokeColor: '#333',           // Main stroke color
  correctColor: '#4CAF50',       // Success feedback color
  incorrectColor: '#F44336',     // Error feedback color
  hintColor: 'cyan',             // Hint animation color
  gridColor: '#ddd',             // Background grid color
  ghostColor: '#ff0000',         // Next stroke guide color
  
  // Appearance
  strokeWidth: 4,                // Width of drawn strokes
  gridWidth: 0.5,                // Grid line width
  ghostOpacity: '0.1',           // Ghost guide opacity
  
  // Behavior
  showGhost: true,               // Show red guide for next stroke
  showGrid: true,                // Show background grid
  checkMode: 'stroke',           // 'stroke' (immediate), 'full' (manual), or 'free' (no validation)
  
  // Recognition (Adjustable!)
  passThreshold: 15,             // Lower = stricter (10-20 recommended)
  startDistThreshold: 40,        // Start point tolerance in pixels
  lengthRatioMin: 0.5,           // Minimum stroke length ratio
  lengthRatioMax: 1.5,           // Maximum stroke length ratio
  
  // Animations
  stepDuration: 500,             // Animation speed in ms
  hintDuration: 800,             // Hint display duration
  snapDuration: 200              // Snap-to-correct duration
}
```

#### Methods

##### `clear()`
Reset the canvas and start over.

```javascript
writer.clear();
```

##### `hint()`
Show animated hint for the next expected stroke.

```javascript
writer.hint();
```

##### `animate()`
Animate the complete kanji stroke-by-stroke.

```javascript
await writer.animate();
```

##### `setOptions(newOptions)`
Update configuration options dynamically.

```javascript
writer.setOptions({ 
  strokeColor: '#000',
  passThreshold: 20  // Make recognition more lenient
});
```

##### `destroy()`
Clean up resources and remove event listeners.

```javascript
writer.destroy();
```

##### `exportImage(options)`
Export the current drawing as a base64 PNG image.

```javascript
const dataUrl = await writer.exportImage({
  includeGrid: false,
  backgroundColor: '#ffffff'
});
// Send dataUrl to AI or save it
```

##### `check()`
Manually trigger evaluation of all collected strokes (only for `checkMode: 'full'`).

```javascript
const result = writer.check();
if (result.success) console.log("All strokes correct!");
```

#### Event Callbacks

```javascript
writer.onCorrect = () => { /* Fired on correct stroke */ };
writer.onIncorrect = () => { /* Fired on incorrect stroke */ };
writer.onComplete = () => { /* Fired when kanji is complete */ };
writer.onClear = () => { /* Fired when canvas is cleared */ };

// Error handling
writer.container.addEventListener('kanji:error', (e) => {
  console.error('Error:', e.detail);
});
```

### KanjiVGParser

Utilities for fetching and parsing KanjiVG SVG data.

#### `KanjiVGParser.fetchData(char)`

Fetch kanji stroke data by character.

```javascript
const strokes = await KanjiVGParser.fetchData('日');
// Returns: ['M25,32...', 'M12,80...']
```

#### `KanjiVGParser.parse(svgContent)`

Parse raw KanjiVG SVG into stroke paths.

```javascript
const strokes = KanjiVGParser.parse(svgString);
```

#### `KanjiVGParser.baseUrl`

Set custom base URL for KanjiVG files.

```javascript
KanjiVGParser.baseUrl = 'https://example.com/kanjivg/';
```

## 💡 Usage Examples

### Basic Kanji Practice

```javascript
import { KanjiWriter, KanjiVGParser } from 'kanji-recognizer';

// Load kanji
const kanjiData = await KanjiVGParser.fetchData('愛');

// Create writer
const writer = new KanjiWriter('practice-area', kanjiData);

// Add event listeners
writer.onCorrect = () => {
  document.getElementById('feedback').textContent = '正解！';
};

writer.onComplete = () => {
  document.getElementById('feedback').textContent = '完成！';
  confetti(); // Celebrate!
};
```

### Beginner Mode (Lenient Recognition)

```javascript
const writer = new KanjiWriter('container', kanjiData, {
  passThreshold: 20,        // More forgiving
  startDistThreshold: 50,   // Allow imprecise starts
  showGhost: true,          // Show guides
  hintColor: '#00ff00'      // Bright hints
});
```

### Expert Mode (Strict Recognition)

```javascript
const writer = new KanjiWriter('container', kanjiData, {
  passThreshold: 8,         // Very strict
  startDistThreshold: 25,   // Precise starts required
  showGhost: false,         // No guides
  strokeColor: '#000'       // Professional look
});
```

### Custom Styling

```javascript
const writer = new KanjiWriter('container', kanjiData, {
  width: 500,
  height: 500,
  strokeColor: '#2c3e50',
  correctColor: '#27ae60',
  incorrectColor: '#e74c3c',
  gridColor: '#ecf0f1',
  strokeWidth: 6
});
```

### Multiple Kanji Practice

```javascript
const kanjis = ['日', '月', '火', '水', '木', '金', '土'];
let currentIndex = 0;

async function nextKanji() {
  if (writer) writer.destroy(); // Clean up previous
  
  const data = await KanjiVGParser.fetchData(kanjis[currentIndex]);
  writer = new KanjiWriter('container', data);
  
  writer.onComplete = () => {
    currentIndex++;
    if (currentIndex < kanjis.length) {
      setTimeout(nextKanji, 1000);
    }
  };
}

nextKanji();
```

## 🎨 Demo

Check out the included demo:

```bash
cd kanji-recognizer
python3 -m http.server 8000
# Open http://localhost:8000/demo/index.html
```

## 🔧 Requirements

- Modern browser with ES6 module support
- KanjiVG SVG files (not included in npm package)

### Getting KanjiVG Data

Download from [KanjiVG Project](https://github.com/KanjiVG/kanjivg):

```bash
git clone https://github.com/KanjiVG/kanjivg.git
```

Or use a CDN:

```javascript
KanjiVGParser.baseUrl = 'https://cdn.example.com/kanjivg/';
```

## 🌐 Browser Support

- Chrome/Edge: ✅ Latest
- Firefox: ✅ Latest
- Safari: ✅ 14+
- Safari iOS: ✅ 14+
- Chrome Mobile: ✅ Latest

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

See [docs/README_REVIEW.md](docs/README_REVIEW.md) for development documentation.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [KanjiVG](https://kanjivg.tagaini.net/) - Kanji stroke order data
- Inspired by Japanese language learning tools

## 📚 Related Projects

- [KanjiVG](https://github.com/KanjiVG/kanjivg) - Kanji stroke order graphics
- [kanji-data](https://github.com/davidluzgouveia/kanji-data) - Comprehensive kanji dataset

## 🐛 Known Issues

- None currently! Report issues on [GitHub](https://github.com/mxggle/kanji-recognizer/issues)

## 📈 Roadmap

- [ ] TypeScript definitions
- [ ] React component wrapper
- [ ] Vue component wrapper
- [ ] Bundled common kanji data
- [ ] Offline support with Service Worker
- [ ] Haptic feedback for mobile
- [ ] Audio pronunciation integration

## 💬 Support

- 🐛 Issues: [GitHub Issues](https://github.com/mxggle/kanji-recognizer/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/mxggle/kanji-recognizer/discussions)

---

**Made with ❤️ for Japanese learners worldwide**
