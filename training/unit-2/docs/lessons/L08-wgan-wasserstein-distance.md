# Lesson 08: WGAN — Wasserstein Distance

## Where we are

| L07 | **L08** |
|---|---|
| BCE measures JS — stuck at log 2 once real and fake stop overlapping | **Replace it with a distance that keeps measuring** |

L07 showed us that BCE / JS Divergence is the root cause of GAN instability. Now we fix it. WGAN (Wasserstein GAN) replaces the entire loss function — and in doing so, changes how the Discriminator works, how we train, and how we read the loss curves.

**Paper:** Arjovsky, Chintala & Bottou, 2017 — "Wasserstein GAN"

---

## 1. The Earth Mover's Distance

### The idea

Imagine two piles of sand. One pile is the **real data distribution**. The other pile is the **fake data distribution**. You want to reshape the fake pile to match the real pile.

```
Real pile:              Fake pile:

    ██                              ██
  ██████                          ██████
████████████                    ████████████
────────────────────────────────────────────
   here                           over here
```

**Earth Mover's Distance (EMD)** = the minimum amount of work (dirt x distance) needed to move one pile into the shape of the other.

```
Move fake pile to match real pile:

Cost = amount of sand  x  distance moved
     = "how much"      x  "how far"

The cheaper the move, the closer the distributions.
```

### Why is this better than JS Divergence?

```
JS Divergence (BCE):
  Piles don't overlap?  → "They're different" (constant = log 2)
  Piles don't overlap?  → "They're different" (same constant)
  Piles don't overlap?  → "They're different" (STILL same constant)

  No matter HOW CLOSE the piles get, if they don't overlap:
  JS says the same thing. No gradient. No progress.

Earth Mover's Distance:
  Piles are 100m apart? → Cost = 100
  Piles are 50m apart?  → Cost = 50
  Piles are 10m apart?  → Cost = 10

  Even WITHOUT overlap, EMD tells you:
  "You're getting closer." It keeps changing as the piles move.
```

### Worked example: two small piles

Real samples {1, 5} and fake samples {0, 2} — equal mass ½ each. Two ways to move the fake sand onto the real sand:

| Plan | Moves | Average cost |
|---|---|---|
| A | 0 → 1 (1), 2 → 5 (3) | (1 + 3) / 2 = **2.0** |
| B | 0 → 5 (5), 2 → 1 (1) | (5 + 1) / 2 = 3.0 |

W₁ = the cheapest plan = **2.0**. JS for the same piles = log 2 = 0.693, because they share no points — and it would stay 0.693 if the fakes were at {100, 102}.

### The GPS analogy (from L07)

```
JS Divergence GPS:    "You have not arrived."
                      "You have not arrived."        (no sense of progress)

Earth Mover GPS:      "100 km away"
                      "50 km away"
                      "10 km away"                   (shrinks as you approach)
```

---

## 2. From Discriminator to Critic

### The big change

In a standard GAN, the Discriminator outputs a **probability** (0 to 1) — "how likely is this image real?"

In WGAN, we replace the Discriminator with a **Critic**. The Critic outputs a **score** — an unbounded number (any value, not just 0-1).

```
Standard GAN Discriminator:
  Input → Conv layers → Sigmoid → 0.87
                                   ↑
                            "87% chance real"

WGAN Critic:
  Input → Conv layers → (no Sigmoid) → 3.42
                                        ↑
                                "realness score"
                        (higher = more real, no upper limit)
```

### Why drop the Sigmoid?

The Critic is not answering "real or fake?" — it is a **function f whose average gap between real and fake estimates a distance**. A distance can be any size, so the score must be unbounded. A probability squeezed into (0, 1) cannot express "2.0 apart" vs "20 apart".

```
Discriminator:  0.9999  → "surely real"         (saturates — how real?)
Critic:         +3.2 vs −1.5 → gap 4.7          (the gap IS the measurement)
```

### Where the Critic comes from: Kantorovich–Rubinstein duality

Computing W₁ directly (the cheapest transport plan) is intractable for images. The duality turns it into an optimisation over functions:

$$W_1(p_r, p_g) = \sup_{\|f\|_L \le 1} \; \mathbb{E}_{x \sim p_r}[f(x)] - \mathbb{E}_{x \sim p_g}[f(x)]$$

- f: any 1-Lipschitz function (its slope is at most 1 everywhere)
- sup: the best such f — the one that separates the averages the most
- **The Critic C is a neural network trained to be that f.** Its real–fake average gap is our estimate of W₁.

Check on the piles above: f(x) = x gives E_real − E_fake = 3 − 1 = 2.0 = W₁ (slope 1 is allowed). f(x) = 2x would give 4.0 — but its slope is 2, which the Lipschitz rule forbids.

### The name change matters

```
Discriminator:  "Is this real or fake?"  (binary question)
Critic:         "How realistic is this?"  (scored review)

Think of it like:
  Discriminator = bouncer: "You're in or you're out"
  Critic        = food critic: "This dish scores 7.3 out of ..."
                  (there's no maximum — a masterpiece could score 100)
```

---

## 3. The WGAN Loss

### Critic loss

The Critic wants to give **high scores to real images** and **low scores to fake images**:

$$L_C = \underbrace{-\mathbb{E}[C(x)]}_{\text{push real scores UP}} + \underbrace{\mathbb{E}[C(G(z))]}_{\text{push fake scores DOWN}}$$

Spelled out:

```
Critic loss = -(average score on real images) + (average score on fake images)

To minimize this:
  → Make score on real images HIGH  (first term becomes more negative)
  → Make score on fake images LOW   (second term becomes smaller)
```

### Generator loss

The Generator wants the Critic to give **high scores to fake images**:

$$L_G = -\mathbb{E}[C(G(z))]$$

```
Generator loss = -(average Critic score on fake images)

To minimize this:
  → Make Critic give HIGH scores to fakes
```

### Compare to BCE loss

| | BCE GAN | WGAN |
|---|---|---|
| D/C output | Probability (0 to 1) | Score (any number) |
| D/C real target | "label = 1" | "give high score" |
| D/C fake target | "label = 0" | "give low score" |
| G target | "fool D into saying 1" | "get high score from C" |
| Activation | Sigmoid | None |
| Loss function | BCELoss | Simple subtraction |

### In PyTorch — it's just subtraction!

```python
# ── Critic loss ──
critic_score_real = critic(real_images)      # e.g. tensor of [3.2, 4.1, 2.8, ...]
critic_score_fake = critic(gen(noise))       # e.g. tensor of [-1.5, -2.3, -0.8, ...]

loss_critic = -critic_score_real.mean() + critic_score_fake.mean()

# ── Generator loss ──
critic_score_fake = critic(gen(noise))
loss_gen = -critic_score_fake.mean()
```

No `BCELoss`. No labels. No Sigmoid. Just **means and minus signs**.

---

## 4. The Lipschitz Constraint

### The catch

The Wasserstein distance formula only works if the Critic is a **1-Lipschitz function**.

What does that mean? In simple terms:

```
A 1-Lipschitz function can't change too fast.

If you move the input a little bit,
the output can move AT MOST the same amount.

|C(x1) - C(x2)| <= |x1 - x2|

Think of it as a speed limit:
  The Critic's output can't "jump" — it must change smoothly.
```

### Why do we need this?

Without the constraint, the Critic could do this:

```
Without Lipschitz:
  C(real image) = +1,000,000
  C(fake image) = -1,000,000

  The Critic just makes the gap INFINITE.
  The loss becomes meaningless.
  The Wasserstein distance estimate blows up.
```

With the constraint:

```
With Lipschitz:
  C(real image) = +3.2
  C(fake image) = -1.5

  The gap is bounded.
  The gap ≈ the Wasserstein distance (up to a constant — see clipping).
  Training is stable.
```

### The speed limit analogy

```
Without speed limit (no Lipschitz):
  Critic races to give extreme scores.
  Scores explode. Training crashes.

With speed limit (1-Lipschitz):
  Critic moves at a controlled pace.
  Scores are meaningful. Training is smooth.
```

---

## 5. Weight Clipping — The Original WGAN Fix

### How to enforce Lipschitz?

The original WGAN paper uses a simple trick: **after every update, clip all Critic weights to a small range [-c, c]**.

```python
# After updating the Critic:
for param in critic.parameters():
    param.data.clamp_(-0.01, 0.01)    # clip to [-0.01, 0.01]
```

This is brute force. If no weight can be bigger than 0.01, the function can't change too fast.

### Why it works (roughly)

```
Big weights   → output changes a LOT for small input changes → violates Lipschitz
Small weights → output changes a LITTLE for small input changes → Lipschitz satisfied
```

Bounded weights make the Critic **K-Lipschitz** for some unknown K (set by c and the architecture), not exactly 1-Lipschitz. The critic gap then estimates **K · W₁** — fine for training, because K is the same at every step.

### Problems with weight clipping

Weight clipping works, but it has issues (which we'll fix in L09 with Gradient Penalty):

```
1. Too small clip value (c = 0.001):
   Critic is too restricted → learns very slowly
   Like a food critic who can only say "slightly good" or "slightly bad"

2. Too large clip value (c = 0.1):
   Gradients explode as they pass back through the layers → unstable
   (Gulrajani et al. 2017, Fig. 1: c = 0.001 vanishes, c = 0.1 explodes)

3. Capacity underuse:
   Most weights get pushed to exactly -c or +c
   The Critic becomes a very simple function
   Like only using two colors to paint a picture
```

Despite these issues, weight clipping was a huge improvement over BCE.

---

## 6. Training Differences

### Train the Critic MORE

In standard GANs, we train D and G equally (1:1 ratio).

In WGAN, we train the Critic **5 times** for every 1 Generator update:

```
Standard GAN:
  Train D once → Train G once → repeat

WGAN:
  Train C five times → Train G once → repeat
  Train C five times → Train G once → repeat
```

### Why 5:1?

```
In BCE GAN:
  D too strong → JS stuck, gradients uninformative
  So we LIMIT D training

In WGAN:
  C stronger → BETTER gradient for G
  So we ENCOURAGE C training!

The stronger the Critic, the better it estimates Wasserstein distance,
the better gradient G gets. This is the opposite of standard GANs!
```

This is the key breakthrough: **you WANT the Critic to be powerful.**

### Use RMSProp, not Adam

The original WGAN paper recommends **RMSProp** instead of Adam:

```python
optimizer_C = torch.optim.RMSprop(critic.parameters(), lr=5e-5)
optimizer_G = torch.optim.RMSprop(gen.parameters(), lr=5e-5)
```

Why? The WGAN authors observed that training sometimes became unstable with a momentum-based optimizer such as Adam, so they switched to RMSProp, which copes well with **non-stationary** objectives — and the Critic's target keeps moving as G changes. (WGAN-GP in L09 brings Adam back, with β₁ = 0.)

---

## 7. Full WGAN Implementation

Let's build a WGAN for MNIST. We reuse the DCGAN architecture from Unit 1 ("Build GANs") but change the Discriminator to a Critic and replace the loss. This is the code in `training/unit-2/labs/lab-08-wgan.ipynb`.

### The Critic (no Sigmoid!)

```python
import torch
import torch.nn as nn

class Critic(nn.Module):
    def __init__(self):
        super().__init__()
        self.model = nn.Sequential(
            # Input: 1 x 28 x 28
            nn.Conv2d(1, 64, 4, 2, 1),           # → 64 x 14 x 14
            nn.LeakyReLU(0.2),

            nn.Conv2d(64, 128, 4, 2, 1),          # → 128 x 7 x 7
            nn.BatchNorm2d(128),
            nn.LeakyReLU(0.2),

            nn.Flatten(),
            nn.Linear(128 * 7 * 7, 1),             # → single score
            # NO SIGMOID!  ← This is the key difference
        )

    def forward(self, x):
        return self.model(x)
```

### The Generator (same as DCGAN)

```python
class Generator(nn.Module):
    def __init__(self, z_dim=64):
        super().__init__()
        self.model = nn.Sequential(
            nn.Linear(z_dim, 256 * 7 * 7),
            nn.Unflatten(1, (256, 7, 7)),

            nn.ConvTranspose2d(256, 128, 4, 2, 1),  # → 128 x 14 x 14
            nn.BatchNorm2d(128),
            nn.ReLU(),

            nn.ConvTranspose2d(128, 1, 4, 2, 1),    # → 1 x 28 x 28
            nn.Tanh(),
        )

    def forward(self, z):
        return self.model(z)
```

### The Training Loop

```python
import torch
from torchvision import datasets, transforms
from torch.utils.data import DataLoader

# ── Hyperparameters ──
z_dim       = 64
lr          = 5e-5
batch_size  = 64
epochs      = 50
n_critic    = 5          # train Critic 5x per Generator update
clip_value  = 0.01       # weight clipping range

# ── Data ──
transform = transforms.Compose([
    transforms.ToTensor(),
    transforms.Normalize([0.5], [0.5]),
])
data = DataLoader(
    datasets.MNIST("data", train=True, download=True, transform=transform),
    batch_size=batch_size, shuffle=True
)

# ── Models ──
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
critic = Critic().to(device)
gen    = Generator(z_dim).to(device)

# ── RMSProp (NOT Adam) ──
opt_C = torch.optim.RMSprop(critic.parameters(), lr=lr)
opt_G = torch.optim.RMSprop(gen.parameters(), lr=lr)

# ── Training ──
for epoch in range(epochs):
    for i, (real, _) in enumerate(data):
        real = real.to(device)
        bs = real.size(0)

        # ────── Train Critic (5 times) ──────
        for _ in range(n_critic):
            noise = torch.randn(bs, z_dim, device=device)
            fake  = gen(noise).detach()

            loss_C = -critic(real).mean() + critic(fake).mean()   # (the paper draws a fresh real batch per critic step)

            opt_C.zero_grad()
            loss_C.backward()
            opt_C.step()

            # Weight clipping
            for p in critic.parameters():
                p.data.clamp_(-clip_value, clip_value)

        # ────── Train Generator (1 time) ──────
        noise = torch.randn(bs, z_dim, device=device)
        fake  = gen(noise)

        loss_G = -critic(fake).mean()

        opt_G.zero_grad()
        loss_G.backward()
        opt_G.step()

    print(f"Epoch {epoch:3d} | C_loss: {loss_C:.4f} | G_loss: {loss_G:.4f}")
```

### Reading the loss

This is one of WGAN's biggest practical wins — **the loss is meaningful**. Read it through the sign:

```
L_C = −E[C(real)] + E[C(fake)]   →   −L_C = E[C(real)] − E[C(fake)] ≈ K · W₁

Illustrative run (numbers vary):
Epoch  1 | C_loss: -0.85   → W estimate 0.85   (fakes far from real)
Epoch 10 | C_loss: -0.41   → W estimate 0.41
Epoch 25 | C_loss: -0.12   → W estimate 0.12   (fakes close to real)

As samples improve, the W estimate FALLS → C_loss RISES toward 0.

In BCE GAN:  loss ≈ 0.693 tells you nothing about quality
In WGAN:     a falling W estimate tracks better images
```

Plot −C_loss (the W estimate), not C_loss, so "down = better".

You can finally use the loss curve to track training progress, like in any normal neural network.

---

## 8. Side-by-Side: BCE GAN vs WGAN

```
┌──────────────────────────────────┬──────────────────────────────────┐
│          BCE GAN                 │          WGAN                    │
├──────────────────────────────────┼──────────────────────────────────┤
│ Discriminator (classifier)       │ Critic (scorer)                  │
│ Output: probability [0, 1]       │ Output: score (-inf, +inf)       │
│ Last layer: Sigmoid              │ Last layer: Linear (none)        │
│ Loss: BCELoss                    │ Loss: mean subtraction           │
│ Optimizer: Adam                  │ Optimizer: RMSProp               │
│ D:G ratio = 1:1                  │ C:G ratio = 5:1                  │
│ D too strong = bad               │ C stronger = better              │
│ Loss curve = meaningless         │ Loss curve = tracks quality      │
│ Needs tricks to stabilize        │ Stable by design                 │
│ No constraint                    │ Lipschitz (weight clipping)      │
└──────────────────────────────────┴──────────────────────────────────┘
```

---

## 9. What Weight Clipping Gets Wrong

WGAN with weight clipping is a big step forward, but it's not perfect:

```
Problem 1: Capacity loss
  After clipping, most weights are pushed to -0.01 or +0.01
  The Critic becomes too simple
  It can't model complex real vs fake differences

Problem 2: Sensitive to clip value
  c = 0.001 → Critic too weak, slow training
  c = 0.1   → Lipschitz too loose, unstable
  Finding the right c requires tuning

Problem 3: Slow convergence
  The restricted Critic learns slowly
  Need many more epochs than necessary
```

**The fix?** Replace weight clipping with **Gradient Penalty** — that's L09 (WGAN-GP).

---

## 10. Summary

| Concept | What you learned |
|---|---|
| **Earth Mover's Distance** | "How much work to reshape one pile into another" — keeps shrinking as the piles approach |
| **KR duality** | W₁ = sup over 1-Lipschitz f of E_real[f] − E_fake[f]; the Critic plays f |
| **Critic** | Replaces Discriminator — outputs unbounded score, no Sigmoid |
| **WGAN loss** | C: maximize gap between real/fake scores. G: maximize fake scores |
| **Lipschitz constraint** | Critic can't change too fast — keeps Wasserstein estimate valid |
| **Weight clipping** | Brute-force Lipschitz: clamp weights to [-c, c] after every update (gives K-Lipschitz) |
| **5:1 training** | Train Critic 5x per Generator update — stronger C = better gradient |
| **Meaningful loss** | W estimate (−C_loss) going down = images getting better |

---

## Knowledge Check

1. Fake piles at {0, 2}, real at {1, 5}: what are W₁ and JS? *(W₁ = 2.0 via 0→1, 2→5; JS = log 2 = 0.693, and JS stays 0.693 if the fakes move to {100, 102}.)*
2. Why can't a Critic end in a Sigmoid? *(Its gap must estimate a distance of any size; a probability saturates in (0, 1).)*
3. Write the Critic loss and Generator loss, and say which one moves toward 0 as G improves. *(L_C = −E[C(real)] + E[C(fake)], L_G = −E[C(fake)]; −L_C is the W estimate, so L_C rises toward 0.)*
4. What breaks without the Lipschitz rule? *(C can widen the gap without limit — the "distance" explodes and means nothing.)*
5. With clipping, does the Critic estimate W₁ exactly? *(No — K·W₁ for an unknown K; consistent across steps, so still useful.)*
6. Why train C five times per G step here, when Unit 1 warned against a strong D? *(A better critic gives a better W estimate and better gradients; with BCE a strong D made JS stuck.)*
7. Why did WGAN use RMSprop? *(Momentum-based Adam was observed to be unstable on the critic's non-stationary objective.)*

---

## Next Lesson

L09: **WGAN-GP** — replace weight clipping with Gradient Penalty. Smarter, faster, better. The Critic gets its full power back, and we can use Adam again.
