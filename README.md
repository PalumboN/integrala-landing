# INTEGRALA — Landing

Single-page static site with no build process or JavaScript dependencies.
It can be opened directly in a browser or published on any static hosting
(GitHub Pages, Cloudflare Pages, Netlify, Vercel).

## Structure

| File | Description |
| --- | --- |
| `index.html` | Full page. All content is in the HTML (visible without JavaScript). |
| `styles.css` | Styles and both themes. |
| `app.js` | Progressive enhancement: theme switcher, language switcher, and footer year. |
| `robots.txt` | Crawling rules. Allows search engines and AI agents. |
| `sitemap.xml` | Site map (one URL). |
| `llms.txt` | Plain-text summary for AI assistants/agents. |
| `site.webmanifest` | Installation metadata (PWA). |
| `favicon.svg` / `favicon.ico` / `apple-touch-icon.png` / `icon-192.png` / `icon-512.png` | Icons. |
| `og.svg` / `og.png` | Social card (Open Graph / Twitter). `og.png` is the one referenced. |

## Themes

There are two themes, both defined with CSS variables in `styles.css`:

- **Gray** (`data-theme="gray"`): light warm gray background, dark contrast bands.
- **Dark** (`data-theme="dark"`): neutral dark tones.

The theme is saved in `localStorage` (`integrala-theme`). If there is no saved preference,
the system preference is used (`prefers-color-scheme`). A script in the `<head>` applies the theme
before the first paint to avoid a flash. The header has a sun/moon switch for the theme and a
round chat button with an attention animation that opens the chat.

## Languages

The site is in **Spanish by default** (`<html lang="es">`). Spanish is written directly
in the HTML, so it is what crawlers see without running JavaScript. English translations
live in `data-en`, `data-en-html`, `data-en-aria-label`, and `data-en-title` attributes and
are applied by `app.js` when English is selected.

- A switch in the header (`ES` / `EN`, next to the theme switch) changes the language.
- The choice is saved in `localStorage` (`integrala-lang`).
- The `?lang=en` query parameter deep-links to the English version.
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
- schema.org structured data: `Organization`, `WebSite`, and `ProfessionalService`
  with a service catalog.
- Open Graph and Twitter Card with `og.png` image (1200×630).
- `robots.txt` with an explicit list of allowed AI crawlers.
- `sitemap.xml` and `llms.txt`.
- `hreflang` alternates for Spanish (default), English, and `x-default`.

## Before publishing

1. **Domain**: metadata uses `https://palumbon.github.io/integrala-landing/`.
   If the site is published on another domain, update `canonical`, the `og:*` and
   `twitter:*` tags, the JSON-LD in `index.html`, `robots.txt`, and `sitemap.xml`.
2. Review the institutional text so it accurately describes the team and its capabilities.
3. Verify that the chat at `https://professional-chat-pwa.vercel.app/` is available.
4. Review legal availability of the brand and domain before publishing.

## Design notes

- Fonts: Fraunces (headings), Instrument Sans (body), and IBM Plex Mono (labels),
  loaded from Google Fonts with system fallbacks.
- The default theme is **Gray**; you can change it in `app.js` (`apply(...)`) if you prefer
  to start in dark mode.

## Contact

The buttons and contact section direct to the INTEGRALA chat, where people
can talk with a bot or with someone from the team.
