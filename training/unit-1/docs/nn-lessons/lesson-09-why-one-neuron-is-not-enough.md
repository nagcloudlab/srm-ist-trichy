# Lesson 9: Why One Neuron Is Not Enough

## Where we are

| L1-L7 | L8 | **L9** |
|---|---|---|
| One neuron learns | Multiple inputs | **Linear limits + ReLU** |

Our neuron can learn `y = wx + b` — a straight line. But what if the data is **curved**?

---

## A new dataset: y = x²

| Input x | Target y |
|---:|---:|
| -2 | 4 |
| -1 | 1 |
| 0 | 0 |
| 1 | 1 |
| 2 | 4 |

```
  y
  4 |  *                 *
    |
  3 |
    |
  2 |
    |
  1 |     *         *
    |
  0 |          *
    +----+----+----+----+---> x
        -2   -1    1    2
```

A **U-shape**. Can our straight-line neuron learn this?

---

## Let the neuron try

```python
import numpy as np

x = np.array([-2.0, -1.0, 0.0, 1.0, 2.0])
y = x ** 2

weight = 1.0
bias = 0.0
learning_rate = 0.1

for epoch in range(1, 201):
    predictions = weight * x + bias
    errors = predictions - y

    weight_gradient = 2 * np.mean(errors * x)
    bias_gradient = 2 * np.mean(errors)

    weight -= learning_rate * weight_gradient
    bias -= learning_rate * bias_gradient

    if epoch in [1, 10, 50, 200]:
        loss = np.mean((weight * x + bias - y) ** 2)
        print(f"Epoch {epoch:3}: weight={weight:.4f}, bias={bias:.4f}, loss={loss:.4f}")

print("\nActual:     ", y)
print("Predictions:", np.round(weight * x + bias, 4))
```

Output:
```
Epoch   1: weight=0.6000, bias=0.4000, loss=6.0800
Epoch  10: weight=0.0060, bias=1.7853, loss=2.8462
Epoch  50: weight=0.0000, bias=2.0000, loss=2.8000
Epoch 200: weight=0.0000, bias=2.0000, loss=2.8000

Actual:      [4. 1. 0. 1. 4.]
Predictions: [2. 2. 2. 2. 2.]
```

The neuron settles on `w = 0, b = 2`. Its prediction: **always 2**.

| x | Target | Prediction | Error |
|---:|---:|---:|---:|
| -2 | 4 | 2 | -2 |
| -1 | 1 | 2 | +1 |
| 0 | 0 | 2 | +2 |
| 1 | 1 | 2 | +1 |
| 2 | 4 | 2 | -2 |

```
  y
  4 |  *                 *       <-- misses these (error = -2)
    |
  3 |
    |
  2 |--*--------*--------*----   <-- flat prediction: always 2
    |
  1 |     *         *            <-- close but wrong
    |
  0 |          *                  <-- misses this (error = +2)
    +----+----+----+----+---> x
        -2   -1    1    2
```

Loss = **2.8**. It stops here and **never improves**. More training doesn't help.

---

## Why w = 0?

The data is symmetric. Tilting the line up helps the right side but hurts the left side equally. Best tilt = no tilt.

And `b = 2` because 2 is the **average** of all y values: `(4+1+0+1+4)/5 = 2`.

---

## This is NOT a training failure

The optimizer did its job — it found the best possible line. But a line **can't bend into a curve**. This is a **model capacity** problem.

| Problem | Fix |
|---|---|
| Learning rate too small | Tune the rate |
| Not enough epochs | Train longer |
| **Model can't represent the shape** | **Change the model** |

---

## Stacking linear layers doesn't help

```
+----------+         +----------+
| Layer 1  |         | Layer 2  |
| h = 2x+1 |-------->| y = 3h+4 |------->  y = 6x + 7
+----------+         +----------+           STILL A LINE!
```

No matter how many linear layers you stack, they collapse into **one straight line**. Depth alone is useless.

```python
# Prove it: two linear layers = one linear layer
x = 4

# Two separate layers
h = 2 * x + 1       # layer 1
y_two = 3 * h + 4   # layer 2
print(f"Two layers: h={h}, y={y_two}")

# One combined layer
y_one = 6 * x + 7   # collapsed: 3(2x+1)+4 = 6x+7
print(f"One layer:  y={y_one}")
print(f"Same result: {y_two == y_one}")
```

```
Two layers: h=9, y=31
One layer:  y=31
Same result: True
```

---

## Meet ReLU

$$ReLU(z) = max(0, z)$$

| Input z | ReLU(z) | Rule |
|---:|---:|---|
| -3 | 0 | Negative → zero |
| -1 | 0 | Negative → zero |
| 0 | 0 | Zero → zero |
| 2 | 2 | Positive → passes through |
| 5 | 5 | Positive → passes through |

```
  output
    |
  4 |                    /
    |                  /
  3 |                /
    |              /
  2 |            /
    |          /
  1 |        /
    |      /
  0 |_____*
    |
    +--+--+--+--+--+--+---> input
      -3 -2 -1  0  1  2  3

    <--BLOCKED--><--PASSES-->
```

The **bend at zero** is the nonlinearity. When placed between layers, it prevents them from collapsing.

Try it:

```python
import numpy as np

inputs = [-3, -1, 0, 2, 5]

for z in inputs:
    result = max(0, z)
    print(f"ReLU({z:2}) = {result}")
```

```
ReLU(-3) = 0
ReLU(-1) = 0
ReLU( 0) = 0
ReLU( 2) = 2
ReLU( 5) = 5
```

```
WITHOUT ReLU (collapses):           WITH ReLU (bends):

+--------+      +--------+         +--------+  +------+  +--------+
|Linear 1|----->|Linear 2|         |Linear 1|->|ReLU  |->|Linear 2|
+--------+      +--------+         +--------+  +------+  +--------+
     = one straight line                 = can bend!
```

---

## Two ReLU neurons can make a V-shape

```python
import numpy as np

x = np.array([-2.0, -1.0, 0.0, 1.0, 2.0])

h1 = np.maximum(0, x)      # ReLU(x)  — active for positive x
h2 = np.maximum(0, -x)     # ReLU(-x) — active for negative x

output = h1 + h2

print("Input: ", x)
print("h1:    ", h1)
print("h2:    ", h2)
print("Output:", output)
```

```
Input:  [-2. -1.  0.  1.  2.]
h1:     [0. 0. 0. 1. 2.]
h2:     [2. 1. 0. 0. 0.]
Output: [2. 1. 0. 1. 2.]
```

The output is `|x|` — a V-shape. **Impossible with one linear neuron.**

| x | h1 = ReLU(x) | h2 = ReLU(-x) | h1 + h2 |
|---:|---:|---:|---:|
| -2 | 0 (off) | 2 (on) | 2 |
| -1 | 0 (off) | 1 (on) | 1 |
| 0 | 0 | 0 | 0 |
| 1 | 1 (on) | 0 (off) | 1 |
| 2 | 2 (on) | 0 (off) | 2 |

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

Each neuron handles **one side**. Without ReLU: `x + (-x) = 0` — the shape disappears.

```python
# Prove it: remove ReLU and the V-shape dies
x = np.array([-2.0, -1.0, 0.0, 1.0, 2.0])

# WITH ReLU
h1 = np.maximum(0, x)
h2 = np.maximum(0, -x)
print("With ReLU:   ", h1 + h2)

# WITHOUT ReLU
h1_no = x
h2_no = -x
print("Without ReLU:", h1_no + h2_no)
```

```
With ReLU:    [2. 1. 0. 1. 2.]
Without ReLU: [0. 0. 0. 0. 0.]
```

---

## The architecture of every deep network

```
+-------+   +--------+   +------+   +--------+   +------+   +--------+
| Input |-->|Weighted |-->| ReLU |-->|Weighted |-->| ReLU |-->| Output |
|       |   |  Sum    |   |      |   |  Sum    |   |      |   |        |
+-------+   +--------+   +------+   +--------+   +------+   +--------+
              Layer 1                  Layer 2
```

Each `[weighted sum → ReLU]` is one layer. ReLU prevents collapse. This is what makes a network **deep**.

In a GAN:
- **Generator**: noise → layers with ReLU → fake data
- **Discriminator**: data → layers with ReLU → real or fake?

---

## Knowledge check

1. Why can't `ŷ = wx + b` learn `y = x²`?
2. Does training longer fix a model capacity problem?
3. Why does stacking two linear layers still produce a straight line?
4. What does `ReLU(-3)` return?
5. What does `ReLU(5)` return?
6. Without ReLU, what is `x + (-x)`?

---

## Next lesson

We saw that two ReLU neurons can make a V-shape. But we hand-picked the weights. Can a network with a **hidden layer** learn the right weights by itself? That's **backpropagation** — the engine of deep learning.
