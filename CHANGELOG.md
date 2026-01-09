# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-01-09

### Added
- Initial release of kanji-recognizer library
- KanjiWriter class for interactive kanji writing
- StrokeRecognizer with geometric resampling algorithm
- KanjiVGParser for parsing KanjiVG SVG data
- GeometryUtil for stroke comparison utilities
- Configurable recognition thresholds
- Event-based callback system
- Interactive demo application
- Comprehensive documentation

### Features
- Stroke-by-stroke validation with correct order enforcement
- Real-time visual feedback (correct/incorrect highlighting)
- Animated hints and demonstrations
- Customizable colors, animations, and behavior
- Ghost stroke guides
- Background grid with guide lines
- Touch and mouse support
- Error handling and validation

### Fixed
- Memory leak prevention with proper cleanup (destroy method)
- DOM path attachment for reliable SVG measurements
- Input validation to prevent crashes
- Cross-browser compatibility (especially Safari iOS)
- Error handling in animation methods

### Technical Details
- Zero dependencies
- ES6 modules
- ~8KB minified
- Touch-optimized
- Works in all modern browsers

## [Unreleased]

### Planned
- TypeScript definitions
- React component wrapper
- Vue component wrapper
- Performance optimizations
- Unit test suite
- Visual regression tests
- Bundled common kanji data
- Service Worker for offline support

---

## Version Guidelines

- **Major** (X.0.0): Breaking changes
- **Minor** (0.X.0): New features, backwards compatible
- **Patch** (0.0.X): Bug fixes, backwards compatible

## Links

- [GitHub Repository](https://github.com/mxggle/kanji-recognizer)
- [npm Package](https://www.npmjs.com/package/kanji-recognizer)
- [Issue Tracker](https://github.com/mxggle/kanji-recognizer/issues)
