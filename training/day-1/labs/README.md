# Day 1 Labs — Setup & Guide

## Quick Setup

### Prerequisites
```bash
# Python 3.9+
python3 --version

# Install dependencies
pip install torch torchvision matplotlib jupyter numpy
```

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

### Session 3: Neural Networks (NN-L00 to NN-L14)

| Lab File | After Lesson | Time | What participants build |
|----------|-------------|------|------------------------|
| `lab-p1-the-learning-neuron.ipynb` | NN-L05 (Training Loop) | 45 min | Single neuron that learns w=2, b=5 from data. Pure Python, no libraries. |
| `lab-p2-hidden-layers-and-backprop.ipynb` | NN-L11 (Backpropagation) | 60 min | 2-layer network with ReLU. Implement forward pass AND backprop from scratch. Train it to learn \|x\|. |
| `lab-p3-build-a-classifier.ipynb` | NN-L13 (Build a Classifier) | 45 min | Binary classifier with Sigmoid + BCE. The "this IS a Discriminator" moment in code. |
| `lab-00-intro-to-pytorch.ipynb` | NN-L14 (PyTorch) | 45 min | Redo everything from labs P1-P3 in PyTorch. See how 50 lines collapse to 10. |

### Session 4: Building GANs (L02 to L06)

| Lab File | After Lesson | Time | What participants build |
|----------|-------------|------|------------------------|
| `phase1-lab-02-simple-gan.ipynb` | L02 (Build First GAN) | 45 min | GAN that generates the number 7. The full Step A / Step B loop. |
| `phase1-lab-03-mnist-gan.ipynb` | L03 (GAN for Images) | 60 min | GAN for MNIST digits. 784-pixel output, Tanh, LeakyReLU, image visualization. |
| `phase1-lab-05-dcgan.ipynb` | L05 (DCGAN) | 75 min | Convolutional GAN with BatchNorm. Compare sharp DCGAN vs blurry Linear GAN. Latent space walk. |
| `phase1-lab-06-training-tricks.ipynb` | L06 (When GANs Break) | 75 min | Deliberately break a GAN (mode collapse, D too strong), then fix it with label smoothing, noise, LR balance. |

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
| 16:00 | GAN L02 slides + **Lab: Build First GAN** (1 hr) |
| 17:00 | GAN L03-L05 slides + **Lab: DCGAN** (1 hr) |
| 18:00 | Wrap-up |

### If you have a half day (4 hours):

| Time | Activity |
|------|----------|
| 09:00 | S1 + S2 slides (45 min) |
| 09:45 | NN-L01, L05, L09, L11, L12, L14 (key lessons only, 1 hr) |
| 10:45 | **Lab P1: The Learning Neuron** (30 min) |
| 11:15 | GAN L02 slides + **Lab: Build First GAN** (45 min) |
| 12:00 | GAN L05 slides + **Lab: DCGAN** (45 min) |
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
  - **Lab 02**: "G always outputs the same number" → Check `.detach()` is present
  - **Lab 03**: "Images are all black" → Check normalization (should be [-1,1] with Tanh)
  - **Lab 05**: "DCGAN loss is NaN" → Reduce learning rate to 0.0002

### After each lab
- Ask: "What surprised you?"
- Show the solution notebook if participants are stuck
- Connect back to the slides: "This is exactly what slide X showed"

---

## File Inventory

```
labs/
├── README.md                              ← This file
│
├── Session 3: Neural Networks
│   ├── lab-p1-the-learning-neuron.ipynb    ← After NN-L05 (45 min)
│   ├── lab-p2-hidden-layers-and-backprop.ipynb  ← After NN-L11 (60 min)
│   ├── lab-p3-build-a-classifier.ipynb     ← After NN-L13 (45 min)
│   └── lab-00-intro-to-pytorch.ipynb       ← After NN-L14 (45 min)
│
├── Session 4: Building GANs
│   ├── phase1-lab-02-simple-gan.ipynb      ← After L02 (45 min)
│   ├── phase1-lab-03-mnist-gan.ipynb       ← After L03 (60 min)
│   ├── phase1-lab-05-dcgan.ipynb           ← After L05 (75 min)
│   └── phase1-lab-06-training-tricks.ipynb ← After L06 (75 min)
│
└── Also available (Phase 0 versions)
    ├── lab-01-simple-gan.ipynb
    ├── lab-02-mnist-gan.ipynb
    ├── lab-03-dcgan.ipynb
    └── lab-04-training-tricks.ipynb
```
