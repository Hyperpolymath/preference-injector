import { PreferenceMetadata, ConflictResolution, PreferenceValue, PreferenceObject } from '../types';
import { ConflictError } from '../errors';

/**
 * Resolve conflicts between multiple preference sources
 */
export class ConflictResolver {
  /**
   * Resolve a conflict using the specified strategy
   */
  static resolve(
    conflicts: PreferenceMetadata[],
    strategy: ConflictResolution
  ): PreferenceMetadata {
    if (conflicts.length === 0) {
      throw new ConflictError(
        'unknown',
        conflicts.map((c) => c.source)
      );
    }

    if (conflicts.length === 1) {
      return conflicts[0];
    }

    switch (strategy) {
      case ConflictResolution.HIGHEST_PRIORITY:
        return this.resolveByHighestPriority(conflicts);

      case ConflictResolution.LOWEST_PRIORITY:
        return this.resolveByLowestPriority(conflicts);

      case ConflictResolution.MERGE:
        return this.resolveByMerge(conflicts);

      case ConflictResolution.OVERRIDE:
        return this.resolveByOverride(conflicts);

      case ConflictResolution.ERROR:
        throw new ConflictError(
          conflicts[0].key,
          conflicts.map((c) => c.source)
        );

      default:
        throw new Error(`Unknown conflict resolution strategy: ${strategy}`);
    }
  }

  /**
   * Resolve by highest priority (default)
   */
  private static resolveByHighestPriority(conflicts: PreferenceMetadata[]): PreferenceMetadata {
    return conflicts.reduce((highest, current) => {
      if (current.priority > highest.priority) {
        return current;
      }
      // If priorities are equal, use most recent
      if (current.priority === highest.priority && current.timestamp > highest.timestamp) {
        return current;
      }
      return highest;
    });
  }

  /**
   * Resolve by lowest priority
   */
  private static resolveByLowestPriority(conflicts: PreferenceMetadata[]): PreferenceMetadata {
    return conflicts.reduce((lowest, current) => {
      if (current.priority < lowest.priority) {
        return current;
      }
      // If priorities are equal, use oldest
      if (current.priority === lowest.priority && current.timestamp < lowest.timestamp) {
        return current;
      }
      return lowest;
    });
  }

  /**
   * Resolve by merging (for object values)
   */
  private static resolveByMerge(conflicts: PreferenceMetadata[]): PreferenceMetadata {
    // Sort by priority (lowest to highest) so higher priority values override
    const sorted = [...conflicts].sort((a, b) => {
      if (a.priority !== b.priority) {
        return a.priority - b.priority;
      }
      return a.timestamp.getTime() - b.timestamp.getTime();
    });

    const mergedValue = this.deepMerge(sorted.map((c) => c.value));
    const highestPriority = sorted[sorted.length - 1];

    return {
      ...highestPriority,
      value: mergedValue,
      source: `merged[${sorted.map((c) => c.source).join(',')}]`,
    };
  }

  /**
   * Resolve by override (last one wins)
   */
  private static resolveByOverride(conflicts: PreferenceMetadata[]): PreferenceMetadata {
    return conflicts.reduce((latest, current) => {
      return current.timestamp > latest.timestamp ? current : latest;
    });
  }

  /**
   * Deep merge preference values
   */
  private static deepMerge(values: PreferenceValue[]): PreferenceValue {
    // If any value is not an object, return the last value
    const allObjects = values.every(
      (v) => typeof v === 'object' && v !== null && !Array.isArray(v)
    );

    if (!allObjects) {
      return values[values.length - 1];
    }

    const result: PreferenceObject = {};

    for (const value of values) {
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        for (const [key, val] of Object.entries(value)) {
          if (
            typeof val === 'object' &&
            val !== null &&
            !Array.isArray(val) &&
            typeof result[key] === 'object' &&
            result[key] !== null &&
            !Array.isArray(result[key])
          ) {
            result[key] = this.deepMerge([result[key], val]);
          } else {
            result[key] = val;
          }
        }
      }
    }

    return result;
  }
}
