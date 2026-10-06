# GAN Mastery — 4-Day Training Plan

> From zero to image translation. Build every major GAN variant in PyTorch.

---

## The Story Arc

```
Day 1:  neuron → network → first GAN          (foundation + first build)
Day 2:  fix the loss → control the output      (stability + precision)
Day 3:  measure quality → photorealistic faces  (evaluation + state-of-the-art)
Day 4:  image → different image                 (translation + real applications)
```

---

## Day 1 — From Generative AI to Your First GAN

**Theme:** Build the foundation, then build a GAN.

| Session | Content | Slides | Labs |
|---------|---------|--------|------|
| **S1** The World of Generative AI | VAE, GAN, Transformer, Diffusion landscape. Where GANs fit. Applications. Family tree. | 20 | — |
| **S2** What Is a GAN? | Forger vs Detective. Training loop. BCE loss. .detach(). The Game Is On! Balance problem. | 27 | — |
| **S3** Neural Networks (15 lessons) | Neuron → loss → gradient → learning rate → training loop → chain rule → weight+bias → multiple inputs → ReLU → hidden layers → backprop → Sigmoid → BCE → classifier = Discriminator → PyTorch | 365 | 5 interactive + 4 Jupyter |
| **S4** Building GANs (5 lessons) | Build first GAN (number 7) → GAN for MNIST images → convolutions → DCGAN → when GANs break | 93 | 4 Jupyter |

**After Day 1:** You can build, train, and debug a GAN that generates images.

| Metric | Count |
|--------|-------|
| Slides | 498 |
| Decks | 24 |
| Interactive labs | 5 (step-size, descent, gradient, ReLU, sigmoid-bce) |
| Jupyter labs | 12 |

---

## Day 2 — Better Loss, Stable Training, Control

**Theme:** Fix what's broken, then control what you generate.

| Lesson | Content | Slides | Lab |
|--------|---------|--------|-----|
| **L07** Why BCE Loss Fails | Saturating gradients. JS divergence plateau. Why D "too good" kills G. All the tricks from Day 1 were band-aids — the real problem is the loss function itself. | 18 | — |
| **L08** WGAN: Wasserstein Distance | Earth Mover's distance. Critic replaces Discriminator (no Sigmoid). Weight clipping. 5:1 training ratio. Loss that actually correlates with image quality. | 21 | WGAN |
| **L09** WGAN-GP: Gradient Penalty | Why weight clipping is bad (capacity loss). Interpolation trick. Gradient penalty (lambda=10). InstanceNorm replaces BatchNorm. Adam with beta1=0. | 21 | WGAN-GP |
| **L10** Conditional GAN | "Generate a 7" — class-conditional generation. nn.Embedding. Label maps for D. Why D needs labels too. Noise controls HOW, label controls WHAT. | 19 | cGAN |
| **L11** Controllable Generation | Latent interpolation (morph between images). Latent arithmetic (thick − thin = direction). Single-dimension exploration. Noise truncation (quality vs variety). | 17 | Controllable |

**After Day 2:** You can build stable, controllable GANs with modern loss functions.

| Metric | Count |
|--------|-------|
| Slides | 96 |
| Decks | 5 |
| Jupyter labs | 4 |

---

## Day 3 — Evaluate & Scale: How Good Is Your GAN?

**Theme:** Measure quality scientifically, then understand state-of-the-art.

| Lesson | Content | Slides | Lab |
|--------|---------|--------|-----|
| **L12** Evaluating GANs | Why "looks good" isn't enough. Bad metrics (eye test, D loss, pixel comparison). Inception Score. FID score overview. Precision vs Recall. | ~18 | — |
| **L13** FID Score Deep Dive | Inception v3 pool3 features (2048-dim). Mean + covariance statistics. Matrix square root (sqrtm). Full FID pipeline in code. Common pitfalls. pytorch-fid library. | ~20 | FID |
| **L14** GAN Bias and Fairness | Three levels: data bias, model bias, evaluation bias. Amplification effect. Mode collapse as fairness problem. Per-group FID. Mitigation strategies. Deployment checklist. | ~18 | — |
| **L15** StyleGAN | The entanglement problem. Mapping network (z → w). AdaIN (style injection). Layer hierarchy (coarse/fine). Style mixing. Noise injection. Progressive growing. Truncation trick. StyleGAN2/3 improvements. | ~22 | StyleGAN |

**After Day 3:** You can measure GAN quality scientifically and understand state-of-the-art architectures.

| Metric | Count |
|--------|-------|
| Slides | ~78 |
| Decks | 4 |
| Jupyter labs | 2 |

**Source:** Phase 3 slide decks (backup/phase-3/slide-deck/L12-L15.html) + lesson markdown

---

## Day 4 — Image Translation: Transform Images Between Worlds

**Theme:** Turn one image into another — paired and unpaired.

| Lesson | Content | Slides | Lab |
|--------|---------|--------|-----|
| **L16** Image-to-Image Framework | Paired vs unpaired translation. Encoder-decoder architecture. Why GANs are needed (not just L1 loss). PatchGAN discriminator. Loss weighting. Applications gallery. | ~18 | — |
| **L17** Pix2Pix | U-Net architecture (skip connections solve bottleneck). PatchGAN discriminator. Combined L1 + GAN loss. Dropout as regularization. Data augmentation. Full Pix2Pix recipe. | ~20 | Pix2Pix |
| **L18** Data Augmentation & Privacy | GANs for small datasets. Conditional augmentation. Differential privacy (DP-SGD). PATE-GAN. Tabular and time series. When to use GAN augmentation. | ~18 | — |
| **L19** CycleGAN | The unpaired problem. Cycle consistency loss. Identity loss. ResNet generator. InstanceNorm. LSGAN loss. Replay buffer. Learning rate schedule. Comparison with Pix2Pix. | ~20 | CycleGAN |
| **L20** Satellite to Map + Wrap-up | Capstone: Pix2Pix on real satellite imagery. CycleGAN alternative. Real-world applications (medical, autonomous, creative). Full journey recap. Future: diffusion models. | ~18 | Satellite |

**After Day 4:** You can transform images between domains. The marathon is complete.

| Metric | Count |
|--------|-------|
| Slides | ~94 |
| Decks | 5 |
| Jupyter labs | 3 |

**Source:** Phase 4 slide decks (backup/phase-4/slide-deck/L16-L20.html) + lesson markdown

---

## Full Training Summary

| | Day 1 | Day 2 | Day 3 | Day 4 | Total |
|---|---|---|---|---|---|
| **Theme** | Foundation + First GAN | Better Loss + Control | Evaluate + Scale | Image Translation | |
| **Slides** | 498 | 96 | ~78 | ~94 | **~766** |
| **Lessons** | 20 NN + 5 GAN | 5 | 4 | 5 | **39** |
| **Jupyter Labs** | 12 | 4 | 2 | 3 | **21** |
| **Interactive Labs** | 5 | — | — | — | **5** |
| **Status** | ✅ Done | ✅ Done | 📋 Planned | 📋 Planned | |

---

## Recommended Schedule

### Full Day (8 hours per day)

| Time | Day 1 | Day 2 | Day 3 | Day 4 |
|------|-------|-------|-------|-------|
| 09:00 | S1 + S2 (Gen AI + GAN theory) | L07 (BCE fails) | L12 (Evaluating) | L16 (Image-to-Image) |
| 10:30 | NN lessons L01–L05 | L08 (WGAN) + lab | L13 (FID) + lab | L17 (Pix2Pix) + lab |
| 12:00 | Lunch | Lunch | Lunch | Lunch |
| 13:00 | NN lessons L06–L11 + labs | L09 (WGAN-GP) + lab | L14 (Bias) | L18 (Augmentation) |
| 14:30 | NN lessons L12–L14 + labs | L10 (cGAN) + lab | L15 (StyleGAN) + lab | L19 (CycleGAN) + lab |
| 16:00 | GAN lessons L02–L06 + labs | L11 (Controllable) + lab | Review + Q&A | L20 (Capstone) + wrap-up |
| 17:30 | Wrap-up | Wrap-up | Wrap-up | Certificates |

### Half Day (4 hours per day)

| Time | Day 1 | Day 2 | Day 3 | Day 4 |
|------|-------|-------|-------|-------|
| 09:00 | S1 + S2 (45 min) | L07 + L08 (WGAN) | L12 + L13 (FID) | L17 (Pix2Pix) |
| 09:45 | Key NN lessons (1 hr) | L09 (WGAN-GP) + lab | L15 (StyleGAN) | L19 (CycleGAN) + lab |
| 10:45 | Lab: Learning Neuron | L10 (cGAN) + lab | Lab: FID | L20 (Capstone) |
| 11:30 | GAN L02 + L05 + labs | L11 (Controllable) | Review | Wrap-up |
| 12:30 | Wrap-up | Wrap-up | Wrap-up | Certificates |

---

## Prerequisites

- Python 3.9+
- PyTorch + torchvision
- Jupyter Notebook
- Basic linear algebra (vectors, matrices)
- Basic calculus (derivatives)

```bash
pip install torch torchvision matplotlib jupyter numpy
```

---

## How to Present

1. Open `training/day-X/index.html` in your browser
2. Click any lesson card to open that deck
3. Use keyboard shortcuts:
   - `→` / `Space` — next slide or reveal next step
   - `←` — previous slide
   - `N` — toggle presenter notes
   - `F` — fullscreen
   - `R` — reveal answer (knowledge checks)
   - `H` — help overlay
4. Click any `.revealable` card to show the answer
5. Interactive labs: drag sliders, press buttons (no setup needed)
6. Jupyter labs: `cd training/day-X/labs && jupyter notebook`

---

## File Structure

```
training/
├── TRAINING-PLAN.md          ← this file
│
├── day-1/                    498 slides, 12 labs
│   ├── index.html
│   ├── S1-generative-ai.html
│   ├── S2-what-is-a-gan.html
│   ├── S3-neural-networks.html (hub)
│   ├── S4-build-gans.html (hub)
│   ├── nn-lessons/           15 NN lessons (NN-L00 to NN-L14)
│   ├── gan-lessons/          5 GAN lessons (L02 to L06, Phase 1)
│   ├── labs/                 12 Jupyter notebooks + README
│   └── img/
│
├── day-2/                    96 slides, 4 labs
│   ├── index.html
│   ├── lessons/              5 lessons (L07 to L11, Phase 2)
│   └── labs/                 4 Jupyter notebooks
│
├── day-3/                    (planned — Phase 3: L12-L15)
│   ├── index.html
│   ├── lessons/
│   └── labs/
│
└── day-4/                    (planned — Phase 4: L16-L20)
    ├── index.html
    ├── lessons/
    └── labs/
```
