# GAN Mastery: advanced decks

This is the source project for every **advanced deck** in the course. Each deck is a standalone topic deck, published as one offline HTML file into `training/slide-decks/v2/` (the simple v1 decks live in `training/slide-decks/v1/`):

| Deck id | Published to | Content |
|---|---|---|
| `u1-genai-gans` | `slide-decks/v2/unit-1/1-generative-ai-and-gans.html` | Generative AI landscape · the GAN idea |
| `u1-neural-networks` | `slide-decks/v2/unit-1/2-neural-networks.html` | Neuron → loss → gradients → backprop → Sigmoid + BCE → PyTorch |
| `u1-build-gans` | `slide-decks/v2/unit-1/3-build-gans.html` | First GAN (the number 7) · MNIST · convolutions · DCGAN · when GANs break |
| `u1-activations` | `slide-decks/v2/unit-1/4-activations-in-gans.html` | Activation functions in GANs |
| `u2-better-loss` | `slide-decks/v2/unit-2/1-better-loss-wgan.html` | Why BCE fails · WGAN · WGAN-GP |
| `u2-control` | `slide-decks/v2/unit-2/2-control.html` | Conditional GAN · controllable generation |
| `deep-dive` | `slide-decks/v2/deep-dive/index.html` | How neural networks learn (gradient descent, optimizers, activations, losses, training toolkit) |

Paths are relative to `training/`. The hub `training/index.html` (one section per unit) links everything: advanced decks, simple decks, labs and docs, grouped by topic.

## Commands

```bash
npm install
npm run dev -- --mode u2-control   # live-reload one deck (default: u1-genai-gans)
npm run check                      # typecheck + render every slide of every deck (hidden and revealed) + contract
npm run build                      # check, then build and publish all decks into training/slide-decks/v2/
npm run publish -- u1-build-gans   # rebuild and publish specific decks only
```

Run `npm run build` before committing; the published HTML files are committed so the course works offline.

## Presenting

| Key | Action |
|---|---|
| → Space PgDn / ← PgUp | Next / previous slide (swipe works on touch screens) |
| R | Reveal the answer on slides marked **PRESS R** |
| N | Presenter notes: what to say, what to ask, the next slide |
| T | Teaching mode (hides all chrome) |
| M | Map of the deck's parts and sections |
| F | Fullscreen |
| 1 – 9 | Jump to a part |

Direct links: `#l08/slide-6` (part and slide), `#/42` (slide number) or `#l08-emd-lab` (slide id). Each deck remembers your place in this browser.

## Architecture

The look is a direct port of the neural-networks course app (`training/slide-decks/v2/nn-course-app`, originally the phase-0 deck): `Shell.tsx` reproduces its presentation shell, and part 1 of `styles.css` is its shell CSS.

```
src/
  types.ts              Slide / Part / DeckMeta / DeckDef
  Shell.tsx             navigation, keys, touch, notes, teaching mode, map, hash links, saved position
  main.tsx              loads the deck named by the build mode (only that deck is bundled)
  decks.ts              list of all decks (used by the check)
  decks/<id>.ts         one file per deck: id, output path, parts, labels
  styles.css            shared visual language
  components/kit.tsx    Cards, Steps, Flow, Equation (auto-fit), Table, Code, Quiz, Predict + Answer,
                        FormulaTerms / FormulaSteps (formula explanations), LabDemo, Cover, Divider, Bridge …
  components/art.tsx    PixelDigit, Player (G / D discs), Plot (responsive SVG chart)
  labs/                 live labs (lab-kit.tsx, the in-browser GAN, per-topic labs)
  unit1/  unit2/  deep/ slide content, one file per part (+ optional part-scoped CSS)
scripts/smoke.tsx       renders every slide of every deck and enforces the contract
scripts/publish.mjs     builds each deck and copies it into training/slide-decks/v2/
```

## Authoring contract

Every slide has:

- a unique kebab-case `id` (unique across all decks)
- a `section` and a `kicker`
- a takeaway-style `title`
- `notes: { time, say, ask }`. The time is stored but never shown.

Use `reveal: true` only when the content changes in place. Use `lab: true` for live labs.

House rules:

- No paragraph text; use short lines.
- No day, schedule or timing references; the course is taught by unit at any pace.
- Every formula gets a term-by-term (`FormulaTerms`) and/or worked (`FormulaSteps`) slide, and stays on one line.
- One `LabDemo` slide per notebook, where it is run.
- Verify every number by computing it.
- Check every new slide at 1600×900 with answers revealed.
