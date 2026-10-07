# Unit 4 Labs — Setup & Guide

Setup (Python, PyTorch, Jupyter, devices, MNIST download, Colab) is the same as Unit 1 — see
[`../../unit-1/labs/README.md`](../../unit-1/labs/README.md).

```bash
cd training/unit-4/labs
jupyter notebook
```

## Lab Map

| Lab File | After | What participants build |
|----------|-------|------------------------|
| `lab-17-pix2pix.ipynb` | L17 Pix2Pix | Pix2Pix on MNIST: Sobel edge maps (input x) → original digits (target image y). U-Net generator, PatchGAN discriminator on the (x, y) pair, loss = GAN + 100·L1, Adam 2e-4, β1 0.5. Experiments: L1 only vs L1 + GAN, PatchGAN score maps, no skip vs U-Net. |

L18 (augmentation & privacy) has no notebook.

**Runtime** (3 models × 20 epochs, measured on an Apple-silicon laptop):

- **`mps`:** ≈ 15–20 min.
- **Laptop CPU:** the notebook uses a 10,000-image subset, ≈ 45 min.
- **CUDA GPU:** faster still.

The simple deck [`slide-decks/v1/unit-4/L17.html`](../../slide-decks/v1/unit-4/L17.html) has a "Lab demo" slide for this notebook.
