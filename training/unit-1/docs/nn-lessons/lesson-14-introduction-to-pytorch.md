# Lesson 14: Introduction to PyTorch

## Where we are

| L11 | L12 | L13 | **L14** |
|---|---|---|---|
| Backpropagation | Sigmoid + BCE | Built a classifier | **PyTorch** |

In Lessons 1-13, we wrote everything from scratch -- forward pass, gradients, updates, all by hand.

That was important for **understanding**. But real networks have millions of weights. Writing gradients by hand for all of them? Impossible.

**PyTorch does the hard parts for you.** You build the network. PyTorch calculates ALL the gradients automatically.

---

## Install PyTorch

```python
# Run this once
# pip install torch
```

---

## Tensors = NumPy arrays, but smarter

In NumPy, we used arrays. In PyTorch, we use **tensors**. Same idea -- just with superpowers.

```python
import torch

a = torch.tensor([1.0, 2.0, 3.0])
b = torch.tensor([4.0, 5.0, 6.0])

print("a:", a)
print("b:", b)
print("a + b:", a + b)
print("a * b:", a * b)
print("dot product:", a @ b)
```

```
a: tensor([1., 2., 3.])
b: tensor([4., 5., 6.])
a + b: tensor([5., 7., 9.])
a * b: tensor([ 4., 10., 18.])
dot product: tensor(32.)
```

Looks just like NumPy. So why switch?

---

## The superpower: automatic gradients

This is the big deal. Watch:

```python
import torch

w = torch.tensor(1.0, requires_grad=True)

x = torch.tensor(2.0)
target = torch.tensor(4.0)

prediction = w * x
loss = (prediction - target) ** 2

print(f"prediction = {prediction.item()}")
print(f"loss = {loss.item()}")

# Backward pass -- ONE LINE!
loss.backward()

print(f"gradient of w = {w.grad.item()}")
```

```
prediction = 2.0
loss = 4.0
gradient of w = -8.0
```

**loss.backward()** -- that one line calculated the gradient automatically!

In Lesson 6, we spent an entire lesson deriving gradient = 2 * error * input = 2 * (2-4) * 2 = -8.

PyTorch did it in **one line**.

---

## Compare: by hand vs PyTorch

```python
# BY HAND (Lessons 1-11):
z = w * x + b
h = max(0, z)
pred = v * h
loss = (pred - target) ** 2
d_pred = 2 * (pred - target)       # manual gradient step 1
grad_v = d_pred * h                 # manual gradient step 2
d_h = d_pred * v                    # manual gradient step 3
d_z = d_h * (1 if z > 0 else 0)   # manual gradient step 4
grad_w = d_z * x                   # manual gradient step 5


# PYTORCH:
pred = model(x)
loss = (pred - target) ** 2
loss.backward()         # ALL gradients, automatically!
```

---

## Build a network with nn.Sequential

PyTorch has ready-made building blocks:

```python
import torch
import torch.nn as nn

model = nn.Sequential(
    nn.Linear(1, 4),      # 1 input -> 4 hidden neurons
    nn.ReLU(),             # activation (Lesson 9)
    nn.Linear(4, 1),      # 4 hidden -> 1 output
    nn.Sigmoid()           # squash to 0-1 (Lesson 12)
)

print(model)
```

```
Sequential(
  (0): Linear(in_features=1, out_features=4, bias=True)
  (1): ReLU()
  (2): Linear(in_features=4, out_features=1, bias=True)
  (3): Sigmoid()
)
```

That's the whole network. No manual weights, no manual ReLU code.

---

## Count the parameters

```python
total = sum(p.numel() for p in model.parameters())
print(f"Total parameters: {total}")

for name, param in model.named_parameters():
    print(f"  {name}: shape={list(param.shape)}, count={param.numel()}")
```

```
Total parameters: 13
  0.weight: shape=[4, 1], count=4
  0.bias: shape=[4], count=4
  2.weight: shape=[1, 4], count=4
  2.bias: shape=[1], count=1
```

| Layer | Weights | Biases | Total |
|---|---:|---:|---:|
| Input -> Hidden (4 neurons) | 4 | 4 | 8 |
| Hidden -> Output (1 neuron) | 4 | 1 | 5 |
| **Total** | | | **13** |

---

## Forward pass -- just call the model

```python
x = torch.tensor([[2.0]])
p = model(x)
print(f"Input: {x.item()}, Output: {p.item():.4f}")
```

```
Input: 2.0, Output: 0.5731
```

This is one example output. The exact value changes with PyTorch's random initial weights.

One line. PyTorch did: Linear -> ReLU -> Linear -> Sigmoid.

---

## Train the classifier from Lesson 13 -- in PyTorch

Same task: classify positive vs negative numbers.

```python
import torch
import torch.nn as nn

X = torch.tensor([[-3.], [-2.], [-1.], [1.], [2.], [3.]])
y = torch.tensor([[0.], [0.], [0.], [1.], [1.], [1.]])

model = nn.Sequential(
    nn.Linear(1, 4),
    nn.ReLU(),
    nn.Linear(4, 1),
    nn.Sigmoid()
)

loss_fn = nn.BCELoss()
optimizer = torch.optim.SGD(model.parameters(), lr=0.1)

for epoch in range(1, 201):
    pred = model(X)
    loss = loss_fn(pred, y)

    optimizer.zero_grad()
    loss.backward()
    optimizer.step()

    if epoch in [1, 10, 50, 200]:
        print(f"Epoch {epoch:3}: loss={loss.item():.4f}")

with torch.no_grad():
    pred = model(X)
    for i in range(len(X)):
        label = "positive" if pred[i].item() > 0.5 else "negative"
        print(f"x={X[i].item():3.0f}  p={pred[i].item():.4f}  -> {label}")
```

```
Epoch   1: loss=0.7234
Epoch  10: loss=0.4891
Epoch  50: loss=0.0512
Epoch 200: loss=0.0013

x= -3  p=0.0002  -> negative
x= -2  p=0.0011  -> negative
x= -1  p=0.0085  -> negative
x=  1  p=0.9920  -> positive
x=  2  p=0.9990  -> positive
x=  3  p=0.9998  -> positive
```

These are representative training results. Exact losses and probabilities vary with random initialization — over 20 random starts the loss is ≈ 0.5–1.0 at epoch 1, ≈ 0.05–0.37 at epoch 50 and ≈ 0.01–0.09 at epoch 200, so treat the printed values as one example run.

Same result as Lesson 13 -- but **no manual gradients**!

---

## The training loop -- 3 lines that do everything

```python
optimizer.zero_grad()    # 1. Clear old gradients
loss.backward()          # 2. Calculate ALL gradients (backpropagation!)
optimizer.step()         # 3. Update ALL weights
```

| Line | What it does | Which lesson did this manually? |
|---|---|---|
| zero_grad() | Clears old gradients | We didn't need this before |
| backward() | Backpropagation | Lesson 11 (steps 2-6) |
| step() | w = w - lr * gradient | Lesson 4 |

---

## Experiment: make the network deeper

```python
shallow = nn.Sequential(
    nn.Linear(1, 4), nn.ReLU(),
    nn.Linear(4, 1), nn.Sigmoid()
)

deep = nn.Sequential(
    nn.Linear(1, 8), nn.ReLU(),
    nn.Linear(8, 8), nn.ReLU(),
    nn.Linear(8, 4), nn.ReLU(),
    nn.Linear(4, 1), nn.Sigmoid()
)

print(f"Shallow: {sum(p.numel() for p in shallow.parameters())} parameters")
print(f"Deep:    {sum(p.numel() for p in deep.parameters())} parameters")
```

```
Shallow: 13 parameters
Deep:    129 parameters
```

Adding layers is just adding more lines. PyTorch handles all the gradients for all 129 parameters automatically.

---

## What PyTorch replaced

| What you learned | PyTorch equivalent |
|---|---|
| y = w * x + b (Lesson 1) | nn.Linear(1, 1) |
| ReLU(z) = max(0, z) (Lesson 9) | nn.ReLU() |
| Sigmoid(z) (Lesson 12) | nn.Sigmoid() |
| BCE loss (Lesson 12) | nn.BCELoss() |
| Manual gradients (L6, L11) | loss.backward() |
| w = w - lr * grad (Lesson 4) | optimizer.step() |

You understand **what** these do because you built them by hand. PyTorch just does them **faster**.

---

## Knowledge check

1. What is requires_grad=True for?
2. What does loss.backward() do?
3. What are the 3 lines in the training loop?
4. How do you build a network with 2 hidden layers in PyTorch?
5. Why did we learn everything by hand first before using PyTorch?

---

## Hands-on

Run `training/unit-1/labs/lab-00-intro-to-pytorch.ipynb` — labs P1–P3 redone in PyTorch.

---

## Next lesson

We have PyTorch. We understand Discriminators (classifiers). Now let's build the other half -- the **Generator** -- and make them compete. **It's time to build a GAN** — next: `../gan-lessons/L02-build-your-first-gan.md` (the Build GANs topic; labs in `training/unit-1/labs/lab-01-simple-gan.ipynb`).
