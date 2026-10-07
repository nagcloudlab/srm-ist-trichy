# Unit 2 Labs — Setup & Guide

Setup (Python, PyTorch, Jupyter, devices, MNIST download, Colab) is the same as Unit 1 — see
[`../../unit-1/labs/README.md`](../../unit-1/labs/README.md).

```bash
cd training/unit-2/labs
jupyter notebook
```

All four labs are DCGAN-based. On a CPU-only machine they train on a smaller MNIST subset (`TRAIN_SUBSET` in the
data cell); set it to `None` for the full 60k images. A GPU or Apple-silicon Mac (`mps`) is strongly recommended.

## Lab Map

| Lab File | After | What participants build |
|----------|-------|------------------------|
| `lab-08-wgan.ipynb` | L08 WGAN | A WGAN: critic without Sigmoid, Wasserstein loss, weight clipping (c = 0.01), 5 critic steps per G step, RMSprop 5e-5. Read the critic loss as a distance estimate; try other clip values. |
| `lab-09-wgan-gp.ipynb` | L09 WGAN-GP | Replace clipping with the gradient penalty (λ = 10) on interpolates; no BatchNorm in the critic; Adam 1e-4, β = (0, 0.9). Experiment with λ. |
| `lab-10-conditional-gan.ipynb` | L10 Conditional GAN | Feed the digit label to G (embedding) and D (label maps): generate any chosen digit; fixed-noise vs fixed-label grids. Saves `cgan_generator.pt`. |
| `lab-11-controllable-generation.ipynb` | L11 Controllable generation | Latent interpolation, single-dimension sweeps, latent arithmetic, conditional interpolation and truncation. Loads `cgan_generator.pt` from lab-10 if present (otherwise trains it). |

Run **lab-10 before lab-11** so lab-11 can reuse the trained conditional generator.

The advanced decks in [`slide-decks/v2/unit-2/`](../../slide-decks/v2/unit-2/) include a "Lab demo" slide for each notebook.
