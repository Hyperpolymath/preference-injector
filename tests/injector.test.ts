/**
 * Unit tests for PreferenceInjector
 */

import { PreferenceInjector } from '../src/core/injector';
import { MemoryProvider } from '../src/providers/memory-provider';
import { PreferencePriority, ConflictResolution } from '../src/types';

describe('PreferenceInjector', () => {
  let injector: PreferenceInjector;
  let provider: MemoryProvider;

  beforeEach(async () => {
    provider = new MemoryProvider(PreferencePriority.NORMAL);
    injector = new PreferenceInjector({
      providers: [provider],
      enableCache: false,
    });
    await injector.initialize();
  });

  describe('basic operations', () => {
    test('should set and get a preference', async () => {
      await injector.set('theme', 'dark');
      const value = await injector.get('theme');
      expect(value).toBe('dark');
    });

    test('should get typed preference', async () => {
      await injector.set('fontSize', 14);
      const value = await injector.getTyped<number>('fontSize');
      expect(typeof value).toBe('number');
      expect(value).toBe(14);
    });

    test('should check if preference exists', async () => {
      await injector.set('key', 'value');
      const exists = await injector.has('key');
      expect(exists).toBe(true);

      const notExists = await injector.has('nonexistent');
      expect(notExists).toBe(false);
    });

    test('should delete a preference', async () => {
      await injector.set('key', 'value');
      const deleted = await injector.delete('key');
      expect(deleted).toBe(true);

      const exists = await injector.has('key');
      expect(exists).toBe(false);
    });

    test('should get all preferences', async () => {
      await injector.set('key1', 'value1');
      await injector.set('key2', 'value2');
      await injector.set('key3', 123);

      const all = await injector.getAll();
      expect(all.size).toBe(3);
      expect(all.get('key1')).toBe('value1');
      expect(all.get('key2')).toBe('value2');
      expect(all.get('key3')).toBe(123);
    });

    test('should clear all preferences', async () => {
      await injector.set('key1', 'value1');
      await injector.set('key2', 'value2');

      await injector.clear();

      const all = await injector.getAll();
      expect(all.size).toBe(0);
    });

    test('should use default value when preference not found', async () => {
      const value = await injector.get('nonexistent', { defaultValue: 'default' });
      expect(value).toBe('default');
    });

    test('should throw error when preference not found and no default', async () => {
      await expect(injector.get('nonexistent')).rejects.toThrow();
    });
  });

  describe('multiple providers', () => {
    test('should resolve conflicts using highest priority', async () => {
      const lowProvider = new MemoryProvider(PreferencePriority.LOW);
      const highProvider = new MemoryProvider(PreferencePriority.HIGH);

      const multiInjector = new PreferenceInjector({
        providers: [lowProvider, highProvider],
        conflictResolution: ConflictResolution.HIGHEST_PRIORITY,
      });

      await multiInjector.initialize();

      await lowProvider.set('theme', 'light');
      await highProvider.set('theme', 'dark');

      const value = await multiInjector.get('theme');
      expect(value).toBe('dark'); // High priority wins
    });

    test('should add and remove providers', () => {
      const newProvider = new MemoryProvider();
      injector.addProvider(newProvider);

      const removed = injector.removeProvider('memory');
      expect(removed).toBe(true);

      const notRemoved = injector.removeProvider('nonexistent');
      expect(notRemoved).toBe(false);
    });
  });

  describe('caching', () => {
    test('should use cache when enabled', async () => {
      const cachedInjector = new PreferenceInjector({
        providers: [provider],
        enableCache: true,
        cacheTTL: 1000,
      });

      await cachedInjector.initialize();

      await cachedInjector.set('key', 'value');

      const value1 = await cachedInjector.get('key');
      const value2 = await cachedInjector.get('key', { useCache: true });

      expect(value1).toBe('value');
      expect(value2).toBe('value');
    });

    test('should bypass cache when requested', async () => {
      const cachedInjector = new PreferenceInjector({
        providers: [provider],
        enableCache: true,
      });

      await cachedInjector.initialize();

      await cachedInjector.set('key', 'value1');
      await cachedInjector.get('key'); // Cache it

      await cachedInjector.set('key', 'value2');

      const cached = await cachedInjector.get('key', { useCache: true });
      const fresh = await cachedInjector.get('key', { useCache: false });

      expect(fresh).toBe('value2');
    });
  });

  describe('validation', () => {
    test('should validate preferences when enabled', async () => {
      const validator = injector.getValidator();
      const { CommonValidationRules } = await import('../src/utils/validator');

      validator.addRule('email', CommonValidationRules.email());

      await injector.set('email', 'user@example.com', { validate: true });

      await expect(
        injector.set('email', 'invalid-email', { validate: true })
      ).rejects.toThrow();
    });
  });

  describe('audit logging', () => {
    test('should log operations when enabled', async () => {
      const auditInjector = new PreferenceInjector({
        providers: [provider],
        enableAudit: true,
      });

      await auditInjector.initialize();

      await auditInjector.set('key', 'value');
      await auditInjector.get('key');
      await auditInjector.delete('key');

      const auditLogger = auditInjector.getAuditLogger();
      const entries = auditLogger.getEntries();

      expect(entries.length).toBeGreaterThan(0);
    });
  });
});
