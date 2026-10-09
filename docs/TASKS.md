# TASKS.md

Ordered work plan. **Do one phase at a time.** After each phase: tick the boxes, run the verification checklist in `AGENTS.md`, summarize, and stop.

Legend: **P0** MVP Â· **P1** v1.1/v1.2 Â· **P2** optional.

---

## Phase 0: Scaffold
- [x] Create folder structure from `ARCHITECTURE.md` (only files needed now: `index.html`, `css/tokens.css`, `css/base.css`, `css/layout.css`, `css/components.css`, `css/effects.css`, `js/main.js`, `js/config.js`, `js/data.js`, `js/utils.js`)
- [x] `index.html` with `lang`, viewport meta, title, description, skip link, landmarks, section placeholders with ids: `hero`, `projects`, `github`, `skills`, `about`, `hobbies`, `contact`
- [x] `<html class="js">` inline snippet and pre-paint theme snippet in `<head>`
- [x] Fill `config.js` and `data.js` from `docs/CONTENT.md` (placeholders allowed)

**Done when:** page opens from a local server with no console errors and shows all section headings.

## Phase 1: Foundation (P0)
- [x] `tokens.css` with all tokens from `DESIGN.md` (dark default + light theme)
- [x] `base.css`: reset, typography (fluid), `:focus-visible`, skip link, `.visually-hidden`
- [x] `layout.css`: container, section spacing, responsive navbar (hamburger < 768px), footer
- [x] `theme.js`: toggle, `localStorage` (try/catch), follows system on first visit
- [x] `nav.js`: smooth scroll, hamburger open/close (Esc closes), sticky nav style change on scroll
- [x] Static content for Hero, About, Contact links written into HTML

**Done when:** all sections readable at 320-1440px, theme toggle works and persists, nav keyboard-operable.

## Phase 2: Data-driven content (P0)
- [x] `render.js`: project cards, skills chips, hobby stickers (grid mode) from `data.js` using `createElement`/`textContent`
- [x] Button and chip components in `components.css`
- [x] `<noscript>` block listing GitHub, LinkedIn, email, and project links
- [x] Images with `width`/`height`, `loading="lazy"`, `alt`

**Done when:** editing only `data.js` adds/removes projects, skills, and hobbies.

## Phase 3: Core motion (P1)
- [x] `reveal.js`: `[data-reveal]` with stagger; visible immediately when JS off or reduced motion
- [x] Scroll progress bar and active-section highlight (`aria-current`)
- [x] `roles.js`: rotating role words (static under reduced motion; pauses when tab hidden)
- [x] `effects.css` includes a `prefers-reduced-motion` block that disables non-essential animation

**Done when:** motion is subtle and everything is visible with reduced motion on.

## Phase 4: Hero canvas (P0)
- [x] `hero-canvas.js` implementing I-01 (particles, connecting lines, pointer repel, click burst)
- [x] Particle count by viewport size; DPR cap 2; `ResizeObserver`
- [x] Pause on off-screen and `visibilitychange`
- [x] Reduced motion â†’ single static frame
- [x] Theme-aware colors from CSS variables, updated on `portfolio:theme-changed`

**Done when:** steady ~60fps on a mid-range laptop, canvas does not affect text readability, no listeners leak after `destroy()`.

## Phase 5: Pointer effects (P1)
- [x] `cursor.js` (I-02): dot + ring + labels via `data-cursor`; native cursor stays
- [x] `magnetic.js` (I-03) on `[data-magnetic]`
- [x] `tilt.js` (I-04) tilt + spotlight on `[data-tilt]` project cards
- [x] All three enabled only on `(hover: hover) and (pointer: fine)` and not reduced motion
- [x] Feature flags in `config.js` respected

**Done when:** touch devices and reduced motion see normal static cards/buttons; no layout shift from effects.

## Phase 6: GitHub (P0/P1)
- [x] `github.js` per `ARCHITECTURE.md` section 6: profile, top repos, caching, timeout, fallback
- [x] Skeleton loading state
- [x] Count-up numbers (once, when visible) and language bar (P1)
- [x] Test network failure: fallback + notice appear and loading state clears

**Done when:** works online, offline, and when rate-limited.

## Phase 7: Case study dialog (P1)
- [x] `dialog.js` (I-12) with native `<dialog>`, focus restore, scroll lock, `aria-labelledby`
- [x] Case-study content from `data.js` (problem, solution, decisions, result, retrospective)
- [x] Cards open the dialog via button (not only by clicking the whole card)

**Done when:** fully keyboard operable and screen-reader labeled.

## Phase 8: Hobby stickers (P1)
- [x] `stickers.js` (I-08): Pointer Events drag, inertia, bounds, flip story
- [x] Keyboard: focus, arrows nudge, Enter/Space flip, Esc unflip
- [x] Grid mode for touch/reduced motion/small screens

**Done when:** works with mouse, touch, and keyboard only; stickers never leave their container.

## Phase 9: Command palette (P1)
- [x] `palette.js` (I-09) lazy-loaded; triggers `Ctrl/Cmd+K`, `/`, navbar button
- [x] Commands: go to each section, toggle theme, open GitHub, copy email
- [x] Combobox/listbox a11y, focus trap, focus restore
- [x] "Copy email" uses `navigator.clipboard` with a `try/catch` fallback

**Done when:** usable entirely by keyboard; `/` does nothing while typing in inputs.

## Phase 10: Contact, SEO, polish (P0/P1)
- [x] `contact.js`: validation, `aria-live` status, `mailto:` default, optional form service
- [x] Open Graph/Twitter tags, canonical, favicon, `robots.txt`, `sitemap.xml`, optional JSON-LD
- [x] `404.html`
- [x] Back-to-top button (P2)
- [x] Image optimization pass (WebP, sizes, lazy)

**Done when:** link preview renders correctly and the form gives clear feedback.

## Phase 11: QA and performance
- [x] Run Lighthouse (mobile): meet targets in `AGENTS.md`
- [x] Manual tests: 320/375/768/1024/1440px; Chrome, Firefox, Safari (or WebKit), mobile emulation (all widths checked in Chrome, Firefox, and WebKit; Chrome touch and reduced-motion emulation checked)
- [x] Reduced-motion and touch emulation pass
- [x] Keyboard-only pass through the entire page, including palette and dialog (Chrome skip link, visible focus, theme toggle, menu/Escape, palette/Escape/focus restore, and form checked; case-study open/focus/Escape/focus restore checked in Firefox and WebKit using a temporary browser-only fixture; no personal project data was added)
- [x] Contrast check in both themes
- [x] Remove dead code and console logs; confirm JS < 80 KB (79,728 bytes) and CSS < 40 KB (25,700 bytes) source
- [x] Short `README.md` with: how to run locally, how to edit `data.js`/`config.js`, how to deploy

**Done when:** acceptance criteria in `PRD.md` section 10 pass; any criteria dependent on real project data are explicitly deferred by the user.

**Acceptance status:** local and live QA for PRD criteria 1–6 is complete, including Open Graph tags and image availability. Criterion 7 (real demo/source links) is intentionally deferred; the user confirmed project placeholders should remain.

## Phase 12: Deploy
- [x] Add deploy notes for GitHub Pages / Netlify / Vercel in `README.md`
- [x] Set canonical URL and sitemap to the GitHub Pages project URL (`https://addien.ai.id/personal-web/`; sitemap is not listed in the subpath robots file because crawler robots rules are served at the domain root)
- [x] Verify the live site (links, OG tags/image, console) at `https://addien.ai.id/personal-web/` (HTTP 200; sitemap and OG image return 200; no browser console errors or failed requests; all internal anchor targets exist)

**Deployment status:** source is published on `main` and GitHub Pages is enabled for root. Live site verification passed. Real project demo/source links remain placeholders by user request, so PRD criterion 7 is deferred.

---

## Optional (P2), only after Phase 11 passes
- [x] `terminal.js` (I-10): accessible terminal, lazy-loaded from palette or Konami code (commands, Escape, and focus cycling verified in Chrome/Firefox/WebKit; reduced motion and 320–1440px layouts checked)
- [ ] `game.js` (I-14): Bug Catcher, only launched from palette/terminal
- [ ] Tag filter for projects
- [ ] Static blog pages (plain HTML) linked from projects
- [ ] Lightweight, cookie-less analytics

