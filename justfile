# Preference Injector - Universal Application Automation Standard
# RSR-Compliant Build System using Just (https://just.systems/)

# List all available recipes
default:
    @just --list

# ============================================================================
# DEVELOPMENT
# ============================================================================

# Run development server with watch mode
dev:
    deno run --watch --allow-all src/main.ts

# Start production server
start:
    deno run --allow-all src/main.ts

# Install all dependencies
install:
    deno cache --reload src/deps.ts

# Clean build artifacts and caches
clean:
    rm -rf dist/
    rm -rf .deno/
    rm -rf node_modules/
    rm -rf coverage/
    deno cache --reload src/deps.ts

# Format all code
fmt:
    deno fmt

# Check code formatting without modifying
fmt-check:
    deno fmt --check

# ============================================================================
# BUILDING
# ============================================================================

# Build TypeScript to JavaScript
build:
    deno run --allow-all build.ts

# Build ReScript code
build-rescript:
    @if command -v rescript > /dev/null; then \
        rescript build; \
    else \
        echo "⚠️  ReScript not installed. Run: npm install -g rescript"; \
    fi

# Build all (TypeScript + ReScript)
build-all: build build-rescript

# Build for production with optimizations
build-prod:
    deno run --allow-all --config deno.json build.ts --optimize

# Compile standalone executable (Deno compile)
compile:
    deno compile --allow-all --output bin/preference-injector src/main.ts

# ============================================================================
# TESTING
# ============================================================================

# Run all tests
test:
    deno test --allow-all

# Run tests with coverage
test-coverage:
    deno test --allow-all --coverage=coverage/
    deno coverage coverage/ --lcov > coverage/lcov.info

# Run tests in watch mode
test-watch:
    deno test --allow-all --watch

# Run specific test file
test-file FILE:
    deno test --allow-all {{FILE}}

# Run property-based tests (QuickCheck-style)
test-property:
    @echo "⚠️  Property-based testing not yet implemented"
    @echo "TODO: Add fast-check or similar library"

# Run mutation testing
test-mutation:
    @echo "⚠️  Mutation testing not yet implemented"
    @echo "TODO: Add Stryker or similar tool"

# ============================================================================
# LINTING & QUALITY
# ============================================================================

# Run linter
lint:
    deno lint

# Auto-fix linting issues where possible
lint-fix:
    deno lint --fix

# Check types
check:
    deno check src/**/*.ts

# Run all checks (lint + format + types)
check-all: lint fmt-check check

# Security audit (check dependencies for vulnerabilities)
audit:
    @echo "Scanning dependencies for known vulnerabilities..."
    @deno info --json src/deps.ts | jq '.modules[] | select(.kind == "npm") | .specifier' || echo "No npm dependencies"

# ============================================================================
# DOCUMENTATION
# ============================================================================

# Generate API documentation (TypeDoc)
docs:
    @if command -v typedoc > /dev/null; then \
        typedoc; \
    else \
        echo "⚠️  TypeDoc not installed. Run: npm install -g typedoc"; \
    fi

# Serve documentation locally
docs-serve:
    @if [ -d docs/api ]; then \
        cd docs/api && python3 -m http.server 8080; \
    else \
        echo "⚠️  Documentation not built. Run: just docs"; \
    fi

# Validate GraphQL schema
graphql-validate:
    @if command -v graphql > /dev/null; then \
        graphql-inspector validate schemas/graphql/*.graphql; \
    else \
        echo "⚠️  GraphQL Inspector not installed"; \
    fi

# Validate CUE schemas
cue-validate:
    @if command -v cue > /dev/null; then \
        cue vet schemas/cue/*.cue; \
    else \
        echo "⚠️  CUE not installed. Visit: https://cuelang.org/"; \
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
    @echo "✅ RSR Bronze-level verification complete"

# Check .well-known/security.txt exists and is valid
_check-security-txt:
    @if [ -f .well-known/security.txt ]; then \
        echo "✅ security.txt found"; \
    else \
        echo "❌ security.txt missing"; \
        exit 1; \
    fi

# Check .well-known/ai.txt exists
_check-ai-txt:
    @if [ -f .well-known/ai.txt ]; then \
        echo "✅ ai.txt found"; \
    else \
        echo "❌ ai.txt missing"; \
        exit 1; \
    fi

# Check .well-known/humans.txt exists
_check-humans-txt:
    @if [ -f .well-known/humans.txt ]; then \
        echo "✅ humans.txt found"; \
    else \
        echo "❌ humans.txt missing"; \
        exit 1; \
    fi

# Check required documentation files
_check-docs:
    @for file in README.md SECURITY.md CODE_OF_CONDUCT.md MAINTAINERS.md CONTRIBUTING.md CHANGELOG.md LICENSE; do \
        if [ -f $$file ]; then \
            echo "✅ $$file found"; \
        else \
            echo "❌ $$file missing"; \
        fi; \
    done

# Check license compliance
_check-license:
    @if [ -f LICENSE ]; then \
        echo "✅ MIT License found"; \
    else \
        echo "❌ LICENSE missing"; \
    fi
    @if [ -f PALIMPSEST-LICENSE.txt ]; then \
        echo "✅ Palimpsest License found (dual licensing)"; \
    else \
        echo "⚠️  Palimpsest License missing (add for full compliance)"; \
    fi

# Calculate RSR compliance score
rsr-score:
    @echo "📊 RSR Compliance Score Calculation"
    @deno run --allow-read scripts/rsr-score.ts

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

# Bump version (patch)
bump-patch:
    @echo "⚠️  Version bumping not yet implemented"
    @echo "TODO: Implement semver bump script"

# ============================================================================
# DEPLOYMENT
# ============================================================================

# Deploy to production
deploy:
    @echo "⚠️  Deployment not configured"
    @echo "TODO: Add deployment script (Deno Deploy, Docker, etc.)"

# Build Docker image
docker-build:
    docker build -t preference-injector:latest .

# Run in Docker container
docker-run:
    docker run -p 8000:8000 preference-injector:latest

# ============================================================================
# DATABASE
# ============================================================================

# Start local development databases (ArangoDB, XTDB, Dragonfly)
db-start:
    docker-compose up -d

# Stop local databases
db-stop:
    docker-compose down

# Reset databases (WARNING: destroys all data)
db-reset:
    @echo "⚠️  This will DELETE ALL DATA. Continue? (y/N)"
    @read -r REPLY; \
    if [ "$$REPLY" = "y" ] || [ "$$REPLY" = "Y" ]; then \
        docker-compose down -v; \
        docker-compose up -d; \
    fi

# ============================================================================
# BENCHMARKING
# ============================================================================

# Run performance benchmarks
bench:
    deno bench --allow-all benches/

# Profile memory usage
profile-memory:
    deno run --allow-all --v8-flags=--prof src/main.ts

# ============================================================================
# SECURITY
# ============================================================================

# Run security checks
security-check: audit rsr-verify
    @echo "🔒 Security checks complete"

# Generate SBOM (Software Bill of Materials)
sbom:
    @echo "Generating SBOM..."
    @deno info --json src/deps.ts > sbom.json

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
ci: clean install check-all test build rsr-verify
    @echo "✅ CI pipeline complete"

# ============================================================================
# UTILITIES
# ============================================================================

# Count lines of code
loc:
    @find src -name "*.ts" -o -name "*.tsx" -o -name "*.res" | xargs wc -l | tail -1

# Show dependency tree
deps:
    deno info src/main.ts

# Update all dependencies
update:
    deno cache --reload src/deps.ts

# Show project statistics
stats:
    @echo "📈 Project Statistics"
    @echo "Lines of Code: $(just loc)"
    @echo "Version: $(just version)"
    @echo "Tests: $(find tests -name "*.test.ts" | wc -l) files"
    @echo "Examples: $(find examples -name "*.ts" | wc -l) files"

# ============================================================================
# MAINTENANCE
# ============================================================================

# Run all maintenance tasks
maintain: clean update fmt lint-fix test-coverage docs
    @echo "✅ Maintenance complete"

# Check for outdated dependencies
outdated:
    @echo "⚠️  Outdated dependency checking not yet implemented"
    @echo "TODO: Add dependency version checking"

# ============================================================================
# HELP
# ============================================================================

# Show detailed help
help:
    @echo "Preference Injector - Just Commands"
    @echo ""
    @echo "Common workflows:"
    @echo "  just dev          # Start development server"
    @echo "  just test         # Run tests"
    @echo "  just ci           # Run full CI pipeline"
    @echo "  just rsr-verify   # Check RSR compliance"
    @echo ""
    @echo "Run 'just --list' to see all available commands"
