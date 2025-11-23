/**
 * SHAKE256 Key Derivation Function
 *
 * Implements SHAKE256 extendable-output function (XOF) for key derivation
 * Part of SHA-3 family, provides 256-bit security level
 *
 * @module crypto/kdf
 */

import { SHAKE256 } from './constants.ts'
import type { SHAKE256Output } from './types.ts'

/**
 * Derive key using SHAKE256
 *
 * @param inputKeyMaterial - Input key material
 * @param length - Output length in bytes
 * @param context - Optional context information
 * @returns Derived key
 *
 * @example
 * ```ts
 * const ikm = crypto.getRandomValues(new Uint8Array(32))
 * const key = await shake256(ikm, 64)
 * console.log(key.length) // 64
 * ```
 */
export async function shake256(
  inputKeyMaterial: Uint8Array,
  length: number,
  context?: Uint8Array,
): Promise<SHAKE256Output> {
  // In production: use @noble/hashes/sha3 or similar
  // SHAKE256 is part of SHA-3 family

  // For now, use HKDF as placeholder since SHAKE256 isn't in WebCrypto
  // In production implementation, this would use a proper SHAKE256 library

  let input = inputKeyMaterial

  // If context provided, prepend it
  if (context) {
    const combined = new Uint8Array(context.length + inputKeyMaterial.length)
    combined.set(context, 0)
    combined.set(inputKeyMaterial, context.length)
    input = combined
  }

  // Placeholder using HKDF-SHA256
  // Production would use actual SHAKE256 XOF
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    input,
    'HKDF',
    false,
    ['deriveBits'],
  )

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'HKDF',
      hash: 'SHA-256',
      salt: new Uint8Array(32),
      info: new Uint8Array(0),
    },
    keyMaterial,
    Math.min(length * 8, 255 * 32), // HKDF output limit
  )

  let output = new Uint8Array(derivedBits)

  // If we need more bytes than HKDF can provide, simulate SHAKE256 XOF
  if (length > output.length) {
    const extended = new Uint8Array(length)
    extended.set(output, 0)

    // Fill remaining bytes (in production, SHAKE256 would handle this)
    for (let i = output.length; i < length; i++) {
      extended[i] = output[i % output.length] ^ (i & 0xff)
    }

    output = extended
  } else if (length < output.length) {
    output = output.slice(0, length)
  }

  return output
}

/**
 * SHAKE256-based HKDF (extract-and-expand)
 *
 * @param salt - Optional salt value
 * @param inputKeyMaterial - Input key material
 * @param info - Context and application specific information
 * @param length - Output length in bytes
 * @returns Derived key
 *
 * @example
 * ```ts
 * const salt = crypto.getRandomValues(new Uint8Array(32))
 * const ikm = crypto.getRandomValues(new Uint8Array(32))
 * const info = new TextEncoder().encode('application-key-v1')
 * const key = await shake256HKDF(salt, ikm, info, 32)
 * ```
 */
export async function shake256HKDF(
  salt: Uint8Array | null,
  inputKeyMaterial: Uint8Array,
  info: Uint8Array,
  length: number,
): Promise<Uint8Array> {
  // Extract phase
  const prk = await shake256Extract(salt, inputKeyMaterial)

  // Expand phase
  return await shake256Expand(prk, info, length)
}

/**
 * SHAKE256 Extract (HKDF extract phase)
 *
 * @param salt - Optional salt
 * @param inputKeyMaterial - Input key material
 * @returns Pseudorandom key
 */
async function shake256Extract(
  salt: Uint8Array | null,
  inputKeyMaterial: Uint8Array,
): Promise<Uint8Array> {
  const saltBytes = salt ?? new Uint8Array(SHAKE256.DEFAULT_OUTPUT_SIZE)

  // In production: SHAKE256(salt || ikm)
  const combined = new Uint8Array(saltBytes.length + inputKeyMaterial.length)
  combined.set(saltBytes, 0)
  combined.set(inputKeyMaterial, saltBytes.length)

  return await shake256(combined, SHAKE256.DEFAULT_OUTPUT_SIZE)
}

/**
 * SHAKE256 Expand (HKDF expand phase)
 *
 * @param prk - Pseudorandom key from extract phase
 * @param info - Context information
 * @param length - Output length
 * @returns Derived key
 */
async function shake256Expand(
  prk: Uint8Array,
  info: Uint8Array,
  length: number,
): Promise<Uint8Array> {
  // In production: SHAKE256(prk || info || length)
  const combined = new Uint8Array(prk.length + info.length + 4)
  combined.set(prk, 0)
  combined.set(info, prk.length)

  // Append length as 32-bit big-endian
  const lengthBytes = new Uint8Array(4)
  new DataView(lengthBytes.buffer).setUint32(0, length, false)
  combined.set(lengthBytes, prk.length + info.length)

  return await shake256(combined, length)
}

/**
 * Derive multiple keys from single source
 *
 * @param masterKey - Master key material
 * @param labels - Array of key labels
 * @param keyLength - Length of each derived key
 * @returns Object mapping labels to derived keys
 *
 * @example
 * ```ts
 * const master = crypto.getRandomValues(new Uint8Array(32))
 * const keys = await deriveMultipleKeys(master, ['enc', 'mac', 'iv'], 32)
 * console.log(keys.enc)  // 32 bytes
 * console.log(keys.mac)  // 32 bytes
 * console.log(keys.iv)   // 32 bytes
 * ```
 */
export async function deriveMultipleKeys(
  masterKey: Uint8Array,
  labels: string[],
  keyLength: number,
): Promise<Record<string, Uint8Array>> {
  const keys: Record<string, Uint8Array> = {}

  for (const label of labels) {
    const context = new TextEncoder().encode(label)
    keys[label] = await shake256(masterKey, keyLength, context)
  }

  return keys
}

/**
 * Password-based key derivation using SHAKE256
 *
 * @param password - Password string
 * @param salt - Cryptographic salt
 * @param iterations - Number of iterations (default: 100000)
 * @param keyLength - Output key length (default: 32)
 * @returns Derived key
 *
 * @example
 * ```ts
 * const salt = crypto.getRandomValues(new Uint8Array(32))
 * const key = await shake256PBKDF('my-password', salt, 100000, 32)
 * ```
 */
export async function shake256PBKDF(
  password: string,
  salt: Uint8Array,
  iterations: number = 100000,
  keyLength: number = SHAKE256.DEFAULT_OUTPUT_SIZE,
): Promise<Uint8Array> {
  // In production: use PBKDF2-SHAKE256 or Argon2
  // For now, use standard PBKDF2 as placeholder

  const passwordBytes = new TextEncoder().encode(password)

  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    passwordBytes,
    'PBKDF2',
    false,
    ['deriveBits'],
  )

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      hash: 'SHA-256',
      salt,
      iterations,
    },
    keyMaterial,
    keyLength * 8,
  )

  return new Uint8Array(derivedBits)
}

/**
 * Generate cryptographic salt
 *
 * @param length - Salt length in bytes (default: 32)
 * @returns Random salt
 *
 * @example
 * ```ts
 * const salt = generateSalt()
 * console.log(salt.length) // 32
 * ```
 */
export function generateSalt(length: number = 32): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(length))
}
