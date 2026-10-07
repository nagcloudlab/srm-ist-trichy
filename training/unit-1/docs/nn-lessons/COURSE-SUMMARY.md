# Unit 1 — Neural Networks to GANs: Course Summary

## 14 neural-network lessons → the GAN lessons (L02–L06)

---

## Part 1: Neural Network Foundations (Lessons 1-7)

### Lesson 1: What Is a Neuron?
- A neuron calculates `y = wx + b`
- Weight controls influence, bias shifts output
- Forward pass = input → calculation → output
- File: `lesson-01-what-is-a-neuron.md`

### Lesson 2: How Wrong Is the Prediction?
- Error = prediction - actual
- MSE = average of squared errors
- Squaring prevents positive/negative cancellation
- Loss = single number measuring quality
- File: `lesson-02-how-wrong-is-the-prediction.md`

### Lesson 3: Which Direction Should the Weight Move?
- Gradient = slope of loss at current weight
- Negative gradient → increase weight
- Positive gradient → decrease weight
- Estimated by nudging weight slightly
- File: `lesson-03-which-direction-should-the-weight-move.md`

### Lesson 4: How Far Should the Weight Move?
- Learning rate controls step size
- Update rule: `w = w - lr × gradient`
- Too small → slow, too large → overshoots
- File: `lesson-04-how-far-should-the-weight-move.md`

### Lesson 5: Make the Neuron Learn Repeatedly
- Training loop: predict → loss → gradient → update → repeat
- Gradient must be recalculated after each update
- Updates get smaller near the minimum
- File: `lesson-05-make-the-neuron-learn-repeatedly.md`

### Lesson 6: Calculate the Gradient Directly
- Chain rule: multiply effects along the path
- Gradient contribution = `2 × error × input`
- Exact derivative replaces numerical estimation
- File: `lesson-06-calculate-the-gradient-directly.md`

### Lesson 7: Learn Both Weight and Bias Together
- Each parameter gets its own gradient
- Weight gradient has `x`, bias gradient doesn't
- Calculate ALL gradients, THEN update ALL parameters
- Neuron discovered `y = 2x + 5` from data alone
- File: `lesson-07-learn-both-weight-and-bias.md`

---

## Part 2: Deep Neural Networks (Lessons 8-11)

### Lesson 8: A Neuron with Multiple Inputs
- `y = w1×x1 + w2×x2 + b`
- One weight per input, each with its own gradient
- Dot product: compact notation for many inputs
- File: `lesson-08-a-neuron-with-multiple-inputs.md`

### Lesson 9: Why One Neuron Is Not Enough
- Linear neuron can't learn curved data (y = x²)
- Stacking linear layers still gives a straight line
- ReLU = max(0, z) — adds a bend
- Two ReLU neurons make a V-shape (|x|)
- File: `lesson-09-why-one-neuron-is-not-enough.md`

### Lesson 10: Your First Hidden Layer
- Hidden layer = neurons between input and output
- z = pre-activation (before ReLU), h = activation (after ReLU)
- 1→2→1 network has 7 parameters
- Neurons must start with different weights
- File: `lesson-10-your-first-hidden-layer.md`

### Lesson 11: Backpropagation
- Error flows backward from loss to every weight
- At each connection: multiply by "how much did you affect the next thing?"
- ReLU gate: open (z>0) passes gradient, closed (z<0) blocks it
- Dead ReLU problem → fix with Leaky ReLU
- File: `lesson-11-backpropagation.md`

---

## Part 3: GAN Building Blocks (Lessons 12-14)

### Lesson 12: Sigmoid and Binary Cross-Entropy
- Sigmoid squashes any number to 0-1 (probability)
- BCE loss measures how wrong a probability is
- BCE punishes confident wrong answers harshly
- Sigmoid = Discriminator output, BCE = GAN loss function
- File: `lesson-12-sigmoid-and-bce.md`

### Lesson 13: Build a Classifier
- Neuron + Sigmoid = classifier (yes/no)
- BCE + Sigmoid gradient simplifies to `p - y`
- Trained to classify positive vs negative numbers
- This IS a baby Discriminator
- File: `lesson-13-build-a-classifier.md`

### Lesson 14: Introduction to PyTorch
- Tensors = NumPy arrays with automatic gradients
- `loss.backward()` = all backpropagation in one line
- `nn.Sequential` builds networks from blocks
- Training loop: `zero_grad()` → `backward()` → `step()`
- File: `lesson-14-introduction-to-pytorch.md`

---

## Part 4: GANs (Unit 1 GAN lessons, `../gan-lessons/`)

### L02: Build Your First GAN — `../gan-lessons/L02-build-your-first-gan.md`
- Generator: noise → fake data; Discriminator: data → probability real
- Two alternating steps: D learns real→1 / fake→0, G learns to make D say 1 (non-saturating loss)
- `.detach()` in D's step keeps D's update from touching G
- G learns to output ≈ 7 without ever seeing 7 (real runs overshoot first, then settle)

### L03: GAN for Images (MNIST) — `../gan-lessons/L03-gan-for-images.md`
- Generator: 64 noise → 256 → 512 → 784 pixels (Tanh); 550,416 params
- Discriminator: 784 → 512 → 256 → 1 (LeakyReLU(0.2) + Sigmoid); 533,505 params
- Pixels normalised to [−1, 1] to match Tanh

### L04: Convolutions — `../gan-lessons/L04-convolutions-crash-course.md`
- Conv2d: a shared filter slides across the image; stride 2 halves the size
- ConvTranspose2d: upsamples small → big; BatchNorm keeps activations stable

### L05: DCGAN — `../gan-lessons/L05-dcgan.md`
- G: 100 → 256×7×7 → 128×14×14 → 1×28×28 (ConvTranspose2d, BatchNorm, ReLU, Tanh)
- D mirrors it with strided Conv2d + LeakyReLU; Adam lr 0.0002, β1 = 0.5
- Sharper digits from spatial structure — G actually has more parameters (≈ 1.79M)

### L06: When GANs Break — `../gan-lessons/L06-when-gans-break.md`
- Mode collapse, a too-strong D (strong but poorly aimed gradient), oscillation
- Band-aids: one-sided label smoothing, instance noise, learning-rate balance (TTUR)
- Root cause is the loss itself → Unit 2 (L07 why BCE fails, L08 WGAN)

---

## Key Concepts Quick Reference

| Concept | First introduced | Used in GAN |
|---|---|---|
| `y = wx + b` | Lesson 1 | Every neuron |
| MSE loss | Lesson 2 | Understanding loss |
| Gradient descent | Lessons 3-5 | Training both networks |
| Chain rule | Lesson 6 | `loss.backward()` |
| ReLU | Lesson 9 | Generator hidden layers |
| LeakyReLU | Lesson 11 (dead-ReLU fix) · L03 | Discriminator hidden layers |
| Hidden layers | Lesson 10 | Both networks |
| Backpropagation | Lesson 11 | `loss.backward()` |
| Sigmoid | Lesson 12 | Discriminator output |
| BCE loss | Lesson 12 | GAN loss function |
| Tanh | L03 | Generator output |
| BatchNorm | L04–L05 | Stabilizes both networks |
| Conv2d | L04–L05 | Discriminator (downsample) |
| ConvTranspose2d | L04–L05 | Generator (upsample) |

---

## All Files

```
training/unit-1/docs/
├── nn-lessons/   lesson-00 … lesson-14 (neural networks), COURSE-SUMMARY.md
├── gan-lessons/  L00–L01 (GenAI, the GAN idea), L02–L06 (build GANs)
├── session-1 … session-4 notes
└── unit-1-complete-notes.md
```
