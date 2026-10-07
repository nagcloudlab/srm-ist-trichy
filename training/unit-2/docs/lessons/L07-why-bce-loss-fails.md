# Lesson 07: Why BCE Loss Fails

## Where we are

| Unit 1 | **Unit 2** |
|---|---|
| Built GANs, saw them break, applied tricks | **Fix the ROOT cause — the loss function itself** |

At the end of Unit 1 ("Build GANs" → *When GANs break*) we fought GAN problems with tricks — one-sided label smoothing, instance noise, learning-rate balance (TTUR). Those are **band-aids**. The real problem is deeper.

**What BCE measures is the problem.** This lesson explains why. L08 introduces WGAN — a fundamentally better distance.

---

## 1. Quick Recap: BCE Loss in GANs

Notation as in Unit 1: D(x) = probability that x is real; real label 1, fake label 0; a = D's raw score (logit) on a fake, so D(G(z)) = σ(a).

$$L_D = -[\log D(x) + \log(1 - D(G(z)))]$$

Two possible generator losses:

| Name | G minimises | What we train in Unit 1 |
|---|---|---|
| Minimax (original game) | log(1 − D(G(z))) | — |
| **Non-saturating** | −log D(G(z)) = BCE(D(fake), 1) | **Yes** |

D pushes D(real) → 1 and D(fake) → 0. G pushes D(fake) → 1.

---

## 2. Problem 1: Saturation — and what the non-saturating loss does and does not fix

### The minimax loss saturates

Gradient of each G loss with respect to the fake logit a:

| | Minimax log(1 − σ(a)) | Non-saturating −log σ(a) |
|---|---|---|
| Gradient w.r.t. a | −σ(a) | σ(a) − 1 |
| D(fake) = 0.5 | −0.50 | −0.50 |
| D(fake) = 0.04 | −0.04 | −0.96 |
| D(fake) = 0.0003 | −0.0003 | −0.9997 |

When D confidently rejects fakes (D(fake) → 0), the **minimax** gradient vanishes. That is why everyone trains the **non-saturating** loss: its gradient stays near −1.

### Why the non-saturating loss is still not enough

```
Epoch 1:  G_loss = 0.69  D(fake) = 0.5
Epoch 10: G_loss = 3.22  D(fake) = 0.04
Epoch 50: G_loss = 8.11  D(fake) = 0.0003
```

G's loss climbs, yet the gradient size stays ≈ 1. The signal is **strong but uninformative**: a near-perfect D is almost flat around the fakes, so its gradient does not reliably point *toward the real data*, and updates become noisy and unstable (Arjovsky & Bottou, 2017).

**Size survives. Direction does not.**

---

## 3. Problem 2: JS divergence gets stuck at log 2

### What BCE actually measures

With the optimal discriminator D*(x) = p_r(x) / (p_r(x) + p_g(x)), the GAN value becomes

$$V(D^*, G) = 2 \cdot JS(p_r \,\|\, p_g) - 2\log 2$$

So training G with BCE minimises the **Jensen–Shannon divergence** between real and fake.

### Disjoint data → JS is constant

Real images and early fakes live on thin, low-dimensional manifolds inside pixel space. They almost never overlap:

```
  Real data:        Fake data:
  ████                              ████
  ██████                            ██████
  ████████                          ████████
  ──────────────────────────────────────────→
            gap (no overlap)

JS = log 2 = 0.693  whether the gap is 1 pixel or 1000
V(D*, G) = 2·log 2 − 2·log 2 = 0
```

JS does not change as the fakes move closer, so **its gradient is zero**. In practice G trains on a nearly perfect D's gradient instead — which, as in Problem 1, is unstable and uninformative.

### Think of it like this

```
JS is a GPS that only says:
  "You have not arrived."   "You have not arrived."   "You have not arrived."
It never says HOW FAR or WHICH WAY.

Wasserstein (L08) says:
  "500 km away" → "300 km away" → "100 km away"
A distance that shrinks as you approach — so it can guide you.
```

---

## 4. Problem 3: A narrow sweet spot

```
D too weak:   its feedback is poor → G learns little
D too strong: perfect separation → JS stuck, gradients uninformative
D just right: works — but the window is NARROW
```

**D doing its job well hurts G's ability to learn.** You spend more time balancing D than training the GAN.

---

## 5. Problem 4: Mode collapse is cheap

With an optimal D, the non-saturating generator objective follows the gradient of

$$KL(p_g \,\|\, p_r) - 2 \cdot JS(p_r \,\|\, p_g)$$

The reverse KL term punishes fakes where there is **no** real data heavily, but charges almost nothing for **missing** real modes. Dropping modes is nearly free, so G drifts toward a few outputs that reliably fool D.

```
BCE asks G:   "Can you fool D?"
G answers:    "This one style fools D every time."
BCE does NOT ask: "Do your outputs cover all the real data?"
```

---

## 6. Summary: Why We Need a Better Loss

| Problem | What happens with BCE | Root cause |
|---|---|---|
| **Saturation** | Minimax gradient → 0 when D is confident | log(1 − σ(a)) flattens; non-saturating loss fixes the size only |
| **No overlap** | Loss stops measuring progress | JS = log 2 for disjoint data |
| **Narrow sweet spot** | D must be "good but not too good" | A near-perfect D gives uninformative gradients |
| **Mode collapse** | G rewarded for fooling, not for coverage | Reverse KL makes dropping modes cheap |

### What the Unit 1 tricks actually do

| Trick | What it really does |
|---|---|
| One-sided label smoothing (real = 0.9) | Stops D becoming over-confident |
| Instance noise | Blurs both distributions so they overlap |
| Learning-rate balance / TTUR | Keeps D in the useful zone |

**All tricks fight the symptoms. The disease is the distance BCE measures.**

---

## 7. What We Need: Wasserstein Distance

**Preview of L08:**

| | BCE (JS divergence) | Wasserstein distance |
|---|---|---|
| Non-overlapping data | Constant (log 2) — no signal | **Shrinks as fakes approach** |
| Stronger critic | Hurts G | **Gives a better estimate** |
| Missing modes | Nearly free | **Costs mass that must be moved** |
| Training stability | Narrow sweet spot | **Much more stable** |
| Loss value | "0.693" means nothing | **W estimate falls as samples improve** |

```
JS:          "Same or different?"       (stuck at log 2 once they don't overlap)
Wasserstein: "How far apart, in cost?"  (keeps measuring at any distance)
```

---

## Knowledge Check

1. Does the gradient of −log D(G(z)) vanish when D rejects a fake with D(fake) = 0.0003? *(No: w.r.t. the logit it is σ(a) − 1 ≈ −1. The minimax loss's −σ(a) ≈ −0.0003 is the one that vanishes.)*
2. Two non-overlapping distributions move closer. What happens to JS? *(Nothing — it stays log 2 = 0.693 until they overlap.)*
3. Why is a near-perfect D a problem even with the non-saturating loss? *(Its gradient keeps its size but stops pointing toward the real data — unstable, uninformative updates.)*
4. What does one-sided label smoothing actually treat? *(D's over-confidence — a symptom, not the distance.)*
5. Why is mode collapse cheap under BCE? *(The objective's reverse-KL part barely charges for real modes the generator ignores.)*
6. In the GPS analogy, what does Wasserstein add? *(A distance that shrinks as you approach — progress you can follow.)*

---

## Next Lesson

L08: **WGAN** — replace JS with the Wasserstein (Earth Mover's) distance. The Discriminator becomes a **Critic** C (no Sigmoid), the loss becomes meaningful, and training becomes much more stable.

Lab for Unit 2 starts in L08: `training/unit-2/labs/lab-08-wgan.ipynb`.
