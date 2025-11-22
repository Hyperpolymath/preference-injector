# Contributing to Preference Injector

Thank you for your interest in contributing to Preference Injector! This document provides guidelines and instructions for contributing.

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for all contributors.

## Getting Started

### Prerequisites

- Node.js 16.x or higher
- npm or yarn
- Git

### Development Setup

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/preference-injector.git
   cd preference-injector
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Create a branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Workflow

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Building

```bash
# Build the project
npm run build

# Clean build artifacts
npm run clean
```

### Linting and Formatting

```bash
# Run ESLint
npm run lint

# Fix linting issues
npm run lint:fix

# Check formatting
npm run format:check

# Format code
npm run format
```

## Coding Standards

### TypeScript

- Use strict TypeScript configuration
- Prefer interfaces over types for object shapes
- Use explicit return types for functions
- Avoid `any` type; use `unknown` when type is truly unknown

### Naming Conventions

- **Files**: `kebab-case.ts`
- **Classes**: `PascalCase`
- **Functions/Variables**: `camelCase`
- **Constants**: `UPPER_SNAKE_CASE`
- **Interfaces**: `PascalCase`

### Code Style

- Use 2 spaces for indentation
- Use single quotes for strings
- Add semicolons
- Use async/await over raw Promises
- Prefer const over let; avoid var

### Comments and Documentation

- Add JSDoc comments for public APIs
- Document complex logic with inline comments
- Keep comments up-to-date with code changes
- Use TypeDoc-compatible documentation

## Testing Guidelines

### Test Structure

- **Unit Tests**: Test individual components in isolation (`*.test.ts`)
- **Integration Tests**: Test component interactions (`*.integration.test.ts`)
- **E2E Tests**: Test complete workflows (`*.e2e.test.ts`)

### Writing Tests

- Follow AAA pattern (Arrange, Act, Assert)
- Use descriptive test names
- Test both success and failure cases
- Aim for >80% code coverage
- Mock external dependencies

Example:

```typescript
describe('ComponentName', () => {
  describe('methodName', () => {
    test('should do something when condition', () => {
      // Arrange
      const input = 'test';

      // Act
      const result = method(input);

      // Assert
      expect(result).toBe(expected);
    });
  });
});
```

## Pull Request Process

### Before Submitting

1. Ensure all tests pass
2. Add tests for new features
3. Update documentation
4. Run linter and formatter
5. Update CHANGELOG.md

### PR Guidelines

1. Create a descriptive title
2. Reference related issues
3. Provide a clear description of changes
4. Include screenshots for UI changes
5. Keep PRs focused and atomic

### PR Template

```markdown
## Description
[Describe your changes]

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tests added/updated
- [ ] All tests passing
- [ ] Manual testing completed

## Checklist
- [ ] Code follows project style
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] No new warnings generated
- [ ] CHANGELOG.md updated
```

## Adding New Features

### Feature Checklist

- [ ] Design documented
- [ ] Implementation follows coding standards
- [ ] Unit tests added
- [ ] Integration tests added (if applicable)
- [ ] Documentation updated
- [ ] Examples added
- [ ] TypeScript types exported
- [ ] Backward compatibility maintained

### Provider Implementation

When adding a new provider:

1. Implement `PreferenceProvider` interface
2. Add comprehensive error handling
3. Include validation and sanitization
4. Add unit and integration tests
5. Update documentation
6. Add usage example

### Integration Implementation

When adding framework integration:

1. Follow framework conventions
2. Provide TypeScript types
3. Add comprehensive examples
4. Include integration tests
5. Update documentation

## Documentation

### README Updates

- Keep examples current
- Update feature list
- Add new sections as needed
- Include screenshots if helpful

### API Documentation

- Use JSDoc comments
- Document parameters and return types
- Include usage examples
- Generate with TypeDoc

### Example Code

- Keep examples simple and focused
- Use realistic scenarios
- Include error handling
- Add comments explaining key concepts

## Release Process

1. Update version in package.json
2. Update CHANGELOG.md
3. Create git tag
4. Push to GitHub
5. Create GitHub release
6. Publish to npm (maintainers only)

## Questions and Support

- **Issues**: For bugs and feature requests
- **Discussions**: For questions and ideas
- **Email**: For security issues

## Recognition

Contributors will be recognized in:
- README contributors section
- CHANGELOG for significant contributions
- GitHub contributors page

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

Thank you for contributing to Preference Injector!
