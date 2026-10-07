# Lesson 11: Controllable Generation

## Where we are

| L10 | **L11** |
|---|---|
| Conditional GAN — "generate a 7" (class-level control) | **Fine-grained control — "make it thicker, more tilted"** |

In L10, we controlled WHAT digit to generate. But what if you want more? "Generate a thick 7." "Make it lean to the right." "Give it a longer tail."

Labels give you **class-level** control (pick a digit). Controllable generation gives you **feature-level** control (pick the style).

---

## 1. The Big Idea: The Latent Space Has Structure

### What is the latent space?

The latent space is the space of all possible noise vectors z. Each point in this space maps to a different image:

```
z = [0.3, -1.2, 0.7, ...]  ──→ G ──→  a thin, straight 7
z = [1.1,  0.5, -0.3, ...] ──→ G ──→  a thick, tilted 3
z = [-0.8, 2.1, 0.1, ...]  ──→ G ──→  a round, small 0
```

### The surprising discovery

A well-trained GAN doesn't just scatter images randomly in latent space. It **organizes** them. Similar images end up near each other:

```
Latent space (2D simplified):

    thick ↑
          |    thick-3    thick-7
          |       ●          ●
          |
          |    thin-3     thin-7
          |       ●          ●
          +────────────────────→ tilted
       straight
```

This means:
- Moving in one direction might make digits **thicker**
- Moving in another direction might make them **more tilted**
- These directions are called **controllable directions**

---

## 2. Latent Space Interpolation

### Walking between two images

The simplest form of control: **interpolate** between two noise vectors.

```python
z1 = torch.randn(1, z_dim)    # noise for image A
z2 = torch.randn(1, z_dim)    # noise for image B

# Walk from A to B in 8 steps
steps = 8
for i in range(steps):
    alpha = i / (steps - 1)                   # 0.0 to 1.0
    z_interp = (1 - alpha) * z1 + alpha * z2  # blend
    image = gen(z_interp, label)
```

The result:

```
Image A ──→ ──→ ──→ ──→ ──→ ──→ ──→ Image B
   smooth gradual transition between the two
```

If the GAN is well-trained, the in-between images all look like real digits — not blurry garbage. This is a sign that the latent space is **smooth** and well-organized.

### Lerp vs slerp: keep z at a typical length

The straight line above (**lerp**) cuts through the middle of the latent space. For z_dim = 64, a random z has length ≈ √64 ≈ 8, but the lerp midpoint of two independent z has length ≈ √32 ≈ 5.6 — a vector G almost never saw in training, so midpoints can look washed out.

**Slerp** (spherical interpolation, White 2016) walks along the arc instead:

$$z_t = \frac{\sin((1-t)\Omega)}{\sin\Omega} z_1 + \frac{\sin(t\Omega)}{\sin\Omega} z_2, \qquad \Omega = \arccos\frac{z_1 \cdot z_2}{\|z_1\|\|z_2\|}$$

| z_dim = 64 (100,000 random pairs) | Value |
|---|---|
| Typical ‖z‖ | ≈ 7.97 |
| Angle Ω between two random z | ≈ 90° ± 7° |
| Lerp midpoint length | ≈ 5.6 |
| Slerp midpoint length | ≈ 8.0 |

```python
def slerp(z1, z2, t):
    omega = torch.acos((z1 * z2).sum() / (z1.norm() * z2.norm()))
    return (torch.sin((1 - t) * omega) * z1 + torch.sin(t * omega) * z2) / torch.sin(omega)
```

### Why this matters

```
Blurry in-between = latent space has "holes" (bad GAN)
Sharp in-between  = latent space is smooth (good GAN)

Interpolation quality = a measure of GAN quality
```

---

## 3. Latent Space Arithmetic

### The word2vec analogy

Remember word embeddings? "King - Man + Woman = Queen"

GANs can do the same thing with images (shown for faces by Radford et al. 2015 in the DCGAN paper — using z vectors **averaged** over several examples, see Section 4):

```
"Thick 7" - "Thin 7" + "Thin 3" = "Thick 3"

In latent space:
  z_thick_7 - z_thin_7 = direction for "thickness"
  z_thin_3 + thickness_direction = z_thick_3
```

### How it works

```
Step 1: Find two images that differ in ONE feature
  z_thick = noise that generates a thick digit
  z_thin  = noise that generates a thin digit

Step 2: Compute the direction
  direction_thick = z_thick - z_thin

Step 3: Apply to any image
  z_any_digit + direction_thick = thicker version of that digit
  z_any_digit - direction_thick = thinner version of that digit
```

### In code

```python
# Find the "thickness" direction
z_thick = ...   # noise vector that produces a thick digit
z_thin  = ...   # noise vector that produces a thin digit
thickness_direction = z_thick - z_thin

# Apply to a new digit
z_new = torch.randn(1, z_dim)
z_thicker = z_new + 0.5 * thickness_direction
z_thinner = z_new - 0.5 * thickness_direction

# Generate
img_normal  = gen(z_new, label)
img_thicker = gen(z_thicker, label)
img_thinner = gen(z_thinner, label)
```

The 0.5 scaling controls **how much** to apply the change. Bigger = more effect.

---

## 4. Finding Controllable Directions (Averaged Method)

### The problem

How do you find z_thick and z_thin? You don't know which noise vectors produce thick vs thin digits in advance.

### Solution: Average over many examples

```
Step 1: Generate LOTS of images
Step 2: Manually (or automatically) sort them by a feature
        e.g., "thick" group vs "thin" group
Step 3: Average the z vectors in each group
Step 4: The difference of averages = the direction

  z_thick_avg = mean of all z that produced thick digits
  z_thin_avg  = mean of all z that produced thin digits
  thickness_direction = z_thick_avg - z_thin_avg
```

### Why averaging works

```
Single example:  z_thick_7 - z_thin_7
  This captures "thick" but also "7-ness", specific stroke style, etc.
  Too much noise from individual samples.

Averaged:  mean(z_thick_all) - mean(z_thin_all)
  Individual quirks cancel out.
  What remains is ONLY the "thickness" direction.
  Much cleaner signal.
```

Think of it like opinion polls — one person's opinion is noisy, but averaging 1000 opinions gives you the real trend.

---

## 5. Using a Classifier to Find Directions

### Automatic feature detection

Instead of sorting images by hand, train a simple classifier on a feature and use it:

```
Step 1: Generate 1000 images with their z vectors
Step 2: Label them by feature (thick/thin, tilted/straight, etc.)
        Can use a simple CNN classifier for this
Step 3: Average z vectors per group
Step 4: Difference = direction
```

### For MNIST: digit-specific features

With a Conditional GAN, we can be smarter. We already have labels. We can find directions WITHIN a class:

```python
# Generate many 7s with different noise
all_z = []
all_images = []
label_7 = torch.full((1,), 7, dtype=torch.long, device=device)

for _ in range(500):
    z = torch.randn(1, z_dim, device=device)
    img = gen(z, label_7)
    all_z.append(z)
    all_images.append(img)

# Now sort by some visual feature
# (we'll do this interactively in the lab)
```

---

## 6. Single-Dimension Exploration

### The simplest approach

Instead of finding meaningful directions, just see what each dimension of z controls:

```python
# Start with a base noise vector
z_base = torch.randn(1, z_dim)

# Vary ONE dimension at a time
for dim in range(z_dim):
    images = []
    for value in [-3, -2, -1, 0, 1, 2, 3]:
        z_modified = z_base.clone()
        z_modified[0, dim] = value     # change only this dimension
        img = gen(z_modified, label)
        images.append(img)
    # Show the row of images — see what this dimension controls
```

Illustrative result — real dimensions are usually **entangled** (one dimension changes several features at once):

```
Dim 0:  [thin] [thin] [medium] [medium] [thick] [thick] [thick]
Dim 1:  [straight] [...] [...] [...] [...] [...] [tilted]
Dim 2:  [short] [...] [...] [...] [...] [...] [tall]
Dim 3:  [no clear pattern — this dim controls something subtle]
...
```

Some dimensions control obvious features, others control subtle combinations. Not every dimension maps to a human-interpretable feature.

---

## 7. Conditional Interpolation

### Morphing between digits

With a cGAN, you can do something fun: keep the noise fixed and interpolate the **label embedding**:

```python
# Interpolate between label embeddings
embed_3 = gen.label_embed(torch.tensor([3], device=device))  # embedding for "3"
embed_7 = gen.label_embed(torch.tensor([7], device=device))  # embedding for "7"

z_fixed = torch.randn(1, z_dim, device=device)

for alpha in [0.0, 0.2, 0.4, 0.6, 0.8, 1.0]:
    embed_mix = (1 - alpha) * embed_3 + alpha * embed_7
    x = torch.cat([z_fixed, embed_mix], dim=1)
    img = gen.model(x)    # bypass forward, feed directly
```

Result:

```
3 ──→ 3ish ──→ something in between ──→ 7ish ──→ 7
      smooth morph from 3 to 7, same style!
```

Note: blending the **embeddings** is the same as blending the **one-hot vectors** first, because the embedding is linear: (1 − α)·onehot(3)·W + α·onehot(7)·W = ((1 − α)·onehot(3) + α·onehot(7))·W.

---

## 8. Noise Truncation (Bonus Trick)

### Trading variety for quality

Random noise is sampled from a normal distribution. Sometimes z values are extreme (far from 0), which can produce weird images.

**Truncation trick (BigGAN):** sample from a *truncated* normal — any value with |z_i| > t is **re-drawn** until it lands inside [−t, t].

```python
# Full range (more variety, some odd images)
z = torch.randn(1, z_dim)

# Truncation: re-sample each out-of-range value
def truncated_noise(n, z_dim, t=1.0):
    z = torch.randn(n, z_dim)
    out = z.abs() > t
    while out.any():
        z[out] = torch.randn(int(out.sum()))
        out = z.abs() > t
    return z
```

| Threshold t | Values re-drawn | Std of z after |
|---|---|---|
| 2.0 | 4.6 % | 0.88 |
| 1.0 | 31.7 % | 0.54 |
| 0.5 | 61.7 % | 0.28 |

**Clamping is not truncation.** `z.clamp(-1, 1)` piles every out-of-range value onto ±1 — about 32 % of all entries at t = 1 — instead of re-drawing them. The lab (`training/unit-2/labs/lab-11-controllable-generation.ipynb`) uses the clamp as a simplification; try swapping in `truncated_noise`. StyleGAN (Unit 3) truncates differently: it pulls w toward its average with a factor ψ.

The tradeoff:

```
No truncation:     high variety, some bad outputs
Mild truncation:   good variety, fewer bad outputs
Heavy truncation:  low variety, very high quality

It's a quality vs diversity slider.
```

This trick is used heavily in BigGAN (re-sampling) and StyleGAN (ψ toward the average w).

---

## 9. Summary

| Concept | What you learned |
|---|---|
| **Latent space structure** | Well-trained GANs organize the latent space — similar images are nearby |
| **Interpolation** | Walk between two z vectors — slerp keeps z at a typical length |
| **Latent arithmetic** | z_thick - z_thin = thickness direction, apply to any image |
| **Averaged directions** | Average z vectors per group for cleaner feature directions |
| **Single-dim exploration** | Vary one z dimension at a time to see what it controls |
| **Conditional interpolation** | Morph between digit classes by blending label embeddings |
| **Truncation trick** | Re-sample |z_i| > t to trade variety for quality (clamping is a cruder cousin) |

---

## Knowledge Check

1. Is the lerp midpoint of two random z a typical z? *(No — for z_dim 64 its length is ≈ 5.6 vs ≈ 8; slerp keeps ≈ 8.)*
2. Why average many z per group instead of one pair? *(A single pair's difference mixes the feature you want with random differences; averaging cancels those.)*
3. You scale a thickness direction by 5.0 instead of 0.5. What happens? *(z leaves the region G was trained on — images break down rather than getting "very thick".)*
4. Does truncation at t = 1 equal `clamp(-1, 1)`? *(No: truncation re-draws ≈ 32 % of values; clamping pins them at ±1.)*
5. What does stronger truncation (smaller t) trade? *(Variety for typical, cleaner samples.)*
6. Blending two label embeddings vs blending their one-hots — any difference? *(None: the embedding is linear, so both give the same vector.)*

---

## Unit 2 Complete!

```
Unit 2 recap:
  L07: Why BCE loss fails (root cause analysis)
  L08: WGAN — Wasserstein distance, Critic, weight clipping
  L09: WGAN-GP — gradient penalty, full Critic capacity
  L10: Conditional GAN — control WHAT to generate
  L11: Controllable Generation — control HOW it looks

You can now build stable, controllable GANs with modern loss functions.
```

**Next: Unit 3 · Evaluate and scale** — starting with L12 *Evaluating GANs*: how do you MEASURE if your GAN is good? Then FID, bias and fairness, and StyleGAN.
