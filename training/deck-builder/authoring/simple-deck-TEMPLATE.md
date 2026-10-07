# Simple-deck template

> **Scope:** these guides are for the **simple decks** — plain HTML in `training/slide-decks/v1/unit-N/`
> (one deck per lesson, with its own `deck.css` / `deck.js`). The **advanced decks** are built from
> `training/deck-builder/src` instead (see `../README.md`).
>
> **Current house rules (override anything older below):** short lines, no paragraph text · no day,
> session or time-of-day framing (`data-time` may be set but is not displayed) · every formula gets a
> term-by-term slide and a worked slide · exactly one "Lab demo" slide per notebook, where it is run ·
> every number verified by computing it · back-link to the unit page is `../index.html`.

Reference template for the per-lesson HTML decks. Originally based on the Phase 1 L01 deck (since
replaced by S2); a current, audited example is `training/slide-decks/v1/unit-2/L07.html`.

---

## File Structure

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>LXX — Lesson Title</title>
<link rel="stylesheet" href="deck.css">
</head>
<body data-lesson="LXX">
<div class="progress-bar"></div>
<div class="slide-counter"></div>
<div class="lesson-nav"><a href="index.html">Phase X</a> &bull; LXX</div>

<div class="deck">
  <!-- slides go here -->
</div>

<!-- ALWAYS include these three -->
<div class="notes-panel">
  <h4>Presenter Notes</h4><span class="note-time"></span>
  <p class="note-say"></p><p class="note-ask"></p>
</div>
<div class="help-overlay">
  <div class="help-content">
    <h3>Keyboard Shortcuts</h3>
    <div class="key-row"><span>Next / build</span><kbd>&rarr;</kbd> <kbd>Space</kbd></div>
    <div class="key-row"><span>Previous</span><kbd>&larr;</kbd></div>
    <div class="key-row"><span>Presenter notes</span><kbd>N</kbd></div>
    <div class="key-row"><span>Fullscreen</span><kbd>F</kbd></div>
    <div class="key-row"><span>Reveal answer</span><kbd>R</kbd></div>
    <div class="key-row"><span>This help</span><kbd>H</kbd></div>
    <div class="key-row"><span>Close</span><kbd>Esc</kbd></div>
  </div>
</div>
<script src="deck.js"></script>
</body>
</html>
```

---

## Color Palette (NO ORANGE)

| Color | CSS Class | Card Class | Hex | Use For |
|-------|-----------|------------|-----|---------|
| **Blue** | text-blue | accent-blue | #3b6df0 | Primary accent, highlights, key facts |
| **Green** | text-green | accent-green | #10b981 | Generator, positive, pros |
| **Red** | text-red | accent-red | #ef4444 | Discriminator, negative, cons, problems |
| **Purple** | text-purple | accent-purple | #8b5cf6 | Secondary accent, intermediate, variations |
| **Cyan** | text-cyan | accent-cyan | #0ea5e9 | Technical details, tertiary info |
| **Yellow** | text-yellow | accent-yellow | #eab308 | Callout, end-game, special emphasis |
| **Muted** | text-muted | — | #8b90a5 | Subtle text, footnotes |

### Rules
- **NO orange** anywhere (no text-orange, accent-orange, #f59e0b, #fb923c)
- Generator = always **green** (box.gen, accent-green, text-green)
- Discriminator = always **red** (box.disc, accent-red, text-red)
- Pros = always **accent-green**
- Cons = always **accent-red**
- Table Type column = **bold black** (no colored text)
- Adjacent cards must use **different** accent colors

---

## Slide Types

### 1. Cover Slide
```html
<div class="slide cover" data-say="..." data-ask="..." data-time="1 min">
  <div class="lesson-number">Lesson XX</div>
  <h1>Title</h1>
  <p class="subtitle">Subtitle</p>
</div>
```

### 2. Content Slide (standard)
```html
<div class="slide" data-say="..." data-ask="..." data-time="2 min">
  <h2>Title with <span class="accent">Highlight</span></h2>
  <!-- content: cards, tables, diagrams, etc. -->
</div>
```

### 3. Checkpoint Slide (mid-lesson question)
```html
<div class="slide checkpoint" data-say="..." data-ask="..." data-time="2 min">
  <h3>Checkpoint</h3>
  <h2>Question Title</h2>
  <div class="revealable card">
    <h4>Question text?</h4>
    <p class="hint">Click to reveal</p>
    <div class="answer"><p class="text-blue mt-1">Answer text.</p></div>
  </div>
</div>
```

### 4. Prediction Slide (ask before showing)
```html
<div class="slide predict" data-say="..." data-ask="..." data-time="1.5 min">
  <h3>Predict</h3>
  <h2>Before I Show You...</h2>
  <div class="card" style="border:2px solid var(--accent-purple);background:#f5f3ff;">
    <h4 class="text-purple">Think about this:</h4>
    <p>Question for students to predict...</p>
  </div>
</div>
```

### 5. Section Divider
```html
<div class="slide section-divider" data-say="..." data-ask="" data-time="30 sec">
  <div class="section-number">N</div>
  <h2>Section Title</h2>
</div>
```

### 6. Summary Slide
```html
<div class="slide" data-say="..." data-ask="..." data-time="1.5 min">
  <h2>Lesson XX <span class="accent">Summary</span></h2>
  <div style="max-width:700px;">
    <div class="card mb-1 step" style="display:flex;gap:1rem;align-items:center;">
      <span style="font-size:1.5rem;font-weight:900;color:var(--accent-blue);min-width:2rem;">1</span>
      <p><strong>Takeaway:</strong> Description</p>
    </div>
    <!-- repeat for 2, 3, 4, 5 -->
  </div>
</div>
```

### 7. Bridge Slide (next lesson)
```html
<div class="slide cover" data-say="..." data-ask="" data-time="1 min">
  <div class="lesson-number">Next Up</div>
  <h1>Next Lesson Title</h1>
  <p class="subtitle">Lesson XX: Brief description</p>
</div>
```

---

## Component Patterns

### Cards
```html
<div class="card accent-blue">
  <h4>Title</h4>
  <p>Content</p>
</div>
```

### VS Layout (two things compared)
```html
<div class="vs-layout">
  <div class="card accent-green">Left</div>
  <div class="vs">VS</div>
  <div class="card accent-red">Right</div>
</div>
```

### Two-Column Layout
```html
<div class="two-col align-center">
  <div>Left column</div>
  <div>Right column</div>
</div>
```

### Flow Diagram
```html
<div class="diagram">
  <div class="box"><div class="label">LABEL</div><div class="value">Value</div></div>
  <div class="arrow">&rarr;</div>
  <div class="box gen"><div class="label">GEN</div><div class="value">G</div></div>
  <div class="arrow">&rarr;</div>
  <div class="box disc"><div class="label">DISC</div><div class="value">D</div></div>
</div>
```

### Formula
```html
<div class="formula">L = BCE(D(fake), 1)</div>
```

### Comparison Table
```html
<table class="compare-table">
  <tr><th>Column 1</th><th>Column 2</th></tr>
  <tr><td><strong>Bold item</strong></td><td>Value</td></tr>
  <tr class="highlight-row"><td><strong>Highlighted</strong></td><td>Value</td></tr>
</table>
```

### Blockquote
```html
<blockquote style="margin:1rem auto;max-width:650px;padding:1rem 1.5rem;
  border-left:4px solid var(--accent-blue);background:var(--bg-accent-light);
  border-radius:0 10px 10px 0;font-size:1.1rem;font-style:italic;
  color:var(--text-primary);line-height:1.6;">
  &ldquo;Quote text.&rdquo;
</blockquote>
```

### Character Icons
```html
<div class="character gen float"><span>G</span><span class="badge">🎨</span></div>
<div class="character disc float"><span>D</span><span class="badge">🔍</span></div>
```

### Pill Tags
```html
<span class="pill green">Label</span>
<span class="pill red">Label</span>
<span class="pill blue">Label</span>
<span class="pill purple">Label</span>
```

### Revealable (click to show answer)
```html
<div class="revealable card">
  <h4>Question?</h4>
  <p class="hint">Click to reveal</p>
  <div class="answer"><p class="text-blue mt-1">Answer.</p></div>
</div>
```

---

## Incremental Builds (.step)

Add `class="step"` to elements that should appear one-by-one on → press.

**Use steps for:**
- Multiple cards in a grid (each card = step)
- Table rows that tell a story
- Summary takeaways (numbered cards)
- Knowledge check questions
- Second column in two-col layout

**Do NOT use steps for:**
- Simple slides with one idea (just let the slide show everything)
- Approach overview slides (VAE, GAN, etc.) — one press = next slide
- Cover, bridge, section divider slides

---

## Presenter Notes

Every slide MUST have these three data attributes:
```html
data-say="What the trainer should say"
data-ask="Question to ask students"
data-time="2 min"
```

---

## Slide Sequence Pattern

Every lesson should follow this flow:
1. **Cover** — lesson number, title, subtitle
2. **Content slides** — one idea per slide
3. **Checkpoint** — mid-lesson question (after ~40% of slides)
4. **More content**
5. **Prediction** (optional) — ask before revealing a key concept
6. **Summary** — 3-5 numbered takeaways
7. **Knowledge Check** — revealable Q&A
8. **Bridge** — hook for next lesson

---

## SVG Colors (for inline diagrams)

| Element | Fill | Stroke | Text Fill |
|---------|------|--------|-----------|
| Noise box | #eef2ff | #3b6df0 | #3b6df0 |
| Generator | #ecfdf5 | #10b981 | #10b981 |
| Fake image | #f5f3ff | #8b5cf6 | #8b5cf6 |
| Real image | #ecfdf5 | #10b981 | #10b981 |
| Discriminator | #fef2f2 | #ef4444 | #ef4444 |
| Verdict | #eef2ff | #3b6df0 | #3b6df0 |
| Feedback loop | — | #8b5cf6 | #8b5cf6 |
| Axis lines | — | #ccc | — |
| Muted labels | — | — | #8b90a5 |
| Grid cells (light) | #f0f2f6 | — | #4a5068 |
