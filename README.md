# Preference Injector

A powerful, type-safe preference injection system for dynamic configuration management in Node.js and TypeScript applications.

## Features

- **Multiple Providers**: File-based, environment variables, API, and in-memory storage
- **Priority System**: Resolve conflicts between providers using customizable strategies
- **Type Safety**: Full TypeScript support with generic type helpers
- **Caching**: LRU and TTL caching strategies for performance
- **Validation**: Schema-based and custom validation rules
- **Encryption**: AES-256-GCM encryption for sensitive preferences
- **Audit Logging**: Track all preference operations
- **Migrations**: Version and migrate preference schemas
- **React Integration**: Hooks and context providers
- **Express Middleware**: RESTful API and request helpers
- **CLI Tool**: Command-line interface for preference management

## Installation

```bash
npm install @hyperpolymath/preference-injector
```

## Quick Start

```typescript
import { PreferenceInjector, MemoryProvider } from '@hyperpolymath/preference-injector';

// Create an injector with an in-memory provider
const injector = new PreferenceInjector({
  providers: [new MemoryProvider()],
});

await injector.initialize();

// Set preferences
await injector.set('theme', 'dark');
await injector.set('fontSize', 14);

// Get preferences
const theme = await injector.get('theme');
console.log('Theme:', theme); // 'dark'

// Get with type safety
const fontSize = await injector.getTyped<number>('fontSize');
console.log('Font Size:', fontSize); // 14
```

## Providers

### Memory Provider

In-memory storage for runtime preferences:

```typescript
import { MemoryProvider, PreferencePriority } from '@hyperpolymath/preference-injector';

const provider = new MemoryProvider(PreferencePriority.NORMAL);
```

### File Provider

JSON or .env file-based storage:

```typescript
import { FileProvider } from '@hyperpolymath/preference-injector';

const provider = new FileProvider({
  filePath: './config.json',
  priority: PreferencePriority.NORMAL,
  watchForChanges: true,
  format: 'json', // or 'env'
});
```

### Environment Provider

Environment variable integration:

```typescript
import { EnvProvider } from '@hyperpolymath/preference-injector';

const provider = new EnvProvider({
  prefix: 'APP_',
  priority: PreferencePriority.HIGHEST,
  parseValues: true,
});
```

### API Provider

Remote configuration service:

```typescript
import { ApiProvider } from '@hyperpolymath/preference-injector';

const provider = new ApiProvider({
  baseUrl: 'https://config.example.com',
  apiKey: 'your-api-key',
  priority: PreferencePriority.NORMAL,
  timeout: 5000,
  retries: 3,
});
```

## Multi-Provider Setup

Use multiple providers with automatic conflict resolution:

```typescript
const injector = new PreferenceInjector({
  providers: [
    new EnvProvider({ priority: PreferencePriority.HIGHEST }),
    new FileProvider({ filePath: './config.json', priority: PreferencePriority.NORMAL }),
    new MemoryProvider(PreferencePriority.LOW),
  ],
  conflictResolution: ConflictResolution.HIGHEST_PRIORITY,
});
```

## Validation

Add validation rules to ensure preference values are valid:

```typescript
import { CommonValidationRules } from '@hyperpolymath/preference-injector';

const validator = injector.getValidator();

// Add built-in validation rules
validator.addRule('email', CommonValidationRules.email());
validator.addRule('age', CommonValidationRules.numberRange(0, 150));
validator.addRule('username', CommonValidationRules.stringLength(3, 20));

// Set with validation
await injector.set('email', 'user@example.com', { validate: true });
```

## Schema Validation

Define schemas for your preferences:

```typescript
import { SchemaBuilder } from '@hyperpolymath/preference-injector';

const schema = new SchemaBuilder()
  .string('apiUrl', { required: true, pattern: /^https?:\/\// })
  .number('timeout', { min: 0, max: 30000, default: 5000 })
  .boolean('debug', { default: false })
  .build();

const schemaValidator = new SchemaValidator(schema);
```

## Encryption

Encrypt sensitive preferences:

```typescript
import { AESEncryptionService } from '@hyperpolymath/preference-injector';

const encryptionService = new AESEncryptionService('your-secret-password');
injector.setEncryptionService(encryptionService);

// Store encrypted
await injector.set('apiKey', 'secret-key', { encrypt: true });

// Retrieve and decrypt
const apiKey = await injector.get('apiKey', { decrypt: true });
```

## Caching

Enable caching for better performance:

```typescript
const injector = new PreferenceInjector({
  providers: [provider],
  enableCache: true,
  cacheTTL: 3600000, // 1 hour
});
```

## Audit Logging

Track all preference operations:

```typescript
const injector = new PreferenceInjector({
  providers: [provider],
  enableAudit: true,
});

// Get audit log
const auditLogger = injector.getAuditLogger();
const entries = auditLogger.getEntries();
```

## React Integration

Use preferences in React applications:

```tsx
import { PreferenceProvider, usePreference } from '@hyperpolymath/preference-injector';

function App() {
  return (
    <PreferenceProvider injector={injector}>
      <ThemeToggle />
    </PreferenceProvider>
  );
}

function ThemeToggle() {
  const [theme, setTheme, loading] = usePreference<string>('theme', 'light');

  if (loading) return <div>Loading...</div>;

  return (
    <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
      Current: {theme}
    </button>
  );
}
```

## Express Integration

Add preference management to Express applications:

```typescript
import express from 'express';
import {
  preferenceMiddleware,
  createPreferenceRouter,
} from '@hyperpolymath/preference-injector';

const app = express();

// Attach preferences to requests
app.use(preferenceMiddleware({ injector }));

// Add REST API
app.use('/api', createPreferenceRouter(injector));

// Use in routes
app.get('/config', async (req, res) => {
  const value = await req.getPreference('setting');
  res.json({ value });
});
```

## CLI Tool

Manage preferences from the command line:

```bash
# Get a preference
preference-injector get theme

# Set a preference
preference-injector set theme dark

# List all preferences
preference-injector -f config.json list

# Delete a preference
preference-injector delete old-key

# Clear all preferences
preference-injector clear
```

## Migrations

Version and migrate preference schemas:

```typescript
import { MigrationManager, createMigration } from '@hyperpolymath/preference-injector';

const manager = new MigrationManager();

manager.register(
  createMigration(
    1,
    'rename-theme-to-color-scheme',
    async (prefs) => {
      // Migration logic
      return prefs;
    },
    async (prefs) => {
      // Rollback logic
      return prefs;
    }
  )
);

await manager.migrateToLatest(preferences, 0);
```

## API Documentation

For detailed API documentation, see [API.md](./docs/API.md).

## Examples

Check the [examples](./examples) directory for more usage examples:

- [Basic Usage](./examples/basic-usage.ts)
- [React Integration](./examples/react-example.tsx)
- [Express Integration](./examples/express-example.ts)

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## License

MIT

## Changelog

See [CHANGELOG.md](./CHANGELOG.md) for release history.
