import {
  PreferenceProvider,
  PreferenceMetadata,
  PreferenceValue,
  GetOptions,
  SetOptions,
  InjectorConfig,
  ConflictResolution,
  Cache,
  Validator,
  AuditLogger,
  EncryptionService,
  AuditAction,
  PreferenceEvent,
  PreferenceEventListener,
  PreferenceChangeEvent,
} from '../types';
import { ConflictResolver } from '../utils/conflict-resolver';
import { LRUCache, NoOpCache } from '../utils/cache';
import { PreferenceValidator } from '../utils/validator';
import { InMemoryAuditLogger, NoOpAuditLogger } from '../utils/audit';
import { NoOpEncryptionService } from '../utils/encryption';
import { PreferenceNotFoundError } from '../errors';

/**
 * Core preference injector with support for multiple providers,
 * caching, validation, encryption, and auditing
 */
export class PreferenceInjector {
  private providers: PreferenceProvider[] = [];
  private conflictResolution: ConflictResolution;
  private cache: Cache;
  private validator: Validator;
  private auditLogger: AuditLogger;
  private encryptionService: EncryptionService;
  private initialized = false;
  private eventListeners: Map<PreferenceEvent, Set<PreferenceEventListener>> = new Map();

  constructor(config?: InjectorConfig) {
    this.conflictResolution = config?.conflictResolution || ConflictResolution.HIGHEST_PRIORITY;

    this.cache = config?.enableCache
      ? new LRUCache(1000, config.cacheTTL || 3600000)
      : new NoOpCache();

    this.validator = config?.enableValidation ? new PreferenceValidator() : new PreferenceValidator();

    this.auditLogger = config?.enableAudit ? new InMemoryAuditLogger() : new NoOpAuditLogger();

    this.encryptionService = new NoOpEncryptionService();

    if (config?.providers) {
      this.providers = config.providers;
    }
  }

  /**
   * Initialize all providers
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    await Promise.all(this.providers.map((provider) => provider.initialize()));
    this.initialized = true;
  }

  /**
   * Add a preference provider
   */
  addProvider(provider: PreferenceProvider): void {
    this.providers.push(provider);
  }

  /**
   * Remove a preference provider
   */
  removeProvider(providerName: string): boolean {
    const index = this.providers.findIndex((p) => p.name === providerName);

    if (index !== -1) {
      this.providers.splice(index, 1);
      return true;
    }

    return false;
  }

  /**
   * Get a preference value
   */
  async get(key: string, options?: GetOptions): Promise<PreferenceValue> {
    // Check cache first
    if (options?.useCache !== false) {
      const cached = this.cache.get(key);
      if (cached) {
        this.auditLogger.log({
          timestamp: new Date(),
          action: AuditAction.GET,
          key,
          value: cached.value,
          provider: 'cache',
        });
        return cached.value;
      }
    }

    // Gather values from all providers
    const results: PreferenceMetadata[] = [];

    for (const provider of this.providers) {
      const metadata = await provider.get(key);
      if (metadata) {
        results.push(metadata);
      }
    }

    if (results.length === 0) {
      if (options?.defaultValue !== undefined) {
        return options.defaultValue;
      }
      throw new PreferenceNotFoundError(key);
    }

    // Resolve conflicts
    const resolved = ConflictResolver.resolve(results, this.conflictResolution);

    // Decrypt if needed
    let value = resolved.value;
    if (
      options?.decrypt &&
      typeof value === 'string' &&
      this.encryptionService.isEncrypted(value)
    ) {
      value = await this.encryptionService.decrypt(value);
      this.auditLogger.log({
        timestamp: new Date(),
        action: AuditAction.DECRYPT,
        key,
        provider: resolved.source,
      });
    }

    // Update cache
    if (options?.useCache !== false) {
      this.cache.set(key, { ...resolved, value }, resolved.ttl);
    }

    this.auditLogger.log({
      timestamp: new Date(),
      action: AuditAction.GET,
      key,
      value,
      provider: resolved.source,
    });

    return value;
  }

  /**
   * Get a preference value with type safety
   */
  async getTyped<T extends PreferenceValue>(key: string, options?: GetOptions): Promise<T> {
    return (await this.get(key, options)) as T;
  }

  /**
   * Get all preferences
   */
  async getAll(): Promise<Map<string, PreferenceValue>> {
    const allPreferences = new Map<string, PreferenceMetadata>();

    // Gather from all providers
    for (const provider of this.providers) {
      const providerPrefs = await provider.getAll();

      for (const [key, metadata] of providerPrefs.entries()) {
        const existing = allPreferences.get(key);

        if (!existing) {
          allPreferences.set(key, metadata);
        } else {
          // Resolve conflict
          const resolved = ConflictResolver.resolve([existing, metadata], this.conflictResolution);
          allPreferences.set(key, resolved);
        }
      }
    }

    // Convert to value map
    const result = new Map<string, PreferenceValue>();
    for (const [key, metadata] of allPreferences.entries()) {
      result.set(key, metadata.value);
    }

    return result;
  }

  /**
   * Set a preference value
   */
  async set(key: string, value: PreferenceValue, options?: SetOptions): Promise<void> {
    const oldValue = await this.get(key, { useCache: false }).catch(() => undefined);

    // Validate if enabled
    if (options?.validate !== false) {
      const validationResult = await this.validator.validate(key, value);

      if (!validationResult.valid) {
        throw new Error(`Validation failed: ${JSON.stringify(validationResult.errors)}`);
      }

      this.auditLogger.log({
        timestamp: new Date(),
        action: AuditAction.VALIDATE,
        key,
        value,
        provider: 'validator',
      });
    }

    // Encrypt if needed
    let finalValue = value;
    if (options?.encrypt && typeof value === 'string') {
      finalValue = await this.encryptionService.encrypt(value);
      this.auditLogger.log({
        timestamp: new Date(),
        action: AuditAction.ENCRYPT,
        key,
        provider: 'encryption',
      });
    }

    // Set in all writable providers
    // (For now, we'll set in all providers, but you could have a "readonly" flag)
    for (const provider of this.providers) {
      await provider.set(key, finalValue, options);
    }

    // Update cache
    this.cache.delete(key);

    this.auditLogger.log({
      timestamp: new Date(),
      action: AuditAction.SET,
      key,
      value: finalValue,
      oldValue,
      provider: 'injector',
    });

    // Emit change event
    this.emitEvent({
      type: oldValue === undefined ? PreferenceEvent.ADDED : PreferenceEvent.CHANGED,
      key,
      newValue: value,
      oldValue,
      provider: 'injector',
      timestamp: new Date(),
    });
  }

  /**
   * Check if a preference exists
   */
  async has(key: string): Promise<boolean> {
    for (const provider of this.providers) {
      if (await provider.has(key)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Delete a preference
   */
  async delete(key: string): Promise<boolean> {
    const oldValue = await this.get(key, { useCache: false }).catch(() => undefined);
    let deleted = false;

    for (const provider of this.providers) {
      const result = await provider.delete(key);
      deleted = deleted || result;
    }

    if (deleted) {
      this.cache.delete(key);

      this.auditLogger.log({
        timestamp: new Date(),
        action: AuditAction.DELETE,
        key,
        oldValue,
        provider: 'injector',
      });

      this.emitEvent({
        type: PreferenceEvent.REMOVED,
        key,
        oldValue,
        provider: 'injector',
        timestamp: new Date(),
      });
    }

    return deleted;
  }

  /**
   * Clear all preferences
   */
  async clear(): Promise<void> {
    for (const provider of this.providers) {
      await provider.clear();
    }

    this.cache.clear();

    this.auditLogger.log({
      timestamp: new Date(),
      action: AuditAction.CLEAR,
      key: '*',
      provider: 'injector',
    });

    this.emitEvent({
      type: PreferenceEvent.CLEARED,
      key: '*',
      provider: 'injector',
      timestamp: new Date(),
    });
  }

  /**
   * Get the validator instance
   */
  getValidator(): Validator {
    return this.validator;
  }

  /**
   * Get the audit logger instance
   */
  getAuditLogger(): AuditLogger {
    return this.auditLogger;
  }

  /**
   * Get the cache instance
   */
  getCache(): Cache {
    return this.cache;
  }

  /**
   * Set the encryption service
   */
  setEncryptionService(service: EncryptionService): void {
    this.encryptionService = service;
  }

  /**
   * Add an event listener
   */
  on(event: PreferenceEvent, listener: PreferenceEventListener): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(listener);
  }

  /**
   * Remove an event listener
   */
  off(event: PreferenceEvent, listener: PreferenceEventListener): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.delete(listener);
    }
  }

  /**
   * Emit an event
   */
  private emitEvent(event: PreferenceChangeEvent): void {
    const listeners = this.eventListeners.get(event.type);
    if (listeners) {
      for (const listener of listeners) {
        try {
          listener(event);
        } catch (error) {
          console.error('Error in event listener:', error);
        }
      }
    }
  }
}
