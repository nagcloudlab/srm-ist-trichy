# Lesson 10: Conditional GAN

## Where we are

| L07–L09 | **L10** |
|---|---|
| Fixed the loss (Why BCE fails → WGAN → WGAN-GP) | **Control WHAT the GAN generates** |

So far, our GANs generate **random** digits. You press "generate" and get... whatever the Generator feels like making. Maybe a 3, maybe a 9, who knows.

What if you could say: **"Generate a 7"**? That's what Conditional GAN (cGAN) does.

**Paper:** Mirza & Osindero, 2014 — "Conditional Generative Adversarial Nets"

---

## 1. The Problem

### Our GANs so far

```
Input:  noise z = [0.3, -1.2, 0.7, ...]
Output: some digit (no control over which one)

      noise ──→ [ Generator ] ──→ ???
                                   ↑
                              could be anything
```

### What we want

```
Input:  noise z + label "7"
Output: the digit 7

      noise ──→ [ Generator ] ──→ 7
      label 7 ──↗
```

The label acts like a **steering wheel**. The noise controls the style (thick, thin, tilted), the label controls WHAT digit appears.

---

## 2. The Core Idea: Feed the Label to Both Networks

### Standard GAN

```
Generator:      z          ──→ G ──→ fake image
Discriminator:  image      ──→ D ──→ real/fake?
```

### Conditional GAN

```
Generator:      z + label  ──→ G ──→ fake image
Discriminator:  image + label ──→ D ──→ real/fake?
                      ↑
               "Does this image match this label?"
```

Both G and D receive the label. This is crucial:

```
G gets the label:  "Generate something that looks like a 7"
D gets the label:  "Does this image actually look like a 7?"

If G generates a perfect 3 but the label says 7:
  D says: "Great image, WRONG digit. Fake."

G must learn to generate the RIGHT digit, not just any digit.
```

---

## 3. How to Feed Labels into a Neural Network

### The problem

Labels are integers: 0, 1, 2, ..., 9. Neural networks work with tensors. How do we combine a label with noise (for G) or with an image (for D)?

### Solution: Embedding + Concatenation

**Step 1: Turn the label into a vector (embedding)**

```
Label "7"  →  nn.Embedding  →  [0.3, -0.8, 1.2, 0.1, ..., -0.5]
                                 ↑
                          learned vector of size embed_dim
```

`nn.Embedding` is a lookup table. Each class gets its own learnable vector — mathematically, **e(y) = onehot(y) · W**, i.e. picking row y of a learnable matrix W:

```
Toy: 4 classes, embed_dim 3
W = [[ 0.1, -0.3,  0.7],     ← row 0
     [ 0.4,  0.0, -0.2],     ← row 1
     [-0.5,  0.9,  0.2],     ← row 2
     [ 0.3,  0.6, -0.8]]     ← row 3

onehot(2) = [0, 0, 1, 0]  →  onehot(2) · W = [-0.5, 0.9, 0.2] = row 2
```

In PyTorch:

```python
embed = nn.Embedding(num_classes=10, embedding_dim=50)

# Label 7 → look up row 7 → get a 50-dim vector
label_vector = embed(torch.tensor([7]))
# shape: (1, 50)
```

**Step 2: Concatenate with the input**

For the Generator — concatenate label vector with noise:

```
noise:        [z1, z2, z3, ..., z64]         # 64 dims
label embed:  [e1, e2, e3, ..., e50]         # 50 dims
concat:       [z1, z2, ..., z64, e1, ..., e50]  # 114 dims
              ──────────────────────────────
              This goes into the Generator
```

For the Discriminator — we have an image (2D), not a 1D vector. We need a different trick.

---

## 4. Feeding Labels to the Discriminator

### The label-as-channel trick

Images have channels (MNIST: 1 channel for grayscale). We can add the label as an **extra channel**:

```
Original image:  1 x 28 x 28   (grayscale)

Label "7" → expand to a full 28x28 grid filled with the embedding:

Label channel:   1 x 28 x 28   (every pixel = some label info)

Concatenate:     2 x 28 x 28   (image + label)
                 ↑
          First channel: the actual image
          Second channel: "this should be a 7"
```

### Simple version: one-hot as channels

An even simpler approach — turn the label into a **one-hot vector**, then expand each element to a full image-sized channel:

```
Label 7, 10 classes → one-hot: [0,0,0,0,0,0,0,1,0,0]

Expand each value to a 28x28 grid:
  Channel 0: all 0s (28x28)
  Channel 1: all 0s (28x28)
  ...
  Channel 7: all 1s (28x28)  ← "this is class 7"
  ...
  Channel 9: all 0s (28x28)

Result: 10 x 28 x 28

Concatenate with image (1 x 28 x 28):
  Input to D: 11 x 28 x 28
              ↑
       1 image channel + 10 label channels
```

This is the approach we'll use. It's simple, effective, and easy to implement.

---

## 5. The Architecture

### Generator

```
Input:  noise (z_dim) + label embedding (embed_dim)
        ────────────────────────────────────────────
        Concatenated: z_dim + embed_dim

        ──→ Linear ──→ Reshape ──→ ConvTranspose ──→ ... ──→ 1 x 28 x 28
```

```python
class Generator(nn.Module):
    def __init__(self, z_dim=64, num_classes=10, embed_dim=50):
        super().__init__()
        self.label_embed = nn.Embedding(num_classes, embed_dim)

        self.model = nn.Sequential(
            nn.Linear(z_dim + embed_dim, 256 * 7 * 7),
            nn.Unflatten(1, (256, 7, 7)),

            nn.ConvTranspose2d(256, 128, 4, 2, 1),
            nn.BatchNorm2d(128),
            nn.ReLU(),

            nn.ConvTranspose2d(128, 1, 4, 2, 1),
            nn.Tanh(),
        )

    def forward(self, z, labels):
        # z: (batch, z_dim)
        # labels: (batch,) — integer labels like [7, 3, 0, 5, ...]

        label_vec = self.label_embed(labels)         # (batch, embed_dim)
        x = torch.cat([z, label_vec], dim=1)         # (batch, z_dim + embed_dim)
        return self.model(x)
```

### Discriminator

```
Input:  image (1 x 28 x 28) + label channels (10 x 28 x 28)
        ────────────────────────────────────────────────────
        Concatenated: 11 x 28 x 28

        ──→ Conv ──→ Conv ──→ ... ──→ Sigmoid ──→ real/fake?
```

```python
class Discriminator(nn.Module):
    def __init__(self, num_classes=10):
        super().__init__()
        self.num_classes = num_classes

        self.model = nn.Sequential(
            # Input: (1 + 10) x 28 x 28 = 11 channels
            nn.Conv2d(1 + num_classes, 64, 4, 2, 1),
            nn.LeakyReLU(0.2),

            nn.Conv2d(64, 128, 4, 2, 1),
            nn.BatchNorm2d(128),
            nn.LeakyReLU(0.2),

            nn.Flatten(),
            nn.Linear(128 * 7 * 7, 1),
            nn.Sigmoid(),
        )

    def forward(self, images, labels):
        # images: (batch, 1, 28, 28)
        # labels: (batch,) — integer labels

        # Turn labels into 10 channels of 28x28
        label_maps = self.make_label_maps(labels, images.size(2), images.size(3))
        x = torch.cat([images, label_maps], dim=1)   # (batch, 11, 28, 28)
        return self.model(x)

    def make_label_maps(self, labels, h, w):
        # labels: (batch,) → one-hot: (batch, 10) → expand to (batch, 10, h, w)
        batch_size = labels.size(0)
        one_hot = torch.zeros(batch_size, self.num_classes, device=labels.device)
        one_hot.scatter_(1, labels.unsqueeze(1), 1.0)    # one-hot encoding
        return one_hot.view(batch_size, self.num_classes, 1, 1).expand(-1, -1, h, w)
```

### The `make_label_maps` function explained

```
Input:  labels = [7, 3]     (batch of 2)

Step 1 — one-hot:
  [0,0,0,0,0,0,0,1,0,0]    ← label 7
  [0,0,0,1,0,0,0,0,0,0]    ← label 3
  Shape: (2, 10)

Step 2 — reshape to (2, 10, 1, 1):
  Each value is now a 1x1 "image"

Step 3 — expand to (2, 10, 28, 28):
  Each value fills a whole 28x28 channel
  Channel 7 for first image: all 1s
  All other channels: all 0s
```

---

## 6. Training the Conditional GAN

The training loop is almost the same as a standard GAN. The only change: **pass labels everywhere**.

```python
import torch
import torch.nn as nn
from torchvision import datasets, transforms
from torch.utils.data import DataLoader

# ── Setup ──
z_dim      = 64
num_classes = 10
lr         = 2e-4
epochs     = 30
batch_size = 64

transform = transforms.Compose([
    transforms.ToTensor(),
    transforms.Normalize([0.5], [0.5]),
])
data = DataLoader(
    datasets.MNIST("data", train=True, download=True, transform=transform),
    batch_size=batch_size, shuffle=True
)

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
gen  = Generator(z_dim, num_classes).to(device)
disc = Discriminator(num_classes).to(device)

opt_G = torch.optim.Adam(gen.parameters(),  lr=lr, betas=(0.5, 0.999))
opt_D = torch.optim.Adam(disc.parameters(), lr=lr, betas=(0.5, 0.999))
criterion = nn.BCELoss()

# ── Training ──
for epoch in range(epochs):
    for real_images, real_labels in data:
        real_images = real_images.to(device)
        real_labels = real_labels.to(device)
        bs = real_images.size(0)

        real_target = torch.ones(bs, 1, device=device)
        fake_target = torch.zeros(bs, 1, device=device)

        # ── Train Discriminator ──
        noise = torch.randn(bs, z_dim, device=device)
        fake_images = gen(noise, real_labels).detach()

        # D sees real images WITH their correct labels
        pred_real = disc(real_images, real_labels)
        # D sees fake images WITH the same labels
        pred_fake = disc(fake_images, real_labels)

        loss_D = criterion(pred_real, real_target) + criterion(pred_fake, fake_target)

        opt_D.zero_grad()
        loss_D.backward()
        opt_D.step()

        # ── Train Generator ──
        noise = torch.randn(bs, z_dim, device=device)
        fake_images = gen(noise, real_labels)

        pred_fake = disc(fake_images, real_labels)
        loss_G = criterion(pred_fake, real_target)

        opt_G.zero_grad()
        loss_G.backward()
        opt_G.step()

    print(f"Epoch {epoch:3d} | D: {loss_D:.4f} | G: {loss_G:.4f}")
```

### What changed from standard GAN?

```
Standard GAN:
  fake = gen(noise)
  pred = disc(fake)

Conditional GAN:
  fake = gen(noise, labels)      ← G gets labels
  pred = disc(fake, labels)      ← D gets labels
                   ↑
         Same labels for both!
```

That's it. The labels flow through both networks. Everything else is the same.

---

## 7. Why D Needs the Label Too

This is a common question. Why can't we just give the label to G?

```
If only G gets the label:
  G generates a "7" (because we told it to)
  D sees the image and says "looks real!"
  But D doesn't know it was SUPPOSED to be a 7
  G could generate a perfect 3 when asked for 7
  D would still say "looks real!" — it doesn't know the mismatch

If both G and D get the label:
  G generates a "7"
  D sees the image + label "7" and checks:
    "Does this look like a real 7?"
  If G generates a 3 when asked for 7:
    D says "This doesn't look like a 7. Fake."
  G is forced to match the label.
```

### Think of it as a restaurant

```
Without label to D (waiter):
  Customer orders pasta
  Chef makes a burger
  Waiter: "Looks like good food!" ✓
  Customer: "I ordered pasta..."

With label to D (waiter):
  Customer orders pasta
  Chef makes a burger
  Waiter checks the order slip: "This is a burger, not pasta. Rejected."
  Chef must make pasta.
```

---

## 8. Generating Specific Digits

After training, you can generate any digit on demand:

```python
# Generate 8 copies of each digit 0-9
gen.eval()
fig, axes = plt.subplots(10, 8, figsize=(10, 12))

with torch.no_grad():
    for digit in range(10):
        noise = torch.randn(8, z_dim, device=device)
        labels = torch.full((8,), digit, dtype=torch.long, device=device)
        fakes = gen(noise, labels).cpu()

        for j in range(8):
            img = (fakes[j].squeeze() + 1) / 2
            axes[digit][j].imshow(img, cmap="gray")
            axes[digit][j].axis("off")
        axes[digit][0].set_ylabel(str(digit), fontsize=14, rotation=0, labelpad=20)

plt.suptitle("Conditional GAN: Each Row = One Digit", fontsize=14)
plt.tight_layout()
plt.show()
```

```
Output looks like:

Row 0: 0 0 0 0 0 0 0 0    ← all zeros (different styles)
Row 1: 1 1 1 1 1 1 1 1    ← all ones
Row 2: 2 2 2 2 2 2 2 2
...
Row 9: 9 9 9 9 9 9 9 9    ← all nines

Same noise, different labels → different digits
Same label, different noise → different styles of the same digit
```

---

## 9. What the Label Controls vs What the Noise Controls

```
Label controls: WHAT
  "Generate a 7"
  "Generate a 3"
  The class / category / identity

Noise controls: HOW
  Thick or thin strokes
  Tilted or straight
  Rounded or angular
  The style / variation

Together:
  label=7, noise_A → a thick, tilted 7
  label=7, noise_B → a thin, straight 7
  label=3, noise_A → a thick, tilted 3
  label=3, noise_B → a thin, straight 3
```

---

## 10. cGAN + WGAN-GP

You can combine conditional generation with WGAN-GP for even better results:

```python
# Changes from standard cGAN:
# 1. Critic instead of Discriminator (no Sigmoid)
# 2. Wasserstein loss + gradient penalty
# 3. No BatchNorm in the Critic (LayerNorm / InstanceNorm / none)
# 4. 5:1 training ratio

# Critic loss with GP:
gp = gradient_penalty(critic, real_images, fake_images,
                      real_labels, device)   # GP needs labels too!
loss_C = -critic(real, labels).mean() + critic(fake, labels).mean() + 10 * gp

# Generator loss:
loss_G = -critic(fake, labels).mean()
```

The gradient penalty needs a small adjustment — the interpolated images also need labels:

```python
def gradient_penalty(critic, real, fake, labels, device):
    bs = real.size(0)
    epsilon = torch.rand(bs, 1, 1, 1, device=device)
    interpolated = (epsilon * real + (1 - epsilon) * fake).requires_grad_(True)

    scores = critic(interpolated, labels)    # ← pass labels!
    # ... rest is the same
```

The lab (`training/unit-2/labs/lab-10-conditional-gan.ipynb`) deliberately keeps **BCE** — right after three lessons against it — so that **conditioning is the only change** from the Unit 1 DCGAN you already know. In practice, conditional generators are usually trained with a Wasserstein / hinge loss as above.

---

## 11. Summary

| Concept | What you learned |
|---|---|
| **Conditional GAN** | Give labels to both G and D — control what gets generated |
| **Embedding** | Turn integer labels into learnable vectors |
| **Label channels** | Expand labels to image-sized channels for D |
| **Why D needs labels** | Without labels, D can't check if the output matches the request |
| **Noise vs Label** | Noise = style/variation, Label = what/class |
| **cGAN + WGAN-GP** | Can combine — best stability + controllability |

---

## Knowledge Check

1. Give the label to G only — will its digits match the label? *(Usually not: D can't check the match, so G may ignore the label.)*
2. Write nn.Embedding as a matrix product. *(e(y) = onehot(y) · W — selecting row y of a learnable 10 × 50 table.)*
3. With z_dim 64 and embed_dim 50, how wide is G's input? How many channels does D see? *(114; 1 image + 10 label channels = 11.)*
4. Fix the label at 7 and vary the noise. What changes? *(Style — thickness, tilt, size — never the digit.)*
5. In `make_label_maps`, what shape is produced for a batch of 32? *((32, 10, 28, 28).)*
6. Switching to WGAN-GP, what must the gradient penalty receive that it didn't before? *(The labels — the critic scores (x̂, y), so interpolates are scored with their labels.)*
7. Why does the lab keep BCE? *(So conditioning is the only new idea compared with the Unit 1 DCGAN.)*

---

## Next Lesson

L11: **Controllable Generation** — go beyond class labels. Manipulate specific features in the latent space: interpolate, do latent arithmetic (thicker? more tilted?), and trade variety for quality with truncation.
