import { AuditLogger, AuditLogEntry, AuditFilter, AuditAction } from '../types';

/**
 * In-memory audit logger for tracking preference operations
 */
export class InMemoryAuditLogger implements AuditLogger {
  private entries: AuditLogEntry[] = [];

  constructor(private readonly maxEntries: number = 10000) {}

  /**
   * Log an audit entry
   */
  log(entry: AuditLogEntry): void {
    this.entries.push({
      ...entry,
      timestamp: entry.timestamp || new Date(),
    });

    // Trim if exceeding max entries
    if (this.entries.length > this.maxEntries) {
      this.entries = this.entries.slice(-this.maxEntries);
    }
  }

  /**
   * Get entries with optional filtering
   */
  getEntries(filter?: AuditFilter): AuditLogEntry[] {
    if (!filter) {
      return [...this.entries];
    }

    return this.entries.filter((entry) => {
      if (filter.action && entry.action !== filter.action) {
        return false;
      }

      if (filter.key && entry.key !== filter.key) {
        return false;
      }

      if (filter.provider && entry.provider !== filter.provider) {
        return false;
      }

      if (filter.userId && entry.userId !== filter.userId) {
        return false;
      }

      if (filter.startDate && entry.timestamp < filter.startDate) {
        return false;
      }

      if (filter.endDate && entry.timestamp > filter.endDate) {
        return false;
      }

      return true;
    });
  }

  /**
   * Clear all audit entries
   */
  clear(): void {
    this.entries = [];
  }

  /**
   * Get total number of entries
   */
  count(): number {
    return this.entries.length;
  }

  /**
   * Get entries by action type
   */
  getByAction(action: AuditAction): AuditLogEntry[] {
    return this.getEntries({ action });
  }

  /**
   * Get entries by key
   */
  getByKey(key: string): AuditLogEntry[] {
    return this.getEntries({ key });
  }

  /**
   * Get entries by provider
   */
  getByProvider(provider: string): AuditLogEntry[] {
    return this.getEntries({ provider });
  }

  /**
   * Get entries within a time range
   */
  getByTimeRange(startDate: Date, endDate: Date): AuditLogEntry[] {
    return this.getEntries({ startDate, endDate });
  }

  /**
   * Export entries as JSON
   */
  export(): string {
    return JSON.stringify(this.entries, null, 2);
  }

  /**
   * Import entries from JSON
   */
  import(json: string): void {
    try {
      const imported = JSON.parse(json) as AuditLogEntry[];
      this.entries = imported.map((entry) => ({
        ...entry,
        timestamp: new Date(entry.timestamp),
      }));
    } catch (error) {
      throw new Error(`Failed to import audit log: ${(error as Error).message}`);
    }
  }
}

/**
 * Console-based audit logger for development
 */
export class ConsoleAuditLogger implements AuditLogger {
  log(entry: AuditLogEntry): void {
    const timestamp = entry.timestamp.toISOString();
    const message = `[${timestamp}] ${entry.action.toUpperCase()} ${entry.key} (${entry.provider})`;

    if (entry.value !== undefined) {
      console.warn(`${message} -> ${JSON.stringify(entry.value)}`);
    } else {
      console.warn(message);
    }
  }

  getEntries(_filter?: AuditFilter): AuditLogEntry[] {
    console.warn('ConsoleAuditLogger does not store entries');
    return [];
  }

  clear(): void {
    // No-op for console logger
  }
}

/**
 * No-op audit logger for when auditing is disabled
 */
export class NoOpAuditLogger implements AuditLogger {
  log(_entry: AuditLogEntry): void {
    // No-op
  }

  getEntries(_filter?: AuditFilter): AuditLogEntry[] {
    return [];
  }

  clear(): void {
    // No-op
  }
}

/**
 * File-based audit logger (writes to file asynchronously)
 */
export class FileAuditLogger implements AuditLogger {
  private entries: AuditLogEntry[] = [];
  private writeQueue: AuditLogEntry[] = [];
  private writeTimer: NodeJS.Timeout | null = null;

  constructor(
    private readonly filePath: string,
    private readonly flushInterval: number = 5000, // 5 seconds
    private readonly maxEntries: number = 10000
  ) {
    this.startPeriodicFlush();
  }

  log(entry: AuditLogEntry): void {
    const fullEntry = {
      ...entry,
      timestamp: entry.timestamp || new Date(),
    };

    this.entries.push(fullEntry);
    this.writeQueue.push(fullEntry);

    // Trim if exceeding max entries
    if (this.entries.length > this.maxEntries) {
      this.entries = this.entries.slice(-this.maxEntries);
    }
  }

  getEntries(filter?: AuditFilter): AuditLogEntry[] {
    if (!filter) {
      return [...this.entries];
    }

    return this.entries.filter((entry) => {
      if (filter.action && entry.action !== filter.action) return false;
      if (filter.key && entry.key !== filter.key) return false;
      if (filter.provider && entry.provider !== filter.provider) return false;
      if (filter.userId && entry.userId !== filter.userId) return false;
      if (filter.startDate && entry.timestamp < filter.startDate) return false;
      if (filter.endDate && entry.timestamp > filter.endDate) return false;
      return true;
    });
  }

  clear(): void {
    this.entries = [];
    this.writeQueue = [];
  }

  /**
   * Flush queued entries to file
   */
  async flush(): Promise<void> {
    if (this.writeQueue.length === 0) {
      return;
    }

    const { writeFile } = await import('fs/promises');
    const entriesToWrite = [...this.writeQueue];
    this.writeQueue = [];

    try {
      const content = entriesToWrite.map((entry) => JSON.stringify(entry)).join('\n') + '\n';
      await writeFile(this.filePath, content, { flag: 'a' });
    } catch (error) {
      console.error('Failed to write audit log:', error);
      // Re-queue failed entries
      this.writeQueue.unshift(...entriesToWrite);
    }
  }

  /**
   * Start periodic flushing
   */
  private startPeriodicFlush(): void {
    this.writeTimer = setInterval(() => {
      void this.flush();
    }, this.flushInterval);
  }

  /**
   * Stop periodic flushing and flush remaining entries
   */
  async stop(): Promise<void> {
    if (this.writeTimer) {
      clearInterval(this.writeTimer);
      this.writeTimer = null;
    }
    await this.flush();
  }
}
