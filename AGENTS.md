# AGENTS.md

Instructions for AI coding agents working in this repository.

## Project

An **interactive personal portfolio website** (single page) showing: about me, featured projects, live GitHub data, skills, hobbies, and contact. The visual direction is **"Interactive Playground"**: a minimal, fast, dark-first site with playful, physics-feeling interactions (particle canvas, tilt cards, draggable stickers, command palette, terminal easter egg).

Read these before writing code, in this order:

1. `docs/PRD.md` – what to build and why
2. `docs/DESIGN.md` – look, feel, and every interaction's spec
3. `docs/ARCHITECTURE.md` – folders, modules, data schemas
4. `docs/CONTENT.md` – the real content (placeholders until filled)
5. `docs/TASKS.md` – the ordered work plan; **follow it phase by phase**

## Hard constraints

- **Only HTML, CSS, and vanilla JavaScript.** No frameworks, no bundlers, no TypeScript, no npm runtime dependencies, no build step.
- The site must work by opening it through any static file server (GitHub Pages / Netlify / Vercel).
- JavaScript uses **ES modules** (`<script type="module">`). Because of this, test via a local server, not `file://`:
  `python3 -m http.server 8080` then open `http://localhost:8080`.
- No external scripts or CDNs. Google Fonts is the only allowed external resource, and every font needs a system-font fallback so the site still works if it fails to load.
- No remote images required for the page to look correct. Optional third-party images (e.g. GitHub stats cards) must have a fallback and must never break layout.
- Do not add libraries to "save time". If an effect seems to need one (three.js, GSAP, particles.js), implement a lighter vanilla version instead.

## Working style

- Work on **one phase of `docs/TASKS.md` at a time**. When a phase is finished, tick its checkboxes and stop to summarize what changed, what was verified, and what is next.
- Do not skip ahead and do not rewrite finished phases unless a task requires it.
- Prefer small, readable modules over clever code. Comment the *why*, not the *what*.
- **Never invent personal facts** (names, jobs, projects, links, dates, quotes). Use only `docs/CONTENT.md`. If a value is still a placeholder like `{{NAME}}`, keep a clearly marked placeholder in the UI or ask.
- If the PRD, DESIGN, and TASKS files disagree, ask for clarification instead of guessing. Priority when in doubt: `AGENTS.md` > `PRD.md` > `DESIGN.md` > `TASKS.md`.

## Code conventions

**HTML**
- Semantic landmarks: `header`, `nav`, `main`, `section`, `footer`. Exactly one `h1`.
- Each section has an `id` and an `aria-labelledby` pointing to its heading.
- Include a "Skip to content" link as the first focusable element.
- Core content (hero text, about, contact links) is in the static HTML so it is readable without JavaScript. Add a `<noscript>` block listing key links.

**CSS**
- All colors, spacing, radii, fonts, and durations are **CSS custom properties** in `:root`; light theme overrides via `[data-theme="light"]`.
- Mobile-first, using `min-width` media queries. Use Grid/Flexbox. Use `clamp()` for fluid type.
- Class naming: BEM (`.card`, `.card__title`, `.card--featured`).
- Animate only `transform` and `opacity` where possible. Use `will-change` sparingly and remove it after the animation.
- Respect `@media (prefers-reduced-motion: reduce)`: disable non-essential motion.

**JavaScript**
- One module per feature (see `docs/ARCHITECTURE.md`). Each exports an `init()` that returns a `destroy()` cleanup function when it attaches listeners, observers, or loops.
- Use `const`/`let`, `async/await`, optional chaining. No globals except via module scope.
- Insert external or user-provided strings with `textContent` or `setAttribute`, **never `innerHTML`**. Static template markup you wrote yourself may use templates/`createElement`.
- Wrap every `localStorage` / `sessionStorage` / `fetch` call in `try/catch`. They can fail; the page must still render.
- Use passive listeners (`{ passive: true }`) for scroll, touch, and pointer-move handlers. Drive animation with `requestAnimationFrame`, never `setInterval`.
- Feature-detect before enabling effects (see capability checks in `docs/ARCHITECTURE.md`).

## Interaction rules (important for this design)

Every interactive effect must satisfy **all** of these:

1. **Progressive enhancement** – the page is fully usable and readable without the effect.
2. **Reduced motion** – with `prefers-reduced-motion: reduce`, the effect is removed or replaced by a static equivalent.
3. **Touch-safe** – hover-only effects (cursor, tilt, magnetic) are enabled only when `(hover: hover) and (pointer: fine)`.
4. **Keyboard-safe** – anything draggable or pointer-driven has a keyboard alternative. Focus is always visible.
5. **Cheap** – pause loops when off-screen (`IntersectionObserver`) or when the tab is hidden (`visibilitychange`). Cap canvas DPR at 2.
6. **No scroll-jacking** – never hijack native scroll or trap the user.
7. **Don't hide the native cursor.** The custom cursor is decoration layered on top.

## Performance budget

- Lighthouse (mobile) targets: Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 90, SEO ≥ 90.
- JavaScript source < 88,000 bytes total (unminified), CSS < 40 KB, initial page weight < 500 KB excluding fonts. The additional source allowance covers the optional game module, which is loaded only when launched; it does not increase the initial JavaScript download.
- LCP < 2.5 s on 4G. No layout shift from late-loading images (set `width`/`height`).
- Images: WebP, `loading="lazy"` below the fold, always with `alt`.

## Verification before saying "done"

Run through this for every phase that changes UI:

- [ ] Opens with no console errors or warnings via a local server
- [ ] Works at 320, 768, 1024, and 1440 px wide with no horizontal scroll
- [ ] Fully keyboard navigable; visible focus; Esc closes dialogs
- [ ] Tested with reduced motion enabled (DevTools → Rendering → emulate)
- [ ] Both dark and light themes readable (contrast ≥ 4.5:1 for text)
- [ ] GitHub section degrades gracefully when the network request fails
- [ ] No leftover `console.log`, dead code, or unused files

## Do not

- Do not add a build system, package.json dependencies, or framework files.
- Do not commit secrets or tokens. The GitHub API is called unauthenticated.
- Do not use `innerHTML` with fetched data, `eval`, or inline event handler attributes.
- Do not remove accessibility features to make an effect work.
- Do not create extra documentation files unless asked.
