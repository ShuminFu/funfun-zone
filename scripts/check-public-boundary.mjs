/**
 * Fails the public build if private notes, a private-repo checkout, or an
 * owner identity could be published with the site.
 */

import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const checkDist = process.argv.includes('--dist');
const failures = [];

function fail(message) {
  failures.push(message);
}

function read(relative) {
  return fs.readFileSync(path.join(root, relative), 'utf8');
}

function walk(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === '.git') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else files.push(full);
  }
  return files;
}

if (fs.existsSync(path.join(root, '.gitmodules'))) fail('.gitmodules would let the public build check out another repo');

const packageJson = JSON.parse(read('package.json'));
for (const section of ['dependencies', 'devDependencies', 'optionalDependencies']) {
  for (const [name, spec] of Object.entries(packageJson[section] ?? {})) {
    if (/git\+|github:|gitlab:|ssh:\/\//.test(String(spec))) fail(`${name} depends on ${spec}`);
  }
}
for (const [name, script] of Object.entries(packageJson.scripts ?? {})) {
  if (name !== 'test' && /build-catalog|submodule|git clone|PRIVATE_NOTES/.test(String(script))) {
    fail(`npm script ${name} reaches into private notes`);
  }
}

const catalog = JSON.parse(read('deploy/private-notes/catalog.json'));
if (!Array.isArray(catalog.notes) || catalog.notes.length !== 0) {
  fail('deploy/private-notes/catalog.json must stay an empty notes array');
}

const notesDir = path.join(root, 'deploy/private-notes/notes');
const noteFiles = fs.readdirSync(notesDir).filter((name) => name !== 'README.md');
if (noteFiles.length > 0) fail(`unexpected files in deploy/private-notes/notes: ${noteFiles.join(', ')}`);

const worker = read('deploy/private-notes/src/worker.ts');
if (/from ['"][^'"]+\.md['"]|readFileSync|readdirSync/.test(worker)) {
  fail('the private worker must not read note files while it is serving');
}

for (const file of walk(path.join(root, 'functions'))) {
  const text = fs.readFileSync(file, 'utf8');
  if (text.includes('deploy/private-notes')) fail(`${path.relative(root, file)} imports the private deployment`);
}

const header = read('src/components/Header.astro');
if (!header.includes('owner-entry:desktop') || !header.includes('owner-entry:mobile')) {
  fail('the header is missing the owner-entry markers');
}
if (header.includes('/private/') || header.includes('Private Notes')) {
  fail('the static header contains the private entry');
}

const config = read('src/config.ts');
if (config.includes("'/private") || config.includes('"/private')) fail('site navigation points at private notes');

for (const file of [...walk(path.join(root, 'src')), ...walk(path.join(root, 'public'))]) {
  const relative = path.relative(root, file);
  if (relative.includes('.obsidian/') || relative === 'src/pages/robots.txt.ts') continue;
  if (/\.(png|webp|jpg|jpeg|gif|avif|woff2?)$/.test(relative)) continue;
  const text = fs.readFileSync(file, 'utf8');
  if (text.includes('Private Notes') || text.includes('href="/private/') || text.includes("href='/private/'")) {
    fail(`${relative} contains the private entry`);
  }
}

const allowedFixture = (relative) =>
  relative.endsWith('.test.ts') || relative.endsWith('.test.mjs') || relative === 'functions/lib/jwt-fixture.ts';

for (const file of walk(root)) {
  const relative = path.relative(root, file);
  if (
    relative === 'scripts/check-public-boundary.mjs' ||
    relative.startsWith('dist/') ||
    relative.startsWith('node_modules/') ||
    relative.startsWith('.git/')
  ) {
    continue;
  }
  if (!/\.(ts|mjs|js|astro|md|json|toml|yml|yaml|txt|example)$/.test(relative)) continue;
  if (allowedFixture(relative)) continue;
  const text = fs.readFileSync(file, 'utf8');
  if (text.includes('FIXTURE_PRIVATE_NOTE_BODY') || text.includes('owner@fixture.test') || text.includes('private-notes.fixture.test')) {
    fail(`${relative} contains a private-notes test fixture`);
  }
  if (/OWNER_EMAIL\s*[:=]\s*['"][^'"]*@/.test(text)) fail(`${relative} assigns OWNER_EMAIL`);
}

if (checkDist) {
  const dist = path.join(root, 'dist');
  if (!fs.existsSync(dist)) fail('dist/ is missing');
  if (fs.existsSync(path.join(dist, 'private', 'index.html'))) fail('dist/private/index.html would publish a private page as a static file');
  for (const file of walk(dist)) {
    const relative = path.relative(root, file);
    const text = fs.readFileSync(file, 'utf8');
    if (text.includes('FIXTURE_PRIVATE_NOTE_BODY')) fail(`${relative} contains the test note`);
    if (relative.endsWith('.html') && (text.includes('Private Notes') || text.includes('href="/private/"') || text.includes("href='/private/'"))) {
      fail(`${relative} contains the private entry`);
    }
    if (/llms\.txt$|sitemap/.test(relative) && (text.includes('/private/') || text.includes('/auth/'))) {
      fail(`${relative} lists a gated path`);
    }
  }
}

if (failures.length > 0) {
  console.error(failures.map((item) => `- ${item}`).join('\n'));
  process.exit(1);
}

console.log(checkDist ? 'public boundary holds, including dist/' : 'public boundary holds');
