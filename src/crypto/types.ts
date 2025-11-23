/**
 * Cryptographic Types
 * @module crypto/types
 */

/**
 * Ed448 Public Key (57 bytes)
 */
export type Ed448PublicKey = Uint8Array

/**
 * Ed448 Private Key (57 bytes)
 */
export type Ed448PrivateKey = Uint8Array

/**
 * Ed448 Signature (114 bytes)
 */
export type Ed448Signature = Uint8Array

/**
 * Ed448 Key Pair
 */
export interface Ed448KeyPair {
  publicKey: Ed448PublicKey
  privateKey: Ed448PrivateKey
}

/**
 * Kyber1024 Public Key (1568 bytes)
 */
export type Kyber1024PublicKey = Uint8Array

/**
 * Kyber1024 Private Key (3168 bytes)
 */
export type Kyber1024PrivateKey = Uint8Array

/**
 * Kyber1024 Ciphertext (1568 bytes)
 */
export type Kyber1024Ciphertext = Uint8Array

/**
 * Kyber1024 Shared Secret (32 bytes)
 */
export type Kyber1024SharedSecret = Uint8Array

/**
 * Kyber1024 Key Pair
 */
export interface Kyber1024KeyPair {
  publicKey: Kyber1024PublicKey
  privateKey: Kyber1024PrivateKey
}

/**
 * BLAKE3 Hash (32 bytes default, configurable)
 */
export type BLAKE3Hash = Uint8Array

/**
 * SHAKE256 Output (arbitrary length)
 */
export type SHAKE256Output = Uint8Array

/**
 * d256 Strong Prime (256 bits)
 */
export type D256Prime = bigint

/**
 * Encryption Result
 */
export interface EncryptionResult {
  ciphertext: Uint8Array
  nonce: Uint8Array
  tag?: Uint8Array
}

/**
 * Decryption Result
 */
export interface DecryptionResult {
  plaintext: Uint8Array
  verified: boolean
}

/**
 * Hybrid Encryption (Ed448 + Kyber1024)
 */
export interface HybridEncryptionResult {
  ed448Signature: Ed448Signature
  kyberCiphertext: Kyber1024Ciphertext
  encryptedData: Uint8Array
  nonce: Uint8Array
  blake3Hash: BLAKE3Hash
}

/**
 * Cryptographic Configuration
 */
export interface CryptoConfig {
  /** Enable post-quantum cryptography */
  postQuantum: boolean

  /** Signature algorithm */
  signatureAlgorithm: 'ed448' | 'ed25519'

  /** Key exchange algorithm */
  keyExchangeAlgorithm: 'kyber1024' | 'x25519'

  /** Hash algorithm */
  hashAlgorithm: 'blake3' | 'sha3-256' | 'blake2b'

  /** KDF algorithm */
  kdfAlgorithm: 'shake256' | 'hkdf-sha256'

  /** Use d256 strong primes for entropy */
  useStrongPrimes: boolean

  /** Hash output length (bytes) */
  hashLength: number

  /** KDF output length (bytes) */
  kdfLength: number
}

/**
 * Default cryptographic configuration
 */
export const DEFAULT_CRYPTO_CONFIG: CryptoConfig = {
  postQuantum: true,
  signatureAlgorithm: 'ed448',
  keyExchangeAlgorithm: 'kyber1024',
  hashAlgorithm: 'blake3',
  kdfAlgorithm: 'shake256',
  useStrongPrimes: true,
  hashLength: 32,
  kdfLength: 32,
}
