# Recognition logos

Artwork for the "Recognised & Collaborated With" row on the homepage
(`src/components/site/recognition.tsx`).

## How to add one

1. Drop the file in this folder using the filename below.
2. Open `src/components/site/recognition.tsx` and set that entry's `logo`
   to the path, e.g. `logo: "/logos/ayush.png"`.

Any entry left with `logo: ""` falls back to its gold monogram box, so the
row stays presentable while files are still being collected.

| Organisation         | Filename                | Status  |
| -------------------- | ----------------------- | ------- |
| Ministry of AYUSH    | `ayush.png`             | present |
| Ministry of Education| `education.png`         | present |
| Govt. of Meghalaya   | `meghalaya.png`         | present |
| Decathlon            | `decathlon.png`         | present |
| Himachal Pradesh Tourism | `hp-tourism.png`    | present |

## Provenance of the files currently here

Downloaded 2026-07-30 and visually checked against the organisation each
represents. The first four are 960px-wide PNG renders from Wikimedia Commons;
`hp-tourism.png` came from the department's own site.

| File | Source | Licence |
| ---- | ------ | ------- |
| `ayush.png` | [Logo Ministry of AYUSH.png](https://commons.wikimedia.org/wiki/File:Logo_Ministry_of_AYUSH.png) | Public domain |
| `education.png` | [Ministry of Education India.svg](https://commons.wikimedia.org/wiki/File:Ministry_of_Education_India.svg) | Public domain |
| `meghalaya.png` | [Seal of Meghalaya.png](https://commons.wikimedia.org/wiki/File:Seal_of_Meghalaya.png) | **CC BY-SA 4.0** — requires attribution |
| `decathlon.png` | [Decathlon - logo (France, 2024).svg](https://commons.wikimedia.org/wiki/File:Decathlon_-_logo_(France,_2024).svg) | Public domain |
| `hp-tourism.png` | [himachaltourism.gov.in](https://himachaltourism.gov.in/) (`wp-content/uploads/2018/03/cropped-sticky-newlogohp-1.png`) | © HP Tourism — no explicit licence |

`hp-tourism.png` is the Himachal Tourism department mark, taken from their own
site. It is a 512×512 upscale of a small favicon-crop, so it is soft at full
size — fine at the ~52px it renders at, but ask the department for the original
artwork if the row is ever used larger. Note this is the *department* logo, not
the HPTDC corporation crest at `hptdc.hp.gov.in`; confirm which one the
collaboration is actually with.

`meghalaya.png` is the only one with an attribution requirement. Either credit
it (creator: P. Mario K. Pathaw, CC BY-SA 4.0) somewhere on the site, or
replace it with artwork supplied directly by the state government.

## Format

- **PNG with a transparent background**, or SVG. The plate behind the logo
  is cream (`--cream`), so white-background JPEGs will show a visible box.
- **At least 280 × 128 px** — the slot renders at 140 × 64 CSS px, so this
  keeps it sharp on 2× displays.
- Landscape or square. Very tall logos will letterbox inside the plate.
- Trim excess whitespace from the artwork; the plate supplies its own padding.

## Before publishing

These are third-party trademarks and, for the ministries, official state
emblems whose reproduction is restricted. Confirm the client holds written
permission to display each one before this goes to production.
