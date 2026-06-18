# Electric Forest — AC Landing Packing Checklist

An interactive, mobile-friendly packing checklist for **Electric Forest** (Rothbury, MI), tailored to the **AC Landing** glamping package. Tap items to check them off — your progress saves automatically on your device.

**▶ Live checklist:** https://chipdouglas2819.github.io/electric-forest-checklist/

## Features

- **Tap to pack** — check items off; rows strike through and the progress bar fills.
- **Saves automatically** — your checked items persist on your device via `localStorage` (no account, no server, nothing leaves your phone).
- **Collapsible sections** with per-section counts, plus a one-tap *Reset all*.
- **Reference cards** for what AC Landing provides (don't pack it) and what's prohibited at the gate.
- **Works offline** — it's a single self-contained HTML file. Save it to your home screen and it runs without signal.

## Use it

Just open the live link above on your phone. To keep a personal copy, "Add to Home Screen" in your browser, or download `index.html` and open it locally.

## Disclaimer

This is a community packing aid, not official Electric Forest material. Festival dates, the prohibited-items list, and AC Landing inclusions change year to year — **always confirm current details on [electricforest.com](https://www.electricforest.com) before you pack.** The 2027 dates shown are an estimate until officially announced.

## Contributing / reusing

It's a single file (`index.html`) — no build step, no dependencies. Edit the `SECTIONS` array near the top of the `<script>` block to change the list. Released under the MIT License (see [LICENSE](LICENSE)); use it, fork it, adapt it for your own festival however you like.
