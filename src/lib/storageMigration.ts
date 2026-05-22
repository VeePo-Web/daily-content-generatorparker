/**
 * localStorage Migration Utility
 * Migrates all 'linea-' prefixed keys to 'loj-' prefix
 * while preserving existing user data (cart, sizes, etc.)
 */

// Migration version - increment if adding new keys
const MIGRATION_VERSION = 'v1';
const MIGRATION_COMPLETE_KEY = `loj-migration-${MIGRATION_VERSION}`;

// Complete mapping of old keys to new keys
const KEY_MAPPINGS: Record<string, string> = {
  'linea-cart': 'loj-cart',
  'linea-size-memory': 'loj-size-memory',
  'linea-size-quiz-completed': 'loj-size-quiz-completed',
  'linea-recently-viewed': 'loj-recently-viewed',
  'linea-saved-for-later': 'loj-saved-for-later',
  'linea-abandoned-cart-email': 'loj-abandoned-cart-email',
  'linea-abandoned-cart-id': 'loj-abandoned-cart-id',
  'linea-behavior-cache': 'loj-behavior-cache',
  'linea-greeting-dismissed': 'loj-greeting-dismissed',
  'linea_body_profiles': 'loj_body_profiles',
};

export interface MigrationResult {
  success: boolean;
  alreadyMigrated: boolean;
  migrated: string[];
  skipped: string[];
  errors: string[];
}

/**
 * Run the localStorage migration.
 * Safe to call multiple times - uses a completion flag.
 */
export function migrateLocalStorage(): MigrationResult {
  const result: MigrationResult = {
    success: true,
    alreadyMigrated: false,
    migrated: [],
    skipped: [],
    errors: [],
  };

  try {
    // Check if migration already complete
    if (localStorage.getItem(MIGRATION_COMPLETE_KEY)) {
      result.alreadyMigrated = true;
      return result;
    }

    // Process each key mapping
    for (const [oldKey, newKey] of Object.entries(KEY_MAPPINGS)) {
      try {
        const oldValue = localStorage.getItem(oldKey);
        const newValue = localStorage.getItem(newKey);

        if (oldValue && !newValue) {
          // Old key exists, new key doesn't - migrate
          localStorage.setItem(newKey, oldValue);
          localStorage.removeItem(oldKey);
          result.migrated.push(oldKey);
        } else if (oldValue && newValue) {
          // Both exist - prefer most recent if we can determine it
          // For most data types, we'll keep the new key and remove old
          // This handles edge cases where migration partially ran
          localStorage.removeItem(oldKey);
          result.skipped.push(`${oldKey} (conflict resolved, kept new)`);
        } else if (!oldValue && newValue) {
          // Already migrated - skip
          result.skipped.push(`${oldKey} (already migrated)`);
        } else {
          // Neither exists - skip
          result.skipped.push(`${oldKey} (no data)`);
        }
      } catch (e) {
        const errorMsg = e instanceof Error ? e.message : 'Unknown error';
        result.errors.push(`${oldKey}: ${errorMsg}`);
        result.success = false;
      }
    }

    // Mark migration as complete
    localStorage.setItem(MIGRATION_COMPLETE_KEY, new Date().toISOString());

    // Log results in development
    if (import.meta.env.DEV && (result.migrated.length > 0 || result.errors.length > 0)) {
      console.log('[Storage Migration]', {
        migrated: result.migrated,
        skipped: result.skipped,
        errors: result.errors,
      });
    }

  } catch (e) {
    result.success = false;
    result.errors.push(e instanceof Error ? e.message : 'Migration failed');
  }

  return result;
}

/**
 * Get migration status without running migration
 */
export function getMigrationStatus(): { completed: boolean; completedAt: string | null } {
  const completedAt = localStorage.getItem(MIGRATION_COMPLETE_KEY);
  return {
    completed: !!completedAt,
    completedAt,
  };
}

/**
 * Rollback migration (emergency use only)
 * Call from browser console: window.__LOJ_ROLLBACK_MIGRATION()
 */
export function rollbackMigration(): MigrationResult {
  const result: MigrationResult = {
    success: true,
    alreadyMigrated: false,
    migrated: [],
    skipped: [],
    errors: [],
  };

  try {
    // Reverse each key mapping
    for (const [oldKey, newKey] of Object.entries(KEY_MAPPINGS)) {
      try {
        const newValue = localStorage.getItem(newKey);
        
        if (newValue) {
          localStorage.setItem(oldKey, newValue);
          localStorage.removeItem(newKey);
          result.migrated.push(`${newKey} -> ${oldKey}`);
        }
      } catch (e) {
        const errorMsg = e instanceof Error ? e.message : 'Unknown error';
        result.errors.push(`${newKey}: ${errorMsg}`);
        result.success = false;
      }
    }

    // Clear migration flag
    localStorage.removeItem(MIGRATION_COMPLETE_KEY);

    console.log('[Storage Migration Rollback]', result);
  } catch (e) {
    result.success = false;
    result.errors.push(e instanceof Error ? e.message : 'Rollback failed');
  }

  return result;
}

// Expose rollback function globally for emergency use
if (typeof window !== 'undefined') {
  (window as unknown as { __LOJ_ROLLBACK_MIGRATION: typeof rollbackMigration }).__LOJ_ROLLBACK_MIGRATION = rollbackMigration;
}
