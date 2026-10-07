# Lesson 6: Calculate the Gradient Directly

## Where we are

| L1 | L2 | L3 | L4 | L5 | **L6** |
|---|---|---|---|---|---|
| Predict | Loss | Direction | Step size | Repeat | **Exact gradient** |

Until now we estimated the gradient by nudging the weight and watching the loss change. That's approximate. A **derivative** gives the exact slope.

---

## The problem with estimation

Our old method:

```
gradient ≈ (loss_at(w + 0.001) - loss_at(w)) / 0.001
```

- Requires choosing a `small_change` value
- Result depends on how small we make it
- Settled at w = 1.9995 instead of exactly 2.0

Can we get the **exact** slope without any `small_change`? Yes — using derivatives and the **chain rule**.

---

## The chain: weight → prediction → error → loss

The weight doesn't affect the loss directly. It goes through a chain:

```
weight w
  → affects prediction: ŷ = wx + b
    → affects error: e = ŷ - y
      → affects squared error: e²
        → affects loss: average of all e²
```

The **chain rule** says: multiply the derivatives along this path.

---

## Derive it step by step (one example)

Take one example: `x = 2, y = 9, w = 1, b = 5`

**Step 1:** Prediction

$$\hat{y} = 1(2) + 5 = 7$$

**Step 2:** Error

$$e = 7 - 9 = -2$$

**Step 3:** Two connected effects

| Connection | Derivative | Value |
|---|---:|---:|
| Weight → prediction | `dŷ/dw = x` | 2 |
| Prediction → squared error | `d(e²)/dŷ = 2e` | -4 |

**Step 4:** Chain rule — multiply them

$$\frac{d(e^2)}{dw} = 2e \times x = 2(-2)(2) = -8$$

This is one example's **gradient contribution**.

---

## Intuition

The gradient contribution `2ex` combines two things:

| Part | Question it answers |
|---|---|
| **e** (error) | How wrong is the prediction? In which direction? |
| **x** (input) | How strongly does the weight influence this prediction? |

Multiplying them = **how much this example wants the weight to change**.

---

## Average across all examples

MSE averages squared errors, so the gradient averages the contributions:

$$\frac{\partial L}{\partial w} = \frac{1}{n} \sum_{i=1}^{n} 2(\hat{y}_i - y_i) \cdot x_i$$

At `w = 1, b = 5`:

| Input x | Actual y | Prediction ŷ | Error e | Contribution 2ex |
|---:|---:|---:|---:|---:|
| 1 | 7 | 6 | -1 | -2 |
| 2 | 9 | 7 | -2 | -8 |
| 3 | 11 | 8 | -3 | -18 |

$$gradient = \frac{-2 + (-8) + (-18)}{3} = \frac{-28}{3} = -9.3333...$$

Our earlier estimate was -9.2867. Close, but the exact value is **-9.3333**.

---

## Train with exact gradients

```python
distances = [1, 2, 3]
actual_times = [7, 9, 11]

weight = 1.0
bias = 5.0
learning_rate = 0.1

for step in range(1, 11):
    contributions = []
    for x, y in zip(distances, actual_times):
        prediction = weight * x + bias
        error = prediction - y
        contributions.append(2 * error * x)

    gradient = sum(contributions) / len(distances)
    weight = weight - learning_rate * gradient

    loss = sum(
        (weight * x + bias - y) ** 2
        for x, y in zip(distances, actual_times)
    ) / len(distances)

    print(f"Step {step:2}: gradient={gradient:10.6f}, weight={weight:.6f}, loss={loss:.8f}")
```

Output:
```
Step  1: gradient= -9.333333, weight=1.933333, loss=0.02074074
Step  2: gradient= -0.622222, weight=1.995556, loss=0.00009218
Step  3: gradient= -0.041481, weight=1.999704, loss=0.00000041
Step  4: gradient= -0.002765, weight=1.999980, loss=0.00000000
Step  5: gradient= -0.000184, weight=1.999999, loss=0.00000000
Step  6: gradient= -0.000012, weight=2.000000, loss=0.00000000
Step  7: gradient= -0.000001, weight=2.000000, loss=0.00000000
Step  8: gradient=  0.000000, weight=2.000000, loss=0.00000000
Step  9: gradient=  0.000000, weight=2.000000, loss=0.00000000
Step 10: gradient=  0.000000, weight=2.000000, loss=0.00000000
```

The weight reaches **exactly 2.0** — not 1.9995. No `small_change` needed.

---

## Estimated vs Exact

| | Estimated gradient | Exact gradient |
|---|---|---|
| Method | Nudge w, measure loss change | Chain rule formula |
| Needs `small_change`? | Yes | No |
| Result at w=1 | -9.2867 | **-9.3333** |
| Final weight | 1.9995 | **2.0000** |
| Speed | Slower (2 loss calculations) | Faster (1 formula) |

---

## The formula to remember

For one example:
$$\text{gradient contribution} = 2 \cdot error \cdot input = 2(\hat{y} - y) \cdot x$$

For the full dataset:
$$\frac{\partial L}{\partial w} = \frac{1}{n} \sum 2(\hat{y}_i - y_i) \cdot x_i$$

---

## Knowledge check

1. What does `dŷ/dw = x` mean in plain language?
2. Why do we multiply error by input?
3. Why do we average the contributions?
4. What advantage does the exact derivative have over the estimate?

---

## Next lesson

We learned the weight, but the bias was fixed at 5. What if we don't know the bias either? We need a **separate gradient for the bias** and must update **both parameters together**.
