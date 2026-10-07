# Lesson 13: Build a Classifier

## Where we are

| L10 | L11 | L12 | **L13** |
|---|---|---|---|
| Hidden layer | Backpropagation | Sigmoid + BCE | **Build a classifier** |

We have all the pieces. Now let's put them together — build a network that learns to say **"yes" or "no"**.

This is exactly what a GAN's Discriminator does.

---

## The task

Can you tell if a number is **positive or negative**?

| Input x | Label y | Meaning |
|---:|---:|---|
| -3 | 0 | Negative → class 0 |
| -2 | 0 | Negative → class 0 |
| -1 | 0 | Negative → class 0 |
| 1 | 1 | Positive → class 1 |
| 2 | 1 | Positive → class 1 |
| 3 | 1 | Positive → class 1 |

Simple for us. But can a **neuron** learn this from data?

---

## The network

One neuron + Sigmoid at the output:

```
  x ──[w, b]──→ z ──[Sigmoid]──→ p
                                  |
                            0 to 1 probability
                            "how likely is class 1?"
```

Forward pass:
```
z = w × x + b          (weighted sum — same as Lesson 1)
p = sigmoid(z)          (squash to 0-1 — new from Lesson 12)
```

---

## Forward pass by hand

Start with `w = 0.5, b = 0`:

```python
import numpy as np

def sigmoid(z):
    return 1 / (1 + np.exp(-z))

w, b = 0.5, 0.0

for x in [-3, -1, 1, 3]:
    z = w * x + b
    p = sigmoid(z)
    print(f"x={x:3}  z={z:5.1f}  p={p:.4f}")
```

```
x= -3  z= -1.5  p=0.1824
x= -1  z= -0.5  p=0.3775
x=  1  z=  0.5  p=0.6225
x=  3  z=  1.5  p=0.8176
```

| x | z | p | Correct? |
|---:|---:|---:|---|
| -3 | -1.5 | 0.18 | Should be 0 → 0.18 is low ✓ |
| -1 | -0.5 | 0.38 | Should be 0 → 0.38 is not low enough |
| 1 | 0.5 | 0.62 | Should be 1 → 0.62 is not high enough |
| 3 | 1.5 | 0.82 | Should be 1 → 0.82 is high ✓ |

Not bad for a random start, but not perfect. Let's make it learn.

---

## Calculate the loss (BCE)

```python
X = np.array([-3.0, -2.0, -1.0, 1.0, 2.0, 3.0])
y = np.array([0, 0, 0, 1, 1, 1])   # 0=negative, 1=positive

w, b = 0.5, 0.0

z = w * X + b
p = sigmoid(z)

# BCE loss for each example
losses = -(y * np.log(p) + (1 - y) * np.log(1 - p))
total_loss = np.mean(losses)

for i in range(len(X)):
    print(f"x={X[i]:3.0f}  target={y[i]}  p={p[i]:.4f}  loss={losses[i]:.4f}")

print(f"\nAverage BCE loss: {total_loss:.4f}")
```

```
x= -3  target=0  p=0.1824  loss=0.2014
x= -2  target=0  p=0.2689  loss=0.3133
x= -1  target=0  p=0.3775  loss=0.4741
x=  1  target=1  p=0.6225  loss=0.4741
x=  2  target=1  p=0.7311  loss=0.3133
x=  3  target=1  p=0.8176  loss=0.2014

Average BCE loss: 0.3296
```

---

## Train it

The gradient for BCE + Sigmoid has a beautifully simple form:

$$\text{gradient} = p - y$$

That's it! If target is 1 and we predicted 0.8, the gradient is `0.8 - 1 = -0.2` (push up). If target is 0 and we predicted 0.8, the gradient is `0.8 - 0 = 0.8` (push down).

```python
X = np.array([-3.0, -2.0, -1.0, 1.0, 2.0, 3.0])
y = np.array([0, 0, 0, 1, 1, 1])
n = len(X)

w, b = 0.5, 0.0
lr = 0.1

for epoch in range(1, 201):
    # Forward
    z = w * X + b
    p = sigmoid(z)

    # Gradient (BCE + Sigmoid combined)
    error = p - y                     # simple!
    grad_w = np.mean(error * X)
    grad_b = np.mean(error)

    # Update
    w -= lr * grad_w
    b -= lr * grad_b

    if epoch in [1, 10, 50, 200]:
        loss = -np.mean(y * np.log(p) + (1-y) * np.log(1-p))
        print(f"Epoch {epoch:3}: w={w:.4f}, b={b:.4f}, loss={loss:.4f}")
```

```
Epoch   1: w=0.5488, b=0.0000, loss=0.3296
Epoch  10: w=0.8668, b=-0.0000, loss=0.2027
Epoch  50: w=1.5049, b=-0.0000, loss=0.0876
Epoch 200: w=2.3590, b=-0.0000, loss=0.0335
```

The loss drops from 0.33 to 0.0335. The neuron learned the correct decision boundary.

---

## Check the predictions

```python
z = w * X + b
p = sigmoid(z)

for i in range(len(X)):
    label = "positive" if p[i] > 0.5 else "negative"
    correct = "✓" if (p[i] > 0.5) == y[i] else "✗"
    print(f"x={X[i]:3.0f}  p={p[i]:.6f}  → {label:8}  target={y[i]}  {correct}")
```

```
x= -3  p=0.000844  → negative  target=0  ✓
x= -2  p=0.008854  → negative  target=0  ✓
x= -1  p=0.086354  → negative  target=0  ✓
x=  1  p=0.913646  → positive  target=1  ✓
x=  2  p=0.991146  → positive  target=1  ✓
x=  3  p=0.999156  → positive  target=1  ✓
```

**100% correct.** The neuron learned to classify positive vs negative.

---

## What did it learn?

```
  w = 2.36  (positive weight)
  b ≈ 0

  For x = 3:   z = 2.36 × 3 = 7.08  → sigmoid(7.08) ≈ 0.999
  For x = -3:  z = 2.36 × -3 = -7.08 → sigmoid(-7.08) ≈ 0.001
```

A large `w` makes sigmoid output very close to 0 or 1 — **confident** predictions.

```
  p
  1.0 |                        ●  ●  ●
      |                      /
  0.5 |.....................*...............
      |                  /
  0.0 |  ●  ●  ●       /
      +--+--+--+--+--+--+--+--→ x
        -3 -2 -1  0  1  2  3
```

---

## Experiment: what does `b` do?

```python
# Shift the decision boundary
w, b = 5.0, -5.0    # boundary moves to x=1

for x in [-1, 0, 1, 2, 3]:
    p = sigmoid(w * x + b)
    print(f"x={x:3}  p={p:.4f}  → {'positive' if p > 0.5 else 'negative'}")
```

```
x= -1  p=0.0000  → negative
x=  0  p=0.0067  → negative
x=  1  p=0.5000  → negative     ← decision point shifted!
x=  2  p=0.9933  → positive
x=  3  p=1.0000  → positive
```

`b` shifts **where** the 0.5 decision boundary is. `w` controls **how sharp** the transition is.

---

## This is a Discriminator!

What we just built is a baby version of a GAN's Discriminator:

| What we built | GAN Discriminator |
|---|---|
| Input: a number | Input: an image |
| Output: positive or negative? | Output: **real or fake?** |
| 1 neuron + Sigmoid | Many layers + Sigmoid |
| BCE loss | BCE loss |
| Learns from labeled data | Learns from real + generated data |

Same idea. Just bigger inputs and more layers.

```
  Our classifier:
  number ──→ [w,b] ──→ Sigmoid ──→ 0 or 1

  GAN Discriminator:
  image ──→ [many layers + ReLU] ──→ Sigmoid ──→ real or fake
```

---

## Knowledge check

1. What does the Sigmoid output represent?
2. What loss function do we use for classification?
3. The gradient for BCE + Sigmoid simplifies to what?
4. What does a large `w` do to the Sigmoid output?
5. What does `b` control?
6. How is this classifier similar to a GAN's Discriminator?

---

## Hands-on

Run `training/unit-1/labs/lab-p3-build-a-classifier.ipynb` — a Sigmoid + BCE classifier — the baby Discriminator.

---

## Next lesson

We have a classifier (Discriminator). Now we need the other half — the **Generator**. How does a network create data from random noise? And how do Generator and Discriminator train **against** each other? Time to build a GAN.
