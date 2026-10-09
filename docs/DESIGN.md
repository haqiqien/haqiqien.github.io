# DESIGN.md: Interactive Playground

## 1. Concept

A calm, minimal, dark-first page that **comes alive under the pointer**. The base is clean (generous whitespace, strong typography, no stock imagery), and interaction is the personality: a constellation that follows the cursor, cards that tilt toward you, stickers you can throw around, a command palette, and a hidden terminal.

Guiding rules:
- **Quiet by default, playful on touch.** Nothing flashes or moves on its own except the ambient canvas and subtle reveals.
- **Interaction never blocks content.** Everything important is readable and clickable without any effect.
- **Fast first.** If an effect threatens performance, simplify it.

## 2. Design tokens

Define as CSS custom properties in `:root`; light overrides in `[data-theme="light"]`.

### Color
| Token | Dark | Light |
|---|---|---|
| `--bg` | `#0B1020` | `#FFFFFF` |
| `--surface` | `#141B2D` | `#F1F5F9` |
| `--surface-2` | `#1C2540` | `#E2E8F0` |
| `--text` | `#E6EAF2` | `#0F172A` |
| `--text-muted` | `#9AA7BD` | `#475569` |
| `--border` | `rgba(255,255,255,.10)` | `rgba(15,23,42,.12)` |
| `--accent` | `#5EEAD4` (mint) | `#0D9488` |
| `--accent-2` | `#818CF8` (indigo) | `#4F46E5` |
| `--focus` | `#FBBF24` | `#B45309` |

Accent usage: one primary accent for CTAs, links, active states; `--accent-2` only for gradients and particle variety. Verify text contrast ≥ 4.5:1 in both themes.

### Typography
- Headings + UI labels: **JetBrains Mono** (fallback `ui-monospace, SFMono-Regular, Menlo, monospace`)
- Body: **Inter** (fallback `system-ui, -apple-system, Segoe UI, Roboto, sans-serif`)
- Scale (fluid): h1 `clamp(2.4rem, 6vw + 1rem, 5rem)` · h2 `clamp(1.8rem, 3vw + 1rem, 2.8rem)` · body `1rem/1.65`
- `font-display: swap`; load at most two families, max 3-4 weights total.

### Spacing, shape, motion
- Spacing scale: 4, 8, 12, 16, 24, 32, 48, 72, 120 px (as `--space-*`)
- Radius: `--radius-sm 8px`, `--radius 16px`, `--radius-lg 24px`
- Shadows: soft and low-opacity; no heavy glows except the card spotlight
- Durations: `--dur-fast 150ms`, `--dur 300ms`, `--dur-slow 700ms`
- Easing: `--ease-out cubic-bezier(.22,1,.36,1)`, `--ease-spring cubic-bezier(.34,1.56,.64,1)`
- Layout: max width 1100px, centered; section padding `clamp(4rem, 10vw, 8rem)` vertical

## 3. Layout per section

**Navbar:** left = logo/monogram; center/right = anchors (Projects, GitHub, Skills, About, Hobbies, Contact); right = theme toggle + "⌘K" hint button that opens the palette. Translucent background with blur, becomes solid on scroll. Under 768px: hamburger → full-width drawer.

**Hero (full viewport height):** canvas fills background. Foreground, left-aligned: small mono greeting → very large name → role line with rotating words → one-sentence value statement → two CTAs → social icons. Scroll hint at bottom.

**Projects:** 2-column grid (1 on mobile). Each card: image/preview area, title, summary, tag chips, two buttons. Click card or "Case study" → dialog.

**GitHub:** left = profile summary (avatar, count-up stats); right = grid of 4-6 repo cards; below = horizontal language bar with legend.

**Skills:** three groups, each a labeled row of chips. Chips lift slightly on hover.

**About:** two columns on desktop: text left, a small "currently" panel right (building / learning / reading), optional photo.

**Hobbies:** a bounded "playground" area containing draggable stickers (see I-08). On mobile, stickers sit in a tidy grid and remain tappable; dragging is optional there.

**Contact:** large headline, email as a big copy-on-click link, social links, simple form.

**Footer:** small text, back-to-top, hint: "Press `/` for commands".

## 4. Interaction catalog

Each item lists trigger → behavior → fallback → performance notes. All must follow the rules in `AGENTS.md`.

### I-01 Constellation canvas (hero)
- **Behavior:** particles drift slowly; lines connect neighbors closer than ~120px (opacity by distance); pointer repels particles within ~140px with soft easing; click spawns a small burst of 6-8 particles that fade.
- **Counts:** desktop `min(90, area / 14000)`, mobile max 40. Colors: mostly `--text-muted` at low opacity, a few `--accent` / `--accent-2`.
- **Fallback:** under reduced motion, draw **one static frame** and no loop. On touch, particles drift only (touch point acts as a gentle attractor while touching).
- **Performance:** DPR capped at 2; resize debounced; loop paused when hero is off-screen or tab hidden; neighbor search via simple grid or O(n²) only if n ≤ 90.

### I-02 Custom cursor
- **Behavior:** small dot follows pointer exactly; larger ring follows with lerp (~0.15). Ring expands and shows a label ("View", "Drag", "Copy") over elements with `data-cursor="..."`.
- **Enabled when:** `(hover: hover) and (pointer: fine)` and not reduced motion.
- **Rule:** the **native cursor stays visible**. Use `pointer-events: none` and `aria-hidden="true"`.

### I-03 Magnetic buttons
- **Behavior:** within ~80px of a `[data-magnetic]` element, it translates up to 8px toward the pointer; springs back on leave.
- **Fallback:** none needed (normal button). Disabled on touch/reduced motion.

### I-04 Tilt + spotlight cards
- **Behavior:** card rotates up to 8° toward the pointer (perspective 800px) and a radial highlight follows the pointer via `--mx` / `--my` CSS variables.
- **Fallback:** flat card, hover = slight lift/border color. Disabled on touch/reduced motion.
- **Performance:** update only transform + CSS vars inside `requestAnimationFrame`.

### I-05 Scroll reveal
- **Behavior:** elements with `[data-reveal]` fade/translate up 16px once when ~15% visible; siblings stagger by 60ms.
- **Fallback:** content visible immediately under reduced motion and when JS is off (use a `.js` class on `<html>` to enable hidden initial state).

### I-06 Scroll progress + active nav
- **Behavior:** thin accent bar at top shows page progress; `IntersectionObserver` marks the current section link with `aria-current="true"`.

### I-07 Rotating role words
- **Behavior:** role cycles through 3-4 short phrases with a typing or scramble effect, ~2.5s each, pausing when the tab is hidden.
- **Fallback:** show the first phrase statically; screen readers get the full static sentence.

### I-08 Draggable hobby stickers
- **Behavior:** Pointer Events drag; on release apply inertia (velocity decay ~0.92 per frame) and bounce softly off container edges. Click/Enter flips the sticker to reveal a short story. Slight random initial rotation (-6° to 6°).
- **Keyboard:** stickers are focusable; arrow keys nudge 12px; Enter/Space flips; Esc unflips.
- **Fallback (touch/reduced motion):** stickers laid out in a grid; flip on tap; no inertia.

### I-09 Command palette
- **Trigger:** `Ctrl/Cmd+K`, `/` (when not typing), or the navbar button.
- **Behavior:** modal with search input and list of commands: go to each section, toggle theme, open GitHub, copy email, open terminal. Filter as you type; ↑/↓ to move, Enter to run, Esc to close.
- **A11y:** `role="dialog"` with combobox + listbox pattern, focus trapped, focus restored on close, `aria-activedescendant`.

### I-10 Terminal easter egg (P2)
- **Trigger:** palette command "Open terminal" or typing the Konami code.
- **Behavior:** overlay terminal. Commands: `help`, `whoami`, `about`, `projects`, `skills`, `hobbies`, `contact`, `theme dark|light`, `clear`, `exit`. Output is built with `textContent`. Unknown command → friendly hint.
- **A11y:** visible Close button, Esc to exit, output in an `aria-live="polite"` region.

### I-11 Theme switch
- **Behavior:** toggle swaps `data-theme`; if `document.startViewTransition` exists, use a circular reveal from the toggle; otherwise instant swap with a short color transition.
- **Fallback:** instant swap under reduced motion.

### I-12 Case-study dialog
- **Behavior:** native `<dialog>` opened with `showModal()`; scrim click and Esc close; focus returns to the opening card. Content from `data.js`.

### I-13 GitHub panel motion
- **Behavior:** skeleton shimmer while loading; stats count up once when visible; language bar segments grow in sequence.
- **Fallback:** final values shown immediately under reduced motion.

### I-14 Mini-game "Bug Catcher" (P2)
- **Behavior:** 30-second canvas game; click/tap bugs before they escape; score shown; best score in `localStorage` (try/catch). Launched only from palette/terminal, never auto-starts.
- **A11y:** clearly optional; Esc exits; not required for any content.

## 5. Responsive behavior

- Hover-driven effects (I-02, I-03, I-04) off below touch/`hover: none` devices.
- Under 768px: single column, hamburger nav, lighter canvas (fewer particles), stickers in a grid.
- Tap targets ≥ 44×44px.
- Test widths: 320, 375, 768, 1024, 1440.

## 6. Accessibility checklist for design

- Visible `:focus-visible` outline using `--focus`, 2-3px, offset 2px.
- Never convey meaning by color alone (repo language also has text).
- Motion: ambient motion is slow and low contrast; nothing flashes more than 3 times/second.
- Dialogs/palette/terminal trap focus and restore it.
- Provide text alternatives for all icons and images.

## 7. Content tone

Friendly, direct, first person, short sentences. Avoid buzzwords ("passionate", "guru", "rockstar"). Show specifics: what was built, why, and what was learned.
