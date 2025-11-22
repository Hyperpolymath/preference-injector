import {
  PreferenceProvider,
  PreferenceMetadata,
  PreferenceValue,
  PreferencePriority,
  SetOptions,
  EnvProviderConfig,
} from '../types';

/**
 * Environment variable preference provider
 */
export class EnvProvider implements PreferenceProvider {
  readonly name = 'env';
  readonly priority: PreferencePriority;
  private readonly prefix: string;
  private readonly parseValues: boolean;

  constructor(config?: EnvProviderConfig) {
    this.priority = config?.priority || PreferencePriority.HIGH;
    this.prefix = config?.prefix || '';
    this.parseValues = config?.parseValues !== false;
  }

  async initialize(): Promise<void> {
    // No initialization needed for env provider
  }

  async get(key: string): Promise<PreferenceMetadata | null> {
    const envKey = this.toEnvKey(key);
    const value = process.env[envKey];

    if (value === undefined) {
      return null;
    }

    return {
      key,
      value: this.parseValues ? this.parseValue(value) : value,
      priority: this.priority,
      source: this.name,
      timestamp: new Date(),
    };
  }

  async getAll(): Promise<Map<string, PreferenceMetadata>> {
    const preferences = new Map<string, PreferenceMetadata>();

    for (const [envKey, value] of Object.entries(process.env)) {
      if (this.prefix && !envKey.startsWith(this.prefix)) {
        continue;
      }

      const key = this.fromEnvKey(envKey);

      preferences.set(key, {
        key,
        value: this.parseValues ? this.parseValue(value || '') : value || '',
        priority: this.priority,
        source: this.name,
        timestamp: new Date(),
      });
    }

    return preferences;
  }

  async set(key: string, value: PreferenceValue, options?: SetOptions): Promise<void> {
    const envKey = this.toEnvKey(key);
    process.env[envKey] = this.stringifyValue(value);
  }

  async has(key: string): Promise<boolean> {
    const envKey = this.toEnvKey(key);
    return process.env[envKey] !== undefined;
  }

  async delete(key: string): Promise<boolean> {
    const envKey = this.toEnvKey(key);
    const existed = process.env[envKey] !== undefined;
    delete process.env[envKey];
    return existed;
  }

  async clear(): Promise<void> {
    // Clear only prefixed environment variables
    for (const key of Object.keys(process.env)) {
      if (this.prefix && key.startsWith(this.prefix)) {
        delete process.env[key];
      }
    }
  }

  /**
   * Convert preference key to environment variable key
   */
  private toEnvKey(key: string): string {
    // Convert camelCase or kebab-case to UPPER_SNAKE_CASE
    const snakeCase = key
      .replace(/([a-z])([A-Z])/g, '$1_$2')
      .replace(/-/g, '_')
      .toUpperCase();

    return this.prefix ? `${this.prefix}${snakeCase}` : snakeCase;
  }

  /**
   * Convert environment variable key to preference key
   */
  private fromEnvKey(envKey: string): string {
    let key = envKey;

    if (this.prefix && key.startsWith(this.prefix)) {
      key = key.slice(this.prefix.length);
    }

    // Convert UPPER_SNAKE_CASE to camelCase
    return key
      .toLowerCase()
      .replace(/_([a-z])/g, (_, char) => (char as string).toUpperCase());
  }

  /**
   * Parse string value to appropriate type
   */
  private parseValue(value: string): PreferenceValue {
    // Handle special values
    if (value === 'null') return null;
    if (value === 'true') return true;
    if (value === 'false') return false;
    if (value === 'undefined') return null;

    // Try to parse as number
    const num = Number(value);
    if (!isNaN(num) && value.trim() !== '' && /^-?\d+\.?\d*$/.test(value)) {
      return num;
    }

    // Try to parse as JSON (for objects and arrays)
    if (value.startsWith('{') || value.startsWith('[')) {
      try {
        return JSON.parse(value) as PreferenceValue;
      } catch {
        // If parsing fails, return as string
      }
    }

    return value;
  }

  /**
   * Convert value to string for environment variable
   */
  private stringifyValue(value: PreferenceValue): string {
    if (value === null || value === undefined) {
      return '';
    }

    if (typeof value === 'string') {
      return value;
    }

    if (typeof value === 'number' || typeof value === 'boolean') {
      return String(value);
    }

    // For objects and arrays, use JSON
    return JSON.stringify(value);
  }

  /**
   * Load environment variables from a .env file
   */
  static async loadFromFile(filePath: string): Promise<void> {
    const { config } = await import('dotenv');
    config({ path: filePath });
  }
}
