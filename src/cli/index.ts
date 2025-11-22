#!/usr/bin/env node

/**
 * CLI tool for preference management
 */

import { PreferenceInjector } from '../core/injector';
import { FileProvider } from '../providers/file-provider';
import { PreferencePriority } from '../types';

interface CliOptions {
  file: string;
  command: string;
  key?: string;
  value?: string;
}

function parseArgs(): CliOptions {
  const args = process.argv.slice(2);

  const options: CliOptions = {
    file: 'preferences.json',
    command: 'help',
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    switch (arg) {
      case '-f':
      case '--file':
        options.file = args[++i];
        break;

      case 'get':
      case 'set':
      case 'delete':
      case 'list':
      case 'clear':
        options.command = arg;
        break;

      default:
        if (!options.key) {
          options.key = arg;
        } else if (!options.value) {
          options.value = arg;
        }
        break;
    }
  }

  return options;
}

function printHelp(): void {
  console.warn(`
Preference Injector CLI

Usage:
  preference-injector [options] <command> [args]

Options:
  -f, --file <path>    Path to preferences file (default: preferences.json)

Commands:
  get <key>            Get a preference value
  set <key> <value>    Set a preference value
  delete <key>         Delete a preference
  list                 List all preferences
  clear                Clear all preferences
  help                 Show this help message

Examples:
  preference-injector get theme
  preference-injector set theme dark
  preference-injector -f config.json list
  preference-injector delete old-key
`);
}

async function run(): Promise<void> {
  const options = parseArgs();

  if (options.command === 'help') {
    printHelp();
    return;
  }

  // Create injector with file provider
  const provider = new FileProvider({
    filePath: options.file,
    priority: PreferencePriority.NORMAL,
    format: 'json',
  });

  const injector = new PreferenceInjector({
    providers: [provider],
    enableCache: false,
    enableAudit: false,
  });

  await injector.initialize();

  try {
    switch (options.command) {
      case 'get': {
        if (!options.key) {
          console.error('Error: Key is required for get command');
          process.exit(1);
        }

        const value = await injector.get(options.key);
        console.warn(JSON.stringify(value, null, 2));
        break;
      }

      case 'set': {
        if (!options.key || !options.value) {
          console.error('Error: Key and value are required for set command');
          process.exit(1);
        }

        // Try to parse value as JSON
        let parsedValue: unknown;
        try {
          parsedValue = JSON.parse(options.value);
        } catch {
          parsedValue = options.value;
        }

        await injector.set(options.key, parsedValue);
        console.warn(`Set ${options.key} = ${JSON.stringify(parsedValue)}`);
        break;
      }

      case 'delete': {
        if (!options.key) {
          console.error('Error: Key is required for delete command');
          process.exit(1);
        }

        const deleted = await injector.delete(options.key);
        if (deleted) {
          console.warn(`Deleted ${options.key}`);
        } else {
          console.warn(`Key not found: ${options.key}`);
        }
        break;
      }

      case 'list': {
        const all = await injector.getAll();
        const obj: Record<string, unknown> = {};

        for (const [key, value] of all.entries()) {
          obj[key] = value;
        }

        console.warn(JSON.stringify(obj, null, 2));
        break;
      }

      case 'clear': {
        await injector.clear();
        console.warn('All preferences cleared');
        break;
      }

      default:
        console.error(`Unknown command: ${options.command}`);
        printHelp();
        process.exit(1);
    }
  } catch (error) {
    console.error('Error:', (error as Error).message);
    process.exit(1);
  }
}

void run();
