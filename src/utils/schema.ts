import { PreferenceSchema, SchemaField, PreferenceValue } from '../types';
import { SchemaValidationError } from '../errors';
import { CommonValidationRules } from './validator';

/**
 * Schema-based preference validation
 */
export class SchemaValidator {
  constructor(private schema: PreferenceSchema) {}

  /**
   * Validate a single preference value against the schema
   */
  validate(key: string, value: PreferenceValue): void {
    const field = this.schema[key];

    if (!field) {
      // No schema defined for this key, allow it
      return;
    }

    // Check required
    if (field.required && (value === null || value === undefined)) {
      throw new SchemaValidationError(key, 'required value', 'null/undefined');
    }

    // Use default if value is null/undefined and default is provided
    if ((value === null || value === undefined) && field.default !== undefined) {
      return;
    }

    // Check type
    this.validateType(key, value, field);

    // Run custom validations
    if (field.validation) {
      for (const rule of field.validation) {
        const isValid = rule.validate(value);
        if (!isValid) {
          throw new SchemaValidationError(
            key,
            `validation rule: ${rule.name}`,
            String(value)
          );
        }
      }
    }
  }

  /**
   * Validate type of a value
   */
  private validateType(key: string, value: PreferenceValue, field: SchemaField): void {
    const actualType = this.getType(value);

    if (actualType !== field.type) {
      throw new SchemaValidationError(key, field.type, actualType);
    }

    // Additional type-specific validation
    switch (field.type) {
      case 'array':
        if (!Array.isArray(value)) {
          throw new SchemaValidationError(key, 'array', actualType);
        }
        break;

      case 'object':
        if (typeof value !== 'object' || value === null || Array.isArray(value)) {
          throw new SchemaValidationError(key, 'object', actualType);
        }
        break;
    }
  }

  /**
   * Get the type of a value
   */
  private getType(value: PreferenceValue): string {
    if (value === null) {
      return 'null';
    }

    if (Array.isArray(value)) {
      return 'array';
    }

    return typeof value;
  }

  /**
   * Get default value for a key
   */
  getDefault(key: string): PreferenceValue | undefined {
    return this.schema[key]?.default;
  }

  /**
   * Check if a key is required
   */
  isRequired(key: string): boolean {
    return this.schema[key]?.required || false;
  }

  /**
   * Check if a key should be encrypted
   */
  shouldEncrypt(key: string): boolean {
    return this.schema[key]?.encrypted || false;
  }

  /**
   * Update the schema
   */
  setSchema(schema: PreferenceSchema): void {
    this.schema = schema;
  }

  /**
   * Get the current schema
   */
  getSchema(): PreferenceSchema {
    return { ...this.schema };
  }

  /**
   * Add a field to the schema
   */
  addField(key: string, field: SchemaField): void {
    this.schema[key] = field;
  }

  /**
   * Remove a field from the schema
   */
  removeField(key: string): void {
    delete this.schema[key];
  }
}

/**
 * Schema builder for fluent API
 */
export class SchemaBuilder {
  private schema: PreferenceSchema = {};

  /**
   * Add a string field
   */
  string(
    key: string,
    options?: {
      required?: boolean;
      default?: string;
      minLength?: number;
      maxLength?: number;
      pattern?: RegExp;
      encrypted?: boolean;
      description?: string;
    }
  ): this {
    const validation = [];

    if (options?.minLength !== undefined || options?.maxLength !== undefined) {
      validation.push(
        CommonValidationRules.stringLength(options.minLength, options.maxLength)
      );
    }

    if (options?.pattern) {
      validation.push(CommonValidationRules.pattern(options.pattern));
    }

    this.schema[key] = {
      type: 'string',
      required: options?.required,
      default: options?.default,
      encrypted: options?.encrypted,
      description: options?.description,
      validation,
    };

    return this;
  }

  /**
   * Add a number field
   */
  number(
    key: string,
    options?: {
      required?: boolean;
      default?: number;
      min?: number;
      max?: number;
      description?: string;
    }
  ): this {
    const validation = [];

    if (options?.min !== undefined || options?.max !== undefined) {
      validation.push(CommonValidationRules.numberRange(options.min, options.max));
    }

    this.schema[key] = {
      type: 'number',
      required: options?.required,
      default: options?.default,
      description: options?.description,
      validation,
    };

    return this;
  }

  /**
   * Add a boolean field
   */
  boolean(
    key: string,
    options?: {
      required?: boolean;
      default?: boolean;
      description?: string;
    }
  ): this {
    this.schema[key] = {
      type: 'boolean',
      required: options?.required,
      default: options?.default,
      description: options?.description,
    };

    return this;
  }

  /**
   * Add an object field
   */
  object(
    key: string,
    options?: {
      required?: boolean;
      default?: Record<string, PreferenceValue>;
      description?: string;
    }
  ): this {
    this.schema[key] = {
      type: 'object',
      required: options?.required,
      default: options?.default,
      description: options?.description,
    };

    return this;
  }

  /**
   * Add an array field
   */
  array(
    key: string,
    options?: {
      required?: boolean;
      default?: PreferenceValue[];
      minLength?: number;
      maxLength?: number;
      description?: string;
    }
  ): this {
    const validation = [];

    if (options?.minLength !== undefined || options?.maxLength !== undefined) {
      validation.push(CommonValidationRules.arrayLength(options.minLength, options.maxLength));
    }

    this.schema[key] = {
      type: 'array',
      required: options?.required,
      default: options?.default,
      description: options?.description,
      validation,
    };

    return this;
  }

  /**
   * Build the schema
   */
  build(): PreferenceSchema {
    return { ...this.schema };
  }
}
