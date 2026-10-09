# ARCHITECTURE.md

Vanilla HTML/CSS/JS, ES modules, no build step.

## 1. Folder structure

```
/
├── AGENTS.md
├── docs/                      # PRD, DESIGN, ARCHITECTURE, CONTENT, TASKS
├── index.html
├── 404.html
├── favicon.svg
├── robots.txt
├── sitemap.xml
├── css/
│   ├── tokens.css             # custom properties (colors, spacing, type, motion)
│   ├── base.css               # reset, typography, focus, utilities, skip link
│   ├── layout.css             # container, grid, section spacing, navbar, footer
│   ├── components.css         # buttons, chips, cards, dialog, palette, terminal, stickers
│   └── effects.css            # reveal, cursor, tilt, skeleton, reduced-motion rules
├── js/
│   ├── main.js                # entry: capability checks, init order
│   ├── config.js              # site config (username, email, links, feature flags)
│   ├── data.js                # projects, skills, hobbies, roles
│   ├── utils.js               # lerp, clamp, rafThrottle, debounce, prefersReducedMotion
│   ├── theme.js
│   ├── nav.js                 # sticky nav, hamburger, active section, scroll progress
│   ├── reveal.js              # IntersectionObserver reveal + count-up
│   ├── render.js              # builds projects, skills, hobbies from data.js
│   ├── hero-canvas.js         # I-01 constellation
│   ├── roles.js               # I-07 rotating words
│   ├── cursor.js              # I-02
│   ├── magnetic.js            # I-03
│   ├── tilt.js                # I-04
│   ├── stickers.js            # I-08
│   ├── dialog.js              # I-12 case-study dialog
│   ├── github.js              # GitHub API, cache, fallback, language bar
│   ├── palette.js             # I-09 command palette
│   ├── terminal.js            # I-10 (P2)
│   ├── game.js                # I-14 (P2)
│   └── contact.js             # form validation + submit
└── assets/
    ├── images/                # WebP, with width/height set in markup
    └── icons/                 # inline SVG sprite or individual SVGs
```

Create files lazily: only add a module when its task phase begins.

## 2. Load order

- CSS: `tokens.css` → `base.css` → `layout.css` → `components.css` → `effects.css` (separate `<link>`s; may be merged later).
- JS: one `<script type="module" src="js/main.js">`. Heavy/optional modules (`terminal.js`, `game.js`, `palette.js`) are loaded with dynamic `import()` on first use.
- Add `class="js"` to `<html>` from an inline one-line script in `<head>` so CSS can hide reveal targets only when JS is running.
- Theme is applied from an inline `<head>` snippet **before first paint** to avoid a flash (reads `localStorage` inside try/catch, falls back to `prefers-color-scheme`).

## 3. Capability checks (`main.js`)

```js
const caps = {
  reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches,
  finePointer: matchMedia('(hover: hover) and (pointer: fine)').matches,
  viewTransitions: 'startViewTransition' in document,
};
```

Initialization:

```
always:            theme, nav, render, reveal, dialog, contact, github, roles
if !reducedMotion: hero-canvas (animated), reveal (animated)
if reducedMotion:  hero-canvas draws one static frame
if finePointer && !reducedMotion: cursor, magnetic, tilt
stickers:          drag mode if finePointer or touch+!reducedMotion, otherwise grid mode
lazy:              palette (on first trigger), terminal, game
```

Listen to `matchMedia(...).addEventListener('change', ...)` for reduced-motion and call `destroy()`/`init()` accordingly.

## 4. Module contract

Every feature module:

```js
export function init(options = {}) {
  // attach listeners/observers, start loops
  return function destroy() {
    // remove listeners, disconnect observers, cancel rAF
  };
}
```

Rules: no module-level side effects on import; modules do not import each other except `utils.js`, `config.js`, and `data.js`. Cross-feature communication uses `CustomEvent`s on `document` (e.g. `portfolio:theme-changed`, `portfolio:open-terminal`).

## 5. Data schemas (`data.js`)

```js
export const roles = ['Web Developer', 'Problem Solver', 'Coffee Enthusiast'];

export const projects = [
  {
    id: 'project-slug',
    title: 'Project Title',
    summary: 'One or two sentences.',
    tags: ['JavaScript', 'API'],
    liveUrl: 'https://example.com',
    repoUrl: 'https://github.com/user/repo',
    image: 'assets/images/project-slug.webp', // optional, 1200x750 recommended
    imageAlt: 'Short description of the screenshot',
    caseStudy: {
      problem: '',
      solution: '',
      decisions: ['Chose X over Y because …'],
      result: '',
      retrospective: ''
    }
  }
];

export const skills = [
  { group: 'Languages', items: ['JavaScript', 'Python'] },
  { group: 'Frontend',  items: ['HTML', 'CSS'] },
  { group: 'Tools',     items: ['Git', 'VS Code'] }
];

export const hobbies = [
  { id: 'photo', icon: '📷', label: 'Photography', story: 'One-line story.' }
];
```

`config.js`:

```js
export const config = {
  name: '', role: '', email: '',
  githubUsername: '', linkedinUrl: '',
  githubFallback: { /* static profile + repos used when API fails */ },
  features: { cursor: true, tilt: true, magnetic: true, stickers: true, palette: true, terminal: true, game: false }
};
```

Feature flags let any effect be switched off without code changes.

## 6. GitHub module (`github.js`)

- Endpoints: `https://api.github.com/users/{username}` and `/users/{username}/repos?per_page=100&sort=updated`.
- Filter out `fork: true` and archived repos; rank by `stargazers_count` then `pushed_at`; take top 6.
- Language bar: count repos per `language` (ignore null), convert to percentages, render segments with accessible text legend.
- Cache `{ ts, profile, repos }` in `sessionStorage` for 30 minutes (try/catch).
- Use `AbortController` with a ~8s timeout. On any failure (network, 403 rate limit, non-OK) render `config.githubFallback` and a small non-blocking notice.
- Render with `createElement` + `textContent` only.

## 7. Key implementation notes

**Canvas (`hero-canvas.js`):** single `<canvas aria-hidden="true">`; size from `ResizeObserver`; `devicePixelRatio` capped at 2; particle state in typed arrays or plain objects (n ≤ 90); one `requestAnimationFrame` loop started/stopped by `IntersectionObserver` + `visibilitychange`; theme colors read from CSS variables and refreshed on `portfolio:theme-changed`.

**Cursor / magnetic / tilt:** one shared `pointermove` listener per module (passive), updates stored in variables and applied in a single rAF tick; use `transform` and CSS variables only; no layout reads in the move handler.

**Stickers:** Pointer Events with `setPointerCapture`; track last positions to compute velocity; inertia in rAF with decay; clamp to container bounds; set `touch-action: none` only on the sticker being dragged on devices where drag is enabled; keyboard handlers for arrows/Enter/Esc.

**Dialog (`dialog.js`):** native `<dialog>`; store the opener element and refocus it on `close`; set `aria-labelledby`; lock body scroll while open.

**Palette (`palette.js`):** build once on first open; commands defined as `{ id, label, keywords, run }`; filter with simple case-insensitive substring/token match; trap focus; restore focus on close.

**Contact (`contact.js`):** validate name/email/message on submit and on blur; show errors in an `aria-live="polite"` region; send via `mailto:` by default; if a form-service URL is set in `config`, `fetch` it with try/catch.

## 8. SEO / meta (in `index.html`)

- `<title>`, `meta description`, canonical, theme-color
- Open Graph + Twitter Card (image 1200×630 in `assets/images/og.png`)
- Optional JSON-LD `Person`
- `lang="en"` (or `id`, matching `CONTENT.md`)

## 9. Hosting

Static hosting only: GitHub Pages, Netlify, or Vercel. Deploy from the repo root. Optionally add a custom domain and set the canonical URL accordingly.
