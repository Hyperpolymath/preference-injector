import { Validator, ValidationRule, ValidationResult, PreferenceValue } from '../types';

/**
 * Preference validator with custom rule support
 */
export class PreferenceValidator implements Validator {
  private rules: Map<string, ValidationRule[]> = new Map();

  /**
   * Add a validation rule for a specific preference key
   */
  addRule(key: string, rule: ValidationRule): void {
    const existingRules = this.rules.get(key) || [];
    existingRules.push(rule);
    this.rules.set(key, existingRules);
  }

  /**
   * Validate a preference value against all rules for its key
   */
  async validate(key: string, value: PreferenceValue): Promise<ValidationResult> {
    const rules = this.rules.get(key);

    if (!rules || rules.length === 0) {
      return { valid: true, errors: [] };
    }

    const errors: Array<{ rule: string; message: string; value: PreferenceValue }> = [];

    for (const rule of rules) {
      try {
        const isValid = await rule.validate(value);

        if (!isValid) {
          errors.push({
            rule: rule.name,
            message: rule.message || `Validation failed for rule: ${rule.name}`,
            value,
          });
        }
      } catch (error) {
        errors.push({
          rule: rule.name,
          message: `Validation error: ${(error as Error).message}`,
          value,
        });
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Remove a specific validation rule
   */
  removeRule(key: string, ruleName: string): void {
    const rules = this.rules.get(key);

    if (!rules) {
      return;
    }

    const filtered = rules.filter((rule) => rule.name !== ruleName);

    if (filtered.length === 0) {
      this.rules.delete(key);
    } else {
      this.rules.set(key, filtered);
    }
  }

  /**
   * Remove all rules for a key
   */
  removeAllRules(key: string): void {
    this.rules.delete(key);
  }

  /**
   * Clear all validation rules
   */
  clear(): void {
    this.rules.clear();
  }

  /**
   * Get all rules for a key
   */
  getRules(key: string): ValidationRule[] {
    return this.rules.get(key) || [];
  }
}

/**
 * Common validation rules
 */
export const CommonValidationRules = {
  /**
   * Require a non-empty string
   */
  required: (message?: string): ValidationRule => ({
    name: 'required',
    message: message || 'Value is required',
    validate: (value: PreferenceValue) => {
      if (value === null || value === undefined) {
        return false;
      }
      if (typeof value === 'string' && value.trim() === '') {
        return false;
      }
      return true;
    },
  }),

  /**
   * Validate string length
   */
  stringLength: (min?: number, max?: number, message?: string): ValidationRule => ({
    name: 'stringLength',
    message: message || `String length must be between ${min || 0} and ${max || 'unlimited'}`,
    validate: (value: PreferenceValue) => {
      if (typeof value !== 'string') {
        return false;
      }
      if (min !== undefined && value.length < min) {
        return false;
      }
      if (max !== undefined && value.length > max) {
        return false;
      }
      return true;
    },
  }),

  /**
   * Validate number range
   */
  numberRange: (min?: number, max?: number, message?: string): ValidationRule => ({
    name: 'numberRange',
    message: message || `Number must be between ${min || '-∞'} and ${max || '∞'}`,
    validate: (value: PreferenceValue) => {
      if (typeof value !== 'number') {
        return false;
      }
      if (min !== undefined && value < min) {
        return false;
      }
      if (max !== undefined && value > max) {
        return false;
      }
      return true;
    },
  }),

  /**
   * Validate against regex pattern
   */
  pattern: (regex: RegExp, message?: string): ValidationRule => ({
    name: 'pattern',
    message: message || `Value must match pattern: ${regex.source}`,
    validate: (value: PreferenceValue) => {
      if (typeof value !== 'string') {
        return false;
      }
      return regex.test(value);
    },
  }),

  /**
   * Validate email format
   */
  email: (message?: string): ValidationRule => ({
    name: 'email',
    message: message || 'Invalid email address',
    validate: (value: PreferenceValue) => {
      if (typeof value !== 'string') {
        return false;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(value);
    },
  }),

  /**
   * Validate URL format
   */
  url: (message?: string): ValidationRule => ({
    name: 'url',
    message: message || 'Invalid URL',
    validate: (value: PreferenceValue) => {
      if (typeof value !== 'string') {
        return false;
      }
      try {
        new URL(value);
        return true;
      } catch {
        return false;
      }
    },
  }),

  /**
   * Validate value is one of allowed values
   */
  enum: <T extends PreferenceValue>(allowedValues: T[], message?: string): ValidationRule => ({
    name: 'enum',
    message: message || `Value must be one of: ${allowedValues.join(', ')}`,
    validate: (value: PreferenceValue) => {
      return allowedValues.includes(value as T);
    },
  }),

  /**
   * Validate value type
   */
  type: (
    expectedType: 'string' | 'number' | 'boolean' | 'object' | 'array',
    message?: string
  ): ValidationRule => ({
    name: 'type',
    message: message || `Value must be of type: ${expectedType}`,
    validate: (value: PreferenceValue) => {
      if (expectedType === 'array') {
        return Array.isArray(value);
      }
      if (expectedType === 'object') {
        return typeof value === 'object' && value !== null && !Array.isArray(value);
      }
      return typeof value === expectedType;
    },
  }),

  /**
   * Validate array length
   */
  arrayLength: (min?: number, max?: number, message?: string): ValidationRule => ({
    name: 'arrayLength',
    message: message || `Array length must be between ${min || 0} and ${max || 'unlimited'}`,
    validate: (value: PreferenceValue) => {
      if (!Array.isArray(value)) {
        return false;
      }
      if (min !== undefined && value.length < min) {
        return false;
      }
      if (max !== undefined && value.length > max) {
        return false;
      }
      return true;
    },
  }),

  /**
   * Custom validation function
   */
  custom: (
    fn: (value: PreferenceValue) => boolean | Promise<boolean>,
    name: string = 'custom',
    message?: string
  ): ValidationRule => ({
    name,
    message: message || 'Custom validation failed',
    validate: fn,
  }),
};
