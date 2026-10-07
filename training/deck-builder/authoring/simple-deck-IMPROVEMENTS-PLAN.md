# Simple decks (Unit 1 GAN lessons) — improvement plan

> **Historical.** Written for the original Phase 1 decks, now `training/slide-decks/v1/unit-1/` (S1, S2,
> gan-lessons L02–L06). Lesson references like "L01 slide 4" point at those decks. Kept as an idea list.

## What to Add: Characters, Architecture Diagrams, Animations

### 1. SVG Character Icons (reusable across all lessons)

**Generator Character (G)** — used in L01-L06
- Green-themed artist/forger with paintbrush
- Simple, flat SVG illustration
- Appears whenever G is discussed
- States: working (painting), happy (fooled D), sad (caught)

**Discriminator Character (D)** — used in L01-L06
- Red-themed detective with magnifying glass
- Simple, flat SVG illustration
- Appears whenever D is discussed
- States: confident (caught fake), confused (fooled), studying

**Where to use:**
- L01 slide 4 (Two Players): large G and D character cards
- L01 slide 7 (Training Steps): G greyed out in Step A, D greyed out in Step B
- L02 slide 7 (Training Loop): small icons next to each step
- L06 slide 2 (Why Hard): seesaw with G and D characters on each end
- L06 slide 3 (Mode Collapse): G repeatedly painting the same thing

### 2. Architecture Diagrams (proper tensor shape pipelines)

**Linear GAN Pipeline (L02-L03)**
```
SVG showing:
- Rectangles sized proportionally to tensor dimensions
- noise: tiny square (1 or 64 numbers)
- hidden: medium rectangle (256 units)
- output: large rectangle (784 pixels / 28x28 grid)
- Arrows between with layer labels
- Color: green pipeline for G, red for D
```

**DCGAN Pipeline (L05)**
```
SVG showing:
- 3D-looking blocks for spatial feature maps
- z(100) → reshape → 256×7×7 block → ConvT → 128×14×14 block → ConvT → 1×28×28 block
- Each block proportionally sized
- Labels: layer type, kernel size, output shape
- Mirror for D: same blocks in reverse, shrinking
```

**Convolution Operation (L04)**
```
Animated SVG:
- 5x5 input grid with numbers
- 3x3 filter overlay that "slides" (CSS animation, 3 positions)
- Output grid filling in as filter moves
- Color-coded: input=blue, filter=orange, output=green
```

### 3. CSS Animations to Add to deck.css

**Flowing arrow animation** (for data flow diagrams)
```css
@keyframes flowRight {
  0% { stroke-dashoffset: 20; }
  100% { stroke-dashoffset: 0; }
}
.flow-arrow {
  stroke-dasharray: 5,5;
  animation: flowRight 1s linear infinite;
}
```

**Pulse glow** (for active/important elements)
```css
@keyframes pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(59,109,240,0.3); }
  50% { box-shadow: 0 0 0 8px rgba(59,109,240,0); }
}
.pulse { animation: pulse 2s ease-in-out infinite; }
```

**Counter animation** (for big numbers)
```css
@keyframes countUp {
  from { opacity: 0; transform: scale(0.5); }
  to { opacity: 1; transform: scale(1); }
}
.count-up { animation: countUp 0.6s ease-out; }
```

**Slide transitions** (for training progress)
```css
@keyframes morphIn {
  from { filter: blur(8px); opacity: 0.3; }
  to { filter: blur(0); opacity: 1; }
}
.morph-in { animation: morphIn 0.8s ease-out; }
```

**Gradient feedback loop** (for GAN architecture)
```css
@keyframes dashFlow {
  from { stroke-dashoffset: 100; }
  to { stroke-dashoffset: 0; }
}
.feedback-loop {
  stroke-dasharray: 8,4;
  animation: dashFlow 3s linear infinite;
}
```

### 4. Pixel Art Digits (SVG, for L03 and L05)

Create reusable 7x7 pixel grid SVGs showing:
- **Noise** (random gray pixels)
- **Blobs** (vague shapes, epoch 5)
- **Rough digit** (recognizable but blurry, epoch 20)
- **Clear digit** (sharp "7", epoch 50)

Use these in:
- L03 slide 12 (Training Progress): show all 4 stages
- L05 slide 12 (Linear vs DCGAN): blurry vs sharp comparison
- L06 slide 3 (Mode Collapse): grid of identical digits vs diverse

### 5. Specific Slide Improvements

| Lesson | Slide | Current | Improvement |
|--------|-------|---------|-------------|
| L01 | 3 (Four Rounds) | Text cards | Add G character improving + D character reacting |
| L01 | 4 (Two Players) | Text VS layout | Add SVG character icons (paintbrush + magnifying glass) |
| L01 | 6 (Architecture) | SVG diagram ✓ | Add flowing arrow animation on data paths |
| L01 | 7 (Training Steps) | Text cards | Add SVG: G greyed+frozen in Step A, D greyed+frozen in Step B |
| L02 | 10 (Watch It Learn) | Table | Add animated number line with dot moving toward 7 |
| L03 | 6 (G Architecture) | Box diagram | Replace with tensor pipeline (sized rectangles) |
| L03 | 12 (Training Progress) | Text placeholders | Replace with pixel-art digit SVGs |
| L04 | 3 (Convolution) | Static SVG grid | Add CSS animation: filter sliding across 3 positions |
| L05 | 3 (G Pipeline) | Box diagram | Replace with 3D-block tensor pipeline |
| L05 | 8 (G and D Mirror) | Text VS layout | Add full mirror architecture SVG |
| L06 | 3 (Mode Collapse) | Text boxes | Add pixel-art grid: diverse vs all-same |
| L06 | 6 (Vanishing Gradient) | SVG curve ✓ | Add animated gradient arrow that shrinks near x=0 |

### 6. Priority Order (highest impact first)

1. **CSS animations** — add to deck.css (enables everything else)
2. **Pixel-art digits** — reusable across L03, L05, L06
3. **Tensor pipeline diagrams** — L03 G/D, L05 DCGAN
4. **Character icons** — G (paintbrush) and D (magnifying glass)
5. **Flowing arrows** on L01 architecture diagram
6. **Convolution animation** — filter sliding across grid in L04
7. **Mode collapse grid** — identical vs diverse digits in L06
