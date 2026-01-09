# Contributing to Kanji Recognizer

Thank you for your interest in contributing! This document provides guidelines for contributing to the kanji-recognizer project.

## 🤝 How to Contribute

### Reporting Bugs

1. **Check existing issues** - Search for similar issues first
2. **Create detailed report** - Include:
   - Browser and version
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable
   - Console errors

### Suggesting Features

1. Open an issue with `[Feature Request]` tag
2. Describe the use case
3. Explain why it would be valuable
4. Consider implementation approaches

### Contributing Code

#### Setup Development Environment

```bash
# Fork and clone the repository
git clone https://github.com/mxggle/kanji-recognizer.git
cd kanji-recognizer

# Install dependencies
npm install

# Run demo
npm start
# Open http://localhost:5173/demo/index.html
```

#### Development Workflow

1. **Create a branch**
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/bug-description
   ```

2. **Make your changes**
   - Follow coding style (see below)
   - Add tests if applicable
   - Update documentation

3. **Test your changes**
   ```bash
   # Test in demo
   npm start
   
   # Run tests (when available)
   npm test
   ```

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add amazing feature"
   ```

   Use conventional commits:
   - `feat:` New feature
   - `fix:` Bug fix
   - `docs:` Documentation changes
   - `style:` Code style changes (formatting)
   - `refactor:` Code refactoring
   - `test:` Adding or updating tests
   - `chore:` Maintenance tasks

5. **Push and create PR**
   ```bash
   git push origin feature/your-feature-name
   ```
   
   Then create a Pull Request on GitHub.

## 📋 Coding Standards

### JavaScript Style

- Use ES6+ features
- Use `const` by default, `let` when mutation needed
- Prefer arrow functions for callbacks
- Use template literals for strings
- Add JSDoc comments to public methods

Example:
```javascript
/**
 * Description of what this does
 * @param {string} param1 - Description
 * @param {Object} options - Configuration options
 * @returns {Promise<Array>} Description of return value
 */
async function myFunction(param1, options = {}) {
    // Implementation
}
```

### Code Organization

- Keep files focused and single-purpose
- Export only what's necessary
- Avoid circular dependencies
- Use meaningful variable names

### Error Handling

- Always validate inputs
- Use try-catch for async operations
- Provide meaningful error messages
- Dispatch error events for UI handling

### Performance

- Avoid unnecessary DOM manipulations
- Cache expensive calculations
- Use event delegation where appropriate
- Clean up resources (remove event listeners)

## 🧪 Testing

### Manual Testing

Test your changes in:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Safari iOS (if touch-related)

Test scenarios:
- Load different kanji
- Draw correct strokes
- Draw incorrect strokes
- Use all public methods
- Try edge cases

### Automated Testing

(Coming soon - we're adding Vitest)

When tests are available:
```bash
npm test                 # Run tests
npm run test:coverage    # Generate coverage report
```

## 📝 Documentation

### Code Documentation

- Add JSDoc comments to all public APIs
- Include parameter types and descriptions
- Document return values
- Add usage examples for complex features

### User Documentation

- Update README.md for new features
- Add examples to demonstrate usage
- Keep API reference up to date
- Update CHANGELOG.md

## 🔍 Pull Request Process

1. **PR Title**: Use conventional commit format
   - `feat: add stroke speed detection`
   - `fix: resolve memory leak in Safari`

2. **PR Description**: Include:
   - What changes were made
   - Why they were made
   - How to test them
   - Screenshots/GIFs if UI changes

3. **Checklist**:
   - [ ] Code follows project style
   - [ ] Tested in multiple browsers
   - [ ] Documentation updated
   - [ ] CHANGELOG.md updated
   - [ ] No console.logs or debugging code
   - [ ] Commit messages follow convention

4. **Review Process**:
   - Maintainers will review your PR
   - Address any requested changes
   - Once approved, it will be merged

## 🎯 Priority Areas

We especially welcome contributions in:

- **Testing**: Help us reach 80%+ test coverage
- **TypeScript**: Add TypeScript definitions
- **Performance**: Optimize recognition algorithms
- **Accessibility**: Improve keyboard navigation and screen reader support
- **Documentation**: Examples, tutorials, API docs
- **Mobile**: Enhance touch experience

## 💡 Tips for Contributors

### Good First Issues

Look for issues tagged `good-first-issue` - these are:
- Well-defined
- Limited scope
- Good for getting familiar with the codebase

### Communication

- Be respectful and constructive
- Ask questions if unclear
- Share your thought process
- Accept feedback gracefully

### Quality over Quantity

- One well-tested feature > many untested features
- Clear, readable code > clever, complex code
- Good documentation > no documentation

## 📜 Code of Conduct

### Our Standards

- Be welcoming and inclusive
- Respect differing viewpoints
- Give and accept constructive feedback
- Focus on what's best for the community
- Show empathy towards others

### Unacceptable Behavior

- Harassment or discriminatory language
- Trolling or insulting comments
- Personal or political attacks
- Publishing others' private information

## 🏗️ Architecture Overview

```
kanji-recognizer/
├── src/
│   ├── index.js           # Main exports
│   ├── KanjiWriter.js     # Interactive canvas component
│   ├── StrokeRecognizer.js # Recognition algorithm
│   ├── GeometryUtil.js    # Math utilities
│   └── KanjiVGParser.js   # SVG parsing
├── demo/                  # Demo application
├── docs/                  # Additional documentation
└── tests/                 # Test files (coming soon)
```

### Key Components

- **KanjiWriter**: Main UI component, handles SVG rendering and user interaction
- **StrokeRecognizer**: Core recognition logic using geometric resampling
- **GeometryUtil**: Mathematical functions for stroke comparison
- **KanjiVGParser**: Parses KanjiVG SVG files into usable path data

## 🔧 Development Tools

### Recommended VSCode Extensions

- ESLint
- Prettier
- Live Server
- GitLens

### Useful Commands

```bash
npm start         # Start dev server
npm run build     # Build for production
npm run dev       # Alias for start
```

## 📞 Questions?

- Open an issue with the `question` label
- Join discussions on GitHub Discussions

## 🙏 Recognition

Contributors will be:
- Listed in CHANGELOG.md
- Mentioned in release notes
- Added to contributors list (if significant contribution)

---

Thank you for making kanji-recognizer better! 🎌
