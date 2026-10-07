# Simple-deck builder prompt

> **Scope:** these guides are for the **simple decks** — plain HTML in `training/slide-decks/v1/unit-N/`
> (one deck per lesson, with its own `deck.css` / `deck.js`). The **advanced decks** are built from
> `training/deck-builder/src` instead (see `../README.md`).
>
> **Current house rules (override anything older below):** short lines, no paragraph text · no day,
> session or time-of-day framing (`data-time` may be set but is not displayed) · every formula gets a
> term-by-term slide and a worked slide · exactly one "Lab demo" slide per notebook, where it is run ·
> every number verified by computing it · back-link to the unit page is `../index.html`.

Use this prompt to build any lesson slide deck. Copy and customize.

---

## Prompt Template

```
Build a slide deck HTML file for Lesson XX.

INPUT FILES:
- Lesson content: training/unit-N/docs/lessons/LXX-*.md
- Template reference: training/slide-decks/v1/unit-2/L07.html (audited; has formula and lab-demo slides)
- CSS: deck.css in the same slide-decks/v1/unit-N folder
- JS: deck.js in the same slide-decks/v1/unit-N folder

OUTPUT: training/slide-decks/v1/unit-N/LXX.html

RULES (STRICT — do not deviate):

1. BACKGROUND: White (#ffffff) on ALL slides. No gradients, no colored backgrounds on any slide type.

2. TEXT: Bold black only. NO colored text classes (no text-blue, text-green, text-red, etc.). Use bold (<strong>) for emphasis. Use light background for visual distinction.

3. CARDS: Plain .card class. Use background color ONLY for semantic meaning:
   - Pros: background:#ecfdf5 (light green)
   - Cons: background:#fef2f2 (light red)
   - Neutral info: background:#f8f9fb (light gray)
   - No accent-* classes, no colored borders

4. TABLES: .compare-table class. Bold black text only. Use .highlight-row for emphasis row (background highlight, not colored text).

5. NAVIGATION:
   - 1 press = 1 slide (default)
   - Use .step ONLY where you talk through points one by one (bullets, progression)
   - Max 1 .step reveal per slide for dramatic moments (like face reveal)
   - NO .step on approach overview slides or single-idea slides

6. DIAGRAMS: Use .diagram with .box, .arrow elements. Generator boxes use .box.gen, Discriminator boxes use .box.disc. SVG for complex visuals (architecture, curves, trees).

7. FORMULAS: Use .formula class. Font-family: var(--font-mono).

8. SLIDE STRUCTURE — every lesson follows this flow:
   a. Cover (lesson number, title, subtitle)
   b. Hook/engagement slide (wow fact, live demo, or question)
   c. Content slides (one idea per slide, from lesson MD)
   d. "So Far" summary table (mid-lesson recap, NOT a quiz)
   e. More content slides
   f. Summary (3-5 numbered takeaway cards)
   g. Knowledge Check (3-4 eye-opener questions with .revealable)
   h. Bridge (next lesson hook)

9. KNOWLEDGE CHECK at END only. Questions must be EYE-OPENERS:
   - Not "name the 4 approaches" (recall = boring)
   - Instead: "If X is better, why hasn't everyone switched?" (analysis)
   - "How can it learn WITHOUT a target?" (insight)
   - "What breaks if you remove X?" (consequence)

10. CROSS-CHECK: Every section in the lesson .md MUST appear in the slides. Read the MD first, list all sections, verify each has at least one slide.

11. PRESENTER NOTES: Every slide MUST have data-say, data-ask, data-time.

12. RESPONSIVE: Works at 200% zoom on 27" monitor.
    - Titles use clamp() for font-size
    - Content scrollable (overflow-y: auto)
    - Tables scrollable (overflow-x: auto)
    - Grids use auto-fit with minmax

13. SVG COLORS (for inline diagrams):
    - Generator: fill=#ecfdf5 stroke=#10b981
    - Discriminator: fill=#fef2f2 stroke=#ef4444
    - Noise/info: fill=#f8f9fb stroke=#3b6df0
    - Arrows: stroke=#4a5068 (neutral dark)
    - Feedback loop: stroke=#3b6df0 (blue, animated .flow-arrow)
    - Labels: fill=#8b90a5 (muted)
    - Text: fill=#1a1d2e (dark)

14. NO orange, NO purple anywhere. Colors: blue, green, red, cyan + muted gray.

15. FILE BOILERPLATE:
    - Link to deck.css and deck.js (same folder)
    - Include: progress-bar, slide-counter, lesson-nav, notes-panel, help-overlay
    - body data-lesson="LXX"
```

---

## Slide Count Guidelines

| Lesson Type | Slides | Content | Steps |
|---|---|---|---|
| Overview (L00) | 16-18 | Tables, cards, diagrams | Steps on bullet lists only |
| Concept (L01) | 15-18 | Diagrams, formulas, VS layouts | Steps on build-up points only |
| Build (L02) | 14-16 | Architecture diagrams, code traces | Steps on training progression |
| Technical (L04) | 15-17 | SVG visuals, shape traces, tables | Steps on feature hierarchy |

---

## Quality Checklist

Before finalizing any slide deck:

- [ ] Every MD section has a corresponding slide
- [ ] No colored text (all bold black)
- [ ] Pros = green bg, Cons = red bg, Neutral = gray bg
- [ ] 1 press = 1 slide (except deliberate .step reveals)
- [ ] Knowledge check at END only with eye-opener questions
- [ ] "So Far" summary table mid-lesson (not a quiz)
- [ ] All data-say, data-ask, data-time present
- [ ] Works at 200% zoom (test in browser)
- [ ] No orange, no purple
- [ ] SVG diagrams use the color spec above
