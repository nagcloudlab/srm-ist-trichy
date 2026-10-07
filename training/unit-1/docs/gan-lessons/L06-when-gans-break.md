# Lesson 06: When GANs Break (and How to Fix It)

## Where we are

| L04 | L05 | **L06** |
|---|---|---|
| Convolutions | DCGAN (sharp images) | **What goes wrong + fixes** |

Your DCGAN produces sharp images. But GAN training is like balancing on a tightrope — it can fall off in several ways. This lesson teaches you to **recognize** the problems and **fix** them.

---

## 1. Why Are GANs Hard to Train?

In normal neural networks, you have ONE network minimizing ONE loss. Simple.

In GANs, you have **TWO networks with OPPOSITE goals**:

```
D wants: D(real) = 1, D(fake) = 0
G wants: D(fake) = 1

They're fighting each other. Training is a balancing act.
```

If one gets too strong too fast, the other can't learn. If both are too weak, neither improves. The balance is fragile.

---

## 2. Problem 1: Mode Collapse

### What happens

G finds **ONE output** that fools D and keeps producing only that. Every generated image looks the same.

```
What we want:                    Mode collapse:

┌───┐ ┌───┐ ┌───┐ ┌───┐        ┌───┐ ┌───┐ ┌───┐ ┌───┐
│ 0 │ │ 3 │ │ 7 │ │ 5 │        │ 7 │ │ 7 │ │ 7 │ │ 7 │
└───┘ └───┘ └───┘ └───┘        └───┘ └───┘ └───┘ └───┘
  variety of digits               always the same digit!
```

### Why it happens

G discovers a "cheat code" — one output that consistently fools D. Instead of learning the full data distribution, G just keeps producing that one thing.

```
G thinks: "Digit 7 fools D every time. Why bother learning 0-9?
           I'll just keep making 7s."
```

### How to spot it

- All generated images look the same (or very similar)
- G loss is low but output has no variety
- If you generate 100 images, they're all the same digit

### How to fix it

| Fix | How it helps |
|---|---|
| **Larger noise vector** | More randomness → more variety possible |
| **Train D more than G** | Stronger D forces G to learn more modes |
| **Use WGAN loss** | Better gradients (covered in L08) |
| **Mini-batch discrimination** | D checks if G's outputs are too similar |

```python
# Fix 1: Increase noise size
noise_size = 128    # instead of 64 or 100

# Fix 2: Train D more steps
for d_step in range(3):       # train D 3 times
    # ... train D ...
# ... then train G once ...
```

---

## 3. Problem 2: D Wins Too Easily (Vanishing Gradients)

### What happens

D becomes too good too fast. It outputs 0 for ALL fakes with **100% confidence**. The gradient for G becomes **zero** — G can't learn.

```
D says: "fake = 0.0000"    ← 100% confident it's fake
G gradient ≈ 0              ← no signal to improve
G is stuck forever
```

### Why it happens

D's job is easier than G's job:
- D just classifies (real or fake) — straightforward
- G has to create entire images from noise — much harder

So D often learns faster and dominates.

### How to spot it

```
Healthy:                        D too strong:

D_loss: ~1.3 (fluctuating)     D_loss: ~0.01 (near zero)
G_loss: ~0.7 (fluctuating)     G_loss: ~7 (stuck high)  
D(real): ~0.7                   D(real): ~0.999
D(fake): ~0.4                   D(fake): ~0.001
Images: improving               Images: stuck, not improving
```

### The math behind it

When D is very confident:

$$L_G = -\log(D(G(z)))$$

If D(G(z)) = 0.0001:

$$L_G = -\log(0.0001) = 9.21 \quad \text{(high loss)}$$

Write D's raw score (logit) for the fake as a, so D(G(z)) = σ(a). Compare the two generator losses:

| Generator loss | Gradient w.r.t. a | At D(G(z)) = 0.0001 |
|---|---|---|
| Minimax: log(1 − D(G(z))) | −σ(a) | **−0.0001** — vanishes |
| Non-saturating (what we train): −log D(G(z)) | σ(a) − 1 | **−0.9999** — still strong |

So with the loss we actually train, G still gets a **strong push** — the problem is the **direction**. A near-perfect D says "fake" to everything G makes, so its gradient carries little information about *where* the real data is. When real and fake barely overlap, the BCE loss stops measuring how far apart they are (Unit 2, L07, shows why: the JS divergence gets stuck at log 2).

High loss, a strong but poorly aimed signal = G keeps moving without getting closer.

### How to fix it

| Fix | How it helps | Code |
|---|---|---|
| **Label smoothing** | Make D less confident | `real_labels = 0.9` instead of `1.0` |
| **Instance noise** | Add noise to images D sees | `real + 0.05 * randn_like(real)` |
| **Lower D learning rate** | Slow D down | `lr_d = 0.0001` |
| **Train D fewer steps** | Give G a chance | Train D once, G once |

---

## 4. Fix 1: Label Smoothing

Instead of telling D that real = 1.0 and fake = 0.0, use softer targets:

```
Without smoothing:  real = 1.0, fake = 0.0    D can be 100% confident
With smoothing:     real = 0.9, fake = 0.0    D is never pushed past 90% on real images
```

### The math

$$L_D = -[y \cdot \log(D(x)) + (1-y) \cdot \log(1 - D(x))]$$

With y = 1.0: D pushes toward 1.0 (100% confident)

With y = 0.9: D pushes toward 0.9 (90% confident max)

**Result:** D's confidence on real images is capped, so it stays a softer, more useful teacher. Smooth **only the real labels** (one-sided smoothing, Salimans et al. 2016): keep fakes at 0.0 — softening the fake target would reward D for calling some fakes slightly real.

### The code

```python
# Without label smoothing
real_labels = torch.ones(batch_size, 1)        # 1.0
fake_labels = torch.zeros(batch_size, 1)       # 0.0

# With one-sided label smoothing (real only)
real_labels = torch.ones(batch_size, 1) * 0.9  # 0.9
fake_labels = torch.zeros(batch_size, 1)       # stays 0.0
```

---

## 5. Fix 2: Instance Noise

Add random noise to the images that D sees. This makes D's job **harder** — like wearing foggy glasses.

```
Without noise:  D sees clear image → easily spots fake
With noise:     D sees noisy image → harder to tell real from fake
```

### The code

```python
# Add noise to real images (make D's job harder)
real_images = real_images + 0.05 * torch.randn_like(real_images)
```

### How much noise?

| Noise level | Effect |
|---|---|
| 0.01 | Almost no effect |
| **0.05** | **Good starting point** |
| 0.1 | Noticeable blur, helps a lot |
| 0.5 | Too much — D can't learn at all |

Some people **decay** the noise over training — start with 0.1, reduce to 0 gradually.

---

## 6. Fix 3: Learning Rate Balance

**The single most important trick.** Keep G and D learning at similar speeds.

```
Balanced:     lr_g = 0.0002, lr_d = 0.0002    → stable
D too fast:   lr_g = 0.0002, lr_d = 0.002     → D dominates, G stuck
G too fast:   lr_g = 0.002,  lr_d = 0.0002    → G cheats, bad quality
```

### The DCGAN recommendation

```python
gen_opt = torch.optim.Adam(gen.parameters(), lr=0.0002, betas=(0.5, 0.999))
dis_opt = torch.optim.Adam(dis.parameters(), lr=0.0002, betas=(0.5, 0.999))
```

### If training is unstable

**First thing to try:** change the balance between the two learning rates. If D dominates, slow it down:

```python
dis_opt = torch.optim.Adam(dis.parameters(), lr=0.0001)   # half of G's
```

The more principled version is **TTUR** (two time-scale update rule, Heusel et al. 2017): give D and G *different* learning rates on purpose — in practice D's is often the **larger** one (e.g. lr_d = 0.0004, lr_g = 0.0001), so D stays a well-trained teacher. Tune by watching samples, not just losses.

---

## 7. Problem 3: Training Oscillates

### What happens

Both networks keep swinging — D gets good, G adapts, D breaks, G breaks:

```
Loss
  |   /\  /\  /\  /\
  |  /  \/  \/  \/  \
  | /                 \
  |/
  +───────────────────→ epochs
       no convergence!
```

Images get better, then worse, then better, then worse.

### How to fix it

| Fix | How |
|---|---|
| **Lower learning rate** | Smaller steps, less swinging |
| **Adam betas=(0.5, 0.999)** | Less momentum, less overshoot |
| **Gradient penalty (WGAN-GP)** | Smoother gradients (covered in L09) |

---

## 8. What Healthy Training Looks Like

```
Healthy:                        Unhealthy:

D_loss                          D_loss
  |                               |
  |  ~~~~~~~~~~~~~~~~~~~~         | \
  |                               |  \__________  ← D too strong
  +──────────────→ epochs         +──────────────→

G_loss                          G_loss
  |                               |
  |  ~~~~~~~~~~~~~~~~~~~~         | ______________  ← G stuck
  |                               |
  +──────────────→ epochs         +──────────────→

Both losses hover around           One dominates,
0.6 - 1.5. Neither wins.          the other is stuck.
```

### Quick diagnostics

| Symptom | Likely cause | First fix |
|---|---|---|
| All outputs look the same | Mode collapse | Increase noise size |
| D_loss → 0, G_loss stays high | D too strong | Label smoothing, lower D lr |
| Losses swing wildly | Unstable training | Lower learning rate |
| Images stop improving | Vanishing gradients | Instance noise, lower D lr |
| Images are blurry | Not using convolutions | Switch to DCGAN |
| Training is very slow | CPU training | Use GPU |

---

## 9. The GAN Training Checklist

Use this for every GAN you train:

```
+──────────────────────────────────────────────────────+
│              GAN TRAINING CHECKLIST                    │
│                                                        │
│  DATA                                                  │
│  [ ] Normalize images to [-1, 1]                       │
│  [ ] Shuffle dataset                                   │
│                                                        │
│  ARCHITECTURE                                          │
│  [ ] G output: Tanh (matches [-1, 1])                  │
│  [ ] G hidden: ReLU                                    │
│  [ ] D hidden: LeakyReLU(0.2)                          │
│  [ ] D output: Sigmoid                                 │
│  [ ] BatchNorm in both (NOT in D's first layer)        │
│  [ ] Mirror architecture: G upsamples, D downsamples   │
│                                                        │
│  TRAINING                                              │
│  [ ] Adam: lr=0.0002, betas=(0.5, 0.999)               │
│  [ ] One-sided label smoothing: real=0.9, fake=0.0     │
│  [ ] Same number of D and G steps (1:1)                │
│  [ ] .detach() fake images when training D             │
│  [ ] Weight init: Normal(0, 0.02)                      │
│                                                        │
│  MONITORING                                            │
│  [ ] Track D_loss and G_loss (neither should → 0)      │
│  [ ] Track D(real) and D(fake) scores                  │
│  [ ] Save generated images every N epochs              │
│  [ ] Check variety (not all outputs the same)          │
│                                                        │
│  IF STUCK                                              │
│  [ ] D too strong? Lower D lr, add label smoothing     │
│  [ ] Mode collapse? Increase noise size                │
│  [ ] Oscillating? Lower both learning rates            │
│  [ ] Blurry? Switch to DCGAN                           │
│  [ ] Still broken? Try WGAN (Lesson 08)                │
│                                                        │
+──────────────────────────────────────────────────────+
```

---

## 10. Summary

### The three failure modes

| Problem | What happens | How to spot | Fix |
|---|---|---|---|
| **Mode collapse** | All outputs look the same | No variety in generated images | Larger noise, train D more |
| **D too strong** | G gets no gradient | D_loss→0, G_loss stays high | Label smoothing, lower D lr, instance noise |
| **Oscillation** | Loss swings wildly | Images get better then worse | Lower lr, less momentum |

### The three main fixes

| Fix | What it does | When to use |
|---|---|---|
| **Label smoothing** | Caps D's confidence at 90% | D too strong |
| **Instance noise** | Makes D's job harder (foggy glasses) | D too strong |
| **LR balance** | Keep G and D learning at same speed | Always important |

### The key insight

> GAN training is a **balancing act**. Neither network should dominate. Monitor both losses, check generated images, and adjust when things go wrong.

---

## Knowledge Check

1. What is mode collapse and how do you spot it?
2. Why is a "too good" Discriminator actually a problem?
3. What is label smoothing and how does it help?
4. What does instance noise do?
5. What does healthy GAN training look like (loss curves)?
6. Name 3 things from the training checklist.
7. What's the first thing to try when training is unstable?

---

## Hands-on

Run `training/unit-1/labs/lab-04-training-tricks.ipynb` — break a GAN on purpose, then fix it.

---

## Next Lesson

These fixes help, but they are band-aids: the **root cause** of many GAN problems is the **BCE loss itself**. Unit 2 starts there — L07 shows why, with a near-perfect D and barely-overlapping real and fake data, BCE stops measuring how far G is from the real data (the JS divergence is stuck at log 2), and L08 introduces **WGAN**, a loss that keeps measuring.
