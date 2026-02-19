#!/usr/bin/env node

/**
 * Bump version across all project files in sync.
 *
 * Updates:
 *   - package.json              (version field)
 *   - ControlManifest.Input.xml (control version attribute)
 *   - Solution/src/Other/Solution.xml (<Version> element)
 *
 * Usage:
 *   node scripts/bump-version.js <newVersion>
 *   node scripts/bump-version.js patch|minor|major
 *
 * Examples:
 *   node scripts/bump-version.js 2.1.0
 *   node scripts/bump-version.js patch   # 2.0.0 -> 2.0.1
 *   node scripts/bump-version.js minor   # 2.0.0 -> 2.1.0
 *   node scripts/bump-version.js major   # 2.0.0 -> 3.0.0
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

const FILES = {
  packageJson: path.join(ROOT, 'package.json'),
  manifest: path.join(ROOT, 'ControlManifest.Input.xml'),
  solution: path.join(ROOT, 'Solution', 'src', 'Other', 'Solution.xml'),
  readme: path.join(ROOT, 'README.md'),
};

// ── Helpers ──────────────────────────────────────────────────────────

function readFile(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function writeFile(filePath, content) {
  fs.writeFileSync(filePath, content, 'utf8');
}

function getCurrentVersion() {
  const pkg = JSON.parse(readFile(FILES.packageJson));
  return pkg.version;
}

function bumpSemver(current, level) {
  const parts = current.split('.').map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) {
    throw new Error(`Invalid semver: ${current}`);
  }

  switch (level) {
    case 'major':
      return `${parts[0] + 1}.0.0`;
    case 'minor':
      return `${parts[0]}.${parts[1] + 1}.0`;
    case 'patch':
      return `${parts[0]}.${parts[1]}.${parts[2] + 1}`;
    default:
      throw new Error(`Unknown bump level: ${level}`);
  }
}

function isValidSemver(version) {
  return /^\d+\.\d+\.\d+$/.test(version);
}

// ── Updaters ─────────────────────────────────────────────────────────

function updatePackageJson(newVersion) {
  const content = readFile(FILES.packageJson);
  const pkg = JSON.parse(content);
  const oldVersion = pkg.version;
  pkg.version = newVersion;
  // Preserve formatting (2-space indent + trailing newline)
  writeFile(FILES.packageJson, JSON.stringify(pkg, null, 2) + '\n');
  return oldVersion;
}

function updateManifest(newVersion) {
  let content = readFile(FILES.manifest);
  // Match: version="x.y.z" on the <control> element
  const regex = /(<control[\s\S]*?version=")([^"]+)(")/;
  const match = content.match(regex);
  if (!match) {
    throw new Error('Could not find version attribute in ControlManifest.Input.xml');
  }
  const oldVersion = match[2];
  content = content.replace(regex, `$1${newVersion}$3`);
  writeFile(FILES.manifest, content);
  return oldVersion;
}

function updateReadmeBadge(newVersion) {
  let content = readFile(FILES.readme);
  const regex = /(img\.shields\.io\/badge\/version-)[^-]+(-.+?style=for-the-badge)/;
  const match = content.match(regex);
  if (!match) {
    console.log('  ⚠ No version badge found in README.md (skipped)');
    return null;
  }
  const oldBadge = match[0];
  content = content.replace(regex, `$1${newVersion}$2`);
  writeFile(FILES.readme, content);
  return oldBadge;
}

function updateSolutionXml(newVersion) {
  let content = readFile(FILES.solution);
  const regex = /(<Version>)([^<]+)(<\/Version>)/;
  const match = content.match(regex);
  if (!match) {
    throw new Error('Could not find <Version> element in Solution.xml');
  }
  const oldVersion = match[2];
  content = content.replace(regex, `$1${newVersion}$3`);
  writeFile(FILES.solution, content);
  return oldVersion;
}

// ── Main ─────────────────────────────────────────────────────────────

function main() {
  const arg = process.argv[2];

  if (!arg) {
    console.error('Usage: node scripts/bump-version.js <version|patch|minor|major>');
    process.exit(1);
  }

  const currentVersion = getCurrentVersion();
  let newVersion;

  if (['patch', 'minor', 'major'].includes(arg)) {
    newVersion = bumpSemver(currentVersion, arg);
  } else if (isValidSemver(arg)) {
    newVersion = arg;
  } else {
    console.error(`Invalid version or bump level: "${arg}"`);
    console.error('Expected: patch, minor, major, or a semver like 2.1.0');
    process.exit(1);
  }

  console.log(`Bumping version: ${currentVersion} → ${newVersion}\n`);

  updatePackageJson(newVersion);
  console.log(`  ✓ package.json`);

  updateManifest(newVersion);
  console.log(`  ✓ ControlManifest.Input.xml`);

  updateSolutionXml(newVersion);
  console.log(`  ✓ Solution/src/Other/Solution.xml`);

  updateReadmeBadge(newVersion);
  console.log(`  ✓ README.md (version badge)`);

  console.log(`\nDone. Version is now ${newVersion}.`);
  console.log(`\nNext steps:`);
  console.log(`  git add -A && git commit -m "chore: bump version to ${newVersion}"`);
  console.log(`  git tag v${newVersion}`);
  console.log(`  git push && git push --tags`);
}

main();
