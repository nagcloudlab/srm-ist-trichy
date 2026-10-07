# Lesson 4: How Far Should the Weight Move?

## Where we are

| Lesson 1 | Lesson 2 | Lesson 3 | **Lesson 4** |
|---|---|---|---|
| Predict | Measure loss | Find direction | **How far?** |

We know the gradient tells us **which way** to move. But how **big** should the step be?

That's controlled by the **learning rate**.

---

## The gradient descent update rule

$$w_{new} = w_{old} - \text{learning rate} \times \text{gradient}$$

Using symbols:

$$w_{new} = w_{old} - \eta \frac{\partial L}{\partial w}$$

| Symbol | Name | Role |
|---|---|---|
| `w_old` | Current weight | Where we are now |
| `η` (eta) | **Learning rate** | Controls step size |
| `gradient` | Slope of loss | Direction and steepness |
| `w_new` | Updated weight | Where we move to |

---

## Work through one update

```
weight       = 1.0
gradient     = -9.2867
learning_rate = 0.05
```

$$w_{new} = 1.0 - 0.05 \times (-9.2867) = 1.0 + 0.4643 = 1.4643$$

The weight moved from 1.0 toward 2.0. Loss should be lower now.

### Why subtract?

- Gradient is **negative** → subtracting a negative = **adding** → weight goes **up**
- Gradient is **positive** → subtracting a positive = **subtracting** → weight goes **down**

Both cases move toward lower loss.

---

## Try it in Python

```python
distances = [1, 2, 3]
actual_times = [7, 9, 11]

def calculate_loss(weight, bias):
    return sum(
        (weight * x + bias - y) ** 2
        for x, y in zip(distances, actual_times)
    ) / len(distances)

weight = 1.0
bias = 5.0
small_change = 0.01
learning_rate = 0.05

loss_before = calculate_loss(weight, bias)

gradient = (calculate_loss(weight + small_change, bias) - loss_before) / small_change

new_weight = weight - learning_rate * gradient

loss_after = calculate_loss(new_weight, bias)

print(f"Weight: {weight:.4f} -> {new_weight:.4f}")
print(f"Loss:   {loss_before:.4f} -> {loss_after:.4f}")
```

Output:
```
Weight: 1.0000 -> 1.4643
Loss:   4.6667 -> 1.3391
```

One step and the loss dropped from 4.67 to 1.34. That's one **learning step**.

---

## What happens with different learning rates?

Start at `weight = 1.0` each time. Change only the learning rate:

| Learning rate | New weight | New loss | What happened? |
|---:|---:|---:|---|
| 0.01 | 1.0929 | 3.8402 | Improved, but tiny step |
| 0.10 | 1.9287 | 0.0237 | Big improvement! |
| 0.30 | 3.7860 | 14.8857 | **Loss got WORSE** |

```python
starting_weight = 1.0
bias = 5.0
small_change = 0.01

loss_before = calculate_loss(starting_weight, bias)
gradient = (calculate_loss(starting_weight + small_change, bias) - loss_before) / small_change

for learning_rate in [0.01, 0.10, 0.30]:
    new_weight = starting_weight - learning_rate * gradient
    loss_after = calculate_loss(new_weight, bias)
    print(f"Rate: {learning_rate:.2f}, New weight: {new_weight:.4f}, Loss: {loss_after:.4f}")
```

```
Rate: 0.01, New weight: 1.0929, Loss: 3.8402
Rate: 0.10, New weight: 1.9287, Loss: 0.0237
Rate: 0.30, New weight: 3.7860, Loss: 14.8857
```

---

## The learning rate trade-off

| Too small (0.01) | Just right (0.10) | Too large (0.30) |
|---|---|---|
| Safe but slow | Fast and stable | **Overshoots!** |
| Many steps needed | Reaches minimum quickly | Jumps past minimum |
| Loss decreases slowly | Loss drops rapidly | Loss gets WORSE |

### What is overshooting?

With `η = 0.30`, the weight jumped from 1.0 all the way to 3.79 — it **flew past** the ideal weight of 2.0 and landed on the other side, farther away than it started!

```
        too far!
         ──────→
    1.0        2.0        3.79
     ●─────────┼──────────●
   start     ideal     landed
```

The gradient gave the right **direction**, but the step was too **big**.

---

## The four parts of one learning step

| Step | What happens |
|---:|---|
| 1 | Calculate the current loss |
| 2 | Calculate the gradient |
| 3 | Update: `w = w - η × gradient` |
| 4 | Check: did the loss go down? |

This is one learning step. Next lesson, we **repeat** it.

---

## Knowledge check

1. What does the learning rate control?
2. If gradient = -4 and learning rate = 0.1, how much does the weight change?
3. If gradient = 6 and learning rate = 0.05, does the weight increase or decrease? By how much?
4. Why can moving in the correct direction still make the loss worse?

---

## Next lesson

One learning step improved the weight. But one step isn't enough. We need to **repeat** — predict, measure, gradient, update — over and over. That's the **training loop**.
