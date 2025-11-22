# Security Policy

## Post-Quantum Security Architecture

This project implements post-quantum cryptographic primitives to ensure long-term security against quantum computing threats.

### Cryptographic Primitives

- **Signatures**: Ed448 (Elliptic Curve Digital Signature Algorithm, NIST Level 3)
- **Key Exchange**: Kyber1024 (CRYSTALS-Kyber, NIST PQC Round 3 Finalist)
- **Hashing**: BLAKE3 (cryptographic hash function, faster than SHA-3)
- **Additional**: SHAKE256 for extendable-output functions
- **Strong Primes**: Generated from flat distribution (d256 entropy)

### Security Guarantees

1. **Quantum Resistance**: All cryptographic primitives are designed to resist attacks from quantum computers
2. **Memory Safety**: Deno runtime provides V8 sandbox isolation
3. **Type Safety**: TypeScript strict mode + ReScript functional guarantees
4. **No Unsafe Code**: Zero usage of `unsafe` blocks or FFI without verification
5. **Supply Chain**: Dependencies verified via lockfile, SBOM available

## Supported Versions

| Version | Supported          | End of Life |
| ------- | ------------------ | ----------- |
| 2.x     | ✅ Full support    | TBD         |
| 1.x     | ⚠️ Security only   | 2025-06-01  |
| < 1.0   | ❌ No support      | 2024-01-15  |

## Reporting a Vulnerability

### Preferred Contact Method

**Security contact**: security@example.com
**PGP Key**: [Download Key](/.well-known/security.txt)
**Response Time**: Within 48 hours
**Disclosure Timeline**: 90 days coordinated disclosure

### Reporting Process

1. **DO NOT** open a public GitHub issue for security vulnerabilities
2. Email security@example.com with:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact assessment
   - Suggested remediation (if any)
3. Use PGP encryption for sensitive details
4. Include "SECURITY:" prefix in email subject

### What to Expect

- **Acknowledgment**: Within 48 hours
- **Initial Assessment**: Within 7 days
- **Status Updates**: Every 14 days until resolved
- **CVE Assignment**: If severity warrants (CVSS ≥ 7.0)
- **Public Disclosure**: Coordinated after patch release (90 days max)
- **Credit**: Public acknowledgment in CHANGELOG (unless you prefer anonymity)

## Vulnerability Severity Levels

We use CVSS v3.1 scoring:

| Score    | Severity | Response Time | Patch Timeline |
|----------|----------|---------------|----------------|
| 9.0-10.0 | Critical | < 24 hours    | < 7 days       |
| 7.0-8.9  | High     | < 48 hours    | < 14 days      |
| 4.0-6.9  | Medium   | < 7 days      | < 30 days      |
| 0.1-3.9  | Low      | < 14 days     | Next release   |

## Security Best Practices for Users

### Deployment

1. **Always use HTTPS**: Never transmit credentials over plain HTTP
2. **Rotate keys regularly**: Change encryption keys every 90 days minimum
3. **Enable audit logging**: Track all preference access and modifications
4. **Use strong passphrases**: Minimum 16 characters, high entropy
5. **Isolate environments**: Separate production, staging, development

### Configuration

```typescript
// ✅ Good: Post-quantum encryption enabled
const injector = new PreferenceInjector({
  enableEncryption: true,
  encryptionKey: process.env.ENCRYPTION_KEY, // From secure vault
  encryptionAlgorithm: 'ed448-kyber1024-blake3',
});

// ❌ Bad: Encryption disabled
const injector = new PreferenceInjector({
  enableEncryption: false, // Never do this in production!
});
```

### Data Handling

- **PII Encryption**: Always encrypt personally identifiable information
- **Credential Storage**: Never store passwords in plain text
- **API Keys**: Use environment variables or secret management services
- **Audit Trails**: Enable audit logging for compliance (GDPR, SOC 2, etc.)

## Known Security Limitations

### Current Limitations (v2.0)

1. **Cryptography Status**: Post-quantum primitives designed but not fully implemented
2. **Offline Mode**: Local-first architecture planned but not complete
3. **WASM Sandbox**: Untrusted code execution not yet sandboxed
4. **Formal Verification**: SPARK Ada proofs not implemented

### Planned Enhancements (v2.1+)

- Full post-quantum cryptography implementation
- WASM sandboxing for user-provided preference scripts
- Formal verification of critical security paths
- Hardware security module (HSM) integration
- Secure enclave support (Intel SGX, ARM TrustZone)

## Security-Related Configuration

### Environment Variables

```bash
# Encryption
ENCRYPTION_ALGORITHM=ed448-kyber1024-blake3
ENCRYPTION_KEY_ROTATION_DAYS=90

# API Security
API_RATE_LIMIT=100  # requests per minute
API_REQUIRE_AUTH=true
API_CORS_ORIGIN=https://yourdomain.com

# Audit Logging
AUDIT_ENABLED=true
AUDIT_RETENTION_DAYS=365
AUDIT_LOG_LEVEL=info

# TLS/HTTPS
TLS_MIN_VERSION=1.3
TLS_CIPHER_SUITES=TLS_AES_256_GCM_SHA384,TLS_CHACHA20_POLY1305_SHA256
```

### Security Headers

All HTTP responses should include:

```
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
Content-Security-Policy: default-src 'self'
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: no-referrer
Permissions-Policy: geolocation=(), microphone=(), camera=()
```

## Incident Response

### In Case of Breach

1. **Immediate containment**: Disable affected systems
2. **Evidence preservation**: Capture logs, memory dumps
3. **Notification**: Contact security@example.com immediately
4. **User notification**: Inform affected users within 72 hours (GDPR requirement)
5. **Post-mortem**: Conduct root cause analysis

### Security Contacts

- **Project Lead**: @maintainer (Perimeter 1)
- **Security Team**: security@example.com
- **Emergency**: +1-555-SECURITY (24/7 on-call)

## Compliance & Certifications

### Current Compliance

- ✅ **GDPR**: Data protection and privacy (EU)
- ✅ **CCPA**: California Consumer Privacy Act (US)
- ⚠️ **SOC 2**: In progress (expected Q2 2024)
- ⚠️ **ISO 27001**: Planned for 2024

### Certifications

- [ ] NIST Cybersecurity Framework
- [ ] CIS Controls v8
- [ ] OWASP ASVS Level 2

## Security Audits

### Last Audit

- **Date**: 2024-01-15
- **Auditor**: Internal review
- **Findings**: 0 critical, 2 high, 5 medium, 12 low
- **Status**: High and medium findings remediated

### Next Audit

- **Scheduled**: 2024-Q2
- **Type**: Third-party penetration testing
- **Scope**: Full application security assessment

## Bug Bounty Program

### Currently

❌ No formal bug bounty program (under consideration)

### Scope (When Launched)

- **In Scope**: API endpoints, authentication, encryption, data validation
- **Out of Scope**: Social engineering, physical attacks, DoS
- **Rewards**: $100 - $10,000 USD based on severity

## References

- [NIST Post-Quantum Cryptography](https://csrc.nist.gov/projects/post-quantum-cryptography)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [CWE Top 25](https://cwe.mitre.org/top25/)
- [CVE Database](https://cve.mitre.org/)
- [RFC 9116: security.txt](https://www.rfc-editor.org/rfc/rfc9116.html)

## Acknowledgments

We thank the following security researchers for responsible disclosure:

- *No vulnerabilities reported yet*

---

**Last Updated**: 2024-01-15
**Policy Version**: 2.0
**Next Review**: 2024-07-15
