/**
 * Express.js integration example
 */

import express from 'express';
import {
  PreferenceInjector,
  MemoryProvider,
  FileProvider,
  preferenceMiddleware,
  createPreferenceRouter,
  userPreferenceMiddleware,
} from '../src';

const app = express();
app.use(express.json());

// Create injector
const injector = new PreferenceInjector({
  providers: [
    new FileProvider({
      filePath: './server-config.json',
    }),
    new MemoryProvider(),
  ],
});

// Use preference middleware
app.use(
  preferenceMiddleware({
    injector,
    attachHelpers: true,
    initializeOnStartup: true,
  })
);

// Use preference API router
app.use('/api', createPreferenceRouter(injector));

// Example route using preferences
app.get('/config', async (req, res) => {
  const appName = await req.getPreference!('appName', 'My App');
  const version = await req.getPreference!('version', '1.0.0');

  res.json({
    name: appName,
    version,
  });
});

// User-specific preferences
app.use(
  userPreferenceMiddleware({
    injector,
    getUserId: (req) => req.headers['x-user-id'] as string,
  })
);

app.get('/user/settings', async (req, res) => {
  const theme = await req.getPreference!('theme', 'light');
  const language = await req.getPreference!('language', 'en');

  res.json({ theme, language });
});

app.post('/user/settings', async (req, res) => {
  const { key, value } = req.body;
  await req.setPreference!(key, value);
  res.json({ success: true });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.warn(`Server running on http://localhost:${PORT}`);
});
