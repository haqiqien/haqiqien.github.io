# CODEX-PROMPTS.md

How to use this pack with Codex. This file is for **you**; Codex does not need it.

## 1. Where to put the files

Create an empty repo/folder for the website and copy the pack in like this:

```
your-portfolio/
├── AGENTS.md              # must be in the repo root (Codex reads it automatically)
└── docs/
    ├── PRD.md
    ├── DESIGN.md
    ├── ARCHITECTURE.md
    ├── CONTENT.md         # FILL THIS IN FIRST
    └── TASKS.md
```

`CODEX-PROMPTS.md` can stay outside the repo.

## 2. Before you start

1. Fill in `docs/CONTENT.md` (name, links, projects, skills, hobbies). The more real content, the better the result.
2. Put project screenshots (WebP preferred) in `assets/images/` if you have them.
3. Open the folder in Codex (CLI, IDE extension, or cloud task).

## 3. Prompts to paste, in order

**Prompt 1: orientation (no code yet)**
```
Read AGENTS.md and everything in docs/. Summarize in under 15 lines: what we're building, the stack constraints, and the phases in TASKS.md. List anything in CONTENT.md that is still a placeholder. Do not write code yet.
```

**Prompt 2: Phase 0 and 1**
```
Do Phase 0 and Phase 1 of docs/TASKS.md only. Follow AGENTS.md strictly. When done, tick the checkboxes, run the verification checklist, and summarize what you built and how I can run it locally.
```

**Prompt 3: Phase 2 and 3**
```
Do Phase 2 and Phase 3 of docs/TASKS.md. Keep all content data-driven from js/data.js. Remember reduced-motion and no-JS fallbacks. Summarize and stop.
```

**Prompt 4: Hero canvas (the signature effect)**
```
Do Phase 4: the hero constellation canvas exactly as specified in DESIGN.md I-01. Make sure it pauses off-screen and when the tab is hidden, and draws a single static frame with reduced motion. Report the particle counts and frame cost you measured.
```

**Prompt 5: Pointer effects**
```
Do Phase 5: custom cursor, magnetic buttons, tilt + spotlight cards. They must only run on (hover: hover) and (pointer: fine) and not under reduced motion. Do not hide the native cursor.
```

**Prompt 6: GitHub**
```
Do Phase 6: the GitHub section. Use my username from js/config.js. Include caching, timeout, and the offline/rate-limit fallback. Show me how you tested the failure case.
```

**Prompt 7: Dialog, stickers, palette**
```
Do Phases 7, 8, and 9 one at a time, stopping after each to summarize. Keyboard accessibility is required for every one of them.
```

**Prompt 8: Finish**
```
Do Phases 10, 11, and 12. Run the full QA list, report Lighthouse scores if you can run them, fix anything below target, and write README.md with run, edit, and deploy instructions.
```

**Optional prompt: extras**
```
After Phase 11 passes, implement the P2 terminal easter egg (I-10) as specified, then stop.
```

## 4. Handy follow-up prompts

- "Check the whole site against the accessibility rules in AGENTS.md and fix violations."
- "Test with prefers-reduced-motion enabled and list any effect that still moves."
- "Reduce JS and CSS size to meet the budget in AGENTS.md without removing features."
- "The hero canvas feels heavy on my phone. Lower the cost while keeping the look."
- "Change the accent color to {{hex}} and re-check contrast in both themes."
- "Add a new project from this data: {{paste}}. Only edit js/data.js."

## 5. Tips

- Run one or two phases per prompt. Smaller steps give better results and easier review.
- Always open the site through a local server (`python3 -m http.server 8080`), not by double-clicking `index.html`.
- If Codex invents content, point it to `docs/CONTENT.md` and tell it to use placeholders instead.
- Commit after each phase so you can roll back easily.
