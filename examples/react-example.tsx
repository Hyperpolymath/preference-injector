/**
 * React integration example
 */

import React from 'react';
import {
  PreferenceProvider,
  usePreference,
  usePreferences,
  PreferenceInjector,
  MemoryProvider,
} from '../src';

// Create injector
const injector = new PreferenceInjector({
  providers: [new MemoryProvider()],
});

// App component with provider
export const App: React.FC = () => {
  return (
    <PreferenceProvider injector={injector}>
      <ThemeSettings />
      <UserSettings />
    </PreferenceProvider>
  );
};

// Component using a single preference
const ThemeSettings: React.FC = () => {
  const [theme, setTheme, loading] = usePreference<string>('theme', 'light');

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2>Theme Settings</h2>
      <p>Current theme: {theme}</p>
      <button onClick={() => void setTheme(theme === 'light' ? 'dark' : 'light')}>
        Toggle Theme
      </button>
    </div>
  );
};

// Component using multiple preferences
const UserSettings: React.FC = () => {
  const [preferences, updatePreference, loading] = usePreferences([
    'fontSize',
    'language',
    'notifications',
  ]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2>User Settings</h2>

      <div>
        <label>Font Size:</label>
        <input
          type="number"
          value={(preferences.get('fontSize') as number) || 14}
          onChange={(e) => void updatePreference('fontSize', parseInt(e.target.value))}
        />
      </div>

      <div>
        <label>Language:</label>
        <select
          value={(preferences.get('language') as string) || 'en'}
          onChange={(e) => void updatePreference('language', e.target.value)}
        >
          <option value="en">English</option>
          <option value="es">Spanish</option>
          <option value="fr">French</option>
        </select>
      </div>

      <div>
        <label>
          <input
            type="checkbox"
            checked={(preferences.get('notifications') as boolean) || false}
            onChange={(e) => void updatePreference('notifications', e.target.checked)}
          />
          Enable Notifications
        </label>
      </div>
    </div>
  );
};
