# Lesson 13: FID Score Deep Dive

## Where we are

| L12 | **L13** |
|---|---|
| What FID is and why it matters | **Implement it from scratch and use it** |

L12 gave you the theory. Now we get our hands dirty — extract Inception features, compute the statistics, calculate FID, and use it to compare different GANs.

---

## 1. The FID Pipeline (Recap)

```
Real images ──→ Inception v3 ──→ features (2048-dim) ──→ mean + covariance
                                                              │
                                                         compare (FID formula)
                                                              │
Fake images ──→ Inception v3 ──→ features (2048-dim) ──→ mean + covariance
```

Let's build each piece.

---

## 2. The Inception v3 Feature Extractor

### What layer do we use?

Inception v3 has many layers. For FID, we use the **pool3** layer — the last pooling layer before the final classifier. This gives a **2048-dimensional** vector per image.

```
Input image (3 x 299 x 299)
    ↓
  [conv layers, inception blocks, ...]
    ↓
  pool3 layer → 2048-dim vector    ← WE GRAB THIS
    ↓
  [final linear layer → 1000 class probabilities]  ← we ignore this
```

### Why pool3?

```
Early layers:   detect edges, textures → too low-level
Final layer:    detect ImageNet classes → too specific
Pool3 layer:    detects high-level features (shapes, objects, structures)
                without being tied to specific classes
                → just right for measuring image quality
```

### In PyTorch

```python
import torch
from torchvision.models import inception_v3, Inception_V3_Weights

class InceptionFeatureExtractor:
    def __init__(self, device):
        self.device = device
        # Load pre-trained Inception v3
        self.model = inception_v3(weights=Inception_V3_Weights.DEFAULT)
        self.model.eval()
        self.model.to(device)

        # Hook to grab pool3 features
        self.features = None
        self.model.avgpool.register_forward_hook(self._hook)

    def _hook(self, module, input, output):
        # output shape: (batch, 2048, 1, 1)
        self.features = output.squeeze(-1).squeeze(-1)  # → (batch, 2048)

    @torch.no_grad()
    def extract(self, images):
        # images must be 3-channel, 299x299, normalized
        self.model(images.to(self.device))
        return self.features.cpu()
```

### What's a hook?

```
A hook is a function that PyTorch calls automatically
when a specific layer runs.

self.model.avgpool.register_forward_hook(self._hook)
                    ↑
"When avgpool runs during forward(), also call _hook()"

_hook grabs the output of avgpool and saves it.
We run the full model but only KEEP the pool3 features.
```

### Preprocessing for Inception

Inception v3 expects specific input:

```python
from torchvision import transforms

inception_transform = transforms.Compose([
    transforms.Resize(299),              # resize to 299x299
    transforms.CenterCrop(299),
    transforms.ToTensor(),
    transforms.Normalize(                 # ImageNet normalization
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    ),
])
```

For MNIST (grayscale, 28x28), we need to:
1. Resize from 28 to 299
2. Convert 1 channel to 3 channels (repeat)

```python
def preprocess_for_inception(images):
    """Convert MNIST-style images to Inception-ready format."""
    # images: (batch, 1, 28, 28) in [-1, 1]

    # 1. Scale to [0, 1]
    images = (images + 1) / 2

    # 2. Repeat grayscale to 3 channels
    if images.size(1) == 1:
        images = images.repeat(1, 3, 1, 1)

    # 3. Resize to 299x299
    images = torch.nn.functional.interpolate(
        images, size=(299, 299), mode='bilinear', align_corners=False
    )

    # 4. ImageNet normalization
    mean = torch.tensor([0.485, 0.456, 0.406]).view(1, 3, 1, 1).to(images.device)
    std  = torch.tensor([0.229, 0.224, 0.225]).view(1, 3, 1, 1).to(images.device)
    images = (images - mean) / std

    return images
```

---

## 3. Computing Statistics

### Mean and Covariance

Once we have features for all images, we compute two things:

```python
import numpy as np

def compute_statistics(features):
    """
    features: numpy array of shape (N, 2048)
    Returns: mean (2048,) and covariance (2048, 2048)
    """
    mu    = np.mean(features, axis=0)        # average feature vector
    sigma = np.cov(features, rowvar=False)    # covariance matrix

    return mu, sigma
```

### What do these capture?

```
Mean (mu):
  The "average image" in feature space.
  If real images are mostly bright faces → mu has high "brightness" features
  If fake images are mostly dark blobs → mu has high "darkness" features
  Different means → the distributions are centered differently

Covariance (Sigma):
  How features vary TOGETHER.
  "When 'eye' feature is high, is 'face' feature also high?"
  Captures the SHAPE and SPREAD of the distribution.
  Different covariances → distributions have different shapes
```

### Visualizing what we're comparing

```
Feature space (simplified to 2D):

  Real images:                 Fake images (good GAN):
       ○ ○                          ● ●
     ○ ○ ○ ○                      ● ● ● ●
     ○ ○ ○ ○                      ● ● ● ●
       ○ ○                          ● ●
  (center + shape)              (similar center + shape)
                                → LOW FID

  Fake images (bad GAN):
                  ●
                ● ● ●
              ● ● ● ● ●
                ● ● ●
                  ●
  (different center, different shape)
  → HIGH FID
```

---

## 4. The FID Formula in Code

$$FID = \|\mu_r - \mu_f\|^2 + \text{Tr}\left(\Sigma_r + \Sigma_f - 2\sqrt{\Sigma_r \Sigma_f}\right)$$

```python
from scipy.linalg import sqrtm

def calculate_fid(mu_r, sigma_r, mu_f, sigma_f):
    """
    Calculate Frechet Inception Distance.

    mu_r, sigma_r: mean and covariance of real features
    mu_f, sigma_f: mean and covariance of fake features
    """
    # Term 1: squared distance between means
    diff = mu_r - mu_f
    mean_term = np.dot(diff, diff)     # ||mu_r - mu_f||^2

    # Term 2: trace term (compares covariance shapes)
    # sqrt of matrix product
    covmean = sqrtm(sigma_r @ sigma_f)

    # Numerical stability: remove tiny imaginary parts
    if np.iscomplexobj(covmean):
        covmean = covmean.real

    trace_term = np.trace(sigma_r + sigma_f - 2 * covmean)

    return mean_term + trace_term
```

### Breaking down the formula

```
Term 1: ||mu_r - mu_f||^2
  "How far apart are the centers?"
  If real and fake have the same average features → 0
  If they have very different averages → large number

Term 2: Tr(Sigma_r + Sigma_f - 2*sqrt(Sigma_r * Sigma_f))
  "How different are the shapes?"
  If real and fake have the same spread/correlations → 0
  If they have very different spread → large number

FID = center distance + shape distance
```

### What's `sqrtm`?

```
sqrtm = matrix square root

For a number:  sqrt(9) = 3,  because 3 × 3 = 9
For a matrix:  sqrtm(A) = B, where B × B = A

We need this because covariance matrices are matrices,
not simple numbers. We can't just use sqrt().

scipy.linalg.sqrtm handles this for us.
```

### Worked by hand (1-D)

```
real: mu_r = 0,   sigma_r = 1      fake: mu_f = 0.5, sigma_f = 2
Term 1: (0 - 0.5)^2                  = 0.25
Term 2: 1 + 4 - 2*sqrt(1*4) = 5 - 4  = 1      (= (sigma_r - sigma_f)^2)
FID = 1.25   → the wrong spread costs more than the shifted centre
```

---

## 5. Putting It All Together

### Full FID computation

```python
def compute_fid(real_images, fake_images, feature_extractor, batch_size=64):
    """
    Compute FID between a set of real and fake images.

    real_images: tensor of shape (N, C, H, W)
    fake_images: tensor of shape (N, C, H, W)
    """
    # 1. Extract features for real images
    real_features = []
    for i in range(0, len(real_images), batch_size):
        batch = real_images[i:i+batch_size]
        batch = preprocess_for_inception(batch)
        feats = feature_extractor.extract(batch)
        real_features.append(feats)
    real_features = torch.cat(real_features).numpy()

    # 2. Extract features for fake images
    fake_features = []
    for i in range(0, len(fake_images), batch_size):
        batch = fake_images[i:i+batch_size]
        batch = preprocess_for_inception(batch)
        feats = feature_extractor.extract(batch)
        fake_features.append(feats)
    fake_features = torch.cat(fake_features).numpy()

    # 3. Compute statistics
    mu_r, sigma_r = compute_statistics(real_features)
    mu_f, sigma_f = compute_statistics(fake_features)

    # 4. Calculate FID
    fid = calculate_fid(mu_r, sigma_r, mu_f, sigma_f)

    return fid
```

### Usage

```python
# Get 10,000 real images
real_images = []
for img, _ in real_dataloader:
    real_images.append(img)
    if len(real_images) * img.size(0) >= 10000:
        break
real_images = torch.cat(real_images)[:10000]

# Generate 10,000 fake images
fake_images = []
with torch.no_grad():
    for _ in range(10000 // 64):
        z = torch.randn(64, z_dim, device=device)
        fake = gen(z).cpu()
        fake_images.append(fake)
fake_images = torch.cat(fake_images)[:10000]

# Compute FID
extractor = InceptionFeatureExtractor(device)
fid = compute_fid(real_images, fake_images, extractor)
print(f"FID: {fid:.2f}")
```

---

## 6. Interpreting FID Results

### What to expect for MNIST (illustrative — depends on N and Inception weights)

```
Random noise (no training):      FID ≈ 300-500
After 5 epochs:                  FID ≈ 100-200
After 20 epochs:                 FID ≈ 30-80
Well-trained DCGAN:              FID ≈ 10-30
Well-trained WGAN-GP:            FID ≈ 5-15
State-of-the-art:                FID < 5

Note: MNIST is "easy" — real-world datasets have higher FIDs
```

### Using FID during training

```
Epoch  5: FID = 180.3    ← still learning
Epoch 10: FID = 95.2     ← getting better
Epoch 15: FID = 48.7     ← decent
Epoch 20: FID = 31.1     ← good
Epoch 25: FID = 28.5     ← diminishing returns
Epoch 30: FID = 29.8     ← might be overfitting or fluctuating
Epoch 35: FID = 45.2     ← getting worse! Stop here, use epoch 25

FID going down = training is working
FID going up   = something is wrong (collapse, overfitting)
FID flattening = model has converged
```

### Comparing models

```
Model A (DCGAN):          FID = 35.2
Model B (WGAN):           FID = 22.8
Model C (WGAN-GP):        FID = 18.4
Model D (cGAN + WGAN-GP): FID = 12.1

Model D is the best (lowest FID).
This matches our intuition — more techniques = better results.
```

---

## 7. Common Pitfalls

### Sample count matters

```
Small N biases FID UPWARD (it is not just noisier).
Two samples from the SAME 64-d Gaussian (true FID = 0):
  N =    100:  FID ≈ 21
  N =    500:  FID ≈ 4.4
  N =  2,000:  FID ≈ 1.1
  N = 10,000:  FID ≈ 0.22
In 2048-d Inception space the bias is larger still.

Always report the number of samples used!
Always use the SAME number when comparing models.
```

### Preprocessing must be identical

```
BAD:
  Real images: resized with bilinear interpolation
  Fake images: resized with nearest-neighbor
  → Different preprocessing → FID is wrong!

GOOD:
  Same resize method, same normalization, same everything
  for both real and fake
```

### FID = 0 doesn't mean perfect

```
FID = 0 means the feature distributions are identical.
This could mean:
  1. G perfectly learned the distribution (unlikely)
  2. G memorized the training data (overfitting!)
  3. You accidentally computed FID of real vs real

Check for memorization: compare generated images
to their nearest neighbor in the training set.
```

---

## 8. Using `pytorch-fid` (The Easy Way)

In practice, most people use the `pytorch-fid` library instead of implementing from scratch:

```bash
pip install pytorch-fid
```

```bash
# Save real images to a folder
# Save fake images to another folder
# Run:
python -m pytorch_fid path/to/real path/to/fake
```

Or in Python:

```python
from pytorch_fid import fid_score

fid = fid_score.calculate_fid_given_paths(
    ['path/to/real', 'path/to/fake'],
    batch_size=50,
    device=device,
    dims=2048
)
print(f"FID: {fid:.2f}")
```

This handles all the preprocessing, feature extraction, and computation correctly, and it uses the original TensorFlow Inception weights — so its numbers are comparable to published papers. FIDs from torchvision's Inception weights (our from-scratch version and lab-13) are NOT comparable to paper numbers. Use pytorch-fid for any serious evaluation.

---

## 9. FID Variants

### Kernel Inception Distance (KID)

```
Problem with FID: biased for small sample sizes
KID fix: uses a kernel trick that gives UNBIASED estimates

Use KID when: you have fewer than 10,000 images
Use FID when:  you have 10,000+ images (the standard)
```

### Clean-FID

```
Problem: different FID implementations give different numbers
         (due to resizing differences, library versions, etc.)

Clean-FID: a standardized implementation that gives reproducible results
           pip install clean-fid

Use this for paper-quality results.
```

---

## 10. Summary

| Concept | What you learned |
|---|---|
| **Feature extraction** | Use Inception v3 pool3 layer → 2048-dim vector per image |
| **Preprocessing** | Resize to 299x299, 3 channels, ImageNet normalization |
| **Statistics** | Compute mean and covariance of feature vectors |
| **FID formula** | Center distance + shape distance between two Gaussians |
| **sqrtm** | Matrix square root (scipy) — needed for covariance comparison |
| **Interpretation** | Lower = better. 0-10 excellent, 10-50 good, 50+ needs work |
| **Sample count** | Use 10,000+ samples, always same count for comparisons |
| **pytorch-fid** | Production library for reliable FID computation |

---

## Knowledge Check

1. Why do we use the pool3 layer of Inception, not the final classifier output?
2. How do you convert MNIST images (1x28x28) for Inception input?
3. What do the mean and covariance of features represent?
4. In the FID formula, what does the first term measure? The second term?
5. What is `sqrtm` and why do we need it?
6. You compute FID ≈ 0 between your GAN and training data. Is this good? Why or why not?
7. Why must you use the same number of samples when comparing two models?
8. What's the advantage of KID over FID for small datasets?

---

## Next Lesson

L14: **GAN Bias and Fairness** — your GAN is only as good as its data. What happens when the training data is biased? How do biased GANs cause real-world harm?
