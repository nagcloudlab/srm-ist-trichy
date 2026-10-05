# Session 3: Neural Networks Fast-Track

> You need to understand what's inside G and D before building them. This is a rapid tour — enough to build a GAN today.

---

## Part A: What Is a Neuron?

Our final goal is to build a **GAN** — two neural networks competing. But neural networks are made of **neurons**. So we start with the smallest piece.

```
One neuron
  -> Many neurons (a layer)
    -> Many layers (a deep network)
      -> Two competing networks (a GAN)
```

### The neuron equation

$$\hat{y} = w \times x + b$$

| Symbol | Name | Example |
|---|---|---|
| `x` | **Input** | Distance (km) |
| `w` | **Weight** | 2 (how strongly input matters) |
| `b` | **Bias** | 5 (fixed baseline) |
| `y` | **Output** | Predicted delivery time |

```python
distance = 4
weight = 2
bias = 5

prediction = weight * distance + bias
print("Predicted time:", prediction, "minutes")    # 13 minutes
```

- The **weight** is a volume knob — controls how strongly input affects output
- The **bias** is a fixed shift added to every prediction
- **Learning** means finding the right w and b automatically from data

---

## Part B: Why One Neuron Is Not Enough

A single neuron computes a straight line: `y = wx + b`. But what if the data is curved (like `y = x^2`)?

```python
# A single neuron trying to learn y = x^2
x = [-2, -1, 0, 1, 2]
y = [ 4,  1, 0, 1, 4]    # U-shaped!

# Best a line can do: always predict 2 (the average)
# Loss = 2.8 -- never improves. The model can't bend.
```

**Stacking linear layers doesn't help** — they collapse into one line:

```
Layer 1: h = 2x + 1
Layer 2: y = 3h + 4
Combined: y = 6x + 7     STILL A LINE!
```

### The fix: ReLU activation

$$ReLU(z) = \max(0, z)$$

| Input z | ReLU(z) |
|---:|---:|
| -3 | 0 (blocked) |
| -1 | 0 (blocked) |
| 0 | 0 |
| 2 | 2 (passes through) |
| 5 | 5 (passes through) |

```
  WITHOUT ReLU (collapses):           WITH ReLU (bends):

  Linear --> Linear = line            Linear --> ReLU --> Linear = can bend!
```

The **bend at zero** is the nonlinearity. When placed between layers, it prevents them from collapsing. This is what makes a network **deep**.

### Two ReLU neurons can make a V-shape

```python
import numpy as np

x = np.array([-2.0, -1.0, 0.0, 1.0, 2.0])

h1 = np.maximum(0, x)      # ReLU(x)  -- active for positive x
h2 = np.maximum(0, -x)     # ReLU(-x) -- active for negative x

output = h1 + h2

print("Input: ", x)       # [-2, -1, 0, 1, 2]
print("Output:", output)   # [ 2,  1, 0, 1, 2]  -- it's |x|!
```

```
  Neuron 1: ReLU(x)          Neuron 2: ReLU(-x)         Combined: h1 + h2

  h1                          h2                          y
  2 |          /              2 |\                        2 |\          /
    |        /                   |  \                        |  \      /
  1 |      /                  1 |    \                    1 |    \  /
    |    /                       |      \                      |    \/
  0 |___*                     0 |        *___             0 |    *
    +--+--+--+--> x              +--+--+--+--> x              +--+--+--+--> x
      -2  0  2                     -2  0  2                     -2  0  2

  handles RIGHT side          handles LEFT side           V-SHAPE!
```

Each neuron handles **one side**. **Impossible with one linear neuron.**

---

## Part C: Hidden Layers and the Forward Pass

Put neurons in the middle — "hidden" because we don't tell them what to produce:

```
Input  ->  [hidden neurons + ReLU]  ->  [output neuron]  ->  Output
```

**Follow x = 3 through the network** (weights: w1=1, w2=-1, v1=1, v2=1):

```
         x = 3
          |
   +------+------+
   |              |
 x1              x(-1)
   |              |
 z1=3          z2=-3
   |              |
 ReLU          ReLU
   |              |
 h1=3          h2=0       <- neuron 2 is OFF (negative input blocked)
   |              |
   +------+------+
          |
    y = 3 + 0 = 3
```

Two new names:
- **z** = before ReLU (pre-activation)
- **h** = after ReLU (activation)

Try it:

```python
def relu(z):
    return max(0.0, z)

w1, w2 = 1.0, -1.0
v1, v2 = 1.0, 1.0

for x in [-3.0, -1.0, 0.0, 1.0, 3.0]:
    h1 = relu(w1 * x)
    h2 = relu(w2 * x)
    prediction = v1 * h1 + v2 * h2
    print(f"x={x:4.0f}  h1={h1:.0f} h2={h2:.0f}  y={prediction:.0f}")
```

```
x=  -3  h1=0 h2=3  y=3
x=  -1  h1=0 h2=1  y=1
x=   0  h1=0 h2=0  y=0
x=   1  h1=1 h2=0  y=1
x=   3  h1=3 h2=0  y=3
```

The network produces |x| — a V-shape!

---

## Part D: Backpropagation (How Networks Learn)

The network makes a prediction. If it's wrong, how does the error reach the hidden weights to fix them?

**Answer: pass the blame backward, one connection at a time.**

```
  x=2 --[w=1]--> z=2 --[ReLU]--> h=2 --[v=1]--> y=2     target=4
                                                            loss=4
```

| Step | What | Calculation |
|---:|---|---|
| 1 | Forward pass | z=2, h=2, y=2, loss=4 |
| 2 | How wrong? | blame = 2x(2-4) = **-4** |
| 3 | Output weight gradient | grad_v = blame x h = -4 x 2 = **-8** |
| 4 | Pass blame to h | blame_at_h = blame x v = -4 x 1 = **-4** |
| 5 | Through ReLU? | z=2 > 0 -> gate OPEN -> blame passes |
| 6 | Hidden weight gradient | grad_w = blame x x = -4 x 2 = **-8** |
| 7 | Update weights | w = 1.0 - 0.01x(-8) = **1.08** |
| 8 | Check | loss drops from 4.0 to 2.78 |

**The full backward flow:**

```
  loss = 4
    |
    | Step 2: blame = 2x(2-4) = -4
    v
  y = 2
    |                 \
    | Step 4:          Step 3:
    | blame x v        blame x h
    | = -4 x 1         = -4 x 2
    v                    v
  blame_at_h = -4      grad_v = -8  <- v adjusts by this
    |
    | Step 5: ReLU
    | z=2 positive -> gate OPEN
    | blame x 1 = -4
    v
  blame_at_z = -4
    |
    | Step 6:
    | blame x x
    | = -4 x 2
    v
  grad_w = -8  <- w adjusts by this
```

**Key insight:** If ReLU blocked during forward pass (z < 0), it also blocks blame backward. This is the **dead ReLU** problem — fixed with **LeakyReLU** in GANs.

---

## Part E: Sigmoid and Binary Cross-Entropy

A GAN's Discriminator needs to say "real or fake" — a probability between 0 and 1.

### Sigmoid squashes any number to 0-1

$$\sigma(z) = \frac{1}{1 + e^{-z}}$$

```python
import numpy as np

def sigmoid(z):
    return 1 / (1 + np.exp(-z))

for z in [-5, -2, 0, 2, 5]:
    print(f"sigmoid({z:3}) = {sigmoid(z):.4f}")
```

```
sigmoid( -5) = 0.0067    almost certainly fake
sigmoid( -2) = 0.1192    probably fake
sigmoid(  0) = 0.5000    can't tell
sigmoid(  2) = 0.8808    probably real
sigmoid(  5) = 0.9933    almost certainly real
```

### ReLU vs Sigmoid

| | ReLU | Sigmoid |
|---|---|---|
| Output range | 0 to infinity | **0 to 1** |
| Used for | Hidden layers | **Output layer (classification)** |
| Purpose | Add nonlinearity | Produce a **probability** |

### BCE Loss — punishes confident wrong answers

$$BCE = -[y \cdot \log(p) + (1-y) \cdot \log(1-p)]$$

```
Target = 1 (real), prediction = 0.01:
  MSE loss  = 0.98    (mild punishment)
  BCE loss  = 4.61    (severe punishment!)

BCE is much harsher on confident wrong answers.
That's what we want for classification.
```

### How this connects to GANs

```
  Generator makes fake image
         |
  Discriminator sees it
         |
  Sigmoid -> p = 0.8
         |
  BCE loss with target = 0 (it's fake)
  loss = -log(1 - 0.8) = 1.61   <-- "you were fooled!"

  D updates to output lower p for fakes.
  G updates to make fakes that get higher p.
```

---

## Part F: PyTorch — Let the Framework Do the Hard Work

In a real network with millions of weights, writing gradients by hand is impossible. **PyTorch calculates ALL gradients automatically.**

### Automatic gradients — the one-liner

```python
import torch

w = torch.tensor(1.0, requires_grad=True)
x = torch.tensor(2.0)
target = torch.tensor(4.0)

prediction = w * x
loss = (prediction - target) ** 2

loss.backward()         # ALL gradients, automatically!
print(f"gradient of w = {w.grad.item()}")    # -8.0
```

We spent an entire section deriving gradient = -8 by hand. PyTorch did it in **one line**.

### Build a network with nn.Sequential

```python
import torch.nn as nn

model = nn.Sequential(
    nn.Linear(1, 4),      # 1 input -> 4 hidden neurons
    nn.ReLU(),             # activation
    nn.Linear(4, 1),      # 4 hidden -> 1 output
    nn.Sigmoid()           # squash to 0-1
)
```

### The training loop — 3 lines that do everything

```python
optimizer.zero_grad()    # 1. Clear old gradients
loss.backward()          # 2. Calculate ALL gradients (backpropagation!)
optimizer.step()         # 3. Update ALL weights
```

| Line | What it does | What we did manually |
|---|---|---|
| zero_grad() | Clears old gradients | -- |
| backward() | Backpropagation | Steps 2-6 above |
| step() | w = w - lr x gradient | Step 7 above |

### Complete classifier in PyTorch

```python
import torch
import torch.nn as nn

X = torch.tensor([[-3.], [-2.], [-1.], [1.], [2.], [3.]])
y = torch.tensor([[0.], [0.], [0.], [1.], [1.], [1.]])

model = nn.Sequential(
    nn.Linear(1, 4), nn.ReLU(),
    nn.Linear(4, 1), nn.Sigmoid()
)

loss_fn = nn.BCELoss()
optimizer = torch.optim.SGD(model.parameters(), lr=0.1)

for epoch in range(1, 201):
    pred = model(X)
    loss = loss_fn(pred, y)
    optimizer.zero_grad()
    loss.backward()
    optimizer.step()

    if epoch in [1, 50, 200]:
        print(f"Epoch {epoch:3}: loss={loss.item():.4f}")
```

```
Epoch   1: loss=0.7234
Epoch  50: loss=0.0512
Epoch 200: loss=0.0013
```

### What PyTorch replaced

| What you learned | PyTorch equivalent |
|---|---|
| y = w x x + b | nn.Linear(1, 1) |
| ReLU(z) = max(0, z) | nn.ReLU() |
| Sigmoid(z) | nn.Sigmoid() |
| BCE loss | nn.BCELoss() |
| Manual gradients | loss.backward() |
| w = w - lr x grad | optimizer.step() |

---

## Knowledge check

1. What is `y` when `w=3, b=2, x=5`?
2. Why can't stacking linear layers learn a curve?
3. What does ReLU(-3) return? ReLU(5)?
4. In backpropagation, what happens when ReLU gate is closed?
5. What range does Sigmoid output?
6. What does `loss.backward()` do?
7. What are the 3 lines in the PyTorch training loop?
