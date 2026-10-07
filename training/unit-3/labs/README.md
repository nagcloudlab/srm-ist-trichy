# Unit 3 labs: evaluate and scale

**Setup:** same environment as Unit 1. See [`../../unit-1/labs/README.md`](../../unit-1/labs/README.md) for installing `torch`, `torchvision`, `matplotlib` and Jupyter, and for running on Colab.

Unit 3 also needs:

```bash
pip install scipy scikit-learn
```

- `scipy` provides the matrix square root for FID.
- `scikit-learn` provides t-SNE.

The Inception v3 weights (~100 MB) download on first use.

| Lab | Lesson | What you build | Compute (approx.) |
|---|---|---|---|
| [`lab-13-fid-score.ipynb`](lab-13-fid-score.ipynb) | L13 · FID deep dive | FID from scratch: Inception pool3 features, mean + covariance, `sqrtm`. Ranks noise, an untrained G and a training DCGAN; tracks FID during training; t-SNE of real vs fake features | ≈ 15 min on `mps` / Colab T4 · ≈ 60 min on CPU |
| [`lab-15-stylegan.ipynb`](lab-15-stylegan.ipynb) | L15 · StyleGAN | A mini-StyleGAN on MNIST: mapping network, AdaIN, noise injection, learned constant, WGAN-GP training. Then style mixing, truncation in W, noise variation, Z vs W interpolation | ≈ 20–30 min on `mps` / Colab T4 · ≈ 60–90 min on CPU (10k-image subset) |

**Order:** run L13's lab after L12 and L13, and L15's lab after L15. L14 (bias and fairness) has no notebook. Try per-class FID with lab-13's functions: generate each digit with the conditional GAN from Unit 2's `lab-10`.

**About the FID numbers:** lab-13 uses torchvision's Inception weights and 2,000 samples. Its FIDs compare models *within the notebook*. They are not comparable to published values, which use `pytorch-fid` (the original TensorFlow weights) and 50,000 samples.

Slides: [`slide-decks/v1/unit-3/`](../../slide-decks/v1/unit-3/) · Unit 3 on the hub: [`training/index.html#unit-3`](../../index.html#unit-3)
