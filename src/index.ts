/**
 * Preference Injector
 * A powerful, type-safe preference injection system for dynamic configuration management
 */

// Core
export { PreferenceInjector } from './core/injector';

// Types
export * from './types';

// Errors
export * from './errors';

// Providers
export { MemoryProvider } from './providers/memory-provider';
export { FileProvider } from './providers/file-provider';
export { EnvProvider } from './providers/env-provider';
export { ApiProvider } from './providers/api-provider';

// Utils
export { AESEncryptionService, NoOpEncryptionService } from './utils/encryption';
export { LRUCache, TTLCache, NoOpCache } from './utils/cache';
export {
  InMemoryAuditLogger,
  ConsoleAuditLogger,
  NoOpAuditLogger,
  FileAuditLogger,
} from './utils/audit';
export { PreferenceValidator, CommonValidationRules } from './utils/validator';
export { ConflictResolver } from './utils/conflict-resolver';
export { SchemaValidator, SchemaBuilder } from './utils/schema';
export {
  MigrationManager,
  MigrationHelpers,
  createMigration,
} from './utils/migration';

// Integrations
export * from './integrations/react';
export * from './integrations/express';
