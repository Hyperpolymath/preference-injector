#!/bin/bash
# Quick RSR compliance verification (bash version)

echo "🔍 RSR Compliance Verification"
echo "================================"
echo ""

total_bronze=0
earned_bronze=0
total_silver=0
earned_silver=0
total_gold=0
earned_gold=0

# 1. Type Safety
echo "1. Type Safety"
if [ -f "deno.json" ] && grep -q '"strict": true' deno.json; then
  echo "  ✅ Bronze: 80/80 points"
  earned_bronze=$((earned_bronze + 80))
else
  echo "  ❌ Bronze: 0/80 points"
fi
total_bronze=$((total_bronze + 80))

if [ -f "bsconfig.json" ]; then
  echo "  ✅ Silver: 20/20 points"
  earned_silver=$((earned_silver + 20))
else
  echo "  ⚠️  Silver: 0/20 points"
fi
total_silver=$((total_silver + 20))

# 2. Memory Safety
echo ""
echo "2. Memory Safety"
if [ -f "deno.json" ]; then
  echo "  ✅ Bronze: 40/40 points"
  earned_bronze=$((earned_bronze + 40))
else
  echo "  ❌ Bronze: 0/40 points"
fi
total_bronze=$((total_bronze + 40))
total_gold=$((total_gold + 60))
echo "  ⚠️  Gold: 0/60 points (Rust core)"

# 3. Offline-First
echo ""
echo "3. Offline-First"
if [ -f "src/providers/offline-provider.ts" ] && grep -q "IndexedDB" src/providers/offline-provider.ts; then
  echo "  ✅ Bronze: 50/50 points"
  earned_bronze=$((earned_bronze + 50))
else
  echo "  ❌ Bronze: 0/50 points"
fi
total_bronze=$((total_bronze + 50))
total_silver=$((total_silver + 30))
total_gold=$((total_gold + 20))
echo "  ⚠️  Silver: 0/30 points (CRDT sync)"
echo "  ⚠️  Gold: 0/20 points (Full offline)"

# 4. Documentation
echo ""
echo "4. Documentation"
docs_missing=0
for file in README.md SECURITY.md CODE_OF_CONDUCT.md MAINTAINERS.md CONTRIBUTING.md CHANGELOG.md LICENSE; do
  [ ! -f "$file" ] && docs_missing=1
done
if [ $docs_missing -eq 0 ]; then
  echo "  ✅ Bronze: 60/60 points"
  earned_bronze=$((earned_bronze + 60))
else
  echo "  ❌ Bronze: 0/60 points"
fi
total_bronze=$((total_bronze + 60))

if [ -f "docs/API.md" ]; then
  echo "  ✅ Silver: 40/40 points"
  earned_silver=$((earned_silver + 40))
else
  echo "  ⚠️  Silver: 0/40 points (API docs)"
fi
total_silver=$((total_silver + 40))

# 5. Build System
echo ""
echo "5. Build System"
if [ -f "justfile" ]; then
  echo "  ✅ Bronze: 40/40 points"
  earned_bronze=$((earned_bronze + 40))
else
  echo "  ❌ Bronze: 0/40 points"
fi
total_bronze=$((total_bronze + 40))

if [ -f "flake.nix" ]; then
  echo "  ✅ Silver: 30/30 points"
  earned_silver=$((earned_silver + 30))
else
  echo "  ⚠️  Silver: 0/30 points"
fi
total_silver=$((total_silver + 30))
total_gold=$((total_gold + 30))
echo "  ⚠️  Gold: 0/30 points (Multi-platform builds)"

# 6. Testing
echo ""
echo "6. Testing"
if [ -d "tests/" ]; then
  echo "  ✅ Bronze: 50/50 points"
  earned_bronze=$((earned_bronze + 50))
else
  echo "  ❌ Bronze: 0/50 points"
fi
total_bronze=$((total_bronze + 50))
total_silver=$((total_silver + 30))
total_gold=$((total_gold + 20))
echo "  ⚠️  Silver: 0/30 points (100% pass rate)"
echo "  ⚠️  Gold: 0/20 points (Property-based testing)"

# 7. Security
echo ""
echo "7. Security"
if [ -f "SECURITY.md" ]; then
  echo "  ✅ Bronze: 30/30 points"
  earned_bronze=$((earned_bronze + 30))
else
  echo "  ❌ Bronze: 0/30 points"
fi
total_bronze=$((total_bronze + 30))

# Check for post-quantum crypto implementation
if [ -f "src/crypto/mod.ts" ] && [ -f "src/crypto/signatures.ts" ] && [ -f "src/crypto/keyexchange.ts" ] && [ -f "src/crypto/hashing.ts" ]; then
  echo "  ✅ Silver: 40/40 points"
  earned_silver=$((earned_silver + 40))
else
  echo "  ⚠️  Silver: 0/40 points (Post-quantum crypto)"
fi
total_silver=$((total_silver + 40))

total_gold=$((total_gold + 30))
echo "  ⚠️  Gold: 0/30 points (Formal verification)"

# 8. .well-known/
echo ""
echo "8. .well-known/"
wellknown_missing=0
for file in .well-known/security.txt .well-known/ai.txt .well-known/humans.txt; do
  [ ! -f "$file" ] && wellknown_missing=1
done
if [ $wellknown_missing -eq 0 ]; then
  echo "  ✅ Bronze: 100/100 points"
  earned_bronze=$((earned_bronze + 100))
else
  echo "  ❌ Bronze: 0/100 points"
fi
total_bronze=$((total_bronze + 100))

# 9. TPCF
echo ""
echo "9. TPCF"
if [ -f "MAINTAINERS.md" ] && grep -q "Perimeter" MAINTAINERS.md; then
  echo "  ✅ Bronze: 50/50 points"
  earned_bronze=$((earned_bronze + 50))
else
  echo "  ❌ Bronze: 0/50 points"
fi
total_bronze=$((total_bronze + 50))
total_silver=$((total_silver + 50))
echo "  ⚠️  Silver: 0/50 points (Automated promotion)"

# 10. Licensing
echo ""
echo "10. Licensing"
if [ -f "LICENSE" ]; then
  echo "  ✅ Bronze: 100/100 points"
  earned_bronze=$((earned_bronze + 100))
else
  echo "  ❌ Bronze: 0/100 points"
fi
total_bronze=$((total_bronze + 100))
# Silver is 0 points for PALIMPSEST
total_silver=$((total_silver + 0))

# 11. Distribution
echo ""
echo "11. Distribution"
platform_missing=0
for file in .gitlab-ci.yml .github/workflows/ci-extended.yml bitbucket-pipelines.yml; do
  [ ! -f "$file" ] && platform_missing=1
done
if [ $platform_missing -eq 0 ]; then
  echo "  ✅ Bronze: 50/50 points"
  earned_bronze=$((earned_bronze + 50))
else
  echo "  ❌ Bronze: 0/50 points"
fi
total_bronze=$((total_bronze + 50))

if [ -f ".vscode/preference-injector.code-snippets" ]; then
  echo "  ✅ Silver: 50/50 points"
  earned_silver=$((earned_silver + 50))
else
  echo "  ⚠️  Silver: 0/50 points (Editor snippets)"
fi
total_silver=$((total_silver + 50))

# Calculate totals
echo ""
echo "================================"
total_points=$((total_bronze + total_silver + total_gold))
earned_points=$((earned_bronze + earned_silver + earned_gold))

echo ""
echo "📊 Score Breakdown:"
echo "   Bronze: $earned_bronze/$total_bronze points"
echo "   Silver: $earned_silver/$total_silver points"
echo "   Gold: $earned_gold/$total_gold points"
echo ""
echo "📊 Total Score: $earned_points/$total_points points"

# Calculate percentage
percentage=$((earned_points * 100 / total_points))
echo "   Percentage: $percentage%"
echo ""

# Determine tier
if [ $percentage -ge 95 ]; then
  echo "💎 Compliance Tier: Rhodium"
elif [ $percentage -ge 85 ]; then
  echo "🥇 Compliance Tier: Gold"
elif [ $percentage -ge 75 ]; then
  echo "🥈 Compliance Tier: Silver"
elif [ $percentage -ge 70 ]; then
  echo "🥉 Compliance Tier: Bronze"
else
  echo "❌ Not yet compliant (need 70% for Bronze)"
  echo ""
  echo "Points needed for Bronze: $((total_points * 70 / 100 - earned_points))"
fi
echo ""
