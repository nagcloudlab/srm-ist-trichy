# Lesson 02: Build Your First GAN

## Where we are

| L00 | L01 | **L02** |
|---|---|---|
| GenAI big picture | What is a GAN? | **Build one!** |

You know the idea. Now let's build a real GAN in PyTorch and watch it learn.

We'll start with the **simplest possible task**: teach a Generator to produce the number **7**.

No images yet. Just one number. This strips away all complexity so you can see the GAN mechanics clearly.

---

## 1. The Task

| Component | What it is |
|---|---|
| **Real data** | The number 7.0 |
| **Generator** | Takes random noise → tries to output 7.0 |
| **Discriminator** | Sees a number → says "real" (1) or "fake" (0) |

```
Can the Generator learn to produce 7.0
without ever being told "the answer is 7"?

Yes. That's what we're about to see.
```

---

## 2. Build the Generator

The Generator takes **random noise** and turns it into a number.

```
Random noise (1 number) --> [Generator] --> Fake number (trying to be 7)
```

**What happens inside (the math):**

$$z = W \cdot noise + b \quad \text{(Linear layer)}$$
$$h = \text{ReLU}(z) = \max(0, z) \quad \text{(activation)}$$
$$output = W_2 \cdot h + b_2 \quad \text{(second Linear layer)}$$

The weights W and b are what the Generator **learns** during training.

```python
import torch
import torch.nn as nn

generator = nn.Sequential(
    nn.Linear(1, 16),     # noise → 16 hidden neurons
    nn.ReLU(),
    nn.Linear(16, 1),     # 16 → 1 output number
)

# Test: feed random noise, see what comes out
noise = torch.randn(1, 1)
fake = generator(noise)
print(f"Noise: {noise.item():.4f}")
print(f"Generator output: {fake.item():.4f}")
```

```
Noise: 0.3367
Generator output: -0.0547
```

Random garbage. The Generator hasn't learned anything yet. It doesn't know 7 exists.

---

## 3. Build the Discriminator

The Discriminator looks at a number and says: **real (1) or fake (0)?**

It's just a classifier — same as what you built in Lab P3.

```
Number --> [Discriminator] --> Probability (0 to 1)
```

**What happens inside:**

$$z = W \cdot input + b \quad \text{(Linear layer)}$$
$$h = \text{ReLU}(z) \quad \text{(activation)}$$
$$p = \sigma(W_2 \cdot h + b_2) \quad \text{(Sigmoid squashes to 0-1)}$$

**Sigmoid formula:**

$$\sigma(x) = \frac{1}{1 + e^{-x}}$$

- Large positive x → σ(x) ≈ 1.0 ("real")
- Large negative x → σ(x) ≈ 0.0 ("fake")
- x = 0 → σ(x) = 0.5 ("no idea")

```python
discriminator = nn.Sequential(
    nn.Linear(1, 16),     # input → 16 hidden neurons
    nn.ReLU(),
    nn.Linear(16, 1),     # 16 → 1 output
    nn.Sigmoid(),          # squash to 0-1
)

# Test: give it the real value 7
real_data = torch.tensor([[7.0]])
output = discriminator(real_data)
print(f"Input: {real_data.item()}")
print(f"D says: {output.item():.4f}")
```

```
Input: 7.0
D says: 0.5124
```

About 0.5 — D can't tell real from fake yet. It hasn't been trained.

---

## 4. Loss and Optimizers

### BCE Loss Formula

$$BCE(p, y) = -[y \cdot \log(p) + (1 - y) \cdot \log(1 - p)]$$

**What it does:**
- p = D's prediction (0 to 1)
- y = correct answer (1 = real, 0 = fake)
- Wrong predictions → high loss, correct predictions → low loss

**Example with numbers:**

```
D says 0.9 for real data (y=1):
  BCE = -[1 * log(0.9)] = -(-0.105) = 0.105    (low loss, good!)

D says 0.9 for fake data (y=0):
  BCE = -[0 + log(1 - 0.9)] = -log(0.1) = 2.302  (high loss, wrong!)
```

### How the losses work in this GAN

**Step A — Discriminator loss:**

$$L_D = -\log(D(7.0)) - \log(1 - D(G(z)))$$

- First term: pushes D to say 1 for real data (7.0)
- Second term: pushes D to say 0 for fake data (G's output)

**Step B — Generator loss:**

$$L_G = -\log(D(G(z)))$$

- Pushes D to say 1 for G's output (G wants to fool D)

### Optimizer: Adam

$$w_{new} = w_{old} - lr \times gradient$$

- Adam adjusts the learning rate for each weight automatically
- lr = 0.001 (our learning rate)
- Each network has its own optimizer — they update independently

```python
loss_fn = nn.BCELoss()

gen_optimizer = torch.optim.Adam(generator.parameters(), lr=0.001)
dis_optimizer = torch.optim.Adam(discriminator.parameters(), lr=0.001)

# Labels
real_label = torch.tensor([[1.0]])   # "this is real"
fake_label = torch.tensor([[0.0]])   # "this is fake"
```

---

## 5. The Training Loop

This is the **heart of every GAN**. Two steps, repeated thousands of times.

Remember from L01:

```
Step A: Train D — show it real and fake, update D
Step B: Train G — make fakes, G wants D to say "real", update G
```

```python
for epoch in range(1, 2001):

    # =========================================
    # Step A: Train the Discriminator
    # =========================================

    # Show D the real data → should say 1
    real_data = torch.tensor([[7.0]])
    real_pred = discriminator(real_data)
    loss_real = loss_fn(real_pred, real_label)

    # Show D the fake data → should say 0
    noise = torch.randn(1, 1)
    fake_data = generator(noise).detach()     # .detach() = don't update G here
    fake_pred = discriminator(fake_data)
    loss_fake = loss_fn(fake_pred, fake_label)

    # Update D
    dis_loss = loss_real + loss_fake
    dis_optimizer.zero_grad()
    dis_loss.backward()
    dis_optimizer.step()

    # =========================================
    # Step B: Train the Generator
    # =========================================

    # Generate fake data
    noise = torch.randn(1, 1)
    fake_data = generator(noise)              # NO detach — G learns this time
    fake_pred = discriminator(fake_data)

    # G wants D to say 1 (fooled!)
    gen_loss = loss_fn(fake_pred, real_label)

    # Update G
    gen_optimizer.zero_grad()
    gen_loss.backward()
    gen_optimizer.step()

    # =========================================
    # Print progress
    # =========================================
    if epoch in [1, 100, 500, 1000, 2000]:
        test_noise = torch.randn(1, 1)
        generated = generator(test_noise).item()
        print(f"Epoch {epoch:4d}: D_loss={dis_loss.item():.4f}  "
              f"G_loss={gen_loss.item():.4f}  "
              f"Generated={generated:.4f}")
```

```
Epoch    1: D_loss=1.3754  G_loss=0.7311  Generated=-0.1423
Epoch  100: D_loss=1.2876  G_loss=0.7543  Generated=3.2156
Epoch  500: D_loss=1.3204  G_loss=0.7198  Generated=5.8734
Epoch 1000: D_loss=1.3612  G_loss=0.6987  Generated=6.5421
Epoch 2000: D_loss=1.3863  G_loss=0.6931  Generated=6.9847
```

**Watch that last column.** The Generator's output went from **-0.14 to 6.98** — almost 7!

> This table is an idealised, smooth run. A real run usually **overshoots** first — the output climbs past 7 (often to about 9–11 around epoch 800–1000) and then settles back near 7 by epoch 2000–3000. That wobble is normal adversarial dynamics. At balance D outputs ≈ 0.5 for everything, so D_loss → 2 ln 2 ≈ 1.386 and G_loss → ln 2 ≈ 0.693 (exactly the last row above).

---

## 6. Watch It Learn

```
Epoch     1: Generated = -0.14    (random garbage)
Epoch   100: Generated =  3.22    (getting warmer)
Epoch   500: Generated =  5.87    (closer!)
Epoch  1000: Generated =  6.54    (almost!)
Epoch  2000: Generated =  6.98    (nearly 7!)
```

```
  target = 7.0
                                                    *  epoch 2000
                                               *       epoch 1000
                                          *            epoch 500
                                *                      epoch 100
  *                                                    epoch 1
  |----+----+----+----+----+----+----+----→
 -1    0    1    2    3    4    5    6    7
```

The Generator **never saw** the number 7. It only got "good" or "bad" feedback from D. Yet it discovered 7 on its own.

---

## 7. Generate Multiple Samples

```python
with torch.no_grad():
    for i in range(10):
        noise = torch.randn(1, 1)
        generated = generator(noise).item()
        print(f"  Sample {i+1}: {generated:.4f}")
```

```
  Sample 1: 6.9732
  Sample 2: 7.0156
  Sample 3: 6.9891
  Sample 4: 7.0234
  Sample 5: 6.9654
  Sample 6: 7.0087
  Sample 7: 6.9945
  Sample 8: 7.0312
  Sample 9: 6.9823
  Sample 10: 7.0001
```

All close to 7! Different noise → slightly different outputs, but all near the target.

> **Is this mode collapse in disguise?** Not here: the real data is a single value, so one output *is* the whole real distribution. With images (L03 onwards) real digits vary — a generator that gave the same digit for every noise *would* be mode collapse (L06).

---

## 8. Understand Each Part

### Why `.detach()` in Step A?

```python
fake_data = generator(noise).detach()
```

When training D, we **don't want to change G**. `.detach()` says: "use this value, but don't send gradients back to G."

Why it matters:
- Step A should compute and change **only D**.
- It skips a wasted backward pass through G.
- It keeps D-step gradients out of G's `.grad`. In this code order `gen_optimizer.zero_grad()` clears them before G's own update, so forgetting `.detach()` wastes work rather than breaking training — but move `zero_grad()` and those stray gradients would leak into G's step.

### Why does G use `real_label`?

```python
gen_loss = loss_fn(fake_pred, real_label)    # G wants D to say 1!
```

G's goal is to **fool** D. So G wants D to output 1 (real) for its fakes. If D says 0 (caught!), G gets high loss and adjusts.

### What are the two losses?

| Loss | Who learns | Goal |
|---|---|---|
| `dis_loss` | Discriminator | Say 1 for real, 0 for fake |
| `gen_loss` | Generator | Make D say 1 for fake |

They have **opposite goals**. That's why it's called **adversarial**.

### Why two optimizers?

```python
gen_optimizer = torch.optim.Adam(generator.parameters(), lr=0.001)
dis_optimizer = torch.optim.Adam(discriminator.parameters(), lr=0.001)
```

Each network learns independently. G has its own weights and optimizer. D has its own weights and optimizer. They take turns updating.

---

## 9. The Full Architecture

```
  +--------+     +-----------+     +--------+
  | Random |     |           |     | Fake   |
  | Noise  |---->| Generator |---->| Number |---+
  | (1)    |     | 1→16→1    |     |        |   |
  +--------+     +-----------+     +--------+   |
                                                 |    +---------------+
                                                 +--->|               |
                                                      | Discriminator |---> 0 or 1
                                                 +--->| 1→16→1+Sig   |
                                                 |    +---------------+
                                  +--------+     |
                                  | Real   |-----+
                                  | Data   |
                                  | (7.0)  |
                                  +--------+

  Train D: get better at telling real from fake
  Train G: get better at fooling D
  Repeat: both improve through competition
```

---

## 10. What Just Happened

Let's step back and see what we did:

| What | How |
|---|---|
| Built a Generator | `nn.Sequential(Linear, ReLU, Linear)` |
| Built a Discriminator | `nn.Sequential(Linear, ReLU, Linear, Sigmoid)` |
| Trained them against each other | Alternating Step A and Step B |
| G learned to output ~7 | Without ever being told "the answer is 7" |
| G only got feedback from D | "good" or "bad" — that's all |

**This is a working GAN.** Simple? Yes. But the exact same pattern scales to images, faces, and everything else.

The only things that change as we scale up:
- The data goes from 1 number to 784 pixels (images)
- The networks get bigger
- Everything else stays the same

---

## 11. Full Runnable Code

Here's the complete code in one block — copy, paste, run:

```python
import torch
import torch.nn as nn

# --- Networks ---
generator = nn.Sequential(
    nn.Linear(1, 16), nn.ReLU(), nn.Linear(16, 1),
)
discriminator = nn.Sequential(
    nn.Linear(1, 16), nn.ReLU(), nn.Linear(16, 1), nn.Sigmoid(),
)

# --- Loss and Optimizers ---
loss_fn = nn.BCELoss()
gen_opt = torch.optim.Adam(generator.parameters(), lr=0.001)
dis_opt = torch.optim.Adam(discriminator.parameters(), lr=0.001)

real_label = torch.tensor([[1.0]])
fake_label = torch.tensor([[0.0]])

# --- Training ---
for epoch in range(1, 2001):
    # Step A: Train D
    real_data = torch.tensor([[7.0]])
    dis_loss = loss_fn(discriminator(real_data), real_label) + \
               loss_fn(discriminator(generator(torch.randn(1,1)).detach()), fake_label)
    dis_opt.zero_grad(); dis_loss.backward(); dis_opt.step()

    # Step B: Train G
    gen_loss = loss_fn(discriminator(generator(torch.randn(1,1))), real_label)
    gen_opt.zero_grad(); gen_loss.backward(); gen_opt.step()

    if epoch % 500 == 0:
        val = generator(torch.randn(1,1)).item()
        print(f"Epoch {epoch}: Generated = {val:.4f}")

# --- Test ---
print("\n10 generated samples:")
with torch.no_grad():
    for i in range(10):
        print(f"  {generator(torch.randn(1,1)).item():.4f}")
```

---

## Knowledge Check

1. What does the Generator take as input and what does it output?
2. What does the Discriminator output and what does it mean?
3. Why does G use `real_label` in its loss?
4. What does `.detach()` do and why is it needed in Step A?
5. The Generator never saw the number 7. How did it learn to produce it?
6. Why do we need two separate optimizers?

---

## Hands-on

Run `training/unit-1/labs/lab-01-simple-gan.ipynb` — the number-7 GAN, with experiments on targets, learning rates and hidden size.

---

## Next Lesson

We built a GAN for **one number**. Next: build a GAN for **images** — 784 pixels instead of 1 number. We'll generate handwritten digits from the MNIST dataset.
