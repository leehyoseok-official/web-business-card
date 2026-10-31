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
- Design follows Apple conventions: one accent colour (`--accent`) plus a neutral grey scale, system font stack, whitespace instead of section dividers, `:active` press feedback.
- Actions sit under the profile: a full-width primary "연락처에 추가" (vCard) button, then Email / LinkedIn as tinted secondaries in a 2-column grid.
- "My Pages" is an iOS-style inset grouped list (`.page-links`) with hairline separators and chevrons.
- `css/chatbot.css` defines its own `--chat-*` tokens (light + dark) so the widget also works on `pages/portfolio.html`.
- `.vercelignore` keeps `*.txt` (API key file) and local tooling out of CLI deployments.
