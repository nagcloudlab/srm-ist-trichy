# Lesson 3: Which Direction Should the Weight Move?

## Where we are

| Lesson 1 | Lesson 2 | **Lesson 3** |
|---|---|---|
| Predict: `ŷ = wx + b` | Measure: `MSE` | **Which way to move?** |

In Lesson 2, we tried weights 1, 2, 3 and picked the best. But a real neuron can't try every possible weight. It needs a **systematic** way to know:

> If I increase the weight slightly, will the loss go up or down?

The answer is the **gradient**.

---

## What is a gradient?

The gradient tells you the **slope** of the loss at the current weight.

$$\frac{\partial L}{\partial w}$$

Read this as: "how does the loss change when I change the weight?"

| Gradient | What it means | What to do |
|---:|---|---|
| **Negative** | Increasing w lowers the loss | Increase the weight |
| **Positive** | Increasing w raises the loss | Decrease the weight |
| **Zero** | Loss is flat here | No update |

---

## Think of a hill

Imagine you're standing on a hill (the loss curve) and you want to reach the bottom.

```
Loss
  |
  |  \                    /
  |   \                  /
  |    \                /
  |     \     ____     /
  |      \   /    \   /
  |       \_/      \_/
  |        ↑
  |     minimum
  +------------------------→ weight
```

- Standing on the **left slope** → slope is negative → move right (increase weight)
- Standing on the **right slope** → slope is positive → move left (decrease weight)
- At the **bottom** → slope is zero → you've arrived

---

## Estimate the gradient experimentally

We can estimate the slope by trying a tiny change:

```
Increase weight by 0.01, measure the loss change
```

At `w = 1.00`: MSE = 4.6667
At `w = 1.01`: MSE = 4.5738

$$gradient \approx \frac{4.5738 - 4.6667}{1.01 - 1.00} = \frac{-0.0929}{0.01} \approx -9.29$$

The gradient is **negative** → increasing the weight **reduces** the loss. Good — move that way!

---

## Try it in Python

```python
distances = [1, 2, 3]
actual_times = [7, 9, 11]

def calculate_loss(weight, bias):
    squared_errors = []
    for distance, actual in zip(distances, actual_times):
        prediction = weight * distance + bias
        squared_errors.append((prediction - actual) ** 2)
    return sum(squared_errors) / len(squared_errors)

weight = 1.0
bias = 5.0
small_change = 0.01

loss_before = calculate_loss(weight, bias)
loss_after = calculate_loss(weight + small_change, bias)

gradient = (loss_after - loss_before) / small_change

print(f"Loss at weight {weight:.2f}: {loss_before:.4f}")
print(f"Loss at weight {weight + small_change:.2f}: {loss_after:.4f}")
print(f"Estimated gradient: {gradient:.4f}")
```

Output:
```
Loss at weight 1.00: 4.6667
Loss at weight 1.01: 4.5738
Estimated gradient: -9.2867
```

---

## Test from both sides of the minimum

The best weight is 2. Let's check the gradient at weight 1 and weight 3:

| Starting weight | Gradient | Direction to reduce loss |
|---:|---:|---|
| 1.0 | **-9.29** | Increase (move toward 2) |
| 3.0 | **+9.38** | Decrease (move toward 2) |

```python
bias = 5.0
small_change = 0.01

for weight in [1.0, 3.0]:
    loss_before = calculate_loss(weight, bias)
    loss_after = calculate_loss(weight + small_change, bias)
    gradient = (loss_after - loss_before) / small_change

    direction = "increase" if gradient < 0 else "decrease"
    print(f"Weight: {weight:.1f}, Gradient: {gradient:.4f}, Direction: {direction}")
```

```
Weight: 1.0, Gradient: -9.2867, Direction: increase
Weight: 3.0, Gradient: 9.3800, Direction: decrease
```

Both gradients point **toward** weight = 2. The gradient always points toward lower loss.

---

## Why move OPPOSITE to the gradient?

The gradient points in the direction of **increasing** loss.

We want **decreasing** loss. So we move in the **opposite** direction:

$$\text{direction of improvement} = -\text{gradient}$$

- Gradient is **negative** → subtracting it makes the weight go **up**
- Gradient is **positive** → subtracting it makes the weight go **down**

This is called **gradient descent** — descending the loss hill.

---

## What the gradient does NOT tell you

The gradient tells you **which direction** to move. It does **not** tell you **how far** to move.

Moving too little → learning is slow
Moving too far → you overshoot the minimum

How far to move? That's the **learning rate** — coming in Lesson 4.

---

## Knowledge check

1. What does a negative gradient mean?
2. If the gradient is positive, should the weight increase or decrease?
3. What does a zero gradient mean?
4. Does the gradient tell us how far to move?

---

## Next lesson

We know the direction. Now we need to decide **how far** to move. That's the **learning rate** — and getting it wrong can make everything explode.
