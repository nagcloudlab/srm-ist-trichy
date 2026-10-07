# Lesson 20: Satellite to Map + Course Wrap-Up

## Where we are

| L01 | → → → | **L20** |
|---|---|---|
| "What is a GAN?" | 19 lessons later | **Real application + the full journey** |

This is the final lesson. We'll apply everything we've learned to a real-world task: translating satellite images to maps (and back). Then we'll step back and see the full arc of what you've learned.

---

## 1. The Satellite ↔ Map Task

### What we're doing

```
Satellite photo  →  Map rendering
(aerial image)      (roads, buildings, parks colored)

This is PAIRED translation:
  Each satellite image has an EXACT matching map.
  → Perfect for Pix2Pix (L17)

But we can also try:
  Map → Satellite (reverse direction)
  And even unpaired with CycleGAN (L19)
```

### The dataset

The classic **Maps dataset** from the Pix2Pix paper:
- 1,096 training pairs + 1,098 validation pairs (`train/` and `val/` folders, ~240 MB)
- Each pair: satellite image + matching map (side by side in one image)
- 600×600 pixels (two 300×300 images concatenated)
- Source: Google Maps aerial + map view of New York City

```
One image file looks like:
┌──────────────┬──────────────┐
│              │              │
│  Satellite   │    Map       │
│  (left half) │ (right half) │
│              │              │
└──────────────┴──────────────┘
```

### Why this task is great for learning

```
1. It's real — not a toy dataset
2. It's paired — we can use Pix2Pix with L1 ground truth
3. It's visual — you can immediately see if the output is good
4. It demonstrates both directions:
   - Satellite → Map: "Where are the roads and buildings?"
   - Map → Satellite: "What does this area actually look like?"
5. It was THE demo task in the Pix2Pix paper
```

---

## 2. Applying What We Know

### Which architecture?

```
This is PAIRED data → Pix2Pix

Generator:     U-Net (skip connections preserve spatial alignment)
Discriminator: PatchGAN (local texture quality)
Loss:          LSGAN or BCE + L1 (λ=100)
```

### Why U-Net is perfect here

```
Satellite → Map:
  Roads in the satellite photo are in EXACT positions.
  Buildings in the satellite are at EXACT positions.
  The map must place roads and buildings at THOSE positions.

  Skip connections carry: "there's a road HERE, a building THERE"
  Bottleneck carries: "this area is residential, that's a park"
  Together: correct content in correct positions.

Map → Satellite:
  Green areas → parks/trees
  Gray lines → roads
  Orange blocks → buildings
  The satellite image must render THOSE features at THOSE locations.
```

### The training recipe (same as L17)

```python
# Generator loss
loss_G = GAN_loss + 100 * L1_loss

# Discriminator loss (conditional — sees input + output)
real_pair = concat(input, target)     # satellite + real map
fake_pair = concat(input, G(input))   # satellite + generated map
loss_D = BCE(D(real_pair), 1) + BCE(D(fake_pair), 0)
```

---

## 3. Challenges Specific to Satellite/Map

### What makes this harder than MNIST

```
1. COLOR SEMANTICS:
   Maps use specific colors for specific things:
     Green = park/vegetation
     Gray = road
     Orange = building
     Blue = water
   The generator must learn these color conventions EXACTLY.

2. FINE DETAILS:
   Roads are thin lines that must connect properly.
   A broken road = a bad map.
   PatchGAN helps here — it checks local connectivity.

3. SCALE:
   300×300 pixels showing city blocks.
   Both large structures (parks) and tiny ones (individual buildings).
   U-Net's multi-scale skip connections handle this.

4. BIDIRECTIONAL:
   Satellite → Map: extract semantic information
   Map → Satellite: synthesize realistic textures
   The reverse direction is harder (more visual detail to generate).
```

### Expected results

```
Satellite → Map:
  Usually good. The semantic content (roads, buildings) is
  clearly visible in the satellite image.
  Main challenge: getting exact colors right.

Map → Satellite:
  Harder. Must generate realistic textures for:
    - Tree canopy from green blobs
    - Road surfaces from gray lines
    - Building roofs from orange blocks
  Results are often blurrier than Sat→Map.
```

---

## 4. CycleGAN Alternative

### What if the data weren't paired?

```
Imagine:
  Collection A: 1000 satellite photos (various cities)
  Collection B: 1000 map images (DIFFERENT cities)
  No pairing between them!

CycleGAN can still learn the translation:
  - G_AB learns: "satellite images have these textures,
    maps have these colors — translate between them"
  - Cycle consistency ensures the content is preserved

But quality will be LOWER than Pix2Pix:
  - No L1 loss to ensure pixel-level accuracy
  - Road positions might shift slightly
  - Colors might not follow exact map conventions
```

```
Comparison:
  Pix2Pix (paired):   Roads are in the exact right place
  CycleGAN (unpaired): Roads are approximately right,
                        but might wiggle or break
```

---

## 5. Beyond Satellite/Map: Real-World Applications

Everything from this course applies to real problems:

### Medical imaging

```
Architecture: Pix2Pix or CycleGAN
Tasks:
  - CT scan → MRI (cross-modality, CycleGAN — usually unpaired)
  - Low-dose CT → full-dose CT (denoising, Pix2Pix — paired)
  - Stain transfer in pathology (CycleGAN)
  - Synthetic medical images for training (GAN augmentation, L18)
Privacy: DP-SGD for patient protection (L18)
```

### Autonomous driving

```
Architecture: Pix2Pix, CycleGAN
Tasks:
  - Segmentation → street scene (Pix2Pix)
  - Sim → Real transfer (CycleGAN — make simulation look real)
  - Night → Day (CycleGAN — augment night driving data)
  - Weather augmentation (add rain, fog, snow)
Evaluation: FID to measure realism (L13)
```

### Creative tools

```
Architecture: StyleGAN, Pix2Pix, CycleGAN
Tasks:
  - Face editing (StyleGAN latent manipulation, L15)
  - Sketch → Photo (Pix2Pix)
  - Photo → Art style (CycleGAN)
  - Super-resolution (upscale low-res images)
Bias: check for demographic bias (L14)
```

### Data science & ML

```
Architecture: cGAN, CTGAN
Tasks:
  - Augment small datasets (L18)
  - Balance class distributions (L18)
  - Generate synthetic tabular data
  - Privacy-preserving data sharing (DP-GAN, L18)
```

---

## 6. The Full GAN Journey — What You've Learned

### Unit 1: Generative AI, GANs, neural networks + PyTorch, DCGAN

```
Generative AI landscape — where GANs fit
The adversarial idea — forger vs detective
Neural networks — neuron, loss, gradients, backprop, Sigmoid + BCE, PyTorch
L02: First GAN — generate the number 7 from noise
L03: MNIST GAN — generate all digits
L04: Convolutions — the building block of vision
L05: DCGAN — convolutional GANs (sharp images!)
L06: Training instability — mode collapse, vanishing gradients, tricks

YOU CAN NOW: Build, train, and debug a GAN that generates images.
```

### Unit 2: Better GANs (L07-L11)

```
L07: Why BCE fails — JS divergence, saturating gradients
L08: WGAN — Earth Mover's distance, Critic, weight clipping
L09: WGAN-GP — gradient penalty replaces clipping
L10: Conditional GAN — "generate a 7" with labels
L11: Controllable generation — interpolation, latent arithmetic

YOU CAN NOW: Build stable, controllable GANs with modern losses.
```

### Unit 3: Evaluate & Scale (L12-L15)

```
L12: Evaluation theory — IS, FID, precision, recall
L13: FID implementation — Inception features, Frechet distance
L14: Bias & fairness — data bias, amplification, per-group FID
L15: StyleGAN — mapping network, AdaIN, style mixing, truncation

YOU CAN NOW: Measure GAN quality, detect bias, understand SOTA.
```

### Unit 4: Image translation, augmentation and privacy (L16-L18)

```
L16: Image-to-image framework — paired vs unpaired, PatchGAN
L17: Pix2Pix — U-Net, skip connections, L1+GAN loss
L18: Augmentation & privacy — synthetic data, DP-SGD, PATE-GAN

YOU CAN NOW: Translate paired images and use GANs as a data tool.
```

### Unit 5: CycleGAN and capstone (L19-L20)

```
L19: CycleGAN — cycle consistency, unpaired translation
L20: Satellite→Map — real application, course wrap-up

YOU CAN NOW: Translate images between domains, paired or unpaired.
```

---

## 7. The Concept Map

```
                         GENERATIVE ADVERSARIAL NETWORKS
                                    │
                    ┌───────────────┼───────────────┐
                    │               │               │
              GENERATION      TRANSLATION       EVALUATION
              (noise→image)   (image→image)     (how good?)
                    │               │               │
              ┌─────┴─────┐   ┌────┴────┐     ┌────┴────┐
              │           │   │         │     │         │
           Simple      Modern │         │    FID    Bias/Fair
           GAN         GAN    │         │   (L13)   (L14)
           (L02)       │      │         │
              │     ┌──┴──┐   │         │
              │     │     │   │         │
           DCGAN  WGAN  cGAN Pix2Pix CycleGAN
           (L05) (L08) (L10) (L17)   (L19)
              │     │     │     │         │
              │   WGAN-GP │   U-Net    Cycle
              │   (L09)   │  +PatchGAN consistency
              │           │     │
           StyleGAN  Controllable
           (L15)     (L11)
```

---

## 8. Key Ideas That Connect Everything

### The adversarial principle

```
Every GAN uses the same core idea:
  G tries to fool D.
  D tries to catch G.
  Competition drives improvement.

This never changed from L01 to L20.
What changed: HOW we measure "fooling" and WHAT we generate.
```

### The loss function evolution

```
L02: BCE loss         → works but unstable
L07: BCE problems     → vanishing gradients, mode collapse
L08: Wasserstein loss → stable, meaningful gradients
L09: + Gradient penalty → no weight clipping needed
L17: + L1 loss        → pixel-level accuracy for paired data
L19: + Cycle loss     → content preservation for unpaired data
L19: LSGAN            → smoother alternative to BCE

Each new loss solved a specific problem.
```

### The architecture evolution

```
L02: Linear layers        → blurry, no spatial structure
L05: DCGAN (ConvTranspose) → spatial structure, sharper
L09: InstanceNorm          → per-image normalization for style
L15: StyleGAN (AdaIN)      → disentangled, controllable
L17: U-Net (skip conn.)    → preserves fine spatial details
L19: ResNet generator      → learns output = input + changes

Each architecture innovation solved a specific limitation.
```

### The evaluation evolution

```
L06: "Looks good to me"   → subjective, not reproducible
L12: Inception Score       → measures quality + diversity
L13: FID                   → gold standard, feature-level comparison
L14: Per-group FID         → catches hidden bias
```

---

## 9. What Comes Next (Beyond This Course)

### Diffusion models

```
GANs were the king of image generation until ~2022.
Now diffusion models (DALL-E, Stable Diffusion, Midjourney) dominate.

But GAN concepts carry over:
  - Adversarial training (used in some diffusion models)
  - FID evaluation (same metric)
  - Conditional generation (same idea, different mechanism)
  - Image translation (diffusion models do this too)

Understanding GANs makes learning diffusion models much easier.
```

### GAN-diffusion hybrids

```
Some recent models combine both:
  - Adversarial distillation: a GAN discriminator lets diffusion sample in 1–4 steps (SDXL Turbo)
  - Use diffusion as a data augmentation for GAN training
  - StyleGAN-like control in diffusion models
```

### 3D generation

```
GANs extended to 3D:
  - GRAF, π-GAN: GANs with NeRF-style 3D renderers
  - EG3D: 3D-aware face generation
  - Same adversarial principle, but in 3D space
```

---

## 10. Summary of the Entire Course

| Unit | Lessons | Key achievement |
|---|---|---|
| **Unit 1** | GenAI, NN + PyTorch, L02-L06 | Build, train, debug a GAN that generates images |
| **Unit 2** | L07-L11 | Stable training (WGAN-GP) + controlled output (cGAN) |
| **Unit 3** | L12-L15 | Measure quality (FID), understand bias, know SOTA (StyleGAN) |
| **Unit 4** | L16-L18 | Paired translation (Pix2Pix) + GANs for augmentation & privacy |
| **Unit 5** | L19-L20 | Unpaired translation (CycleGAN) + real-world capstone |

### The 10 most important ideas

```
 1. Adversarial training: G vs D competition
 2. Convolutional architecture: spatial structure
 3. Wasserstein distance: stable, meaningful loss
 4. Gradient penalty: enforce Lipschitz constraint
 5. Conditional generation: control what you generate
 6. FID: measure GAN quality scientifically
 7. StyleGAN: disentangled, controllable generation
 8. U-Net: skip connections preserve spatial detail
 9. PatchGAN: local texture discrimination
10. Cycle consistency: preserve content without paired data
```

---

## Final Knowledge Check

1. You have 200 paired images of sketches and photos. Which architecture do you use? What loss?
2. You have 5000 horse photos and 5000 zebra photos (unpaired). Which architecture? What's the key loss that prevents content destruction?
3. Your GAN generates great faces but only light-skinned ones. What's the problem and how do you detect it?
4. Your DCGAN has mode collapse. Name two approaches to fix it.
5. Why does Pix2Pix use U-Net but CycleGAN uses ResNet?
6. What's the difference between Z-space and W-space in StyleGAN? Why does it matter?
7. You need to share medical training data but patients can't be identified. What technique do you use?
8. Your GAN's L1 loss is low but the images look blurry. What loss should you add?
9. What does FID measure? Lower is better or higher is better?
10. Explain cycle consistency in one sentence.

---

## Congratulations!

You've completed the full GAN journey — from "what is a generator?" to building Pix2Pix and CycleGAN for real-world image translation. You understand the theory, the code, and the practical considerations (evaluation, bias, privacy).

You're ready to teach this material, apply GANs to real problems, and understand the research papers that build on these foundations.

The adversarial game continues. Now you're the one who knows how to play it.
