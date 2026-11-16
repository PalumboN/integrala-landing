# INTEGRALA — Website

Static site with no build process or JavaScript dependencies.
It can be opened directly in a browser or published on any static hosting
(GitHub Pages, Cloudflare Pages, Netlify, Vercel).

## Positioning

INTEGRALA is presented as a **software engineering boutique**: we understand
technology deeply and we design, build, integrate and evolve effective,
maintainable software systems that are ready for change. Applied AI is part of
broader software engineering capabilities, not a separate promise.

The site deliberately avoids invented clients, testimonials, case studies,
metrics or commercial track records. Its own design is offered as evidence of our
engineering standards. The main conversion goal is **contact**; the contact app is
the mechanism visitors reach when they choose to get in touch, and is not sold or
described on the site.

## Structure

| File | Description |
| --- | --- |
| `index.html` | Landing page (hero, engineering approach, capabilities, technical expertise, contact). |
| `about.html` | About page: the founder and the technical background behind the team. |
| `styles.css` | Styles and both themes. |
| `app.js` | Progressive enhancement: theme switcher, language switcher, and footer year. |
| `robots.txt` | Crawling rules. Allows search engines and AI agents. |
| `sitemap.xml` | Site map (landing + about). |
| `llms.txt` | Plain-text summary for AI assistants/agents. |
| `site.webmanifest` | Installation metadata (PWA). |
| `favicon.svg` / `favicon.ico` / `apple-touch-icon.png` / `icon-192.png` / `icon-512.png` | Icons. |
| `og.svg` / `og.png` | Social card (Open Graph / Twitter). `og.png` is the one referenced. Regenerate with `rsvg-convert -w 1200 -h 630 og.svg -o og.png`. |

Both pages share the same header (brand, navigation, language switch, theme
switch and contact button) and the same footer, so navigation and branding stay
consistent.

## Themes

There are two themes, both defined with CSS variables in `styles.css`:

- **Gray** (`data-theme="gray"`): light warm gray background, dark contrast bands.
- **Dark** (`data-theme="dark"`): neutral dark tones.

The theme is saved in `localStorage` (`integrala-theme`). If there is no saved preference,
the system preference is used (`prefers-color-scheme`). A script in the `<head>` applies the theme
before the first paint to avoid a flash. The header has a sun/moon switch for the theme and a
round chat button with an attention animation that opens the contact app.

## Languages

The site is in **Spanish by default** (`<html lang="es">`). Spanish is written directly
in the HTML, so it is what crawlers see without running JavaScript. English translations
live in `data-en`, `data-en-html`, `data-en-aria-label`, and `data-en-title` attributes and
are applied by `app.js` when English is selected. The same mechanism works on every page.

- A switch in the header (`ES` / `EN`, next to the theme switch) changes the language.
- The choice is saved in `localStorage` (`integrala-lang`) and persists across pages.
- The `?lang=en` query parameter deep-links to the English version of a page.
- `hreflang` alternates (`es`, `en`, `x-default`) and the JSON-LD `availableLanguage`
  list both languages for bots.

## Local preview

```sh
python3 -m http.server 8000
# open http://localhost:8000
```

You can also open `index.html` in a browser.

## Designed for bots

- Semantic HTML and full content in the markup (no JavaScript rendering).
- Indexing metadata (`robots`, `googlebot`) and `canonical`.
- schema.org structured data: `Organization`, `WebSite` and `ProfessionalService`
  with a capability catalog on the landing; `Person` (founder) and `AboutPage` on
  the About page.
- Open Graph and Twitter Card with `og.png` image (1200×630).
- `robots.txt` with an explicit list of allowed AI crawlers.
- `sitemap.xml` and `llms.txt`.
- `hreflang` alternates for Spanish (default), English, and `x-default`.

## Before publishing

1. **Domain**: metadata uses `https://palumbon.github.io/integrala-landing/`.
   If the site is published on another domain, update `canonical`, the `og:*` and
   `twitter:*` tags, the JSON-LD in `index.html` and `about.html`, `robots.txt`,
   `sitemap.xml` and `llms.txt`.
2. Review the institutional text and the founder's biography so they accurately
   describe the team and its experience.
3. Verify that the contact app at `https://professional-chat-pwa.vercel.app/` is available.
4. Review legal availability of the brand and domain before publishing.

## Design notes

- Fonts: Fraunces (headings), Instrument Sans (body), and IBM Plex Mono (labels and
  technical concepts), loaded from Google Fonts with system fallbacks.
- The default theme is **Gray**; you can change it in `app.js` (`apply(...)`) if you prefer
  to start in dark mode.

## Contact

The buttons and the contact section direct to the INTEGRALA contact app, where
people can start a conversation and, when needed, continue with someone from the
team. The site invites visitors to get in touch but does not describe or promote
the app itself.
