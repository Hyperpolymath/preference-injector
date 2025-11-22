/**
 * Basic usage example
 */

import {
  PreferenceInjector,
  MemoryProvider,
  FileProvider,
  EnvProvider,
  PreferencePriority,
  ConflictResolution,
} from '../src';

async function basicExample(): Promise<void> {
  // Create an in-memory provider
  const memoryProvider = new MemoryProvider(PreferencePriority.NORMAL);

  // Create the injector
  const injector = new PreferenceInjector({
    providers: [memoryProvider],
    conflictResolution: ConflictResolution.HIGHEST_PRIORITY,
    enableCache: true,
    enableValidation: true,
  });

  // Initialize
  await injector.initialize();

  // Set some preferences
  await injector.set('theme', 'dark');
  await injector.set('language', 'en');
  await injector.set('fontSize', 14);

  // Get preferences
  const theme = await injector.get('theme');
  console.warn('Theme:', theme);

  const language = await injector.getTyped<string>('language');
  console.warn('Language:', language);

  // Check if preference exists
  const hasTheme = await injector.has('theme');
  console.warn('Has theme:', hasTheme);

  // Get all preferences
  const all = await injector.getAll();
  console.warn('All preferences:', Object.fromEntries(all));

  // Delete a preference
  await injector.delete('fontSize');

  // Get with default value
  const fontSize = await injector.get('fontSize', { defaultValue: 12 });
  console.warn('Font size (with default):', fontSize);
}

async function multiProviderExample(): Promise<void> {
  // Create multiple providers with different priorities
  const envProvider = new EnvProvider({ priority: PreferencePriority.HIGHEST });
  const fileProvider = new FileProvider({
    filePath: './config.json',
    priority: PreferencePriority.NORMAL,
  });
  const memoryProvider = new MemoryProvider(PreferencePriority.LOW);

  // Create injector with multiple providers
  const injector = new PreferenceInjector({
    providers: [envProvider, fileProvider, memoryProvider],
    conflictResolution: ConflictResolution.HIGHEST_PRIORITY,
  });

  await injector.initialize();

  // Set in memory provider (lowest priority)
  await memoryProvider.set('apiUrl', 'http://localhost:3000');

  // Environment variables have highest priority
  // If API_URL is set in env, it will override the memory value
  const apiUrl = await injector.get('apiUrl');
  console.warn('API URL:', apiUrl);
}

async function validationExample(): Promise<void> {
  const injector = new PreferenceInjector({
    providers: [new MemoryProvider()],
    enableValidation: true,
  });

  await injector.initialize();

  const validator = injector.getValidator();

  // Add validation rules
  const { CommonValidationRules } = await import('../src/utils/validator');

  validator.addRule('email', CommonValidationRules.email());
  validator.addRule('age', CommonValidationRules.numberRange(0, 150));
  validator.addRule(
    'username',
    CommonValidationRules.stringLength(3, 20, 'Username must be 3-20 characters')
  );

  // Valid set
  await injector.set('email', 'user@example.com', { validate: true });
  await injector.set('age', 25, { validate: true });

  // This would throw a validation error:
  try {
    await injector.set('email', 'invalid-email', { validate: true });
  } catch (error) {
    console.error('Validation failed:', (error as Error).message);
  }
}

async function encryptionExample(): Promise<void> {
  const { AESEncryptionService } = await import('../src/utils/encryption');

  const injector = new PreferenceInjector({
    providers: [new MemoryProvider()],
    enableEncryption: true,
  });

  // Set encryption service
  const encryptionService = new AESEncryptionService('my-secret-password');
  injector.setEncryptionService(encryptionService);

  await injector.initialize();

  // Store encrypted value
  await injector.set('apiKey', 'super-secret-key', { encrypt: true });

  // Retrieve and decrypt
  const apiKey = await injector.get('apiKey', { decrypt: true });
  console.warn('Decrypted API key:', apiKey);
}

// Run examples
async function main(): Promise<void> {
  console.warn('=== Basic Example ===');
  await basicExample();

  console.warn('\n=== Multi-Provider Example ===');
  await multiProviderExample();

  console.warn('\n=== Validation Example ===');
  await validationExample();

  console.warn('\n=== Encryption Example ===');
  await encryptionExample();
}

void main();
