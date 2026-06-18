#!/usr/bin/env node
// Build the self-contained index.html by injecting data/options-<YEAR>.json
// into scripts/app-template.html. The shipped index.html has the data inlined,
// so it works offline / from file:// with no fetch. Re-run after editing the JSON:
//   node scripts/build-app.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const YEAR = process.argv[2] || '2026';
const DATA_PATH = resolve(ROOT, `data/options-${YEAR}.json`);
const TEMPLATE = resolve(ROOT, 'scripts/app-template.html');
const OUT = resolve(ROOT, 'index.html');

// Parse to validate, then re-stringify compactly so the inlined blob is clean.
const data = JSON.parse(readFileSync(DATA_PATH, 'utf8'));
// Escape angle brackets so a future data edit can never break out of the inline
// <script> (e.g. a literal </script> in a string value). Result is still valid JS.
const json = JSON.stringify(data).replace(/</g, '\\u003c').replace(/>/g, '\\u003e');

const template = readFileSync(TEMPLATE, 'utf8');
if (!template.includes('__DATA_JSON__')) {
  throw new Error('Template is missing the __DATA_JSON__ placeholder.');
}
const html = template.replace('__DATA_JSON__', json);
writeFileSync(OUT, html, 'utf8');
console.log(`Built ${OUT} (${data.options.length} options, ${data.catalog.length} items, ${html.length} bytes).`);
