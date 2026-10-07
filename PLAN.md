# GAN Mastery: From Zero to Marathon

**Prerequisite (covered in Unit 1):** neurons, loss, gradients, backpropagation, PyTorch.
**You'll learn:** GANs — from the core idea to image translation.

Materials live in `training/` by unit (`training/index.html`). This file is the lesson/lab roadmap;
`training/TRAINING-PLAN.md` adds topics, decks and pacing.

---

## Unit 1: Generative AI, GANs, PyTorch, DCGAN — "Two networks fight"

| Lesson | Key idea | Lab |
|---|---|---|
| S1 · The world of generative AI | Why GANs, what else exists, where GANs fit | — |
| S2 · What is a GAN? | Forger vs detective — the adversarial idea | — |
| NN-L00–L14 · Neural networks | Neuron → loss → gradient → backprop → Sigmoid + BCE → classifier → PyTorch | lab-p1, lab-p2, lab-p3, lab-00 |
| L02 · Build your first GAN | Generate the number 7 from noise | lab-01 |
| L03 · GAN for images | MNIST digits, flatten to 784, Tanh, LeakyReLU | lab-02 |
| L04 · Convolutions crash course | Filters, stride, Conv2d, ConvTranspose2d | — |
| L05 · DCGAN | Convolutional GAN, BatchNorm, sharp images | lab-03 |
| L06 · When GANs break | Mode collapse, a too-strong D, the band-aid fixes | lab-04 |

**After Unit 1:** you can build, train and debug a GAN that generates images.

## Unit 2: Better loss, control — "Fix the loss, control the output"

| Lesson | Key idea | Lab |
|---|---|---|
| L07 · Why BCE loss fails | JS stuck at log 2 when real and fake don't overlap | — |
| L08 · WGAN | Earth Mover's distance, critic instead of discriminator | lab-08 |
| L09 · WGAN-GP | Lipschitz constraint, why clipping is bad, gradient penalty | lab-09 |
| L10 · Conditional GAN | "Generate a 7" — class-conditional generation | lab-10 |
| L11 · Controllable generation | Interpolation, latent arithmetic, truncation | lab-11 |

**After Unit 2:** you can build stable, controllable GANs with modern loss functions.

## Unit 3: Evaluate and scale — "How good is your GAN?"

| Lesson | Key idea | Lab |
|---|---|---|
| L12 · Evaluating GANs | Why "looks good" isn't enough; IS and FID | — |
| L13 · FID deep dive | Inception features, Fréchet distance, implementation | lab-13 |
| L14 · Bias and fairness | Dataset, model and evaluation bias; mitigation | — |
| L15 · StyleGAN | Mapping network, AdaIN, style mixing | lab-15 |

**After Unit 3:** you can measure GAN quality scientifically and understand state-of-the-art architectures.

## Unit 4: Translation, augmentation, privacy — "Transform images"

| Lesson | Key idea | Lab |
|---|---|---|
| L16 · Image-to-image framework | Paired translation, encoder–decoder | — |
| L17 · Pix2Pix | U-Net + PatchGAN, L1 + GAN loss | lab-17 |
| L18 · Data augmentation & privacy | GANs for synthetic data, differential privacy | — |

## Unit 5: CycleGAN and capstone — "Between worlds, without pairs"

| Lesson | Key idea | Lab |
|---|---|---|
| L19 · CycleGAN | Cycle-consistency loss, horse ↔ zebra | lab-19 |
| L20 · Satellite to map + wrap-up | Real application, course summary | lab-20 |

**After Unit 5:** you can transform images between domains, paired or unpaired. Marathon complete.

---

## The story arc

```
Unit 1:  noise → image                (the basic GAN, then DCGAN)
Unit 2:  noise → SPECIFIC image       (stable loss + control)
Unit 3:  noise → MEASURED image       (evaluation, bias, StyleGAN)
Unit 4:  image → DIFFERENT image      (paired translation, augmentation, privacy)
Unit 5:  image → image, unpaired      (CycleGAN, capstone)
```

## Numbering note

Lesson and lab numbers are historical and kept stable. L00/L01 became the S1/S2 decks; Unit 1's GAN labs are
lab-01–04; later labs share the number of their lesson (no notebook for L07, L12, L14, L16, L18).

## Lesson style

- One idea per slide, story-driven, short lines
- Code for every concept; every formula explained term by term and worked
- Experiments to break and fix things; labs as Jupyter notebooks
