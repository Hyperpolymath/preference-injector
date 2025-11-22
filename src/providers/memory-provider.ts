import {
  PreferenceProvider,
  PreferenceMetadata,
  PreferenceValue,
  PreferencePriority,
  SetOptions,
} from '../types';

/**
 * In-memory preference provider for runtime preferences
 */
export class MemoryProvider implements PreferenceProvider {
  readonly name = 'memory';
  readonly priority: PreferencePriority;
  private preferences: Map<string, PreferenceMetadata> = new Map();

  constructor(
    priority: PreferencePriority = PreferencePriority.NORMAL,
    initialValues?: Map<string, PreferenceValue>
  ) {
    this.priority = priority;

    if (initialValues) {
      for (const [key, value] of initialValues.entries()) {
        this.preferences.set(key, {
          key,
          value,
          priority: this.priority,
          source: this.name,
          timestamp: new Date(),
        });
      }
    }
  }

  async initialize(): Promise<void> {
    // No initialization needed for memory provider
  }

  async get(key: string): Promise<PreferenceMetadata | null> {
    return this.preferences.get(key) || null;
  }

  async getAll(): Promise<Map<string, PreferenceMetadata>> {
    return new Map(this.preferences);
  }

  async set(key: string, value: PreferenceValue, options?: SetOptions): Promise<void> {
    const metadata: PreferenceMetadata = {
      key,
      value,
      priority: options?.priority || this.priority,
      source: this.name,
      timestamp: new Date(),
      encrypted: options?.encrypt,
      validated: options?.validate,
      ttl: options?.ttl,
    };

    this.preferences.set(key, metadata);
  }

  async has(key: string): Promise<boolean> {
    return this.preferences.has(key);
  }

  async delete(key: string): Promise<boolean> {
    return this.preferences.delete(key);
  }

  async clear(): Promise<void> {
    this.preferences.clear();
  }

  /**
   * Get the number of preferences
   */
  size(): number {
    return this.preferences.size;
  }

  /**
   * Get all preference keys
   */
  keys(): string[] {
    return Array.from(this.preferences.keys());
  }

  /**
   * Get all preference values
   */
  values(): PreferenceValue[] {
    return Array.from(this.preferences.values()).map((m) => m.value);
  }

  /**
   * Import preferences from an object
   */
  async import(data: Record<string, PreferenceValue>): Promise<void> {
    for (const [key, value] of Object.entries(data)) {
      await this.set(key, value);
    }
  }

  /**
   * Export preferences to an object
   */
  export(): Record<string, PreferenceValue> {
    const result: Record<string, PreferenceValue> = {};

    for (const [key, metadata] of this.preferences.entries()) {
      result[key] = metadata.value;
    }

    return result;
  }
}
