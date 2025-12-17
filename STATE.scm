;;; STATE.scm — preference-injector
;; SPDX-License-Identifier: AGPL-3.0-or-later
;; SPDX-FileCopyrightText: 2025 Jonathan D.A. Jewell

(define metadata
  '((version . "1.0.0") (updated . "2025-12-17") (project . "preference-injector")))

(define current-position
  '((phase . "v1.0 - Security Hardening Complete")
    (overall-completion . 35)
    (components
     ((rsr-compliance ((status . "complete") (completion . 100)))
      (scm-metadata ((status . "complete") (completion . 100)))
      (ci-security ((status . "complete") (completion . 100)))
      (security-policy ((status . "complete") (completion . 100)))
      (rescript-conversion ((status . "pending") (completion . 0)))
      (post-quantum-crypto ((status . "planned") (completion . 5)))
      (core-injector ((status . "in-progress") (completion . 60)))
      (providers ((status . "in-progress") (completion . 50)))
      (tests ((status . "pending") (completion . 20)))))))

(define blockers-and-issues
  '((critical ())
    (high-priority
     (("TypeScript to ReScript conversion required" . "policy")))))

(define roadmap
  '((v1.0-current
     ((name . "Foundation & Security")
      (status . "complete")
      (items
       (("RSR compliance" . "complete")
        ("SCM metadata files" . "complete")
        ("CI/CD security hardening" . "complete")
        ("GitHub Actions updated to v4" . "complete")
        ("security.txt expiry fixed" . "complete")
        ("License consistency across SCM files" . "complete")
        ("Version consistency across files" . "complete")))))

    (v1.1-next
     ((name . "ReScript Migration & Testing")
      (status . "planned")
      (items
       (("Convert src/core to ReScript" . "pending")
        ("Convert src/providers to ReScript" . "pending")
        ("Convert src/utils to ReScript" . "pending")
        ("Add ReScript-based test suite" . "pending")
        ("Achieve 80% test coverage" . "pending")
        ("Remove TypeScript dependencies" . "pending")))))

    (v1.2-future
     ((name . "Post-Quantum Cryptography")
      (status . "planned")
      (items
       (("Implement Ed448 signatures" . "pending")
        ("Implement Kyber1024 key exchange" . "pending")
        ("Implement BLAKE3 hashing" . "pending")
        ("HSM integration support" . "pending")))))

    (v1.3-future
     ((name . "Advanced Features")
      (status . "planned")
      (items
       (("CRDT-based sync finalization" . "pending")
        ("Offline-first architecture" . "pending")
        ("WASM sandboxing" . "pending")
        ("Formal verification with SPARK Ada" . "pending")
        ("GraphQL API" . "pending")))))))

(define critical-next-actions
  '((immediate
     (("Begin ReScript conversion of core modules" . "high")
      ("Set up ReScript build pipeline" . "high")))
    (this-week
     (("Convert src/types to ReScript" . "medium")
      ("Add rescript.json configuration" . "medium")
      ("Update bsconfig.json" . "medium")))
    (this-month
     (("Complete provider conversions" . "medium")
      ("Expand test coverage to 80%" . "medium")))))

(define session-history
  '((snapshots
     ((date . "2025-12-15") (session . "initial") (notes . "SCM files added"))
     ((date . "2025-12-17") (session . "security-review")
      (notes . "Security hardening: updated GitHub Actions to v4, fixed security.txt expiry, aligned versions and licenses across SCM files, updated SECURITY.md dates")))))

(define state-summary
  '((project . "preference-injector")
    (completion . 35)
    (blockers . 0)
    (high-priority-items . 1)
    (updated . "2025-12-17")
    (next-milestone . "v1.1 - ReScript Migration")))
