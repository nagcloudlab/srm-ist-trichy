# Lesson 18: Data Augmentation & Privacy with GANs

## Where we are

| L16-L17 | **L18** |
|---|---|
| Built Pix2Pix for image translation | **Using GANs as a practical tool — synthetic data & privacy** |

So far, GANs have been the *goal* — we've been learning how to build better generators. Now GANs become a *tool*. Two powerful applications:

1. **Data augmentation** — generate synthetic training data when real data is scarce
2. **Privacy** — share synthetic data instead of sensitive real data

---

## 1. The Data Hunger Problem

### Deep learning needs data. Lots of it.

```
Model accuracy vs dataset size:

  Accuracy
    │
  95│                          ●──────── enough data
    │                    ●
  90│              ●
    │         ●
  85│    ●
    │  ●
  80│●
    └──────────────────────────────
     100  500  1K   5K  10K  50K
              Dataset size

Most deep learning tasks need thousands of labeled examples.
But in many domains, data is expensive or impossible to collect.
```

### Where real data is scarce

```
Medical imaging:
  - Rare diseases: maybe 50 X-rays exist worldwide
  - Each image needs expert annotation ($$$)
  - Privacy regulations limit sharing

Autonomous driving:
  - Need millions of miles of driving data
  - Rare events (accidents) are by definition uncommon
  - Can't crash cars on purpose to collect data

Fraud detection:
  - 99.9% of transactions are normal
  - Only 0.1% are fraud — very few examples
  - New fraud types appear constantly

Manufacturing:
  - Defective products are rare (that's the point!)
  - Need images of defects to train quality control
  - Can't break products on purpose (expensive)
```

---

## 2. Traditional Data Augmentation

### What we've always done

```python
# Standard augmentations — transform existing images:
transforms.Compose([
    transforms.RandomHorizontalFlip(),      # flip left-right
    transforms.RandomRotation(15),          # rotate ±15°
    transforms.RandomCrop(224, padding=16), # shift position
    transforms.ColorJitter(0.2, 0.2),       # change colors
])
```

```
Pros:
  - Simple, fast, well-understood
  - Works great for many tasks
  - No extra training needed

Cons:
  - Still the SAME images, just transformed
  - Can't create truly NEW examples
  - Limited diversity — all rotated versions of dog #1
    are still clearly dog #1
  - Doesn't help with class imbalance
    (rotating 50 fraud examples gives you 200 still-similar examples)
```

### The gap

```
Traditional augmentation:
  "Here's the same dog from a different angle"

What we really want:
  "Here's a COMPLETELY NEW dog that looks realistic"

That's what GANs can do.
```

---

## 3. GAN-Based Data Augmentation

### The idea

```
Step 1: Train a GAN on your (small) real dataset
Step 2: Use the GAN to generate NEW synthetic images
Step 3: Add synthetic images to your training set
Step 4: Train your downstream model on real + synthetic data
```

### When does it help?

```
HELPS A LOT:
  - Very small datasets (100-1000 images)
  - Class imbalance (undersample majority + GAN for minority)
  - Rare event detection (generate more rare events)
  - When you need more diversity, not just more copies

HELPS A LITTLE:
  - Medium datasets (5K-50K) — traditional augmentation may suffice
  - When the GAN quality is poor (garbage in → garbage out)

DOESN'T HELP:
  - Already large datasets (100K+) — diminishing returns
  - When the task requires exact real-world details
  - When the GAN can't learn the distribution well
```

### A practical recipe

```python
# 1. Train GAN on real data (let's say 500 medical images)
train_gan(real_images)  # Takes hours/days

# 2. Generate synthetic images
synthetic = []
for _ in range(2000):  # Generate 4x more than real
    z = torch.randn(1, z_dim)
    fake_img = generator(z)
    synthetic.append(fake_img)

# 3. Combine real + synthetic
augmented_dataset = real_images + synthetic
# Now we have 500 + 2000 = 2500 training images

# 4. Train classifier on augmented data
train_classifier(augmented_dataset)
```

### Key decisions

```
How many synthetic images to add?
  - Rule of thumb: 1x to 5x the number of real images
  - More isn't always better — GAN artifacts can hurt
  - Experiment: try 1x, 2x, 5x and compare validation accuracy

How to mix real and synthetic?
  - Option A: Just concatenate (simplest)
  - Option B: Balance batches (50% real, 50% synthetic)
  - Option C: Curriculum (start with real, add synthetic later)
  - Option A works fine in most cases

Quality control:
  - Compute FID (L13) to ensure synthetic quality
  - Visual inspection — remove obvious artifacts
  - If FID is too high, your GAN isn't good enough yet
```

---

## 4. Conditional GANs for Targeted Augmentation

### The power move

Regular GANs generate random images. But with **Conditional GANs** (L10), we can generate specific classes:

```python
# "Generate 500 more images of rare class 7"
for _ in range(500):
    z = torch.randn(1, z_dim)
    label = torch.tensor([7])       # specifically class 7
    fake = cgan(z, label)
    synthetic_class7.append(fake)
```

```
This is MUCH better for class imbalance:

Real dataset:
  Class 0:  5000 images
  Class 1:  5000 images
  Class 7:    50 images   ← rare!

After targeted augmentation:
  Class 0:  5000 images
  Class 1:  5000 images
  Class 7:    50 real + 4950 synthetic = 5000   ← balanced!
```

### Image-to-image augmentation

Pix2Pix can also augment data:

```
Medical example:
  You have: 100 segmentation masks (cheap to create)
  You need: corresponding medical images (expensive)

  Train Pix2Pix: mask → medical image
  Now generate 1000 new masks (procedurally)
  → Pix2Pix → 1000 synthetic medical images

  Each with a known ground-truth segmentation!
```

---

## 5. Does GAN Augmentation Actually Work?

### Evidence from real studies

```
Liver-lesion classification on CT (182 lesions; Frid-Adar et al., Neurocomputing 2018):
  Classic augmentation:             sensitivity 78.6%   specificity 88.4%
  + GAN-synthesized lesions:        sensitivity 85.7%   specificity 92.4%
```

Related: DAGAN (Antoniou et al., 2017) learns augmentations for few-shot classes.

Gains like these are typical of **small** datasets, not guaranteed. Two rules:

- A GAN can only remix what its training data contains — it adds no new information.
- Train the GAN on the **training split only**, and measure accuracy on a **real** test set it never saw (otherwise the synthetic data leaks the test set).

### When it fails

```
Problem: the GAN memorizes the training data
  If dataset is too small (< 50 images),
  the GAN may just memorize and reproduce them.
  Then synthetic = copies of real → no benefit.

  Check: compute FID between generated and training images.
  If too LOW, the GAN might be memorizing.

Problem: the GAN has mode collapse
  Only generates a few variations.
  Adds quantity but not diversity.

  Check: visual inspection + diversity metrics.

Problem: GAN artifacts confuse the classifier
  Synthetic images have subtle artifacts
  that the classifier learns as features.
  Result: classifier works on GAN images
  but fails on real test images.

  Fix: use high-quality GANs, filter bad outputs.
```

---

## 6. The Privacy Problem

### Why we need synthetic data for privacy

```
Hospital A has 10,000 patient X-rays.
Hospital B wants to train a diagnostic model.

Can Hospital A share the X-rays?

  NO:
  - Patient privacy laws (HIPAA, GDPR)
  - X-rays can be re-identified
  - Even "anonymized" data can be de-anonymized
  - Ethical obligations to patients

But what if Hospital A shares SYNTHETIC X-rays
that look realistic but don't correspond to any real patient?
```

```
The promise:
  Real data     →  GAN  →  Synthetic data
  (private,          ↓      (shareable,
   can't share)    learns    no real patients)
                   patterns
```

---

## 7. The Privacy Risk of GANs

### The problem: GANs can memorize

```
A GAN trained on 10,000 faces might:
  - Generate a face that looks EXACTLY like patient #4523
  - Memorize and reproduce rare individuals
  - Leak sensitive information through generated images

If someone can look at a synthetic image and say:
  "That's clearly Mrs. Johnson from the hospital"
→ Privacy is violated even though the data is "synthetic"
```

### Membership inference attacks

```
Attacker has:
  - Access to the GAN (or its outputs)
  - A photo of a target person

Attack:
  "Was this person's photo used to train the GAN?"

How:
  1. Generate many images from the GAN
  2. Check if any are very similar to the target
  3. Or: try to find a z that reproduces the target (GAN inversion)

If successful → the attacker knows the target was in the dataset
→ Privacy breach (reveals hospital visit, diagnosis, etc.)
```

---

## 8. Differential Privacy (DP) for GANs

### The gold standard for privacy

Differential privacy gives a mathematical guarantee:

```
Informal definition:
  "The output of the algorithm doesn't change much
   whether or not any SINGLE individual's data is included."

Formal ((ε, δ)-differential privacy):
  For any two datasets D and D' that differ in one record, and any set of outputs S:
  P(M(D) ∈ S) ≤ e^ε × P(M(D') ∈ S) + δ
  (here D is a dataset, not the discriminator; δ is tiny, well below 1/N)

  ε = privacy budget (lower = more private)
    ε = 0:   the output cannot depend on any one person
    ε = 1:   strong — probabilities shift by at most ×2.7 (e^1)
    ε = 10:  weak — at most ×22,026 (e^10)
    ε = ∞:   no privacy (standard training)
```

```
What this means for GANs:
  "Whether or not Mrs. Johnson's X-ray was in the training set,
   the GAN's outputs would be essentially the same."

  → The outputs reveal provably little about any one individual (bounded by ε)
  → Without DP, "synthetic" does NOT automatically mean "private"
```

### How: DP-SGD (Differentially Private Stochastic Gradient Descent)

```
Normal SGD:
  gradient = compute_gradient(batch)
  weights = weights - lr * gradient

DP-SGD (Abadi et al., 2016) — two changes:
  g_i = gradient(sample_i)                 ← per sample, not per batch
  g_i = clip(g_i, max_norm=C)              ← Step 1: CLIP each sample
  g   = (Σ g_i + N(0, σ²C²I)) / B          ← Step 2: ADD NOISE to the sum
  weights = weights - lr * g

In a GAN only the discriminator touches real data, so only D needs DP-SGD;
the generator inherits the guarantee because it learns only through D.
```

```
Step 1: CLIP each sample's gradient
  Why: one extreme sample shouldn't dominate
  How: if ||grad|| > C, scale it down to ||grad|| = C
  Effect: limits any single sample's influence

Step 2: ADD GAUSSIAN NOISE
  Why: hides individual contributions
  How: grad += N(0, σ²C²I)
  Effect: even if sample i has a unique gradient,
          the noise makes it undetectable

Together:
  Clipping limits the SIGNAL from any one sample
  Noise hides the signal that remains
  → No one can tell if any specific sample was used
```

### In code (simplified)

```python
# Standard training step:
loss = criterion(disc(real), ones)
loss.backward()
optimizer.step()

# DP training step:
for i, sample in enumerate(batch):
    disc.zero_grad()
    loss_i = criterion(disc(sample), one)
    loss_i.backward()

    # Clip THIS sample's gradient
    torch.nn.utils.clip_grad_norm_(disc.parameters(), max_norm=C)

    # Accumulate
    accumulate_gradients()

# Add noise to accumulated gradients
for param in disc.parameters():
    param.grad += torch.randn_like(param.grad) * sigma * C

optimizer.step()
```

### The privacy-utility tradeoff

```
More privacy (smaller ε):
  → More noise added to gradients
  → Harder for the GAN to learn
  → Lower quality synthetic images
  → But stronger privacy guarantees

Less privacy (larger ε):
  → Less noise
  → Better image quality
  → But weaker privacy guarantees

       Quality
         │
  High   │●
         │  ●
         │     ●
         │         ●
  Low    │              ●
         └────────────────────
         ε=10   ε=3   ε=1   ε=0.1
              Privacy budget
         (lower = more private)
```

---

## 9. PATE-GAN: An Alternative Approach

### Teacher-student privacy

Teachers judge **generated** samples; the student learns from their noisy majority votes, and G trains against the student.

```
Instead of adding noise to gradients directly:

1. Split data into N partitions
2. Train N separate "teacher" discriminators (one per partition)
3. Each teacher votes: "real or fake?"
4. Aggregate votes with noise
5. Use noisy votes to train a "student" discriminator

The student never sees real data directly!
Only noisy vote counts from teachers.

Why it helps (PATE-GAN, Jordon, Yoon & van der Schaar, ICLR 2019):
  - The privacy cost is paid only on the noisy votes
  - In the paper: better synthetic-data quality than DP-GAN at the same ε
  - The student discriminator and the generator never touch real data
```

---

## 10. Practical Guidelines

### When to use GAN augmentation

```
✓ Small dataset (< 5000 images)
✓ Class imbalance (minority class < 10% of data)
✓ Domain where collecting more real data is expensive/impossible
✓ You have enough data to train a decent GAN (usually > 100)
✓ Traditional augmentation alone isn't sufficient

✗ You already have a large, balanced dataset
✗ You have fewer than ~50 images (GAN will memorize)
✗ Real-time applications (GAN generation is slow)
✗ When exact photorealism is required for safety
```

### When to use privacy-preserving GANs

```
✓ Medical data that can't be shared
✓ Financial data with privacy regulations
✓ Training data that contains personal information
✓ When you want to publish a dataset without privacy risk
✓ Cross-organization collaboration

✗ Non-sensitive data (no need for privacy overhead)
✗ When the privacy budget needed is too tight for useful quality
✗ When direct federated learning is a better option
```

### Checklist before sharing synthetic data

```
□ Trained GAN with DP-SGD (or PATE-GAN)
□ Chosen a reasonable ε (typically 1-10)
□ Verified synthetic quality (FID, visual inspection)
□ Checked for memorization (nearest-neighbor to training data)
□ Validated utility (downstream task performance)
□ Documented the privacy guarantees and limitations
□ Had privacy team review the approach
```

---

## 11. Beyond Images: Tabular and Text Data

### GANs aren't just for images

```
Tabular data (CTGAN):
  Generate synthetic rows of a database
  Example: synthetic patient records
    age=45, blood_pressure=130, diagnosis=diabetes
  Preserves correlations between columns

Time series (TimeGAN):
  Generate synthetic sequences
  Example: synthetic stock prices, ECG signals
  Preserves temporal patterns

Text (controlled generation):
  Generate synthetic text data
  Example: synthetic medical notes
  (Though LLMs are better at this now)
```

---

## 12. Summary

| Concept | What you learned |
|---|---|
| **Data scarcity** | Many domains lack enough labeled data for deep learning |
| **GAN augmentation** | Train GAN → generate synthetic images → add to training set |
| **When it helps** | Small datasets, class imbalance, rare events |
| **Conditional augment** | cGAN lets you generate specific classes on demand |
| **Privacy risk** | GANs can memorize and leak individual training samples |
| **Membership inference** | Attack that checks if a person was in the training data |
| **Differential privacy** | Mathematical guarantee: no individual is identifiable |
| **DP-SGD** | Clip gradients + add noise → privacy during training |
| **Privacy-utility tradeoff** | More privacy = more noise = lower quality |
| **Practical guidelines** | When to augment, when to use privacy, quality checks |

---

## Knowledge Check

1. Why is GAN augmentation better than just rotating/flipping existing images?
2. When might GAN augmentation NOT help or even hurt?
3. How would you use a Conditional GAN to fix class imbalance?
4. What is the privacy risk of sharing GAN-generated images?
5. Explain DP-SGD in two steps. What does each step accomplish?
6. What's the privacy-utility tradeoff? Why can't we have both?
7. How would you check if a GAN is memorizing its training data?

---

## Next Lesson

L19: **CycleGAN: Unpaired Translation** — what if you don't have paired data? Horse↔zebra, summer↔winter, photo↔painting. Cycle consistency loss: the brilliant trick that makes unpaired translation possible.
