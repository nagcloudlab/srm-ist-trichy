# Lesson 1: What Is a Neuron?

## Where are we going?

Our final goal is to build a **GAN** — two neural networks competing against each other.

But neural networks are made of **neurons**. So we start with the smallest piece.

```
One neuron
  → Many neurons (a layer)
    → Many layers (a deep network)
      → Two competing networks (a GAN)
```

---

## What does a neuron do?

A neuron takes numbers in, does a simple calculation, and gives one number out.

**Example:** Predict delivery time from distance.

| Distance | Delivery time |
|---:|---:|
| 1 km | 7 min |
| 2 km | 9 min |
| 3 km | 11 min |

The pattern: every km adds **2 minutes**, plus a fixed **5 minutes** preparation.

---

## The neuron equation

$$\hat{y} = w \times x + b$$

| Symbol | Name | In our example |
|---|---|---|
| `x` | **Input** | Distance (km) |
| `w` | **Weight** | 2 (minutes per km) |
| `b` | **Bias** | 5 (fixed preparation time) |
| `ŷ` | **Output** | Predicted delivery time |

For 4 km:

```
ŷ = 2 × 4 + 5 = 13 minutes
```

---

## What does the weight do?

The weight is like a **volume knob** — it controls how strongly the input affects the output.

| Weight | Meaning |
|---:|---|
| `w = 2` | Each km adds 2 min |
| `w = 5` | Each km adds 5 min (steeper) |
| `w = 0` | Distance has NO effect |
| `w = -1` | More distance = less time |

---

## What does the bias do?

The bias is a **fixed shift** added to every prediction.

| Bias | Meaning |
|---:|---|
| `b = 5` | 5 min even at 0 km (preparation) |
| `b = 0` | No fixed cost |
| `b = 10` | 10 min base time |

---

## Try it in Python

```python
distance = 4
weight = 2
bias = 5

prediction = weight * distance + bias
print("Predicted time:", prediction, "minutes")
```

Output:
```
Predicted time: 13 minutes
```

That's it. You just ran a **forward pass** — data flows forward through the neuron to produce an output.

---

## Try different inputs

```python
weight = 2
bias = 5

for distance in [1, 2, 3, 4, 5]:
    prediction = weight * distance + bias
    print(f"Distance: {distance} km → Time: {prediction} min")
```

```
Distance: 1 km → Time: 7 min
Distance: 2 km → Time: 9 min
Distance: 3 km → Time: 11 min
Distance: 4 km → Time: 13 min
Distance: 5 km → Time: 15 min
```

Same weight and bias, different input each time.

---

## Experiment: Change the parameters

Keep `distance = 4`. Calculate in your head first:

| Experiment | Weight | Bias | Your answer? |
|---|---:|---:|---:|
| A | 3 | 5 | ? |
| B | 2 | 0 | ? |
| C | 0 | 5 | ? |
| D | 1 | 10 | ? |

```python
distance = 4

for name, (w, b) in {"A": (3,5), "B": (2,0), "C": (0,5), "D": (1,10)}.items():
    print(f"Experiment {name}: {w} × {distance} + {b} = {w * distance + b}")
```

**Answers:** A=17, B=8, C=5, D=14

Notice: In **C**, when `w = 0`, the input doesn't matter at all. Output is always just the bias.

---

## One important thing

> We manually set `w = 2` and `b = 5`. The neuron did NOT learn these values.

**Learning** means finding the right weight and bias **automatically from data**. That's what we do next.

---

## Knowledge check

1. What is `ŷ` when `w=3, b=2, x=5`?
2. If `w=0`, does changing `x` change the output?
3. What does "forward pass" mean?
4. What does the bias represent in the delivery example?

---

## Next lesson

**Lesson 2: How Wrong Is the Prediction?** — We need a way to measure how bad a prediction is. That measurement is called a **loss function**.
