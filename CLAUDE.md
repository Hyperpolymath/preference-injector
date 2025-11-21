# Preference Injector

## Project Overview

This project implements a preference injection system that allows dynamic modification of user preferences or settings in applications. The system is designed to inject, override, or manage user preferences at runtime.

## Project Structure

```
preference-injector/
├── src/                    # Source code
│   ├── core/              # Core injection logic
│   ├── providers/         # Preference providers
│   ├── utils/             # Utility functions
│   └── types/             # TypeScript type definitions
├── tests/                 # Test files
├── examples/              # Usage examples
├── docs/                  # Documentation
└── dist/                  # Build output (generated)
```

## Development Setup

### Prerequisites
- Node.js (LTS version recommended)
- npm or yarn package manager
- TypeScript

### Installation
```bash
npm install
```

### Build
```bash
npm run build
```

### Testing
```bash
npm test
```

### Development Mode
```bash
npm run dev
```

## Architecture

### Core Components

1. **Injector**: Main class responsible for injecting preferences into target applications
2. **Providers**: Sources of preference data (file-based, API-based, environment variables)
3. **Resolvers**: Logic for resolving preference conflicts and priorities
4. **Validators**: Ensure preference values are valid and safe

### Key Concepts

- **Preference Sources**: Where preferences originate (config files, databases, APIs)
- **Injection Points**: Where preferences are applied in the application
- **Priority Levels**: Mechanism for handling conflicting preferences
- **Validation Rules**: Constraints and validation for preference values

## Coding Conventions

### TypeScript
- Use strict TypeScript configuration
- Prefer interfaces over types for object shapes
- Use explicit return types for functions
- Avoid `any` type; use `unknown` when type is truly unknown

### Naming Conventions
- Files: `kebab-case.ts`
- Classes: `PascalCase`
- Functions/Variables: `camelCase`
- Constants: `UPPER_SNAKE_CASE`
- Interfaces: `PascalCase` (prefix with `I` only if necessary for clarity)

### Code Style
- Use 2 spaces for indentation
- Use single quotes for strings
- Add semicolons
- Use async/await over raw Promises
- Prefer const over let; avoid var

### Error Handling
- Use custom error classes for domain-specific errors
- Always handle promise rejections
- Provide meaningful error messages
- Log errors appropriately

## Testing Strategy

- Unit tests: Test individual components in isolation
- Integration tests: Test component interactions
- End-to-end tests: Test complete preference injection workflows
- Coverage target: >80%

### Test File Naming
- Unit tests: `*.test.ts`
- Integration tests: `*.integration.test.ts`
- E2E tests: `*.e2e.test.ts`

## Security Considerations

1. **Input Validation**: Always validate preference values before injection
2. **Sanitization**: Sanitize user-provided preferences to prevent injection attacks
3. **Access Control**: Ensure proper authorization for preference modifications
4. **Encryption**: Sensitive preferences should be encrypted at rest and in transit
5. **Audit Logging**: Track all preference changes for security auditing

## Performance Guidelines

- Cache frequently accessed preferences
- Use lazy loading for large preference sets
- Implement efficient lookup mechanisms (hash maps, indexes)
- Avoid synchronous blocking operations
- Batch preference updates when possible

## Common Tasks

### Adding a New Preference Provider
1. Create new provider class in `src/providers/`
2. Implement the `PreferenceProvider` interface
3. Add validation logic
4. Write tests
5. Update documentation

### Adding a New Injection Point
1. Define injection point interface
2. Implement injection logic
3. Add error handling
4. Write integration tests
5. Document usage

### Modifying Validation Rules
1. Update validator in `src/validators/`
2. Add test cases for new rules
3. Update schema documentation
4. Consider backward compatibility

## Dependencies

### Runtime Dependencies
- Check `package.json` for current dependencies
- Key dependencies are documented with their purpose

### Development Dependencies
- TypeScript
- Testing framework (Jest/Mocha)
- Linters (ESLint)
- Formatter (Prettier)

## Troubleshooting

### Common Issues

**Preference not being injected**
- Check provider configuration
- Verify injection point is registered
- Check priority settings
- Review validation rules

**Type errors**
- Ensure TypeScript definitions are up to date
- Check for missing type imports
- Verify generic type parameters

**Build failures**
- Clear dist folder and rebuild
- Check for circular dependencies
- Verify all imports are correct

## API Reference

Detailed API documentation is available in `docs/api.md` (when created).

## Contributing

When adding new features:
1. Create feature branch from main
2. Write tests first (TDD approach preferred)
3. Implement feature
4. Ensure all tests pass
5. Update documentation
6. Create pull request with clear description

## Environment Variables

```bash
# Example configuration
PREFERENCE_SOURCE=file|api|env
PREFERENCE_CACHE_TTL=3600
PREFERENCE_VALIDATION_STRICT=true
LOG_LEVEL=info|debug|error
```

## Git Workflow

- Main branch: `main` (protected)
- Feature branches: `feature/<description>`
- Bug fixes: `fix/<description>`
- Claude AI branches: `claude/*`

## Additional Notes

- This project may integrate with various application frameworks
- Preference schemas should be versioned for backward compatibility
- Consider implementing preference migration strategies
- Document all breaking changes in CHANGELOG.md
