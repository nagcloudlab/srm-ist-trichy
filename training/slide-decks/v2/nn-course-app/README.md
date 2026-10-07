# Neural networks course app (14 lessons)

An interactive web app covering the same neural-network foundations as Unit 1's "Neural networks" topic: neuron → loss → gradient → learning rate → training loop → chain rule → weight + bias → multiple inputs → ReLU → hidden layers → backprop → Sigmoid + BCE → classifier → PyTorch.

Its visual design is the original that the advanced decks were modelled on.

Unlike the advanced decks, it is a Next.js (vinext) app and needs a dev server to view:

```bash
cd training/slide-decks/v2/nn-course-app
npm install        # first time only
npm run dev        # then open the printed local URL
```

See `DECK-SYSTEM.md` for how the app is structured. For offline use, the Unit 1 advanced deck `training/slide-decks/v2/unit-1/2-neural-networks.html` covers the same ground as a single file.
