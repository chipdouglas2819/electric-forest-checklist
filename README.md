# Electric Forest 2026 — Packing Checklists

An interactive, mobile-first packing checklist for **Electric Forest 2026** (Double JJ Resort, Rothbury, MI · Thu June 25 – Sun June 28). Pick your **camping or lodging option** and get a list tailored to what that option already provides — with the weekend's weather pinned on top. Tap to check items off; your progress saves on your device, separately for each option.

**▶ Live:** https://chipdouglas2819.github.io/electric-forest-checklist/

> Not official Electric Forest material. Dates, inclusions, and the prohibited-items list change year to year — **always confirm on [electricforest.com](https://www.electricforest.com) before you pack.** Data was compiled ~1 week out from the 2026 festival; re-check the forecast 2–3 days before you leave.

## What it does

- **27 options** across GA, GA Enhanced, Good Life, Back 40, and Hotel tiers (A/C Landing, GA Tent, Pre-Set RVs, Electric Avenue, Bungalow, Back 40 Cabin/Log Home/Enchanted, Hotel packages, and more).
- **Provided ⇒ removed.** Each list is the master kit *minus* what your option supplies (bed, cooling, towels, power, kitchen, chairs…) *plus* the gear that option specifically needs (fan for un-cooled pre-set tents, 30A cord for powered RV, swim gear for Lucky Lake/Back 40…).
- **Weather, dated, on top** — climatology + the festival-week forecast + a severe-weather plan (this venue has a real evacuation history).
- **Saves automatically** on your device (`localStorage`) — no account, no server. Each option keeps its own progress.
- **Shareable & deep-linkable** — the URL updates per option (e.g. `…/#ga-tent-camping`), so you can send someone the exact list for their tier.
- **Works offline** — one self-contained HTML file. "Add to Home Screen" and it runs without signal at the festival.

## Markdown checklists

Prefer plain text? Every option also exists as a GitHub-rendered markdown checklist with `- [ ]` boxes: **[checklists/2026/](checklists/2026/)**.

## How it's built (single source of truth)

All content lives in one file — **[`data/options-2026.json`](data/options-2026.json)**: a master item catalog (each item tagged with `providedBy` / `addedBy` flags), a `providesVocab`, the weather and prohibited blocks, and 27 option records. The app and the markdown are *generated* from it, so they can never drift.

```
data/options-2026.json        # the only thing you edit
scripts/app-template.html     # the app shell (CSS/JS); data is injected at build
scripts/build-app.mjs         # JSON + template  -> index.html  (self-contained)
scripts/generate-checklists.mjs  # JSON           -> checklists/2026/*.md
scripts/serve.mjs             # local static server for previewing (dev only)
index.html                    # built, shipped app (do not hand-edit)
```

To change the lists, edit the JSON and regenerate:

```bash
node scripts/build-app.mjs 2026          # rebuild index.html
node scripts/generate-checklists.mjs 2026 # rebuild the markdown checklists
```

`index.html` is committed (GitHub Pages serves it directly), so rebuild before you push.

## Other years

The tooling is year-parameterized. Drop a `data/options-<YEAR>.json` in the same shape and run the two scripts with that year. See [`docs/build-checklists-prompt.md`](docs/build-checklists-prompt.md) for the generation prompt and [`docs/research.md`](docs/research.md) for the 2026 source research that backs the packing data.

## License

MIT — see [LICENSE](LICENSE). Use it, fork it, adapt it for your own festival.
