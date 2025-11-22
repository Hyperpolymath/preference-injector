/**
 * Express middleware for preference injection
 */

import { Request, Response, NextFunction } from 'express';
import { PreferenceInjector } from '../core/injector';
import { PreferenceValue, SetOptions } from '../types';

/**
 * Extend Express Request to include preferences
 */
declare global {
  namespace Express {
    interface Request {
      preferences?: PreferenceInjector;
      getPreference?: <T extends PreferenceValue = PreferenceValue>(
        key: string,
        defaultValue?: T
      ) => Promise<T>;
      setPreference?: (key: string, value: PreferenceValue, options?: SetOptions) => Promise<void>;
      hasPreference?: (key: string) => Promise<boolean>;
      deletePreference?: (key: string) => Promise<boolean>;
    }
  }
}

/**
 * Options for preference middleware
 */
export interface PreferenceMiddlewareOptions {
  injector: PreferenceInjector;
  attachHelpers?: boolean;
  initializeOnStartup?: boolean;
}

/**
 * Create Express middleware for preference injection
 */
export function preferenceMiddleware(
  options: PreferenceMiddlewareOptions
): (req: Request, res: Response, next: NextFunction) => void {
  const { injector, attachHelpers = true, initializeOnStartup = true } = options;

  // Initialize on startup if requested
  if (initializeOnStartup) {
    void injector.initialize();
  }

  return (req: Request, _res: Response, next: NextFunction): void => {
    // Attach injector to request
    req.preferences = injector;

    // Attach helper methods if requested
    if (attachHelpers) {
      req.getPreference = async <T extends PreferenceValue = PreferenceValue>(
        key: string,
        defaultValue?: T
      ): Promise<T> => {
        return injector.getTyped<T>(key, { defaultValue });
      };

      req.setPreference = async (
        key: string,
        value: PreferenceValue,
        setOptions?: SetOptions
      ): Promise<void> => {
        await injector.set(key, value, setOptions);
      };

      req.hasPreference = async (key: string): Promise<boolean> => {
        return injector.has(key);
      };

      req.deletePreference = async (key: string): Promise<boolean> => {
        return injector.delete(key);
      };
    }

    next();
  };
}

/**
 * Create a REST API router for preference management
 */
export function createPreferenceRouter(injector: PreferenceInjector) {
  const router = require('express').Router();

  // Get all preferences
  router.get('/preferences', async (_req: Request, res: Response): Promise<void> => {
    try {
      const preferences = await injector.getAll();
      const result: Record<string, PreferenceValue> = {};

      for (const [key, value] of preferences.entries()) {
        result[key] = value;
      }

      res.json(result);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  // Get a single preference
  router.get('/preferences/:key', async (req: Request, res: Response): Promise<void> => {
    try {
      const value = await injector.get(req.params.key);
      res.json({ value });
    } catch (error) {
      res.status(404).json({ error: 'Preference not found' });
    }
  });

  // Set a preference
  router.put('/preferences/:key', async (req: Request, res: Response): Promise<void> => {
    try {
      const { value, options } = req.body;
      await injector.set(req.params.key, value, options);
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  });

  // Delete a preference
  router.delete('/preferences/:key', async (req: Request, res: Response): Promise<void> => {
    try {
      const deleted = await injector.delete(req.params.key);

      if (deleted) {
        res.json({ success: true });
      } else {
        res.status(404).json({ error: 'Preference not found' });
      }
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  // Check if preference exists
  router.head('/preferences/:key', async (req: Request, res: Response): Promise<void> => {
    try {
      const exists = await injector.has(req.params.key);
      res.status(exists ? 200 : 404).end();
    } catch (error) {
      res.status(500).end();
    }
  });

  // Clear all preferences
  router.delete('/preferences', async (_req: Request, res: Response): Promise<void> => {
    try {
      await injector.clear();
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  // Get audit log
  router.get('/preferences/_audit', async (_req: Request, res: Response): Promise<void> => {
    try {
      const auditLogger = injector.getAuditLogger();
      const entries = auditLogger.getEntries();
      res.json(entries);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  return router;
}

/**
 * User-specific preference middleware
 */
export interface UserPreferenceMiddlewareOptions {
  injector: PreferenceInjector;
  getUserId: (req: Request) => string | undefined;
}

/**
 * Create middleware for user-specific preferences
 */
export function userPreferenceMiddleware(
  options: UserPreferenceMiddlewareOptions
): (req: Request, res: Response, next: NextFunction) => void {
  const { injector, getUserId } = options;

  return (req: Request, _res: Response, next: NextFunction): void => {
    const userId = getUserId(req);

    if (!userId) {
      next();
      return;
    }

    // Attach user-specific preference helpers
    req.getPreference = async <T extends PreferenceValue = PreferenceValue>(
      key: string,
      defaultValue?: T
    ): Promise<T> => {
      const userKey = `user:${userId}:${key}`;
      return injector.getTyped<T>(userKey, { defaultValue });
    };

    req.setPreference = async (
      key: string,
      value: PreferenceValue,
      setOptions?: SetOptions
    ): Promise<void> => {
      const userKey = `user:${userId}:${key}`;
      await injector.set(userKey, value, setOptions);
    };

    req.hasPreference = async (key: string): Promise<boolean> => {
      const userKey = `user:${userId}:${key}`;
      return injector.has(userKey);
    };

    req.deletePreference = async (key: string): Promise<boolean> => {
      const userKey = `user:${userId}:${key}`;
      return injector.delete(userKey);
    };

    next();
  };
}
