#!/usr/bin/env node
// Generate per-option markdown checklists from data/options-<YEAR>.json.
// Single source of truth: this applies the SAME render rule the web app uses,
// so the markdown files and the app can never drift. Re-run after editing the JSON:
//   node scripts/generate-checklists.mjs
import { readFileSync, writeFileSync, mkdirSync, readdirSync, rmSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const YEAR = process.argv[2] || '2026';
const DATA_PATH = resolve(ROOT, `data/options-${YEAR}.json`);
const OUT_DIR = resolve(ROOT, `checklists/${YEAR}`);

const data = JSON.parse(readFileSync(DATA_PATH, 'utf8'));

// ---- The canonical render rule (mirrors the app) ----
function renderOption(opt) {
  const F = new Set(opt.provides || []);
  return (data.catalog || []).filter((it) => {
    if (it.providedBy && it.providedBy.some((f) => F.has(f))) return false; // provided => removed
    if (it.addedBy && it.addedBy.length) return it.addedBy.some((f) => F.has(f)); // conditional add
    return true; // universal
  });
}

// Group items by category, preserving first-seen category order from the catalog.
function groupByCategory(items) {
  const order = [];
  const map = new Map();
  for (const it of items) {
    if (!map.has(it.category)) {
      map.set(it.category, []);
      order.push(it.category);
    }
    map.get(it.category).push(it);
  }
  return order.map((cat) => ({ cat, items: map.get(cat) }));
}

function providedList(opt) {
  const F = new Set(opt.provides || []);
  const vocab = data.providesVocab || {};
  return (opt.provides || []).map((f) => vocab[f] || f);
}

function weatherBlock(opt) {
  const w = data.weather || {};
  const ev = data.event?.dates || {};
  const start = opt?.arrivalDate || ev.arrivalEarly || ev.start;
  const end = ev.departure || ev.end;
  const inRange = (w.forecast || []).filter((d) => d.date && (!start || d.date >= start) && (!end || d.date <= end));
  const fc = (inRange.length ? inRange : (w.forecast || [])).map((d) => `${d.day} ~${d.high}°/${d.low}°`).join(' · ');
  return [
    `> **Weather — pulled ${w.pulledDate || 'n/a'}** (re-check 2–3 days out)`,
    `> `,
    w.climatology ? `> *Climatology:* ${w.climatology}` : null,
    fc ? `> *Forecast:* ${fc}` : null,
    w.packFor ? `> *Pack for:* ${w.packFor}` : null,
    w.stormNote ? `> ⚠️ ${w.stormNote}` : null,
    w.sources ? `> _${w.sources}_` : null,
  ].filter(Boolean).join('\n');
}

function prohibitedBlock() {
  const p = data.prohibited || {};
  const lines = ['## 🚫 Do NOT pack (confiscated at the gate)', ''];
  if (p.everywhere?.length) lines.push(`**Banned everywhere:** ${p.everywhere.join('; ')}.`, '');
  if (p.venueAdditional?.length) lines.push(`**Also banned in the venue:** ${p.venueAdditional.join('; ')}.`, '');
  if (p.permittedDaypack?.length) lines.push(`**Permitted venue daypack:** ${p.permittedDaypack.join('; ')}.`, '');
  if (p.alcohol) lines.push(`**Alcohol (campground, 21+):** ${p.alcohol}`, '');
  if (p.meds) lines.push(`**Meds:** ${p.meds}`, '');
  if (p.harmReduction) lines.push(`**Harm reduction:** ${p.harmReduction}`, '');
  return lines.join('\n');
}

function checklistMarkdown(opt) {
  const ev = data.event || {};
  const groups = groupByCategory(renderOption(opt));
  const out = [];
  out.push(`# ${ev.name || 'Electric Forest'} ${ev.year || YEAR} — ${opt.name} Packing Checklist`);
  out.push('');
  const sub = [opt.tier, opt.lodging, opt.arrival ? `arrival ${opt.arrival}` : null].filter(Boolean).join(' · ');
  if (sub) out.push(`*${sub}*`, '');
  if (ev.dates?.label) out.push(`**${ev.dates.label}** — ${ev.location || ''}`.trim(), '');
  out.push(weatherBlock(opt), '');

  const prov = providedList(opt);
  if (prov.length) {
    out.push('## ✅ Provided by this option — don\'t pack these', '');
    for (const p of prov) out.push(`- ${p}`);
    out.push('');
  }

  if (opt.notes?.length) {
    out.push('## 📌 Notes for this option', '');
    for (const n of opt.notes) out.push(`- ${n}`);
    out.push('');
  }

  out.push('## Packing list', '');
  for (const g of groups) {
    out.push(`### ${g.cat}`, '');
    for (const it of g.items) {
      out.push(`- [ ] ${it.text}${it.note ? ` — _${it.note}_` : ''}`);
    }
    out.push('');
  }

  out.push(prohibitedBlock(), '');
  out.push('---', '');
  out.push('> Generated from `data/options-' + YEAR + '.json`. Not official Electric Forest material — confirm current dates, inclusions, and the prohibited list on [electricforest.com](https://www.electricforest.com) before you pack.');
  out.push('');
  return out.join('\n');
}

// ---- Write files ----
mkdirSync(OUT_DIR, { recursive: true });
// Clear stale .md files so removed options don't linger.
for (const f of readdirSync(OUT_DIR)) {
  if (f.endsWith('.md')) rmSync(resolve(OUT_DIR, f));
}

let count = 0;
const index = [`# Electric Forest ${YEAR} — Packing Checklists by Option`, ''];
for (const opt of data.options || []) {
  const md = checklistMarkdown(opt);
  writeFileSync(resolve(OUT_DIR, `${opt.id}.md`), md, 'utf8');
  index.push(`- [${opt.name}](${opt.id}.md) — *${[opt.tier, opt.lodging].filter(Boolean).join(', ')}*`);
  count++;
}
index.push('', `> ${count} options. Generated from \`data/options-${YEAR}.json\`.`);
writeFileSync(resolve(OUT_DIR, 'README.md'), index.join('\n'), 'utf8');

console.log(`Generated ${count} checklists + index into ${OUT_DIR}`);
