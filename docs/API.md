# API Documentation

Complete API reference for Preference Injector.

## Table of Contents

- [Core](#core)
  - [PreferenceInjector](#preferenceinjector)
- [Providers](#providers)
  - [MemoryProvider](#memoryprovider)
  - [FileProvider](#fileprovider)
  - [EnvProvider](#envprovider)
  - [ApiProvider](#apiprovider)
- [Utilities](#utilities)
  - [Validation](#validation)
  - [Encryption](#encryption)
  - [Caching](#caching)
  - [Audit Logging](#audit-logging)
- [Integrations](#integrations)
  - [React](#react-integration)
  - [Express](#express-integration)

---

## Core

### PreferenceInjector

Main class for preference management.

#### Constructor

```typescript
constructor(config?: InjectorConfig)
```

**Parameters:**
- `config` (optional): Configuration object
  - `providers`: Array of preference providers
  - `conflictResolution`: Strategy for resolving conflicts
  - `enableCache`: Enable caching (default: false)
  - `cacheTTL`: Cache TTL in milliseconds (default: 3600000)
  - `enableValidation`: Enable validation (default: false)
  - `enableEncryption`: Enable encryption (default: false)
  - `enableAudit`: Enable audit logging (default: false)

**Example:**
```typescript
const injector = new PreferenceInjector({
  providers: [new MemoryProvider()],
  conflictResolution: ConflictResolution.HIGHEST_PRIORITY,
  enableCache: true,
  cacheTTL: 3600000,
});
```

#### Methods

##### initialize()

Initialize all providers.

```typescript
async initialize(): Promise<void>
```

##### get()

Get a preference value.

```typescript
async get(key: string, options?: GetOptions): Promise<PreferenceValue>
```

**Parameters:**
- `key`: Preference key
- `options` (optional):
  - `defaultValue`: Default value if not found
  - `decrypt`: Decrypt encrypted values
  - `useCache`: Use cached value (default: true)

**Returns:** The preference value

**Throws:** `PreferenceNotFoundError` if not found and no default

##### getTyped()

Get a type-safe preference value.

```typescript
async getTyped<T extends PreferenceValue>(key: string, options?: GetOptions): Promise<T>
```

##### set()

Set a preference value.

```typescript
async set(key: string, value: PreferenceValue, options?: SetOptions): Promise<void>
```

**Parameters:**
- `key`: Preference key
- `value`: Preference value
- `options` (optional):
  - `priority`: Override default priority
  - `ttl`: Time-to-live in milliseconds
  - `encrypt`: Encrypt the value
  - `validate`: Validate before setting

##### has()

Check if a preference exists.

```typescript
async has(key: string): Promise<boolean>
```

##### delete()

Delete a preference.

```typescript
async delete(key: string): Promise<boolean>
```

**Returns:** `true` if deleted, `false` if not found

##### clear()

Clear all preferences.

```typescript
async clear(): Promise<void>
```

##### getAll()

Get all preferences.

```typescript
async getAll(): Promise<Map<string, PreferenceValue>>
```

##### on()

Subscribe to preference events.

```typescript
on(event: PreferenceEvent, listener: PreferenceEventListener): void
```

**Events:**
- `PreferenceEvent.CHANGED`: Preference value changed
- `PreferenceEvent.ADDED`: New preference added
- `PreferenceEvent.REMOVED`: Preference deleted
- `PreferenceEvent.CLEARED`: All preferences cleared

---

## Providers

### MemoryProvider

In-memory storage provider.

```typescript
constructor(
  priority?: PreferencePriority,
  initialValues?: Map<string, PreferenceValue>
)
```

**Example:**
```typescript
const provider = new MemoryProvider(PreferencePriority.NORMAL);
```

### FileProvider

File-based storage provider.

```typescript
constructor(config: FileProviderConfig)
```

**Config:**
- `filePath`: Path to preferences file
- `priority`: Provider priority (default: NORMAL)
- `watchForChanges`: Watch file for changes (default: false)
- `format`: File format - 'json' or 'env' (auto-detected)

**Example:**
```typescript
const provider = new FileProvider({
  filePath: './config.json',
  priority: PreferencePriority.NORMAL,
  watchForChanges: true,
});
```

### EnvProvider

Environment variable provider.

```typescript
constructor(config?: EnvProviderConfig)
```

**Config:**
- `prefix`: Environment variable prefix (default: '')
- `priority`: Provider priority (default: HIGHEST)
- `parseValues`: Parse values to appropriate types (default: true)

**Example:**
```typescript
const provider = new EnvProvider({
  prefix: 'APP_',
  priority: PreferencePriority.HIGHEST,
});
```

### ApiProvider

API-based remote configuration provider.

```typescript
constructor(config: ApiProviderConfig)
```

**Config:**
- `baseUrl`: Base URL for API
- `apiKey`: API authentication key (optional)
- `headers`: Custom headers (optional)
- `priority`: Provider priority (default: NORMAL)
- `timeout`: Request timeout in ms (default: 5000)
- `retries`: Number of retry attempts (default: 3)

**Example:**
```typescript
const provider = new ApiProvider({
  baseUrl: 'https://config.example.com',
  apiKey: 'your-api-key',
  timeout: 5000,
});
```

---

## Utilities

### Validation

#### CommonValidationRules

Pre-built validation rules.

```typescript
import { CommonValidationRules } from '@hyperpolymath/preference-injector';

// Required value
CommonValidationRules.required(message?: string)

// String length
CommonValidationRules.stringLength(min?: number, max?: number, message?: string)

// Number range
CommonValidationRules.numberRange(min?: number, max?: number, message?: string)

// Pattern matching
CommonValidationRules.pattern(regex: RegExp, message?: string)

// Email format
CommonValidationRules.email(message?: string)

// URL format
CommonValidationRules.url(message?: string)

// Enum values
CommonValidationRules.enum(allowedValues: T[], message?: string)

// Custom validation
CommonValidationRules.custom(fn: (value) => boolean | Promise<boolean>, name: string, message?: string)
```

### Encryption

#### AESEncryptionService

AES-256-GCM encryption service.

```typescript
constructor(password: string)

async encrypt(value: string): Promise<string>
async decrypt(encrypted: string): Promise<string>
isEncrypted(value: string): boolean
```

### Caching

#### LRUCache

Least Recently Used cache with TTL support.

```typescript
constructor(maxSize?: number, defaultTTL?: number)

get(key: string): PreferenceMetadata | null
set(key: string, value: PreferenceMetadata, ttl?: number): void
has(key: string): boolean
delete(key: string): boolean
clear(): void
```

### Audit Logging

#### InMemoryAuditLogger

In-memory audit logger.

```typescript
log(entry: AuditLogEntry): void
getEntries(filter?: AuditFilter): AuditLogEntry[]
clear(): void
```

---

## Integrations

### React Integration

#### PreferenceProvider

Context provider component.

```tsx
<PreferenceProvider injector={injector}>
  {children}
</PreferenceProvider>
```

#### usePreference

Hook for single preference.

```typescript
function usePreference<T>(
  key: string,
  defaultValue?: T,
  options?: GetOptions
): [T | undefined, (value: T) => Promise<void>, boolean]
```

**Returns:** `[value, setValue, loading]`

#### usePreferences

Hook for multiple preferences.

```typescript
function usePreferences(
  keys: string[]
): [Map<string, PreferenceValue>, (key: string, value: PreferenceValue) => Promise<void>, boolean]
```

**Returns:** `[values, updateValue, loading]`

### Express Integration

#### preferenceMiddleware

Middleware for attaching preferences to requests.

```typescript
preferenceMiddleware(options: PreferenceMiddlewareOptions)
```

**Options:**
- `injector`: PreferenceInjector instance
- `attachHelpers`: Attach helper methods to req (default: true)
- `initializeOnStartup`: Initialize injector on startup (default: true)

#### createPreferenceRouter

Create REST API router.

```typescript
createPreferenceRouter(injector: PreferenceInjector)
```

**Routes:**
- `GET /preferences` - Get all preferences
- `GET /preferences/:key` - Get single preference
- `PUT /preferences/:key` - Set preference
- `DELETE /preferences/:key` - Delete preference
- `HEAD /preferences/:key` - Check if exists
- `DELETE /preferences` - Clear all
- `GET /preferences/_audit` - Get audit log

---

## Types

### PreferenceValue

```typescript
type PreferenceValue = string | number | boolean | null | PreferenceObject | PreferenceArray;
```

### PreferencePriority

```typescript
enum PreferencePriority {
  LOWEST = 0,
  LOW = 25,
  NORMAL = 50,
  HIGH = 75,
  HIGHEST = 100,
}
```

### ConflictResolution

```typescript
enum ConflictResolution {
  HIGHEST_PRIORITY = 'highest_priority',
  LOWEST_PRIORITY = 'lowest_priority',
  MERGE = 'merge',
  OVERRIDE = 'override',
  ERROR = 'error',
}
```

For complete type definitions, see [src/types/index.ts](../src/types/index.ts).
