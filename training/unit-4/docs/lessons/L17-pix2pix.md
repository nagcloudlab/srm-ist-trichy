# Lesson 17: Pix2Pix — U-Net + PatchGAN

## Where we are

| L16 | **L17** |
|---|---|
| The image-to-image framework (theory) | **Build it for real — Pix2Pix** |

Last lesson we learned the ingredients: encoder-decoder Generator, conditional Discriminator, PatchGAN, combined loss. Now we put them all together into **Pix2Pix** (Isola et al., CVPR 2017) — the first general-purpose paired image translation system.

Pix2Pix is exactly L10's **conditional GAN**: the condition is a whole input image x instead of a class label, and y is the **target image**, not a label.

But first, we need to fix the encoder-decoder's biggest weakness.

---

## 1. The Bottleneck Problem (Revisited)

Remember from L16:

```
Encoder-Decoder:

  256x256x3  →  128  →  64  →  32  →  16  →  8  →  4  →  2  →  1x1x512
                                                                    ↓
  256x256x3  ←  128  ←  64  ←  32  ←  16  ←  8  ←  4  ←  2  ←  1x1x512

ALL information must squeeze through 512 numbers.
```

For image-to-image translation, this is especially bad because:

```
Input: a segmentation map with 50 buildings, 12 cars, 200 windows
Bottleneck: 512 numbers
Output: must recreate EVERY building edge, EVERY window position

The encoder KNOWS where everything is at the early layers.
But by the time it reaches the bottleneck, those precise
positions are lost — compressed away.

Then the decoder has to GUESS where everything was.
Result: blurry edges, wrong positions, lost details.
```

The tragedy: the encoder HAD the information. It just couldn't pass it through the tiny bottleneck.

---

## 2. U-Net: Skip Connections to the Rescue

### The idea

What if we let the decoder **directly access** the encoder's feature maps? Just connect each encoder layer to its mirror decoder layer:

```
ENCODER                              DECODER
────────                            ────────
128x128x64  ─────────────────────→  + 128x128x64    ← concat!
    ↓                                    ↑
64x64x128   ─────────────────────→  + 64x64x128     ← concat!
    ↓                                    ↑
32x32x256   ─────────────────────→  + 32x32x256     ← concat!
    ↓                                    ↑
16x16x512   ─────────────────────→  + 16x16x512     ← concat!
    ↓                                    ↑
16x16x512   ─────────────────────→  + 16x16x512     ← concat!
    ↓                                    ↑
8x8x512     ─────────────────────→  + 8x8x512       ← concat!
    ↓                                    ↑
4x4x512     ─────────────────────→  + 4x4x512       ← concat!
    ↓                                    ↑
            2x2x512 (bottleneck)
```

### What "concat" means

```
At the 64x64 level:
  - Decoder up-conv produces: 64x64x128  (upsampled from below)
  - Encoder skip had:         64x64x128  (skip connection from above)
  - Concatenate:              64x64x256  (double the channels)
  - Next up-conv:             128x128x64

The decoder gets BOTH:
  1. The big picture from the bottleneck path (what to generate)
  2. The precise details from the skip connection (where things are)
```

### Why it's called U-Net

```
If you draw the architecture, it looks like the letter U:

  Encoder side    Bottleneck    Decoder side
       \            |            /
        \           |           /
         \          |          /
          \         |         /
           \_______↓________/

The skip connections are the horizontal bridges across the U.
```

### The key insight

```
Without skip connections:
  Decoder ONLY knows what survived the bottleneck.
  "There's a building somewhere... maybe on the left?"

With skip connections:
  Decoder knows the big picture AND the exact positions.
  "There's a building, and its edges are EXACTLY HERE."

Skip connections carry:
  - Edge positions (where things are)
  - Fine textures (what surfaces look like)
  - Spatial details (precise pixel-level info)

The bottleneck path carries:
  - Semantic meaning (what objects are)
  - Global structure (overall layout)
  - High-level decisions (what to change)
```

---

## 3. U-Net in Code

```python
class UNetGenerator(nn.Module):
    """
    U-Net Generator for Pix2Pix.
    Input: (batch, in_ch, 256, 256)
    Output: (batch, out_ch, 256, 256)
    """
    def __init__(self, in_ch=3, out_ch=3):
        super().__init__()

        # ---- ENCODER ----
        # Each block: Conv(4x4, stride=2) + BN + LeakyReLU
        self.enc1 = nn.Conv2d(in_ch, 64, 4, 2, 1)         # 256→128, no BN
        self.enc2 = self._enc_block(64, 128)                # 128→64
        self.enc3 = self._enc_block(128, 256)               # 64→32
        self.enc4 = self._enc_block(256, 512)               # 32→16
        self.enc5 = self._enc_block(512, 512)               # 16→8
        self.enc6 = self._enc_block(512, 512)               # 8→4
        self.enc7 = self._enc_block(512, 512)               # 4→2

        # Bottleneck
        self.bottleneck = nn.Conv2d(512, 512, 4, 2, 1)     # 2→1

        # ---- DECODER ----
        # Each block: ConvTranspose2d(4x4, stride=2) + BN + ReLU + Dropout
        # Input channels are DOUBLED because of skip connections (concatenation)
        self.dec1 = self._dec_block(512, 512, dropout=True)   # 1→2
        self.dec2 = self._dec_block(512*2, 512, dropout=True) # 2→4  (512 from below + 512 skip)
        self.dec3 = self._dec_block(512*2, 512, dropout=True) # 4→8
        self.dec4 = self._dec_block(512*2, 512)               # 8→16
        self.dec5 = self._dec_block(512*2, 256)               # 16→32
        self.dec6 = self._dec_block(256*2, 128)               # 32→64
        self.dec7 = self._dec_block(128*2, 64)                # 64→128

        # Final layer
        self.final = nn.Sequential(
            nn.ConvTranspose2d(64*2, out_ch, 4, 2, 1),       # 128→256
            nn.Tanh(),
        )

    def _enc_block(self, in_c, out_c):
        return nn.Sequential(
            nn.Conv2d(in_c, out_c, 4, 2, 1, bias=False),
            nn.BatchNorm2d(out_c),
            nn.LeakyReLU(0.2),
        )

    def _dec_block(self, in_c, out_c, dropout=False):
        layers = [
            nn.ConvTranspose2d(in_c, out_c, 4, 2, 1, bias=False),
            nn.BatchNorm2d(out_c),
            nn.ReLU(),
        ]
        if dropout:
            layers.append(nn.Dropout(0.5))
        return nn.Sequential(*layers)

    def forward(self, x):
        # Encode — save each layer for skip connections
        e1 = self.enc1(x)                          # (batch, 64, 128, 128)
        e2 = self.enc2(F.leaky_relu(e1, 0.2))     # (batch, 128, 64, 64)
        e3 = self.enc3(e2)                          # (batch, 256, 32, 32)
        e4 = self.enc4(e3)                          # (batch, 512, 16, 16)
        e5 = self.enc5(e4)                          # (batch, 512, 8, 8)
        e6 = self.enc6(e5)                          # (batch, 512, 4, 4)
        e7 = self.enc7(e6)                          # (batch, 512, 2, 2)

        # Bottleneck
        b = F.relu(self.bottleneck(e7))             # (batch, 512, 1, 1)

        # Decode with skip connections
        d1 = self.dec1(b)                           # (batch, 512, 2, 2)
        d1 = torch.cat([d1, e7], dim=1)             # (batch, 1024, 2, 2) ← skip!

        d2 = self.dec2(d1)                          # (batch, 512, 4, 4)
        d2 = torch.cat([d2, e6], dim=1)             # skip!

        d3 = self.dec3(d2)                          # (batch, 512, 8, 8)
        d3 = torch.cat([d3, e5], dim=1)

        d4 = self.dec4(d3)                          # (batch, 512, 16, 16)
        d4 = torch.cat([d4, e4], dim=1)

        d5 = self.dec5(d4)                          # (batch, 256, 32, 32)
        d5 = torch.cat([d5, e3], dim=1)

        d6 = self.dec6(d5)                          # (batch, 128, 64, 64)
        d6 = torch.cat([d6, e2], dim=1)

        d7 = self.dec7(d6)                          # (batch, 64, 128, 128)
        d7 = torch.cat([d7, e1], dim=1)

        return self.final(d7)                       # (batch, out_ch, 256, 256)
```

### The skip connection pattern

```python
# This is the CORE pattern of U-Net:

# During encoding — SAVE the output:
e3 = self.enc3(e2)        # save this!

# During decoding — CONCATENATE with saved output:
d5 = self.dec5(d4)        # decoder produces this
d5 = torch.cat([d5, e3], dim=1)  # add skip connection!
# Now d5 has DOUBLE the channels
```

---

## 4. PatchGAN Discriminator (Detailed)

From L16, we know PatchGAN outputs a grid of scores. Here's the full implementation:

```python
class PatchGAN(nn.Module):
    """70x70 PatchGAN discriminator.
    Input: concatenation of input image + output image (6 channels).
    Output: grid of real/fake scores."""

    def __init__(self, in_channels=6):
        super().__init__()
        self.model = nn.Sequential(
            # Layer 1: no normalization
            nn.Conv2d(in_channels, 64, 4, 2, 1),    # 256→128
            nn.LeakyReLU(0.2),

            # Layer 2
            nn.Conv2d(64, 128, 4, 2, 1, bias=False), # 128→64
            nn.BatchNorm2d(128),
            nn.LeakyReLU(0.2),

            # Layer 3
            nn.Conv2d(128, 256, 4, 2, 1, bias=False), # 64→32
            nn.BatchNorm2d(256),
            nn.LeakyReLU(0.2),

            # Layer 4: stride=1 (no spatial reduction)
            nn.Conv2d(256, 512, 4, 1, 1, bias=False), # 32→31
            nn.BatchNorm2d(512),
            nn.LeakyReLU(0.2),

            # Output: 1 channel, no activation (use BCEWithLogitsLoss)
            nn.Conv2d(512, 1, 4, 1, 1),               # 31→30
        )

    def forward(self, x):
        return self.model(x)   # Output: (batch, 1, 30, 30)
```

```
Why 70x70?
  Each cell in the 30x30 output has a receptive field
  of 70x70 pixels in the 256x256 input.

  It's called a "70x70 PatchGAN" because of this receptive field.

  The Pix2Pix paper tested different patch sizes:
    1x1   (PixelGAN): sharp colors, but no spatial structure
    16x16: some texture
    70x70: good textures + reasonable structure  ← best!
    256x256 (full image): no better, more parameters
```

---

## 5. The Pix2Pix Loss

### Generator loss

```python
# Generator wants:
#   1. Fool D (GAN loss)
#   2. Be close to target (L1 loss)

fake = G(input_image)
d_fake = D(torch.cat([input_image, fake], dim=1))

loss_GAN = F.binary_cross_entropy_with_logits(
    d_fake, torch.ones_like(d_fake)         # want D to say "real"
)
loss_L1 = F.l1_loss(fake, target_image)     # pixel-level accuracy

loss_G = loss_GAN + 100 * loss_L1
```

The same objective in symbols (x = input image, y = target image, λ = 100):

```
G* = arg min_G max_D  L_cGAN(G, D) + λ · L_L1(G)
L_cGAN = E[log D(x, y)] + E[log(1 − D(x, G(x)))]     (G trains with the non-saturating −log D(x, G(x)))
L_L1   = E[ |y − G(x)| ]
```

Worked example: y = (0.9, −0.2, 0.4, −1.0), G(x) = (0.7, 0.0, 0.5, −0.9), mean D(x, G(x)) = 0.3
→ L_L1 = 0.6/4 = 0.15 → 100 × 0.15 = 15.0; L_GAN = −ln 0.3 = 1.20; loss_G = 16.2.

### Discriminator loss

```python
# D sees real pairs and fake pairs
real_pair = torch.cat([input_image, target_image], dim=1)
fake_pair = torch.cat([input_image, fake.detach()], dim=1)

d_real = D(real_pair)
d_fake = D(fake_pair)

loss_D_real = F.binary_cross_entropy_with_logits(
    d_real, torch.ones_like(d_real)
)
loss_D_fake = F.binary_cross_entropy_with_logits(
    d_fake, torch.zeros_like(d_fake)
)
loss_D = (loss_D_real + loss_D_fake) / 2
```

### Why BCEWithLogitsLoss?

```
PatchGAN outputs RAW scores (no sigmoid).
BCEWithLogitsLoss applies sigmoid internally + computes BCE.

This is more numerically stable than:
  sigmoid → BCE  (can get log(0) = -inf)

And the PatchGAN output is a GRID, not a single number.
BCEWithLogitsLoss handles grids automatically —
it computes the loss per cell and averages.
```

---

## 6. Dropout as Noise

Notice the U-Net decoder uses **Dropout(0.5)** in the first three layers. Why?

```
Problem:
  U-Net is SO powerful (with skip connections) that it can
  learn to just COPY the input through the skip connections
  and ignore the bottleneck entirely.

  Result: output = slightly modified input (no real translation)

Dropout helps:
  - Randomly drops 50% of activations during training
  - Forces the network to use MULTIPLE paths (not just skip)
  - Acts as regularization AND as a source of randomness
  - Applied at TEST TIME too (unlike typical dropout)
    → gives slightly different outputs each time
    → models the uncertainty in the translation
```

```
In regular networks: dropout OFF at test time
In Pix2Pix:          dropout ON at test time

This is intentional — it adds controlled randomness
to the output, which helps with tasks where multiple
outputs are valid (e.g., colorization: multiple valid colors).
```

---

## 7. Data Augmentation for Pix2Pix

### Critical rule: transform BOTH images identically

```python
# WRONG — different random transforms for input and target:
input_aug  = RandomCrop(input_image)    # crop at position (x1, y1)
target_aug = RandomCrop(target_image)   # crop at DIFFERENT position!
# Now they don't match — disaster!

# RIGHT — same transform for both:
# 1. Concatenate along channel dimension
both = torch.cat([input_image, target_image], dim=0)
# 2. Transform together
both = RandomCrop(both)
# 3. Split back
input_aug, target_aug = both.chunk(2, dim=0)
# Now they match perfectly!
```

### Pix2Pix augmentation recipe

```
1. Resize to 286x286 (slightly larger than needed)
2. Random crop to 256x256 (adds position variation)
3. Random horizontal flip (50% chance)

All applied identically to input AND target.
```

---

## 8. The Full Pix2Pix Recipe

```
Architecture:
  G: U-Net (encoder-decoder with skip connections)
  D: 70x70 PatchGAN

Loss:
  G: BCE(D(input, G(input)), 1) + 100 * L1(G(input), target)
  D: BCE(D(input, target), 1) + BCE(D(input, G(input)), 0)

Training details:
  Optimizer: Adam(lr=2e-4, betas=(0.5, 0.999))
  Batch size: 1 (yes, ONE image at a time — BatchNorm then uses that image's own statistics, i.e. instance normalization)
  Epochs: 200 (original paper)
  Dropout: 0.5 in first 3 decoder layers (ON at test time)
  Augmentation: resize 286 → crop 256, random flip

Input to D: concatenation of input image + output/target
  Real pair: cat(input, target)     → label 1
  Fake pair: cat(input, G(input))   → label 0
```

---

## 9. Why Pix2Pix Works So Well

```
Three forces work together:

1. L1 LOSS: "Stay close to the ground truth"
   → Handles overall structure and color
   → Prevents hallucination of wrong content
   → But alone would be blurry

2. GAN LOSS: "Look realistic to the Discriminator"
   → Handles sharpness and texture
   → Forces realistic local details
   → But alone would ignore the input

3. U-NET SKIP CONNECTIONS: "Don't lose the details"
   → Carries precise spatial info from input to output
   → Encoder says WHERE things are
   → Decoder knows WHAT to generate there

Remove any one of these → quality drops significantly.
```

---

## 10. Summary

| Concept | What you learned |
|---|---|
| **Bottleneck problem** | Encoder-decoder loses fine details through the 1x1 pinch point |
| **U-Net** | Skip connections bridge encoder→decoder, carrying precise spatial info |
| **Skip = concatenation** | Decoder gets double channels: its own features + encoder's features |
| **PatchGAN** | 70x70 receptive field, outputs 30x30 grid of local real/fake scores |
| **Combined loss** | GAN_loss + 100·L1_loss = sharp AND correct |
| **BCEWithLogitsLoss** | Numerically stable, works with PatchGAN grids |
| **Dropout at test time** | Adds controlled randomness, prevents skip-connection copying |
| **Paired augmentation** | Must transform input and target identically |
| **Batch size 1** | Pix2Pix trains with single images (still works!) |

---

## Knowledge Check

1. What problem do skip connections solve? What do they carry?
2. Why does the decoder have double the channels at each skip connection layer?
3. What's the receptive field of the 70x70 PatchGAN? What does each output cell represent?
4. Write the Generator loss formula. Why is λ=100?
5. Why is dropout kept ON at test time in Pix2Pix?
6. Why must data augmentation be applied identically to input AND target?
7. What happens if you remove skip connections? What if you remove GAN loss?

---

## Next Lesson

L18: **Data Augmentation & Privacy** — using GANs to generate synthetic training data, differential privacy for GANs, and the ethics of synthetic data.
