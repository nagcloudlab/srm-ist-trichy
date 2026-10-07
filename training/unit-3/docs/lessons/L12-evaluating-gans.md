# Lesson 12: Evaluating GANs

## Where we are

| Unit 2 | **Unit 3** |
|---|---|
| Built stable, controllable GANs (WGAN-GP, cGAN, latent control) | **Which of those GANs is actually better?** |

Unit 2 ended with control: pick the digit, steer the latent space, truncate for quality. You've trained a GAN. It generates images. They look... okay? Maybe? How do you know if model A is better than model B? How do you know if training is improving?

"It looks good to me" is not a scientific answer. We need **numbers**.

---

## 1. Why Evaluation Is Hard

### Normal neural networks are easy to evaluate

```
Image classifier:
  Test set: 10,000 labeled images
  Run model on each → compare prediction vs truth
  Accuracy = 94.2%
  Done.

GAN:
  There IS no "correct answer"
  A generated face isn't "right" or "wrong"
  It's... somewhere on a spectrum of quality
```

### What does "good" even mean for a GAN?

A good GAN should produce images that are:

```
1. HIGH QUALITY (fidelity)
   Each individual image looks realistic
   Sharp, coherent, no artifacts

2. HIGH VARIETY (diversity)
   The images cover the full range of the training data
   Not just one face over and over (mode collapse)

3. MATCHING THE REAL DATA
   The distribution of generated images should match
   the distribution of real images
```

A GAN that generates one perfect face = high quality, zero diversity.
A GAN that generates blurry random noise = high diversity, zero quality.

We need to measure BOTH.

---

## 2. Bad Approaches (That People Still Use)

### "Eye test" — look at a grid of samples

```
Problems:
  - Subjective (different people disagree)
  - Not scalable (can't compare 50 models by eye)
  - Cherry-picking (show the best samples, hide the bad ones)
  - Can't detect mode collapse (a grid of 16 images
    can't tell you if only 3 modes exist out of 100)
```

### Discriminator loss

```
Problems:
  - BCE D loss hovers near 2 ln 2 ≈ 1.386 at balance, for good AND bad images
  - WGAN loss is better but still not a quality metric
  - A low D loss doesn't mean good images
    (D could just be bad at its job)
```

### Per-pixel comparison with real images

```
Problems:
  - Generated images shouldn't MATCH real images
    (that would be memorization, not generation)
  - Pixel distance doesn't capture perceptual similarity
  - Two identical faces shifted 1 pixel = large pixel distance
    but perceptually identical
```

We need something smarter.

---

## 3. Inception Score (IS)

### The first proper GAN metric (2016)

**Idea:** Use a pre-trained image classifier (Inception v3) to judge generated images.

### How it works

```
Step 1: Generate 50,000 images from G
Step 2: Feed each image through Inception v3 (trained on ImageNet)
Step 3: For each image, Inception outputs class probabilities
Step 4: Compute the score based on two things:
        a) Each image should have a CONFIDENT prediction (high quality)
        b) Across all images, predictions should be DIVERSE (high variety)
```

### The math (simplified)

```
For a SINGLE image:
  Inception says: "92% dog, 3% cat, 2% car, ..."
  This is CONFIDENT → sharp probability distribution
  Good quality!

  Inception says: "11% dog, 10% cat, 9% car, 8% boat, ..."
  This is UNCERTAIN → flat probability distribution
  Bad quality! (Image is ambiguous/blurry)

Across ALL images:
  Every image classified as "dog"?
  → Low diversity (mode collapse)

  Images spread across dog, cat, car, boat, plane...?
  → High diversity!
```

### The formula

$$IS = \exp\left(\mathbb{E}_x\left[KL\left(p(y|x) \| p(y)\right)\right]\right)$$

In words:
```
p(y|x) = what Inception thinks about ONE image (should be sharp/confident)
p(y)   = what Inception thinks about ALL images (should be spread/diverse)
KL     = how different are these two distributions?

High KL = each image is confident BUT different images get different classes
        = high quality AND high diversity
        = high IS score
```

### Score range

```
IS = 1          minimum: every image gets the same class distribution
                (collapsed OR uniformly unsure images)
IS ≈ 11         real CIFAR-10 images (10 classes)
IS ≈ 166        BigGAN on ImageNet 128×128
IS ≤ 1000       maximum = number of Inception classes

Higher = better (but only comparable on the same dataset)
```

### Worked example

```
3 classes, 3 images; image k puts 0.9 on class k and 0.05 elsewhere
p(y)  = (1/3, 1/3, 1/3)
KL    = 0.9·ln(0.9/(1/3)) + 2·0.05·ln(0.05/(1/3))
      = 0.9·0.993 − 0.1·1.897 = 0.704        (same for every image)
IS    = exp(0.704) = 2.02                    (max possible with 3 classes: 3)

All three images = class 1  →  p(y) = p(y|x)  →  KL = 0  →  IS = 1
```

### Problems with Inception Score

```
1. Only uses generated images (never looks at real data!)
   A GAN could generate perfect dogs — but if the training data
   was cats, IS wouldn't catch this

2. Limited to ImageNet classes
   For MNIST or faces, Inception doesn't have relevant classes
   The scores become less meaningful

3. Doesn't detect intra-class mode collapse
   10 different classes ✓ but only 1 example per class?
   IS wouldn't notice

4. Sensitive to implementation details
   Number of samples, splits, resizing — all affect the score
```

---

## 4. Frechet Inception Distance (FID) — The Standard

### The better metric (2017)

FID fixes the main problem with IS: **it compares generated images TO real images**.

### The idea

```
Step 1: Take real images → feed through Inception → get features
Step 2: Take fake images → feed through Inception → get features
Step 3: Compare the TWO SETS of features

"Features" = the activations from a layer deep inside Inception
  (not the final class probabilities, but the rich internal representation)
```

### Why features, not pixels?

```
Pixels:    [R=128, G=64, B=200, R=130, ...]  → low-level, position-sensitive
Features:  [has_eyes=0.9, has_fur=0.7, ...]   → high-level, semantic

Two identical dogs in different positions:
  Pixels:    very different
  Features:  very similar

Features capture WHAT is in the image, not WHERE exactly.
```

### How FID compares features

FID treats the features as coming from two **multivariate Gaussian distributions**:

```
Real features:     mean = mu_r,    covariance = Sigma_r
Fake features:     mean = mu_f,    covariance = Sigma_f

FID measures the "distance" between these two Gaussians.
```

### The formula

$$FID = \|\mu_r - \mu_f\|^2 + \text{Tr}\left(\Sigma_r + \Sigma_f - 2\sqrt{\Sigma_r \Sigma_f}\right)$$

Don't memorize this. Just know:

```
First term:  ||mu_r - mu_f||^2
  → Are the CENTERS of real and fake feature distributions close?
  → "Do fake images have similar average features to real images?"

Second term: Tr(Sigma_r + Sigma_f - 2*sqrt(Sigma_r * Sigma_f))
  → Are the SHAPES of the distributions similar?
  → "Do fake images have similar feature variety to real images?"
```

FID is the **squared Wasserstein-2 distance** between two Gaussians fitted to the features — a cousin of Unit 2's Wasserstein distance.

Worked in 1-D (real μ=0, σ=1; fake μ=0.5, σ=2): the formula becomes (μ_r − μ_f)² + (σ_r − σ_f)² = 0.25 + 1 = **1.25**.

### Score range

```
FID = 0          perfect (generated = real distribution)
FID ≈ 1-10       excellent   (rough guide — depends on dataset and sample count)
FID ≈ 10-50      good
FID ≈ 50-100     decent
FID > 100        poor

LOWER = BETTER  (opposite of IS!)
```

### Why FID is the standard

```
✓ Compares fake to real (not just fake alone)
✓ Captures both quality AND diversity
✓ Works on most image domains (features come from ImageNet — less meaningful far from natural photos)
✓ Reproducible IF sample count and preprocessing are fixed
✓ Correlates well with human judgment
```

---

## 5. FID Step-by-Step

Let's trace through what happens:

```
Step 1: Collect real images
  Get 10,000-50,000 images from training set

Step 2: Generate fake images
  Generate the SAME number of images from G

Step 3: Extract features
  Feed ALL images (real + fake) through Inception v3
  Extract activations from the pool3 layer (2048-dim vector per image)

  Real: 10,000 images → 10,000 vectors of size 2048
  Fake: 10,000 images → 10,000 vectors of size 2048

Step 4: Compute statistics
  Real: mean (2048-dim), covariance (2048 x 2048 matrix)
  Fake: mean (2048-dim), covariance (2048 x 2048 matrix)

Step 5: Compute FID
  FID = distance between the two Gaussians
```

### What the features look like

```
Real image of a "7":
  Inception features: [0.8, 0.1, 0.3, ..., 0.6]  (2048 numbers)
  These capture: "vertical stroke", "horizontal stroke at top",
                 "angular", "thin lines", etc.

Fake image of a "7":
  Inception features: [0.7, 0.2, 0.3, ..., 0.5]  (2048 numbers)
  Should be SIMILAR to real "7" features

If they're similar → low FID → good GAN
If they're different → high FID → bad GAN
```

---

## 6. FID vs IS: When to Use Which

| | Inception Score (IS) | FID |
|---|---|---|
| Compares to real data? | No | **Yes** |
| Measures quality? | Yes | Yes |
| Measures diversity? | Partially | **Yes** |
| Works for any domain? | Only ImageNet | **Any domain** |
| Lower = better? | No (higher = better) | **Yes** |
| Recommended? | Outdated | **Current standard** |

**Use FID.** IS is mostly historical now. You'll see it in older papers.

---

## 7. Practical Concerns

### Number of samples matters

```
FID with few images:      biased UPWARD (and noisy)
FID with 10,000 images:   decent
FID with 50,000 images:   standard (most papers use this)

Same distribution, 64-d simulation: N=100 → FID ≈ 21, N=500 → 4.4,
N=2,000 → 1.1, N=10,000 → 0.22  (true value: 0)

Rule: use at LEAST 10,000 images. 50,000 is the gold standard.
More samples = more stable FID estimate.
```

### Image preprocessing matters

```
All images must be resized to 299 x 299 (Inception's input size)
Use the SAME preprocessing for real and fake
Different resizing can change FID by 5-10 points!
```

### FID is not perfect

```
1. Assumes features are Gaussian (they're not exactly)
2. Biased with small sample sizes
3. Doesn't capture fine-grained quality differences
4. A bad Inception model = bad FID (garbage in, garbage out)
5. Can't tell you WHY images are bad, only that they are
```

---

## 8. Other Metrics (Brief Overview)

| Metric | What it measures | Used for |
|---|---|---|
| **IS** | Quality + class diversity | Historical, ImageNet |
| **FID** | Real vs fake feature distance | **The standard** |
| **KID** | Like FID but unbiased for small samples | Small datasets |
| **Precision** | What % of fakes look real? | Quality only |
| **Recall** | What % of real data is covered? | Diversity only |
| **LPIPS** | Perceptual similarity between image pairs | Image-to-image |

### Precision and Recall for GANs

```
Precision = "Of all fake images, how many look real?"
  High precision = high quality (but maybe only one mode)

Recall = "Of all real image types, how many can the GAN produce?"
  High recall = high diversity (covers the whole distribution)

Together they tell you:
  High precision + High recall = great GAN
  High precision + Low recall  = mode collapse (few good outputs)
  Low precision  + High recall = blurry but diverse
```

---

## 9. Summary

| Concept | What you learned |
|---|---|
| **Why evaluation is hard** | No "correct answer" — need to measure quality AND diversity |
| **Eye test fails** | Subjective, can't detect mode collapse, not scalable |
| **Inception Score** | Uses classifier confidence + class diversity. Doesn't compare to real data. |
| **FID** | Compares Inception features of real vs fake. Lower = better. The standard. |
| **Features vs pixels** | Features capture semantics, pixels capture positions |
| **Sample count** | Use 10,000-50,000 images for reliable FID |
| **Precision/Recall** | Separate measures for quality vs diversity |

---

## Knowledge Check

1. Two GANs both score FID = 20 — one blurry but covering all 10 digits, one sharp but drawing only 6. Can FID tell them apart? *(No — use precision (quality) and recall (coverage).)*
2. Inception was trained on ImageNet photos. Does FID still make sense for MNIST? *(Mostly — pool3 features capture general shape/edge patterns; many MNIST papers use an MNIST classifier's features instead.)*
3. A competitor reports FID = 20 on 1,000 images; you get 30 on 50,000. Who is better? *(Unknown — and possibly them: small N biases FID upward.)*
4. Why does IS never notice a GAN that draws perfect dogs from a cat dataset? *(It never looks at real images.)*
5. In 1-D, which costs more FID: shifting the mean by 0.5 or doubling σ from 1 to 2? *(Doubling σ: 1.0 vs 0.25.)*

---

## Next Lesson

L13: **FID Deep Dive** — implement FID step by step in code. We'll extract Inception features, compute statistics, and calculate FID for our trained GANs.
