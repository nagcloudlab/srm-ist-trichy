# Lesson 0: Overview of Generative AI

## Two kinds of AI

Most AI you've seen is **discriminative** — it looks at data and makes a decision.

```
  Discriminative AI:
    Input: photo of a cat     → Output: "cat"       (classification)
    Input: customer profile   → Output: "will churn" (prediction)
    Input: email text         → Output: "spam"       (filtering)
```

But there's another kind. **Generative AI** creates new data that looks like the real thing.

```
  Generative AI:
    Input: "a cat on a beach" → Output: a new image of a cat on a beach
    Input: random noise       → Output: a realistic human face
    Input: a sketch           → Output: a photorealistic building
```

One classifies. The other creates. This course is about the second kind.

---

## What does "generative" actually mean?

A generative model learns the **distribution** of the training data — the hidden rules that make data look the way it does.

```
  Training data:   thousands of face photos

  What the model learns:
    "Eyes are usually above the nose"
    "Skin has a certain range of colors"
    "Faces are roughly symmetric"
    "Hair appears at the top"

  What it can then do:
    Generate NEW faces that follow those same rules
    but don't belong to any real person
```

It doesn't memorize images. It learns the **patterns** behind them, then creates new examples that follow those patterns.

---

## The generative AI landscape

There are several approaches to generative modeling. Here are the big ones:

| Model | Year | Idea | Strength |
|---|---|---|---|
| **VAE** | 2013 | Encode → compress → decode | Smooth latent space, stable training |
| **GAN** | 2014 | Two networks compete | Sharp, realistic outputs |
| **Flow** | 2015 | Invertible transformations | Exact likelihood computation |
| **Diffusion** | 2020 | Add noise → learn to remove it | Best image quality today |
| **Transformer** | 2017 | Predict next token | Powers ChatGPT, text generation |

Each has trade-offs. This course focuses on **GANs** — the approach that first proved machines can generate photorealistic images.

---

## Why GANs matter

Before GANs (2014), generated images looked like this:

```
  ┌──────────────┐
  │ ░░▒▒░▒▒░░   │
  │ ▒░░░▒▒░░▒   │     Blurry blobs.
  │ ░▒▒░░░▒▒░   │     Clearly fake.
  │ ▒░▒▒▒░░▒░   │
  └──────────────┘
```

After GANs:

```
  ┌──────────────┐
  │              │
  │   A face so  │     Photorealistic.
  │   real you   │     Indistinguishable
  │   can't tell │     from real photos.
  │              │
  └──────────────┘
```

The key paper: **"Generative Adversarial Nets"** by Ian Goodfellow et al., 2014.

The key idea: **two networks compete**, and the competition forces both to improve.

---

## The GAN idea in 60 seconds

```
  Forger (Generator):    Creates fake paintings
  Detective (Discriminator):  Spots the fakes

  Round 1:  Forger paints a stick figure. Detective: "Fake!"
  Round 2:  Forger adds shading. Detective: "Still fake!"
  Round 3:  Forger adds texture, detail. Detective: "Hmm... real?"
  ...
  Round N:  Forgeries are indistinguishable from originals.
```

Two networks, opposite goals:

| Network | Input | Output | Goal |
|---|---|---|---|
| **Generator (G)** | Random noise | Fake data | Fool the Discriminator |
| **Discriminator (D)** | Real or fake data | Probability (0-1) | Catch the fakes |

They train **together**. The Generator gets better at creating, the Discriminator gets better at detecting. The competition drives quality.

---

## How GANs compare to other generative models

### VAE (Variational Autoencoder)

```
  Input image → [Encoder] → compressed code → [Decoder] → reconstructed image
```

- Learns to compress and reconstruct
- Outputs tend to be **blurry** (averages over possibilities)
- Training is **stable** (no adversarial game)
- Has a smooth latent space (good for interpolation)

### GAN (Generative Adversarial Network)

```
  Random noise → [Generator] → fake image
                                    ↓
  Real image ──────────────→ [Discriminator] → real or fake?
```

- No encoder needed — generates from noise directly
- Outputs are **sharp** (adversarial pressure demands realism)
- Training can be **unstable** (the two networks must stay balanced)
- The sharpness made GANs revolutionary

### Diffusion models (DALL-E 2, Stable Diffusion, Midjourney)

```
  Clean image → [add noise step by step] → pure noise
  Pure noise  → [remove noise step by step] → clean image
```

- Currently **best image quality**
- Very slow to generate (many denoising steps)
- Stable training (no adversarial game)
- Arrived later (2020+), built on lessons from GANs

### Why study GANs if diffusion is better?

1. **GANs are faster at generation** — one forward pass vs hundreds of steps
2. **GANs teach adversarial thinking** — a concept used across ML
3. **Many real-world systems still use GANs** — data augmentation, super-resolution, style transfer
4. **GANs are the foundation** — understanding them makes diffusion models easier to learn
5. **The syllabus requires it** — this is CS60507

---

## Where GANs are used today

| Application | What happens |
|---|---|
| **Face generation** | StyleGAN creates photorealistic faces of people who don't exist |
| **Image super-resolution** | SRGAN turns blurry images into sharp ones |
| **Data augmentation** | Generate synthetic training data when real data is scarce |
| **Medical imaging** | Create synthetic X-rays/MRIs to train diagnostic models |
| **Image-to-image translation** | Sketch → photo, satellite → map, day → night |
| **Video generation** | Generate realistic video frames |
| **Privacy preservation** | Generate synthetic data that preserves statistics but protects identity |
| **Art and design** | Style transfer, artistic filters, creative tools |

---

## The GAN training loop — preview

We'll build this step by step in later lessons, but here's the big picture:

```python
for epoch in range(num_epochs):

    # Part A: Train the Discriminator
    #   Show it real data → should say "real" (1)
    #   Show it fake data → should say "fake" (0)
    #   Update D's weights

    # Part B: Train the Generator
    #   Generate fake data
    #   Ask D to judge it
    #   G wants D to say "real" (1) for fake data
    #   Update G's weights

    # Repeat: both improve through competition
```

Two players. Opposite goals. Simultaneous training.

That's the entire idea. The rest of this course is about making it work — and making it work well.

---

## The course roadmap

This is where we're headed:

```
  Unit 1: GenAI, GANs, PyTorch, DCGAN
    ├── Neural network foundations (Lessons 1-14)
    ├── Build your first GAN — the number 7 (L02)
    ├── GAN for images — MNIST (L03), convolutions (L04)
    ├── DCGAN — convolutional GAN (L05)
    └── When GANs break — and the band-aid fixes (L06)

  Unit 2: Better loss, stable training, control
    ├── Why BCE fails (L07)
    ├── WGAN and WGAN-GP (L08–L09)
    └── Conditional & controllable GANs (L10–L11)

  Unit 3: Evaluate & scale
    ├── Inception Score, FID (L12–L13)
    ├── GAN bias and fairness (L14)
    └── StyleGAN (L15)

  Units 4–5: Image translation
    ├── Image-to-image, Pix2Pix (L16–L17)
    ├── Data augmentation & privacy (L18)
    └── CycleGAN, satellite → map capstone (L19–L20)
```

---

## The GAN formula — first look

Don't worry about understanding this yet. Just see that it exists:

```
  min_G max_D  V(D, G) = E[log D(x)] + E[log(1 - D(G(z)))]
```

By the end of Unit 1, you'll know every symbol here:

| Symbol | Meaning |
|---|---|
| `G` | Generator network |
| `D` | Discriminator network |
| `x` | Real data |
| `z` | Random noise |
| `D(x)` | Discriminator's judgment of real data |
| `G(z)` | Generator's fake output |
| `E[...]` | Average over many examples |
| `log` | Natural logarithm |
| `min_G max_D` | G minimizes, D maximizes — the adversarial game |

We'll break this apart piece by piece. First, we need to understand neurons.

---

## Knowledge check

1. What is the difference between discriminative and generative AI?
2. Name three types of generative models.
3. In a GAN, what are the two networks called and what does each do?
4. Why are GAN outputs sharper than VAE outputs?
5. Give three real-world applications of GANs.
6. Why study GANs when diffusion models produce better images?

---

## Next lesson

Now you know **what** generative AI is and **where** GANs fit. But GANs are made of neural networks, and neural networks are made of **neurons**. So we start at the smallest piece.

Next: **Lesson 1 — What Is a Neuron?**
