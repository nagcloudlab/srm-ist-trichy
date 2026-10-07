# Lesson 7: Learn Both Weight and Bias Together

## Part 1 finale

| L1 | L2 | L3 | L4 | L5 | L6 | **L7** |
|---|---|---|---|---|---|---|
| Predict | Loss | Direction | Step size | Repeat | Exact gradient | **Both params** |

Until now, we fixed the bias at 5 and only trained the weight. In a real problem, **we don't know either value**. The neuron must learn both.

---

## Weight and bias affect predictions differently

$$\hat{y} = wx + b$$

| Change | Effect on prediction |
|---|---|
| Increase `w` by 1 | Prediction changes by **x** (depends on input) |
| Increase `b` by 1 | Prediction changes by **1** (same for every input) |

This means they need **different gradients**.

---

## Two gradients

| Parameter | Gradient formula | Why? |
|---|---|---|
| Weight | `dL/dw = (1/n) Sigma 2e*x` | Weight is multiplied by x, so x appears |
| Bias | `dL/db = (1/n) Sigma 2e` | Bias is added directly, so no x |

The only difference: the weight gradient has `x`, the bias gradient doesn't.

### Why no x in the bias gradient?

$$\frac{\partial \hat{y}}{\partial w} = x \quad \text{(weight's effect depends on input)}$$

$$\frac{\partial \hat{y}}{\partial b} = 1 \quad \text{(bias shifts every prediction equally)}$$

---

## Work through it

Start with **both wrong**: `w = 1, b = 0`

| x | y | prediction = 1*x + 0 | error e | Weight: 2ex | Bias: 2e |
|---:|---:|---:|---:|---:|---:|
| 1 | 7 | 1 | -6 | -12 | -12 |
| 2 | 9 | 2 | -7 | -28 | -14 |
| 3 | 11 | 3 | -8 | -48 | -16 |

**Weight gradient:**

$$\frac{-12 + (-28) + (-48)}{3} = \frac{-88}{3} = -29.33$$

**Bias gradient:**

$$\frac{-12 + (-14) + (-16)}{3} = \frac{-42}{3} = -14$$

**Update with learning rate 0.1:**

$$w_{new} = 1 - 0.1(-29.33) = 1 + 2.933 = 3.933$$

$$b_{new} = 0 - 0.1(-14) = 0 + 1.4 = 1.4$$

The weight overshoots past 2 — that's okay. Both parameters adjust together over many steps.

---

## The critical rule: calculate both, THEN update both

```
1. Calculate ALL predictions using current w and b
2. Calculate weight gradient
3. Calculate bias gradient
4. THEN update w
5. THEN update b
```

**Why?** Both gradients must describe the **same** point. If you update `w` first, the bias gradient would be calculated at a different weight — mixing old and new parameters.

This is called a **simultaneous update**.

---

## Train both parameters

```python
distances = [1, 2, 3]
actual_times = [7, 9, 11]

weight = 1.0
bias = 0.0
learning_rate = 0.1
n = len(distances)

for epoch in range(1, 1001):
    weight_gradient = 0.0
    bias_gradient = 0.0

    for x, y in zip(distances, actual_times):
        prediction = weight * x + bias
        error = prediction - y
        weight_gradient += 2 * error * x
        bias_gradient += 2 * error

    weight_gradient /= n
    bias_gradient /= n

    weight -= learning_rate * weight_gradient
    bias -= learning_rate * bias_gradient

    if epoch in [1, 10, 100, 1000]:
        loss = sum(
            (weight * x + bias - y) ** 2
            for x, y in zip(distances, actual_times)
        ) / n
        print(f"Epoch {epoch:4}: w={weight:.4f}, b={bias:.4f}, loss={loss:.6f}")
```

Output:
```
Epoch    1: w=3.9333, b=1.4000, loss=2.562963
Epoch   10: w=3.3177, b=2.0045, loss=1.287240
Epoch  100: w=2.1475, b=4.6647, loss=0.016124
Epoch 1000: w=2.0000, b=5.0000, loss=0.000000
```

---

## Read the training story

| Epoch | Weight | Bias | Loss | What's happening? |
|---:|---:|---:|---:|---|
| 0 | 1.00 | 0.00 | -- | Both wrong |
| 1 | 3.93 | 1.40 | 2.56 | Weight overshoots, bias starts climbing |
| 10 | 3.32 | 2.00 | 1.29 | Weight coming back, bias still climbing |
| 100 | 2.15 | 4.66 | 0.02 | Getting close |
| 1000 | 2.00 | 5.00 | 0.00 | **Learned the exact rule** |

The neuron discovered `y = 2x + 5` **from data alone**. We never told it the answer.

---

## Why the weight temporarily overshoots

Early in training, both parameters are wrong. They **compensate** for each other:

- Weight too high? Bias adjusts down to offset
- Bias too low? Weight adjusts to compensate

Individual parameters don't need to move directly to their final values. What matters is that the **combined loss decreases**.

---

## Part 1 Complete!

You now understand the full learning system:

| Step | What you learned | Formula |
|---:|---|---|
| 1 | Prediction | `y = wx + b` |
| 2 | Error measurement | `MSE = (1/n) Sigma(y_hat - y)^2` |
| 3 | Direction | Gradient sign |
| 4 | Step size | `w = w - eta * gradient` |
| 5 | Repetition | Training loop |
| 6 | Exact gradient | Chain rule: `2ex` |
| 7 | Multiple parameters | Separate gradients, simultaneous update |

**This is the same process used in every neural network**, from simple neurons to deep GANs.

---

## Knowledge check

1. Why does the weight gradient contain `x` but the bias gradient doesn't?
2. Why must both gradients be calculated before either parameter is updated?
3. Can individual parameters temporarily move away from their final values?
4. What rule did the neuron learn after 1000 epochs?

---

## What's next: Part 2

One neuron with one input can only learn a straight line. Real data has **many inputs**, **curves**, and **complex patterns**.

Part 2 starts with: **A Neuron with Multiple Inputs** -- what changes when we have more than one feature?
