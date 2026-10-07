# Lesson 10: Your First Hidden Layer

## Where we are

| L1-L7 | L8 | L9 | **L10** |
|---|---|---|---|
| One neuron learns | Multiple inputs | ReLU + why we need it | **Hidden layer** |

In Lesson 9, two ReLU neurons made a V-shape. But we hand-picked the weights. Before the network can learn them, let's understand **how the pieces connect**.

---

## One neuron vs a network

Lesson 1:

```
Input  ->  [neuron]  ->  Output
```

Now we put neurons **in the middle**:

```
Input  ->  [hidden neurons]  ->  [output neuron]  ->  Output
```

"Hidden" means we don't tell these neurons what to produce. They figure it out during training.

---

## The forward pass — follow x = 3 through the network

In Lesson 1, the forward pass was simple: `ŷ = wx + b`. Now it has more steps, but the idea is the same — data flows **forward** from input to output.

Weights: `w1=1, w2=-1, v1=1, v2=1` (biases = 0)

**Hidden neuron 1:** multiply, then ReLU

```
z1 = 1 × 3 = 3       (weighted sum)
h1 = ReLU(3) = 3     (activation — positive, passes through)
```

**Hidden neuron 2:** multiply, then ReLU

```
z2 = -1 × 3 = -3     (weighted sum)
h2 = ReLU(-3) = 0    (activation — negative, blocked!)
```

**Output neuron:** combine

```
ŷ = 1×3 + 1×0 = 3
```

```
         x = 3
          |
   +------+------+
   |              |
 ×1            ×(-1)
   |              |
 z1=3          z2=-3
   |              |
 ReLU          ReLU
   |              |
 h1=3          h2=0
   |              |
   +------+------+
          |
    ŷ = 3 + 0 = 3
```

Two new names:
- **z** = before ReLU (pre-activation)
- **h** = after ReLU (activation)

---

## Now follow x = -3

```
         x = -3
          |
   +------+------+
   |              |
 ×1            ×(-1)
   |              |
 z1=-3         z2=3
   |              |
 ReLU          ReLU
   |              |
 h1=0          h2=3
   |              |
   +------+------+
          |
    ŷ = 0 + 3 = 3
```

The **opposite** neuron activated! They take turns.

---

## Try it in Python

```python
def relu(z):
    return max(0.0, z)

w1, w2 = 1.0, -1.0
v1, v2 = 1.0, 1.0

for x in [-3.0, -1.0, 0.0, 1.0, 3.0]:
    h1 = relu(w1 * x)
    h2 = relu(w2 * x)
    prediction = v1 * h1 + v2 * h2
    print(f"x={x:4.0f}  h1={h1:.0f} h2={h2:.0f}  ŷ={prediction:.0f}")
```

```
x=  -3  h1=0 h2=3  ŷ=3
x=  -1  h1=0 h2=1  ŷ=1
x=   0  h1=0 h2=0  ŷ=0
x=   1  h1=1 h2=0  ŷ=1
x=   3  h1=3 h2=0  ŷ=3
```

The network produces |x| — same V-shape from Lesson 9.

That's the **forward pass** — input goes in, prediction comes out. Same concept as Lesson 1, just more neurons in the middle.

---

## How many parameters?

| Parameter | What it connects |
|---|---|
| w1, b1 | Input -> Hidden neuron 1 |
| w2, b2 | Input -> Hidden neuron 2 |
| v1, v2 | Hidden -> Output |
| c | Output bias |

**Total: 7.** Our Lesson 1 neuron had 2.

---

## Experiment: change v2 from 1 to 2

```python
w1, w2 = 1.0, -1.0    # reset to original
v1, v2 = 1.0, 2.0     # changed v2!

for x in [-3.0, 0.0, 3.0]:
    h1 = relu(w1 * x)
    h2 = relu(w2 * x)
    print(f"x={x:4.0f}  ŷ={v1*h1 + v2*h2:.0f}")
```

```
x=  -3  ŷ=6    (was 3)
x=   0  ŷ=0    (same)
x=   3  ŷ=3    (same)
```

Only the **left side** changed. v2 scales neuron 2, which only activates for negative x.

---

## Experiment: same hidden weights = wasted

```python
w1, w2 = 0.5, 0.5     # identical!

for x in [-2.0, 0.0, 2.0]:
    h1 = relu(w1 * x)
    h2 = relu(w2 * x)
    print(f"x={x:4.0f}  h1={h1:.1f} h2={h2:.1f}  <- same!")
```

```
x=  -2  h1=0.0 h2=0.0  <- same!
x=   0  h1=0.0 h2=0.0  <- same!
x=   2  h1=1.0 h2=1.0  <- same!
```

Two neurons doing the same job. Wasted. Hidden weights must start **different**.

---

## It can learn (preview)

We'll understand the backward pass in Lesson 11. But proof it works:

```python
import numpy as np

x = np.array([-2.0, -1.0, 0.0, 1.0, 2.0])
y = np.abs(x)
n = len(x)
w1, b1, w2, b2 = 0.5, 0.0, -0.5, 0.0
v1, v2, c = 0.5, 0.5, 0.0

for epoch in range(1, 2001):
    h1 = np.maximum(0, w1*x+b1)
    h2 = np.maximum(0, w2*x+b2)
    pred = v1*h1 + v2*h2 + c
    g = 2*(pred-y)/n
    d1 = g*v1*(w1*x+b1>0); d2 = g*v2*(w2*x+b2>0)
    w1 -= 0.05*np.sum(d1*x); b1 -= 0.05*np.sum(d1)
    w2 -= 0.05*np.sum(d2*x); b2 -= 0.05*np.sum(d2)
    v1 -= 0.05*np.sum(g*h1); v2 -= 0.05*np.sum(g*h2)
    c  -= 0.05*np.sum(g)
    if epoch in [1, 100, 2000]:
        pred = v1*np.maximum(0,w1*x+b1) + v2*np.maximum(0,w2*x+b2) + c
        print(f"Epoch {epoch:4}: loss={np.mean((pred-y)**2):.8f}")

pred = v1*np.maximum(0,w1*x+b1) + v2*np.maximum(0,w2*x+b2) + c
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

It discovered the right weights on its own! But how? That's next.

---

## Knowledge check

1. What does "hidden" mean?
2. What is z? What is h?
3. How many parameters does this network have?
4. What happens if both hidden weights are identical?
5. What is a forward pass?

---

## Next lesson

The forward pass makes predictions. But how does the error travel **backward** to update hidden weights? That's **backpropagation**.
