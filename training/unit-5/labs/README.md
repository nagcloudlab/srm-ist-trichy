# Unit 5 Labs — Setup & Guide

Setup (Python, PyTorch, Jupyter, devices, MNIST download, Colab) is the same as Unit 1 — see
[`../../unit-1/labs/README.md`](../../unit-1/labs/README.md).

```bash
cd training/unit-5/labs
jupyter notebook
```

## Lab Map

| Lab File | After | What participants build |
|----------|-------|------------------------|
| `lab-19-cyclegan.ipynb` | L19 CycleGAN | CycleGAN on two unpaired MNIST domains (normal vs inverted + thickened, different images). ResNet generators, PatchGAN critics, LSGAN loss, cycle (λ = 10) and identity (5) losses, replay buffer of 50. Experiments: without cycle loss, identity test. |
| `lab-20-satellite-to-map.ipynb` | L20 Capstone | Full 256×256 Pix2Pix on the real Maps dataset (1,096 train / 1,098 val pairs, ~240 MB download from the Pix2Pix authors' server). Satellite → map and map → satellite, plus PatchGAN score maps. |

**Runtime** (measured on an Apple-silicon laptop; each lab trains twice — lab-19 with and without the cycle loss, lab-20 in both directions):

| Lab | `mps` | Laptop CPU | CUDA GPU |
|---|---|---|---|
| lab-19 | 10k images per domain × 30 epochs ≈ 25 min | 3k per domain × 10 epochs ≈ 45 min | all data, 30 epochs |
| lab-20 | all pairs × 20 epochs ≈ 30 min | 400 pairs × 10 epochs ≈ 25 min | 50 epochs |

Each notebook picks these sizes automatically.

lab-20 needs internet for the first download (the data lands in `data/maps/`, which git ignores).

The simple decks [`slide-decks/v1/unit-5/L19.html`](../../slide-decks/v1/unit-5/L19.html) and [`slide-decks/v1/unit-5/L20.html`](../../slide-decks/v1/unit-5/L20.html) each have a "Lab demo" slide.
