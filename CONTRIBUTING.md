# Contributing to Preference Injector

Thank you for your interest in contributing to Preference Injector! This document provides guidelines and instructions for contributing.

## Code of Conduct

**Please read CODE_OF_CONDUCT.md before contributing.**

This project prioritizes emotional safety and uses the **Tri-Perimeter Contribution Framework (TPCF)** to reduce anxiety and encourage experimentation.

## Tri-Perimeter Contribution Framework (TPCF)

### You are starting in **Perimeter 3: Community Sandbox** 🎉

- ✅ **Fork, clone, experiment freely**
- ✅ **Open issues and submit PRs**
- ✅ **Low anxiety** - all changes are reversible via Git
- ✅ **High experimentation** - breaking things is learning!
- ⚠️ Cannot commit directly to main branch (protection)

### Path to Perimeter 2: Trusted Contributor

After **3+ merged PRs** and **30+ days** of contribution:
- ✅ Direct commits to feature branches
- ✅ Triage and label issues
- ✅ Review PRs from Perimeter 3
- 🔄 Automatic promotion (no vote required)

### Path to Perimeter 1: Core Maintainer

Demonstrated leadership + nomination + 2/3 vote:
- ✅ Merge to main branch
- ✅ Release management
- ✅ Security triage
- 👥 See MAINTAINERS.md for details

## Getting Started

### Prerequisites

- **Deno** 1.x or higher (we migrated from Node.js!)
- **Just** command runner (replaces npm scripts)
- Git
- (Optional) **Nix** for reproducible builds
- (Optional) **ReScript** for functional programming modules

### Development Setup (Quick Start)

1. **Fork and clone** the repository:
   ```bash
   git clone https://github.com/YOUR_USERNAME/preference-injector.git
   cd preference-injector
   ```

2. **Install dependencies**:
   ```bash
   just install
   # or manually: deno cache src/deps.ts
   ```

3. **Verify RSR compliance** (optional but recommended):
   ```bash
   just rsr-verify
   ```

4. **Start developing**:
   ```bash
   just dev
   ```

### Using Nix (Recommended for Reproducibility)

```bash
# Enter development shell with all dependencies
nix develop

# Build the project
nix build

# Run checks
nix flake check
```

## Development Workflow

### Using Just (Recommended)

We use **Just** as our command runner. See all available commands:

```bash
just --list
```

### Running Tests

```bash
# Run all tests
just test

# Run tests in watch mode
just test-watch

# Generate coverage report
just test-coverage
```

### Building

```bash
# Build TypeScript
just build

# Build ReScript
just build-rescript

# Build everything
just build-all

# Clean build artifacts
just clean
```

### Linting and Formatting

```bash
# Run linter
just lint

# Auto-fix linting issues
just lint-fix

# Format code
just fmt

# Check formatting
just fmt-check

# Run all checks (lint + format + types)
just check-all
```

## RSR Compliance

This project follows the **Rhodium Standard Repository (RSR) Framework**. Before submitting PRs, please verify compliance:

```bash
# Check RSR compliance
just rsr-verify

# Calculate compliance score
just rsr-score
```

### Required Files (Bronze Level)

Ensure these files exist and are up-to-date:
- ✅ `SECURITY.md` - Security policies
- ✅ `CODE_OF_CONDUCT.md` - Community guidelines
- ✅ `MAINTAINERS.md` - Governance and TPCF
- ✅ `.well-known/security.txt` - RFC 9116 security contact
- ✅ `.well-known/ai.txt` - AI training policies
- ✅ `.well-known/humans.txt` - Human contributors
- ✅ `PALIMPSEST-LICENSE.txt` - Dual licensing

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
