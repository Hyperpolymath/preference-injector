#!/usr/bin/env -S deno run --allow-read

/**
 * RSR Compliance Score Calculator
 * Calculates Bronze/Silver/Gold/Rhodium compliance score
 */

interface ComplianceCheck {
  category: string;
  bronze: { points: number; check: () => Promise<boolean> };
  silver?: { points: number; check: () => Promise<boolean> };
  gold?: { points: number; check: () => Promise<boolean> };
  rhodium?: { points: number; check: () => Promise<boolean> };
}

const fileExists = async (path: string): Promise<boolean> => {
  try {
    await Deno.stat(path);
    return true;
  } catch {
    return false;
  }
};

const fileContains = async (path: string, text: string): Promise<boolean> => {
  try {
    const content = await Deno.readTextFile(path);
    return content.includes(text);
  } catch {
    return false;
  }
};

const checks: ComplianceCheck[] = [
  {
    category: "1. Type Safety",
    bronze: {
      points: 80,
      check: async () => await fileExists("deno.json") &&
        await fileContains("deno.json", '"strict": true')
    },
    silver: {
      points: 20,
      check: async () => await fileExists("bsconfig.json") // ReScript
    },
  },
  {
    category: "2. Memory Safety",
    bronze: {
      points: 40,
      check: async () => await fileExists("deno.json") // Deno sandbox
    },
    gold: {
      points: 60,
      check: async () => await fileExists("src/rust/") // Rust core
    },
  },
  {
    category: "3. Offline-First",
    bronze: {
      points: 50,
      check: async () => await fileExists("src/providers/offline-provider.ts") &&
        await fileContains("src/providers/offline-provider.ts", "IndexedDB")
    },
    silver: {
      points: 30,
      check: async () => false // TODO: CRDT sync
    },
    gold: {
      points: 20,
      check: async () => false // TODO: Full offline mode
    },
  },
  {
    category: "4. Documentation",
    bronze: {
      points: 60,
      check: async () => {
        const required = [
          "README.md",
          "SECURITY.md",
          "CODE_OF_CONDUCT.md",
          "MAINTAINERS.md",
          "CONTRIBUTING.md",
          "CHANGELOG.md",
          "LICENSE"
        ];
        const checks = await Promise.all(required.map(fileExists));
        return checks.every(Boolean);
      }
    },
    silver: {
      points: 40,
      check: async () => await fileExists("docs/API.md")
    },
  },
  {
    category: "5. Build System",
    bronze: {
      points: 40,
      check: async () => await fileExists("justfile")
    },
    silver: {
      points: 30,
      check: async () => await fileExists("flake.nix")
    },
    gold: {
      points: 30,
      check: async () => false // TODO: Multi-platform builds
    },
  },
  {
    category: "6. Testing",
    bronze: {
      points: 50,
      check: async () => {
        const hasTests = await fileExists("tests/");
        return hasTests;
      }
    },
    silver: {
      points: 30,
      check: async () => false // TODO: 100% test pass rate
    },
    gold: {
      points: 20,
      check: async () => false // TODO: Property-based testing
    },
  },
  {
    category: "7. Security",
    bronze: {
      points: 30,
      check: async () => await fileExists("SECURITY.md")
    },
    silver: {
      points: 40,
      check: async () => {
        const cryptoFiles = [
          "src/crypto/mod.ts",
          "src/crypto/signatures.ts",
          "src/crypto/keyexchange.ts",
          "src/crypto/hashing.ts",
        ];
        const checks = await Promise.all(cryptoFiles.map(fileExists));
        return checks.every(Boolean);
      }
    },
    gold: {
      points: 30,
      check: async () => false // TODO: Formal verification
    },
  },
  {
    category: "8. .well-known/",
    bronze: {
      points: 100,
      check: async () => {
        const required = [
          ".well-known/security.txt",
          ".well-known/ai.txt",
          ".well-known/humans.txt"
        ];
        const checks = await Promise.all(required.map(fileExists));
        return checks.every(Boolean);
      }
    },
  },
  {
    category: "9. TPCF",
    bronze: {
      points: 50,
      check: async () => {
        return await fileExists("MAINTAINERS.md") &&
          await fileContains("MAINTAINERS.md", "Perimeter");
      }
    },
    silver: {
      points: 50,
      check: async () => false // TODO: Automated perimeter promotion
    },
  },
  {
    category: "10. Licensing",
    bronze: {
      points: 100,
      check: async () => await fileExists("LICENSE")
    },
    silver: {
      points: 0,
      check: async () => await fileExists("PALIMPSEST-LICENSE.txt")
    },
  },
  {
    category: "11. Distribution",
    bronze: {
      points: 50,
      check: async () => {
        const templates = [
          ".gitlab-ci.yml",
          ".github/workflows/ci-extended.yml",
          "bitbucket-pipelines.yml"
        ];
        const checks = await Promise.all(templates.map(fileExists));
        return checks.every(Boolean);
      }
    },
    silver: {
      points: 50,
      check: async () => false // TODO: Editor snippets
    },
  },
];

async function calculateScore() {
  console.log("🔍 RSR Compliance Score Calculator\n");
  console.log("=" .repeat(70));

  let totalPoints = 0;
  let earnedPoints = 0;

  for (const check of checks) {
    console.log(`\n${check.category}`);

    // Bronze
    const bronzePassed = await check.bronze.check();
    totalPoints += check.bronze.points;
    if (bronzePassed) {
      earnedPoints += check.bronze.points;
      console.log(`  ✅ Bronze: ${check.bronze.points}/${check.bronze.points} points`);
    } else {
      console.log(`  ❌ Bronze: 0/${check.bronze.points} points`);
    }

    // Silver
    if (check.silver) {
      const silverPassed = await check.silver.check();
      totalPoints += check.silver.points;
      if (silverPassed) {
        earnedPoints += check.silver.points;
        console.log(`  ✅ Silver: ${check.silver.points}/${check.silver.points} points`);
      } else {
        console.log(`  ⚠️  Silver: 0/${check.silver.points} points`);
      }
    }

    // Gold
    if (check.gold) {
      const goldPassed = await check.gold.check();
      totalPoints += check.gold.points;
      if (goldPassed) {
        earnedPoints += check.gold.points;
        console.log(`  ✅ Gold: ${check.gold.points}/${check.gold.points} points`);
      } else {
        console.log(`  ⚠️  Gold: 0/${check.gold.points} points`);
      }
    }

    // Rhodium
    if (check.rhodium) {
      const rhodiumPassed = await check.rhodium.check();
      totalPoints += check.rhodium.points;
      if (rhodiumPassed) {
        earnedPoints += check.rhodium.points;
        console.log(`  ✅ Rhodium: ${check.rhodium.points}/${check.rhodium.points} points`);
      } else {
        console.log(`  ⚠️  Rhodium: 0/${check.rhodium.points} points`);
      }
    }
  }

  console.log("\n" + "=".repeat(70));
  console.log(`\n📊 Total Score: ${earnedPoints}/${totalPoints} points (${(earnedPoints / totalPoints * 100).toFixed(1)}%)\n`);

  // Determine tier
  const percentage = (earnedPoints / totalPoints) * 100;
  let tier = "None";
  let emoji = "❌";

  if (percentage >= 95) {
    tier = "Rhodium";
    emoji = "💎";
  } else if (percentage >= 85) {
    tier = "Gold";
    emoji = "🥇";
  } else if (percentage >= 75) {
    tier = "Silver";
    emoji = "🥈";
  } else if (percentage >= 70) {
    tier = "Bronze";
    emoji = "🥉";
  }

  console.log(`${emoji} Compliance Tier: ${tier}\n`);

  if (tier === "None") {
    console.log("❌ Not yet compliant. Target: 70% for Bronze certification.");
    console.log("\nNext steps:");
    console.log("  1. Run: just rsr-verify");
    console.log("  2. Add missing documentation files");
    console.log("  3. Implement offline-first architecture");
    console.log("  4. Add comprehensive tests\n");
  } else {
    console.log(`✅ ${tier} Level Certified!\n`);
  }
}

if (import.meta.main) {
  await calculateScore();
}
