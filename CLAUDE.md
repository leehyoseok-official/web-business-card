# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Single-page web business card — pure HTML/CSS/JS, no build step, no dependencies.
Open `index.html` directly in a browser to develop.

## Files

| File         | Role |
|--------------|------|
| `index.html` | All markup, SEO meta tags, OG/Twitter cards, Schema.org microdata |
| `styles.css` | CSS custom properties (design tokens), dark/light themes, mobile-first layout |
| `script.js`  | Dark-mode toggle (localStorage + system preference), vCard (.vcf) download |
| `profile.jpg`| Profile photo — replace with the actual photo (referenced in `index.html`) |

## Personalisation checklist

All user-specific data is concentrated in two places:

1. **`index.html`** — name, job title, company, bio, skill tags, career items, `mailto:` / LinkedIn / Portfolio `href` attributes, `<title>`, `<meta>` description, OG/Twitter tags.
2. **`script.js`** — `CONTACT` object at the top of the vCard section (drives the downloaded `.vcf` file).
3. **OG image** — `og-image.png` (1200×630) referenced in the meta tags; create and drop it in the project root.

## Architecture notes

- Theme tokens live entirely in CSS custom properties on `:root` and `[data-theme="dark"]`. Adding a new colour means adding one variable in each block.
- FOUC prevention: a tiny inline `<script>` in `<head>` reads `localStorage` and sets `data-theme` on `<html>` before CSS is parsed, eliminating a flash on reload.
- The avatar falls back gracefully: if `profile.jpg` is missing the `onerror` handler hides the `<img>` and reveals `.avatar-initial` (CSS-drawn circle with an initial letter).
- On `≤ 479px` the card goes full-bleed (no border-radius, no shadow) to use every pixel on small phones. On `≥ 480px` it renders as a centred floating card.
- Link buttons are stacked (column) on mobile and switch to a 3-column row on `≥ 480px`.
