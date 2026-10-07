# GAN Mastery — Resume Context

Updated: 2026-10-06

## What this is

A complete GAN training course for LTIM MTech AI-DS (course CS60507, 5 units, 45 hours).
Built as a self-learning resource first, then to teach a batch. Materials are organised **by unit**
(not by day), and every unit groups its topics the same way: advanced decks, simple decks, labs, docs.

Start at **`training/index.html`** (hub). It holds the learning path and one section per unit (`#unit-1` … `#unit-5`) with the topic × material table.

## Current state

| Unit | Topics | Simple decks | Advanced decks | Labs |
|---|---|---|---|---|
| 1 · GenAI, GANs, PyTorch, DCGAN | GenAI & the GAN idea · neural networks · build GANs (7 → DCGAN) · activations & losses | S1, S2, NN-L00–L14, L02–L06 | 4 + 2 deep dives + NN course app | lab-p1–p3, lab-00–04 |
| 2 · WGAN, conditional, controllable | better loss (L07–L09) · control (L10–L11) | L07–L11 | 2 | lab-08–11 |
| 3 · Evaluate & scale | IS & FID · bias & fairness · StyleGAN | L12–L15 | planned | lab-13, lab-15 |
| 4 · Translation, augmentation, privacy | image-to-image & Pix2Pix · augmentation & privacy | L16–L18 | planned | lab-17 |
| 5 · CycleGAN & capstone | CycleGAN · satellite → map | L19–L20 | planned | lab-19, lab-20 |

Plus `training/slide-decks/v2/deep-dive/` — *How neural networks learn* (gradient descent, optimizers, activations, losses, training toolkit), usable alongside any unit.

## Folder structure

```
GAN-deep/
  GANs.pdf               ← client syllabus (5 units)
  PLAN.md                ← course roadmap (units → lessons → labs)
  RESUME-CONTEXT.md      ← this file
  training/
    index.html           ← hub (generated)
    TRAINING-PLAN.md     ← unit-by-unit plan with optional pacing
    unit-N/
      docs/              ← lesson notes (.md); unit 1 also has unit notes + session notes
      labs/              ← Jupyter notebooks (+ README)
    slide-decks/
      v1/                ← simple decks: one short HTML deck per lesson, unit-1 … unit-5 (own deck.css / deck.js)
      v1/index.html      ← all v1 decks by unit (generated)
      v2/                ← everything else: unit-1, unit-2 topic decks, deep-dive/, activation/loss deep dives,
                           nn-course-app/ (Next.js app: npm install && npm run dev)
      v2/index.html      ← all v2 decks by unit (generated)
    deck-builder/        ← SOURCE of every v2 deck (Vite + React); publishes into slide-decks/v2/
      src/unit1 src/unit2 src/deep   slide content, one file per part
      src/decks/<id>.ts              one file per published deck (id = build mode, output path)
      scripts/publish.mjs            build + copy each deck into slide-decks/v2/
      scripts/make-index.py          regenerates training/index.html and unit-*/index.html
      authoring/                     guides for the simple HTML decks
```

## How to change things

- **Advanced deck content:** edit `training/deck-builder/src/...`, then in `training/deck-builder`:
  `npm run check` (typecheck + every slide rendered + contract) → `npm run build` (publishes all) or
  `npm run publish -- <deck-id>`. Preview: `npm run dev -- --mode <deck-id>`.
- **Index pages:** edit `training/deck-builder/scripts/make-index.py`, run `python3 training/deck-builder/scripts/make-index.py`. Never hand-edit the generated `index.html` files.
- **Simple decks:** plain HTML in `training/slide-decks/v1/unit-N/`; style guide in `training/deck-builder/authoring/`.
- **Labs:** CPU-friendly notebooks; MNIST downloads into `labs/data/` (git-ignored). Unit 2 lab-11 loads the generator saved by lab-10.

## Numbering (historical, kept stable)

- Lessons: `NN-L00–L14` (neural-network foundations), `L02–L20` (GAN lessons; L00/L01 became the S1/S2 decks).
- Labs: `lab-p1–p3` and `lab-00` (neural networks), `lab-01–04` (Unit 1 GANs), then lab numbers follow the lesson they belong to: `lab-08–11`, `lab-13`, `lab-15`, `lab-17`, `lab-19`, `lab-20`. Gaps (no lab-05–07, 12, 14, 16, 18) are lessons without a notebook.

## Conventions

- Story-driven, one idea per slide, takeaway titles, short lines (no paragraphs), no day/time framing.
- Every formula: term-by-term + worked slide; every number verified by computing it.
- One lab-demo slide per notebook, placed where it is run.
- Notation: `G`, `D(x)` = probability that x is real (Unit 1), critic `C(x)` = score (Unit 2 on), `z` noise (64 in the MNIST labs, 100 in DCGAN), `y` = class label (Units 2–3) — in Units 4–5 the condition is an input *image* and `y` is the target image.

## GitHub

- Repo: `nagcloudlab/GAN-deep` (private). Work branch: `day-1`; `master` is behind.

## Resume prompt

"The GAN course is organised by unit under training/ (Units 1–5 + deep dive). Review, refine, or build advanced decks for Units 3–5."
