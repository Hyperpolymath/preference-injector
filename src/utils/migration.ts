import { Migration, PreferenceMetadata } from '../types';
import { MigrationError } from '../errors';

/**
 * Migration manager for versioned preference schemas
 */
export class MigrationManager {
  private migrations: Map<number, Migration> = new Map();
  private currentVersion = 0;

  /**
   * Register a migration
   */
  register(migration: Migration): void {
    if (this.migrations.has(migration.version)) {
      throw new Error(`Migration for version ${migration.version} already exists`);
    }

    this.migrations.set(migration.version, migration);

    // Update current version if this migration is newer
    if (migration.version > this.currentVersion) {
      this.currentVersion = migration.version;
    }
  }

  /**
   * Migrate preferences to a target version
   */
  async migrate(
    preferences: Map<string, PreferenceMetadata>,
    fromVersion: number,
    toVersion: number
  ): Promise<Map<string, PreferenceMetadata>> {
    if (fromVersion === toVersion) {
      return preferences;
    }

    const direction: 'up' | 'down' = fromVersion < toVersion ? 'up' : 'down';
    let current = preferences;

    if (direction === 'up') {
      // Migrate up
      for (let version = fromVersion + 1; version <= toVersion; version++) {
        const migration = this.migrations.get(version);

        if (!migration) {
          throw new MigrationError(version, 'up', new Error('Migration not found'));
        }

        try {
          current = await migration.up(current);
        } catch (error) {
          throw new MigrationError(version, 'up', error as Error);
        }
      }
    } else {
      // Migrate down
      for (let version = fromVersion; version > toVersion; version--) {
        const migration = this.migrations.get(version);

        if (!migration) {
          throw new MigrationError(version, 'down', new Error('Migration not found'));
        }

        try {
          current = await migration.down(current);
        } catch (error) {
          throw new MigrationError(version, 'down', error as Error);
        }
      }
    }

    return current;
  }

  /**
   * Migrate to the latest version
   */
  async migrateToLatest(
    preferences: Map<string, PreferenceMetadata>,
    fromVersion: number
  ): Promise<Map<string, PreferenceMetadata>> {
    return this.migrate(preferences, fromVersion, this.currentVersion);
  }

  /**
   * Get current version
   */
  getCurrentVersion(): number {
    return this.currentVersion;
  }

  /**
   * Get all registered migrations
   */
  getMigrations(): Migration[] {
    return Array.from(this.migrations.values()).sort((a, b) => a.version - b.version);
  }

  /**
   * Check if migration path exists
   */
  canMigrate(fromVersion: number, toVersion: number): boolean {
    const direction = fromVersion < toVersion ? 'up' : 'down';

    if (direction === 'up') {
      for (let version = fromVersion + 1; version <= toVersion; version++) {
        if (!this.migrations.has(version)) {
          return false;
        }
      }
    } else {
      for (let version = fromVersion; version > toVersion; version--) {
        if (!this.migrations.has(version)) {
          return false;
        }
      }
    }

    return true;
  }
}

/**
 * Common migration utilities
 */
export const MigrationHelpers = {
  /**
   * Rename a preference key
   */
  renameKey: (
    preferences: Map<string, PreferenceMetadata>,
    oldKey: string,
    newKey: string
  ): Map<string, PreferenceMetadata> => {
    const result = new Map(preferences);
    const value = result.get(oldKey);

    if (value) {
      result.delete(oldKey);
      result.set(newKey, { ...value, key: newKey });
    }

    return result;
  },

  /**
   * Remove a preference key
   */
  removeKey: (
    preferences: Map<string, PreferenceMetadata>,
    key: string
  ): Map<string, PreferenceMetadata> => {
    const result = new Map(preferences);
    result.delete(key);
    return result;
  },

  /**
   * Add a new preference with default value
   */
  addKey: (
    preferences: Map<string, PreferenceMetadata>,
    metadata: PreferenceMetadata
  ): Map<string, PreferenceMetadata> => {
    const result = new Map(preferences);
    result.set(metadata.key, metadata);
    return result;
  },

  /**
   * Transform a preference value
   */
  transformValue: (
    preferences: Map<string, PreferenceMetadata>,
    key: string,
    transformer: (value: unknown) => unknown
  ): Map<string, PreferenceMetadata> => {
    const result = new Map(preferences);
    const metadata = result.get(key);

    if (metadata) {
      result.set(key, {
        ...metadata,
        value: transformer(metadata.value),
      });
    }

    return result;
  },

  /**
   * Split a preference into multiple keys
   */
  splitKey: (
    preferences: Map<string, PreferenceMetadata>,
    sourceKey: string,
    splitter: (value: unknown) => Record<string, unknown>
  ): Map<string, PreferenceMetadata> => {
    const result = new Map(preferences);
    const metadata = result.get(sourceKey);

    if (metadata) {
      const split = splitter(metadata.value);

      result.delete(sourceKey);

      for (const [newKey, newValue] of Object.entries(split)) {
        result.set(newKey, {
          ...metadata,
          key: newKey,
          value: newValue,
        });
      }
    }

    return result;
  },

  /**
   * Merge multiple preferences into one
   */
  mergeKeys: (
    preferences: Map<string, PreferenceMetadata>,
    sourceKeys: string[],
    targetKey: string,
    merger: (values: unknown[]) => unknown
  ): Map<string, PreferenceMetadata> => {
    const result = new Map(preferences);
    const values: unknown[] = [];
    let latestMetadata: PreferenceMetadata | undefined;

    for (const key of sourceKeys) {
      const metadata = result.get(key);

      if (metadata) {
        values.push(metadata.value);

        if (!latestMetadata || metadata.timestamp > latestMetadata.timestamp) {
          latestMetadata = metadata;
        }

        result.delete(key);
      }
    }

    if (latestMetadata) {
      result.set(targetKey, {
        ...latestMetadata,
        key: targetKey,
        value: merger(values),
      });
    }

    return result;
  },
};

/**
 * Create a simple migration
 */
export function createMigration(
  version: number,
  name: string,
  up: (preferences: Map<string, PreferenceMetadata>) => Promise<Map<string, PreferenceMetadata>>,
  down: (preferences: Map<string, PreferenceMetadata>) => Promise<Map<string, PreferenceMetadata>>
): Migration {
  return {
    version,
    name,
    up,
    down,
  };
}
