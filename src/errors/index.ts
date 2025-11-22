/**
 * Custom error classes for the preference injection system
 */

/**
 * Base error class for all preference-related errors
 */
export class PreferenceError extends Error {
  constructor(message: string, public readonly code?: string) {
    super(message);
    this.name = 'PreferenceError';
    Object.setPrototypeOf(this, PreferenceError.prototype);
  }
}

/**
 * Thrown when a preference key is not found
 */
export class PreferenceNotFoundError extends PreferenceError {
  constructor(public readonly key: string, provider?: string) {
    super(
      `Preference not found: ${key}${provider ? ` in provider ${provider}` : ''}`,
      'PREFERENCE_NOT_FOUND'
    );
    this.name = 'PreferenceNotFoundError';
    Object.setPrototypeOf(this, PreferenceNotFoundError.prototype);
  }
}

/**
 * Thrown when preference validation fails
 */
export class ValidationError extends PreferenceError {
  constructor(
    public readonly key: string,
    public readonly errors: Array<{ rule: string; message: string }>
  ) {
    const errorMessages = errors.map((e) => `${e.rule}: ${e.message}`).join(', ');
    super(`Validation failed for ${key}: ${errorMessages}`, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

/**
 * Thrown when there's a conflict between providers
 */
export class ConflictError extends PreferenceError {
  constructor(
    public readonly key: string,
    public readonly providers: string[]
  ) {
    super(
      `Conflict detected for preference ${key} from providers: ${providers.join(', ')}`,
      'CONFLICT_ERROR'
    );
    this.name = 'ConflictError';
    Object.setPrototypeOf(this, ConflictError.prototype);
  }
}

/**
 * Thrown when encryption/decryption fails
 */
export class EncryptionError extends PreferenceError {
  constructor(message: string, public readonly originalError?: Error) {
    super(`Encryption error: ${message}`, 'ENCRYPTION_ERROR');
    this.name = 'EncryptionError';
    Object.setPrototypeOf(this, EncryptionError.prototype);
  }
}

/**
 * Thrown when a provider fails to initialize
 */
export class ProviderInitializationError extends PreferenceError {
  constructor(public readonly provider: string, public readonly originalError?: Error) {
    super(
      `Failed to initialize provider ${provider}: ${originalError?.message || 'Unknown error'}`,
      'PROVIDER_INIT_ERROR'
    );
    this.name = 'ProviderInitializationError';
    Object.setPrototypeOf(this, ProviderInitializationError.prototype);
  }
}

/**
 * Thrown when a provider operation fails
 */
export class ProviderError extends PreferenceError {
  constructor(
    public readonly provider: string,
    public readonly operation: string,
    public readonly originalError?: Error
  ) {
    super(
      `Provider ${provider} failed during ${operation}: ${originalError?.message || 'Unknown error'}`,
      'PROVIDER_ERROR'
    );
    this.name = 'ProviderError';
    Object.setPrototypeOf(this, ProviderError.prototype);
  }
}

/**
 * Thrown when a schema validation fails
 */
export class SchemaValidationError extends PreferenceError {
  constructor(
    public readonly key: string,
    public readonly expected: string,
    public readonly received: string
  ) {
    super(
      `Schema validation failed for ${key}: expected ${expected}, received ${received}`,
      'SCHEMA_VALIDATION_ERROR'
    );
    this.name = 'SchemaValidationError';
    Object.setPrototypeOf(this, SchemaValidationError.prototype);
  }
}

/**
 * Thrown when a migration fails
 */
export class MigrationError extends PreferenceError {
  constructor(
    public readonly version: number,
    public readonly direction: 'up' | 'down',
    public readonly originalError?: Error
  ) {
    super(
      `Migration ${direction} to version ${version} failed: ${originalError?.message || 'Unknown error'}`,
      'MIGRATION_ERROR'
    );
    this.name = 'MigrationError';
    Object.setPrototypeOf(this, MigrationError.prototype);
  }
}

/**
 * Thrown when configuration is invalid
 */
export class ConfigurationError extends PreferenceError {
  constructor(message: string) {
    super(`Configuration error: ${message}`, 'CONFIGURATION_ERROR');
    this.name = 'ConfigurationError';
    Object.setPrototypeOf(this, ConfigurationError.prototype);
  }
}

/**
 * Thrown when a type mismatch occurs
 */
export class TypeMismatchError extends PreferenceError {
  constructor(
    public readonly key: string,
    public readonly expected: string,
    public readonly received: string
  ) {
    super(
      `Type mismatch for ${key}: expected ${expected}, received ${received}`,
      'TYPE_MISMATCH_ERROR'
    );
    this.name = 'TypeMismatchError';
    Object.setPrototypeOf(this, TypeMismatchError.prototype);
  }
}
