# Lesson 09: WGAN-GP — Gradient Penalty

## Where we are

| L08 | **L09** |
|---|---|
| WGAN — Wasserstein loss, Critic, weight clipping | **Fix weight clipping's problems with Gradient Penalty** |

WGAN was a breakthrough — meaningful loss, stable training, stronger Critic = better. But weight clipping is a blunt tool. Most weights get pushed to -0.01 or +0.01, and the Critic loses capacity.

WGAN-GP (Gulrajani et al., 2017) replaces weight clipping with a smarter approach: **penalize the Critic if its gradients get too large**. Same Lipschitz goal, much better execution.

---

## 1. The Problem with Weight Clipping (Recap)

From L08, weight clipping has three issues:

```
1. Capacity loss:
   Weights cluster at -c and +c → Critic becomes too simple
   Like a chef who can only use salt and pepper — no nuance

2. Sensitive to clip value:
   c = 0.001 → gradients vanish through the layers
   c = 0.1   → gradients explode (Gulrajani et al. 2017, Fig. 1)
   and clipping only gives K-Lipschitz for an unknown K

3. Slow convergence:
   Restricted Critic → needs many more epochs
```

Let's look at what we actually WANT: the **1-Lipschitz constraint**.

```
Goal:  |C(x1) - C(x2)| <= |x1 - x2|    for all x1, x2

In calculus terms:  ||gradient of C|| <= 1    everywhere

The gradient's magnitude (norm) should never exceed 1.
```

Weight clipping achieves this indirectly (limit the weights → limit the gradient). But what if we just **directly** told the Critic: "keep your gradient norm near 1"?

---

## 2. The Gradient Penalty Idea

### Direct enforcement

Instead of clipping weights, we add a **penalty term** to the Critic loss:

```
Old WGAN (weight clipping):
  Loss_C = -C(real).mean() + C(fake).mean()
  Then: clip all weights to [-c, c]

New WGAN-GP:
  Loss_C = -C(real).mean() + C(fake).mean() + lambda * GP
  No clipping needed!

Where GP = penalty for having gradient norm != 1
```

The penalty says: "If your gradient norm strays from 1, you pay a cost."

### What exactly is the penalty?

$$GP = \mathbb{E}\left[\left(\|\nabla_{\hat{x}} C(\hat{x})\|_2 - 1\right)^2\right]$$

In plain words:

```
1. Pick a point x_hat (we'll explain where in a moment)
2. Compute the gradient of C at that point
3. Measure the gradient's length (L2 norm)
4. If the length != 1, penalize by (length - 1)^2

The penalty is ZERO when gradient norm = exactly 1
The penalty GROWS when gradient norm > 1 or < 1
```

### Why penalize slopes BELOW 1 too?

The Lipschitz rule only forbids slopes **above** 1, so a one-sided penalty max(0, ‖∇‖ − 1)² would be enough to enforce it. The paper (Gulrajani et al. 2017, Proposition 1) shows more: the **optimal** critic has gradient norm **exactly 1** almost everywhere on lines between coupled real and fake points. The two-sided penalty pulls the critic toward that optimum, and worked well in practice.

### Lambda (the penalty weight)

```
lambda = 10    (the paper's default; it worked across the architectures they tried —
                tune it if the GP term dominates or is ignored)

Loss_C = -C(real).mean() + C(fake).mean() + 10 * GP
                                             ↑
                                     strong enough to enforce
                                     the constraint
```

---

## 3. Where Do We Measure the Gradient?

### The interpolation trick

We can't check the gradient at EVERY possible point — that's infinite. Instead, we check at **random points between real and fake images**:

```
Real image:    x_real = [actual digit]
Fake image:    x_fake = [generated digit]
Random number: epsilon ~ Uniform(0, 1)

Interpolated:  x_hat = epsilon * x_real + (1 - epsilon) * x_fake
```

Visually:

```
x_real ●────────────────────● x_fake
       ↑                    ↑
       |    ● x_hat         |
       |    (somewhere       |
       |     in between)     |

epsilon = 0.0 → x_hat = x_fake
epsilon = 0.5 → x_hat = halfway
epsilon = 1.0 → x_hat = x_real
```

### Why between real and fake?

```
The Critic needs to distinguish real from fake.
The "interesting" region is BETWEEN these distributions.
That's where the Critic's gradient matters most.

Think of it as:
  The Critic builds a "hill" with real data on top
  and fake data in the valley.
  We want the SLOPE of the hill to be exactly 1 along those paths,
  not a cliff (norm = 100) and not flat (norm = 0).
```

### Worked example: the penalty on a batch of four

Given ε = 0.25, a real point x = (0.8, 0.2), a fake x̃ = (−0.4, 0.6), λ = 10, E[C(x̃)] = −1.0 and E[C(x)] = 2.0:

| Step | Calculation | Result |
|---|---|---|
| 1. Interpolate | x̂ = 0.25·(0.8, 0.2) + 0.75·(−0.4, 0.6) | (−0.1, 0.5) |
| 2. Slope there | ∇C(x̂) = (1.2, 1.6) → √(1.44 + 2.56) | ‖∇C‖ = 2.0 |
| 3. Penalties for slopes 2.0, 1.0, 0.5, 1.5 | (2−1)², (1−1)², (0.5−1)², (1.5−1)² | 1, 0, 0.25, 0.25 |
| 4. Average and weight | GP = 0.375 → λ·GP | 3.75 |
| 5. Critic loss | E[C(x̃)] − E[C(x)] + λ·GP = −1.0 − 2.0 + 3.75 | **L_C = 0.75** |

The slope-2 sample alone adds 2.5. Slopes 0.5 and 1.5 cost the same — the penalty is two-sided.

---

## 4. The Gradient Penalty in Code

This is the trickiest part of WGAN-GP. Let's build it step by step.

### Step 1: Create interpolated images

```python
def gradient_penalty(critic, real, fake, device):
    batch_size = real.size(0)

    # Random weight for each image in the batch
    epsilon = torch.rand(batch_size, 1, 1, 1, device=device)
    #                    ↑  each image gets its own epsilon
    #                       1,1,1 broadcast across C, H, W

    # Interpolate between real and fake (fake is already detached from G)
    interpolated = epsilon * real + (1 - epsilon) * fake
    # Shape: same as real and fake (batch, 1, 28, 28)
```

### Step 2: Get Critic scores AND gradients

```python
    # We need gradients w.r.t. the INPUT (not the weights!)
    interpolated.requires_grad_(True)

    scores = critic(interpolated)
    # scores shape: (batch_size, 1)
```

### Step 3: Compute gradients of scores w.r.t. input

```python
    gradients = torch.autograd.grad(
        outputs=scores,
        inputs=interpolated,
        grad_outputs=torch.ones_like(scores),  # "seed" for backward
        create_graph=True,    # need this for second derivative (penalty in loss)
        retain_graph=True,
    )[0]
    # gradients shape: (batch_size, 1, 28, 28)
```

### Step 4: Compute the penalty

```python
    # Flatten gradients to (batch_size, 784) and compute norm per image
    gradients = gradients.view(batch_size, -1)
    gradient_norm = gradients.norm(2, dim=1)    # L2 norm per image

    # Penalty: (norm - 1)^2, averaged over batch
    penalty = ((gradient_norm - 1) ** 2).mean()

    return penalty
```

### All together

```python
def gradient_penalty(critic, real, fake, device):
    batch_size = real.size(0)

    # 1. Random interpolation
    epsilon = torch.rand(batch_size, 1, 1, 1, device=device)
    interpolated = (epsilon * real + (1 - epsilon) * fake).requires_grad_(True)

    # 2. Critic scores
    scores = critic(interpolated)

    # 3. Gradients w.r.t. input
    gradients = torch.autograd.grad(
        outputs=scores,
        inputs=interpolated,
        grad_outputs=torch.ones_like(scores),
        create_graph=True,
        retain_graph=True,
    )[0]

    # 4. Penalty
    gradients = gradients.view(batch_size, -1)
    penalty = ((gradients.norm(2, dim=1) - 1) ** 2).mean()

    return penalty
```

### What `torch.autograd.grad` does

```
Normal backprop:  loss.backward() → computes gradients of loss w.r.t. WEIGHTS
                  (so we can update weights with optimizer)

autograd.grad:    computes gradient of OUTPUT w.r.t. INPUT
                  (how much does the Critic's score change
                   when we wiggle the input image?)

create_graph=True:  allows PyTorch to differentiate THROUGH the gradient
                    computation itself (we need this because the GP
                    is part of the loss — it needs its own gradient)
```

---

## 5. Changes from WGAN to WGAN-GP

### What changes

| | WGAN | WGAN-GP |
|---|---|---|
| Lipschitz enforcement | Weight clipping | Gradient penalty |
| After Critic update | `clamp_(-c, c)` | Nothing (GP is in the loss) |
| Optimizer | RMSProp | **Adam** (beta1=0, beta2=0.9) |
| BatchNorm in Critic | Allowed | **No** (paper: LayerNorm or none; the lab uses InstanceNorm) |
| Lambda | N/A | 10 |
| Critic capacity | Limited (weights crushed) | **Full** (weights are free) |

### Why no BatchNorm in the Critic?

```
BatchNorm correlates samples within a batch:
  Each sample's normalization depends on OTHER samples in the batch.

The gradient penalty needs each sample's gradient to be INDEPENDENT.
If BatchNorm mixes information between samples, the GP becomes wrong.

Fix (paper): no normalization in the Critic, or LayerNorm
     (normalizes each sample independently).
```

### Why Adam is back

```
WGAN (clipping): the authors saw instability with momentum-based Adam
                 on the critic's moving target → used RMSProp
WGAN-GP:         the paper trains with Adam and reports stable results —
                 with the first-moment momentum switched OFF (beta1 = 0)

Adam settings for WGAN-GP (Gulrajani et al. 2017):
  lr    = 1e-4
  beta1 = 0        ← no momentum
  beta2 = 0.9      ← the paper's choice (PyTorch's default is 0.999)
```

---

## 6. Full WGAN-GP Implementation

### The Critic (no BatchNorm — the lab uses InstanceNorm)

```python
import torch
import torch.nn as nn

class Critic(nn.Module):
    def __init__(self):
        super().__init__()
        self.model = nn.Sequential(
            # 1 x 28 x 28
            nn.Conv2d(1, 64, 4, 2, 1),              # -> 64 x 14 x 14
            nn.LeakyReLU(0.2),

            nn.Conv2d(64, 128, 4, 2, 1),             # -> 128 x 7 x 7
            nn.InstanceNorm2d(128, affine=True),      # NOT BatchNorm!
            nn.LeakyReLU(0.2),

            nn.Flatten(),
            nn.Linear(128 * 7 * 7, 1),
            # No Sigmoid
        )

    def forward(self, x):
        return self.model(x)
```

### Which normalization?

```
BatchNorm:    normalize across the BATCH        → mixes samples → breaks GP
LayerNorm:    normalize each SAMPLE's features  → per sample → OK (paper's recommendation)
InstanceNorm: normalize each CHANNEL per sample → per sample → OK (this lab's choice)

InstanceNorm is an easy drop-in for conv layers; affine=True lets it learn
scale and shift. The paper itself recommends LayerNorm or no normalization.
```

### The Generator (BatchNorm is fine here)

```python
class Generator(nn.Module):
    def __init__(self, z_dim=64):
        super().__init__()
        self.model = nn.Sequential(
            nn.Linear(z_dim, 256 * 7 * 7),
            nn.Unflatten(1, (256, 7, 7)),

            nn.ConvTranspose2d(256, 128, 4, 2, 1),
            nn.BatchNorm2d(128),        # BatchNorm is fine in G
            nn.ReLU(),

            nn.ConvTranspose2d(128, 1, 4, 2, 1),
            nn.Tanh(),
        )

    def forward(self, z):
        return self.model(z)
```

### The Training Loop

```python
from torchvision import datasets, transforms
from torch.utils.data import DataLoader

# ── Hyperparameters ──
z_dim     = 64
lr        = 1e-4
n_critic  = 5
lambda_gp = 10       # gradient penalty weight
epochs    = 50

# ── Data ──
transform = transforms.Compose([
    transforms.ToTensor(),
    transforms.Normalize([0.5], [0.5]),
])
data = DataLoader(
    datasets.MNIST("data", train=True, download=True, transform=transform),
    batch_size=64, shuffle=True
)

# ── Models ──
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
critic = Critic().to(device)
gen    = Generator(z_dim).to(device)

# ── Adam with beta1=0 ──
opt_C = torch.optim.Adam(critic.parameters(), lr=lr, betas=(0.0, 0.9))
opt_G = torch.optim.Adam(gen.parameters(),    lr=lr, betas=(0.0, 0.9))

# ── Gradient Penalty function ──
def gradient_penalty(critic, real, fake, device):
    bs = real.size(0)
    epsilon = torch.rand(bs, 1, 1, 1, device=device)
    interpolated = (epsilon * real + (1 - epsilon) * fake).requires_grad_(True)

    scores = critic(interpolated)
    gradients = torch.autograd.grad(
        outputs=scores, inputs=interpolated,
        grad_outputs=torch.ones_like(scores),
        create_graph=True, retain_graph=True,
    )[0]

    gradients = gradients.view(bs, -1)
    return ((gradients.norm(2, dim=1) - 1) ** 2).mean()

# ── Training ──
for epoch in range(epochs):
    for real, _ in data:
        real = real.to(device)
        bs = real.size(0)

        # ── Train Critic (5 times) ──
        for _ in range(n_critic):
            noise = torch.randn(bs, z_dim, device=device)
            fake  = gen(noise).detach()

            # Wasserstein loss + gradient penalty
            gp = gradient_penalty(critic, real, fake, device)
            loss_C = -critic(real).mean() + critic(fake).mean() + lambda_gp * gp

            opt_C.zero_grad()
            loss_C.backward()
            opt_C.step()
            # NO WEIGHT CLIPPING!

        # ── Train Generator (1 time) ──
        noise = torch.randn(bs, z_dim, device=device)
        fake  = gen(noise)
        loss_G = -critic(fake).mean()

        opt_G.zero_grad()
        loss_G.backward()
        opt_G.step()

    print(f"Epoch {epoch:3d} | C_loss: {loss_C:.4f} | G_loss: {loss_G:.4f} | GP: {gp:.4f}")
```

---

## 7. Visualizing the Gradient Penalty

### What GP looks like during training (illustrative — numbers vary)

```
Early training:   slopes far from 1        → GP ≈ 0.5
Mid training:     critic learns the rule   → GP ≈ 0.1
Later:            slopes stay near 1       → GP settles small, ≈ 0.01

GP does not have to reach exactly 0: the critic trades a wider
real–fake gap against a small penalty.

If GP stays high or keeps growing → the constraint is losing; check λ and the lr
If GP settles small               → the slope rule is being respected
```

### Weight distribution: clipping vs GP

```
WGAN (weight clipping):          WGAN-GP:

    ████████████████████             ██████
   ─┤                ├─           ████████████
    -0.01          +0.01       ██████████████████
                              ────────────────────
    Weights crushed to         Weights free to spread
    the boundaries!            naturally. Full capacity.
```

---

## 8. Side-by-Side: WGAN vs WGAN-GP

```
┌──────────────────────────────┬──────────────────────────────────┐
│       WGAN (clipping)        │       WGAN-GP                    │
├──────────────────────────────┼──────────────────────────────────┤
│ Clip weights to [-c, c]      │ Add lambda * GP to loss          │
│ Weights cluster at boundaries│ Weights spread naturally         │
│ Critic has limited capacity  │ Critic has full capacity         │
│ RMSProp (Adam unstable)      │ Adam (beta1=0, beta2=0.9)        │
│ BatchNorm OK                 │ NO BatchNorm in Critic           │
│ Simple to implement          │ Slightly more complex (GP calc)  │
│ Slower convergence           │ Faster convergence               │
│ Good results                 │ Better results                   │
└──────────────────────────────┴──────────────────────────────────┘
```

---

## 9. The Complete Evolution

Let's zoom out and see how far we've come:

```
Standard GAN (Unit 1 · Build GANs):
  - BCE loss, Sigmoid, D:G = 1:1
  - Problems: JS stuck at log 2, mode collapse, meaningless loss
  - Needs tricks (Unit 1 · When GANs break) to work at all

WGAN (L08):
  - Wasserstein loss, Critic, D:G = 5:1
  - Fixes: meaningful loss, a distance that keeps measuring, stable training
  - But: weight clipping kills capacity

WGAN-GP (L09):  ← YOU ARE HERE
  - Wasserstein loss + gradient penalty
  - Fixes: full Critic capacity, faster convergence, Adam works
  - The standard for stable GAN training

What's next:
  L10 — Conditional GAN: "Generate a SPECIFIC digit"
  L11 — Controllable GAN: "Make it MORE of something"
```

---

## 10. Summary

| Concept | What you learned |
|---|---|
| **Weight clipping problems** | Capacity loss, sensitivity, slow convergence |
| **Gradient Penalty** | Penalize Critic when gradient norm != 1 |
| **Interpolation** | Check gradient at random points between real and fake |
| **autograd.grad** | Compute gradient of output w.r.t. input (not weights) |
| **No BatchNorm** | Paper: LayerNorm or none in the Critic; the lab uses InstanceNorm — each sample stays independent |
| **Adam returns** | beta1=0, beta2=0.9 — stable with GP |
| **Lambda = 10** | Standard penalty weight, rarely needs tuning |

---

## Knowledge Check

1. A sample's critic slope is 0.5. Is it penalized? *(Yes: (0.5 − 1)² = 0.25 — the penalty is two-sided because the optimal critic has slope exactly 1 between real and fake.)*
2. Write the penalty in words. *(λ times the average squared distance of the critic's input-gradient norm from 1, measured at interpolates.)*
3. Why measure at x̂ between real and fake, not everywhere? *(That is where the optimal critic's slope matters, and checking everywhere is impossible.)*
4. Remove `create_graph=True` — what breaks? *(The penalty can no longer be differentiated with respect to the critic's weights, so it stops training the critic.)*
5. Why is BatchNorm wrong in the critic here? *(It couples samples in a batch, while the penalty is defined per sample.)*
6. Which Adam settings does WGAN-GP use, and what changed from WGAN? *(lr 1e-4, β = (0, 0.9); WGAN used RMSprop because momentum was unstable on the critic's moving target.)*
7. GP settles at 0.02 and stays there. Problem? *(No — it need not reach 0; worry if it stays high or keeps growing.)*

---

## Next Lesson

L10: **Conditional GAN** — instead of generating random digits, tell the GAN: "Generate a 7." We add class labels to both G and D, and the GAN learns to obey.
