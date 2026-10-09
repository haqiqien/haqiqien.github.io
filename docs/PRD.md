# PRD: Interactive Personal Portfolio

**Stack:** HTML5 + CSS3 + vanilla JavaScript (ES modules). No frameworks, no build step.
**Design direction:** Interactive Playground (see `DESIGN.md`).
**Basis:** analysis of DevPlaybook, "Best Developer Portfolio Examples (2026)".

## 1. Goal

A single-page personal website that introduces the owner, showcases real projects with context, shows live GitHub activity, and shares hobbies, with a memorable interactive feel that still loads fast and stays accessible.

Success criteria:
- A visitor understands who the owner is and sees the first project within ~30 seconds.
- Lighthouse mobile: Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 90, SEO ≥ 90.
- Works on 320 px to 1440 px wide, touch and mouse, with or without reduced motion.

## 2. Principles (from the reference article)

1. **Projects before skills.** Do not lead with a buzzword list.
2. **Evidence of real work.** 3-4 projects, each with live demo + public source.
3. **Explain, don't just list.** Each project: problem, solution, key decisions, result, what I'd change.
4. **Concise skills.** Only technologies actually used; no percentage bars.
5. **Reads like a person, not a resume.** Personal tone, hobbies, small details.
6. **Fast and mobile-friendly.** Speed and a working phone layout are part of the impression.
7. **Ship minimal first, iterate.** A live imperfect site beats a perfect unfinished one.
8. **Set Open Graph tags** so shared links look good; consider lightweight analytics.

## 3. Users

| Persona | Wants |
|---|---|
| Recruiter / hiring manager | Fast evaluation: real projects, demos, GitHub |
| Developer / collaborator | Technical judgment, readable source |
| Client | Capability and a way to reach out |
| Friend / community | Personality, hobbies |

## 4. Scope

**In scope:** one page with sections Hero, Projects, GitHub, Skills, About, Hobbies, Contact; dark/light theme; GitHub public API; interactive effects listed in `DESIGN.md`; SEO basics; accessibility.

**Out of scope (MVP):** backend, database, CMS, auth, dynamic blog, multi-language switching.

## 5. Section order

1. Navbar (sticky) → 2. Hero → 3. Projects → 4. GitHub → 5. Skills → 6. About → 7. Hobbies → 8. Contact → 9. Footer

## 6. Functional requirements

Priority: **P0** must ship in MVP · **P1** important · **P2** nice to have.

### Global
| ID | Requirement | P |
|---|---|---|
| G-1 | Dark-first theme with light toggle; follows `prefers-color-scheme` on first visit; choice saved in `localStorage` (try/catch) | P0 |
| G-2 | Sticky navbar, smooth anchor scroll, active-section highlight, hamburger under 768 px | P0 |
| G-3 | Scroll progress indicator | P1 |
| G-4 | Scroll-reveal animation for sections and cards | P1 |
| G-5 | Back-to-top button | P2 |
| G-6 | Custom 404 page | P2 |

### Hero
| ID | Requirement | P |
|---|---|---|
| H-1 | Name, role, one-line value statement (≤ 2 lines), primary CTA "View projects", secondary CTA "Contact me" | P0 |
| H-2 | Social links: GitHub, LinkedIn, email | P0 |
| H-3 | Interactive particle/constellation canvas background reacting to the pointer | P0 |
| H-4 | Rotating or typed role words, static under reduced motion | P1 |
| H-5 | No stock photos or generic illustrations | P0 |

### Projects
| ID | Requirement | P |
|---|---|---|
| P-1 | 3-4 featured projects as cards: title, 1-2 sentence summary, tech tags, Live Demo + Source buttons | P0 |
| P-2 | Data-driven from `js/data.js` (add a project without touching HTML) | P0 |
| P-3 | Cards with pointer tilt + spotlight (desktop only) | P1 |
| P-4 | Case-study dialog (`<dialog>`): problem, solution, decisions, result, retrospective | P1 |
| P-5 | Tag filter | P2 |

### GitHub
| ID | Requirement | P |
|---|---|---|
| GH-1 | Fetch profile + repos from the public REST API; show avatar, repo count, followers | P0 |
| GH-2 | Show 4-6 top repos (non-forks): name, description, language, stars, link | P0 |
| GH-3 | Language distribution bar computed from repos | P1 |
| GH-4 | Cache in `sessionStorage`; graceful fallback to static data + friendly message on failure/rate limit | P0 |
| GH-5 | Skeleton loading state; animated count-up numbers | P1 |

### Skills / About
| ID | Requirement | P |
|---|---|---|
| S-1 | Grouped chips (Languages, Frontend, Tools), max ~12 items | P0 |
| A-1 | 2-3 short paragraphs of background + current focus | P0 |

### Hobbies
| ID | Requirement | P |
|---|---|---|
| HB-1 | Hobby "stickers" with icon and one-line story | P0 |
| HB-2 | Stickers are draggable with light inertia; keyboard alternative (focus + arrow keys); click/Enter flips to reveal story | P1 |

### Delight features
| ID | Requirement | P |
|---|---|---|
| D-1 | Custom cursor (dot + ring) on fine-pointer devices, native cursor kept visible | P1 |
| D-2 | Magnetic buttons | P1 |
| D-3 | Command palette (`Ctrl/Cmd+K` or `/`): jump to sections, toggle theme, copy email, open GitHub | P1 |
| D-4 | Terminal easter egg with commands (`help`, `about`, `projects`, `skills`, `hobbies`, `contact`, `theme`, `clear`) | P2 |
| D-5 | Optional tiny canvas mini-game ("Bug Catcher", 30 s) | P2 |

### Contact
| ID | Requirement | P |
|---|---|---|
| C-1 | Email + GitHub + LinkedIn visible, at least 2 working ways to reach out | P0 |
| C-2 | Form with client-side validation, sent via `mailto:` or a free form service; `aria-live` status message | P1 |

## 7. Non-functional requirements

- **Performance:** budgets in `AGENTS.md`. Pause canvas/loops when off-screen or tab hidden.
- **Accessibility (WCAG 2.1 AA):** semantic HTML, skip link, visible focus, keyboard-operable everything, contrast ≥ 4.5:1, `aria-label`s on icon buttons, focus management for dialog/palette, `prefers-reduced-motion` honored.
- **Responsive:** mobile-first; breakpoints ~480 / 768 / 1024 / 1280 px; max content width ~1100 px.
- **SEO/sharing:** unique `<title>`, meta description, Open Graph + Twitter Card (1200×630), favicon, `robots.txt`, `sitemap.xml`; optional JSON-LD `Person`.
- **Security/privacy:** no tokens in client code; external strings inserted with `textContent`; analytics (if any) cookie-less.
- **Browsers:** last two versions of Chrome, Firefox, Safari, Edge; iOS Safari; Chrome Android.

## 8. Release plan

| Phase | Contents |
|---|---|
| MVP | Static layout, theme, hero + canvas, projects (data-driven), about, contact (mailto), SEO, responsive |
| v1.1 | GitHub section, skills, hobbies, scroll reveal, tilt cards, custom cursor, magnetic buttons, case-study dialog |
| v1.2 | Draggable stickers, command palette, form service, back-to-top, 404, analytics |
| v2.0 (optional) | Terminal, mini-game, static blog, extra language |

## 9. Risks

| Risk | Mitigation |
|---|---|
| GitHub API rate limit (60 req/h unauthenticated) | `sessionStorage` cache, static fallback |
| Heavy effects hurt performance/mobile | Strict budgets, pause off-screen, disable on touch/low-power/reduced motion |
| Interactions hurt accessibility | Progressive enhancement + keyboard alternatives (see `AGENTS.md`) |
| Weak content undermines great visuals | Only 3-4 strong projects; fill `CONTENT.md` honestly |
| Form spam without backend | Form service with spam protection, or `mailto` only |

## 10. Acceptance criteria (MVP + v1.1)

1. All sections render correctly 320-1440 px with no horizontal scroll.
2. Nav, theme toggle, dialog, and form are fully keyboard usable.
3. Every interactive effect has a reduced-motion and touch-safe fallback.
4. GitHub section shows live data and degrades gracefully when offline.
5. Lighthouse targets met; no console errors.
6. Open Graph preview works when the link is shared.
7. All demo/source links work.
