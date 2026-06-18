# Prompt — Build Electric Forest Per-Option Packing Checklists (any year)

Paste this into Claude Code at the root of the project. It assumes `electric-forest-research.md` is present as reference. It works for any year; default to the next upcoming Electric Forest if no year is given.

---

## Role
You are building a small, dependency-light tool that lets a user pick **which Electric Forest camping option they have** and get a tailored packing checklist, with live weather pinned at the top. Optimize for a **single source of truth** and **no duplicate lists**: one master item catalog, per-option deltas via `provides`/`addedBy` flags. Keep it simple — no backend, no build step, no browser `localStorage` (use the artifact `window.storage` API with an in-memory fallback).

## Inputs
- `YEAR` — the festival year to build for. If not provided, determine the next upcoming Electric Forest year.
- `SELECTED_OPTION` *(optional)* — if the user names their camping option (e.g. "A/C Landing"), generate that one checklist and make it the app's default selection. Otherwise build all options and let the user pick in the app.

## Reference
Read `electric-forest-research.md` first. It contains the data model (§7), the year-agnostic refresh list (§8), the weather method (§2), and the prohibited list (§6). Reuse it; only re-research what §8 says changes per year.

---

## Process

### Step 1 — Refresh the year's facts
Fetch and parse the official source of record: `https://www.electricforest.com/pass-types` for `YEAR`. Also check the official **Festival Info & Policies** and **FAQ** pages for that year. Extract:
- Festival dates + the Wednesday early-arrival date.
- The **full option roster** across GA, Good Life, Back 40, and Hotel tiers.
- For **each option**: lodging type, wristband count, arrival day, parking/shuttle inclusion, and the precise **provided** items (tent, bedding, beds, cooling, power, furniture, towels, kitchen, etc.).
- The current **prohibited/permitted** lists (campground vs. venue).

If the official page for `YEAR` isn't published yet, say so, fall back to the most recent published year's structure, and clearly label every figure as "prior-year, unconfirmed."

### Step 2 — Pull weather (two layers, pinned at top)
Per research §2:
- **Historical:** Rothbury, MI (49452) late-June climatology — typical highs/lows, rain days, humidity, UV, daylight. (AccuWeather / weather.com / weather-us.com.)
- **Current:** if the festival is **≤14 days out**, pull a 10–14 day forecast for the exact festival dates (AccuWeather, weather.com, FOX Weather, The Weather Network) plus the **NWS Grand Rapids (GRR)** point forecast / hazardous-weather outlook for an authoritative storm read. If **>14 days out**, show historical + monthly outlook and label the forecast "not yet available."
- Emit a synthesized **"pack-for" line** (day heat, night cold, sun, rain/storm risk) and keep the storm-safety note (shelter in vehicle, monitor app + local radio).
- Make weather a clearly-marked block the app renders **above** the checklist, with the date the forecast was pulled.

### Step 3 — Emit structured data → `data/options-<YEAR>.json`
Use the shapes in research §7. One file containing: the event/date/weather block, the `provides`-flag vocabulary, the **master item catalog** (each item with `category`, `text`, optional `note`, `providedBy`, `addedBy`), and the **option records** (`id`, `name`, `tier`, `lodging`, `arrival`, `provides`, `notes`). Keep IDs stable across years where the option name is unchanged.

### Step 4 — Generate checklists
For each option (or just `SELECTED_OPTION`):
- Checklist = master catalog **minus** any item whose `providedBy` ∩ `option.provides` ≠ ∅, **plus** items whose `addedBy` matches the option's flags/lodging type.
- Render a "**Provided — don't pack**" reference block from `option.provides`, and the year's "**Do NOT pack**" prohibited block — both non-checkable.
- Output one markdown checklist per option to `checklists/<YEAR>/<option-id>.md` (GitHub-style `- [ ]` boxes), each led by the weather block.

### Step 5 — Build/refresh the selector app → `app/index.html`
A single self-contained HTML file (inline CSS/JS, no external deps):
- Dropdown/segmented control to pick the camping option (default = `SELECTED_OPTION` if given).
- Reads `data/options-<YEAR>.json`; applies the render rule live; shows category sections with **tap-to-check** rows, per-section counts, overall progress, collapse/expand, and a two-tap reset.
- Pins the **weather block** at the top.
- Persists checks with `window.storage` (key namespaced per `YEAR`+option), with an in-memory fallback if unavailable. Never use `localStorage`/`sessionStorage`.
- Mobile-first: large tap targets, visible focus, `prefers-reduced-motion` respected.

---

## Quality bar
- **Provided ⇒ removed.** If an option includes it (bed, cooling, towels, power, chairs…), it must not appear as a thing to pack. Spot-check A/C Landing (cooling + bedding + outlet, **no towels, no chairs**), Pre-Set RV (kitchen + towels included), Enchanted (almost everything included), and any BYO-tent option (full kit required).
- **Power-aware.** For options with `power`/`power_30a`, prefer a **power strip + AC box fan** and demote power banks to venue-only. Never recommend a pile of battery gear when an outlet exists. Add a one-line "confirm circuit can handle appliance load" note for single-outlet pre-set tents.
- **Weather first, dated.** Every checklist and the app open with historical + current weather and the pull date.
- **No invented inclusions.** If a detail isn't on the official page (e.g., cabin/log-home linens), mark it "confirm with concierge," don't guess.
- **Surface uncertainty.** End with a short "verify before relying" list for `YEAR`: official prohibited list, unconfirmed inclusions, and "refresh forecast 2–3 days out."

## Deliverables recap
```
data/options-<YEAR>.json
checklists/<YEAR>/<option-id>.md      (one per option, or just the selected one)
app/index.html                         (selector + tap-to-check + weather header)
```
