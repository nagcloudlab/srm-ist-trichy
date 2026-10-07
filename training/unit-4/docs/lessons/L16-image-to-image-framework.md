# Lesson 16: Image-to-Image Translation — A New Game

## Where we are

| Units 1–3 | **Unit 4** |
|---|---|
| Generate images from noise (z → image) | **Transform one image into another (image → image)** |

Everything we've built so far starts from random noise. You give the GAN a vector of random numbers, and it produces an image from scratch.

Now we flip the script entirely. What if the input isn't noise — it's an **existing image**? And the output is a **transformed version** of that same image?

```
Before (Units 1–3):            Now (Unit 4):
  z (noise) → G → face          sketch → G → photo
                                 day    → G → night
                                 edges  → G → shoes
                                 map    → G → satellite
```

This is **image-to-image translation** — and it opens up an entirely different world of applications.

Unit 3 ended with StyleGAN (the best generator *from noise*) and FID (how to measure it). Unit 4 keeps the adversarial game but changes the input.

### Notation for Units 4–5

| Symbol | Units 1–3 | Units 4–5 |
|---|---|---|
| **x** | a real image | the **input image** (sketch, edges, satellite photo) |
| **y** | a class label (L10: "7") | the **target image** that matches x |
| **z** | random noise (64 or 100 numbers) | none — dropout supplies the randomness |
| **G** | G(z) or G(z, y) | G(x) ≈ y |
| **D** | D(image) or D(image, label) | D(x, y) — judges the *pair* |

Pix2Pix (L17) is L10's conditional GAN, conditioned on an **image** instead of a class label.

---

## 1. What Is Image-to-Image Translation?

### The simple idea

```
You have TWO versions of the same scene:
  - Input:  one representation (e.g., a sketch)
  - Output: another representation (e.g., a photo)

The Generator learns to convert one into the other.
```

### Examples that make it click

```
Input                    Output
─────                    ──────
Black & white photo  →   Colorized photo
Daytime scene        →   Nighttime scene
Sketch of a face     →   Realistic face
Semantic segmentation→   Street photo
Building facade label→   Building photo
Satellite image      →   Map
Edge map             →   Shoe/handbag photo
Horse                →   Zebra
```

### Why is this different from what we've done?

```
Regular GAN:
  Input:  random noise (no meaningful structure)
  Output: new image (created from nothing)
  Goal:   learn the distribution of images

Image-to-Image GAN:
  Input:  a real image (with structure, content, meaning)
  Output: transformed version of that SAME image
  Goal:   learn a MAPPING between two image domains
```

---

## 2. Paired vs Unpaired Translation

This is the most important distinction in image-to-image translation.

### Paired translation

```
You have MATCHING PAIRS of images:

  Input A₁  ←→  Output B₁    (same scene, two representations)
  Input A₂  ←→  Output B₂
  Input A₃  ←→  Output B₃
  ...

Example: edges → shoes
  Edge drawing of shoe #1  ←→  Photo of shoe #1
  Edge drawing of shoe #2  ←→  Photo of shoe #2
  (Same shoe in both!)

Example: segmentation → street
  Color-coded map of scene #1  ←→  Photo of scene #1
  (Exact same scene!)
```

```
PAIRED data is hard to get.
Someone has to manually create the pairs.
But when you have it, the problem is much easier.

→ This is what Pix2Pix solves (L17)
```

### Unpaired translation

```
You have two COLLECTIONS of images, but no pairs:

  Collection A: {horse₁, horse₂, horse₃, ...}
  Collection B: {zebra₁, zebra₂, zebra₃, ...}

  No horse matches any specific zebra.
  You just know "these are horses" and "these are zebras."

Example: summer → winter
  100 summer photos (of various places)
  100 winter photos (of DIFFERENT places)
  No matching pairs!
```

```
UNPAIRED data is easy to get.
Just collect two sets of images.
But the problem is much harder — how do you learn
the mapping without seeing the "right answer"?

→ This is what CycleGAN solves (L19)
```

### The spectrum

```
Easy to collect          Hard to collect
but harder to learn      but easier to learn
     ↓                        ↓

  UNPAIRED                  PAIRED
  (CycleGAN)              (Pix2Pix)

  horses ↔ zebras         edges ↔ shoes
  summer ↔ winter         segmentation ↔ photo
  photo ↔ painting        satellite ↔ map
```

---

## 3. The Encoder-Decoder Architecture

### The foundation

For image-to-image translation, we need a Generator that takes an image in and puts an image out. The classic approach: **encoder-decoder**.

```
Input image (256x256x3)
     ↓
  ENCODER (compress)
     ↓
  Bottleneck (small representation)
     ↓
  DECODER (expand)
     ↓
Output image (256x256x3)
```

### The encoder

```
Same idea as a Discriminator — shrink the image:

  256x256x3
    ↓ Conv + stride 2
  128x128x64
    ↓ Conv + stride 2
  64x64x128
    ↓ Conv + stride 2
  32x32x256
    ↓ Conv + stride 2
  16x16x512
    ↓ Conv + stride 2
  8x8x512
    ↓ Conv + stride 2
  4x4x512
    ↓ Conv + stride 2
  2x2x512
    ↓ Conv + stride 2
  1x1x512   ← bottleneck
```

### The decoder

```
Reverse of encoder — expand back up:

  1x1x512   ← bottleneck
    ↓ ConvTranspose2d + stride 2
  2x2x512
    ↓ ConvTranspose2d + stride 2
  4x4x512
    ↓ ...
  256x256x3  ← output image
```

### In code (simplified)

```python
class EncoderDecoder(nn.Module):
    def __init__(self):
        super().__init__()

        # Encoder: image → compressed representation
        self.encoder = nn.Sequential(
            nn.Conv2d(3, 64, 4, 2, 1),      # 256 → 128
            nn.LeakyReLU(0.2),
            nn.Conv2d(64, 128, 4, 2, 1),     # 128 → 64
            nn.BatchNorm2d(128),
            nn.LeakyReLU(0.2),
            nn.Conv2d(128, 256, 4, 2, 1),    # 64 → 32
            nn.BatchNorm2d(256),
            nn.LeakyReLU(0.2),
            # ... more layers down to bottleneck
        )

        # Decoder: compressed → output image
        self.decoder = nn.Sequential(
            # ... upsample layers
            nn.ConvTranspose2d(256, 128, 4, 2, 1),  # 32 → 64
            nn.BatchNorm2d(128),
            nn.ReLU(),
            nn.ConvTranspose2d(128, 64, 4, 2, 1),   # 64 → 128
            nn.BatchNorm2d(64),
            nn.ReLU(),
            nn.ConvTranspose2d(64, 3, 4, 2, 1),     # 128 → 256
            nn.Tanh(),
        )

    def forward(self, x):
        compressed = self.encoder(x)
        return self.decoder(compressed)
```

### The bottleneck problem

```
The bottleneck is tiny: 1x1x512

ALL information must pass through this pinch point.

Problem:
  Input:  a street scene with buildings, cars, people, sky
  Bottleneck: 512 numbers
  Output: must reconstruct ALL those details

512 numbers can't hold:
  - Where every building edge is
  - The exact color of every pixel
  - The position of every window

Result: output is BLURRY
  The decoder knows the general layout
  but lost all the fine details
```

This is where skip connections come in — but that's the U-Net story for L17.

---

## 4. Why Use a GAN for This?

### Can't we just use L1/L2 loss?

You might think: if we have paired data, just train the encoder-decoder with pixel-level loss:

```python
loss = nn.L1Loss()(output_image, target_image)
```

This works... partially. But:

```
L1/L2 loss:
  "Minimize the average difference per pixel"

What this encourages:
  When several colors are plausible for a pixel,
  L2 picks their MEAN and L1 picks their MEDIAN —
  a compromise that is none of the real answers.

  Average of all possible sky colors = grayish blue
  Average of all possible brick colors = brownish gray

  Result: everything is blurry and washed out
```

```
Example: colorizing a black & white photo of a car

  The model doesn't know if the car is red or blue.
  L2 loss says: minimize expected squared error → the mean
  Mean of red and blue = a muddy compromise colour

  With L2 loss alone:
    Input:  grayscale car
    Output: brownish-gray car (safe average)

  We want:
    Output: a RED car OR a BLUE car
    (pick one! don't average!)
```

### GAN loss adds sharpness

```
L1/L2 loss: "Be close to the target on average"
  → Blurry but accurate on average

GAN loss:  "Be indistinguishable from real"
  → Sharp and realistic, or D catches you

Combined (Pix2Pix approach):
  loss_G = GAN_loss + lambda * L1_loss

  GAN_loss: "make it look real"     → sharpness
  L1_loss:  "stay close to target"  → correctness

  Together: sharp AND correct
```

```
           L1 only          GAN only        L1 + GAN
          ─────────        ─────────       ─────────
Result:    blurry but       sharp but       sharp AND
           correct          may hallucinate correct
           structure        wrong details   structure
```

---

## 5. The Discriminator's New Job

### In regular GANs

```
D asks: "Is this image real or fake?"
  Input: one image
  Output: real/fake
```

### In image-to-image GANs

```
D asks: "Is this OUTPUT a real match for this INPUT?"
  Input: the INPUT image + the OUTPUT image (concatenated)
  Output: real/fake

D sees BOTH images and judges whether they're a real pair.
```

```
Example: edges → shoes

  Real pair:    [edge drawing] + [photo of THAT shoe]     → "real"
  Fake pair:    [edge drawing] + [G's attempt at a shoe]  → "fake"

  D must learn:
    "Does this photo match these edges?"
    Not just "Is this a shoe?" but "Is this THE RIGHT shoe?"
```

### Why concatenate?

```python
# Discriminator input for paired translation:
d_input_real = torch.cat([input_image, real_target], dim=1)   # channels: 3+3=6
d_input_fake = torch.cat([input_image, fake_output], dim=1)   # channels: 3+3=6

d_real = D(d_input_real)  # Should output "real"
d_fake = D(d_input_fake)  # Should output "fake"
```

```
If D only saw the output (not the input):
  G could produce ANY realistic shoe for edge drawing #1
  Even if it doesn't match the edges at all!

By showing D BOTH the input and output:
  D can check: "do the edges line up with the photo?"
  G is forced to produce an output that MATCHES the input
```

---

## 6. PatchGAN: A Smarter Discriminator

### The problem with global discrimination

A regular Discriminator outputs ONE number for the entire image: real or fake. But images have local structure — textures, edges, patterns that repeat.

```
Regular D:
  Full image → one sigmoid → 0.73
  "Overall, this looks 73% real"

  Problem: this is too coarse
  An image might have realistic buildings but
  blurry windows. The single score can't tell you WHERE.
```

### PatchGAN: judge small patches

Instead of one score for the whole image, output a **grid of scores**, one per local patch:

```
PatchGAN D:
  Full image → conv layers → grid of scores

  Example output: (30x30) grid
  Each cell = "Is this LOCAL PATCH real or fake?"

  ┌─────────────────────┐
  │ 0.9  0.8  0.9  0.7  │  "top-left patches look real"
  │ 0.3  0.2  0.1  0.4  │  "middle patches look fake"
  │ 0.8  0.7  0.9  0.8  │  "bottom patches look real"
  └─────────────────────┘
```

```
Why this works:
  - Each score focuses on a small LOCAL region
  - Forces G to get local textures right everywhere
  - Acts like a texture/style loss
  - Fewer parameters than a full-image D
  - Can handle any image size (it's fully convolutional)
```

### In code

```python
class PatchGAN(nn.Module):
    """Outputs a grid of real/fake scores, not a single number."""
    def __init__(self, in_channels=6):  # 3 input + 3 output concatenated
        super().__init__()
        self.model = nn.Sequential(
            nn.Conv2d(in_channels, 64, 4, 2, 1),   # 256 → 128
            nn.LeakyReLU(0.2),

            nn.Conv2d(64, 128, 4, 2, 1),            # 128 → 64
            nn.BatchNorm2d(128),
            nn.LeakyReLU(0.2),

            nn.Conv2d(128, 256, 4, 2, 1),           # 64 → 32
            nn.BatchNorm2d(256),
            nn.LeakyReLU(0.2),

            nn.Conv2d(256, 1, 4, 1, 1),             # 32 → 31
            # No sigmoid — use with BCEWithLogitsLoss
        )

    def forward(self, x):
        return self.model(x)  # Output: (batch, 1, 31, 31)
```

```
The name "PatchGAN" comes from the RECEPTIVE FIELD:
  Each cell in the 31x31 output "sees" a 70x70 patch
  of the original 256x256 image.

  So it's called a "70x70 PatchGAN"

  The score for each cell answers:
  "Is this 70x70 patch real or fake?"
```

---

## 7. The Full Image-to-Image Framework

Putting it all together:

```
TRAINING (paired data):

  Input image ──→ Generator ──→ Fake output
       │              │              │
       │              │              ↓
       │              │     L1 loss vs Target ──→ "Stay close to target"
       │              │              │
       │              │              ↓
       └──────────────┴──→ Discriminator ──→ "Is this pair real?"
                                     ↑
  Input image ──→ + ──→ Real target ─┘        "Is THIS pair real?"


  Generator loss = GAN_loss + λ · L1_loss
    GAN_loss: fool the discriminator (sharpness)
    L1_loss:  stay close to target (correctness)
    λ = 100 (L1 matters a lot — we want accuracy)

  Discriminator loss = standard GAN loss
    Learn to distinguish (input, real_target) from (input, fake_output)
```

### The training loop (pseudocode)

```python
for input_img, target_img in paired_dataset:

    # --- D step ---
    fake = G(input_img)
    d_real = D(concat(input_img, target_img))
    d_fake = D(concat(input_img, fake.detach()))
    loss_D = bce(d_real, ones) + bce(d_fake, zeros)
    update D

    # --- G step ---
    fake = G(input_img)
    d_fake = D(concat(input_img, fake))
    loss_GAN = bce(d_fake, ones)           # fool D
    loss_L1 = L1(fake, target_img)         # match target
    loss_G = loss_GAN + 100 * loss_L1
    update G
```

---

## 8. Why λ = 100?

```
Why is the L1 weight so high (100)?

Without L1 (λ=0):
  G produces sharp but WRONG images
  "Here's a beautiful shoe... that doesn't match your edges"

With too much L1 (λ=10000):
  G produces blurry but CORRECT images
  "Here's the right shoe... but it looks like watercolor"

λ=100:
  G produces sharp AND correct images
  GAN loss keeps it sharp
  L1 loss keeps it faithful

The 100:1 ratio was found empirically by the Pix2Pix authors.
It works surprisingly well across many tasks.
```

---

## 9. Applications Gallery

```
PAIRED TRANSLATION (needs matching pairs):
  ┌──────────────────────────┬──────────────────────┐
  │ Input                    │ Output               │
  ├──────────────────────────┼──────────────────────┤
  │ Edge map                 │ Photo (shoes, bags)   │
  │ Semantic segmentation    │ Street photo          │
  │ Building facade labels   │ Building photo        │
  │ BW photo                 │ Color photo           │
  │ Day photo                │ Night photo           │
  │ Low resolution           │ High resolution       │
  │ Satellite image          │ Map                   │
  └──────────────────────────┴──────────────────────┘

UNPAIRED TRANSLATION (no matching pairs needed):
  ┌──────────────────────────┬──────────────────────┐
  │ Domain A                 │ Domain B             │
  ├──────────────────────────┼──────────────────────┤
  │ Horse                    │ Zebra                │
  │ Summer photo             │ Winter photo         │
  │ Photo                    │ Monet painting       │
  │ Real face                │ Cartoon face         │
  │ Apple                    │ Orange               │
  └──────────────────────────┴──────────────────────┘
```

---

## 10. Summary

| Concept | What you learned |
|---|---|
| **Image-to-image** | Transform one image into another (not from noise) |
| **Paired translation** | Matching input-output pairs — easier to train, harder to collect |
| **Unpaired translation** | Two separate collections — easy to collect, harder to train |
| **Encoder-decoder** | Compress → bottleneck → expand (but loses fine details) |
| **Why GAN loss** | L1/L2 alone → blurry averages. GAN loss → sharpness |
| **Conditional D** | D sees input+output concatenated — judges if they MATCH |
| **PatchGAN** | Grid of scores, one per local patch — better texture quality |
| **Combined loss** | GAN_loss + λ·L1_loss — sharp AND correct (λ=100) |

---

## Knowledge Check

1. What's the difference between paired and unpaired image translation? Give an example of each.
2. Why does L1 loss alone produce blurry outputs? (Think about what happens when the model is uncertain.)
3. Why does the Discriminator need to see BOTH the input and output images?
4. What does PatchGAN output, and why is it better than a single real/fake score?
5. Why is λ=100 for the L1 loss? What happens if it's too low or too high?
6. What's the bottleneck problem with encoder-decoders? (Hint: the fix is in L17.)

---

## Next Lesson

L17: **Pix2Pix: U-Net + PatchGAN** — the encoder-decoder's bottleneck problem, skip connections that solve it (U-Net), and building a complete Pix2Pix model. The first practical paired image translation system.
