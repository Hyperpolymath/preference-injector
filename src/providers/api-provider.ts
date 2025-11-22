import {
  PreferenceProvider,
  PreferenceMetadata,
  PreferenceValue,
  PreferencePriority,
  SetOptions,
  ApiProviderConfig,
} from '../types';
import { ProviderError, ProviderInitializationError } from '../errors';

/**
 * API-based preference provider for remote configuration
 */
export class ApiProvider implements PreferenceProvider {
  readonly name = 'api';
  readonly priority: PreferencePriority;
  private cache: Map<string, PreferenceMetadata> = new Map();

  constructor(private readonly config: ApiProviderConfig) {
    this.priority = config.priority || PreferencePriority.NORMAL;
  }

  async initialize(): Promise<void> {
    try {
      // Test connection by fetching all preferences
      await this.fetchAll();
    } catch (error) {
      throw new ProviderInitializationError(this.name, error as Error);
    }
  }

  async get(key: string): Promise<PreferenceMetadata | null> {
    try {
      const url = `${this.config.baseUrl}/preferences/${encodeURIComponent(key)}`;
      const response = await this.fetchWithRetry(url, { method: 'GET' });

      if (response.status === 404) {
        return null;
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = (await response.json()) as { value: PreferenceValue };

      const metadata: PreferenceMetadata = {
        key,
        value: data.value,
        priority: this.priority,
        source: this.name,
        timestamp: new Date(),
      };

      this.cache.set(key, metadata);
      return metadata;
    } catch (error) {
      throw new ProviderError(this.name, 'get', error as Error);
    }
  }

  async getAll(): Promise<Map<string, PreferenceMetadata>> {
    try {
      await this.fetchAll();
      return new Map(this.cache);
    } catch (error) {
      throw new ProviderError(this.name, 'getAll', error as Error);
    }
  }

  async set(key: string, value: PreferenceValue, options?: SetOptions): Promise<void> {
    try {
      const url = `${this.config.baseUrl}/preferences/${encodeURIComponent(key)}`;
      const response = await this.fetchWithRetry(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ value, options }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

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

      this.cache.set(key, metadata);
    } catch (error) {
      throw new ProviderError(this.name, 'set', error as Error);
    }
  }

  async has(key: string): Promise<boolean> {
    try {
      const url = `${this.config.baseUrl}/preferences/${encodeURIComponent(key)}`;
      const response = await this.fetchWithRetry(url, { method: 'HEAD' });
      return response.ok;
    } catch (error) {
      throw new ProviderError(this.name, 'has', error as Error);
    }
  }

  async delete(key: string): Promise<boolean> {
    try {
      const url = `${this.config.baseUrl}/preferences/${encodeURIComponent(key)}`;
      const response = await this.fetchWithRetry(url, { method: 'DELETE' });

      if (response.status === 404) {
        return false;
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      this.cache.delete(key);
      return true;
    } catch (error) {
      throw new ProviderError(this.name, 'delete', error as Error);
    }
  }

  async clear(): Promise<void> {
    try {
      const url = `${this.config.baseUrl}/preferences`;
      const response = await this.fetchWithRetry(url, { method: 'DELETE' });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      this.cache.clear();
    } catch (error) {
      throw new ProviderError(this.name, 'clear', error as Error);
    }
  }

  /**
   * Fetch all preferences from the API
   */
  private async fetchAll(): Promise<void> {
    const url = `${this.config.baseUrl}/preferences`;
    const response = await this.fetchWithRetry(url, { method: 'GET' });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = (await response.json()) as Record<string, PreferenceValue>;

    this.cache.clear();

    for (const [key, value] of Object.entries(data)) {
      this.cache.set(key, {
        key,
        value,
        priority: this.priority,
        source: this.name,
        timestamp: new Date(),
      });
    }
  }

  /**
   * Fetch with retry logic
   */
  private async fetchWithRetry(
    url: string,
    options: RequestInit,
    attempt: number = 0
  ): Promise<Response> {
    const headers = {
      ...this.config.headers,
      ...options.headers,
    };

    if (this.config.apiKey) {
      headers['Authorization'] = `Bearer ${this.config.apiKey}`;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => {
      controller.abort();
    }, this.config.timeout || 5000);

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });

      return response;
    } catch (error) {
      const maxRetries = this.config.retries || 3;

      if (attempt < maxRetries) {
        // Exponential backoff
        const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
        await new Promise((resolve) => setTimeout(resolve, delay));
        return this.fetchWithRetry(url, options, attempt + 1);
      }

      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }

  /**
   * Clear local cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Refresh cache from API
   */
  async refresh(): Promise<void> {
    await this.fetchAll();
  }
}
