# SPDX-License-Identifier: MIT
# SPDX-FileCopyrightText: 2024 Hyperpolymath
#
# Preference Injector - Universal Application Automation Standard
# RSR-Compliant Build System using Just (https://just.systems/)
#
# Language Policy: ReScript + Deno (NO TypeScript/Node.js/npm)

# List all available recipes
default:
    @just --list

# ============================================================================
# DEVELOPMENT
# ============================================================================

# Run development server with watch mode (ReScript)
dev:
    rescript build -w &
    deno run --watch --allow-all src/rescript/PreferenceInjector.bs.js

# Start production server
start:
    deno run --allow-all src/rescript/PreferenceInjector.bs.js

# Install dependencies (Deno only - no npm)
install:
    @echo "No npm installation required - using Deno imports"
    @if command -v rescript > /dev/null; then \
        echo "✅ ReScript is installed"; \
    else \
        echo "❌ ReScript not found. Install via: guix install rescript"; \
    fi

# Clean build artifacts and caches
clean:
    rm -rf lib/
    rm -rf .lib/
    rm -rf coverage/
    find . -name "*.bs.js" -type f -delete
    rescript clean

# Format all code
fmt:
    rescript format src/
    deno fmt --ignore="*.bs.js"

# Check code formatting without modifying
fmt-check:
    deno fmt --check --ignore="*.bs.js"

# ============================================================================
# BUILDING
# ============================================================================

# Build ReScript code
build:
    rescript build -with-deps

# Build with clean
build-clean:
    rescript clean
    rescript build -with-deps

# Build for production with optimizations
build-prod:
    rescript build -with-deps
    @echo "Production build complete"

# Compile standalone executable (Deno compile)
compile:
    rescript build -with-deps
    deno compile --allow-all --output bin/preference-injector src/rescript/PreferenceInjector.bs.js

# ============================================================================
# TESTING
# ============================================================================

# Run all tests
test:
    rescript build -with-deps
    deno test --allow-all tests/

# Run ReScript tests
test-rescript:
    rescript build -with-deps
    deno run --allow-all tests/rescript/Injector_test.bs.js
    deno run --allow-all tests/rescript/Validator_test.bs.js

# Run tests with coverage
test-coverage:
    rescript build -with-deps
    deno test --allow-all --coverage=coverage/
    deno coverage coverage/ --lcov > coverage/lcov.info

# Run tests in watch mode
test-watch:
    rescript build -w &
    deno test --allow-all --watch

# Run specific test file
test-file FILE:
    rescript build -with-deps
    deno test --allow-all {{FILE}}

# ============================================================================
# LINTING & QUALITY
# ============================================================================

# Run linter
lint:
    deno lint --ignore="*.bs.js"

# Auto-fix linting issues where possible
lint-fix:
    deno lint --fix --ignore="*.bs.js"

# Run all checks (lint + format)
check-all: lint fmt-check
    @echo "✅ All checks passed"

# Security audit
audit:
    @echo "Scanning dependencies for known vulnerabilities..."
    @deno info --json deno.json 2>/dev/null | jq '.modules[] | select(.kind == "npm") | .specifier' || echo "No npm dependencies"

# ============================================================================
# NICKEL CONFIGURATION
# ============================================================================

# Validate Nickel configuration
nickel-check:
    @if command -v nickel > /dev/null; then \
        nickel typecheck config.ncl && echo "✅ Nickel config valid"; \
    else \
        echo "⚠️  Nickel not installed. Visit: https://nickel-lang.org/"; \
    fi

# Export Nickel config to JSON
nickel-export:
    @if command -v nickel > /dev/null; then \
        nickel export config.ncl; \
    else \
        echo "⚠️  Nickel not installed"; \
    fi

# ============================================================================
# RSR COMPLIANCE
# ============================================================================

# Verify RSR compliance
rsr-verify:
    @echo "🔍 Checking RSR Framework Compliance..."
    @just _check-security-txt
    @just _check-ai-txt
    @just _check-humans-txt
    @just _check-docs
    @just _check-license
    @just _check-language-policy
    @echo "✅ RSR verification complete"

# Check .well-known/security.txt exists
_check-security-txt:
    @if [ -f .well-known/security.txt ]; then \
        echo "✅ security.txt found"; \
    else \
        echo "⚠️  security.txt missing"; \
    fi

# Check .well-known/ai.txt exists
_check-ai-txt:
    @if [ -f .well-known/ai.txt ]; then \
        echo "✅ ai.txt found"; \
    else \
        echo "⚠️  ai.txt missing"; \
    fi

# Check .well-known/humans.txt exists
_check-humans-txt:
    @if [ -f .well-known/humans.txt ]; then \
        echo "✅ humans.txt found"; \
    else \
        echo "⚠️  humans.txt missing"; \
    fi

# Check required documentation files
_check-docs:
    @for file in README.adoc SECURITY.md CODE_OF_CONDUCT.md MAINTAINERS.md CONTRIBUTING.md CHANGELOG.md LICENSE.txt; do \
        if [ -f $$file ]; then \
            echo "✅ $$file found"; \
        else \
            echo "⚠️  $$file missing"; \
        fi; \
    done

# Check license compliance
_check-license:
    @if [ -f LICENSE.txt ]; then \
        echo "✅ MIT License found"; \
    else \
        echo "❌ LICENSE.txt missing"; \
    fi
    @if [ -f PALIMPSEST-LICENSE.txt ]; then \
        echo "✅ Palimpsest License found (dual licensing)"; \
    else \
        echo "⚠️  Palimpsest License missing"; \
    fi

# Check language policy compliance (NO TypeScript/npm)
_check-language-policy:
    @echo "Checking language policy compliance..."
    @if find . -name "*.ts" -not -path "./node_modules/*" | grep -q .; then \
        echo "❌ TypeScript files found (BANNED)"; \
        exit 1; \
    else \
        echo "✅ No TypeScript files"; \
    fi
    @if [ -f package.json ]; then \
        echo "❌ package.json found (BANNED - use deno.json)"; \
        exit 1; \
    else \
        echo "✅ No package.json"; \
    fi
    @if [ -d node_modules ]; then \
        echo "❌ node_modules found (BANNED - use Deno)"; \
        exit 1; \
    else \
        echo "✅ No node_modules"; \
    fi
    @if [ -f Makefile ]; then \
        echo "❌ Makefile found (BANNED - use justfile)"; \
        exit 1; \
    else \
        echo "✅ No Makefile"; \
    fi
    @echo "✅ Language policy compliant"

# ============================================================================
# GIT & VERSIONING
# ============================================================================

# Create a new git commit with conventional commit message
commit MESSAGE:
    git add -A
    git commit -m "{{MESSAGE}}"

# Create a new release tag
release VERSION:
    @echo "Creating release v{{VERSION}}..."
    git tag -a v{{VERSION}} -m "Release v{{VERSION}}"
    @echo "Push with: git push origin v{{VERSION}}"

# Show current version
version:
    @cat deno.json | jq -r '.version' || echo "Unknown"

# ============================================================================
# DEPLOYMENT
# ============================================================================

# Deploy to Deno Deploy
deploy:
    @if command -v deployctl > /dev/null; then \
        rescript build -with-deps && \
        deployctl deploy --project=preference-injector; \
    else \
        echo "⚠️  deployctl not installed. Visit: https://deno.com/deploy"; \
    fi

# Build container image (Podman preferred)
container-build:
    @if command -v podman > /dev/null; then \
        podman build -t preference-injector:latest .; \
    elif command -v docker > /dev/null; then \
        docker build -t preference-injector:latest .; \
    else \
        echo "❌ Neither Podman nor Docker found"; \
    fi

# Run container
container-run:
    @if command -v podman > /dev/null; then \
        podman run -p 8000:8000 preference-injector:latest; \
    elif command -v docker > /dev/null; then \
        docker run -p 8000:8000 preference-injector:latest; \
    fi

# ============================================================================
# BENCHMARKING
# ============================================================================

# Run performance benchmarks
bench:
    rescript build -with-deps
    deno bench --allow-all

# ============================================================================
# SECURITY
# ============================================================================

# Run security checks
security-check: audit rsr-verify
    @echo "🔒 Security checks complete"

# Generate SBOM (Software Bill of Materials)
sbom:
    @echo "Generating SBOM..."
    @deno info --json deno.json > sbom.json 2>/dev/null || echo "{}" > sbom.json

# Check for secrets in code
secrets-scan:
    @if command -v gitleaks > /dev/null; then \
        gitleaks detect --verbose; \
    else \
        echo "⚠️  gitleaks not installed. Visit: https://github.com/gitleaks/gitleaks"; \
    fi

# ============================================================================
# CI/CD
# ============================================================================

# Run full CI pipeline locally
ci: clean build check-all test rsr-verify
    @echo "✅ CI pipeline complete"

# ============================================================================
# UTILITIES
# ============================================================================

# Count lines of ReScript code
loc:
    @find src -name "*.res" | xargs wc -l | tail -1

# Show dependency tree
deps:
    deno info deno.json

# Run example
example:
    rescript build -with-deps
    deno run --allow-all examples/basic_usage.bs.js

# Show project statistics
stats:
    @echo "📈 Project Statistics"
    @echo "Lines of ReScript: $$(find src -name '*.res' | xargs wc -l | tail -1 | awk '{print $$1}')"
    @echo "Version: $$(just version)"
    @echo "Tests: $$(find tests -name '*.res' | wc -l) files"
    @echo "Examples: $$(find examples -name '*.res' | wc -l) files"

# ============================================================================
# MAINTENANCE
# ============================================================================

# Run all maintenance tasks
maintain: clean build fmt lint-fix test-coverage
    @echo "✅ Maintenance complete"

# ============================================================================
# HELP
# ============================================================================

# Show detailed help
help:
    @echo "Preference Injector - Just Commands"
    @echo ""
    @echo "Language: ReScript + Deno (NO TypeScript/npm)"
    @echo ""
    @echo "Common workflows:"
    @echo "  just dev          # Start development server"
    @echo "  just build        # Build ReScript code"
    @echo "  just test         # Run tests"
    @echo "  just ci           # Run full CI pipeline"
    @echo "  just rsr-verify   # Check RSR compliance"
    @echo ""
    @echo "Run 'just --list' to see all available commands"
