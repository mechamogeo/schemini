#!/usr/bin/env node

/**
 * Publish script with npm provenance support.
 *
 * This script publishes packages that have been versioned by changesets,
 * using npm publish with --provenance flag for verified npm releases.
 *
 * The provenance flag requires:
 * - Running in GitHub Actions
 * - id-token: write permission in the workflow
 * - registry-url set to https://registry.npmjs.org
 */

import { execSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

const packages = [
  { name: '@schemini/core', path: 'packages/core' },
  { name: '@schemini/locale', path: 'packages/locale' },
];

function getPackageVersion(pkgPath) {
  const pkgJsonPath = join(rootDir, pkgPath, 'package.json');
  const pkgJson = JSON.parse(readFileSync(pkgJsonPath, 'utf-8'));
  return pkgJson.version;
}

function getPublishedVersion(pkgName) {
  try {
    const result = execSync(`npm view ${pkgName} version 2>/dev/null`, {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    return result.trim();
  } catch {
    // Package not published yet
    return null;
  }
}

function publishPackage(pkgName, pkgPath) {
  const fullPath = join(rootDir, pkgPath);
  const localVersion = getPackageVersion(pkgPath);
  const publishedVersion = getPublishedVersion(pkgName);

  console.log(`\n📦 ${pkgName}`);
  console.log(`   Local version: ${localVersion}`);
  console.log(`   Published version: ${publishedVersion || 'not published'}`);

  if (publishedVersion === localVersion) {
    console.log('   ⏭️  Skipping (already published)');
    return false;
  }

  console.log('   🚀 Publishing with provenance...');

  try {
    // Check if we're in GitHub Actions (provenance requires this)
    const isGitHubActions = process.env.GITHUB_ACTIONS === 'true';

    const provenanceFlag = isGitHubActions ? '--provenance' : '';
    const command = `npm publish --access public ${provenanceFlag}`.trim();

    execSync(command, {
      cwd: fullPath,
      stdio: 'inherit',
      env: {
        ...process.env,
        // Ensure npm uses the correct registry
        npm_config_registry: 'https://registry.npmjs.org',
      },
    });

    console.log(`   ✅ Published ${pkgName}@${localVersion}`);
    return true;
  } catch (error) {
    console.error(`   ❌ Failed to publish ${pkgName}:`, error.message);
    throw error;
  }
}

async function main() {
  console.log('🔍 Checking packages for publishing...\n');

  let published = 0;
  const publishedPackages = [];

  for (const pkg of packages) {
    // Check if package directory exists
    const pkgPath = join(rootDir, pkg.path);
    if (!existsSync(pkgPath)) {
      console.log(`⚠️  Skipping ${pkg.name} (directory not found)`);
      continue;
    }

    // Check if package.json exists
    const pkgJsonPath = join(pkgPath, 'package.json');
    if (!existsSync(pkgJsonPath)) {
      console.log(`⚠️  Skipping ${pkg.name} (package.json not found)`);
      continue;
    }

    const wasPublished = publishPackage(pkg.name, pkg.path);
    if (wasPublished) {
      published++;
      publishedPackages.push({
        name: pkg.name,
        version: getPackageVersion(pkg.path),
      });
    }
  }

  console.log(`\n${'='.repeat(50)}`);

  if (published > 0) {
    console.log(`✅ Published ${published} package(s)`);

    // Output for GitHub Actions
    if (process.env.GITHUB_OUTPUT) {
      const output = `publishedPackages=${JSON.stringify(publishedPackages)}\npublished=true\n`;
      execSync(`echo "${output}" >> $GITHUB_OUTPUT`);
    }
  } else {
    console.log('📭 No packages needed publishing');

    if (process.env.GITHUB_OUTPUT) {
      execSync('echo "published=false" >> $GITHUB_OUTPUT');
    }
  }
}

main().catch((error) => {
  console.error('❌ Publish failed:', error);
  process.exit(1);
});
