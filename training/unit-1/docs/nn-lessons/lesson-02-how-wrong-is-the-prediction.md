# Lesson 2: How Wrong Is the Prediction?

## Why do we need this?

In Lesson 1, our neuron predicted `ŷ = wx + b`. But we set `w` and `b` manually.

To make the neuron **learn**, it needs to know: **how wrong am I?**

That measurement is called the **loss**.

---

## Start with a wrong neuron

Suppose the neuron starts with **bad** parameters:

```
w = 1,  b = 5    (wrong weight — should be 2)
```

Its prediction rule: `ŷ = 1×x + 5`

| Distance | Actual time | Prediction | Error |
|---:|---:|---:|---:|
| 1 km | 7 min | 6 min | 6 - 7 = **-1** |
| 2 km | 9 min | 7 min | 7 - 9 = **-2** |
| 3 km | 11 min | 8 min | 8 - 11 = **-3** |

Every prediction is too low. The neuron **underpredicts**.

---

## Error = Prediction minus Actual

$$error = \hat{y} - y$$

| Sign | Meaning |
|---|---|
| **Negative** error | Neuron underpredicts (too low) |
| **Positive** error | Neuron overpredicts (too high) |
| **Zero** error | Perfect prediction |

---

## The problem with raw errors

Imagine errors of `-2` and `+2`:

```
Average = (-2 + 2) / 2 = 0
```

Zero! Looks perfect — but both predictions were wrong.

Positive and negative errors **cancel each other out**. That's misleading.

**Solution:** Square every error before averaging.

---

## Mean Squared Error (MSE)

$$MSE = \frac{1}{n} \sum_{i=1}^{n} (\hat{y}_i - y_i)^2$$

In plain English: **square each error, then average them.**

For our three predictions:

```
Errors:          -1,    -2,    -3
Squared:          1,     4,     9
Average:   (1 + 4 + 9) / 3 = 4.67
```

$$MSE = 4.67$$

This single number is called the **loss**.

- **Lower loss** = predictions are closer to reality
- **Loss of zero** = every prediction is exactly right
- Squaring prevents cancellation AND punishes big mistakes more

---

## Try it in Python

```python
distances = [1, 2, 3]
actual_times = [7, 9, 11]

weight = 1
bias = 5

squared_errors = []

for distance, actual in zip(distances, actual_times):
    prediction = weight * distance + bias
    error = prediction - actual
    squared_errors.append(error ** 2)
    print(f"Distance: {distance}, Actual: {actual}, Prediction: {prediction}, Error: {error}")

mse = sum(squared_errors) / len(squared_errors)
print(f"\nMSE: {mse:.2f}")
```

Output:
```
Distance: 1, Actual: 7, Prediction: 6, Error: -1
Distance: 2, Actual: 9, Prediction: 7, Error: -2
Distance: 3, Actual: 11, Prediction: 8, Error: -3

MSE: 4.67
```

---

## Experiment: Try different weights

Keep `bias = 5`. Which weight gives the lowest loss?

| Weight | Predictions | Errors | MSE |
|---:|---|---|---:|
| 1 | 6, 7, 8 | -1, -2, -3 | **4.67** |
| 2 | 7, 9, 11 | 0, 0, 0 | **0.00** |
| 3 | 8, 11, 14 | 1, 2, 3 | **4.67** |

```python
distances = [1, 2, 3]
actual_times = [7, 9, 11]
bias = 5

for weight in [1, 2, 3]:
    squared_errors = []
    for distance, actual in zip(distances, actual_times):
        prediction = weight * distance + bias
        error = prediction - actual
        squared_errors.append(error ** 2)
    mse = sum(squared_errors) / len(squared_errors)
    print(f"Weight: {weight}, MSE: {mse:.2f}")
```

```
Weight: 1, MSE: 4.67
Weight: 2, MSE: 0.00
Weight: 3, MSE: 4.67
```

**w = 2 wins** with loss = 0. Every prediction matches perfectly.

Weights 1 and 3 have the same loss — they're equally far from the ideal, but in opposite directions.

---

## The two pieces so far

We now have the two essential parts of a learning system:

| Piece | What it does | Formula |
|---|---|---|
| **Neuron** | Makes predictions | `ŷ = wx + b` |
| **Loss function** | Measures quality | `MSE = average of (ŷ - y)²` |

**Learning** will mean changing `w` and `b` so that the loss gets smaller.

---

## Knowledge check

1. If prediction is 12 and actual is 10, what is the error?
2. Why do we square errors before averaging?
3. What is the MSE for errors -2, 0, and 2?
4. Does MSE = 0 guarantee the model works on new unseen data?

---

## Next lesson

We can measure how wrong the neuron is. But **which direction should the weight move** to reduce the loss? That's the **gradient** — and it's the key to learning.
