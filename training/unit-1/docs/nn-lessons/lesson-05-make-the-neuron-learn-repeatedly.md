# Lesson 5: Make the Neuron Learn Repeatedly

## Where we are

| Lesson 1 | Lesson 2 | Lesson 3 | Lesson 4 | **Lesson 5** |
|---|---|---|---|---|
| Predict | Measure | Direction | Step size | **Repeat** |

One update improved the weight. But one step isn't enough. We need to do it **over and over**.

---

## The training loop

$$\text{calculate loss} \rightarrow \text{calculate gradient} \rightarrow \text{update weight} \rightarrow \text{repeat}$$

Each time through this loop is one **step** (or **iteration**). We keep going until the loss is small enough or we've done enough steps.

---

## Why must we recalculate the gradient?

The gradient describes the slope **at the current weight**. After we move the weight, we're at a new position on the loss curve. The slope there is different.

Old gradient at old weight → **useless** after the weight changes.

---

## Train for 10 steps

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
learning_rate = 0.1
small_change = 0.001

print("Step | Weight  | Loss")
print(f"   0 | {weight:.4f} | {calculate_loss(weight, bias):.6f}")

for step in range(1, 11):
    current_loss = calculate_loss(weight, bias)
    gradient = (calculate_loss(weight + small_change, bias) - current_loss) / small_change
    weight = weight - learning_rate * gradient
    new_loss = calculate_loss(weight, bias)
    print(f"  {step:2} | {weight:.4f} | {new_loss:.6f}")

print(f"\nFinal prediction for 4 km: {weight * 4 + bias:.3f} minutes")
```

Output:
```
Step | Weight  | Loss
   0 | 1.0000 | 4.666667
   1 | 1.9329 | 0.021032
   2 | 1.9951 | 0.000114
   3 | 1.9992 | 0.000003
   4 | 1.9995 | 0.000001
   5 | 1.9995 | 0.000001
   6 | 1.9995 | 0.000001
   7 | 1.9995 | 0.000001
   8 | 1.9995 | 0.000001
   9 | 1.9995 | 0.000001
  10 | 1.9995 | 0.000001

Final prediction for 4 km: 12.998 minutes
```

---

## Read the pattern

| Observation | Why? |
|---|---|
| Biggest jump at step 1 | Gradient is largest far from the minimum |
| Steps get smaller | Gradient shrinks as weight approaches the minimum |
| Weight settles near 1.9995 | Very close to the ideal 2.0 |
| Loss drops to nearly 0 | Predictions match the data |
| Prediction for 4 km ≈ 13 | The neuron **learned** the correct rule |

The neuron started knowing nothing (`w = 1`). After 10 steps, it discovered `w ≈ 2` **on its own**.

---

## Why 1.9995 and not exactly 2.0?

We estimated the gradient using a `small_change = 0.001`. That estimate is **close** but not **exact**. It reports zero slope near 1.9995 instead of exactly at 2.0.

In Lesson 6, we'll replace this estimate with an **exact** derivative.

---

## Compare learning rates over 10 steps

```python
for learning_rate in [0.01, 0.10, 0.30]:
    weight = 1.0
    for step in range(1, 11):
        current_loss = calculate_loss(weight, bias)
        gradient = (calculate_loss(weight + small_change, bias) - current_loss) / small_change
        weight = weight - learning_rate * gradient
    final_loss = calculate_loss(weight, bias)
    print(f"Rate: {learning_rate:.2f}, Final weight: {weight:.6f}, Final loss: {final_loss:.6f}")
```

```
Rate: 0.01, Final weight: 1.624303, Final loss: 0.658692
Rate: 0.10, Final weight: 1.999500, Final loss: 0.000001
Rate: 0.30, Final weight: -354.868699, Final loss: 594324.586530
```

| Learning rate | After 10 steps | Behaviour |
|---:|---|---|
| 0.01 | weight = 1.62, loss = 0.66 | **Slow** — hasn't reached 2.0 yet |
| 0.10 | weight = 2.00, loss ≈ 0 | **Good** — fast and stable |
| 0.30 | weight = -355, loss = 594,325 | **Exploded** — completely diverged |

### What happened with 0.30?

Each overshoot is **bigger** than the last. The weight bounces wildly and the loss grows exponentially. This is called **divergence**.

```
Step 0:  weight =   1.00    loss =     4.67
Step 1:  weight =   3.80    loss =    15.10
Step 2:  weight =  -1.24    loss =    48.95
Step 3:  weight =   7.83    loss =   158.54
Step 4:  weight =  -8.49    loss =   513.80
...keeps getting worse
```

---

## The complete training process

We now have a working learning system with 5 parts:

| Part | What it does |
|---:|---|
| 1 | Make predictions using current weight |
| 2 | Measure the loss |
| 3 | Calculate the gradient |
| 4 | Update the weight |
| 5 | **Repeat** until loss is small enough |

This is the same core pattern used in every neural network — including GANs.

---

## Knowledge check

1. Why must the gradient be recalculated after every weight update?
2. Why do the weight updates get smaller near the minimum?
3. What happens with learning rate 0.01 after 10 steps?
4. Why does learning rate 0.30 diverge?

---

## Hands-on

Run `training/unit-1/labs/lab-p1-the-learning-neuron.ipynb` — a single neuron that learns w = 2, b = 5 from data (pure Python).

---

## Next lesson

Our gradient estimate uses a `small_change` trick, which is approximate. Can we calculate the **exact** gradient using calculus? Yes — using the **chain rule**. That gives us the exact slope without any estimation.
