import { Cache, PreferenceMetadata } from '../types';

/**
 * Cache entry with TTL support
 */
interface CacheEntry {
  value: PreferenceMetadata;
  expiresAt: number;
}

/**
 * In-memory LRU cache with TTL support for preference values
 */
export class LRUCache implements Cache {
  private cache: Map<string, CacheEntry>;
  private accessOrder: string[];

  constructor(
    private readonly maxSize: number = 1000,
    private readonly defaultTTL: number = 3600000 // 1 hour in ms
  ) {
    this.cache = new Map();
    this.accessOrder = [];
  }

  /**
   * Get a value from the cache
   */
  get(key: string): PreferenceMetadata | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.delete(key);
      return null;
    }

    // Update access order (move to end)
    this.updateAccessOrder(key);

    return entry.value;
  }

  /**
   * Set a value in the cache
   */
  set(key: string, value: PreferenceMetadata, ttl?: number): void {
    const expiresAt = Date.now() + (ttl || this.defaultTTL);

    // If key exists, remove from old position
    if (this.cache.has(key)) {
      this.removeFromAccessOrder(key);
    }

    // Add to cache
    this.cache.set(key, { value, expiresAt });
    this.accessOrder.push(key);

    // Evict if over max size
    if (this.cache.size > this.maxSize) {
      this.evictOldest();
    }
  }

  /**
   * Check if a key exists in the cache
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);

    if (!entry) {
      return false;
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Delete a key from the cache
   */
  delete(key: string): boolean {
    this.removeFromAccessOrder(key);
    return this.cache.delete(key);
  }

  /**
   * Clear the entire cache
   */
  clear(): void {
    this.cache.clear();
    this.accessOrder = [];
  }

  /**
   * Get the current size of the cache
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * Clean up expired entries
   */
  cleanup(): number {
    const now = Date.now();
    let removed = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.delete(key);
        removed++;
      }
    }

    return removed;
  }

  /**
   * Update access order for LRU
   */
  private updateAccessOrder(key: string): void {
    this.removeFromAccessOrder(key);
    this.accessOrder.push(key);
  }

  /**
   * Remove key from access order array
   */
  private removeFromAccessOrder(key: string): void {
    const index = this.accessOrder.indexOf(key);
    if (index !== -1) {
      this.accessOrder.splice(index, 1);
    }
  }

  /**
   * Evict the least recently used item
   */
  private evictOldest(): void {
    if (this.accessOrder.length === 0) {
      return;
    }

    const oldestKey = this.accessOrder[0];
    this.delete(oldestKey);
  }
}

/**
 * Simple time-based cache with automatic cleanup
 */
export class TTLCache implements Cache {
  private cache: Map<string, CacheEntry>;
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(
    private readonly defaultTTL: number = 3600000, // 1 hour in ms
    private readonly cleanupIntervalMs: number = 300000 // 5 minutes
  ) {
    this.cache = new Map();
    this.startCleanup();
  }

  get(key: string): PreferenceMetadata | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    if (Date.now() > entry.expiresAt) {
      this.delete(key);
      return null;
    }

    return entry.value;
  }

  set(key: string, value: PreferenceMetadata, ttl?: number): void {
    const expiresAt = Date.now() + (ttl || this.defaultTTL);
    this.cache.set(key, { value, expiresAt });
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);

    if (!entry) {
      return false;
    }

    if (Date.now() > entry.expiresAt) {
      this.delete(key);
      return false;
    }

    return true;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }

  /**
   * Start automatic cleanup of expired entries
   */
  private startCleanup(): void {
    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      for (const [key, entry] of this.cache.entries()) {
        if (now > entry.expiresAt) {
          this.delete(key);
        }
      }
    }, this.cleanupIntervalMs);
  }

  /**
   * Stop automatic cleanup (for cleanup/shutdown)
   */
  stopCleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }
}

/**
 * No-op cache implementation for when caching is disabled
 */
export class NoOpCache implements Cache {
  get(_key: string): PreferenceMetadata | null {
    return null;
  }

  set(_key: string, _value: PreferenceMetadata, _ttl?: number): void {
    // No-op
  }

  has(_key: string): boolean {
    return false;
  }

  delete(_key: string): boolean {
    return false;
  }

  clear(): void {
    // No-op
  }

  size(): number {
    return 0;
  }
}
