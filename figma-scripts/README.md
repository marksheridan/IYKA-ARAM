# IYKA-ARAM — Figma build scripts

Standalone Figma Plugin API scripts that finish the design system in
[IYKA-ARAM — Design System & Product](https://www.figma.com/design/cmFt5G4SRLrDXGmHHSb0PS).

The tokens, styles and documentation pages are already built. These scripts add the
**component library** and the **screens**, reading the tokens that already exist in the file
rather than redefining them.

They run entirely inside Figma, so they do **not** consume Figma MCP tool calls.

---

## Why these exist

The file was built through Figma's remote MCP server. That server enforces a per-plan quota —
**Starter is 6 tool calls per month** — which ran out after the token and documentation phase.
These scripts do the remaining work through Figma's own plugin runtime instead, where there is
no quota.

---

## How to run them

### Option A — Scripter plugin (easiest)

1. In Figma, run **Plugins → Browse plugins in Community**, install **Scripter**.
2. Open the IYKA-ARAM file, run Scripter.
3. Paste one script into the editor, press **Run** (⌘/Ctrl + Enter).
4. Wait for the summary line in Scripter's output pane before running the next one.

### Option B — Local development plugin

1. Make a folder with these two files:

   **manifest.json**
   ```json
   {
     "name": "IYKA Build",
     "id": "iyka-build",
     "api": "1.0.0",
     "main": "code.js",
     "editorType": ["figma"]
   }
   ```

   **code.js** — paste one script here.

2. In Figma: **Plugins → Development → Import plugin from manifest…** and pick `manifest.json`.
3. Open the IYKA-ARAM file and run **Plugins → Development → IYKA Build**.
4. Replace the contents of `code.js` with the next script and run again.

The scripts do **not** call `figma.closePlugin()`, so with Option B the plugin window stays open
after finishing — close it yourself. That is deliberate, so the same file works in Scripter too.

---

## Run order

Order matters. Components must exist before the screens that instance them.

| # | Script | Creates | Page |
|---|--------|---------|------|
| 1 | `01-components-brand.js` | Button, Section Label, Pillar Card, Service Row, Team Card, Testimonial Card, Booking Card, Form Field, Stat Block | 02 · Components |
| 2 | `02-components-commerce.js` | Product Card, Filter Chip, Cart Line, Qty Control, Trust Chip, Price Block | 02 · Components |
| 3 | `03-components-mis-admin.js` | Status Badge (13 variants), KPI Card, Table Row, Sidebar Item, MIS Input, Admin Sidebar Item | 02 · Components |
| 4 | `04-screens-marketing.js` | Home, About, Services, Gallery, Blog, Blog Post, Booking, Contact | 03 · Screens |
| 5 | `05-screens-store.js` | Listing, Product Detail, Cart, Checkout, Profile, OTP Modal | 03 · Screens |
| 6 | `06-screens-backoffice.js` | Dashboard, Products, Orders, Customers, Blog List, Post Editor | 03 · Screens |
| 7 | `07-screens-mis.js` | Dashboard, Appointments, Patients, Billing, Finance, Yoga, Messages | 03 · Screens |

Each script is **idempotent** — it deletes anything it previously created (matched by layer name)
before rebuilding. Re-running one is safe.

---

## What the scripts assume already exists

If any of these are missing the script throws immediately with the missing name, rather than
silently drawing a grey box:

- **Variable collections** — `Primitives`, `Brand`, `MIS & Admin`, `Spacing`, `Radius`
- **Text styles** — 27, e.g. `Display/Hero`, `Body/Base`, `Label/Button`, `UI/Metric`
- **Effect styles** — 6, e.g. `Elevation/Gold Glow`, `Elevation/UI Subtle`
- **Pages** — `02 · Components`, `03 · Screens`
- **Uploaded images** — 22, referenced by `imageHash` (already in the file's image store)

---

## Font gotcha

Four families are used, and their weight strings are **not** spelled consistently by the vendors:

| Family | Semi-bold spelled |
|---|---|
| Cormorant Garamond | `SemiBold` |
| DM Sans | `SemiBold` |
| Fraunces | `SemiBold` |
| **Inter** | **`Semi Bold`** (with a space) |

Inter also uses `Extra Bold`, not `ExtraBold`. Every script loads all needed combinations up
front; if you add text, match these exactly or `characters` assignment throws.

---

## Design decisions encoded in the scripts

These came from reading `src/app/globals.css` and the components, and are worth knowing before
you edit anything:

- **`radius/none` is the brand default.** Square corners on the site and store are deliberate —
  it is what keeps the brand away from generic wellness design. Rounding is reserved for the two
  internal tools (MIS, admin).
- **Cream vs dark surfaces are separate token groups**, not light/dark modes — the Starter plan
  caps collections at one mode. `cream/text-primary` and `dark/text-primary` are the same role on
  different surfaces. On Professional these convert to real modes cleanly.
- **Gold is the only accent.** Every primary action across all four surfaces is gold; nothing else
  competes for it.
- **Shadows are gold-tinted** on brand surfaces (`Elevation/Gold Glow`) and neutral on the internal
  tools (`Elevation/UI Subtle`).
- **Two type systems.** Cormorant Garamond + DM Sans for anything a patient or customer sees;
  Inter for the two internal tools, where density and tabular figures matter more.

---

## Troubleshooting

**`Error: missing var <name>`**
The token collections did not build, or were renamed. Check the five collections listed above
exist with those exact names.

**`Cannot write to node with unloaded font "<family> <style>"`**
A font/style combination is used that the prelude does not load. Add it to the `boot()` list.

**`FILL can only be set on children of auto-layout frames`**
A node had `layoutSizingHorizontal = 'FILL'` set before being appended to its parent. In these
scripts the parent is always appended to first — preserve that order if you edit.

**Images render as empty frames**
The `imageHash` values are file-specific. They are valid for file `cmFt5G4SRLrDXGmHHSb0PS` only.
If you duplicate the file, re-upload the assets from `public/` and update the `HASHES` map at the
top of each screens script.

**Nothing appears**
Check you are on the right page — the scripts switch pages themselves via
`figma.setCurrentPageAsync()`, but they will throw if the page name does not match.

---

## Fixes applied after first run

**`setProperties` rejected bare property names.**
Figma stores component properties with an ID suffix (`Label#12:3`), so
`instance.setProperties({ Label: '…' })` threw `No property named "Label"`. All four
screens scripts now resolve the real key by prefix via a `setProps()` helper.

This is also why the first Home run left only a header: **plugin scripts are not atomic.**
Unlike the MCP `use_figma` calls used to build the tokens, a mid-script throw leaves
everything created up to that point on the canvas. If a script fails, re-run it — the
cleanup pass at the top removes its own partial output first.

**Hero overlay stacked instead of overlaying.**
The gradient rectangle was appended to the auto-layout hero frame without
`layoutPositioning = 'ABSOLUTE'`, so it became a layout child and pushed content down.

**Vertical `FILL` threw in the MIS and admin shells.**
`layoutSizingHorizontal = 'FIXED'` only pins the primary axis. On a HORIZONTAL frame the
counter (vertical) axis stayed `AUTO`, so the sidebar and main column could not use
`layoutSizingVertical = 'FILL'`. Both shells now set `counterAxisSizingMode = 'FIXED'`.

### Cleaning up after a failed run

The orphaned instance left behind by a throw is not tracked by the cleanup pass — it sits
loose on the page. Delete any stray nodes at the page root before re-running, or run this
once in Scripter:

```js
(async () => {
  const page = figma.root.children.find(p => p.name === '03 · Screens');
  await figma.setCurrentPageAsync(page);
  const removed = [];
  for (const n of [...page.children]) {
    if (n.type === 'INSTANCE') { removed.push(n.name); n.remove(); }
  }
  console.log('removed orphans: ' + (removed.join(', ') || 'none'));
})();
```
