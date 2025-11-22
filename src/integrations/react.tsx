/**
 * React integration for preference injection
 * Provides context provider and hooks for using preferences in React applications
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { PreferenceInjector } from '../core/injector';
import { PreferenceValue, GetOptions, SetOptions, PreferenceEvent } from '../types';

/**
 * Preference context
 */
interface PreferenceContextValue {
  injector: PreferenceInjector;
}

const PreferenceContext = createContext<PreferenceContextValue | null>(null);

/**
 * Preference provider props
 */
interface PreferenceProviderProps {
  injector: PreferenceInjector;
  children: React.ReactNode;
}

/**
 * Preference provider component
 */
export const PreferenceProvider: React.FC<PreferenceProviderProps> = ({ injector, children }) => {
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    void injector.initialize().then(() => {
      setInitialized(true);
    });
  }, [injector]);

  if (!initialized) {
    return null; // or a loading component
  }

  return (
    <PreferenceContext.Provider value={{ injector }}>{children}</PreferenceContext.Provider>
  );
};

/**
 * Hook to access the preference injector
 */
export function usePreferenceInjector(): PreferenceInjector {
  const context = useContext(PreferenceContext);

  if (!context) {
    throw new Error('usePreferenceInjector must be used within PreferenceProvider');
  }

  return context.injector;
}

/**
 * Hook to use a single preference value
 */
export function usePreference<T extends PreferenceValue = PreferenceValue>(
  key: string,
  defaultValue?: T,
  options?: GetOptions
): [T | undefined, (value: T, setOptions?: SetOptions) => Promise<void>, boolean] {
  const injector = usePreferenceInjector();
  const [value, setValue] = useState<T | undefined>(defaultValue);
  const [loading, setLoading] = useState(true);

  // Load initial value
  useEffect(() => {
    let mounted = true;

    void injector
      .get(key, { ...options, defaultValue })
      .then((v) => {
        if (mounted) {
          setValue(v as T);
          setLoading(false);
        }
      })
      .catch(() => {
        if (mounted) {
          setValue(defaultValue);
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [injector, key]);

  // Subscribe to changes
  useEffect(() => {
    const handleChange = (event: {
      type: PreferenceEvent;
      key: string;
      newValue?: PreferenceValue;
    }): void => {
      if (event.key === key) {
        setValue(event.newValue as T);
      }
    };

    injector.on(PreferenceEvent.CHANGED, handleChange);
    injector.on(PreferenceEvent.ADDED, handleChange);

    return () => {
      injector.off(PreferenceEvent.CHANGED, handleChange);
      injector.off(PreferenceEvent.ADDED, handleChange);
    };
  }, [injector, key]);

  // Update function
  const updateValue = useCallback(
    async (newValue: T, setOptions?: SetOptions): Promise<void> => {
      await injector.set(key, newValue, setOptions);
      setValue(newValue);
    },
    [injector, key]
  );

  return [value, updateValue, loading];
}

/**
 * Hook to use multiple preferences
 */
export function usePreferences(
  keys: string[]
): [Map<string, PreferenceValue>, (key: string, value: PreferenceValue) => Promise<void>, boolean] {
  const injector = usePreferenceInjector();
  const [values, setValues] = useState<Map<string, PreferenceValue>>(new Map());
  const [loading, setLoading] = useState(true);

  // Load initial values
  useEffect(() => {
    let mounted = true;

    void Promise.all(
      keys.map(async (key) => {
        try {
          const value = await injector.get(key);
          return [key, value] as const;
        } catch {
          return null;
        }
      })
    ).then((results) => {
      if (mounted) {
        const newValues = new Map<string, PreferenceValue>();
        for (const result of results) {
          if (result) {
            newValues.set(result[0], result[1]);
          }
        }
        setValues(newValues);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
    };
  }, [injector, ...keys]);

  // Subscribe to changes
  useEffect(() => {
    const handleChange = (event: {
      type: PreferenceEvent;
      key: string;
      newValue?: PreferenceValue;
    }): void => {
      if (keys.includes(event.key)) {
        setValues((prev) => {
          const next = new Map(prev);
          if (event.newValue !== undefined) {
            next.set(event.key, event.newValue);
          } else {
            next.delete(event.key);
          }
          return next;
        });
      }
    };

    injector.on(PreferenceEvent.CHANGED, handleChange);
    injector.on(PreferenceEvent.ADDED, handleChange);
    injector.on(PreferenceEvent.REMOVED, handleChange);

    return () => {
      injector.off(PreferenceEvent.CHANGED, handleChange);
      injector.off(PreferenceEvent.ADDED, handleChange);
      injector.off(PreferenceEvent.REMOVED, handleChange);
    };
  }, [injector, ...keys]);

  // Update function
  const updateValue = useCallback(
    async (key: string, value: PreferenceValue): Promise<void> => {
      await injector.set(key, value);
      setValues((prev) => {
        const next = new Map(prev);
        next.set(key, value);
        return next;
      });
    },
    [injector]
  );

  return [values, updateValue, loading];
}

/**
 * Hook to check if a preference exists
 */
export function useHasPreference(key: string): [boolean, boolean] {
  const injector = usePreferenceInjector();
  const [exists, setExists] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    void injector.has(key).then((result) => {
      if (mounted) {
        setExists(result);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
    };
  }, [injector, key]);

  return [exists, loading];
}

/**
 * Hook to delete a preference
 */
export function useDeletePreference(): (key: string) => Promise<boolean> {
  const injector = usePreferenceInjector();

  return useCallback(
    async (key: string): Promise<boolean> => {
      return await injector.delete(key);
    },
    [injector]
  );
}
