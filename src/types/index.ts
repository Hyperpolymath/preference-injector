/**
 * Core type definitions for the preference injection system
 */

/**
 * Preference value types that can be stored and injected
 */
export type PreferenceValue = string | number | boolean | null | PreferenceObject | PreferenceArray;

export interface PreferenceObject {
  [key: string]: PreferenceValue;
}

export type PreferenceArray = PreferenceValue[];

/**
 * Priority levels for preference resolution
 */
export enum PreferencePriority {
  LOWEST = 0,
  LOW = 25,
  NORMAL = 50,
  HIGH = 75,
  HIGHEST = 100,
}

/**
 * Conflict resolution strategies
 */
export enum ConflictResolution {
  HIGHEST_PRIORITY = 'highest_priority',
  LOWEST_PRIORITY = 'lowest_priority',
  MERGE = 'merge',
  OVERRIDE = 'override',
  ERROR = 'error',
}

/**
 * Preference metadata
 */
export interface PreferenceMetadata {
  readonly key: string;
  readonly value: PreferenceValue;
  readonly priority: PreferencePriority;
  readonly source: string;
  readonly timestamp: Date;
  readonly encrypted?: boolean;
  readonly validated?: boolean;
  readonly ttl?: number;
}

/**
 * Base interface for all preference providers
 */
export interface PreferenceProvider {
  readonly name: string;
  readonly priority: PreferencePriority;

  initialize(): Promise<void>;
  get(key: string): Promise<PreferenceMetadata | null>;
  getAll(): Promise<Map<string, PreferenceMetadata>>;
  set(key: string, value: PreferenceValue, options?: SetOptions): Promise<void>;
  has(key: string): Promise<boolean>;
  delete(key: string): Promise<boolean>;
  clear(): Promise<void>;
}

/**
 * Options for setting preferences
 */
export interface SetOptions {
  priority?: PreferencePriority;
  ttl?: number;
  encrypt?: boolean;
  validate?: boolean;
  metadata?: Record<string, unknown>;
}

/**
 * Options for getting preferences
 */
export interface GetOptions {
  defaultValue?: PreferenceValue;
  decrypt?: boolean;
  useCache?: boolean;
}

/**
 * Validation rule interface
 */
export interface ValidationRule<T = PreferenceValue> {
  name: string;
  validate(value: T): boolean | Promise<boolean>;
  message?: string;
}

/**
 * Validator interface
 */
export interface Validator {
  addRule(key: string, rule: ValidationRule): void;
  validate(key: string, value: PreferenceValue): Promise<ValidationResult>;
  removeRule(key: string, ruleName: string): void;
}

/**
 * Validation result
 */
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

/**
 * Validation error
 */
export interface ValidationError {
  rule: string;
  message: string;
  value: PreferenceValue;
}

/**
 * Cache interface
 */
export interface Cache {
  get(key: string): PreferenceMetadata | null;
  set(key: string, value: PreferenceMetadata, ttl?: number): void;
  has(key: string): boolean;
  delete(key: string): boolean;
  clear(): void;
  size(): number;
}

/**
 * Audit log entry
 */
export interface AuditLogEntry {
  timestamp: Date;
  action: AuditAction;
  key: string;
  value?: PreferenceValue;
  oldValue?: PreferenceValue;
  provider: string;
  userId?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Audit actions
 */
export enum AuditAction {
  GET = 'get',
  SET = 'set',
  DELETE = 'delete',
  CLEAR = 'clear',
  VALIDATE = 'validate',
  ENCRYPT = 'encrypt',
  DECRYPT = 'decrypt',
}

/**
 * Audit logger interface
 */
export interface AuditLogger {
  log(entry: AuditLogEntry): void;
  getEntries(filter?: AuditFilter): AuditLogEntry[];
  clear(): void;
}

/**
 * Audit filter
 */
export interface AuditFilter {
  action?: AuditAction;
  key?: string;
  provider?: string;
  startDate?: Date;
  endDate?: Date;
  userId?: string;
}

/**
 * Encryption service interface
 */
export interface EncryptionService {
  encrypt(value: string): Promise<string>;
  decrypt(encrypted: string): Promise<string>;
  isEncrypted(value: string): boolean;
}

/**
 * Migration interface
 */
export interface Migration {
  version: number;
  name: string;
  up(preferences: Map<string, PreferenceMetadata>): Promise<Map<string, PreferenceMetadata>>;
  down(preferences: Map<string, PreferenceMetadata>): Promise<Map<string, PreferenceMetadata>>;
}

/**
 * Injector configuration
 */
export interface InjectorConfig {
  providers?: PreferenceProvider[];
  conflictResolution?: ConflictResolution;
  enableCache?: boolean;
  cacheTTL?: number;
  enableValidation?: boolean;
  enableEncryption?: boolean;
  enableAudit?: boolean;
  encryptionKey?: string;
}

/**
 * Provider configuration for file-based provider
 */
export interface FileProviderConfig {
  filePath: string;
  priority?: PreferencePriority;
  watchForChanges?: boolean;
  format?: 'json' | 'yaml' | 'env';
}

/**
 * Provider configuration for API-based provider
 */
export interface ApiProviderConfig {
  baseUrl: string;
  apiKey?: string;
  headers?: Record<string, string>;
  priority?: PreferencePriority;
  timeout?: number;
  retries?: number;
}

/**
 * Provider configuration for environment variable provider
 */
export interface EnvProviderConfig {
  prefix?: string;
  priority?: PreferencePriority;
  parseValues?: boolean;
}

/**
 * Schema definition for preferences
 */
export interface PreferenceSchema {
  [key: string]: SchemaField;
}

/**
 * Schema field definition
 */
export interface SchemaField {
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  required?: boolean;
  default?: PreferenceValue;
  validation?: ValidationRule[];
  description?: string;
  encrypted?: boolean;
}

/**
 * Event types for preference changes
 */
export enum PreferenceEvent {
  CHANGED = 'changed',
  ADDED = 'added',
  REMOVED = 'removed',
  CLEARED = 'cleared',
}

/**
 * Event listener callback
 */
export type PreferenceEventListener = (event: PreferenceChangeEvent) => void;

/**
 * Preference change event
 */
export interface PreferenceChangeEvent {
  type: PreferenceEvent;
  key: string;
  newValue?: PreferenceValue;
  oldValue?: PreferenceValue;
  provider: string;
  timestamp: Date;
}
