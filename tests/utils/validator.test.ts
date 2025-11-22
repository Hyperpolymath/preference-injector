/**
 * Unit tests for PreferenceValidator
 */

import { PreferenceValidator, CommonValidationRules } from '../../src/utils/validator';

describe('PreferenceValidator', () => {
  let validator: PreferenceValidator;

  beforeEach(() => {
    validator = new PreferenceValidator();
  });

  test('should pass validation when no rules defined', async () => {
    const result = await validator.validate('key', 'value');
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test('should validate required rule', async () => {
    validator.addRule('key', CommonValidationRules.required());

    const validResult = await validator.validate('key', 'value');
    expect(validResult.valid).toBe(true);

    const invalidResult = await validator.validate('key', '');
    expect(invalidResult.valid).toBe(false);
  });

  test('should validate string length', async () => {
    validator.addRule('key', CommonValidationRules.stringLength(3, 10));

    const validResult = await validator.validate('key', 'hello');
    expect(validResult.valid).toBe(true);

    const tooShort = await validator.validate('key', 'ab');
    expect(tooShort.valid).toBe(false);

    const tooLong = await validator.validate('key', 'this is too long');
    expect(tooLong.valid).toBe(false);
  });

  test('should validate number range', async () => {
    validator.addRule('key', CommonValidationRules.numberRange(0, 100));

    const validResult = await validator.validate('key', 50);
    expect(validResult.valid).toBe(true);

    const tooLow = await validator.validate('key', -1);
    expect(tooLow.valid).toBe(false);

    const tooHigh = await validator.validate('key', 101);
    expect(tooHigh.valid).toBe(false);
  });

  test('should validate email', async () => {
    validator.addRule('email', CommonValidationRules.email());

    const valid = await validator.validate('email', 'user@example.com');
    expect(valid.valid).toBe(true);

    const invalid = await validator.validate('email', 'not-an-email');
    expect(invalid.valid).toBe(false);
  });

  test('should validate URL', async () => {
    validator.addRule('url', CommonValidationRules.url());

    const valid = await validator.validate('url', 'https://example.com');
    expect(valid.valid).toBe(true);

    const invalid = await validator.validate('url', 'not-a-url');
    expect(invalid.valid).toBe(false);
  });

  test('should validate enum values', async () => {
    validator.addRule('theme', CommonValidationRules.enum(['light', 'dark']));

    const valid = await validator.validate('theme', 'dark');
    expect(valid.valid).toBe(true);

    const invalid = await validator.validate('theme', 'blue');
    expect(invalid.valid).toBe(false);
  });

  test('should remove rules', async () => {
    const rule = CommonValidationRules.required();
    validator.addRule('key', rule);

    validator.removeRule('key', 'required');

    const result = await validator.validate('key', '');
    expect(result.valid).toBe(true);
  });
});
