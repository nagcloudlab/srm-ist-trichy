# Day 1 teaching deck

**Day 1 · From an idea to your first GAN**: one deck covering all five Day 1 sessions plus the activation-functions companion. It has live labs, in-place answer reveals, and presenter notes on every slide.

Open **`dist/index.html`** directly; no server is needed. The Day 1 index page (`../index.html`) links to it.

## Run, build, check

```bash
npm install
npm run dev      # live-reload while authoring → http://localhost:5173
npm run check    # typecheck + render every slide (hidden and revealed) + deck contract
npm run build    # writes the single self-contained dist/index.html
```

Run `npm run check` and `npm run build` before you commit. `dist/index.html` is committed so the deck works offline from the repo.

## Presenting

| Key | Action |
|---|---|
| → Space PgDn / ← PgUp | Next / previous slide (swipe works on touch screens) |
| R | Reveal the answer on slides marked **PRESS R** |
| N | Presenter notes: what to say, what to ask, and the next slide |
| T | Teaching mode: hides all chrome |
| M | Day map: jump to any part or section |
| F | Fullscreen |
| 1 – 8 | Jump to a part (Open, S1, S2, S3, S4, S5, Activations, Wrap) |
| H | Help |

Direct links: `#s2/slide-5` (part and slide, like phase-0's `#lesson-02/slide-5`), `#/42` (global slide number) or `#s4-live-trace` (slide id). The last position is saved in your browser.

## Architecture

The look is a direct port of the phase-0 course deck (`backup/phase-0/phase-0-slide-deck`): `Shell.tsx` reproduces its `PresentationShell` markup, and part 1 of `styles.css` is its shell CSS, rule for rule. Each Day 1 part acts as a phase-0 "lesson", with its own section rail and counter. Part 2 of `styles.css` renders the kit in the same idiom: hairline white or tinted cards, tiny mono labels, serif numbers and dark equation boxes. The deck runs on plain Vite + React so it ships as one offline HTML file.

```
src/
  types.ts              Slide / Part / Note contract
  Shell.tsx             navigation, keys, touch, notes, teaching mode, day map, hash links, saved position
  deck.ts               the ordered list of parts, plus validateDeck()
  styles.css            the shared visual language (tokens, kit components, labs, overlays, narrow screens)
  components/kit.tsx    slide vocabulary: Cards, Steps, Flow, Equation, Table, Code, Quiz, Predict, Recap, Cover, Divider, Bridge…
  components/art.tsx    PixelDigit, Player (G / D serif-letter discs), Plot (responsive SVG chart)
  labs/lab-kit.tsx      Lab frame, Slider, Metric, Segmented, LabButton
  labs/tiny-gan.ts      a real 1→16→1 GAN with hand-written backprop + Adam (the exact Session 4 setup)
  labs/GanSevenLab.tsx  trains that GAN live in the browser
  sessions/*.tsx        content: day (open + wrap), s1, s2, s3, s4, s5, act (+ optional sN.css, prefixed sN-)
scripts/smoke.tsx       server-renders every slide and enforces the contract
```

## Authoring contract

Every slide in `sessions/*.tsx` must have:

- `id`: a unique kebab-case id, prefixed with its part (`s2-bce-lab`). This is the direct-link target.
- `section`: a meaningful group. Sections build the day map.
- `kicker` and a takeaway-style `title`. Write the conclusion, not the topic: "Squaring makes every mistake count", not "Squaring".
- `notes: { time, say, ask }`.
- `reveal: true` only when the content visibly changes in place on R. Show answers next to their questions, never in a separate answer key.
- `lab: true` for live, interactive slides.

The `standard` layout prints the kicker, title and `lede` for you, so `render` returns only the body. The `cover`, `divider` and `bridge` layouts own the whole canvas.

### Teaching rhythm

Each session follows the same arc:

1. Orient
2. Predict
3. Build the intuition visually
4. Introduce notation
5. Work one concrete example
6. Have the learner act
7. Reveal in place
8. Recap
9. End on the unanswered question that opens the next session

Don't use the same composition on more than three slides in a row.

### Visual rules

- Semantic colors stay fixed all day:
  - Input / noise / data: **blue**
  - Generator: **mint**
  - Discriminator: **coral**
  - Weights: **violet**
  - Emphasis: **yellow**
- One conclusion per slide.
- Prefer diagrams, traces and worked numbers to paragraphs.
- Projected code stays at 14 lines or fewer, with highlighted lines and margin notes. Full runnable code lives in `../labs/`.
- Use a live lab only when moving a control makes the idea easier to see. Give it one dominant visual.
- Check every slide at 1600×900, 1280×720 and phone width.

### Accuracy

Verify every number on a slide by computing it. Where this deck deliberately differs from `../full-day.md`, the difference is a correction:

- StyleGAN3 is dated 2021.
- The generator loss is the non-saturating form.
- The `.detach()` rationale is stated precisely.
- The backprop example updates both weights.
- The "learn 7" run shows real dynamics, including the overshoot.

## Second deck: deep dive

`dist-deep/index.html` is **How Neural Networks Learn**, a deep-dive deck that reuses the same shell, kit and styles. It has 110 slides and 12 live labs:

- gradient descent
- optimizers
- activations
- loss functions
- the training toolkit (initialization, normalization, regularization)

```bash
npm run dev:deep     # live-reload preview of the deep dive
npm run build:deep   # writes dist-deep/index.html
```

Its content lives in `src/deep/` (one file per part) and `src/labs/Deep*.tsx`. `npm run check` validates both decks and rejects slide ids that are duplicated across them.
