# Lesson 03: GAN for Images (MNIST)

## Where we are

| L01 | L02 | **L03** |
|---|---|---|
| What is a GAN? | GAN for number 7 | **GAN for images** |

In L02, our Generator learned to produce the number 7. One number. Boring.

Now we generate **handwritten digit images**. Real images. From noise.

---

## 1. What Changes from L02?

The GAN mechanics are **exactly the same** — Step A, Step B, .detach(), BCE loss. Nothing new there.

The only difference: instead of 1 number, we now work with **784 numbers** (pixels).

| | L02 (numbers) | L03 (images) |
|---|---|---|
| Real data | 1 number (7.0) | **784 numbers** (28x28 pixels) |
| Generator output | 1 number | **784 numbers** (a whole image) |
| Discriminator input | 1 number | **784 numbers** |
| Noise size | 1 | **64** (more variety needed) |
| Network size | 16 hidden | **256, 512 hidden** (bigger) |
| G output activation | none | **Tanh** (pixels in [-1, 1]) |
| D hidden activation | ReLU | **LeakyReLU** (keeps gradients alive) |

Same idea. Just bigger inputs and outputs.

---

## 2. The MNIST Dataset

60,000 images of handwritten digits (0-9). Each image is 28x28 pixels, grayscale.

```
  ┌────────────┐  ┌────────────┐  ┌────────────┐
  │            │  │            │  │            │
  │    ████    │  │      ██    │  │    ████    │
  │   █    █   │  │     ███    │  │   █    █   │
  │   █    █   │  │       █    │  │        █   │
  │   █    █   │  │       █    │  │      ██    │
  │    ████    │  │       █    │  │   ████████  │
  │            │  │            │  │            │
  └────────────┘  └────────────┘  └────────────┘
       "0"             "1"             "2"
```

Each image = **784 pixels** (28 x 28). Each pixel = a number between -1 and 1.

```
28 x 28 = 784

One image as a grid:     Same image flattened:
┌──────────┐
│ 28 x 28  │    -->    [p1, p2, p3, ... p784]
│  pixels  │
└──────────┘
```

Our linear GAN works with the **flattened** version — 784 numbers in a row.

---

## 3. Loading the Data

```python
import torch
from torchvision import datasets, transforms
from torch.utils.data import DataLoader

transform = transforms.Compose([
    transforms.ToTensor(),              # pixels [0, 255] --> [0, 1]
    transforms.Normalize([0.5], [0.5])  # shift [0, 1] --> [-1, 1]
])

dataset = datasets.MNIST(root='./data', train=True, download=True, transform=transform)
dataloader = DataLoader(dataset, batch_size=64, shuffle=True)
```

### What happens to each pixel:

$$x_{tensor} = \frac{x_{pixel}}{255} \quad \text{(ToTensor: [0,255] → [0,1])}$$

$$x_{normalized} = \frac{x_{tensor} - 0.5}{0.5} = 2x_{tensor} - 1 \quad \text{(Normalize: [0,1] → [-1,1])}$$

```
Example: pixel value 178
  ToTensor:    178 / 255 = 0.698
  Normalize:   (0.698 - 0.5) / 0.5 = 0.396

  Original: 178 (out of 255)  -->  Final: 0.396 (in [-1, 1] range)
```

**Why [-1, 1]?** Because G uses Tanh which outputs [-1, 1]. Data must match G's output range — otherwise D is comparing apples to oranges.

### What's a DataLoader?

- Feeds images in **batches of 64** (not one at a time)
- **Shuffles** every epoch so the network sees random order
- 60,000 images / 64 per batch = **938 batches** per epoch

```
Without batches:  train on 1 image, update, next image...  (slow, noisy)
With batches:     train on 64 images, update, next 64...    (faster, smoother)

Without shuffle:  always sees 0,0,0,...,1,1,1,...,2,2,2...  (biased order)
With shuffle:     sees 3,7,1,9,0,4,2...                    (random, learns evenly)
```

### What the DataLoader gives you:

```python
for real_images, labels in dataloader:
    # real_images shape: [64, 1, 28, 28]  = 64 images, 1 channel, 28x28
    # labels shape:      [64]              = which digit (0-9)
    # We ignore labels in basic GAN (no control over what to generate)
```

---

## 4. Build the Generator

```
noise (64) --> [Linear 256] --> [Linear 512] --> [Linear 784] --> fake image
                + ReLU           + ReLU           + Tanh
```

```python
noise_size = 64     # G takes 64 random numbers as input
image_size = 784    # G outputs 784 numbers = one 28x28 image

generator = nn.Sequential(
    nn.Linear(noise_size, 256),   # Layer 1: 64 --> 256
    nn.ReLU(),
    nn.Linear(256, 512),          # Layer 2: 256 --> 512
    nn.ReLU(),
    nn.Linear(512, image_size),   # Layer 3: 512 --> 784
    nn.Tanh()                     # squash every pixel to [-1, 1]
)
```

### What happens inside G:

$$h_1 = \text{ReLU}(W_1 \cdot z + b_1) \quad \text{(64 → 256)}$$
$$h_2 = \text{ReLU}(W_2 \cdot h_1 + b_2) \quad \text{(256 → 512)}$$
$$\text{image} = \text{Tanh}(W_3 \cdot h_2 + b_3) \quad \text{(512 → 784)}$$

Where z = random noise (64 numbers).

### Why this shape? (small → big)

```
64 --> 256 --> 512 --> 784
 \      \      \       \
  noise  wider  wider   full image
```

G starts with a small trigger (64 numbers) and **expands** it into a full image (784 pixels). Like starting with a rough sketch and adding more detail at each layer.

### Why 256 and 512? What decides the neuron count?

There's no strict rule. These are **choices** that work well in practice.

**The logic:** expand gradually, roughly doubling each layer.

```
64 --> 256  (x4)
256 --> 512 (x2)
512 --> 784 (x1.5)
```

**Would other numbers work?** Yes!

```
Option A:  64 --> 128 --> 256 --> 784     (smaller, faster, less detail)
Option B:  64 --> 256 --> 512 --> 784     (our choice, balanced)
Option C:  64 --> 512 --> 1024 --> 784    (bigger, slower, more capacity)
```

**Rules of thumb:**
- Gradually increase toward the output size
- Powers of 2 (128, 256, 512) — hardware runs faster with these
- MNIST is simple — 256/512 is plenty
- More complex images need bigger networks
- Experiment and see what works!

### Why Tanh at the output?

$$\text{Tanh}(x) = \frac{e^x - e^{-x}}{e^x + e^{-x}}$$

| Input | Tanh output | Meaning |
|---:|---:|---|
| -5 | -1.00 | Black pixel |
| 0 | 0.00 | Gray pixel |
| +5 | +1.00 | White pixel |

G's output must match the data range. Data is [-1, 1]. Tanh outputs [-1, 1]. Perfect match.

| Activation | Output range | Used for |
|---|---|---|
| Sigmoid | 0 to 1 | D's output (probability) |
| **Tanh** | **-1 to 1** | **G's output (pixel values)** |

### Parameter count

```
Layer 1:  64 x 256 + 256 biases  =  16,640
Layer 2: 256 x 512 + 512 biases  = 131,584
Layer 3: 512 x 784 + 784 biases  = 402,192
                          Total  = 550,416 parameters
```

Compare with L02's Generator: 49 parameters. Now we have **550K** — because generating 784 pixels needs way more capacity than generating 1 number.

---

## 5. Build the Discriminator

```
image (784) --> [Linear 512] --> [Linear 256] --> [Linear 1] --> real or fake?
                + LeakyReLU      + LeakyReLU      + Sigmoid
```

```python
discriminator = nn.Sequential(
    nn.Linear(image_size, 512),   # Layer 1: 784 --> 512
    nn.LeakyReLU(0.2),            # lets 20% of negatives through
    nn.Linear(512, 256),          # Layer 2: 512 --> 256
    nn.LeakyReLU(0.2),
    nn.Linear(256, 1),            # Layer 3: 256 --> 1
    nn.Sigmoid()                   # probability: 0 to 1
)
```

### What happens inside D:

$$h_1 = \text{LeakyReLU}(W_1 \cdot x + b_1) \quad \text{(784 → 512)}$$
$$h_2 = \text{LeakyReLU}(W_2 \cdot h_1 + b_2) \quad \text{(512 → 256)}$$
$$p = \sigma(W_3 \cdot h_2 + b_3) \quad \text{(256 → 1, Sigmoid)}$$

Where x = flattened image (784 pixels), p = probability (0=fake, 1=real).

### Why LeakyReLU and not ReLU?

$$\text{ReLU}(x) = \max(0, x)$$

$$\text{LeakyReLU}(x) = \begin{cases} x & \text{if } x > 0 \\ 0.2 \cdot x & \text{if } x \leq 0 \end{cases}$$

```
               ReLU                    LeakyReLU(0.2)
Input   Output   Gradient      Output      Gradient
─────   ──────   ────────      ──────      ────────
  5       5        1             5            1        (same)
  2       2        1             2            1        (same)
 -3       0        0 (DEAD!)   -0.6          0.2 (ALIVE!)
 -5       0        0 (DEAD!)   -1.0          0.2 (ALIVE!)
```

For positive inputs they're identical. The difference is only for negatives.

**The 0.2 means:** let 20% of negative values through. This is the standard for GANs.

**Why D needs this more than G:**
- If D's neurons die, D loses ability to detect fakes → G gets no feedback
- G uses ReLU and it works fine — DCGAN paper tested and confirmed this
- D is the critic — it needs every neuron alive to judge well

### Why Sigmoid at the end?

$$\sigma(x) = \frac{1}{1 + e^{-x}}$$

D must output a probability (0 to 1). Sigmoid guarantees this.

```
D's final layer outputs:  -2.5  -->  Sigmoid  -->  0.08  ("probably fake")
                           0.0  -->  Sigmoid  -->  0.50  ("no idea")
                           4.1  -->  Sigmoid  -->  0.98  ("probably real")
```

---

## 6. G and D Side by Side — The Mirror

```
Generator (CREATES):              Discriminator (JUDGES):
────────────────────              ────────────────────────
Input:  64 (noise)                Input:  784 (image)
Layer 1: 64 → 256 + ReLU         Layer 1: 784 → 512 + LeakyReLU
Layer 2: 256 → 512 + ReLU        Layer 2: 512 → 256 + LeakyReLU
Layer 3: 512 → 784 + Tanh        Layer 3: 256 → 1   + Sigmoid
Output: 784 (fake image)          Output: 1 (probability)

G EXPANDS (small → big)          D COMPRESSES (big → small)
G ends with Tanh [-1,1]          D ends with Sigmoid [0,1]
G uses ReLU                      D uses LeakyReLU
Params: 550,416                   Params: 533,505
```

They're **mirrors** of each other. G builds up from noise, D breaks down to a decision.

---

## 7. The Training Loop

**Exactly the same as L02!** Only two small changes:

1. **Flatten images** — 28x28 → 784 (because we use Linear layers)
2. **Batches** — train on 64 images at a time (not one by one)

### Loss formulas (now with batches)

For a batch of N images:

$$L_D = -\frac{1}{N}\sum_{i=1}^{N}[\log D(x_i) + \log(1 - D(G(z_i)))]$$

$$L_G = -\frac{1}{N}\sum_{i=1}^{N}\log D(G(z_i))$$

Same as L02, just averaged over 64 images instead of 1.

### Image flattening

$$\text{28} \times \text{28 image} \xrightarrow{\text{.view(-1)}} \text{784-length vector}$$

We flatten because `nn.Linear` expects a 1D input, not a 2D grid.

### The code

```python
loss_fn = nn.BCELoss()
gen_opt = torch.optim.Adam(generator.parameters(), lr=0.0002)
dis_opt = torch.optim.Adam(discriminator.parameters(), lr=0.0002)

for epoch in range(1, 51):
    for real_images, _ in dataloader:        # loop over batches of 64
        batch_size = real_images.size(0)
        real_flat = real_images.view(batch_size, -1)   # flatten 28x28 → 784

        real_labels = torch.ones(batch_size, 1)
        fake_labels = torch.zeros(batch_size, 1)

        # ====== Step A: Train D ======
        real_pred = discriminator(real_flat)
        loss_real = loss_fn(real_pred, real_labels)

        noise = torch.randn(batch_size, noise_size)
        fake_images = generator(noise).detach()        # .detach() = only D learns
        fake_pred = discriminator(fake_images)
        loss_fake = loss_fn(fake_pred, fake_labels)

        dis_loss = loss_real + loss_fake
        dis_opt.zero_grad()
        dis_loss.backward()
        dis_opt.step()

        # ====== Step B: Train G ======
        noise = torch.randn(batch_size, noise_size)
        fake_images = generator(noise)                 # no detach = G learns
        fake_pred = discriminator(fake_images)
        gen_loss = loss_fn(fake_pred, real_labels)      # G wants D to say "real"

        gen_opt.zero_grad()
        gen_loss.backward()
        gen_opt.step()
```

### Compare with L02

| L02 (1 number) | L03 (784 pixels) |
|---|---|
| `real_data = torch.tensor([[7.0]])` | `real_flat = real_images.view(batch_size, -1)` |
| `noise = torch.randn(1, 1)` | `noise = torch.randn(batch_size, noise_size)` |
| 1 sample per step | 64 samples per step (batch) |
| 2000 epochs | 50 epochs (but 938 batches each) |
| lr = 0.001 | lr = 0.0002 (smaller for stability) |

The core logic — Step A, Step B, .detach(), BCE — is **identical**.

---

## 8. See What G Creates

After training, reshape G's output from 784 numbers back to 28x28 and display:

```python
import matplotlib.pyplot as plt

with torch.no_grad():
    noise = torch.randn(16, noise_size)
    generated = generator(noise).view(-1, 28, 28)    # 784 → 28x28

fig, axes = plt.subplots(2, 8, figsize=(12, 3))
for i, ax in enumerate(axes.flat):
    ax.imshow(generated[i], cmap='gray')
    ax.axis('off')
plt.show()
```

**What you'll see over epochs:**

```
Epoch  1:     Random noise (garbage pixels)
Epoch 10:     Blurry blobs with some structure
Epoch 30:     Recognizable digit-like shapes
Epoch 50:     Readable handwritten digits!
```

**The images will be blurry.** That's expected with Linear layers. DCGAN (L05) fixes this with convolutions.

---

## 9. Why Are the Images Blurry?

Our Generator uses `nn.Linear` — every output pixel gets its **own** set of 512 weights, and nothing tells the layer which pixels are **neighbours**.

```
Linear layer thinks:
  pixel (5,5) and pixel (5,6) are just two unrelated outputs
  "neighbour" has no meaning — the 784 outputs are an unordered list
  no weight sharing: a stroke learned in one place doesn't help anywhere else

Real images:
  pixel (5,5) and pixel (5,6) are neighbors — they should be similar
  edges are continuous, strokes are smooth
  nearby pixels are related
```

```
Real digit "3":        Linear GAN output:
  smooth curves          pixel soup
  clean edges            blurry mess
  connected strokes      noisy pattern
```

**The fix:** Convolutional layers (Conv2d) — they look at **patches of nearby pixels** together. They understand that pixel neighbors matter. That's DCGAN, coming in L05.

For now, blurry is fine. The GAN **is working** — it learned what digits look like, just not with sharp edges.

---

## 10. Summary

| Concept | What it means |
|---|---|
| 28x28 = 784 | Flatten images for Linear layers |
| Normalize to [-1, 1] | Match Tanh output range |
| Tanh in G | Pixel values in [-1, 1] |
| LeakyReLU(0.2) in D | 20% of negatives pass through, keeps gradients alive |
| ReLU in G | Standard activation, works fine for Generator |
| Mirror shape | G expands (64→784), D compresses (784→1) |
| Batches of 64 | Train on 64 images at once (faster, smoother) |
| Shuffle | Random order each epoch (learns evenly) |
| `.view(batch, -1)` | Flatten 28x28 → 784 |
| `.view(-1, 28, 28)` | Reshape 784 → 28x28 for display |
| 550K parameters | Much bigger than L02's 49, because 784 pixels need more capacity |
| Blurry output | Linear layers can't see spatial structure (no neighbor awareness) |

**What stayed the same from L02:**
- Step A, Step B training loop
- `.detach()` in Step A
- BCE loss
- Two separate optimizers
- G never sees real images

---

## Knowledge Check

1. How many pixels in one MNIST image?
2. Why do we normalize images to [-1, 1]?
3. Why does G use Tanh instead of Sigmoid?
4. Why does D use LeakyReLU instead of ReLU? What does the 0.2 mean?
5. What does `.view(batch_size, -1)` do and why?
6. Why are the generated images blurry?
7. How many parameters does our G have? Why so many more than L02?
8. Why do G and D have a mirror shape?

---

## Hands-on

Run `training/unit-1/labs/lab-02-mnist-gan.ipynb` — the Linear GAN on MNIST.

---

## Next Lesson

Our images are blurry because Linear layers don't understand spatial structure. L04 introduces **convolutions** — filters that look at patches of nearby pixels. This leads to DCGAN (L05), which produces **sharp** images.
