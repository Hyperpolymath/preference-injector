import { createCipheriv, createDecipheriv, randomBytes, scrypt } from 'crypto';
import { promisify } from 'util';
import { EncryptionService } from '../types';
import { EncryptionError } from '../errors';

const scryptAsync = promisify(scrypt);

/**
 * AES-256-GCM encryption service for securing sensitive preferences
 */
export class AESEncryptionService implements EncryptionService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly keyLength = 32;
  private readonly ivLength = 16;
  private readonly saltLength = 32;
  private readonly tagLength = 16;
  private readonly encryptedPrefix = 'encrypted:';

  constructor(private readonly password: string) {
    if (!password || password.length < 8) {
      throw new EncryptionError('Password must be at least 8 characters long');
    }
  }

  /**
   * Derive encryption key from password using scrypt
   */
  private async deriveKey(salt: Buffer): Promise<Buffer> {
    try {
      return (await scryptAsync(this.password, salt, this.keyLength)) as Buffer;
    } catch (error) {
      throw new EncryptionError('Failed to derive encryption key', error as Error);
    }
  }

  /**
   * Encrypt a string value
   */
  async encrypt(value: string): Promise<string> {
    try {
      const salt = randomBytes(this.saltLength);
      const iv = randomBytes(this.ivLength);
      const key = await this.deriveKey(salt);

      const cipher = createCipheriv(this.algorithm, key, iv);
      const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
      const tag = cipher.getAuthTag();

      // Format: salt:iv:tag:encrypted
      const result = Buffer.concat([salt, iv, tag, encrypted]).toString('base64');
      return `${this.encryptedPrefix}${result}`;
    } catch (error) {
      throw new EncryptionError('Failed to encrypt value', error as Error);
    }
  }

  /**
   * Decrypt an encrypted string value
   */
  async decrypt(encrypted: string): Promise<string> {
    try {
      if (!this.isEncrypted(encrypted)) {
        throw new EncryptionError('Value is not encrypted');
      }

      const data = Buffer.from(encrypted.replace(this.encryptedPrefix, ''), 'base64');

      const salt = data.subarray(0, this.saltLength);
      const iv = data.subarray(this.saltLength, this.saltLength + this.ivLength);
      const tag = data.subarray(
        this.saltLength + this.ivLength,
        this.saltLength + this.ivLength + this.tagLength
      );
      const encryptedData = data.subarray(this.saltLength + this.ivLength + this.tagLength);

      const key = await this.deriveKey(salt);

      const decipher = createDecipheriv(this.algorithm, key, iv);
      decipher.setAuthTag(tag);

      const decrypted = Buffer.concat([decipher.update(encryptedData), decipher.final()]);
      return decrypted.toString('utf8');
    } catch (error) {
      throw new EncryptionError('Failed to decrypt value', error as Error);
    }
  }

  /**
   * Check if a value is encrypted
   */
  isEncrypted(value: string): boolean {
    return typeof value === 'string' && value.startsWith(this.encryptedPrefix);
  }
}

/**
 * No-op encryption service for development/testing
 */
export class NoOpEncryptionService implements EncryptionService {
  async encrypt(value: string): Promise<string> {
    return value;
  }

  async decrypt(encrypted: string): Promise<string> {
    return encrypted;
  }

  isEncrypted(_value: string): boolean {
    return false;
  }
}
