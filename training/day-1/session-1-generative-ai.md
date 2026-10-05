# Session 1: The World of Generative AI

---

## What is Generative AI?

Normal AI **understands** things:
- "Is this email spam?" (classification)
- "What's in this photo?" (detection)
- "Will it rain tomorrow?" (prediction)

Generative AI **creates** new things:
- Write a poem that never existed
- Draw a face that no one has
- Compose music no one has heard
- Generate an X-ray for training doctors

```
Normal AI:    input --> ANSWER
Generative AI: input --> NEW CONTENT
```

---

## What can Generative AI create?

| Type | What it creates | You've probably seen |
|---|---|---|
| Text | Stories, code, emails, chat | ChatGPT, Gemini, Claude |
| Images | Photos, art, designs | DALL-E, Midjourney, Stable Diffusion |
| Audio | Speech, music, sound effects | Suno, ElevenLabs |
| Video | Clips, animations | Sora, Runway |
| 3D | Objects, scenes | Point-E, 3D-GAN |
| Data | Fake database rows, medical records | CTGAN |
| Code | Programs, functions | GitHub Copilot |

All of these are **Generative AI**. Different tools, same big idea: learn patterns from real data, then create new data that follows those patterns.

---

## How does a machine "create" something?

It doesn't imagine like humans. It learns **patterns** from millions of examples, then produces new outputs that follow those same patterns.

```
Training:
  Show the model 1 million cat photos
  It learns: cats have ears, whiskers, fur, eyes...

Generating:
  "Give me a new cat"
  It creates a NEW image following those learned patterns
  This cat never existed before!
```

The key question: **how exactly does it learn and create?**

There are different approaches. Each one solves this differently.

---

## The Four Main Approaches

### 1. Autoencoders / VAEs (Variational Autoencoders)

**Idea:** Squeeze an image into a tiny code, then rebuild it from that code.

```
Image --> [Encoder] --> small code --> [Decoder] --> Rebuilt Image
(784 pixels)            (20 numbers)                (784 pixels)
```

Once trained, throw away the encoder. Feed random codes to the decoder = new images.

| Good | Bad |
|---|---|
| Simple to understand | Images are **blurry** |
| Stable training | Not very sharp or detailed |
| Fast | Limited quality |

**Think of it as:** Compressing a photo to a tiny file, then uncompressing it. Some details get lost.

---

### 2. GANs (Generative Adversarial Networks)

**Idea:** Two networks compete — one creates fakes, the other catches them. Both improve.

```
Noise --> [Generator] --> Fake image --+
                                       +--> [Discriminator] --> Real or Fake?
Real image ----------------------------+
```

| Good | Bad |
|---|---|
| **Sharp, realistic** images | Hard to train |
| Fast generation | Can be unstable |
| Great for faces, art, medical | Sometimes "mode collapse" (stuck) |

**Think of it as:** A forger vs a detective. The competition makes both better.

**This is what we'll learn in this course.**

---

### 3. Transformers (for text, but also images)

**Idea:** Predict the next word (or next pixel) based on everything before it.

```
"The cat sat on the" --> [Transformer] --> "mat"
```

| Good | Bad |
|---|---|
| **Best for text** (ChatGPT, etc.) | Needs massive data |
| Can do images too (DALL-E) | Very large models |
| Understands context well | Expensive to train |

**Think of it as:** Auto-complete on your phone, but much smarter.

---

### 4. Diffusion Models

**Idea:** Start with pure noise. Slowly remove the noise, step by step, until a clear image appears.

```
Step 0: Pure noise (TV static)
Step 1: Slightly less noisy
Step 2: Shapes start to appear
...
Step 100: Clear, sharp image
```

| Good | Bad |
|---|---|
| **Very high quality** images | Slow (many steps needed) |
| More stable than GANs | Heavy computation |
| State of the art (2023-2025) | Complex math |

**Think of it as:** Sculpting — start with a rough block (noise) and slowly carve out the details.

---

## Compare them all

| Approach | Best for | Quality | Training | Speed |
|---|---|---|---|---|
| VAE | Simple generation | Blurry | Easy | Fast |
| **GAN** | **Images, faces, medical** | **Sharp** | **Tricky** | **Fast** |
| Transformer | Text, code, chat | Excellent | Needs huge data | Medium |
| Diffusion | High-quality images | Best | Stable | Slow |

```
Quality ranking (for images):
  Diffusion > GAN > VAE

Speed ranking (generation):
  GAN > VAE > Diffusion

Training ease:
  VAE > Diffusion > GAN
```

---

## Where do GANs shine?

GANs are the best choice when you need:

**1. Fast generation**
- GAN: one forward pass = one image (milliseconds)
- Diffusion: 50-100 steps = one image (seconds)

**2. Sharp, detailed images**
- GANs produce crisp outputs (no blur like VAEs)

**3. Specific applications**

| Application | How GANs help |
|---|---|
| **Medical imaging** | Generate synthetic X-rays, MRIs for training |
| **Data augmentation** | Create more training data when you have too little |
| **Face generation** | Create realistic fake faces (StyleGAN) |
| **Image editing** | Change hair color, add smile, age a face |
| **Image translation** | Sketch to photo, satellite to map, day to night |
| **Super resolution** | Turn low-res images into high-res |
| **Privacy** | Generate fake data that looks real (no real people) |
| **Art and design** | Generate textures, patterns, artwork |

---

## Why learn GANs in 2026?

**1. Foundation** — GANs teach you the adversarial idea. Many modern models (including diffusion) use discriminators borrowed from GANs.

**2. Still used** — GANs are still the best for fast, real-time generation. Many production systems use GANs.

**3. Building blocks** — Concepts from GANs (discriminators, generators, adversarial loss, image translation) appear everywhere in modern AI.

```
Learn GANs well --> understand 80% of modern generative AI
```

---

## What we'll build in this training

```
Day 1: Understand + build your first GAN           (today!)
Day 2: GAN for images + convolutional GAN           (DCGAN)
Day 3: Stable training + controllable generation    (WGAN, cGAN)
Day 4: Evaluate + image translation                 (FID, Pix2Pix, CycleGAN)
```

---

## The GAN family tree

```
2014  GAN .................. the original idea (Ian Goodfellow)
        |
2015  DCGAN ............... add convolutions = sharp images
        |
2016  Pix2Pix ............. paired image translation
        |
2017  WGAN ................ better loss function
        |   CycleGAN ....... unpaired image translation
        |
2018  StyleGAN ............ photorealistic faces
        |
2019  StyleGAN2 ........... even better faces
        |
2020  StyleGAN3 ........... alias-free generation
        |
2021+ GAN ideas merge into diffusion and hybrid models
```

Each one solved a specific problem. We'll build the important ones.

---

## Knowledge check

1. Name the four main approaches to generative AI.
2. What is the key difference between GANs and VAEs?
3. Why are GANs still important even though diffusion models exist?
4. Name three real-world applications of GANs.
5. What does "generative" mean in Generative AI?
