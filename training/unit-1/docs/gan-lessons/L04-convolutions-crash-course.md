# Lesson 04: Convolutions Crash Course

## Where we are

| L02 | L03 | **L04** | L05 |
|---|---|---|---|
| GAN for number 7 | GAN for images (blurry) | **Why blurry? Fix it.** | DCGAN (sharp) |

In L03, our GAN generated digit images — but they were **blurry**. Why? Because `nn.Linear` has no notion of neighbouring pixels and no weight sharing. It has no idea that pixel (5,5) is next to pixel (5,6).

This lesson introduces **convolutions** — the tool that understands spatial structure. L05 will use them to build DCGAN.

---

## 1. The Problem with Linear Layers

```
Linear layer sees an image as:

  [p1, p2, p3, p4, p5, ... p784]

  Just a list of 784 separate numbers.
  It doesn't know p1 and p2 are neighbors.
  It doesn't know rows and columns exist.
  It has ZERO spatial awareness.
```

But images have **structure** — nearby pixels are related:

```
In a real digit "3":
  pixel (10, 14) is white    (part of the stroke)
  pixel (10, 15) is white    (neighbor, also part of stroke)
  pixel (10, 16) is white    (neighbor, still stroke)
  pixel (10, 20) is black    (far away, background)

  Neighbors are similar. Linear layers don't know this.
```

**Result:** a Linear GAN has to learn every pixel's relationship to every other from scratch, with no weight sharing = blurry, noisy samples.

---

## 2. What Is a Convolution?

A small **filter** (also called kernel) slides across the image, looking at small patches of nearby pixels.

Let's work through a full example.

### The setup

You have an image and a filter. The filter is a small grid of numbers.

```
Image (5x5):                    Filter (3x3):
┌────┬────┬────┬────┬────┐      ┌────┬────┬────┐
│  1 │  0 │  1 │  0 │  0 │      │  1 │  0 │  1 │
├────┼────┼────┼────┼────┤      ├────┼────┼────┤
│  0 │  1 │  1 │  1 │  0 │      │  0 │  1 │  0 │
├────┼────┼────┼────┼────┤      ├────┼────┼────┤
│  1 │  1 │  1 │  0 │  0 │      │  1 │  0 │  1 │
├────┼────┼────┼────┼────┤      └────┴────┴────┘
│  0 │  0 │  1 │  1 │  0 │
├────┼────┼────┼────┼────┤
│  0 │  0 │  1 │  0 │  0 │
└────┴────┴────┴────┴────┘
```

### Step 1: Place the filter on the top-left corner

Cover the first 3x3 patch of the image with the filter:

```
Image:                          Filter placed on top-left:
╔════╤════╤════╗────┬────┐      ┌────┬────┬────┐
║  1 │  0 │  1 ║  0 │  0 │      │  1 │  0 │  1 │
╠════╪════╪════╣────┼────┤      ├────┼────┼────┤
║  0 │  1 │  1 ║  1 │  0 │      │  0 │  1 │  0 │
╠════╪════╪════╣────┼────┤      ├────┼────┼────┤
║  1 │  1 │  1 ║  0 │  0 │      │  1 │  0 │  1 │
╚════╧════╧════╝────┼────┤      └────┴────┴────┘
│  0 │  0 │  1 │  1 │  0 │
└────┴────┴────┴────┴────┘
```

### Step 2: Multiply each pair and add them up

```
Image patch:     Filter:        Multiply:
  1  0  1         1  0  1        1x1  0x0  1x1  =  1  0  1
  0  1  1    x    0  1  0    =   0x0  1x1  1x0  =  0  1  0
  1  1  1         1  0  1        1x1  1x0  1x1  =  1  0  1

Sum = 1 + 0 + 1 + 0 + 1 + 0 + 1 + 0 + 1 = 5

Output[0,0] = 5
```

That's one output number from one position.

### Step 3: Slide the filter one pixel to the right

```
Image:
┌────╔════╤════╤════╗────┐
│  1 ║  0 │  1 │  0 ║  0 │
├────╠════╪════╪════╣────┤
│  0 ║  1 │  1 │  1 ║  0 │
├────╠════╪════╪════╣────┤
│  1 ║  1 │  1 │  0 ║  0 │
├────╚════╧════╧════╝────┤
│  0 │  0 │  1 │  1 │  0 │
└────┴────┴────┴────┴────┘

New patch:       Filter:        Multiply:
  0  1  0         1  0  1        0x1  1x0  0x1  =  0  0  0
  1  1  1    x    0  1  0    =   1x0  1x1  1x0  =  0  1  0
  1  1  0         1  0  1        1x1  1x0  0x1  =  1  0  0

Sum = 0 + 0 + 0 + 0 + 1 + 0 + 1 + 0 + 0 = 2

Output[0,1] = 2
```

### Step 4: Keep sliding until the whole image is covered

```
Slide right → right → (end of row)
Drop down one row → slide right → right → ...
Repeat until every position is done.
```

```
Full output (3x3):
┌────┬────┬────┐
│  5 │  2 │  3 │     ← first row of positions
├────┼────┼────┤
│  3 │  4 │  2 │     ← second row
├────┼────┼────┤
│  3 │  2 │  3 │     ← third row
└────┴────┴────┘

5x5 image + 3x3 filter = 3x3 output
(shrank because filter can't go past the edge)
```

### Why the output is smaller

```
5x5 image, 3x3 filter, stride=1:

  Filter needs 3 pixels wide → can start at column 0, 1, 2 → 3 positions
  Filter needs 3 pixels tall → can start at row 0, 1, 2    → 3 positions

  Output = 3x3
```

$$\text{output size} = \text{input size} - \text{kernel size} + 1 = 5 - 3 + 1 = 3$$

### Padding — keep the same size

To prevent shrinking, add **padding** (zeros around the border):

```
With padding=1:

  0  0  0  0  0  0  0        ← ring of zeros added around the image
  0 [1  0  1  0  0] 0
  0 [0  1  1  1  0] 0        Now filter has more room to slide
  0 [1  1  1  0  0] 0
  0 [0  0  1  1  0] 0        Output = 5x5 (same as input!)
  0 [0  0  1  0  0] 0
  0  0  0  0  0  0  0
```

$$\text{output size} = \text{input size} - \text{kernel size} + 2 \times \text{padding} + 1 = 5 - 3 + 2 + 1 = 5$$

### Multiple filters = multiple patterns

```python
conv = nn.Conv2d(in_channels=1, out_channels=16, kernel_size=3, padding=1)
```

This creates **16 different filters**, each 3x3. Each one slides across the entire image and produces its own output:

```
Input: 1 image (28x28)
            |
  16 different 3x3 filters slide across the image
  each one detects a different pattern
  each produces one 28x28 output
            |
Output: 16 feature maps (each 28x28)

  Filter 1 might detect:  vertical edges     → feature map 1
  Filter 2 might detect:  horizontal edges   → feature map 2
  Filter 3 might detect:  corners            → feature map 3
  ...
  Filter 16 might detect: diagonal lines     → feature map 16
```

**You don't choose what each filter detects.** The network learns the best filters during training through backpropagation — just like it learned weights in Linear layers.

### The formula

$$\text{output}(i,j) = \sum_{m}\sum_{n} \text{filter}(m,n) \times \text{image}(i+m, j+n)$$

In words: at each position (i,j), multiply the filter with the image patch underneath, sum it all up.

### One line summary

```
Convolution = slide a small filter across the image,
              multiply-and-add at each position,
              produces one output number per position.
              Multiple filters = detect multiple patterns.
              Filter values are LEARNED during training.
```

---

## 3. What Does a Filter Detect?

Different filters detect different patterns:

```
Edge detector:        Blur filter:         Sharpen filter:
┌─────────┐          ┌─────────┐          ┌──────────────┐
│ -1  0  1 │         │ 1  1  1 │          │  0  -1   0   │
│ -1  0  1 │         │ 1  1  1 │          │ -1   5  -1   │
│ -1  0  1 │         │ 1  1  1 │          │  0  -1   0   │
└─────────┘          └─────────┘          └──────────────┘
  finds vertical       averages             enhances
  edges                neighbors            details
```

**The key insight:** In a neural network, the filter values are **learned** — the network figures out which patterns are useful on its own!

---

## 4. Conv2d in PyTorch

```python
import torch.nn as nn

conv = nn.Conv2d(
    in_channels=1,      # grayscale (1 channel). RGB would be 3
    out_channels=16,     # learn 16 different filters
    kernel_size=3,       # each filter is 3x3
    padding=1            # add border so output size = input size
)
```

### What each parameter means:

| Parameter | What it does | Example |
|---|---|---|
| `in_channels` | How many input channels | 1 for grayscale, 3 for RGB |
| `out_channels` | How many filters to learn | 16 = learn 16 different patterns |
| `kernel_size` | Size of each filter | 3 = 3x3 filter |
| `padding` | Border around image | 1 = keep same spatial size |
| `stride` | How far filter moves each step | 1 = one pixel at a time |

### What goes in and comes out:

```
Input:  [batch, 1, 28, 28]     1 channel, 28x28
Output: [batch, 16, 28, 28]    16 channels, 28x28

Same height and width (because padding=1).
But now 16 feature maps — each one detected a different pattern.
```

---

## 5. Stride — Shrinking the Image

When `stride=2`, the filter **jumps 2 pixels** instead of 1. This **halves** the image size:

```
stride=1: filter moves 1 pixel at a time → same size output
stride=2: filter moves 2 pixels at a time → HALF size output

Input:  28 x 28
        |
  Conv2d(stride=2)
        |
Output: 14 x 14    (halved!)
```

$$\text{output size} = \left\lfloor \frac{\text{input size} - \text{kernel size} + 2 \times \text{padding}}{\text{stride}} \right\rfloor + 1$$

For our case: $\frac{28 - 4 + 2 \times 1}{2} + 1 = 14$

```python
# Downsampling: 28x28 → 14x14
conv_down = nn.Conv2d(1, 64, kernel_size=4, stride=2, padding=1)

x = torch.randn(1, 1, 28, 28)    # input image
y = conv_down(x)                   # output
print(f"Input:  {x.shape}")        # [1, 1, 28, 28]
print(f"Output: {y.shape}")        # [1, 64, 14, 14]
```

**This is what the Discriminator uses** — shrink the image step by step until you reach a single number (real or fake).

```
Discriminator flow:
  28x28 → Conv(stride=2) → 14x14 → Conv(stride=2) → 7x7 → flatten → 1
```

---

## 6. Transposed Convolution — Growing the Image

The Generator needs the **opposite** of Conv2d — start small, get big:

```
Regular Conv (Section 5):    big → small     (28x28 → 14x14)    Discriminator shrinks
Transposed Conv:             small → big     (7x7 → 14x14)      Generator grows
```

### The problem G has

G starts with random noise (100 numbers). It needs to produce a 28x28 image. How do you go from small to big?

```
G's challenge:
  Input:  noise (100 numbers) → reshape to something small (e.g., 7x7)
  Output: full image (28x28)

  Need to GROW from 7x7 → 14x14 → 28x28
```

### How ConvTranspose2d works

Think of it as the **reverse** of Conv2d:

```
Conv2d (stride=2):          ConvTranspose2d (stride=2):
  Takes 2x2 patch → 1 value    Takes 1 value → 2x2 patch
  Image gets SMALLER            Image gets BIGGER
  28x28 → 14x14                 7x7 → 14x14
```

**Step by step (simplified):**

```
Input (small): 2x2                Output (big): 4x4
┌────┬────┐                       ┌────┬────┬────┬────┐
│  2 │  3 │                       │    │    │    │    │
├────┼────┤     ConvTranspose     ├────┼────┼────┼────┤
│  1 │  4 │    ──────────────→    │    │    │    │    │
└────┴────┘     (stride=2)        ├────┼────┼────┼────┤
                                  │    │    │    │    │
                                  ├────┼────┼────┼────┤
                                  │    │    │    │    │
                                  └────┴────┴────┴────┘

Each input value gets "spread" into a larger area using the filter.
The filter decides HOW to spread it.
```

**What happens inside:**

1. Take each input value
2. Multiply it with the entire filter (e.g., 4x4)
3. Place the result in the output, spaced apart by stride
4. Where results overlap, add them together

```
Example: Input value = 2, Filter = [[1, 0], [0, 1]]

  Value 2 × filter:   [[2, 0],
                        [0, 2]]

  This gets placed in the output at the right position.
  Repeat for every input value.
  Overlapping areas get added together.
```

### In PyTorch

```python
# Upsampling: 7x7 → 14x14
conv_up = nn.ConvTranspose2d(
    in_channels=256,     # input has 256 feature maps
    out_channels=128,    # output will have 128 feature maps
    kernel_size=4,       # 4x4 filter
    stride=2,            # doubles the size
    padding=1            # controls exact output size
)

x = torch.randn(1, 256, 7, 7)     # small feature map
y = conv_up(x)                      # bigger!
print(f"Input:  {x.shape}")         # [1, 256, 7, 7]
print(f"Output: {y.shape}")         # [1, 128, 14, 14]
```

### The formula

$$\text{output size} = (\text{input size} - 1) \times \text{stride} - 2 \times \text{padding} + \text{kernel size}$$

**Let's plug in our numbers:**

```
input_size = 7, stride = 2, padding = 1, kernel_size = 4

output = (7 - 1) × 2 - 2 × 1 + 4
       = 6 × 2 - 2 + 4
       = 12 - 2 + 4
       = 14          ← doubled from 7!
```

### Generator uses two of these to go from 7x7 → 28x28

```
Step 1: noise (100 numbers)
            |
        Linear + reshape
            |
        256 channels × 7 × 7        (small feature map)
            |
Step 2: ConvTranspose2d(stride=2)
            |
        128 channels × 14 × 14      (doubled!)
            |
Step 3: ConvTranspose2d(stride=2)
            |
        1 channel × 28 × 28         (doubled again = full image!)
```

### Conv2d vs ConvTranspose2d — who uses which

| | Conv2d | ConvTranspose2d |
|---|---|---|
| Direction | Big → small (shrinks) | Small → big (grows) |
| Stride=2 effect | Halves the size | Doubles the size |
| Used by | **Discriminator** | **Generator** |
| Purpose | Compress image to decision | Expand noise to image |

```
D: 28x28 → Conv → 14x14 → Conv → 7x7 → flatten → 1       (shrink to answer)
G: noise → reshape → 7x7 → ConvT → 14x14 → ConvT → 28x28  (grow to image)
```

They're mirror operations — D compresses, G expands.

---

## 7. Conv2d vs Linear — The Key Difference

| | Linear | Conv2d |
|---|---|---|
| Input | Flattened 784 numbers | 2D image (28x28) |
| Connections | Every pixel to every neuron | Small filter to nearby pixels only |
| Spatial awareness | None — pixel order lost | **Yes — knows neighbors** |
| Parameters | 784 x 512 = 401,408 | 16 filters x 3x3 = **144** |
| Result | Blurry | **Sharp** |

**Why fewer parameters?**

```
Linear(784, 512):
  Every one of 784 inputs connects to every one of 512 outputs
  = 784 x 512 = 401,408 weights

Conv2d(1, 16, kernel_size=3):
  Each filter is 3x3 = 9 weights
  16 filters = 16 x 9 = 144 weights
  Same 16 filters slide across the ENTIRE image
```

Convolutions **share weights** across the image — the same filter detects the same pattern everywhere. This is why they need far fewer parameters AND produce better results.

---

## 8. Multiple Layers — Building Up Understanding

One conv layer detects simple patterns (edges, lines). Stack multiple layers = detect complex patterns:

```
Layer 1:  detects edges, lines         (simple)
Layer 2:  detects curves, corners      (combining edges)
Layer 3:  detects digit parts          (combining curves)
Layer 4:  detects full digits          (combining parts)
```

```
Input image → [Conv1: edges] → [Conv2: shapes] → [Conv3: objects] → output
```

This is how the Discriminator understands images:

```
28x28 image → sees edges → sees curves → sees digit shapes → "real or fake?"
```

And how the Generator creates images:

```
noise → rough shapes → add curves → add edges → 28x28 image
```

---

## 9. Batch Normalization — Keep Training Stable

### The problem it solves

As data flows through many layers, values can go **crazy**:

```
Layer 1 output:   [0.5, 0.8, 0.3, 0.6]        (normal)
Layer 2 output:   [5.2, 8.1, 3.7, 6.9]        (getting bigger)
Layer 3 output:   [52, 81, 37, 69]             (exploding!)
Layer 4 output:   [520, 810, 370, 690]         (out of control!)
```

Or the opposite — values shrink to near zero:

```
Layer 1: [0.5, 0.8, 0.3]
Layer 2: [0.05, 0.08, 0.03]
Layer 3: [0.005, 0.008, 0.003]      (vanishing!)
```

Both are bad. Exploding = training crashes. Vanishing = network stops learning.

### What BatchNorm does

After each layer, it **recenters and rescales** the values:

```
Before BatchNorm:  [52, 81, 37, 69]     (wild range)
                          |
                    BatchNorm
                          |
After BatchNorm:   [-0.46, 1.27, -1.36, 0.55]  (nice, stable range)
```

### The math (step by step)

Given a batch of values: `[52, 81, 37, 69]`

**Step 1: Find the mean (average)**

$$\mu = \frac{52 + 81 + 37 + 69}{4} = \frac{239}{4} = 59.75$$

**Step 2: Find the variance (how spread out)**

$$\sigma^2 = \frac{(52-59.75)^2 + (81-59.75)^2 + (37-59.75)^2 + (69-59.75)^2}{4} = 278.69$$

$$\sigma = \sqrt{278.69} = 16.69$$

**Step 3: Normalize each value**

$$\hat{x} = \frac{x - \mu}{\sigma}$$

```
52:  (52 - 59.75) / 16.69 = -0.46
81:  (81 - 59.75) / 16.69 = +1.27
37:  (37 - 59.75) / 16.69 = -1.36
69:  (69 - 59.75) / 16.69 = +0.55
```

Result: `[-0.46, 1.27, -1.36, 0.55]` — centered around 0, spread around 1.

**Step 4: Scale and shift (learnable)**

$$y = \gamma \cdot \hat{x} + \beta$$

| Symbol | What it is | Starts at |
|---|---|---|
| γ (gamma) | Learned scale factor | 1 |
| β (beta) | Learned shift | 0 |

The network can learn to adjust the normalization if needed.

### Why "Batch" Norm?

Because it calculates mean and variance **across the entire batch** (all 64 images):

```
Batch of 64 images, each has 128 feature maps:

  For feature map #1:
    Take values from ALL 64 images at feature map #1
    Calculate mean and variance from those
    Normalize all of them

  For feature map #2:
    Same — mean and variance from all 64 images
    Normalize

  ...repeat for all 128 feature maps
```

Each feature map gets its own mean and variance.

### A simple analogy

```
Without BatchNorm:
  Student 1 scores: 95 out of 100
  Student 2 scores: 950 out of 1000
  Student 3 scores: 9.5 out of 10

  Hard to compare — different scales!

With BatchNorm:
  Student 1: 95%
  Student 2: 95%
  Student 3: 95%

  Same scale. Easy to compare.
```

BatchNorm puts every layer's output on the **same scale** so the next layer knows what range to expect.

### In PyTorch

```python
nn.BatchNorm2d(128)    # normalize 128 feature maps
```

**Placement:** Conv → BatchNorm → Activation

```python
# Used in a network:
nn.Sequential(
    nn.Conv2d(64, 128, kernel_size=4, stride=2, padding=1),
    nn.BatchNorm2d(128),    # normalize AFTER conv, BEFORE activation
    nn.ReLU(),
)
```

### Where to use in GANs (DCGAN rules)

```
Generator:
  ConvTranspose → BatchNorm → ReLU       (yes, use it)
  ConvTranspose → Tanh                   (last layer: NO BatchNorm)

Discriminator:
  Conv → LeakyReLU                       (first layer: NO BatchNorm)
  Conv → BatchNorm → LeakyReLU           (other layers: yes)
  Linear → Sigmoid                       (last layer: NO BatchNorm)
```

**Why skip first layer of D?** So D sees raw pixel values, not normalized ones.

**Why skip output layers?** Sigmoid and Tanh already have their own fixed range.

### The impact

```
Without BatchNorm:    training is unstable, loss swings wildly
With BatchNorm:       training is smooth, converges faster

Without:  might take 100 epochs and still fail
With:     might take 20 epochs and produce good results
```

---

## 10. Putting It All Together — The DCGAN Architecture

Now you know all the pieces. Here's how they combine in DCGAN:

### Generator (small → big):

```
noise (100)
    |
  reshape to 256 x 7 x 7
    |
  ConvTranspose2d(256→128, stride=2) + BatchNorm + ReLU     → 128 x 14 x 14
    |
  ConvTranspose2d(128→1, stride=2) + Tanh                   → 1 x 28 x 28
    |
  output image!
```

### Discriminator (big → small):

```
image (1 x 28 x 28)
    |
  Conv2d(1→64, stride=2) + LeakyReLU                        → 64 x 14 x 14
    |
  Conv2d(64→128, stride=2) + BatchNorm + LeakyReLU          → 128 x 7 x 7
    |
  Flatten + Linear(128*7*7 → 1) + Sigmoid                   → probability
```

### The DCGAN rules (from the original paper):

| Rule | Why |
|---|---|
| Use ConvTranspose2d in G | Learnable upsampling |
| Use Conv2d in D | Learnable downsampling |
| Use BatchNorm in both | Stabilizes training |
| ReLU in G hidden layers | Works well for generation |
| LeakyReLU(0.2) in D | Avoids dead neurons |
| Tanh for G output | Matches [-1, 1] data range |
| Sigmoid for D output | Probability output |
| No BatchNorm in D's first layer | Lets D see raw pixel values |
| Adam: lr=0.0002, betas=(0.5, 0.999) | Found to work best |

---

## 11. Summary

| Concept | What it does | Formula/Detail |
|---|---|---|
| **Convolution** | Slides filter over image, detects patterns | $\sum\sum \text{filter} \times \text{patch}$ |
| **Filter/Kernel** | Small grid of weights (e.g., 3x3) | Learned during training |
| **stride=2** | Filter jumps 2 pixels → halves image size | D uses this to shrink |
| **ConvTranspose2d** | Reverse of conv → doubles image size | G uses this to expand |
| **Channels** | Multiple feature maps (like layers of info) | 1=gray, 3=RGB, 64=features |
| **BatchNorm** | Normalizes values after each layer | $\frac{x-\mu}{\sigma}$ keeps values stable |
| **Weight sharing** | Same filter everywhere = fewer params | Conv: 144 vs Linear: 401K |
| **Spatial awareness** | Conv knows pixels have neighbors | Why DCGAN is sharp, Linear is blurry |

### The progression:

```
L02: Linear GAN on numbers     → works (1 number is easy)
L03: Linear GAN on images      → works but BLURRY (no spatial awareness)
L04: Learn convolutions         → understand the tool (this lesson)
L05: DCGAN (Conv GAN on images) → SHARP images! (next lesson)
```

---

## Knowledge Check

1. What does a convolutional filter do?
2. What does stride=2 do to the image size?
3. What is ConvTranspose2d and who uses it (G or D)?
4. Why does Conv2d need far fewer parameters than Linear?
5. What does BatchNorm do and why is it needed?
6. Why are convolutions better than Linear for images?
7. What patterns does each layer of a deep conv network detect?

---

## Next Lesson

You understand the tools. L05 puts them together: **DCGAN** — a full convolutional GAN that produces **sharp** handwritten digits. Same training loop as before, just better architecture.
