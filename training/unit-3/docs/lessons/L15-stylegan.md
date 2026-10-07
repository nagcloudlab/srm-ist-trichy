# Lesson 15: StyleGAN — The Architecture That Changed Everything

## Where we are

| L12-L14 | **L15** |
|---|---|
| How to measure GANs (FID) and spot bias | **The most influential GAN ever built** |

You've learned to build GANs, stabilize them (WGAN-GP), control them (cGAN), and evaluate them (FID). Now we study the architecture that made the world say "wait... that face isn't real?"

StyleGAN generates photorealistic 1024x1024 faces. But more importantly, it introduced ideas that changed how we think about generators entirely.

---

## 1. What's Wrong with Normal Generators?

### The standard generator

Every generator we've built so far does this:

```
z (random noise) → Series of layers → Image
```

The noise vector `z` enters at the very beginning, and the network transforms it step by step into an image. This works, but it has a fundamental problem:

```
z controls EVERYTHING at once:
  - Overall face shape (high-level)
  - Eye color (mid-level)
  - Freckles, hair strands (fine detail)

All of these are tangled together in one vector.
Change one number in z → everything changes unpredictably.
```

### The entanglement problem

```
DCGAN generator:
  z = [0.3, -0.7, 1.2, 0.5, ...]
       ↓
  What does z[0] control?
  → A little bit of hair color
  → A little bit of face shape
  → A little bit of background
  → A little bit of everything

  You can't change JUST the hair color.
  Everything is entangled.
```

StyleGAN's big idea: **disentangle** these controls.

---

## 2. The Mapping Network: z → w

### The key insight

Instead of feeding `z` directly into the generator, first pass it through a small fully-connected network that transforms it into a new vector `w`:

```
z (512-dim)                    w (512-dim)
random noise    → 8 FC layers → "style vector"
from N(0,1)       (mapping       (lives in W-space)
                   network)
```

Sizes: StyleGAN uses z, w ∈ R^512. Our MNIST labs use z = 64 (lab-15: w = 128); Unit 1's DCGAN used z = 100.

### Why does this help?

Think of it this way:

```
Z-space (what you sample from):
  - Points are uniformly/normally distributed
  - Must fill a sphere shape
  - Features are forced to be entangled to fit this shape

W-space (what the generator actually uses):
  - No constraint to be spherical
  - Can spread out into whatever shape the data needs
  - Features can separate naturally

Analogy:
  Z-space = cramming all your clothes into a ball
  W-space = laying them out in organized drawers
```

### In code

```python
class MappingNetwork(nn.Module):
    def __init__(self, z_dim=512, w_dim=512, num_layers=8):
        super().__init__()

        layers = []
        for i in range(num_layers):
            layers.append(nn.Linear(z_dim if i == 0 else w_dim, w_dim))
            layers.append(nn.LeakyReLU(0.2))

        self.network = nn.Sequential(*layers)

    def forward(self, z):
        return self.network(z)  # z → w
```

```
That's it. 8 fully-connected layers.
Simple, but transformative.

z = torch.randn(1, 512)     # Random noise
w = mapping_network(z)       # Learned style code
```

---

## 3. AdaIN: How Style Actually Controls the Image

### The synthesis network

In a normal generator, `z` enters at the start and that's it. In StyleGAN, the style vector `w` is injected at **every layer** of the generator using a technique called **Adaptive Instance Normalization (AdaIN)**.

### Instance Normalization refresher

Remember from L09 (WGAN-GP), we used InstanceNorm instead of BatchNorm:

```
Instance Norm:
  For each channel in each image separately:
    1. Compute mean and std
    2. Normalize to mean=0, std=1

  x_normalized = (x - mean) / std
```

### AdaIN = Instance Norm + learned scale and shift

```
AdaIN(x, w):
  1. Normalize x (instance norm)
     x_norm = (x - mean(x)) / std(x)

  2. Use w to compute new scale (γ) and shift (β)
     γ, β = Linear(w)    ← learned from the style vector

  3. Apply new style
     output = γ * x_norm + β
```

```
What this means:
  - Instance norm STRIPS the current style from the feature map
  - γ and β INJECT a new style from w

  It's like:
    1. Wash the canvas clean (normalize)
    2. Paint with the style you want (scale + shift from w)
```

### In code

```python
class AdaIN(nn.Module):
    def __init__(self, w_dim, channels):
        super().__init__()
        # w → scale and shift (one pair per channel)
        self.style = nn.Linear(w_dim, channels * 2)

    def forward(self, x, w):
        # x shape: (batch, channels, H, W)
        style = self.style(w)                    # (batch, channels*2)
        gamma, beta = style.chunk(2, dim=1)      # Each: (batch, channels)
        gamma = gamma.unsqueeze(2).unsqueeze(3)   # (batch, channels, 1, 1)
        beta = beta.unsqueeze(2).unsqueeze(3)

        # Instance normalize
        mean = x.mean(dim=[2, 3], keepdim=True)
        std = x.std(dim=[2, 3], keepdim=True) + 1e-8
        x_norm = (x - mean) / std

        # Apply style
        return gamma * x_norm + beta
```

### The full picture

```
                    Mapping Network
z (512) ──────────→ [FC x 8] ──────→ w (512)
                                       │
                                       ├──→ AdaIN at layer 1 (4x4)    ← coarse style
                                       ├──→ AdaIN at layer 2 (8x8)    ← coarse style
                                       ├──→ AdaIN at layer 3 (16x16)  ← medium style
                                       ├──→ AdaIN at layer 4 (32x32)  ← medium style
                                       ├──→ AdaIN at layer 5 (64x64)  ← fine style
                                       └──→ AdaIN at layer 6 (128x128)← fine style

The SAME w is injected at every layer.
But each layer learns its own Linear(w → γ, β).
So each layer extracts different style information from w.
```

---

## 4. What Controls What? The Layer Hierarchy

This is where StyleGAN gets magical. Different layers control different levels of detail:

```
COARSE layers (4x4, 8x8):
  → Face shape, pose, head angle
  → Overall structure

MEDIUM layers (16x16, 32x32):
  → Eye shape, nose, mouth
  → Facial features

FINE layers (64x64, 128x128, 256x256+):
  → Skin texture, freckles, hair strands
  → Color, micro-details
```

### How do we know this? Style mixing.

---

## 5. Style Mixing: The Proof of Disentanglement

### The idea

Since `w` is injected at every layer separately, we can use **different** `w` vectors at different layers:

```
Person A:  z_A → MappingNet → w_A
Person B:  z_B → MappingNet → w_B

Style mixing:
  Coarse layers (4x4, 8x8):     use w_A  → get A's face shape
  Fine layers (16x16 and up):    use w_B  → get B's coloring/texture

Result: A's face shape with B's skin/hair/color!
```

### In code

```python
def generate_with_style_mixing(G, mapping, z_A, z_B, crossover_layer=4):
    w_A = mapping(z_A)  # Style from person A
    w_B = mapping(z_B)  # Style from person B

    # Build a list of w vectors, one per layer
    w_list = []
    for layer_idx in range(G.num_layers):
        if layer_idx < crossover_layer:
            w_list.append(w_A)   # Coarse from A
        else:
            w_list.append(w_B)   # Fine from B

    return G.forward_with_styles(w_list)
```

```
This is IMPOSSIBLE with a normal DCGAN.
In DCGAN, z enters once at the start.
You can't separate "face shape" from "hair color".

StyleGAN's architecture makes this separation natural.
```

### Style mixing as regularization

During training, StyleGAN randomly applies style mixing:
- Pick two random `z` vectors
- Map both to `w` vectors
- Use `w_A` for some layers, `w_B` for others
- This forces the network to keep styles independent at each layer

---

## 6. Noise Injection: Stochastic Details

### The problem with pure determinism

Even with disentangled styles, something is missing. Real faces have random details:
- Exact placement of individual hairs
- Pore patterns
- Background texture

These aren't "style" — they're random variation. Same person, same style, but slightly different hair strand placement each time.

### The solution: per-layer noise

```
At each layer of the synthesis network:

feature_map = Conv(previous_layer)
feature_map = feature_map + B * noise    ← random noise, scaled by learned B
feature_map = AdaIN(feature_map, w)

Where:
  noise = random tensor, same spatial size as feature map
  B = learned per-channel scaling factor
```

```
Style (from w via AdaIN):
  Controls WHAT the image looks like
  "This person has curly hair"

Noise (random per-pixel):
  Controls exact random PLACEMENT
  "Exactly where each curl falls"
```

### In code

```python
class StyleBlock(nn.Module):
    def __init__(self, in_ch, out_ch, w_dim):
        super().__init__()
        self.conv = nn.Conv2d(in_ch, out_ch, 3, padding=1)
        self.adain = AdaIN(w_dim, out_ch)
        # Learned noise scale (one value per channel)
        self.noise_scale = nn.Parameter(torch.zeros(1, out_ch, 1, 1))

    def forward(self, x, w):
        x = self.conv(x)

        # Add scaled random noise
        noise = torch.randn(x.shape[0], 1, x.shape[2], x.shape[3],
                           device=x.device)
        x = x + self.noise_scale * noise

        # Apply style via AdaIN
        x = self.adain(x, w)
        return x
```

---

## 7. Progressive Growing (StyleGAN v1)

### The training stability trick

Training a GAN to directly output 1024x1024 images is extremely unstable. StyleGAN v1 kept ProGAN's (Karras et al., 2018) **progressive growing**: start small, add layers gradually.

```
Phase 1: Train G and D on 4x4 images
Phase 2: Add layers → train on 8x8
Phase 3: Add layers → train on 16x16
...
Phase 9: Add layers → train on 1024x1024

Each phase:
  1. Add new higher-resolution layers
  2. Fade them in gradually (blend old and new output)
  3. Continue training
```

```
Why this works:
  - 4x4 is easy to learn (just overall color/shape)
  - Each new resolution only needs to add detail
  - The network never has to learn everything at once

  Like learning to draw:
    First: rough shapes
    Then: proportions
    Then: details
    Finally: fine textures
```

### The fade-in

```
When adding a new resolution:

old_output = Upsample(low_res)           ← blurry but stable
new_output = NewLayer(Upsample(low_res)) ← sharp but untrained

blended = (1 - alpha) * old_output + alpha * new_output

alpha goes from 0 → 1 gradually during training
  alpha=0: use only old (stable start)
  alpha=1: use only new (fully transitioned)
```

> **Note:** StyleGAN2 dropped progressive growing in favor of better architecture design (skip connections, residual networks). But the concept is important to understand.

---

## 8. Truncation Trick

### Trading diversity for quality

Remember from L11 (Controllable Generation): we truncated **z** by re-sampling any value with |z_i| > t (BigGAN) — quality up, variety down. StyleGAN applies the same trade-off in **W**, pulling w toward the average w with ψ:

```
w_mean = average w over many random z samples

For generation:
  w_truncated = w_mean + psi * (w - w_mean)

psi = 1.0: no truncation (full diversity, some weird faces)
psi = 0.7: mild truncation (high quality, good diversity)
psi = 0.5: strong truncation (very high quality, less diversity)
psi = 0.0: always the "average face"
```

```python
# Compute average w (do this once, over many samples)
with torch.no_grad():
    z_samples = torch.randn(10000, 512)
    w_samples = mapping_network(z_samples)
    w_mean = w_samples.mean(dim=0, keepdim=True)

# Generate with truncation
def generate_truncated(z, psi=0.7):
    w = mapping_network(z)
    w_truncated = w_mean + psi * (w - w_mean)
    return synthesis_network(w_truncated)
```

```
Why truncation works better in W-space:

In Z-space (L11): re-sampling the tails works, but z is entangled,
  so shrinking z changes many features unevenly.

In W-space: the mapping network learned a more disentangled,
  closer-to-linear space, so moving w toward w_mean shrinks every
  style smoothly toward the "average face" — a cleaner trade-off.
```

---

## 9. Putting It All Together: StyleGAN Architecture

```
┌─────────────────────────────────────────────────┐
│                  STYLEGAN                        │
│                                                  │
│  z ──→ [Mapping Network: 8 FC] ──→ w            │
│           (512 → 512)                            │
│                                                  │
│  Constant 4x4 ──→ StyleBlock (4x4)   ←── w      │
│        ↓              + noise                    │
│    Upsample  ──→ StyleBlock (8x8)    ←── w      │
│        ↓              + noise                    │
│    Upsample  ──→ StyleBlock (16x16)  ←── w      │
│        ↓              + noise                    │
│    Upsample  ──→ StyleBlock (32x32)  ←── w      │
│        ↓              + noise                    │
│    Upsample  ──→ StyleBlock (64x64)  ←── w      │
│        ↓              + noise                    │
│    Upsample  ──→ StyleBlock (128x128)←── w      │
│        ↓              + noise                    │
│       ...                                        │
│        ↓                                         │
│    To RGB  ──→ Final Image (1024x1024)           │
└─────────────────────────────────────────────────┘

Key differences from DCGAN:
  1. z does NOT enter the generator directly
  2. Generator starts from a LEARNED CONSTANT (not from z)
  3. w is injected at EVERY layer via AdaIN
  4. Random noise is added at every layer
  5. Mapping network disentangles the latent space
```

Notice: **the generator starts from a learned constant tensor**, not from z! The constant is a fixed 4x4 feature map that is a learnable parameter. All the variation comes from `w` (via AdaIN) and noise injections. This is a radical departure from DCGAN where `z` was reshaped into the initial feature map.

---

## 10. StyleGAN Evolution

### StyleGAN v1 (2018/19)

```
- Mapping network + AdaIN + noise injection
- Progressive growing
- Truncation trick in W-space
- Breakthrough: first truly photorealistic face generation
```

### StyleGAN2 (2020)

```
Fixes from v1:
- Removed progressive growing (causes artifacts)
  → Replaced with skip connections and residual design
- Replaced AdaIN with "weight demodulation"
  → AdaIN caused blob-like artifacts ("water droplets")
  → Weight demodulation: bake the style into the conv weights directly
- Path length regularization
  → Encourages smooth latent space (small change in w → small change in image)

Result: cleaner images, fewer artifacts, smoother interpolation
```

### StyleGAN3 (2021)

```
Fixed: position-dependent artifacts
- Objects "stick" to pixel coordinates during interpolation
- Caused by aliasing in the network
- Fix: carefully designed anti-aliased layers

Result: smooth, alias-free generation
  Moving through latent space → objects move naturally
  (no "texture sticking" artifacts)
```

---

## 11. Why StyleGAN Matters Beyond Faces

```
The IDEAS from StyleGAN are everywhere now:

1. Mapping networks
   → Transforming z before using it (now standard)

2. Style injection at multiple scales
   → Coarse/medium/fine control (used in many architectures)

3. A learned, more disentangled latent space
   → the basis of GAN inversion and latent editing

4. The proof that GANs can be photorealistic
   → Pushed the entire field forward

Applications beyond faces:
  - Cars, rooms, cats, art (trained on different datasets)
  - GAN inversion: find the w for a real image → edit it
  - Domain adaptation: adjust a face GAN for cartoon generation
```

---

## 12. Summary

| Concept | What you learned |
|---|---|
| **Entanglement problem** | In DCGAN, z controls everything at once — can't isolate features |
| **Mapping network** | 8 FC layers: z → w, disentangles the latent space |
| **W-space** | Learned style space, no distribution constraint, better for manipulation |
| **AdaIN** | Strip style (normalize), inject new style (scale+shift from w) |
| **Layer hierarchy** | Coarse layers → shape, fine layers → texture |
| **Style mixing** | Use different w at different layers — mix face shape + coloring |
| **Noise injection** | Per-layer random noise for stochastic details (hair, pores) |
| **Progressive growing** | Train 4x4 → 8x8 → ... → 1024x1024 gradually (v1 only) |
| **Truncation trick** | w_mean + psi*(w - w_mean) — trade diversity for quality |
| **Constant input** | Generator starts from learned constant, not from z |

---

## Knowledge Check

1. Why does StyleGAN use a mapping network instead of feeding z directly to the generator?
2. What does AdaIN do in two steps? Why is the "normalize first" step important?
3. If you use w_A at coarse layers and w_B at fine layers, what kind of image do you get?
4. What's the difference between what style (w) controls and what noise controls?
5. Why does the generator start from a learned constant instead of from z?
6. What does truncation do in W-space, and why does it work better there than in Z-space?
7. What problem did StyleGAN2 fix about AdaIN?

---

## Next Lesson

**Unit 4 · L16: Image-to-Image Framework** — we shift from generating images from noise to transforming one image into another. Paired translation, encoder-decoder architectures, and why this opens up entirely new applications.
