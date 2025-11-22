import { readFile, writeFile, watch } from 'fs/promises';
import { existsSync } from 'fs';
import {
  PreferenceProvider,
  PreferenceMetadata,
  PreferenceValue,
  PreferencePriority,
  SetOptions,
  FileProviderConfig,
} from '../types';
import { ProviderError, ProviderInitializationError } from '../errors';

/**
 * File-based preference provider with support for JSON and environment files
 */
export class FileProvider implements PreferenceProvider {
  readonly name = 'file';
  readonly priority: PreferencePriority;
  private preferences: Map<string, PreferenceMetadata> = new Map();
  private watcher: AsyncIterator<unknown> | null = null;

  constructor(private readonly config: FileProviderConfig) {
    this.priority = config.priority || PreferencePriority.NORMAL;
  }

  async initialize(): Promise<void> {
    try {
      await this.loadFile();

      if (this.config.watchForChanges) {
        void this.watchFile();
      }
    } catch (error) {
      throw new ProviderInitializationError(this.name, error as Error);
    }
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

    // Write back to file
    await this.writeFile();
  }

  async has(key: string): Promise<boolean> {
    return this.preferences.has(key);
  }

  async delete(key: string): Promise<boolean> {
    const deleted = this.preferences.delete(key);

    if (deleted) {
      await this.writeFile();
    }

    return deleted;
  }

  async clear(): Promise<void> {
    this.preferences.clear();
    await this.writeFile();
  }

  /**
   * Reload preferences from file
   */
  async reload(): Promise<void> {
    await this.loadFile();
  }

  /**
   * Load preferences from file
   */
  private async loadFile(): Promise<void> {
    if (!existsSync(this.config.filePath)) {
      // File doesn't exist, create empty preferences
      this.preferences.clear();
      return;
    }

    try {
      const content = await readFile(this.config.filePath, 'utf-8');
      const format = this.config.format || this.detectFormat();

      let data: Record<string, PreferenceValue>;

      switch (format) {
        case 'json':
          data = JSON.parse(content) as Record<string, PreferenceValue>;
          break;

        case 'env':
          data = this.parseEnvFile(content);
          break;

        default:
          throw new Error(`Unsupported file format: ${format}`);
      }

      this.preferences.clear();

      for (const [key, value] of Object.entries(data)) {
        this.preferences.set(key, {
          key,
          value,
          priority: this.priority,
          source: this.name,
          timestamp: new Date(),
        });
      }
    } catch (error) {
      throw new ProviderError(this.name, 'load', error as Error);
    }
  }

  /**
   * Write preferences to file
   */
  private async writeFile(): Promise<void> {
    try {
      const data: Record<string, PreferenceValue> = {};

      for (const [key, metadata] of this.preferences.entries()) {
        data[key] = metadata.value;
      }

      const format = this.config.format || this.detectFormat();
      let content: string;

      switch (format) {
        case 'json':
          content = JSON.stringify(data, null, 2);
          break;

        case 'env':
          content = this.stringifyEnvFile(data);
          break;

        default:
          throw new Error(`Unsupported file format: ${format}`);
      }

      await writeFile(this.config.filePath, content, 'utf-8');
    } catch (error) {
      throw new ProviderError(this.name, 'write', error as Error);
    }
  }

  /**
   * Detect file format from extension
   */
  private detectFormat(): 'json' | 'env' {
    const ext = this.config.filePath.split('.').pop()?.toLowerCase();

    if (ext === 'json') {
      return 'json';
    }

    if (ext === 'env' || this.config.filePath.endsWith('.env')) {
      return 'env';
    }

    return 'json'; // Default to JSON
  }

  /**
   * Parse .env file format
   */
  private parseEnvFile(content: string): Record<string, PreferenceValue> {
    const data: Record<string, PreferenceValue> = {};
    const lines = content.split('\n');

    for (const line of lines) {
      const trimmed = line.trim();

      // Skip empty lines and comments
      if (!trimmed || trimmed.startsWith('#')) {
        continue;
      }

      const match = trimmed.match(/^([^=]+)=(.*)$/);

      if (match) {
        const key = match[1].trim();
        let value: string = match[2].trim();

        // Remove quotes if present
        if ((value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }

        data[key] = this.parseValue(value);
      }
    }

    return data;
  }

  /**
   * Stringify to .env file format
   */
  private stringifyEnvFile(data: Record<string, PreferenceValue>): string {
    const lines: string[] = [];

    for (const [key, value] of Object.entries(data)) {
      const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
      lines.push(`${key}=${stringValue}`);
    }

    return lines.join('\n') + '\n';
  }

  /**
   * Parse string value to appropriate type
   */
  private parseValue(value: string): PreferenceValue {
    // Try to parse as JSON
    if (value === 'null') return null;
    if (value === 'true') return true;
    if (value === 'false') return false;

    // Try number
    const num = Number(value);
    if (!isNaN(num) && value === num.toString()) {
      return num;
    }

    // Try JSON object/array
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
   * Watch file for changes
   */
  private async watchFile(): Promise<void> {
    try {
      const watcher = watch(this.config.filePath);

      for await (const _event of watcher) {
        // Reload on any file change
        await this.loadFile();
      }
    } catch (error) {
      console.error('File watch error:', error);
    }
  }

  /**
   * Stop watching file
   */
  stopWatching(): void {
    if (this.watcher) {
      // Note: There's no direct way to stop an async iterator
      // In practice, this would be handled by aborting the watch controller
      this.watcher = null;
    }
  }
}
