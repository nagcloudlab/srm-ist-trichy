# Day 1 Labs — Setup & Guide

## Quick Setup

### Prerequisites
```bash
# Python 3.9+
python3 --version

# Install dependencies (CPU wheels are fine)
pip install torch torchvision matplotlib jupyter numpy
```

The notebooks pick the fastest device automatically: `cuda` (NVIDIA) → `mps` (Apple-silicon Mac) → `cpu`.
On a CPU-only machine the DCGAN-based labs (lab-03, lab-04 and the Day 2 labs) train on a smaller MNIST
subset (`TRAIN_SUBSET` in the data cell) so each lab fits its session; set it to `None` for the full 60k images.

MNIST (~12 MB) and Fashion-MNIST download into `./data` next to the notebooks on first use — run one data cell
before the session if the room's network is slow.

### Start Jupyter
```bash
cd training/day-1/labs
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
These run **inside the slide deck** — no setup needed. Just present the slide and drag the sliders.

> The new Day 1 deck (`training/day-1/slide-deck/dist/index.html`) has its own live labs built into its slides,
> plus a "Lab demo" slide before each notebook below. The table lists the labs of the original HTML lessons.

| Lab | In Lesson | What it does |
|-----|-----------|-------------|
| **Step-Size** | NN-L04 | Drag η, see weight land on loss curve |
| **Descent Simulator** | NN-L05 | Press Run, watch 10 training steps converge or explode |
| **Gradient Calculator** | NN-L06 | Drag w and x, see exact gradient update live |
| **ReLU Gate** | NN-L09 | Drag z from -4 to +4, see what passes through |
| **Sigmoid + BCE** | NN-L12 | Drag z, toggle real/fake, watch loss react |

> These are powered by `nn-lessons/labs.js` — pure JavaScript, no server needed.

### 2. Jupyter Notebook Labs (hands-on coding)
These are **coding exercises** for participants to run on their own machines or on Colab.

---

## Lab Map — Which Lab Goes With Which Lesson

### Session 3: Neural Networks

| Lab File | After | Time | What participants build |
|----------|-------|------|------------------------|
| `lab-p1-the-learning-neuron.ipynb` | The learning step / training loop (NN-L05) | 45 min | Single neuron that learns w=2, b=5 from data. Pure Python, no libraries. |
| `lab-p2-hidden-layers-and-backprop.ipynb` | Backpropagation + dead ReLU (NN-L11) | 60 min | 2-layer network with ReLU. Forward pass AND backprop from scratch, learning \|x\|. |
| `lab-p3-build-a-classifier.ipynb` | Sigmoid + BCE (NN-L13) | 45 min | Binary classifier with Sigmoid + BCE. The "this IS a Discriminator" moment in code. |
| `lab-00-intro-to-pytorch.ipynb` | PyTorch (NN-L14) | 45 min | Redo labs P1–P3 in PyTorch. See how 50 lines collapse to 10. |

### Session 4: Your First GAN

| Lab File | After | Time | Compute | What participants build |
|----------|-------|------|---------|------------------------|
| `lab-01-simple-gan.ipynb` | Build your first GAN (L02) | 45 min | ~2 min CPU | GAN that generates the number 7 — Step A / Step B loop, `.detach()`, real labels for G; experiments on target, learning rates, network size, a Gaussian. |

### Session 5: GANs for Images

| Lab File | After | Time | Compute (approx.) | What participants build |
|----------|-------|------|-------------------|------------------------|
| `lab-02-mnist-gan.ipynb` | MNIST GAN (L03) | 60 min | ~10 min CPU | Linear GAN for MNIST: 784-pixel output, [−1, 1] + Tanh, LeakyReLU D, fixed-noise grids, noise-size and single-digit experiments. |
| `lab-03-dcgan.ipynb` | DCGAN (L05) | 75 min | ~15 min mps · ~25 min CPU (10k subset) · ~10 min GPU | DCGAN with BatchNorm and DCGAN init; Linear vs DCGAN, latent walks, no-BatchNorm and Fashion-MNIST experiments. |
| `lab-04-training-tricks.ipynb` | When GANs break (L06) | 75 min | ~20–25 min mps · ~45–50 min CPU (5k subset) · ~30 min GPU | Break a DCGAN on purpose (mode collapse, D too strong), fix it with label smoothing, instance noise, LR balance; diagnostic dashboard; fix-the-broken-GAN challenge. |

### Legacy / optional

`phase1-lab-02-simple-gan.ipynb`, `phase1-lab-03-mnist-gan.ipynb`, `phase1-lab-05-dcgan.ipynb`,
`phase1-lab-06-training-tricks.ipynb` are earlier versions of the Session 4–5 labs. They are not used by the
current deck — keep them only as extra practice.

### Day 2 labs

The Day 2 notebooks (`lab-08-wgan`, `lab-09-wgan-gp`, `lab-10-conditional-gan`, `lab-11-controllable-generation`)
live in `training/day-2/labs/`. Run lab-10 before lab-11: it saves `cgan_generator.pt`, which lab-11 loads
instead of retraining.

---

## Recommended Lab Schedule

### If you have a full day (8 hours):

| Time | Activity |
|------|----------|
| 09:00 | S1 slides + S2 slides (1.5 hr) |
| 10:30 | NN-L01 to NN-L05 slides (1 hr) |
| 11:30 | **Lab P1: The Learning Neuron** (45 min) |
| 12:15 | Lunch |
| 13:00 | NN-L06 to NN-L11 slides (1 hr) |
| 14:00 | **Lab P2: Hidden Layers + Backprop** (45 min) |
| 14:45 | NN-L12 to NN-L14 slides (45 min) |
| 15:30 | **Lab P3: Build a Classifier** (30 min) |
| 16:00 | GAN L02 slides + **Lab: Build First GAN** (`lab-01`) (1 hr) |
| 17:00 | GAN L03-L05 slides + **Lab: DCGAN** (`lab-03`) (1 hr) |
| 18:00 | Wrap-up |

### If you have a half day (4 hours):

| Time | Activity |
|------|----------|
| 09:00 | S1 + S2 slides (45 min) |
| 09:45 | NN-L01, L05, L09, L11, L12, L14 (key lessons only, 1 hr) |
| 10:45 | **Lab P1: The Learning Neuron** (30 min) |
| 11:15 | GAN L02 slides + **Lab: Build First GAN** (`lab-01`) (45 min) |
| 12:00 | GAN L05 slides + **Lab: DCGAN** (`lab-03`) (45 min) |
| 12:45 | Wrap-up |

---

## Lab Tips for Instructors

### Before the session
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
labs/
├── README.md                                ← This file
│
├── Session 3: Neural Networks
│   ├── lab-p1-the-learning-neuron.ipynb      ← After the learning step (45 min)
│   ├── lab-p2-hidden-layers-and-backprop.ipynb ← After backprop / dead ReLU (60 min)
│   ├── lab-p3-build-a-classifier.ipynb       ← After Sigmoid + BCE (45 min)
│   └── lab-00-intro-to-pytorch.ipynb         ← After PyTorch (45 min)
│
├── Session 4: Your First GAN
│   └── lab-01-simple-gan.ipynb               ← After L02 (45 min)
│
├── Session 5: GANs for Images
│   ├── lab-02-mnist-gan.ipynb                ← After L03 MNIST GAN (60 min)
│   ├── lab-03-dcgan.ipynb                    ← After L05 DCGAN (75 min)
│   └── lab-04-training-tricks.ipynb          ← After L06 When GANs break (75 min)
│
└── Legacy / optional (not used by the current deck)
    ├── phase1-lab-02-simple-gan.ipynb
    ├── phase1-lab-03-mnist-gan.ipynb
    ├── phase1-lab-05-dcgan.ipynb
    └── phase1-lab-06-training-tricks.ipynb
```
