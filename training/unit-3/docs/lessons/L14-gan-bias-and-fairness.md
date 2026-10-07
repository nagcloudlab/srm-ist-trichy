# Lesson 14: GAN Bias and Fairness

## Where we are

| L12-L13 | **L14** |
|---|---|
| How to measure if a GAN is good (FID) | **What happens when a "good" GAN learns the wrong things?** |

Your GAN can produce sharp, realistic images with a low FID score. Great. But what if it only generates light-skinned faces? Or mostly male faces? Or ignores certain digit styles entirely?

A GAN is only as fair as its training data. This lesson explores how bias enters GANs, why it matters, and what we can do about it.

---

## 1. What Is Bias in GANs?

### The simple definition

```
Bias = the GAN's outputs don't fairly represent
       the diversity of the real world
       (or even the diversity of the training data)
```

### Three levels of bias

```
Level 1: DATA BIAS
  The training data itself is unbalanced
  Example: face dataset has 80% light skin, 20% dark skin
  The GAN learns this imbalance

Level 2: MODEL BIAS
  The GAN amplifies the data imbalance
  The data has 80/20 split → the GAN output can drift toward e.g. 95/5
  (illustrative; reported for face GANs by Jain et al., 2020)
  Minority groups get even less representation

Level 3: EVALUATION BIAS
  FID doesn't catch the problem
  FID says "good!" because the majority group looks great
  The minority group's poor quality is averaged away
```

---

## 2. How Bias Enters Through Data

### The training data problem

GANs learn to copy the distribution of their training data. If the data is skewed, the GAN output is skewed.

```
Training data: 10,000 face images
  8,000 young people
  2,000 old people

GAN learns:
  "Most faces are young"
  → generates mostly young faces
  → old faces are rare AND lower quality
     (less training signal for that group)
```

### Real examples from research

```
CelebA dataset (most-used face dataset):
  - ≈ 58% labelled "female", ≈ 77% labelled "young" (CelebA attributes)
  - Majority light-skinned (CelebA has no skin-tone labels)
  - Posed, made-up celebrity photos

GANs trained on CelebA:
  - Skew toward light-skinned, young faces
  - Dark-skinned faces are less detailed
  - Older faces are rare and blurry
  - "Default face" = young, light-skinned, female
```

### The amplification effect

```
Data distribution:    70% group A,  30% group B
GAN output:           85% group A,  15% group B
                      ↑
               The GAN amplifies the imbalance!

Why? The Generator gets MORE gradient signal from group A
(more examples → more feedback → better at A).
Group B gets less signal → G is worse at B →
G focuses even more on A → vicious cycle.
```

---

## 3. Mode Collapse as Bias

### Connection to fairness

Mode collapse isn't just a technical problem — it's a fairness problem.

```
A GAN with mode collapse on a face dataset:
  Generates 5 face types instead of 50
  Which 5 survive? The majority groups
  Which 45 disappear? The minority groups

Mode collapse disproportionately erases underrepresented groups.
```

### In MNIST terms

```
Balanced data:    ~6,000 each of digits 0-9

If mode collapse drops 3 digits:
  Which digits survive? The "easy" ones (1, 0, 7)
  Which collapse?       The "hard" ones (8, 9, 4)

  Not random — structural bias in which modes survive
```

---

## 4. Why This Matters in the Real World

### Concrete harms

```
1. SYNTHETIC DATA FOR TRAINING
   You use GAN images to train a face detector
   GAN mostly generates light-skinned faces
   → Face detector works poorly on dark-skinned faces
   → Real-world discrimination

2. DATA AUGMENTATION
   Medical imaging: GAN generates synthetic X-rays
   Training data mostly from one hospital population
   → GAN learns that population's characteristics
   → Augmented model works poorly on other populations

3. CREATIVE TOOLS
   AI art generator trained on Western art
   → Default output reflects Western aesthetics
   → Other cultural styles are poorly represented or stereotyped

4. DEEPFAKES
   Biased face GANs create more convincing fakes
   of majority-group faces
   → Detection tools trained on biased fakes
   → Worse at detecting fakes of minority groups
```

---

## 5. Detecting Bias in Your GAN

### Step 1: Check your data

```python
# Count examples per class/group
from collections import Counter

labels = [label for _, label in dataset]
counts = Counter(labels)

for cls, count in sorted(counts.items()):
    pct = 100 * count / len(labels)
    print(f"Class {cls}: {count:6d} ({pct:.1f}%)")

# For faces: check age, gender, skin tone distributions
# For medical: check patient demographics
```

### Step 2: Check your outputs per group

```python
# Generate images for each class and compute per-class FID
for cls in range(num_classes):
    # Real images of this class
    real_cls = [img for img, lbl in dataset if lbl == cls]

    # Generated images of this class (using cGAN)
    fake_cls = generate_class(gen, cls, n=1000)

    fid_cls = compute_fid(real_cls, fake_cls, extractor)
    print(f"Class {cls}: FID = {fid_cls:.1f}")
```

Use the SAME number of real and fake images for every group: FID is biased upward at small N (L13), so a small group would look worse just because it has fewer samples.

```
If results look like:
  Class 0: FID = 15.2
  Class 1: FID = 12.8
  Class 7: FID = 14.1
  Class 8: FID = 45.3    ← much worse!
  Class 9: FID = 38.7    ← much worse!

Classes 8 and 9 are getting lower quality.
The GAN is biased against these classes.
```

### Step 3: Visual inspection per group

```
Generate 100 images per group.
Look at them. Ask:
  - Are some groups blurrier than others?
  - Are some groups less diverse?
  - Do some groups have artifacts that others don't?
  - Are there stereotypical patterns?
```

---

## 6. Mitigation Strategies

### Strategy 1: Balance the data

```
Problem: 8,000 young, 2,000 old
Fix:     Oversample old faces (repeat them)
         or undersample young faces (use fewer)
         until both groups have equal representation

Pros:  Simple, effective
Cons:  Oversampling can cause overfitting on minority group
       Undersampling wastes majority data
```

### Strategy 2: Class-conditional training

```
Use a Conditional GAN (L10):
  Give each group its own label
  G learns to generate each group separately
  Each group gets dedicated gradient signal

This ensures the Generator CAN produce each group.
But quality differences may remain.
```

### Strategy 3: Per-group loss weighting

```python
# Weight the loss to give minority groups more importance
group_weights = {
    'young': 0.2,    # 80% of data, gets less weight
    'old':   0.8,    # 20% of data, gets more weight
}

# In training loop:
loss_D = weight * criterion(pred, target)
```

```
More weight on minority group
→ D pays more attention to getting that group right
→ G gets stronger signal for that group
→ Better quality for minority groups
```

### Strategy 4: Per-group evaluation

```
Don't just compute ONE FID for the whole dataset.
Compute FID for EACH group separately.

Overall FID:  22.3  (looks great!)

Per-group FID:
  Group A:  15.1  (great)
  Group B:  18.4  (good)
  Group C:  52.8  (terrible!)

The overall FID hid group C's poor quality.
Always check per-group metrics.
```

### Strategy 5: Diverse data collection

```
The best mitigation is prevention:
  Collect data that actually represents the population
  Audit your dataset before training
  Document known limitations

No algorithm can fully fix fundamentally biased data.
```

---

## 7. Fairness Metrics for GANs

### Beyond FID

```
Per-group FID:
  Compute FID separately for each demographic group
  All groups should have similar FIDs

Demographic Parity:
  P(generated = group A) ≈ P(generated = group B)
  "The GAN generates each group equally often"

Quality Parity:
  Quality(group A) ≈ Quality(group B)
  "Each group's images are equally realistic"

Coverage:
  "Does the GAN cover all subgroups within each group?"
  Not just male/female, but also age x ethnicity x style
```

### The tension

```
Fairness often conflicts with FID:

  Strategy: Rebalance data to 50/50
  Effect:   FID goes UP (because real data was 80/20,
            now fake is 50/50 — distributions don't match)

  The "best" FID comes from copying the data distribution
  exactly — including its biases.

  A FAIR GAN may have a HIGHER FID than a biased one.
  This is a feature, not a bug.
```

---

## 8. Practical Checklist

Before deploying a GAN:

```
□ What groups exist in my data?
□ How balanced is the representation?
□ Have I computed per-group FID?
□ Are some groups blurrier or less diverse?
□ What will this GAN be used for?
□ Who could be harmed by biased outputs?
□ Have I documented the known biases?
□ Have I tried mitigation strategies?
```

---

## 9. Summary

| Concept | What you learned |
|---|---|
| **Data bias** | Imbalanced training data → imbalanced outputs |
| **Amplification** | GANs make data imbalances worse, not just copy them |
| **Mode collapse as bias** | Dropped modes are disproportionately minority groups |
| **Real-world harms** | Biased synthetic data → biased downstream models |
| **Detection** | Per-group FID, visual inspection, data auditing |
| **Mitigation** | Balance data, cGAN, loss weighting, per-group evaluation |
| **FID tension** | Fair GANs may have higher FID — that's OK |

---

## Knowledge Check

1. Name three levels at which bias can enter a GAN pipeline.
2. Why does a GAN amplify data bias instead of just copying it?
3. How is mode collapse related to fairness?
4. Give a real-world example of how a biased GAN could cause harm.
5. Why is overall FID misleading for detecting bias? What should you use instead?
6. Name three strategies to reduce bias in GANs.
7. Why might a fair GAN have a HIGHER FID than a biased one?

---

## Next Lesson

L15: **StyleGAN** — the most influential GAN architecture. Mapping networks, AdaIN, style mixing, and progressive growing. How researchers generate photorealistic faces at 1024x1024.
