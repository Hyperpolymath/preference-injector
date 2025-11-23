/**
 * BLAKE3 Hashing
 *
 * Implements BLAKE3 cryptographic hash function
 * Supports variable-length output (XOF mode) and keyed hashing
 *
 * @module crypto/hashing
 */

import { BLAKE3 } from './constants.ts'
import type { BLAKE3Hash } from './types.ts'

/**
 * Hash data using BLAKE3
 *
 * @param data - Data to hash
 * @param length - Output length in bytes (default: 32)
 * @returns BLAKE3 hash
 *
 * @example
 * ```ts
 * const data = new TextEncoder().encode('Hello, world!')
 * const hash = await blake3Hash(data)
 * console.log(hash.length) // 32
 * ```
 */
export async function blake3Hash(
  data: Uint8Array,
  length: number = BLAKE3.DEFAULT_HASH_SIZE,
): Promise<BLAKE3Hash> {
  // In production: use @noble/hashes/blake3 or blake3-wasm
  // For now, use SHA-256 as placeholder (same output size)

  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hash = new Uint8Array(hashBuffer)

  // If requested length differs, simulate BLAKE3 XOF mode
  if (length !== BLAKE3.DEFAULT_HASH_SIZE) {
    // In production: use BLAKE3 XOF for arbitrary length
    // Placeholder: repeat/truncate hash
    const output = new Uint8Array(length)
    for (let i = 0; i < length; i++) {
      output[i] = hash[i % hash.length]
    }
    return output
  }

  return hash
}

/**
 * Keyed hash using BLAKE3
 *
 * @param data - Data to hash
 * @param key - 32-byte key
 * @param length - Output length in bytes (default: 32)
 * @returns BLAKE3 keyed hash
 *
 * @example
 * ```ts
 * const key = crypto.getRandomValues(new Uint8Array(32))
 * const data = new TextEncoder().encode('Hello, world!')
 * const mac = await blake3KeyedHash(data, key)
 * ```
 */
export async function blake3KeyedHash(
  data: Uint8Array,
  key: Uint8Array,
  length: number = BLAKE3.DEFAULT_HASH_SIZE,
): Promise<BLAKE3Hash> {
  if (key.length !== BLAKE3.KEY_SIZE) {
    throw new Error(
      `Key must be ${BLAKE3.KEY_SIZE} bytes, got ${key.length}`,
    )
  }

  // In production: use BLAKE3 keyed mode
  // For now, use HMAC-SHA256 as placeholder

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    key,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )

  const signatureBuffer = await crypto.subtle.sign('HMAC', cryptoKey, data)
  const signature = new Uint8Array(signatureBuffer)

  // Adjust length if needed
  if (length !== BLAKE3.DEFAULT_HASH_SIZE) {
    const output = new Uint8Array(length)
    for (let i = 0; i < length; i++) {
      output[i] = signature[i % signature.length]
    }
    return output
  }

  return signature
}

/**
 * Derive key using BLAKE3 in KDF mode
 *
 * @param inputKeyMaterial - Input key material
 * @param context - Context string
 * @param length - Output length in bytes
 * @returns Derived key
 *
 * @example
 * ```ts
 * const ikm = crypto.getRandomValues(new Uint8Array(32))
 * const encKey = await blake3DeriveKey(ikm, 'encryption', 32)
 * const macKey = await blake3DeriveKey(ikm, 'authentication', 32)
 * ```
 */
export async function blake3DeriveKey(
  inputKeyMaterial: Uint8Array,
  context: string,
  length: number,
): Promise<Uint8Array> {
  // In production: use BLAKE3 derive_key mode
  // For now, use HKDF as placeholder

  const contextBytes = new TextEncoder().encode(context)

  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    inputKeyMaterial,
    'HKDF',
    false,
    ['deriveBits'],
  )

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'HKDF',
      hash: 'SHA-256',
      salt: new Uint8Array(0),
      info: contextBytes,
    },
    keyMaterial,
    length * 8,
  )

  return new Uint8Array(derivedBits)
}

/**
 * Incremental BLAKE3 hasher for streaming data
 *
 * @example
 * ```ts
 * const hasher = new Blake3Hasher()
 * hasher.update(chunk1)
 * hasher.update(chunk2)
 * const hash = await hasher.finalize()
 * ```
 */
export class Blake3Hasher {
  private chunks: Uint8Array[] = []

  /**
   * Update hasher with new data
   * @param data - Data chunk to add
   */
  update(data: Uint8Array): void {
    this.chunks.push(data.slice())
  }

  /**
   * Finalize hash and return result
   * @param length - Output length in bytes (default: 32)
   * @returns BLAKE3 hash
   */
  async finalize(length: number = BLAKE3.DEFAULT_HASH_SIZE): Promise<BLAKE3Hash> {
    // Concatenate all chunks
    const totalLength = this.chunks.reduce((sum, chunk) => sum + chunk.length, 0)
    const combined = new Uint8Array(totalLength)
    let offset = 0
    for (const chunk of this.chunks) {
      combined.set(chunk, offset)
      offset += chunk.length
    }

    // Hash combined data
    return await blake3Hash(combined, length)
  }

  /**
   * Reset hasher to initial state
   */
  reset(): void {
    this.chunks = []
  }
}

/**
 * Compute BLAKE3 hash of a string
 *
 * @param text - Text to hash
 * @param length - Output length in bytes (default: 32)
 * @returns BLAKE3 hash as hex string
 *
 * @example
 * ```ts
 * const hash = await blake3HashString('Hello, world!')
 * console.log(hash) // "abc123..."
 * ```
 */
export async function blake3HashString(
  text: string,
  length: number = BLAKE3.DEFAULT_HASH_SIZE,
): Promise<string> {
  const data = new TextEncoder().encode(text)
  const hash = await blake3Hash(data, length)
  return Array.from(hash)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

/**
 * Verify BLAKE3 hash
 *
 * @param data - Original data
 * @param expectedHash - Expected hash value
 * @returns true if hash matches, false otherwise
 *
 * @example
 * ```ts
 * const data = new TextEncoder().encode('Hello, world!')
 * const hash = await blake3Hash(data)
 * const isValid = await blake3Verify(data, hash) // true
 * ```
 */
export async function blake3Verify(
  data: Uint8Array,
  expectedHash: BLAKE3Hash,
): Promise<boolean> {
  const actualHash = await blake3Hash(data, expectedHash.length)

  if (actualHash.length !== expectedHash.length) {
    return false
  }

  for (let i = 0; i < actualHash.length; i++) {
    if (actualHash[i] !== expectedHash[i]) {
      return false
    }
  }

  return true
}
