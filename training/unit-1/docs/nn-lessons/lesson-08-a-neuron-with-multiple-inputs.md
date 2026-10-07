# Lesson 8: A Neuron with Multiple Inputs

## Part 2 begins

We're entering **Deep Neural Networks**. Part 1 gave us the learning loop. Part 2 gives us the **power** to handle real problems.

```
Part 1 done  One input, one neuron, learning loop
Part 2 >>>   Multiple inputs -> layers -> activations -> backprop
Part 3       PyTorch, CNNs
Part 4       GANs
```

---

## Why multiple inputs?

Real predictions depend on **more than one thing**.

Delivery time depends on **distance** AND **number of packages**.

| Distance | Packages | Delivery time |
|---:|---:|---:|
| 1 km | 1 | 10 min |
| 2 km | 1 | 12 min |
| 1 km | 2 | 13 min |
| 3 km | 2 | 17 min |

The rule: `time = 2*distance + 3*packages + 5`

---

## The new equation

$$\hat{y} = w_1 x_1 + w_2 x_2 + b$$

| Symbol | Meaning | Value |
|---|---|---:|
| `x1` | Distance | varies |
| `x2` | Number of packages | varies |
| `w1` | Minutes per km | 2 |
| `w2` | Minutes per package | 3 |
| `b` | Preparation time | 5 |

This is still **one neuron**. Adding inputs gives it more incoming connections, not more neurons.

---

## Calculate a prediction

For 4 km, 2 packages:

```
y_hat = 2(4) + 3(2) + 5
```

| Component | Calculation | Contribution |
|---|---:|---:|
| Distance | 2 x 4 | 8 min |
| Packages | 3 x 2 | 6 min |
| Bias | -- | 5 min |
| **Total** | | **19 min** |

Each input makes its own weighted contribution. The neuron **adds them up**.

---

## Each weight has a separate job

| Weight | Controls |
|---|---|
| `w1 = 2` | How much **distance** affects time |
| `w2 = 3` | How much **packages** affects time |
| `b = 5` | Fixed base time for all deliveries |

Changing `w1` only affects how distance is used. Changing `w2` only affects how packages are used. They're **independent influences**.

---

## Try it in Python

```python
inputs = [
    [1, 1],
    [2, 1],
    [1, 2],
    [3, 2],
]

w1 = 2.0
w2 = 3.0
bias = 5.0

for distance, packages in inputs:
    prediction = w1 * distance + w2 * packages + bias
    print(f"Distance={distance}, Packages={packages}: "
          f"{w1*distance} + {w2*packages} + {bias} = {prediction} min")
```

Output:
```
Distance=1, Packages=1: 2.0 + 3.0 + 5.0 = 10.0 min
Distance=2, Packages=1: 4.0 + 3.0 + 5.0 = 12.0 min
Distance=1, Packages=2: 2.0 + 6.0 + 5.0 = 13.0 min
Distance=3, Packages=2: 6.0 + 6.0 + 5.0 = 17.0 min
```

---

## Each weight gets its own gradient

From Lesson 6, we know the gradient contribution is `2 * error * input`.

The **input** is different for each weight:

| Parameter | Gradient | Why? |
|---|---|---|
| `w1` (distance) | `(1/n) Sigma 2e*x1` | `w1` is multiplied by `x1` |
| `w2` (packages) | `(1/n) Sigma 2e*x2` | `w2` is multiplied by `x2` |
| `b` (bias) | `(1/n) Sigma 2e` | `b` is added directly |

The same principle from Lesson 7: **multiply error by the thing the parameter touches**.

---

## Train all three parameters

```python
training_data = [
    (1, 1, 10),
    (2, 1, 12),
    (1, 2, 13),
    (3, 2, 17),
]

w1 = 0.0
w2 = 0.0
bias = 0.0
learning_rate = 0.05
n = len(training_data)

for epoch in range(1, 5001):
    grad_w1 = 0.0
    grad_w2 = 0.0
    grad_b = 0.0

    for distance, packages, actual in training_data:
        prediction = w1 * distance + w2 * packages + bias
        error = prediction - actual

        grad_w1 += 2 * error * distance
        grad_w2 += 2 * error * packages
        grad_b += 2 * error

    grad_w1 /= n
    grad_w2 /= n
    grad_b /= n

    w1 -= learning_rate * grad_w1
    w2 -= learning_rate * grad_w2
    bias -= learning_rate * grad_b

    if epoch in [1, 10, 100, 1000, 5000]:
        loss = sum(
            (w1 * d + w2 * p + bias - a) ** 2
            for d, p, a in training_data
        ) / n
        print(f"Epoch {epoch:4}: w1={w1:.4f}, w2={w2:.4f}, b={bias:.4f}, loss={loss:.6f}")

print(f"\nPrediction for 4 km, 3 packages: {w1*4 + w2*3 + bias:.4f} min")
```

Output:
```
Epoch    1: w1=2.4500, w2=2.0500, b=1.3000, loss=19.071875
Epoch   10: w1=3.2300, w2=3.2426, b=2.1808, loss=1.221104
Epoch  100: w1=2.1692, w2=3.6094, b=3.6939, loss=0.147507
Epoch 1000: w1=2.0002, w2=3.0012, b=4.9976, loss=0.000001
Epoch 5000: w1=2.0000, w2=3.0000, b=5.0000, loss=0.000000

Prediction for 4 km, 3 packages: 22.0000 min
```

---

## The neuron discovered all three values

| Parameter | Started at | Learned | Actual |
|---|---:|---:|---:|
| `w1` (distance) | 0 | 2.0000 | 2 |
| `w2` (packages) | 0 | 3.0000 | 3 |
| `b` (bias) | 0 | 5.0000 | 5 |

Starting from **zero knowledge**, the neuron recovered the exact rule: `y = 2*x1 + 3*x2 + 5`

---

## Compact notation: the dot product

We can write inputs and weights as **vectors**:

$$\mathbf{x} = [x_1, x_2] \quad \mathbf{w} = [w_1, w_2]$$

The neuron becomes:

$$\hat{y} = \mathbf{w} \cdot \mathbf{x} + b$$

The **dot product** multiplies matching pairs and adds the results:

```
[2, 3] . [4, 2] = 2(4) + 3(2) = 8 + 9 = 17
```

Add bias: `17 + 5 = 22`

This notation scales to **any number of inputs** -- 2, 100, or 10,000.

---

## What has changed and what hasn't

| Changed | Hasn't changed |
|---|---|
| Multiple inputs | Still one neuron |
| One weight per input | Same learning loop |
| Dot product notation | Same gradient descent |
| More parameters to learn | Same "calculate all, then update all" rule |

---

## Knowledge check

1. Does adding a second input create a second neuron?
2. How many weights does a neuron with 5 inputs need?
3. Why does `w1`'s gradient contain `x1` but not `x2`?
4. What is `[1, 2] . [3, 4]`?

---

## Next lesson

We can handle multiple inputs, but this is still a **straight-line** model. What happens when the pattern is **curved**? The neuron will fail -- and we'll need something new: **activation functions**.
