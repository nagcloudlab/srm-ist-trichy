# Lesson 01: What Is a GAN?

## The one-sentence version

> Two neural networks compete against each other — one creates fakes, the other detects them — and both get better through the competition.

That's it. That's the whole idea. Everything else is details.

---

## 1. The Story

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

## 2. The Two Players

| | Forger | Detective |
|---|---|---|
| GAN name | **Generator (G)** | **Discriminator (D)** |
| Input | Random noise | An image (real or fake) |
| Output | A fake image | Answer: real or fake? |
| Goal | Fool the Detective | Catch the fakes |
| Built with | Neural network | Neural network (classifier) |

---

## 3. What Is "Random Noise"?

Random noise = just a list of random numbers. No meaning. No pattern.

```python
import torch

noise = torch.randn(1, 5)    # 5 random numbers
print(noise)
```

```
tensor([[-0.42, 1.31, -0.87, 0.15, 2.01]])
```

That's it. Like rolling 5 dice.

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

**How many random numbers?**
- Simple GAN: 1 to 64 numbers
- Image GAN: 100 numbers (typical)
- More numbers = more variety in outputs

---

## 4. How It Works — The Data Flow

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

## 5. The Training Loop — Two Steps, Repeated

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

## 6. Why This Works — Opposite Goals

| | D wants | G wants |
|---|---|---|
| For real images | D(real) = 1 | (doesn't care) |
| For fake images | D(fake) = 0 | D(fake) = 1 |

They **disagree** on fake images. This tension drives learning.

**The end goal:** G gets so good that D outputs 0.5 for everything — meaning "I have no idea if this is real or fake." In practice training wobbles **around** this balance rather than sitting exactly on it; at the balance D's loss is 2 ln 2 ≈ 1.386 and G's is ln 2 ≈ 0.693.

---

## 7. What Does G Actually Learn?

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

## 8. After Training — What Happens?

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

## 9. The Loss Function

Both networks use **BCE Loss** (Binary Cross-Entropy) — the same loss from classification.

### BCE Formula

$$BCE(p, y) = -[y \cdot \log(p) + (1 - y) \cdot \log(1 - p)]$$

| Symbol | Meaning |
|---|---|
| p | D's prediction (0 to 1) |
| y | Target label (1 = real, 0 = fake) |
| log | Natural logarithm |

**Two cases:**
- When y = 1 (real): BCE = -log(p) → pushes p toward 1
- When y = 0 (fake): BCE = -log(1-p) → pushes p toward 0

### Discriminator Loss

D wants to correctly label both real and fake:

$$L_D = -[\log(D(x)) + \log(1 - D(G(z)))]$$

| Symbol | Meaning |
|---|---|
| x | Real data |
| z | Random noise |
| G(z) | Fake data (Generator's output) |
| D(x) | D's score on real data (should be → 1) |
| D(G(z)) | D's score on fake data (should be → 0) |

In code:
```
D_loss = BCE(D(real), 1) + BCE(D(fake), 0)
```

### Generator Loss

G wants D to think its fakes are real:

$$L_G = -\log(D(G(z)))$$

G wants D(G(z)) → 1, so this loss is low when D is fooled.

In code:
```
G_loss = BCE(D(fake), 1)    <-- G wants D to say 1 for fakes!
```

This is the **non-saturating** generator loss. The min–max objective below has G *minimise* log(1 − D(G(z))) instead — but that version **saturates**: when D confidently rejects early fakes (D(G(z)) ≈ 0) its gradient is almost zero. Goodfellow et al. (2014) therefore train G with −log D(G(z)), which pushes hardest exactly when G is losing. Same goal (make D say "real"), much stronger signal.

### The Full GAN Objective (Min-Max Game)

The original GAN paper describes it as one formula:

$$\min_G \max_D \; \mathbb{E}[\log D(x)] + \mathbb{E}[\log(1 - D(G(z)))]$$

In simple words:
- **D wants to maximize** — make D(x) close to 1 and D(G(z)) close to 0
- **G wants to minimize** — make D(G(z)) close to 1 (fool D)
- They play this game until balance

---

## 10. The Key Trick: `.detach()`

When training D, we use G to make fakes but we **don't want G to learn yet**:

```python
fake = generator(noise).detach()    # stop gradients — only D learns
```

When training G, we **do** want gradients to flow back to G:

```python
fake = generator(noise)             # no detach — G learns from D's feedback
```

---

## 11. The Full Training Step in Code

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

## 12. The Challenges (Preview)

GANs are powerful but tricky to train:

| Problem | What happens | When we fix it |
|---|---|---|
| **Mode collapse** | G makes the same image every time | Lesson 06 |
| **D wins too easily** | G gets no feedback, stops learning | Lesson 06 |
| **Training oscillates** | Both networks swing up and down | Lesson 06 |
| **BCE loss limitations** | Gradients disappear | Lesson 07-08 (WGAN) |

Don't worry about these yet. First, let's build one and see it work.

---

## 13. Basic GAN vs Variations

**"If we need variations, is the basic GAN useless?"**

No. The basic GAN is the **engine**. Every variation is a different **car** built around that same engine.

```
Basic GAN = the engine (G creates, D judges, they compete)

Every variation still has this engine inside.
They just add or change something on top.
```

**What the basic GAN can do:**
- Generate simple images (digits, shapes)
- Learn and teach the core idea
- Quick experiments

**What it can't do (and which variation fixes it):**

| Problem | Basic GAN can't | Variation that fixes it |
|---|---|---|
| Training keeps crashing | | **WGAN** (better loss) |
| "Generate a dog" (control) | | **Conditional GAN** |
| Images are blurry | | **DCGAN** (convolutions) |
| Need photorealistic faces | | **StyleGAN** |
| Sketch to photo | | **Pix2Pix** |
| Horse to zebra | | **CycleGAN** |

Every variation is just basic GAN + one new idea:

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

## 14. The GAN Family Tree

```
2014  GAN .................. the original engine
        |
2015  DCGAN ............... + convolutions = sharp images
        |
2016  Pix2Pix ............. + image input = image translation
        |
2017  WGAN ................ + better loss = stable training
        |   CycleGAN ....... + cycle trick = unpaired translation
        |
2018  StyleGAN ............ + style control = photorealistic faces
```

We'll build all of these.

---

## 15. The Whole Thing in One Simple Story

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

**The one line that explains it all:**

> With random noise as a trigger, the Generator learns to make new images that look like the originals, using only the Discriminator's feedback.

**After graduation (training done):**
- The teacher (D) goes home — not needed anymore
- The student (G) can paint on their own
- Give the student any random number = a new, original painting
- Different numbers = different paintings
- None of them are copies — all are new creations

---

## Knowledge Check

1. What are the two networks in a GAN and what does each do?
2. What is random noise and why does the Generator need it?
3. Does the Generator ever see real images?
4. What does `.detach()` do and when do we use it?
5. What happens to the Discriminator after training?
6. Can a basic GAN generate a specific thing on command (like "generate a cat")?
7. What is the difference between copying and generating?

---

## Next Lesson

You understand the idea. Before building one we need the parts inside G and D — the neural-network lessons (`../nn-lessons/lesson-01-what-is-a-neuron.md` → lesson-14, PyTorch). Then L02: we create a GAN that learns to generate the number 7 — from scratch, in PyTorch.
