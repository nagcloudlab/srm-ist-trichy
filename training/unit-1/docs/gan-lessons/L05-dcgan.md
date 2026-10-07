# Lesson 05: DCGAN — Deep Convolutional GAN

## Where we are

| L03 | L04 | **L05** |
|---|---|---|
| GAN for images (blurry) | Convolutions crash course | **DCGAN (sharp images!)** |

You know convolutions, transposed convolutions, and BatchNorm. Now let's put them together into a **DCGAN** — the architecture that changed GANs from "cool idea" to "actually works".

**DCGAN = Deep Convolutional Generative Adversarial Network**

Same GAN game (G creates, D judges, they compete). Just better architecture.

---

## 1. What Changes from L03?

| | L03 (Linear GAN) | L05 (DCGAN) |
|---|---|---|
| G layers | `nn.Linear` | `nn.ConvTranspose2d` |
| D layers | `nn.Linear` | `nn.Conv2d` |
| Image format | Flattened to 784 | Kept as 2D (28x28) |
| BatchNorm | No | Yes |
| Spatial awareness | None | **Yes — knows neighbors** |
| Image quality | Blurry | **Sharp** |
| Noise size | 64 | 100 |

**The training loop is identical.** Step A, Step B, .detach(), BCE loss — nothing changes. Only the network architecture is different.

---

## 2. The DCGAN Generator

### The idea

Start with noise, reshape to a tiny image, then **grow** it using ConvTranspose2d:

```
noise (100 numbers)
    |
  Linear → reshape to 256 channels × 7 × 7    (tiny feature map)
    |
  ConvTranspose2d(stride=2) → 128 × 14 × 14   (doubled!)
    |
  ConvTranspose2d(stride=2) → 1 × 28 × 28     (doubled again = full image!)
```

### The code

```python
class DCGenerator(nn.Module):
    def __init__(self):
        super().__init__()
        self.net = nn.Sequential(
            # Step 1: noise (100) → flat vector → reshape to 256×7×7
            nn.Linear(100, 256 * 7 * 7),
            nn.ReLU(),
            nn.Unflatten(1, (256, 7, 7)),      # reshape: flat → 3D

            # Step 2: 256×7×7 → 128×14×14 (upsample)
            nn.ConvTranspose2d(256, 128, kernel_size=4, stride=2, padding=1),
            nn.BatchNorm2d(128),
            nn.ReLU(),

            # Step 3: 128×14×14 → 1×28×28 (upsample to final image)
            nn.ConvTranspose2d(128, 1, kernel_size=4, stride=2, padding=1),
            nn.Tanh()                          # pixels in [-1, 1]
        )

    def forward(self, z):
        return self.net(z)
```

### Trace the shapes step by step

```
Input:   noise                  shape: [batch, 100]

Step 1a: Linear(100 → 12544)   shape: [batch, 12544]
         12544 = 256 × 7 × 7

Step 1b: Unflatten             shape: [batch, 256, 7, 7]
         reshape flat vector into 3D feature map

Step 2:  ConvTranspose2d       shape: [batch, 128, 14, 14]
         256→128 channels, 7→14 spatial (doubled!)
         + BatchNorm (stabilize values)
         + ReLU (activation)

Step 3:  ConvTranspose2d       shape: [batch, 1, 28, 28]
         128→1 channel, 14→28 spatial (doubled!)
         + Tanh (pixels in [-1, 1])

Output:  fake image             shape: [batch, 1, 28, 28]
```

### Size calculation at each step

$$\text{ConvTranspose2d output} = (\text{input} - 1) \times \text{stride} - 2 \times \text{padding} + \text{kernel}$$

**Step 2:** $(7 - 1) \times 2 - 2 \times 1 + 4 = 12 - 2 + 4 = 14$ ✓

**Step 3:** $(14 - 1) \times 2 - 2 \times 1 + 4 = 26 - 2 + 4 = 28$ ✓

### Why each component

| Component | Why |
|---|---|
| `Linear(100, 256*7*7)` | Convert noise to a flat vector big enough to reshape |
| `Unflatten(1, (256,7,7))` | Reshape flat → 3D so ConvTranspose2d can work on it |
| `ConvTranspose2d(stride=2)` | Doubles spatial size (7→14, 14→28) |
| `BatchNorm2d` | Keeps values stable between layers |
| `ReLU` | Standard activation for G hidden layers |
| `Tanh` | Output pixels in [-1, 1] (matches data range) |

---

## 3. The DCGAN Discriminator

### The idea

The opposite of G — take a full image and **shrink** it using Conv2d until you reach a single answer:

```
image (1 × 28 × 28)
    |
  Conv2d(stride=2) → 64 × 14 × 14     (halved!)
    |
  Conv2d(stride=2) → 128 × 7 × 7      (halved again!)
    |
  Flatten → Linear → Sigmoid → probability (real or fake)
```

### The code

```python
class DCDiscriminator(nn.Module):
    def __init__(self):
        super().__init__()
        self.net = nn.Sequential(
            # Step 1: 1×28×28 → 64×14×14 (downsample)
            nn.Conv2d(1, 64, kernel_size=4, stride=2, padding=1),
            nn.LeakyReLU(0.2),
            # NOTE: No BatchNorm in first layer (DCGAN rule)

            # Step 2: 64×14×14 → 128×7×7 (downsample)
            nn.Conv2d(64, 128, kernel_size=4, stride=2, padding=1),
            nn.BatchNorm2d(128),
            nn.LeakyReLU(0.2),

            # Step 3: flatten and classify
            nn.Flatten(),
            nn.Linear(128 * 7 * 7, 1),
            nn.Sigmoid()                       # probability: 0 to 1
        )

    def forward(self, img):
        return self.net(img)
```

### Trace the shapes step by step

```
Input:   image                  shape: [batch, 1, 28, 28]

Step 1:  Conv2d                 shape: [batch, 64, 14, 14]
         1→64 channels, 28→14 spatial (halved!)
         + LeakyReLU (keeps gradients alive)
         NO BatchNorm here (DCGAN rule — see raw pixels)

Step 2:  Conv2d                 shape: [batch, 128, 7, 7]
         64→128 channels, 14→7 spatial (halved!)
         + BatchNorm (stabilize)
         + LeakyReLU

Step 3a: Flatten                shape: [batch, 6272]
         128 × 7 × 7 = 6272

Step 3b: Linear(6272 → 1)      shape: [batch, 1]
         + Sigmoid (probability 0-1)

Output:  probability            shape: [batch, 1]
```

### Size calculation

$$\text{Conv2d output} = \left\lfloor \frac{\text{input} - \text{kernel} + 2 \times \text{padding}}{\text{stride}} \right\rfloor + 1$$

**Step 1:** $\frac{28 - 4 + 2}{2} + 1 = 14$ ✓

**Step 2:** $\frac{14 - 4 + 2}{2} + 1 = 7$ ✓

### Why each component

| Component | Why |
|---|---|
| `Conv2d(stride=2)` | Halves spatial size (28→14, 14→7) while detecting patterns |
| `LeakyReLU(0.2)` | Keeps 20% of negatives alive — D needs all gradients |
| `BatchNorm2d` | Stabilizes training (but NOT in first layer) |
| `Flatten` | Convert 3D feature map to 1D for Linear layer |
| `Linear(6272, 1)` | Final decision: one number |
| `Sigmoid` | Squash to probability [0, 1] |

---

## 4. G and D Side by Side — The Mirror

```
GENERATOR (noise → image):              DISCRIMINATOR (image → answer):

noise (100)                              image (1 × 28 × 28)
    |                                        |
Linear + Unflatten → 256×7×7            Conv2d(stride=2) → 64×14×14
    |                                        + LeakyReLU
ConvT(stride=2) → 128×14×14             Conv2d(stride=2) → 128×7×7
    + BatchNorm + ReLU                       + BatchNorm + LeakyReLU
    |                                        |
ConvT(stride=2) → 1×28×28               Flatten → Linear → Sigmoid
    + Tanh                                   |
    |                                    probability (0-1)
fake image (1 × 28 × 28)

EXPANDS: 7→14→28                        SHRINKS: 28→14→7
Uses ConvTranspose2d                     Uses Conv2d
Uses ReLU                               Uses LeakyReLU
Ends with Tanh [-1,1]                   Ends with Sigmoid [0,1]
```

They're exact mirrors. G builds up, D breaks down.

---

## 5. Weight Initialization

The DCGAN paper found that initializing weights from a normal distribution with mean=0, std=0.02 works best:

```python
def weights_init(m):
    classname = m.__class__.__name__
    if 'Conv' in classname:
        nn.init.normal_(m.weight.data, 0.0, 0.02)
    elif 'BatchNorm' in classname:
        nn.init.normal_(m.weight.data, 1.0, 0.02)
        nn.init.constant_(m.bias.data, 0)
    elif 'Linear' in classname:
        nn.init.normal_(m.weight.data, 0.0, 0.02)

gen = DCGenerator()
dis = DCDiscriminator()
gen.apply(weights_init)     # apply to all layers in G
dis.apply(weights_init)     # apply to all layers in D
```

### Why does initialization matter?

```
Bad initialization:   weights are too large or too small
                      → first outputs are extreme
                      → gradients explode or vanish
                      → training fails from the start

Good initialization:  weights are in a reasonable range (std=0.02)
                      → first outputs are moderate
                      → gradients flow normally
                      → training starts smoothly
```

$$W \sim \mathcal{N}(0, 0.02)$$

Each weight is drawn from a normal distribution with mean 0 and standard deviation 0.02.

---

## 6. The DCGAN Training Settings

The original paper tested many combinations and found these work best:

| Setting | Value | Why |
|---|---|---|
| Optimizer | Adam | Adapts learning rate per weight |
| Learning rate | 0.0002 | Small enough for stable training |
| Adam betas | (0.5, 0.999) | Lower momentum (0.5 vs default 0.9) for GANs |
| Batch size | 128 in the paper (64 in our lab) | Good balance of speed and stability |
| Noise size | 100 | Enough variety in outputs |

```python
gen_opt = torch.optim.Adam(gen.parameters(), lr=0.0002, betas=(0.5, 0.999))
dis_opt = torch.optim.Adam(dis.parameters(), lr=0.0002, betas=(0.5, 0.999))
```

### Why betas=(0.5, 0.999)?

Adam has two momentum values (beta1, beta2):
- **beta1** controls how much past gradients influence current step
- Default is 0.9, but GANs work better with **0.5** (less momentum)
- Why? GAN training changes direction a lot — too much momentum overshoots

---

## 7. The Training Loop

**Identical to L03!** Only difference: images stay as 2D (no flattening needed).

```python
loss_fn = nn.BCELoss()

for epoch in range(1, 21):
    for real_images, _ in dataloader:
        batch_size = real_images.size(0)
        real_labels = torch.ones(batch_size, 1)
        fake_labels = torch.zeros(batch_size, 1)

        # ====== Step A: Train D ======
        real_pred = dis(real_images)                    # D judges real (no flatten!)
        loss_real = loss_fn(real_pred, real_labels)

        noise = torch.randn(batch_size, 100)
        fake_images = gen(noise).detach()               # G makes fakes
        fake_pred = dis(fake_images)                    # D judges fakes
        loss_fake = loss_fn(fake_pred, fake_labels)

        dis_loss = loss_real + loss_fake
        dis_opt.zero_grad()
        dis_loss.backward()
        dis_opt.step()

        # ====== Step B: Train G ======
        noise = torch.randn(batch_size, 100)
        fake_images = gen(noise)                        # no detach
        fake_pred = dis(fake_images)
        gen_loss = loss_fn(fake_pred, real_labels)       # G wants D to say "real"

        gen_opt.zero_grad()
        gen_loss.backward()
        gen_opt.step()
```

### What's different from L03?

| L03 (Linear GAN) | L05 (DCGAN) |
|---|---|
| `real_images.view(batch, -1)` | `real_images` (no flattening!) |
| Images flattened to 784 | Images stay as [1, 28, 28] |
| G outputs [batch, 784] | G outputs [batch, 1, 28, 28] |
| `noise = randn(batch, 64)` | `noise = randn(batch, 100)` |

Everything else — Step A, Step B, .detach(), BCE, two optimizers — is **exactly the same**.

---

## 8. DCGAN vs Linear GAN — The Results

```
Linear GAN (L03):                DCGAN (L05):

┌──────────┐ ┌──────────┐      ┌──────────┐ ┌──────────┐
│ ░░▒▒░░░░ │ │ ░▒▒░░▒░░ │      │  ██████  │ │    ██    │
│ ░▒▒▒▒▒░░ │ │ ░▒▒▒▒░░░ │      │ █      █ │ │   ███    │
│ ░░▒▒▒░░░ │ │ ░░▒▒▒░░░ │      │ █      █ │ │     █    │
│ ░░░▒▒░░░ │ │ ░░▒▒░░░░ │      │  ██████  │ │     █    │
└──────────┘ └──────────┘      └──────────┘ └──────────┘
    blurry       blurry              sharp        sharp
```

Why the massive improvement?

| Linear GAN | DCGAN |
|---|---|
| No notion of neighbouring pixels, no weight sharing | Filters see nearby pixels together and are shared everywhere |
| No spatial structure | **Understands spatial structure** |
| Flat connections (64→256→512→784) | Filter-based (4×4 kernels) |
| G 550,416 · D 533,505 params | G ≈ 1,793,665 (more — 71% in the first Linear) · D 138,817 (fewer) — the win is structure, not size |

---

## 9. The Complete DCGAN Rules

From the original 2015 paper by Radford, Metz & Chintala:

| Rule | Component | Why |
|---|---|---|
| ConvTranspose2d in G | Learnable upsampling | Better than fixed upsampling |
| Conv2d in D | Learnable downsampling | Better than pooling layers |
| BatchNorm in both | Stabilize training | Prevents value explosion |
| No BatchNorm in D's first layer | D sees raw pixels | Not normalized version |
| No BatchNorm in G's last layer | Tanh controls output range | Don't interfere |
| ReLU in G (hidden) | Standard for generation | Works well |
| LeakyReLU(0.2) in D | Avoids dead neurons | D needs all gradients |
| Tanh for G output | Matches [-1, 1] data | Range matching |
| Sigmoid for D output | Probability output | 0=fake, 1=real |
| Adam(lr=0.0002, betas=(0.5,0.999)) | Stable optimization | Found by testing |
| Weight init: N(0, 0.02) | Good starting point | Smooth start |
| No fully connected layers (mostly) | Keep spatial structure | Except G's first reshape |

---

## 10. Summary

| Concept | What it means |
|---|---|
| DCGAN | GAN with Conv layers instead of Linear |
| ConvTranspose2d in G | Grows image: 7→14→28 |
| Conv2d in D | Shrinks image: 28→14→7 |
| BatchNorm | Stabilizes values between layers |
| Weight init N(0, 0.02) | Good starting weights |
| betas=(0.5, 0.999) | Less momentum for GAN stability |
| No flatten needed | Images stay as 2D throughout |
| Mirror architecture | G expands, D compresses |
| Same training loop | Step A, Step B, .detach(), BCE — unchanged |
| Sharp images | Conv layers understand spatial structure |

### The journey so far

```
L02: GAN for 1 number     → works (trivial task)
L03: Linear GAN for images → works but blurry (no spatial awareness)
L04: Learn convolutions     → understand the tools
L05: DCGAN for images       → sharp images! (spatial awareness)
```

---

## Knowledge Check

1. What does DCGAN stand for?
2. Why are DCGAN images sharper than Linear GAN?
3. What does ConvTranspose2d do and which network uses it?
4. Why is there no BatchNorm in D's first layer?
5. Why does DCGAN use betas=(0.5, 0.999) instead of default?
6. What's the noise size in DCGAN and why bigger than L03?
7. What changed in the training loop compared to L03?
8. What does `nn.Unflatten(1, (256, 7, 7))` do?

---

## Hands-on

Run `training/unit-1/labs/lab-03-dcgan.ipynb` — DCGAN vs the Linear GAN.

---

## Next Lesson

DCGAN produces sharp images, but GAN training can still go wrong. L06 covers **what breaks** (mode collapse, a too-strong D, oscillation) and **how to patch it** (one-sided label smoothing, instance noise, learning-rate balance).
