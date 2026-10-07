# Lesson 19: CycleGAN — Unpaired Image Translation

## Where we are

| Unit 4 · L17 (Pix2Pix) | **Unit 5 · L19 (CycleGAN)** |
|---|---|
| Paired translation: need matching input↔output pairs | **Unpaired: just two collections of images, no pairs needed** |

Pix2Pix is powerful, but it needs paired data — every input must have an exact matching output. That's expensive and often impossible to get.

What if you just have a pile of horse photos and a pile of zebra photos? No horse matches any specific zebra. Can you still learn to translate between them?

**CycleGAN** (Zhu et al., ICCV 2017) **says yes.** And the trick is beautiful.

Notation: there is no target image y for a given x any more. x and y are just images from the two domains; the paper calls the generators G: X→Y and F: Y→X (our G_AB and G_BA).

---

## 1. The Unpaired Problem

### What we have

```
Domain A (horses):     Domain B (zebras):
  horse_1.jpg            zebra_1.jpg
  horse_2.jpg            zebra_2.jpg
  horse_3.jpg            zebra_3.jpg
  ...                    ...

NO pairing between them.
horse_1 has nothing to do with zebra_1.
They're just two separate collections.
```

### Why Pix2Pix can't help

```
Pix2Pix training:
  G(horse_1) should look like ???

  There's no target! We don't have
  "what horse_1 would look like as a zebra."

  Without a target, we can't compute L1 loss.
  Without L1 loss, the Generator has no guidance
  on WHAT to produce — just that it should look "real."
```

### The core challenge

```
If we just train:
  G_A→B: takes horse → produces something that fools D_B (looks like zebra)

What could go wrong?
  G might learn: "ignore the input entirely, just generate any random zebra"

  Input: photo of a horse running in a field
  Output: a zebra standing in a zoo

  D_B says "looks like a real zebra!" ✓
  But the CONTENT is completely wrong.
  The pose, background, composition — all lost.
```

The Generator needs a reason to **preserve the content** of the input while changing only the style/domain.

---

## 2. The Cycle Consistency Trick

### The key insight

If we translate a horse to a zebra, and then translate it BACK to a horse, we should get the original horse back:

```
horse → G_A→B → zebra → G_B→A → reconstructed horse
                                       ↓
                              Should match original horse!
```

### Two generators, two discriminators

```
G_AB: translates A → B  (horse → zebra)
G_BA: translates B → A  (zebra → horse)
D_A:  "is this a real horse?"
D_B:  "is this a real zebra?"
```

### The cycle

```
FORWARD CYCLE:
  real_horse → G_AB → fake_zebra → G_BA → reconstructed_horse

  Loss: |reconstructed_horse - real_horse|
  "If I turn a horse into a zebra and back, I should get the same horse"

BACKWARD CYCLE:
  real_zebra → G_BA → fake_horse → G_AB → reconstructed_zebra

  Loss: |reconstructed_zebra - real_zebra|
  "If I turn a zebra into a horse and back, I should get the same zebra"
```

### Why this works

```
Without cycle consistency:
  G_AB could map ALL horses to the same zebra.
  Content is destroyed — no way to recover the original.

With cycle consistency:
  G_BA must be able to UNDO what G_AB did.
  This is only possible if G_AB PRESERVES content.

  If G_AB changes the pose, background, or shape,
  G_BA can't recover the original → cycle loss goes up.

  So G_AB learns to ONLY change what's necessary:
    Horse texture → zebra stripes
    Horse color → zebra color
    Everything else stays the same.
```

```
Analogy:
  English → French → English

  If the French translation is bad (wrong meaning),
  translating back to English won't give the original sentence.

  Cycle consistency forces BOTH translators to preserve meaning.
```

---

## 3. The Full CycleGAN Loss

### Four losses combined

```
1. GAN LOSS (A→B):
   G_AB should fool D_B
   "fake zebras should look like real zebras"

2. GAN LOSS (B→A):
   G_BA should fool D_A
   "fake horses should look like real horses"

3. CYCLE CONSISTENCY LOSS (forward):
   |G_BA(G_AB(horse)) - horse|
   "horse→zebra→horse should return the original horse"

4. CYCLE CONSISTENCY LOSS (backward):
   |G_AB(G_BA(zebra)) - zebra|
   "zebra→horse→zebra should return the original zebra"
```

### In formulas

```
L_total = L_GAN(G_AB, D_B)          ← A→B looks real
        + L_GAN(G_BA, D_A)          ← B→A looks real
        + λ_cyc * L_cycle           ← round-trip reconstruction
        + λ_id  * L_identity        ← (optional) identity preservation

Where:
  L_cycle = |G_BA(G_AB(a)) - a| + |G_AB(G_BA(b)) - b|
  λ_cyc = 10 (cycle loss weight)
  λ_id  = 0.5 · λ_cyc = 5 (optional; used e.g. for photo ↔ painting)
```

Worked example (one generator step, LSGAN):
D_B(G_AB(a)) = 0.6 → (0.6 − 1)² = 0.16; D_A(G_BA(b)) = 0.3 → 0.49;
cycle L1 = 0.05 + 0.07 → 10 × 0.12 = 1.20; identity L1 = 0.04 + 0.06 → 5 × 0.10 = 0.50;
L_G = 0.16 + 0.49 + 1.20 + 0.50 = 2.35. The cycle term carries the most weight.

### In code

```python
# Given: real_A (horse), real_B (zebra)

# --- Generate ---
fake_B = G_AB(real_A)    # horse → fake zebra
fake_A = G_BA(real_B)    # zebra → fake horse

# --- Cycle ---
rec_A = G_BA(fake_B)     # fake zebra → reconstructed horse
rec_B = G_AB(fake_A)     # fake horse → reconstructed zebra

# --- Losses ---
# GAN losses
loss_GAN_AB = mse(D_B(fake_B), ones)   # fake zebra fools D_B
loss_GAN_BA = mse(D_A(fake_A), ones)   # fake horse fools D_A

# Cycle losses
loss_cycle_A = L1(rec_A, real_A)   # horse→zebra→horse ≈ horse
loss_cycle_B = L1(rec_B, real_B)   # zebra→horse→zebra ≈ zebra
loss_cycle = loss_cycle_A + loss_cycle_B

# Total Generator loss
loss_G = loss_GAN_AB + loss_GAN_BA + 10 * loss_cycle
```

---

## 4. Identity Loss (Optional but Helpful)

### The extra regularization

```
If you give G_AB a ZEBRA (instead of a horse),
it should do NOTHING — the input is already in domain B.

Identity loss:
  L_identity = |G_AB(real_B) - real_B| + |G_BA(real_A) - real_A|

"If the input is already in the target domain, don't change it."
```

```python
# Identity loss
id_B = G_AB(real_B)   # zebra through horse→zebra generator
id_A = G_BA(real_A)   # horse through zebra→horse generator

loss_id = L1(id_B, real_B) + L1(id_A, real_A)

# Updated total
loss_G = loss_GAN_AB + loss_GAN_BA + 10 * loss_cycle + 5 * loss_id
```

```
Why identity loss helps:
  Without it: G_AB might change colors even when input is already a zebra
  With it: G_AB learns "if it already has stripes, leave it alone"

  Especially important for color preservation.
  Without identity loss, a sunset horse might become a green-tinted zebra.
  With identity loss, the color palette is better preserved.
```

---

## 5. CycleGAN Architecture

### Generator: ResNet-based (not U-Net)

CycleGAN uses a **ResNet** generator instead of U-Net. Why?

```
U-Net (Pix2Pix):
  - Skip connections pass spatial info directly
  - Great when input and output are ALIGNED (edges → photo)
  - The input structure should map directly to output structure

ResNet (CycleGAN):
  - Residual blocks transform features without changing spatial size
  - Better when the transformation is more about STYLE than STRUCTURE
  - Horse and zebra have the same shape — just different texture
  - The generator learns: output = input + changes
```

### ResNet Generator structure

```
Input (3, 256, 256)
  ↓
Downsample (3 conv layers):
  (3, 256, 256) → (64, 128, 128) → (128, 64, 64) → (256, 64, 64)
  ↓
6 or 9 Residual Blocks (at 64x64):
  Each: conv → norm → relu → conv → norm + skip
  The feature maps stay at 256 x 64 x 64
  All the "translation work" happens here
  ↓
Upsample (3 conv layers):
  (256, 64, 64) → (128, 128, 128) → (64, 256, 256) → (3, 256, 256)
  ↓
Output (3, 256, 256)
```

### Residual block

```python
class ResidualBlock(nn.Module):
    def __init__(self, channels):
        super().__init__()
        self.block = nn.Sequential(
            nn.Conv2d(channels, channels, 3, padding=1, bias=False),
            nn.InstanceNorm2d(channels),
            nn.ReLU(inplace=True),
            nn.Conv2d(channels, channels, 3, padding=1, bias=False),
            nn.InstanceNorm2d(channels),
        )

    def forward(self, x):
        return x + self.block(x)  # skip connection!
```

```
The residual skip connection means:
  output = input + learned_changes

The generator only needs to learn the DIFFERENCE
between a horse and a zebra — not the entire image from scratch.

For horse → zebra:
  The difference is mostly: add stripes, change color
  Everything else (pose, background, shape) passes through unchanged.
```

### Why InstanceNorm (not BatchNorm)?

```
BatchNorm: normalize across the BATCH
  "What's the average brightness of all 16 horses in this batch?"
  Problem: each image should be treated independently
  A dark horse and a bright horse shouldn't normalize together

InstanceNorm: normalize each IMAGE separately
  "Normalize THIS horse's features independently"
  Better for style transfer — each image has its own style

InstanceNorm was introduced for fast style transfer
(Ulyanov et al., 2016); the L09 lab critic used it too.
```

---

## 6. Discriminator: PatchGAN (Again!)

CycleGAN uses the same 70x70 PatchGAN from Pix2Pix:

```
Two discriminators:
  D_A: "Is this a real horse?" (grid of scores)
  D_B: "Is this a real zebra?" (grid of scores)

Key difference from Pix2Pix:
  Pix2Pix D sees: input + output (concatenated)
  CycleGAN D sees: output ONLY

  Why? Because there's no paired input to condition on!
  D just judges: "does this look like a real zebra?"
```

### LSGAN loss (not BCE)

CycleGAN uses **Least Squares GAN** loss instead of BCE:

```
BCE loss:
  D_real: -log(D(x))
  D_fake: -log(1 - D(G(z)))

LSGAN loss:
  D_real: (D(x) - 1)²
  D_fake: (D(G(z)))²
  G:      (D(G(z)) - 1)²
```

```python
# LSGAN Discriminator loss
loss_D_real = torch.mean((D(real) - 1) ** 2)
loss_D_fake = torch.mean(D(fake) ** 2)
loss_D = (loss_D_real + loss_D_fake) / 2

# LSGAN Generator loss
loss_G = torch.mean((D(fake) - 1) ** 2)
```

```
Why LSGAN?
  - More stable training than BCE
  - Still penalizes fakes that are on the correct side of the
    boundary but far from the real data (Mao et al., 2017)
  - Smoother gradients → smoother images
  - Simple to implement
```

---

## 7. Training Tricks

### Replay buffer

```
Problem:
  If D only sees the LATEST fake images from G,
  it forgets about older fakes. G can then "revert"
  to producing images similar to old ones that D no longer detects.

Solution: keep a buffer of 50 recently generated images.
  When training D, randomly replace some current fakes
  with older ones from the buffer.
```

```python
class ReplayBuffer:
    def __init__(self, max_size=50):
        self.max_size = max_size
        self.buffer = []

    def push_and_pop(self, images):
        result = []
        for img in images:
            if len(self.buffer) < self.max_size:
                self.buffer.append(img)
                result.append(img)
            elif torch.rand(1).item() > 0.5:
                # Replace random old image with new one
                idx = torch.randint(0, self.max_size, (1,)).item()
                old = self.buffer[idx].clone()
                self.buffer[idx] = img
                result.append(old)   # return old image to D
            else:
                result.append(img)   # return new image to D
        return torch.stack(result)
```

### Learning rate schedule

```
CycleGAN training schedule:
  - Epochs 1-100: constant lr = 2e-4
  - Epochs 101-200: linearly decay lr to 0

This gives the network time to learn, then fine-tune.
```

---

## 8. The Full CycleGAN Recipe

```
Architecture:
  G_AB, G_BA: ResNet generators (9 residual blocks for 256x256)
  D_A, D_B:   70x70 PatchGAN discriminators

Losses:
  GAN:      LSGAN (least squares)
  Cycle:    L1, weight = 10
  Identity: L1, weight = 5

Training:
  Optimizer: Adam(lr=2e-4, betas=(0.5, 0.999))
  Batch size: 1
  Epochs: 200 (linear lr decay after epoch 100)
  Replay buffer: 50 images per discriminator
  InstanceNorm everywhere (not BatchNorm)

Images: 256x256, random crop from 286x286, random flip
```

---

## 9. CycleGAN Applications

```
STYLE TRANSFER:
  Photo → Monet painting
  Photo → Van Gogh painting
  Photo → Ukiyo-e (Japanese woodblock)

ANIMAL TRANSLATION:
  Horse → Zebra
  Cat → Dog (harder — shape changes required)

SEASON TRANSFER:
  Summer → Winter
  Day → Night

DOMAIN ADAPTATION:
  Simulated → Real (sim2real for robotics)
  Synthetic → Real (for training data)

MEDICAL:
  CT scan → MRI (cross-modality translation)
  Stained tissue → differently stained tissue
```

### Limitations

```
CycleGAN struggles with:
  1. SHAPE CHANGES
     Horse → zebra works (same shape, different texture)
     Cat → dog fails (different body proportions)

  2. GEOMETRIC TRANSFORMATIONS
     Can't rotate, resize, or restructure objects
     Only texture/color/style changes

  3. LARGE DOMAIN GAPS
     Photo → abstract art (too different)
     The cycle consistency assumes content is shared

  4. MODE COLLAPSE
     May learn to add/remove the same pattern everywhere
     "Put stripes on everything" instead of context-aware changes
```

---

## 10. CycleGAN vs Pix2Pix: When to Use Which

```
                    Pix2Pix                 CycleGAN
─────────────────────────────────────────────────────
Data needed:        Paired                  Unpaired
Supervision:        Strong (exact target)   Weak (domain only)
Quality:            Higher                  Lower
Structure:          Preserved via L1+skip   Preserved via cycle
Generator:          U-Net                   ResNet
D input:            input + output          output only
Best for:           edges→photo             horse→zebra
                    segmentation→photo      summer→winter
                    map→satellite           photo→painting
```

```
Rule of thumb:
  Have paired data?  → Use Pix2Pix (better quality)
  No paired data?    → Use CycleGAN (only option)
  Can create pairs?  → Create them and use Pix2Pix
```

---

## 11. Summary

| Concept | What you learned |
|---|---|
| **Unpaired translation** | Two collections, no matching pairs needed |
| **The problem** | Without pairs, G can ignore the input entirely |
| **Cycle consistency** | A→B→A should reconstruct A (and B→A→B should reconstruct B) |
| **Why it works** | G must preserve content to enable round-trip reconstruction |
| **Identity loss** | G(already_in_target) should do nothing — preserves colors |
| **ResNet generator** | Residual blocks learn output = input + changes |
| **InstanceNorm** | Normalize per-image (not per-batch) — better for style |
| **LSGAN** | Least squares loss — more stable than BCE |
| **Replay buffer** | Show D old fakes to prevent forgetting |
| **Limitations** | Can't do shape changes, only texture/color/style |

---

## Knowledge Check

1. Why can't Pix2Pix work with unpaired data?
2. Explain cycle consistency in one sentence. Why does it preserve content?
3. What are the four losses in CycleGAN? What does each one enforce?
4. Why does CycleGAN use ResNet generators instead of U-Net?
5. What's the identity loss and when does it help?
6. Why LSGAN instead of BCE? (One key advantage.)
7. What's the replay buffer and what problem does it solve?
8. Give an example where CycleGAN would fail and explain why.

---

## Next Lesson

L20: **Satellite to Map + Course Wrap-up** — apply everything we've learned to a real image translation task, then review the entire GAN journey from L01 to L20.
