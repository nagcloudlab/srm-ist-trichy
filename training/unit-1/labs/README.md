# Unit 1 Labs — Setup & Guide

## Quick Setup

### Prerequisites
```bash
# Python 3.9+
python3 --version

# Install dependencies (CPU wheels are fine)
pip install torch torchvision matplotlib jupyter numpy
```

The notebooks pick the fastest device automatically: `cuda` (NVIDIA) → `mps` (Apple-silicon Mac) → `cpu`.
On a CPU-only machine the DCGAN-based labs (lab-03, lab-04 and the Unit 2 labs) train on a smaller MNIST
subset (`TRAIN_SUBSET` in the data cell); set it to `None` for the full 60k images.

MNIST (~12 MB) and Fashion-MNIST download into `./data` next to the notebooks on first use — run one data cell
in advance if the room's network is slow.

### Start Jupyter
```bash
cd training/unit-1/labs
jupyter notebook
```
Then open any `.ipynb` file from the browser.

### Google Colab (no local setup needed)
1. Upload the `.ipynb` file to [colab.research.google.com](https://colab.research.google.com)
2. Runtime → Change runtime type → GPU (recommended for Lab 03+)
3. Run all cells

---

## Two Types of Labs

### 1. Interactive Slide Labs (built into slides)
These run **inside the slide decks** — no setup needed. Just present the slide and drag the sliders.

> The advanced decks in [`slide-decks/v2/unit-1/`](../../slide-decks/v2/unit-1/) have their own live labs built into their slides,
> plus a "Lab demo" slide before each notebook below. The table lists the labs of the simple per-lesson decks
> in [`slide-decks/v1/unit-1/`](../../slide-decks/v1/unit-1/).

| Lab | In Lesson | What it does |
|-----|-----------|-------------|
| **Step-Size** | NN-L04 | Drag η, see weight land on loss curve |
| **Descent Simulator** | NN-L05 | Press Run, watch 10 training steps converge or explode |
| **Gradient Calculator** | NN-L06 | Drag w and x, see exact gradient update live |
| **ReLU Gate** | NN-L09 | Drag z from -4 to +4, see what passes through |
| **Sigmoid + BCE** | NN-L12 | Drag z, toggle real/fake, watch loss react |

> These are powered by `training/slide-decks/v1/unit-1/nn-lessons/labs.js` — pure JavaScript, no server needed.

### 2. Jupyter Notebook Labs (hands-on coding)
These are **coding exercises** for participants to run on their own machines or on Colab.

---

## Lab Map — Which Lab Goes With Which Topic

### Neural networks: from one neuron to PyTorch

| Lab File | After | What participants build |
|----------|-------|------------------------|
| `lab-p1-the-learning-neuron.ipynb` | The learning step / training loop (NN-L05) | Single neuron that learns w=2, b=5 from data. Pure Python, no libraries. |
| `lab-p2-hidden-layers-and-backprop.ipynb` | Backpropagation + dead ReLU (NN-L11) | 2-layer network with ReLU. Forward pass AND backprop from scratch, learning \|x\|. |
| `lab-p3-build-a-classifier.ipynb` | Sigmoid + BCE (NN-L13) | Binary classifier with Sigmoid + BCE. The "this IS a Discriminator" moment in code. |
| `lab-00-intro-to-pytorch.ipynb` | PyTorch (NN-L14) | Redo labs P1–P3 in PyTorch. See how 50 lines collapse to 10. |

### Build GANs: from the number 7 to DCGAN

| Lab File | After | Compute (approx.) | What participants build |
|----------|-------|-------------------|------------------------|
| `lab-01-simple-gan.ipynb` | Build your first GAN (L02) | ~2 min CPU | GAN that generates the number 7 — Step A / Step B loop, `.detach()`, real labels for G; experiments on target, learning rates, network size, a Gaussian. |
| `lab-02-mnist-gan.ipynb` | MNIST GAN (L03) | ~10 min CPU | Linear GAN for MNIST: 784-pixel output, [−1, 1] + Tanh, LeakyReLU D, fixed-noise grids, noise-size and single-digit experiments. |
| `lab-03-dcgan.ipynb` | DCGAN (L05) | ~15 min mps · ~25 min CPU (10k subset) · ~10 min GPU | DCGAN with BatchNorm and DCGAN init; Linear vs DCGAN, latent walks, no-BatchNorm and Fashion-MNIST experiments. |
| `lab-04-training-tricks.ipynb` | When GANs break (L06) | ~20–25 min mps · ~45–50 min CPU (5k subset) · ~30 min GPU | Break a DCGAN on purpose (mode collapse, D too strong), fix it with label smoothing, instance noise, LR balance; diagnostic dashboard; fix-the-broken-GAN challenge. |

### Unit 2 labs

The Unit 2 notebooks (`lab-08-wgan`, `lab-09-wgan-gp`, `lab-10-conditional-gan`, `lab-11-controllable-generation`)
live in [`../../unit-2/labs/`](../../unit-2/labs/). Run lab-10 before lab-11: it saves `cgan_generator.pt`, which
lab-11 loads instead of retraining.

---

## Suggested Order

Teach at your own pace; this is the order the topics build on each other.

1. **Generative AI and the GAN idea** — S1 + S2 slides (no notebook).
2. **Neural networks** — NN-L01 to NN-L05 → **Lab P1** · NN-L06 to NN-L11 → **Lab P2** · NN-L12 to NN-L13 → **Lab P3** · NN-L14 → **Lab 0**.
3. **Build GANs** — GAN L02 → **Lab 01** · L03 → **Lab 02** · L04–L05 → **Lab 03** · L06 → **Lab 04**.

Short on time? Key lessons only: NN-L01, L05, L09, L11, L12, L14 → Lab P1 → GAN L02 + Lab 01 → GAN L05 + Lab 03.

---

## Lab Tips for Instructors

### Before teaching
- [ ] Test all notebooks on your machine
- [ ] Pre-download MNIST dataset (`torchvision.datasets.MNIST(download=True)`)
- [ ] If using Colab, upload notebooks and verify GPU runtime works

### During labs
- Walk the room while participants code
- Common stuck points:
  - **Lab P1**: "Why does the loss stop decreasing?" → Learning rate too small
  - **Lab 01**: "G's output drifts away from 7" → Check `.detach()` in Step A and that G's loss uses `real_label`
  - **Lab 02**: "Images are all black / washed out" → Check normalization (data must be [-1, 1] to match Tanh)
  - **Lab 03**: "DCGAN loss is NaN" → Check the learning rate is 0.0002 with `betas=(0.5, 0.999)`
  - **Labs 03–04 are slow** → Use a GPU / Apple-silicon (`mps`), or keep the CPU `TRAIN_SUBSET` default

### After each lab
- Ask: "What surprised you?"
- Show the solution notebook if participants are stuck
- Connect back to the slides: "This is exactly what slide X showed"

---

## File Inventory

```
unit-1/labs/
├── README.md                                ← This file
│
├── Neural networks
│   ├── lab-p1-the-learning-neuron.ipynb      ← After the learning step
│   ├── lab-p2-hidden-layers-and-backprop.ipynb ← After backprop / dead ReLU
│   ├── lab-p3-build-a-classifier.ipynb       ← After Sigmoid + BCE
│   └── lab-00-intro-to-pytorch.ipynb         ← After PyTorch
│
├── Build GANs
│   ├── lab-01-simple-gan.ipynb               ← After L02 first GAN
│   ├── lab-02-mnist-gan.ipynb                ← After L03 MNIST GAN
│   ├── lab-03-dcgan.ipynb                    ← After L05 DCGAN
│   └── lab-04-training-tricks.ipynb          ← After L06 When GANs break
│
└── data/                                     ← MNIST downloads here (git-ignored)
```

Numbering note: the Build GANs labs are numbered 01–04 (they follow lessons L02, L03, L05, L06; the convolutions
lesson L04 has no notebook). From Unit 2 on, a lab shares its lesson's number (lab-08 ↔ L08).
