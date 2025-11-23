/**
 * Offline-First Storage Layer using IndexedDB
 * Provides local-first data persistence with sync capabilities
 */

import { PreferenceMetadata, PreferenceValue } from '../types/index.ts';

export interface OfflineStorageConfig {
  dbName: string;
  version: number;
  storeName: string;
  syncEndpoint?: string;
  syncInterval?: number;
}

export class OfflineStorage {
  private db: IDBDatabase | null = null;
  private config: OfflineStorageConfig;
  private syncTimer: number | null = null;

  constructor(config: OfflineStorageConfig) {
    this.config = {
      dbName: 'preference-injector',
      version: 1,
      storeName: 'preferences',
      syncInterval: 30000, // 30 seconds
      ...config,
    };
  }

  /**
   * Initialize IndexedDB connection
   */
  async initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.config.dbName, this.config.version);

      request.onerror = () => reject(new Error('Failed to open IndexedDB'));

      request.onsuccess = () => {
        this.db = request.result;
        this.startSync();
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object store if it doesn't exist
        if (!db.objectStoreNames.contains(this.config.storeName)) {
          const store = db.createObjectStore(this.config.storeName, { keyPath: 'key' });
          store.createIndex('timestamp', 'timestamp', { unique: false });
          store.createIndex('source', 'source', { unique: false });
        }
      };
    });
  }

  /**
   * Get preference from local storage
   */
  async get(key: string): Promise<PreferenceMetadata | null> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.config.storeName], 'readonly');
      const store = transaction.objectStore(this.config.storeName);
      const request = store.get(key);

      request.onsuccess = () => {
        const result = request.result;
        if (result) {
          resolve({
            ...result,
            timestamp: new Date(result.timestamp),
          });
        } else {
          resolve(null);
        }
      };

      request.onerror = () => reject(new Error(`Failed to get key: ${key}`));
    });
  }

  /**
   * Get all preferences from local storage
   */
  async getAll(): Promise<Map<string, PreferenceMetadata>> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.config.storeName], 'readonly');
      const store = transaction.objectStore(this.config.storeName);
      const request = store.getAll();

      request.onsuccess = () => {
        const results = request.result;
        const map = new Map<string, PreferenceMetadata>();

        for (const item of results) {
          map.set(item.key, {
            ...item,
            timestamp: new Date(item.timestamp),
          });
        }

        resolve(map);
      };

      request.onerror = () => reject(new Error('Failed to get all preferences'));
    });
  }

  /**
   * Set preference in local storage
   */
  async set(metadata: PreferenceMetadata): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.config.storeName], 'readwrite');
      const store = transaction.objectStore(this.config.storeName);

      const record = {
        ...metadata,
        timestamp: metadata.timestamp.toISOString(),
        _syncStatus: 'pending' as const,
      };

      const request = store.put(record);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error(`Failed to set key: ${metadata.key}`));
    });
  }

  /**
   * Delete preference from local storage
   */
  async delete(key: string): Promise<boolean> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.config.storeName], 'readwrite');
      const store = transaction.objectStore(this.config.storeName);
      const request = store.delete(key);

      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(new Error(`Failed to delete key: ${key}`));
    });
  }

  /**
   * Clear all preferences from local storage
   */
  async clear(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.config.storeName], 'readwrite');
      const store = transaction.objectStore(this.config.storeName);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('Failed to clear preferences'));
    });
  }

  /**
   * Sync local changes to remote server
   */
  async sync(): Promise<{ uploaded: number; downloaded: number }> {
    if (!this.config.syncEndpoint) {
      return { uploaded: 0, downloaded: 0 };
    }

    let uploaded = 0;
    let downloaded = 0;

    try {
      // Get all pending changes
      const pending = await this.getPendingSync();

      if (pending.length > 0) {
        // Upload changes to server
        const response = await fetch(`${this.config.syncEndpoint}/sync`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ changes: pending }),
        });

        if (response.ok) {
          uploaded = pending.length;
          await this.markSynced(pending.map((p) => p.key));
        }
      }

      // Download changes from server
      const lastSync = await this.getLastSyncTime();
      const downloadResponse = await fetch(
        `${this.config.syncEndpoint}/sync?since=${lastSync.toISOString()}`
      );

      if (downloadResponse.ok) {
        const { changes } = await downloadResponse.json();

        for (const change of changes) {
          await this.set(change);
          downloaded++;
        }

        await this.setLastSyncTime(new Date());
      }
    } catch (error) {
      console.error('Sync failed:', error);
    }

    return { uploaded, downloaded };
  }

  /**
   * Get preferences pending sync
   */
  private async getPendingSync(): Promise<PreferenceMetadata[]> {
    if (!this.db) return [];

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.config.storeName], 'readonly');
      const store = transaction.objectStore(this.config.storeName);
      const request = store.getAll();

      request.onsuccess = () => {
        const results = request.result;
        const pending = results.filter((r) => r._syncStatus === 'pending');
        resolve(pending);
      };

      request.onerror = () => reject(new Error('Failed to get pending sync'));
    });
  }

  /**
   * Mark preferences as synced
   */
  private async markSynced(keys: string[]): Promise<void> {
    if (!this.db) return;

    const transaction = this.db.transaction([this.config.storeName], 'readwrite');
    const store = transaction.objectStore(this.config.storeName);

    for (const key of keys) {
      const request = store.get(key);

      request.onsuccess = () => {
        const record = request.result;
        if (record) {
          record._syncStatus = 'synced';
          store.put(record);
        }
      };
    }
  }

  /**
   * Get last sync timestamp
   */
  private async getLastSyncTime(): Promise<Date> {
    const stored = localStorage.getItem('preference-injector:lastSync');
    return stored ? new Date(stored) : new Date(0);
  }

  /**
   * Set last sync timestamp
   */
  private async setLastSyncTime(time: Date): Promise<void> {
    localStorage.setItem('preference-injector:lastSync', time.toISOString());
  }

  /**
   * Start periodic sync
   */
  private startSync(): void {
    if (this.config.syncEndpoint && this.config.syncInterval) {
      this.syncTimer = setInterval(() => {
        void this.sync();
      }, this.config.syncInterval);
    }
  }

  /**
   * Stop periodic sync
   */
  stopSync(): void {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = null;
    }
  }

  /**
   * Close database connection
   */
  close(): void {
    this.stopSync();
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
}

/**
 * Offline-first preference provider using IndexedDB
 */
export class OfflineProvider {
  private storage: OfflineStorage;

  constructor(config: Partial<OfflineStorageConfig> = {}) {
    this.storage = new OfflineStorage({
      dbName: 'preference-injector',
      version: 1,
      storeName: 'preferences',
      ...config,
    });
  }

  async initialize(): Promise<void> {
    await this.storage.initialize();
  }

  async get(key: string): Promise<PreferenceMetadata | null> {
    return await this.storage.get(key);
  }

  async getAll(): Promise<Map<string, PreferenceMetadata>> {
    return await this.storage.getAll();
  }

  async set(key: string, value: PreferenceValue): Promise<void> {
    const metadata: PreferenceMetadata = {
      key,
      value,
      priority: 50,
      source: 'offline',
      timestamp: new Date(),
    };

    await this.storage.set(metadata);
  }

  async delete(key: string): Promise<boolean> {
    return await this.storage.delete(key);
  }

  async clear(): Promise<void> {
    await this.storage.clear();
  }

  async sync(): Promise<{ uploaded: number; downloaded: number }> {
    return await this.storage.sync();
  }

  close(): void {
    this.storage.close();
  }
}
