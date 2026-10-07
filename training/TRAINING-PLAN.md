# GAN Mastery — Training Plan (by unit)

> From zero to image translation. Build every major GAN variant in PyTorch.
> Materials are organised **by unit**. Open `training/index.html`; each unit page groups its topics into
> **advanced decks** (full teaching decks with live labs), **simple decks** (one short deck per lesson),
> **labs** (Jupyter notebooks) and **docs** (lesson notes). Teach in order, at your own pace.

---

## The story arc

```
Unit 1:  noise → image               build the basic GAN, then DCGAN
Unit 2:  noise → SPECIFIC image      stable loss (WGAN-GP) + control (cGAN, latent space)
Unit 3:  noise → MEASURED image      evaluate (IS, FID), check bias, StyleGAN
Unit 4:  image → DIFFERENT image     paired translation (Pix2Pix), augmentation & privacy
Unit 5:  image → image, unpaired     CycleGAN, then the satellite → map capstone
```

Each unit opens from the previous unit's open question and ends with the next one.

---

## Unit 1 — Generative AI, GANs, PyTorch and DCGAN

| Topic | Content | Simple decks | Advanced deck | Labs |
|---|---|---|---|---|
| Generative AI & the GAN idea | Landscape (VAE, GAN, Transformer, Diffusion); forger vs detective; training loop; BCE; `.detach()` | S1, S2, NN-L00 | 1 · Generative AI and the GAN idea | — |
| Neural networks | Neuron → loss → gradient → learning rate → backprop → ReLU → Sigmoid + BCE → classifier → PyTorch | NN-L01–L14 | 2 · Neural networks (+ NN course app) | lab-p1, lab-p2, lab-p3, lab-00 |
| Build GANs | Number-7 GAN → MNIST GAN → convolutions → DCGAN → when GANs break | L02–L06 | 3 · Build GANs: from the number 7 to DCGAN | lab-01–lab-04 |
| Activations & losses | ReLU / LeakyReLU / Tanh / Sigmoid in G and D; logits + BCEWithLogits | — | 4 · Activation functions in GANs (+ activation & loss deep dives) | — |

**After Unit 1:** you can build, train and debug a GAN that generates digits — and you know its tricks are band-aids.

## Unit 2 — Better loss, stable training, control

| Topic | Content | Simple decks | Advanced deck | Labs |
|---|---|---|---|---|
| Better loss | Why BCE fails (JS stuck at log 2); Wasserstein distance & critic; weight clipping; gradient penalty (λ = 10, no BatchNorm in the critic — LayerNorm per the paper) | L07–L09 | 1 · Better loss: from BCE to WGAN-GP | lab-08, lab-09 |
| Control | Conditional GAN (label → what, noise → how); latent interpolation (lerp / slerp), arithmetic, truncation | L10–L11 | 2 · Control: conditional and controllable GANs | lab-10, lab-11 |

**After Unit 2:** you can build stable, controllable GANs with modern loss functions.

## Unit 3 — Evaluate and scale

| Topic | Content | Simple decks | Labs |
|---|---|---|---|
| IS & FID | Why "looks good" isn't enough; Inception Score; FID from Inception features to the Fréchet formula | L12, L13 | lab-13 |
| Bias & fairness | Data, model and evaluation bias; mode collapse as a fairness problem; per-group metrics; mitigation | L14 | — |
| StyleGAN | Mapping network z → w; AdaIN; coarse-to-fine styles; style mixing; noise injection; truncation in w | L15 | lab-15 |

**After Unit 3:** you can measure GAN quality scientifically and explain a state-of-the-art architecture.

## Unit 4 — Image translation, augmentation and privacy

| Topic | Content | Simple decks | Labs |
|---|---|---|---|
| Image-to-image & Pix2Pix | Paired vs unpaired; encoder–decoder; U-Net skips; PatchGAN; L1 + GAN loss | L16, L17 | lab-17 |
| Augmentation & privacy | GANs for small datasets; conditional augmentation; DP-SGD; PATE-GAN | L18 | — |

**After Unit 4:** you can translate between paired image domains and use GANs for data.

## Unit 5 — CycleGAN and the satellite-to-map capstone

| Topic | Content | Simple decks | Labs |
|---|---|---|---|
| CycleGAN | Cycle-consistency and identity losses; ResNet generator; LSGAN loss; replay buffer | L19 | lab-19 |
| Capstone | Pix2Pix on real satellite imagery; CycleGAN alternative; course recap | L20 | lab-20 |

**After Unit 5:** you can transform images between domains, paired or unpaired. The marathon is complete.

---

## Companion: Deep dive — How neural networks learn

Gradient descent, optimizers (momentum → Adam / AdamW), activations, loss functions, initialization,
normalization and regularization — 110 slides, 12 live labs. Use it alongside Unit 1 (neural networks) or
before Unit 2 (losses, optimizers).

---

## Suggested pacing (optional)

Pace by topic, not by clock. A typical order: one topic → its lab → the next topic. Rough weights:
Unit 1 is the largest (four topics, eight labs); Units 2–5 have two or three topics each. Labs that train
on CPU state their expected run time in the notebook (lab-04 is the longest; use the `TRAIN_SUBSET` option).

---

## Prerequisites

- Python 3.9+, PyTorch + torchvision, Jupyter, numpy, matplotlib
- Basic linear algebra (vectors, matrices) and calculus (derivatives)

```bash
pip install torch torchvision matplotlib jupyter numpy
```

Labs run on CPU; Apple-silicon `mps` and CUDA are used automatically when available.
