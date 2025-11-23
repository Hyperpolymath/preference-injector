/**
 * Cryptographic Constants
 * @module crypto/constants
 */

/**
 * Ed448 Constants
 */
export const ED448 = {
  /** Public key size in bytes */
  PUBLIC_KEY_SIZE: 57,

  /** Private key size in bytes */
  PRIVATE_KEY_SIZE: 57,

  /** Signature size in bytes */
  SIGNATURE_SIZE: 114,

  /** Security level (NIST) */
  SECURITY_LEVEL: 3,

  /** Curve name */
  CURVE: 'edwards448' as const,
} as const

/**
 * Kyber1024 Constants
 */
export const KYBER1024 = {
  /** Public key size in bytes */
  PUBLIC_KEY_SIZE: 1568,

  /** Private key size in bytes */
  PRIVATE_KEY_SIZE: 3168,

  /** Ciphertext size in bytes */
  CIPHERTEXT_SIZE: 1568,

  /** Shared secret size in bytes */
  SHARED_SECRET_SIZE: 32,

  /** Security level (bits) */
  SECURITY_LEVEL: 256,

  /** Post-quantum security */
  POST_QUANTUM: true,
} as const

/**
 * BLAKE3 Constants
 */
export const BLAKE3 = {
  /** Default hash size in bytes */
  DEFAULT_HASH_SIZE: 32,

  /** Maximum hash size (unlimited with XOF mode) */
  MAX_HASH_SIZE: Number.MAX_SAFE_INTEGER,

  /** Key size for keyed hashing */
  KEY_SIZE: 32,

  /** Algorithm name */
  ALGORITHM: 'BLAKE3' as const,
} as const

/**
 * SHAKE256 Constants
 */
export const SHAKE256 = {
  /** Default output size in bytes */
  DEFAULT_OUTPUT_SIZE: 32,

  /** Security level (bits) */
  SECURITY_LEVEL: 256,

  /** Algorithm name */
  ALGORITHM: 'SHAKE256' as const,
} as const

/**
 * d256 Strong Primes Constants
 */
export const D256 = {
  /** Prime size in bits */
  BIT_SIZE: 256,

  /** Prime size in bytes */
  BYTE_SIZE: 32,

  /** Entropy distribution */
  DISTRIBUTION: 'flat' as const,

  /** Minimum entropy */
  MIN_ENTROPY: 256,
} as const

/**
 * Security Levels
 */
export const SECURITY_LEVELS = {
  /** Classical security (e.g., AES-128, RSA-2048) */
  CLASSICAL_128: 128,

  /** Post-quantum Level 1 (e.g., AES-128) */
  NIST_LEVEL_1: 128,

  /** Post-quantum Level 2 (e.g., AES-192) */
  NIST_LEVEL_2: 192,

  /** Post-quantum Level 3 (e.g., AES-256) - Ed448, Kyber1024 */
  NIST_LEVEL_3: 256,

  /** Post-quantum Level 4 */
  NIST_LEVEL_4: 384,

  /** Post-quantum Level 5 */
  NIST_LEVEL_5: 512,
} as const

/**
 * Algorithm Identifiers
 */
export const ALGORITHM_IDS = {
  ED448: 'ed448-goldilocks',
  KYBER1024: 'kyber1024',
  BLAKE3: 'blake3',
  SHAKE256: 'shake256',
  D256: 'd256-strong-prime',
  HYBRID: 'ed448-kyber1024-blake3',
} as const

/**
 * Nonce/IV Sizes
 */
export const NONCE_SIZES = {
  /** AES-GCM nonce size */
  AES_GCM: 12,

  /** ChaCha20-Poly1305 nonce size */
  CHACHA20: 12,

  /** XSalsa20 nonce size */
  XSALSA20: 24,

  /** Recommended generic nonce size */
  DEFAULT: 16,
} as const

/**
 * Salt Sizes
 */
export const SALT_SIZES = {
  /** Minimum recommended salt size */
  MIN: 16,

  /** Standard salt size */
  STANDARD: 32,

  /** High security salt size */
  HIGH_SECURITY: 64,
} as const
