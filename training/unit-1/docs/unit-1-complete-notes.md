# Unit 1: From Generative AI to Your First GAN

## Topic Overview

| Topic | Part | What you'll do |
|-------|------|----------------|
| Generative AI and the GAN idea | The World of Generative AI | See the big picture — what, why, and how |
| Generative AI and the GAN idea | What Is a GAN? | The forger vs detective story |
| Neural networks | Neural Networks Fast-Track | Neuron → layers → backprop → PyTorch |
| Build GANs | Build Your First GAN | Generate the number 7 from noise |

**Unit 1 promise:** You will build a working GAN by the end of this unit.

---

---

# PART 1: The World of Generative AI

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
- Diffusion: typically 20-100 denoising steps = one image (seconds); distilled models need 1-4

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
Unit 1:     Understand + build GANs, up to DCGAN    (this unit)
Unit 2:     Better loss + control                   (WGAN, WGAN-GP, cGAN)
Unit 3:     Evaluate + scale                        (FID, bias, StyleGAN)
Units 4–5:  Image translation                       (Pix2Pix, CycleGAN, satellite → map)
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
2019  StyleGAN2 ........... even better faces (arXiv Dec 2019)
        |
2021  StyleGAN3 ........... alias-free generation
        |
2022+ GAN ideas live on inside diffusion and hybrid models
```

Each one solved a specific problem. We'll build the important ones.

---

## Knowledge check — The World of Generative AI

1. Name the four main approaches to generative AI.
2. What is the key difference between GANs and VAEs?
3. Why are GANs still important even though diffusion models exist?
4. Name three real-world applications of GANs.
5. What does "generative" mean in Generative AI?

---

---

# PART 2: What Is a GAN?

---

## The one-sentence version

> Two neural networks compete against each other — one creates fakes, the other detects them — and both get better through the competition.

That's it. That's the whole idea. Everything else is details.

---

## The Story

Imagine a **forger** who creates fake paintings, and a **detective** who inspects paintings for museums.

```
  Round 1:
    Forger:    paints a terrible fake (stick figures)
    Detective: "Obviously fake" (easy catch)

  Round 10:
    Forger:    better fakes (right colors, but blurry)
    Detective: "Still fake — the brushwork is wrong"

  Round 100:
    Forger:    impressive fakes (right colors, textures, style)
    Detective: "Hmm... I think fake, but I'm not sure"

  Round 1000:
    Forger:    nearly perfect fakes
    Detective: "I literally cannot tell"
```

Both got better **because of each other**. The detective forced the forger to improve. The improving forger forced the detective to get sharper.

This is a **Generative Adversarial Network**.

---

## The Two Players

| | Forger | Detective |
|---|---|---|
| GAN name | **Generator (G)** | **Discriminator (D)** |
| Input | Random noise | An image (real or fake) |
| Output | A fake image | Answer: real or fake? |
| Goal | Fool the Detective | Catch the fakes |
| Built with | Neural network | Neural network (classifier) |

---

## What Is "Random Noise"?

Random noise = just a list of random numbers. No meaning. No pattern.

```python
import torch

noise = torch.randn(1, 5)    # 5 random numbers
print(noise)
```

```
tensor([[-0.42, 1.31, -0.87, 0.15, 2.01]])
```

**The Generator takes these meaningless numbers and turns them into something meaningful:**

```
Random numbers:  [-0.42, 1.31, -0.87, 0.15, 2.01]
                           |
                     [ Generator ]
                           |
                    A handwritten "3"
```

**Different noise = different output:**

```python
noise_1 = torch.randn(1, 100)    # 100 random numbers
noise_2 = torch.randn(1, 100)    # 100 DIFFERENT random numbers

image_1 = generator(noise_1)     # maybe a "3"
image_2 = generator(noise_2)     # maybe a "7"
```

Think of noise as a **trigger**. The Generator decides what to create from it. The noise just gives **variety** — without it, G would produce the same image every time.

---

## How It Works — The Data Flow

```
  +--------+     +-----------+     +--------+
  | Random |     |           |     | Fake   |
  | Noise  |---->| Generator |---->| Image  |---+
  +--------+     +-----------+     +--------+   |
                                                 |    +---------------+
                                                 +--->|               |
                                                      | Discriminator |---> real or fake?
                                                 +--->|               |
                                                 |    +---------------+
                                  +--------+     |
                                  | Real   |-----+
                                  | Image  |
                                  +--------+
```

1. Generator takes **random noise** and creates a fake image
2. Discriminator sees **both real and fake images** (mixed)
3. Discriminator says: "real" or "fake"
4. Both networks learn from the result

---

## The Training Loop — Two Steps, Repeated

Every round has two steps:

### Step A: Train the Discriminator

```
Show D a REAL image --> D should say 1 (real)
Show D a FAKE image --> D should say 0 (fake)
Update D's weights to get better at this
```

D is just a **classifier**. It learns to tell real from fake.

### Step B: Train the Generator

```
G creates a fake image from noise
D judges it
G wants D to say 1 (fooled!)
Update G's weights to get better at fooling D
```

G never sees real images. It only gets feedback from D.

```
Repeat Step A and Step B, thousands of times.
Both improve. Fakes get more realistic.
```

---

## Why This Works — Opposite Goals

| | D wants | G wants |
|---|---|---|
| For real images | D(real) = 1 | (doesn't care) |
| For fake images | D(fake) = 0 | D(fake) = 1 |

They **disagree** on fake images. This tension drives learning.

**The end goal:** G gets so good that D outputs 0.5 for everything — meaning "I have no idea if this is real or fake." In practice training wobbles **around** this balance rather than sitting exactly on it; at the balance D's loss is 2 ln 2 ≈ 1.386 and G's is ln 2 ≈ 0.693.

---

## What Does G Actually Learn?

G never sees real images. It only hears "good" or "bad" from D.

Over time, it picks up **patterns** in the data:

```
Real handwritten digits look like:
  - White lines on black background
  - Smooth curves and straight strokes
  - Similar thickness
  - Centered in the image

G learns these PATTERNS, not exact copies.
So it creates NEW digits that never existed before.
```

**Important:** G does NOT copy real images. It creates **new** ones that **look like** they could be real. That's what makes GANs useful — generating new data, not copying old data.

---

## After Training — What Happens?

**The Discriminator's job is done. Throw it away.**

```
During training:
  Noise --> [Generator] --> [Discriminator]    (both needed)

After training:
  Noise --> [Generator] --> new image!         (D not needed)
```

| | During training | After training |
|---|---|---|
| Generator | Learning to create | **Deployed — creates images** |
| Discriminator | Teaching G | **Thrown away — job done** |
| Noise | Input to G | Still needed (gives variety) |

```python
# After training — just 2 lines to generate:
noise = torch.randn(1, 100)
new_image = generator(noise)       # no discriminator needed
```

This is why GANs are **fast** — one forward pass through one network = one image.

---

## The Loss Function

Both networks use **BCE Loss** (Binary Cross-Entropy) — the same loss from classification.

### BCE Formula

$$BCE(p, y) = -[y \cdot \log(p) + (1 - y) \cdot \log(1 - p)]$$

| Symbol | Meaning |
|---|---|
| p | D's prediction (0 to 1) |
| y | Target label (1 = real, 0 = fake) |

**Two cases:**
- When y = 1 (real): BCE = -log(p) → pushes p toward 1
- When y = 0 (fake): BCE = -log(1-p) → pushes p toward 0

### Discriminator Loss

$$L_D = -[\log(D(x)) + \log(1 - D(G(z)))]$$

In code:
```
D_loss = BCE(D(real), 1) + BCE(D(fake), 0)
```

### Generator Loss

$$L_G = -\log(D(G(z)))$$

In code:
```
G_loss = BCE(D(fake), 1)    <-- G wants D to say 1 for fakes!
```

This is the **non-saturating** generator loss. The min–max objective below has G *minimise* log(1 − D(G(z))) instead — but that version **saturates**: when D confidently rejects early fakes (D(G(z)) ≈ 0) its gradient is almost zero. Goodfellow et al. (2014) therefore train G with −log D(G(z)), which pushes hardest exactly when G is losing. Same goal (make D say "real"), much stronger signal.

### The Full GAN Objective (Min-Max Game)

$$\min_G \max_D \; \mathbb{E}[\log D(x)] + \mathbb{E}[\log(1 - D(G(z)))]$$

In simple words:
- **D wants to maximize** — make D(x) close to 1 and D(G(z)) close to 0
- **G wants to minimize** — make D(G(z)) close to 1 (fool D)
- They play this game until balance

---

## The Key Trick: `.detach()`

When training D, we use G to make fakes but we **don't want G to learn yet**:

```python
fake = generator(noise).detach()    # stop gradients — only D learns
```

When training G, we **do** want gradients to flow back to G:

```python
fake = generator(noise)             # no detach — G learns from D's feedback
```

---

## The Full Training Step in Code

```python
# Step A: Train Discriminator
real_pred = D(real_images)           # D judges real images
fake_images = G(noise).detach()      # G makes fakes (D learns, G doesn't)
fake_pred = D(fake_images)           # D judges fakes
d_loss = BCE(real_pred, 1) + BCE(fake_pred, 0)
d_optimizer.zero_grad()              # clear D's old gradients
d_loss.backward()
d_optimizer.step()

# Step B: Train Generator
fake_images = G(noise)               # G makes fakes (G learns this time)
fake_pred = D(fake_images)           # D judges them
g_loss = BCE(fake_pred, 1)           # G wants D to say "real"
g_optimizer.zero_grad()              # clear G's old gradients
g_loss.backward()
g_optimizer.step()
```

That's the complete GAN training loop. Everything else builds on this.

---

## Basic GAN vs Variations

The basic GAN is the **engine**. Every variation is a different **car** built around that same engine.

```
DCGAN     = Basic GAN + convolutions
WGAN      = Basic GAN + better loss function
cGAN      = Basic GAN + label as extra input
Pix2Pix   = Basic GAN + image as input
CycleGAN  = Basic GAN + cycle trick
StyleGAN  = Basic GAN + style architecture
```

Understand the engine first. Then the cars are easy.

---

## The Whole Thing in One Simple Story

A drawing teacher has 1000 real paintings. A student wants to learn to paint.

**But the teacher never shows the paintings to the student.**

```
Lesson 1:
  Student picks a random number (say, 42).
  Uses it as a starting idea. Paints something.
  Shows it to the teacher.
  Teacher (who has seen real paintings): "Terrible. Not realistic at all."
  Student adjusts.

Lesson 10:
  Student picks another random number (say, 77).
  Paints something better this time.
  Teacher: "Better, but the colors are wrong."
  Student adjusts.

Lesson 100:
  Student picks random number 15.
  Paints something good.
  Teacher: "Hmm... I almost can't tell if this is real or yours."

Lesson 1000:
  Student picks any random number.
  Paints something beautiful.
  Teacher: "I cannot tell the difference anymore."
```

**Map it to a GAN:**

| Story | GAN |
|---|---|
| Student | Generator |
| Teacher | Discriminator |
| Random number | Noise (the trigger) |
| Student's painting | Fake image |
| Real paintings | Training dataset |
| "Good" or "Bad" feedback | Loss function (BCE) |
| Student adjusts | Backpropagation updates G's weights |

**After graduation (training done):**
- The teacher (D) goes home — not needed anymore
- The student (G) can paint on their own
- Give the student any random number = a new, original painting

---

## Knowledge check — What Is a GAN?

1. What are the two networks in a GAN and what does each do?
2. What is random noise and why does the Generator need it?
3. Does the Generator ever see real images?
4. What does `.detach()` do and when do we use it?
5. What happens to the Discriminator after training?
6. Can a basic GAN generate a specific thing on command (like "generate a cat")?

---

---

# PART 3: Neural Networks Fast-Track

> You need to understand what's inside G and D before building them. This is a rapid tour — enough to build a GAN in this unit.

---

## Part A: What Is a Neuron?

Our final goal is to build a **GAN** — two neural networks competing. But neural networks are made of **neurons**. So we start with the smallest piece.

```
One neuron
  → Many neurons (a layer)
    → Many layers (a deep network)
      → Two competing networks (a GAN)
```

### The neuron equation

$$\hat{y} = w \times x + b$$

| Symbol | Name | Example |
|---|---|---|
| `x` | **Input** | Distance (km) |
| `w` | **Weight** | 2 (how strongly input matters) |
| `b` | **Bias** | 5 (fixed baseline) |
| `ŷ` | **Output** | Predicted delivery time |

```python
distance = 4
weight = 2
bias = 5

prediction = weight * distance + bias
print("Predicted time:", prediction, "minutes")    # 13 minutes
```

- The **weight** is a volume knob — controls how strongly input affects output
- The **bias** is a fixed shift added to every prediction
- **Learning** means finding the right w and b automatically from data

### How the neuron learns: loss → gradient → update

Data: distances x = 1, 2, 3 km take y = 7, 9, 11 minutes. Start with a wrong weight, w = 1 (keep b = 5).

| Step | What | Numbers |
|---|---|---|
| 1 | Predict | ŷ = 6, 7, 8 |
| 2 | Loss (MSE = mean of squared errors) | errors −1, −2, −3 → (1 + 4 + 9) / 3 = **4.67** |
| 3 | Gradient ∂MSE/∂w = mean(2 · error · x) | 2 × (−1 − 4 − 9) / 3 = **−9.33** (negative → increase w) |
| 4 | Update w ← w − lr × gradient, lr = 0.1 | 1 − 0.1 × (−9.33) = **1.93** |
| 5 | Check | MSE drops from 4.67 to **0.02** |

The **learning rate** (lr) sets the step size: too small is slow, too large overshoots and diverges. Repeat steps 1–4 and w settles at 2. Backpropagation (Part D) is just this recipe applied through several layers.

---

## Part B: Why One Neuron Is Not Enough

A single neuron computes a straight line: `ŷ = wx + b`. But what if the data is curved (like `y = x²`)?

```python
# A single neuron trying to learn y = x²
x = [-2, -1, 0, 1, 2]
y = [ 4,  1, 0, 1, 4]    # U-shaped!

# Best a line can do: always predict 2 (the average)
# Loss = 2.8 — never improves. The model can't bend.
```

**Stacking linear layers doesn't help** — they collapse into one line:

```
Layer 1: h = 2x + 1
Layer 2: y = 3h + 4
Combined: y = 6x + 7     STILL A LINE!
```

### The fix: ReLU activation

$$ReLU(z) = \max(0, z)$$

| Input z | ReLU(z) |
|---:|---:|
| -3 | 0 (blocked) |
| -1 | 0 (blocked) |
| 0 | 0 |
| 2 | 2 (passes through) |
| 5 | 5 (passes through) |

```
  WITHOUT ReLU (collapses):           WITH ReLU (bends):

  Linear --> Linear = line            Linear --> ReLU --> Linear = can bend!
```

The **bend at zero** is the nonlinearity. When placed between layers, it prevents them from collapsing. This is what makes a network **deep**.

---

## Part C: Hidden Layers and the Forward Pass

Put neurons in the middle — "hidden" because we don't tell them what to produce:

```
Input  ->  [hidden neurons + ReLU]  ->  [output neuron]  ->  Output
```

**Follow x = 3 through the network** (weights: w1=1, w2=-1, v1=1, v2=1):

```
         x = 3
          |
   +------+------+
   |              |
 x1              x(-1)
   |              |
 z1=3          z2=-3
   |              |
 ReLU          ReLU
   |              |
 h1=3          h2=0       <- neuron 2 is OFF (negative input blocked)
   |              |
   +------+------+
          |
    y = 3 + 0 = 3
```

Try it:

```python
def relu(z):
    return max(0.0, z)

w1, w2 = 1.0, -1.0
v1, v2 = 1.0, 1.0

for x in [-3.0, -1.0, 0.0, 1.0, 3.0]:
    h1 = relu(w1 * x)
    h2 = relu(w2 * x)
    prediction = v1 * h1 + v2 * h2
    print(f"x={x:4.0f}  h1={h1:.0f} h2={h2:.0f}  y={prediction:.0f}")
```

```
x=  -3  h1=0 h2=3  y=3
x=  -1  h1=0 h2=1  y=1
x=   0  h1=0 h2=0  y=0
x=   1  h1=1 h2=0  y=1
x=   3  h1=3 h2=0  y=3
```

The network produces |x| — a V-shape! **Impossible with one linear neuron.**

---

## Part D: Backpropagation (How Networks Learn)

The network makes a prediction. If it's wrong, how does the error reach the hidden weights to fix them?

**Answer: pass the blame backward, one connection at a time.**

```
  x=2 --[w=1]--> z=2 --[ReLU]--> h=2 --[v=1]--> y=2     target=4
                                                            loss=4
```

| Step | What | Calculation |
|---:|---|---|
| 1 | Forward pass | z=2, h=2, y=2, loss=4 |
| 2 | How wrong? | blame = 2×(2-4) = **-4** |
| 3 | Output weight gradient | grad_v = blame × h = -4 × 2 = **-8** |
| 4 | Pass blame to h | blame_at_h = blame × v = -4 × 1 = **-4** |
| 5 | Through ReLU? | z=2 > 0 → gate OPEN → blame passes |
| 6 | Hidden weight gradient | grad_w = blame × x = -4 × 2 = **-8** |
| 7 | Update BOTH weights | v = 1.0 − 0.01×(−8) = **1.08**, w = 1.0 − 0.01×(−8) = **1.08** |
| 8 | Check | forward again: y = 1.08 × (1.08 × 2) = 2.3328 → loss = (2.3328 − 4)² = **2.78** (was 4.0) |

**Key insight:** If ReLU blocked during forward pass (z < 0), it also blocks blame backward. This is the **dead ReLU** problem — fixed with **LeakyReLU** in GANs.

---

## Part E: Sigmoid and Binary Cross-Entropy

A GAN's Discriminator needs to say "real or fake" — a probability between 0 and 1.

### Sigmoid squashes any number to 0-1

$$\sigma(z) = \frac{1}{1 + e^{-z}}$$

```python
import numpy as np

def sigmoid(z):
    return 1 / (1 + np.exp(-z))

for z in [-5, -2, 0, 2, 5]:
    print(f"sigmoid({z:3}) = {sigmoid(z):.4f}")
```

```
sigmoid( -5) = 0.0067    almost certainly fake
sigmoid( -2) = 0.1192    probably fake
sigmoid(  0) = 0.5000    can't tell
sigmoid(  2) = 0.8808    probably real
sigmoid(  5) = 0.9933    almost certainly real
```

### ReLU vs Sigmoid

| | ReLU | Sigmoid |
|---|---|---|
| Output range | 0 to infinity | **0 to 1** |
| Used for | Hidden layers | **Output layer (classification)** |
| Purpose | Add nonlinearity | Produce a **probability** |

### BCE Loss — punishes confident wrong answers

$$BCE = -[y \cdot \log(p) + (1-y) \cdot \log(1-p)]$$

```
Target = 1 (real), prediction = 0.01:
  MSE loss  = 0.98    (mild punishment)
  BCE loss  = 4.61    (severe punishment!)

BCE is much harsher on confident wrong answers.
That's what we want for classification.
```

### How this connects to GANs

```
  Generator makes fake image
         |
  Discriminator sees it
         |
  Sigmoid -> p = 0.8
         |
  BCE loss with target = 0 (it's fake)
  loss = -log(1 - 0.8) = 1.61   <-- "you were fooled!"

  D updates to output lower p for fakes.
  G updates to make fakes that get higher p.
```

---

## Part F: PyTorch — Let the Framework Do the Hard Work

In a real network with millions of weights, writing gradients by hand is impossible. **PyTorch calculates ALL gradients automatically.**

### Automatic gradients — the one-liner

```python
import torch

w = torch.tensor(1.0, requires_grad=True)
x = torch.tensor(2.0)
target = torch.tensor(4.0)

prediction = w * x
loss = (prediction - target) ** 2

loss.backward()         # ALL gradients, automatically!
print(f"gradient of w = {w.grad.item()}")    # -8.0
```

We spent an entire section deriving gradient = -8 by hand. PyTorch did it in **one line**.

### Build a network with nn.Sequential

```python
import torch.nn as nn

model = nn.Sequential(
    nn.Linear(1, 4),      # 1 input -> 4 hidden neurons
    nn.ReLU(),             # activation
    nn.Linear(4, 1),      # 4 hidden -> 1 output
    nn.Sigmoid()           # squash to 0-1
)
```

### The training loop — 3 lines that do everything

```python
optimizer.zero_grad()    # 1. Clear old gradients
loss.backward()          # 2. Calculate ALL gradients (backpropagation!)
optimizer.step()         # 3. Update ALL weights
```

| Line | What it does | What we did manually |
|---|---|---|
| zero_grad() | Clears old gradients | — |
| backward() | Backpropagation | Steps 2-6 above |
| step() | w = w - lr × gradient | Step 7 above |

### Complete classifier in PyTorch

```python
import torch
import torch.nn as nn

X = torch.tensor([[-3.], [-2.], [-1.], [1.], [2.], [3.]])
y = torch.tensor([[0.], [0.], [0.], [1.], [1.], [1.]])

model = nn.Sequential(
    nn.Linear(1, 4), nn.ReLU(),
    nn.Linear(4, 1), nn.Sigmoid()
)

loss_fn = nn.BCELoss()
optimizer = torch.optim.SGD(model.parameters(), lr=0.1)

for epoch in range(1, 201):
    pred = model(X)
    loss = loss_fn(pred, y)
    optimizer.zero_grad()
    loss.backward()
    optimizer.step()

    if epoch in [1, 50, 200]:
        print(f"Epoch {epoch:3}: loss={loss.item():.4f}")
```

```
Epoch   1: loss=0.7234   (example run)
Epoch  50: loss=0.0512
Epoch 200: loss=0.0013
```

> Example run — your numbers will differ (random initial weights). Over 20 random starts: epoch 1 ≈ 0.5–1.0, epoch 50 ≈ 0.05–0.37, epoch 200 ≈ 0.01–0.09. Every run ends far below where it started.

### What PyTorch replaced

| What you learned | PyTorch equivalent |
|---|---|
| y = w × x + b | nn.Linear(1, 1) |
| ReLU(z) = max(0, z) | nn.ReLU() |
| Sigmoid(z) | nn.Sigmoid() |
| BCE loss | nn.BCELoss() |
| Manual gradients | loss.backward() |
| w = w - lr × grad | optimizer.step() |

---

## Knowledge check — Neural Networks

1. What is `y` when `w=3, b=2, x=5`?
2. Why can't stacking linear layers learn a curve?
3. What does ReLU(-3) return? ReLU(5)?
4. In backpropagation, what happens when ReLU gate is closed?
5. What range does Sigmoid output?
6. What does `loss.backward()` do?
7. What are the 3 lines in the PyTorch training loop?

---

---

# PART 4: Build Your First GAN

> You know the idea. You know the building blocks. Now let's build a real GAN and watch it learn.

We'll start with the **simplest possible task**: teach a Generator to produce the number **7**.

No images yet. Just one number. This strips away all complexity so you can see the GAN mechanics clearly.

---

## The Task

| Component | What it is |
|---|---|
| **Real data** | The number 7.0 |
| **Generator** | Takes random noise → tries to output 7.0 |
| **Discriminator** | Sees a number → says "real" (1) or "fake" (0) |

```
Can the Generator learn to produce 7.0
without ever being told "the answer is 7"?

Yes. That's what we're about to see.
```

---

## Build the Generator

The Generator takes **random noise** and turns it into a number.

```
Random noise (1 number) --> [Generator] --> Fake number (trying to be 7)
```

**What happens inside (the math):**

$$z = W \cdot noise + b \quad \text{(Linear layer)}$$
$$h = \text{ReLU}(z) = \max(0, z) \quad \text{(activation)}$$
$$output = W_2 \cdot h + b_2 \quad \text{(second Linear layer)}$$

```python
import torch
import torch.nn as nn

generator = nn.Sequential(
    nn.Linear(1, 16),     # noise -> 16 hidden neurons
    nn.ReLU(),
    nn.Linear(16, 1),     # 16 -> 1 output number
)

# Test: feed random noise, see what comes out
noise = torch.randn(1, 1)
fake = generator(noise)
print(f"Noise: {noise.item():.4f}")
print(f"Generator output: {fake.item():.4f}")
```

```
Noise: 0.3367
Generator output: -0.0547
```

Random garbage. The Generator hasn't learned anything yet.

---

## Build the Discriminator

The Discriminator looks at a number and says: **real (1) or fake (0)?**

It's just a classifier — like what we built in the Neural Networks part.

```python
discriminator = nn.Sequential(
    nn.Linear(1, 16),     # input -> 16 hidden neurons
    nn.ReLU(),
    nn.Linear(16, 1),     # 16 -> 1 output
    nn.Sigmoid(),          # squash to 0-1
)

# Test: give it the real value 7
real_data = torch.tensor([[7.0]])
output = discriminator(real_data)
print(f"Input: {real_data.item()}")
print(f"D says: {output.item():.4f}")    # ~0.5, can't tell yet
```

---

## Loss and Optimizers

```python
loss_fn = nn.BCELoss()

gen_optimizer = torch.optim.Adam(generator.parameters(), lr=0.001)
dis_optimizer = torch.optim.Adam(discriminator.parameters(), lr=0.001)

real_label = torch.tensor([[1.0]])   # "this is real"
fake_label = torch.tensor([[0.0]])   # "this is fake"
```

Each network has its own optimizer — they update independently.

---

## The Training Loop

This is the **heart of every GAN**. Two steps, repeated thousands of times.

```python
for epoch in range(1, 2001):

    # =========================================
    # Step A: Train the Discriminator
    # =========================================

    # Show D the real data -> should say 1
    real_data = torch.tensor([[7.0]])
    real_pred = discriminator(real_data)
    loss_real = loss_fn(real_pred, real_label)

    # Show D the fake data -> should say 0
    noise = torch.randn(1, 1)
    fake_data = generator(noise).detach()     # .detach() = don't update G here
    fake_pred = discriminator(fake_data)
    loss_fake = loss_fn(fake_pred, fake_label)

    # Update D
    dis_loss = loss_real + loss_fake
    dis_optimizer.zero_grad()
    dis_loss.backward()
    dis_optimizer.step()

    # =========================================
    # Step B: Train the Generator
    # =========================================

    # Generate fake data
    noise = torch.randn(1, 1)
    fake_data = generator(noise)              # NO detach — G learns this time
    fake_pred = discriminator(fake_data)

    # G wants D to say 1 (fooled!)
    gen_loss = loss_fn(fake_pred, real_label)

    # Update G
    gen_optimizer.zero_grad()
    gen_loss.backward()
    gen_optimizer.step()

    # =========================================
    # Print progress
    # =========================================
    if epoch in [1, 100, 500, 1000, 2000]:
        test_noise = torch.randn(1, 1)
        generated = generator(test_noise).item()
        print(f"Epoch {epoch:4d}: D_loss={dis_loss.item():.4f}  "
              f"G_loss={gen_loss.item():.4f}  "
              f"Generated={generated:.4f}")
```

```
Epoch    1: D_loss=1.3754  G_loss=0.7311  Generated=-0.1423
Epoch  100: D_loss=1.2876  G_loss=0.7543  Generated=3.2156
Epoch  500: D_loss=1.3204  G_loss=0.7198  Generated=5.8734
Epoch 1000: D_loss=1.3612  G_loss=0.6987  Generated=6.5421
Epoch 2000: D_loss=1.3863  G_loss=0.6931  Generated=6.9847
```

**Watch that last column.** The Generator's output went from **-0.14 to 6.98** — almost 7!

> This table is an idealised, smooth run. A real run usually **overshoots** first — the output climbs past 7 (often to about 9–11 around epoch 800–1000) and then settles back near 7 by epoch 2000–3000. That wobble is normal adversarial dynamics. At balance D outputs ≈ 0.5 for everything, so D_loss → 2 ln 2 ≈ 1.386 and G_loss → ln 2 ≈ 0.693 (exactly the last row above).

---

## Watch It Learn

```
Epoch     1: Generated = -0.14    (random garbage)
Epoch   100: Generated =  3.22    (getting warmer)
Epoch   500: Generated =  5.87    (closer!)
Epoch  1000: Generated =  6.54    (almost!)
Epoch  2000: Generated =  6.98    (nearly 7!)
```

```
  target = 7.0
                                                    *  epoch 2000
                                               *       epoch 1000
                                          *            epoch 500
                                *                      epoch 100
  *                                                    epoch 1
  |----+----+----+----+----+----+----+----→
 -1    0    1    2    3    4    5    6    7
```

The Generator **never saw** the number 7. It only got "good" or "bad" feedback from D. Yet it discovered 7 on its own.

---

## Generate Multiple Samples

```python
with torch.no_grad():
    for i in range(10):
        noise = torch.randn(1, 1)
        generated = generator(noise).item()
        print(f"  Sample {i+1}: {generated:.4f}")
```

```
  Sample 1: 6.9732
  Sample 2: 7.0156
  Sample 3: 6.9891
  Sample 4: 7.0234
  Sample 5: 6.9654
  Sample 6: 7.0087
  Sample 7: 6.9945
  Sample 8: 7.0312
  Sample 9: 6.9823
  Sample 10: 7.0001
```

All close to 7! Different noise → slightly different outputs, but all near the target.

> **Is this mode collapse in disguise?** Not here: the real data is a single value, so one output *is* the whole real distribution. With images (GANs for images, L03–L06) real digits vary — a generator that gave the same digit for every noise *would* be mode collapse.

---

## Understand Each Part

### Why `.detach()` in Step A?

```python
fake_data = generator(noise).detach()
```

When training D, we **don't want to change G**. `.detach()` says: "use this value, but don't send gradients back to G."

Why it matters:
- Step A should compute and change **only D**.
- It skips a wasted backward pass through G.
- It keeps D-step gradients out of G's `.grad`. In this code order `gen_optimizer.zero_grad()` clears them before G's own update, so forgetting `.detach()` wastes work rather than breaking training — but move `zero_grad()` and those stray gradients would leak into G's step.

### Why does G use `real_label`?

```python
gen_loss = loss_fn(fake_pred, real_label)    # G wants D to say 1!
```

G's goal is to **fool** D. So G wants D to output 1 (real) for its fakes. If D says 0 (caught!), G gets high loss and adjusts.

### What are the two losses?

| Loss | Who learns | Goal |
|---|---|---|
| `dis_loss` | Discriminator | Say 1 for real, 0 for fake |
| `gen_loss` | Generator | Make D say 1 for fake |

They have **opposite goals**. That's why it's called **adversarial**.

### Why two optimizers?

Each network learns independently. G has its own weights and optimizer. D has its own weights and optimizer. They take turns updating.

---

## The Full Architecture

```
  +--------+     +-----------+     +--------+
  | Random |     |           |     | Fake   |
  | Noise  |---->| Generator |---->| Number |---+
  | (1)    |     | 1->16->1  |     |        |   |
  +--------+     +-----------+     +--------+   |
                                                 |    +---------------+
                                                 +--->|               |
                                                      | Discriminator |---> 0 or 1
                                                 +--->| 1->16->1+Sig  |
                                                 |    +---------------+
                                  +--------+     |
                                  | Real   |-----+
                                  | Data   |
                                  | (7.0)  |
                                  +--------+

  Train D: get better at telling real from fake
  Train G: get better at fooling D
  Repeat: both improve through competition
```

---

## What Just Happened

| What | How |
|---|---|
| Built a Generator | `nn.Sequential(Linear, ReLU, Linear)` |
| Built a Discriminator | `nn.Sequential(Linear, ReLU, Linear, Sigmoid)` |
| Trained them against each other | Alternating Step A and Step B |
| G learned to output ~7 | Without ever being told "the answer is 7" |
| G only got feedback from D | "good" or "bad" — that's all |

**This is a working GAN.** Simple? Yes. But the exact same pattern scales to images, faces, and everything else.

The only things that change as we scale up:
- The data goes from 1 number to 784 pixels (images)
- The networks get bigger
- Everything else stays the same

---

## Full Runnable Code

Copy, paste, run:

```python
import torch
import torch.nn as nn

# --- Networks ---
generator = nn.Sequential(
    nn.Linear(1, 16), nn.ReLU(), nn.Linear(16, 1),
)
discriminator = nn.Sequential(
    nn.Linear(1, 16), nn.ReLU(), nn.Linear(16, 1), nn.Sigmoid(),
)

# --- Loss and Optimizers ---
loss_fn = nn.BCELoss()
gen_opt = torch.optim.Adam(generator.parameters(), lr=0.001)
dis_opt = torch.optim.Adam(discriminator.parameters(), lr=0.001)

real_label = torch.tensor([[1.0]])
fake_label = torch.tensor([[0.0]])

# --- Training ---
for epoch in range(1, 2001):
    # Step A: Train D
    real_data = torch.tensor([[7.0]])
    dis_loss = loss_fn(discriminator(real_data), real_label) + \
               loss_fn(discriminator(generator(torch.randn(1,1)).detach()), fake_label)
    dis_opt.zero_grad(); dis_loss.backward(); dis_opt.step()

    # Step B: Train G
    gen_loss = loss_fn(discriminator(generator(torch.randn(1,1))), real_label)
    gen_opt.zero_grad(); gen_loss.backward(); gen_opt.step()

    if epoch % 500 == 0:
        val = generator(torch.randn(1,1)).item()
        print(f"Epoch {epoch}: Generated = {val:.4f}")

# --- Test ---
print("\n10 generated samples:")
with torch.no_grad():
    for i in range(10):
        print(f"  {generator(torch.randn(1,1)).item():.4f}")
```

---

## Knowledge check — Build Your First GAN

1. What does the Generator take as input and what does it output?
2. What does the Discriminator output and what does it mean?
3. Why does G use `real_label` in its loss?
4. What does `.detach()` do and why is it needed in Step A?
5. The Generator never saw the number 7. How did it learn to produce it?
6. Why do we need two separate optimizers?

---

---

# Unit 1 Summary

| Part | What you learned |
|------|-----------------|
| **The World of Generative AI** | Generative AI landscape — VAE, GAN, Transformer, Diffusion |
| **What Is a GAN?** | How GANs work — forger vs detective, training loop, BCE loss |
| **Neural Networks** | Neural network building blocks — neuron, ReLU, backprop, Sigmoid, PyTorch |
| **Build Your First GAN** | Built a working GAN that generates the number 7 from noise |

## What comes next

Build GANs continues by scaling up (see the Build GANs decks and labs 02–04):
- **From 1 number to 784 pixels** — GAN for MNIST handwritten digits
- **Convolutions** — why spatial awareness matters
- **DCGAN** — sharp images with ConvTranspose2d and BatchNorm
- **When GANs break** — mode collapse, a too-strong D, oscillation, and fixes

**You built a GAN. Next you'll generate images — then Unit 2 fixes the loss itself.**
