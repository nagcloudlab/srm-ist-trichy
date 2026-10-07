# Lesson 12: Sigmoid and Binary Cross-Entropy

## Where we are

| L9 | L10 | L11 | **L12** |
|---|---|---|---|
| ReLU | Hidden layer | Backpropagation | **Classification** |

Until now, we predicted **numbers** (delivery time = 13 minutes). But a GAN's Discriminator needs to predict **real or fake** -- a yes/no answer.

That's **classification**. And it needs two new tools.

---

## The problem with raw numbers

Our neuron outputs any number: -5, 0, 3.7, 100...

But for "real or fake?" we need a number **between 0 and 1**:

| Output | Meaning |
|---:|---|
| close to 1 | "I think it's **real**" |
| close to 0 | "I think it's **fake**" |
| 0.5 | "I can't tell" |

How do we squash any number into the 0-1 range?

---

## Meet Sigmoid

$$\sigma(z) = \frac{1}{1 + e^{-z}}$$

Don't worry about the formula. Just see what it does:

```python
import numpy as np

def sigmoid(z):
    return 1 / (1 + np.exp(-z))

for z in [-5, -2, -1, 0, 1, 2, 5]:
    print(f"sigmoid({z:3}) = {sigmoid(z):.4f}")
```

```
sigmoid( -5) = 0.0067
sigmoid( -2) = 0.1192
sigmoid( -1) = 0.2689
sigmoid(  0) = 0.5000
sigmoid(  1) = 0.7311
sigmoid(  2) = 0.8808
sigmoid(  5) = 0.9933
```

| Input z | Output | Meaning |
|---:|---:|---|
| very negative (-5) | 0.007 | Almost certainly fake |
| negative (-2) | 0.12 | Probably fake |
| zero (0) | **0.5** | Can't tell |
| positive (2) | 0.88 | Probably real |
| very positive (5) | 0.993 | Almost certainly real |

---

## See the shape

```
  output
  1.0 |                    ___________
      |                  /
  0.8 |                /
      |              /
  0.5 |.............*...............     <-- z=0 gives exactly 0.5
      |          /
  0.2 |        /
      |      /
  0.0 |_____/
      +--+--+--+--+--+--+--+--+---> input z
        -5 -4 -3 -2 -1  0  1  2  3  4  5
```

Three key facts:
- **Always between 0 and 1** -- perfect for probabilities
- **z = 0 -> output = 0.5** -- the midpoint
- **Smooth S-shape** -- gradual transition, not a sudden jump

---

## Compare: ReLU vs Sigmoid

| | ReLU | Sigmoid |
|---|---|---|
| Output range | 0 to infinity | **0 to 1** |
| Shape | Bent line | S-curve |
| Used for | Hidden layers | **Output layer (classification)** |
| Purpose | Add nonlinearity | Produce a **probability** |

```
  ReLU:                          Sigmoid:

    |          /                 1.0|          ___
    |        /                     |        /
    |      /                   0.5|......*......
    |    /                         |    /
    |__/                        0.0|___/
    +---------> z                  +---------> z
```

---

## Now we need a new loss function

In Lesson 2, we used **MSE** (Mean Squared Error) for numbers.

For classification (0 or 1 targets), we use **Binary Cross-Entropy** (BCE):

$$BCE = -[y \cdot \log(p) + (1-y) \cdot \log(1-p)]$$

Where:
- `y` = target (1 for real, 0 for fake)
- `p` = sigmoid output (our predicted probability)

---

## Why not just use MSE?

```python
# Target: y = 1 (real)
# Our prediction: p = 0.99 (almost correct)

mse_loss = (0.99 - 1) ** 2
bce_loss = -(1 * np.log(0.99))

print(f"MSE loss:  {mse_loss:.6f}")
print(f"BCE loss:  {bce_loss:.6f}")
```

```
MSE loss:  0.000100
BCE loss:  0.010050
```

Both small -- good. But watch what happens with a **very wrong** prediction:

```python
# Target: y = 1 (real)
# Our prediction: p = 0.01 (very wrong!)

mse_loss = (0.01 - 1) ** 2
bce_loss = -(1 * np.log(0.01))

print(f"MSE loss:  {mse_loss:.4f}")
print(f"BCE loss:  {bce_loss:.4f}")
```

```
MSE loss:  0.9801
BCE loss:  4.6052
```

BCE punishes confident wrong answers **much more** than MSE. That's what we want for classification.

---

## BCE step by step

**When target = 1 (real):**

$$BCE = -\log(p)$$

The closer `p` is to 1, the smaller the loss:

```python
for p in [0.01, 0.1, 0.5, 0.9, 0.99]:
    loss = -np.log(p)
    print(f"p={p:.2f}  loss={loss:.4f}")
```

```
p=0.01  loss=4.6052    <-- very wrong, huge loss
p=0.10  loss=2.3026
p=0.50  loss=0.6931
p=0.90  loss=0.1054
p=0.99  loss=0.0101    <-- almost right, tiny loss
```

**When target = 0 (fake):**

$$BCE = -\log(1-p)$$

The closer `p` is to 0, the smaller the loss:

```python
for p in [0.01, 0.1, 0.5, 0.9, 0.99]:
    loss = -np.log(1 - p)
    print(f"p={p:.2f}  loss={loss:.4f}")
```

```
p=0.01  loss=0.0101    <-- correctly says fake, tiny loss
p=0.10  loss=0.1054
p=0.50  loss=0.6931
p=0.90  loss=2.3026
p=0.99  loss=4.6052    <-- wrongly says real, huge loss
```

---

## The combined formula

```python
def bce_loss(y, p):
    return -(y * np.log(p) + (1 - y) * np.log(1 - p))

# Test: target is REAL (y=1)
print("Target = 1 (real):")
for p in [0.1, 0.5, 0.9]:
    print(f"  predicted {p:.1f} -> loss = {bce_loss(1, p):.4f}")

# Test: target is FAKE (y=0)
print("\nTarget = 0 (fake):")
for p in [0.1, 0.5, 0.9]:
    print(f"  predicted {p:.1f} -> loss = {bce_loss(0, p):.4f}")
```

```
Target = 1 (real):
  predicted 0.1 -> loss = 2.3026    <-- wrong, high loss
  predicted 0.5 -> loss = 0.6931
  predicted 0.9 -> loss = 0.1054    <-- correct, low loss

Target = 0 (fake):
  predicted 0.1 -> loss = 0.1054    <-- correct, low loss
  predicted 0.5 -> loss = 0.6931
  predicted 0.9 -> loss = 2.3026    <-- wrong, high loss
```

---

## How this connects to GANs

```
  Generator makes fake image
         |
         v
  Discriminator sees it
         |
         v
  Sigmoid -> p = 0.8
         |
         v
  BCE loss with target = 0 (it's fake)
  loss = -log(1 - 0.8) = 1.61   <-- "you were fooled!"

  Discriminator updates to output lower p for fakes.
  Generator updates to make fakes that get higher p.
```

This is the core of GAN training. Sigmoid + BCE make it work.

---

## Knowledge check

1. What range does Sigmoid output?
2. What does sigmoid(0) return?
3. Why don't we use MSE for classification?
4. If target = 1 and prediction = 0.99, is BCE loss high or low?
5. If target = 0 and prediction = 0.99, is BCE loss high or low?
6. In a GAN, what does the Discriminator's Sigmoid output mean?

---

## Next lesson

We have all the pieces: hidden layers, backpropagation, Sigmoid, BCE. Now let's build a **classification network** -- a neuron that learns to say "yes" or "no". That's the Discriminator's job in a GAN.
