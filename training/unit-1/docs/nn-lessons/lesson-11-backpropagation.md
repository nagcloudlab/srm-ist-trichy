# Lesson 11: Backpropagation

## Where we are

| L9 | L10 | **L11** |
|---|---|---|
| ReLU + V-shape | Hidden layer forward pass | **Backward pass** |

In Lesson 6, we fixed a single neuron's weight: `gradient = 2 × error × input`. Now we have two layers. Same idea — just keep passing the gradient backward, one connection at a time.

---

## The problem

Our network predicted 2, but the target is 4. The hidden weight `w` needs to change — but the error happened at the output, two connections away.

```
  x=2 ──[w=1]──→ z=2 ──[ReLU]──→ h=2 ──[v=1]──→ ŷ=2     target=4
                                                             loss=4
  hidden weight    ← how does the error reach here? →     error is here
```

---

## Step 1: Forward pass (save everything)

```python
x = 2.0
target = 4.0
w = 1.0     # hidden weight
v = 1.0     # output weight

z = w * x            # 1 × 2 = 2
h = max(0, z)        # ReLU(2) = 2
pred = v * h         # 1 × 2 = 2
loss = (pred - target) ** 2   # (2-4)² = 4

print(f"z = {z}")
print(f"h = {h}")
print(f"ŷ = {pred}")
print(f"loss = {loss}")
```

```
z = 2.0
h = 2.0
ŷ = 2.0
loss = 4.0
```

We save `z`, `h`, `pred` — the backward pass needs them.

```
  x=2 ──[×1]──→ z=2 ──[ReLU]──→ h=2 ──[×1]──→ ŷ=2
                                                  |
                                            target = 4
                                            loss = 4
```

---

## Step 2: How wrong is the prediction?

This is where we **start** the backward pass. The loss tells us how wrong:

```python
blame = 2 * (pred - target)
print(f"blame = {blame}")
```

```
blame = -4.0
```

**-4** means: prediction is too low, push it up.

```
                                            loss = 4
                                              |
                                              | blame = 2×(2-4) = -4
                                              ↓
                                            ŷ = 2
```

---

## Step 3: How much did output weight `v` cause this?

The output equation is `ŷ = v × h`. So `v` affected `ŷ` by `h`.

```python
grad_v = blame * h       # -4 × 2 = -8
print(f"grad_v = {grad_v}")
```

```
grad_v = -8.0
```

`v`'s gradient is **-8**. That's how much `v` needs to adjust.

```
                               h=2 ──[×v=1]──→ ŷ=2
                                                 |
                                          blame = -4
                                                 |
                               grad_v = blame × h
                                      = -4 × 2
                                      = -8
```

---

## Step 4: Pass the blame to hidden neuron's output `h`

`h` also affected `ŷ`. By how much? By `v`.

```python
blame_at_h = blame * v     # -4 × 1 = -4
print(f"blame reaching h = {blame_at_h}")
```

```
blame reaching h = -4.0
```

```
                    h=2 ──[×v=1]──→ ŷ=2
                     ↑                |
                     |          blame = -4
                     |                |
              blame × v = -4 × 1 = -4
              blame_at_h = -4
```

The blame has reached the hidden neuron's **output** (h). But it still needs to get through **ReLU** to reach `z` and then `w`.

---

## Step 5: Does ReLU let the blame through?

During the forward pass, ReLU did this:
- z was **positive** (z=2) → ReLU passed it through

The backward rule is the **same**:
- z was positive → blame **passes through** (multiply by 1)
- z was negative → blame **gets blocked** (multiply by 0)

```python
gate = 1.0 if z > 0 else 0.0     # z=2 > 0, so gate = 1
blame_at_z = blame_at_h * gate    # -4 × 1 = -4
print(f"z = {z} → gate = {gate}")
print(f"blame after ReLU = {blame_at_z}")
```

```
z = 2.0 → gate = 1.0
blame after ReLU = -4.0
```

Gate was **open**. Blame passed through unchanged.

```
            z=2 ──[ReLU]──→ h=2
             ↑                |
             |          blame = -4
             |                |
             |        gate = 1 (OPEN)
             |                |
        -4 × 1 = -4
        blame_at_z = -4
```

---

## Step 6: How much did hidden weight `w` cause this?

The hidden equation is `z = w × x`. So `w` affected `z` by `x`.

```python
grad_w = blame_at_z * x     # -4 × 2 = -8
print(f"grad_w = {grad_w}")
```

```
grad_w = -8.0
```

The blame reached the **deepest weight**!

```
  x=2 ──[×w=1]──→ z=2
                    ↑
                    |
             blame_at_z = -4
                    |
          grad_w = blame_at_z × x
                 = -4 × 2
                 = -8
```

---

## Step 7: Update both weights

```python
lr = 0.01

w_new = w - lr * grad_w     # 1.0 - 0.01 × (-8) = 1.08
v_new = v - lr * grad_v     # 1.0 - 0.01 × (-8) = 1.08

print(f"w: {w} → {w_new}")
print(f"v: {v} → {v_new}")
```

```
w: 1.0 → 1.08
v: 1.0 → 1.08
```

---

## Step 8: Did it help?

```python
new_z = w_new * x               # 1.08 × 2 = 2.16
new_h = max(0, new_z)            # ReLU(2.16) = 2.16
new_pred = v_new * new_h         # 1.08 × 2.16 = 2.3328
new_loss = (new_pred - target) ** 2   # (2.3328 - 4)² = 2.78

print(f"ŷ:    {pred} → {new_pred:.4f}")
print(f"Loss: {loss} → {new_loss:.2f}")
```

```
ŷ:    2.0 → 2.3328
Loss: 4.0 → 2.78
```

Loss dropped from **4.0 to 2.78**. One backward pass = improvement!

---

## See the full backward flow

```
  loss = 4
    |
    | Step 2: blame = 2×(2-4) = -4
    ↓
  ŷ = 2
    |                 \
    | Step 4:          Step 3:
    | blame × v        blame × h
    | = -4 × 1         = -4 × 2
    ↓                    ↓
  blame_at_h = -4      grad_v = -8  ← v adjusts by this
    |
    | Step 5: ReLU
    | z=2 positive → gate OPEN
    | blame × 1 = -4
    ↓
  blame_at_z = -4
    |
    | Step 6:
    | blame × x
    | = -4 × 2
    ↓
  grad_w = -8  ← w adjusts by this
```

---

## Experiment: what if ReLU is OFF?

Change input to `x = -2`. Everything changes at Step 5.

```python
x = -2.0
target = 4.0
w, v = 1.0, 1.0

# Forward
z = w * x             # 1 × (-2) = -2
h = max(0, z)          # ReLU(-2) = 0  ← blocked!
pred = v * h           # 1 × 0 = 0
loss = (0 - 4) ** 2   # 16

# Backward
blame = 2 * (0 - 4)                    # -8  (strong!)
blame_at_h = blame * v                  # -8 × 1 = -8
gate = 1.0 if z > 0 else 0.0           # z=-2, gate CLOSED
blame_at_z = blame_at_h * gate          # -8 × 0 = 0  ← blocked!
grad_w = blame_at_z * x                 # 0 × (-2) = 0

print(f"z = {z}")
print(f"loss = {loss}")
print(f"blame = {blame}")
print(f"gate = {gate} (CLOSED!)")
print(f"blame after ReLU = {blame_at_z}")
print(f"grad_w = {grad_w}")
```

```
z = -2.0
loss = 16
blame = -8.0
gate = 0.0 (CLOSED!)
blame after ReLU = 0.0
grad_w = 0.0
```

Loss is 16 (very wrong!) but `grad_w = 0`. The blame got **blocked at Step 5**.

```
  x=2 (gate OPEN):                 x=-2 (gate CLOSED):

  Step 2: blame = -4                Step 2: blame = -8
    ↓                                 ↓
  Step 4: blame_at_h = -4           Step 4: blame_at_h = -8
    ↓                                 ↓
  Step 5: z=2, gate OPEN            Step 5: z=-2, gate CLOSED
           blame × 1 = -4                    blame × 0 = 0
    ↓                                 ↓
  Step 6: grad_w = -8  ✓            Step 6: grad_w = 0  ✗
          w LEARNS                           w is STUCK
```

This is the **dead ReLU** problem. Fix: **Leaky ReLU** (`max(0.01z, z)`) — the gate never fully closes.

---

## Prove it works: train the full network

```python
import numpy as np

x = np.array([-2.0, -1.0, 0.0, 1.0, 2.0])
y = np.abs(x)
n = len(x)
w1, w2 = 0.5, -0.5
v1, v2 = 0.5, 0.5

for epoch in range(1, 2001):
    # Forward (Step 1)
    h1 = np.maximum(0, w1 * x)
    h2 = np.maximum(0, w2 * x)
    pred = v1 * h1 + v2 * h2

    # Backward (Steps 2-6)
    blame = 2 * (pred - y) / n
    d1 = blame * v1 * (w1 * x > 0)     # blame through ReLU for neuron 1
    d2 = blame * v2 * (w2 * x > 0)     # blame through ReLU for neuron 2
    w1 -= 0.05 * np.sum(d1 * x)         # Step 6: grad_w1
    w2 -= 0.05 * np.sum(d2 * x)         # Step 6: grad_w2
    v1 -= 0.05 * np.sum(blame * h1)     # Step 3: grad_v1
    v2 -= 0.05 * np.sum(blame * h2)     # Step 3: grad_v2

    if epoch in [1, 100, 2000]:
        pred = v1*np.maximum(0,w1*x) + v2*np.maximum(0,w2*x)
        loss = np.mean((pred - y) ** 2)
        print(f"Epoch {epoch:4}: loss={loss:.8f}")

pred = v1*np.maximum(0,w1*x) + v2*np.maximum(0,w2*x)
print(f"\nTargets:     {y}")
print(f"Predictions: {np.round(pred, 4)}")
```

```
Epoch    1: loss=0.84801916
Epoch  100: loss=0.00230882
Epoch 2000: loss=0.00000000

Targets:     [2. 1. 0. 1. 2.]
Predictions: [2.     1.     0.     1.     2.    ]
```

The network learned `|x|` by repeating Steps 1-8 two thousand times.

---

## Summary: the 8 steps

| Step | What | Code |
|---:|---|---|
| 1 | Forward pass — save z, h, ŷ | `z=w*x; h=ReLU(z); ŷ=v*h` |
| 2 | How wrong? | `blame = 2×(ŷ - target)` |
| 3 | Output weight blame | `grad_v = blame × h` |
| 4 | Pass blame to h | `blame_at_h = blame × v` |
| 5 | Through ReLU | `blame_at_z = blame_at_h × (1 if z>0 else 0)` |
| 6 | Hidden weight blame | `grad_w = blame_at_z × x` |
| 7 | Update all weights | `w -= lr × grad_w` |
| 8 | Check: did loss drop? | Run forward pass again |

---

## Knowledge check

1. At each connection, what do we multiply the blame by?
2. If `z = 5`, does ReLU pass the blame? (which step?)
3. If `z = -3`, does ReLU pass the blame?
4. Why do we save `z` during Step 1?
5. Why update all weights AFTER computing all gradients?

---

## Hands-on

Run `training/unit-1/labs/lab-p2-hidden-layers-and-backprop.ipynb` — a 2-layer ReLU network with backprop written by hand, learning |x|.

---

## Next lesson

We've been predicting **numbers**. But a GAN's Discriminator predicts **real or fake** — a probability between 0 and 1. For that we need: **Sigmoid** activation and **Binary Cross-Entropy** loss.
