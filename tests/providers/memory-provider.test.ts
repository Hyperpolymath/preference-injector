/**
 * Unit tests for MemoryProvider
 */

import { MemoryProvider } from '../../src/providers/memory-provider';
import { PreferencePriority } from '../../src/types';

describe('MemoryProvider', () => {
  let provider: MemoryProvider;

  beforeEach(async () => {
    provider = new MemoryProvider(PreferencePriority.NORMAL);
    await provider.initialize();
  });

  test('should set and get values', async () => {
    await provider.set('key', 'value');
    const metadata = await provider.get('key');

    expect(metadata).not.toBeNull();
    expect(metadata!.value).toBe('value');
    expect(metadata!.key).toBe('key');
  });

  test('should return null for non-existent keys', async () => {
    const metadata = await provider.get('nonexistent');
    expect(metadata).toBeNull();
  });

  test('should check if key exists', async () => {
    await provider.set('key', 'value');

    const exists = await provider.has('key');
    expect(exists).toBe(true);

    const notExists = await provider.has('nonexistent');
    expect(notExists).toBe(false);
  });

  test('should delete keys', async () => {
    await provider.set('key', 'value');

    const deleted = await provider.delete('key');
    expect(deleted).toBe(true);

    const exists = await provider.has('key');
    expect(exists).toBe(false);
  });

  test('should get all preferences', async () => {
    await provider.set('key1', 'value1');
    await provider.set('key2', 'value2');

    const all = await provider.getAll();
    expect(all.size).toBe(2);
  });

  test('should clear all preferences', async () => {
    await provider.set('key1', 'value1');
    await provider.set('key2', 'value2');

    await provider.clear();

    expect(provider.size()).toBe(0);
  });

  test('should import and export data', async () => {
    const data = {
      theme: 'dark',
      fontSize: 14,
      enabled: true,
    };

    await provider.import(data);

    const exported = provider.export();
    expect(exported).toEqual(data);
  });
});
