# Spec — Fake Test Data Generator

- **Slug:** `fake-data-generator`
- **Component:** `src/components/tools/FakeDataGenerator/index.tsx`
- **Category:** `generator`
- **Icon:** `Database`

## What it does
Procedurally generates mock user records from built-in JS arrays (first names,
last names, street names, cities, job titles, dummy domains). No external
libraries.

## Fields (checkboxes)
Full Name, Email, Phone, Address, UUID (v4 via `crypto.randomUUID`), Job Title.
At least one field must stay selected.

## Inputs / controls
- Field checkboxes.
- "Number of Rows" input, 1–100 (clamped).
- **Generate** button (re-rolls).

## Outputs
- Clean HTML table of the generated rows.
- **Export JSON** (array of objects) and **Export CSV** (header row + quoted
  values) downloads.
- Copy JSON to clipboard.

## Privacy / network
Fully client-side; data is fabricated locally and never uploaded. UUIDs use the
Web Crypto API.

## SEO
- Keywords: "mock data generator", "fake JSON user data", "dummy test data CSV",
  "test data generator", "sample user data".

## Related tools
`uuid-generator`, `json-formatter`, `json-to-csv`.
