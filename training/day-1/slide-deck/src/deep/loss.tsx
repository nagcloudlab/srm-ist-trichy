import type { ReactNode } from 'react';
import {
  Answer, Bridge, Cards, Divider, Flow, FormulaSteps, FormulaTerms, Predict, Quiz, T, Table, Takeaway,
} from '../components/kit';
import { ClassificationLossLab, RegressionLossLab } from '../labs/DeepLossLabs';
import type { Part } from '../types';
import './loss.css';

const Op = ({ children }: { children: ReactNode }) => <span className="op">{children}</span>;

export const lossPart: Part = {
  id: 'loss',
  code: 'LOSS',
  label: 'Loss functions',
  title: 'A loss function defines what “better” means',
  when: '',
  minutes: 0,
  slides: [
    /* ------------------------------------------------------------ Open */
    {
      id: 'loss-divider',
      section: 'Why a loss',
      kicker: 'Part · Loss functions',
      title: 'A loss function defines what “better” means',
      layout: 'divider',
      notes: {
        time: '1 min',
        say: 'The optimizer only ever sees one number and its gradient. Choosing the loss is choosing what the network is allowed to care about.',
        ask: 'If two losses have the same minimum, can they still train differently?',
      },
      render: () => (
        <Divider
          code="LOSS"
          title="A loss function defines what “better” means"
          promise="Regression, classification, probability and the GAN loss family — every formula term by term."
          items={['Regression · MSE, MAE, Huber', 'Classification · BCE, logits, softmax CE', 'Losses as likelihood · KL', 'The GAN loss family']}
        />
      ),
    },
    {
      id: 'loss-job',
      section: 'Why a loss',
      kicker: 'The job of a loss',
      title: 'A loss turns every mistake into one number with a slope',
      notes: {
        time: '2 min',
        say: 'Three requirements. One scalar so the optimizer can compare. Differentiable so backprop has a slope. Aligned with the goal, because the network will optimize exactly what you wrote — not what you meant.',
        ask: 'Accuracy is what we care about for classifiers — why do we not train on accuracy directly?',
      },
      render: () => (
        <>
          <Flow size="sm" nodes={[
            { label: 'prediction', value: 'ŷ', tone: 'mint' }, { op: 'vs' },
            { label: 'target', value: 'y', tone: 'blue' }, { op: '→' },
            { label: 'loss', value: 'L(ŷ, y)', tone: 'coral' }, { op: '→' },
            { label: 'gradient', value: '∂L/∂w', tone: 'violet' }, { op: '→' },
            { label: 'update', value: 'w − η·∂L/∂w', tone: 'yellow' },
          ]} />
          <Cards cols={3} items={[
            { tag: 'One number', title: 'A scalar', body: 'All mistakes summarised so “lower” has one meaning.', tone: 'blue' },
            { tag: 'A slope', title: 'Differentiable', body: 'Accuracy is a step function — its gradient is 0 almost everywhere.', tone: 'violet' },
            { tag: 'The goal', title: 'Aligned', body: 'The network optimizes exactly what you wrote, not what you meant.', tone: 'coral' },
          ]} />
        </>
      ),
    },

    /* ------------------------------------------------------------ Regression */
    {
      id: 'loss-regression-three',
      section: 'Regression',
      kicker: 'Three regression losses',
      title: 'MSE chases the mean, MAE the median, Huber sits between',
      notes: {
        time: '3 min',
        say: 'Read the gradient column: it is what each data point “says” to the model. MSE’s pull grows with the error, MAE’s pull is always ±1, Huber is MSE near zero and MAE far away. That is why the best constant is the mean for MSE and the median for MAE.',
        ask: 'Which loss lets one wild point move the model the most?',
      },
      render: () => (
        <>
          <Table
            headers={['Loss', 'Per example (e = ŷ − y)', 'Gradient ∂/∂ŷ', 'Best constant', 'PyTorch']}
            rows={[
              ['MSE', 'e²', '2e — grows with the error', 'mean', 'nn.MSELoss()'],
              ['MAE', '|e|', 'sign(e) — always ±1', 'median', 'nn.L1Loss()'],
              ['Huber (δ)', '½e² if |e| ≤ δ · else δ(|e| − ½δ)', 'e, clipped to ±δ', 'between', 'nn.HuberLoss(delta=δ)'],
            ]}
            highlight={[2]}
          />
          <Takeaway>Huber = MSE’s smooth bottom + MAE’s bounded pull. <b>δ</b> is where one turns into the other.</Takeaway>
        </>
      ),
    },
    {
      id: 'loss-huber-terms',
      section: 'Regression',
      kicker: 'Huber · term by term',
      title: 'Huber is quadratic for small errors and linear for big ones',
      notes: {
        time: '3 min',
        say: 'Two pieces glued at |e| = δ. The −½δ² is not decoration: it makes the two pieces meet with the same value and the same slope at δ, so the loss stays smooth. SmoothL1Loss is Huber with δ = 1 (scaled).',
        ask: 'What happens to Huber as δ grows very large? As δ → 0?',
      },
      render: () => (
        <FormulaTerms
          reading="if the error is small, square it (halved); if it is large, grow only linearly"
          symbolWidth="10.5rem"
          formula={<><span>L<sub>δ</sub>(e)</span><Op>=</Op><span>½</span><T tone="coral">e</T><span>²</span><span style={{ fontSize: '.55em' }}>if |e| ≤ δ</span><Op>·</Op><T tone="violet">δ</T><span>(|</span><T tone="coral">e</T><span>| −</span><span>½</span><T tone="violet">δ</T><span>)</span><span style={{ fontSize: '.55em' }}>otherwise</span></>}
          terms={[
            { symbol: 'e = ŷ − y', name: 'Error', meaning: 'Signed miss of one prediction', range: '−∞ … ∞', tone: 'coral' },
            { symbol: 'δ', name: 'Threshold', meaning: 'Where “small error” ends · in the units of y', range: 'δ > 0', tone: 'violet' },
            { symbol: '½e²', name: 'Inner zone', meaning: 'MSE-like · gradient e shrinks to 0 at the minimum', range: '|e| ≤ δ', tone: 'blue' },
            { symbol: 'δ|e| − ½δ²', name: 'Outer zone', meaning: 'MAE-like · gradient stays ±δ, so outliers can’t shout', range: '|e| > δ', tone: 'mint' },
            { symbol: '−½δ²', name: 'Glue term', meaning: 'Makes both zones meet with equal value and slope at δ', tone: 'yellow' },
          ]}
        />
      ),
    },
    {
      id: 'loss-outlier-steps',
      section: 'Regression',
      kicker: 'One outlier · worked',
      title: 'One outlier at 30 drags the MSE fit from 4.5 to 9.6',
      notes: {
        time: '3 min',
        say: 'Fit one constant to 3, 4, 5, 6 and an outlier 30. MSE’s best constant is the mean: 9.6, nowhere near the typical value. Evaluate the gradients at c = 5: under MSE the outlier pulls with −50 while each normal point pulls with at most 4. Under MAE and Huber (δ = 1) every point pulls with at most 1, so the fit stays at 5.',
        ask: 'If the 30 is a sensor glitch, which loss would you trust? If it is a real rare event?',
      },
      render: () => (
        <FormulaSteps
          given={['y = 3, 4, 5, 6, 30', 'fit one constant c', 'Huber δ = 1']}
          steps={[
            { math: <>MSE fit: mean = 48 / 5 = 9.6</>, note: 'without the outlier: 4.5' },
            { math: <>MAE fit: median = 5</>, note: 'the outlier is just “one point above”' },
            { math: <>at c = 5, MSE pulls 2e = 4, 2, 0, −2, −50</>, note: 'the outlier out-shouts all others' },
            { math: <>at c = 5, MAE / Huber pull 1, 1, 0, −1, −1</>, note: 'every point gets one vote' },
          ]}
          result={<>outlier = 79% of the MSE at its own fit</>}
        />
      ),
    },
    {
      id: 'loss-regression-lab',
      section: 'Regression',
      kicker: 'Live · drag the outlier',
      title: 'Drag the outlier: the mean follows, the median stays',
      lab: true,
      notes: {
        time: '4 min',
        say: 'Slide the outlier from 5 to 40. The blue MSE line chases it; the dashed MAE line does not move. Then raise Huber δ: at δ = 1 it behaves like MAE (5.0), at δ = 5 it starts to follow (5.75), and with a huge δ it becomes MSE.',
        ask: 'At what δ does Huber start to follow the outlier, and why does that depend on the data’s spread?',
      },
      render: () => <RegressionLossLab />,
    },

    /* ------------------------------------------------------------ Classification */
    {
      id: 'loss-bce-terms',
      section: 'Classification',
      kicker: 'BCE from a logit · term by term',
      title: 'BCE scores a probability built from a raw score a',
      notes: {
        time: '3 min',
        say: 'Networks output a raw score a, the logit. Sigmoid turns it into p. BCE then picks one of two log terms depending on y. Notation is the same as Day 1: p is D’s probability that the input is real, y is 1 for real and 0 for fake.',
        ask: 'Why do we need the minus sign in front?',
      },
      render: () => (
        <FormulaTerms
          reading="loss = minus [ y · log p + (1 − y) · log(1 − p) ], with p = sigmoid of the logit"
          cols={2}
          formula={<><span>L</span><Op>=</Op><span>−[</span><T tone="blue">y</T><span>log</span><T tone="coral">p</T><Op>+</Op><span>(1−</span><T tone="blue">y</T><span>) log(1−</span><T tone="coral">p</T><span>)]</span><Op>,</Op><T tone="coral">p</T><Op>=</Op><span>σ(</span><T tone="violet">a</T><span>)</span></>}
          terms={[
            { symbol: 'a', name: 'Logit', meaning: 'Raw score from the last Linear layer', range: '−∞ … ∞', tone: 'violet' },
            { symbol: 'σ(a)', name: 'Sigmoid', meaning: '1 / (1 + e⁻ᵃ) squashes the score', range: '0 … 1', tone: 'mint' },
            { symbol: 'p', name: 'Probability', meaning: 'Model’s belief that y = 1', range: '0 … 1', tone: 'coral' },
            { symbol: 'y', name: 'Label', meaning: 'Switches one log term on, the other off', range: '0 or 1', tone: 'blue' },
            { symbol: '−log', name: 'Surprise', meaning: 'Small when p agrees with y · huge when confidently wrong', range: '0 … ∞', tone: 'yellow' },
            { symbol: '∂L/∂a', name: 'Gradient', meaning: 'Simplifies to p − y · never saturates for wrong answers', range: '−1 … 1', tone: 'plain' },
          ]}
        />
      ),
    },
    {
      id: 'loss-stable-terms',
      section: 'Classification',
      kicker: 'BCEWithLogits · term by term',
      title: 'Combine sigmoid and log into one safe expression',
      notes: {
        time: '3 min',
        say: 'Substitute p = σ(a) into BCE and simplify: you get softplus(a) − y·a. Written as max(a, 0) − y·a + log(1 + e^(−|a|)), nothing ever exponentiates a large positive number, and log never sees an exact 0. That is what BCEWithLogitsLoss computes — so the model returns raw logits, with no Sigmoid layer.',
        ask: 'Why is a Sigmoid layer followed by BCEWithLogitsLoss a bug?',
      },
      render: () => (
        <FormulaTerms
          reading="loss = max(a, 0) − y·a + log(1 + e to the minus |a|)  — same value as BCE(σ(a), y)"
          symbolWidth="11.5rem"
          cols={2}
          formula={<><span>L</span><Op>=</Op><span>max(</span><T tone="violet">a</T><span>, 0)</span><Op>−</Op><T tone="blue">y</T><T tone="violet">a</T><Op>+</Op><span>log(1 + e<sup>−|a|</sup>)</span></>}
          terms={[
            { symbol: 'max(a,0) − ya', name: 'The large part', meaning: 'Linear in a — computed without any exponential', tone: 'violet' },
            { symbol: 'log(1+e⁻|ᵃ|)', name: 'The small correction', meaning: 'e⁻|ᵃ| ≤ 1, so it can never overflow', range: '0 … log 2', tone: 'mint' },
            { symbol: 'softplus', name: 'Same thing, named', meaning: 'log(1 + eᵃ) = max(a,0) + log(1 + e⁻|ᵃ|)', tone: 'blue' },
            { symbol: 'a, not σ(a)', name: 'API contract', meaning: 'nn.BCEWithLogitsLoss expects a, not σ(a)', tone: 'coral' },
          ]}
        />
      ),
    },
    {
      id: 'loss-stable-steps',
      section: 'Classification',
      kicker: 'Naive vs stable · worked',
      title: 'At a = 100 the naive path returns inf, the stable path 100',
      notes: {
        time: '3 min',
        say: 'A very confident wrong answer: logit 100, but the label is fake. In float32, sigmoid(100) rounds to exactly 1.0, so log(1 − p) = log 0 = −inf and the loss is inf — training dies with NaNs. The stable form never computes p: max(100, 0) − 0 + log(1 + e^−100) = 100. A large, finite, correct loss with gradient p − y ≈ 1.',
        ask: 'Which of the two answers is mathematically correct — and which one can the optimizer use?',
      },
      render: () => (
        <FormulaSteps
          given={['a = 100', 'y = 0 (fake)', 'float32']}
          steps={[
            { math: <>naive: p = σ(100) → 1.0 exactly</>, note: '1 − p rounds to 0' },
            { math: <>naive: −log(1 − p) = −log 0 = ∞</>, note: 'loss inf → gradients NaN' },
            { math: <>stable: max(100, 0) − 0 · 100</>, note: '= 100, no exponential of a' },
            { math: <>+ log(1 + e⁻¹⁰⁰) ≈ 3.7 × 10⁻⁴⁴</>, note: 'tiny correction, never overflows' },
          ]}
          result={<>BCEWithLogits = 100 · gradient p − y ≈ 1</>}
        />
      ),
    },
    {
      id: 'loss-classify-lab',
      section: 'Classification',
      kicker: 'Live · BCE vs MSE on a probability',
      title: 'Confident and wrong: BCE still pushes, MSE goes quiet',
      lab: true,
      notes: {
        time: '4 min',
        say: 'Start with y = 1 and a = −4: the model is confidently wrong. BCE’s gradient is p − y = −0.98, almost the maximum. MSE applied to the probability has gradient 2(p − y)·p(1 − p) = −0.035 — about 28× weaker — because the sigmoid’s slope multiplies it. At a = −6 the gap is about 200×. This is why classifiers (and Discriminators) use BCE.',
        ask: 'Where on the curve does MSE give its strongest push, and why there?',
      },
      render: () => <ClassificationLossLab />,
    },
    {
      id: 'loss-softmax-terms',
      section: 'Classification',
      kicker: 'Softmax cross-entropy · term by term',
      title: 'Softmax CE looks only at the true class — its gradient is p − y',
      notes: {
        time: '3 min',
        say: 'K classes, K logits. Softmax exponentiates and normalizes, so the outputs are positive and sum to 1. With a one-hot y, the sum keeps only the true class: the loss is −log p of the correct class. The gradient with respect to each logit is simply p − y — the same clean form as BCE. nn.CrossEntropyLoss takes raw logits and does softmax inside.',
        ask: 'What is the loss if the model is uniform over 10 classes?',
      },
      render: () => (
        <FormulaTerms
          reading="probabilities = e to each logit, normalized; loss = minus log of the true class’s probability"
          cols={2}
          formula={<><T tone="coral">pₖ</T><Op>=</Op><span className="frac"><span>e<sup><T tone="violet">zₖ</T></sup></span><span>Σⱼ e<sup><T tone="violet">zⱼ</T></sup></span></span><Op>·</Op><span>L</span><Op>=</Op><span>−Σₖ</span><T tone="blue">yₖ</T><span>log</span><T tone="coral">pₖ</T><Op>=</Op><span>−log p<sub>true</sub></span></>}
          terms={[
            { symbol: 'zₖ', name: 'Logits', meaning: 'One raw score per class', range: '−∞ … ∞', tone: 'violet' },
            { symbol: 'eᶻᵏ', name: 'Exponentiate', meaning: 'Makes every score positive, keeps the order', range: '> 0', tone: 'mint' },
            { symbol: 'Σ eᶻ', name: 'Normalize', meaning: 'Divide so the probabilities sum to 1', tone: 'blue' },
            { symbol: 'yₖ', name: 'One-hot target', meaning: '1 for the true class, 0 elsewhere', range: '0 or 1', tone: 'blue' },
            { symbol: '−log p', name: 'Loss', meaning: 'Only the true class’s probability matters', range: '0 … ∞', tone: 'coral' },
            { symbol: 'p − y', name: 'Gradient ∂L/∂zₖ', meaning: 'Lower the true logit’s deficit, push others down', range: '−1 … 1', tone: 'yellow' },
          ]}
        />
      ),
    },
    {
      id: 'loss-softmax-steps',
      section: 'Classification',
      kicker: 'Softmax CE · worked',
      title: 'Logits 2, 1, 0.1 with the true class first → loss 0.42',
      notes: {
        time: '3 min',
        say: 'Exponentiate: 7.389, 2.718, 1.105; sum 11.213. Divide: 0.659, 0.242, 0.099. True class is the first, so the loss is −log 0.659 = 0.42. Gradient p − y: the true logit gets −0.341 (raise it), the others get +0.242 and +0.099 (lower them). Same rule as BCE.',
        ask: 'If the first logit were 10 instead of 2, roughly what would the loss be?',
      },
      render: () => (
        <FormulaSteps
          given={['z = 2.0, 1.0, 0.1', 'true class = 1st', 'y = 1, 0, 0']}
          steps={[
            { math: <>eᶻ = 7.389, 2.718, 1.105</>, note: 'sum = 11.213' },
            { math: <>p = 0.659, 0.242, 0.099</>, note: 'divide by the sum · adds to 1' },
            { math: <>L = −log 0.659 = 0.417</>, note: 'only the true class counts' },
            { math: <>∂L/∂z = p − y = −0.341, 0.242, 0.099</>, note: 'raise the true logit, lower the rest' },
          ]}
          result={<>loss ≈ 0.42</>}
        />
      ),
    },

    /* ------------------------------------------------------------ Probability view */
    {
      id: 'loss-mle',
      section: 'Probability view',
      kicker: 'Losses as likelihood · term by term',
      title: 'MSE and BCE are both “minus log-likelihood” in disguise',
      notes: {
        time: '3 min',
        say: 'Assume the target is the prediction plus Gaussian noise. The negative log-likelihood of the data is a constant plus the squared error over 2σ² — minimizing it is minimizing MSE. Assume the label is a coin flip with probability p: the negative log-likelihood is exactly BCE. So the loss encodes an assumption about the noise.',
        ask: 'Which noise assumption would give you MAE instead?',
      },
      render: () => (
        <FormulaTerms
          reading="minus log of the probability the model assigns to the observed target"
          symbolWidth="10rem"
          formula={<><span>−log N(</span><T tone="blue">y</T><span>; </span><T tone="mint">ŷ</T><span>, σ²)</span><Op>=</Op><span>½log(2πσ²)</span><Op>+</Op><span className="frac"><span>(<T tone="blue">y</T> − <T tone="mint">ŷ</T>)²</span><span>2σ²</span></span></>}
          terms={[
            { symbol: 'N(ŷ, σ²)', name: 'Gaussian noise model', meaning: 'Target = prediction + bell-shaped noise', tone: 'blue' },
            { symbol: '½ log 2πσ²', name: 'Constant', meaning: 'No ŷ inside · ignored by the optimizer (0.919 for σ = 1)', tone: 'plain' },
            { symbol: '(y − ŷ)²', name: 'Squared error', meaning: 'The only part that depends on the model → MSE', tone: 'mint' },
            { symbol: 'Bernoulli', name: 'Bernoulli version', meaning: 'Coin-flip label → exactly BCE (−ln 0.8 = 0.223)', tone: 'coral' },
            { symbol: 'Laplace', name: 'Heavier tails', meaning: '−log-likelihood ∝ |y − ŷ| → MAE', tone: 'violet' },
          ]}
        />
      ),
    },
    {
      id: 'loss-kl-steps',
      section: 'Probability view',
      kicker: 'Entropy, cross-entropy, KL · worked',
      title: 'Cross-entropy = the data’s own entropy + the KL gap',
      notes: {
        time: '3 min',
        say: 'True distribution P = 0.7, 0.2, 0.1; model Q = 0.5, 0.3, 0.2. Entropy H(P) = 0.802 nats — the floor no model can beat. Cross-entropy H(P, Q) = 0.887. The difference, KL(P‖Q) = 0.085, is the part the model can still remove. Minimizing cross-entropy = minimizing KL, because H(P) is fixed. KL is not symmetric — that matters for GANs (Day 2).',
        ask: 'What is KL(P‖P)? Can KL ever be negative?',
      },
      render: () => (
        <FormulaSteps
          formula={<><span>H(P, Q)</span><Op>=</Op><span>H(P)</span><Op>+</Op><span>KL(P ‖ Q)</span></>}
          given={['P = 0.7, 0.2, 0.1 (true)', 'Q = 0.5, 0.3, 0.2 (model)', 'natural log']}
          steps={[
            { math: <>H(P) = −Σ P log P = 0.802</>, note: 'irreducible: the data’s own uncertainty' },
            { math: <>H(P, Q) = −Σ P log Q = 0.887</>, note: 'what cross-entropy loss measures' },
            { math: <>KL = Σ P log(P/Q) = 0.085</>, note: 'the gap the model can still close' },
          ]}
          result={<>0.887 = 0.802 + 0.085</>}
        />
      ),
    },
    {
      id: 'loss-smooth-focal',
      section: 'Probability view',
      kicker: 'Reshaping the target or the weights',
      title: 'Label smoothing stops overconfidence; focal loss ignores easy examples',
      notes: {
        time: '3 min',
        say: 'Label smoothing replaces the target 1 with 0.9: the loss is now minimized at p = 0.9, and pushing to 0.99 costs more (0.47 vs 0.33). In GANs we smooth only the real labels (one-sided, Salimans 2016). Focal loss multiplies CE by (1 − pₜ)^γ: with γ = 2, an easy example at pₜ = 0.9 keeps 1% of its loss, a hard one at 0.1 keeps 81%.',
        ask: 'Why would two-sided smoothing (fake target 0.1) be risky for a Discriminator?',
      },
      render: () => (
        <>
          <Table
            headers={['Idea', 'Formula', 'Numbers', 'Effect']}
            rows={[
              ['Label smoothing', '−[0.9 log p + 0.1 log(1 − p)]', 'p = 0.9 → 0.325 · p = 0.99 → 0.470', 'minimum at p = 0.9 · no reward for certainty'],
              ['Plain BCE (y = 1)', '−log p', 'p = 0.9 → 0.105 · p = 0.99 → 0.010', 'keeps rewarding p → 1'],
              ['Focal loss (γ = 2)', '−(1 − pₜ)² log pₜ', 'factor 0.01 · 0.25 · 0.81 at pₜ = 0.9 · 0.5 · 0.1', 'easy examples fade, hard ones dominate'],
            ]}
            highlight={[0]}
          />
          <Takeaway tone="mint">GANs smooth only the <b>real</b> label (0.9) — one-sided, so fakes stay clearly fake.</Takeaway>
        </>
      ),
    },

    /* ------------------------------------------------------------ GAN losses */
    {
      id: 'loss-gan-predict',
      section: 'GAN losses',
      kicker: 'Predict',
      title: 'D rejects a fake with D(fake) = 0.01 — which G loss still teaches?',
      reveal: true,
      notes: {
        time: '2 min',
        say: 'Let learners commit before revealing. The trap is to think the log term must vanish. It depends on which form G uses and on what we differentiate against — the fake logit a.',
        ask: 'Which form would you pick for the first epochs of training?',
      },
      render: ({ revealed }) => (
        <Predict
          revealed={revealed}
          question="Gradient on the fake logit a when D(fake) = σ(a) = 0.01?"
          facts={['Minimax G: minimize log(1 − σ(a))', 'Non-saturating G: minimize −log σ(a)', 'LSGAN G: minimize (D(G(z)) − 1)² · raw score']}
          answer={<Answer verdict="Non-saturating: −0.99" points={[<>Minimax: −σ(a) = <b>−0.01</b> — almost silent</>, <>Non-saturating: σ(a) − 1 = <b>−0.99</b> — full push</>, <>LSGAN on a raw score of 0.01: 2(0.01 − 1) = <b>−1.98</b></>]} />}
        />
      ),
    },
    {
      id: 'loss-gan-family',
      section: 'GAN losses',
      kicker: 'The GAN loss family',
      title: 'Every GAN loss is a different answer to “how should D score?”',
      notes: {
        time: '4 min',
        say: 'Read the rows top to bottom as history. Minimax is the 2014 game; non-saturating fixes G’s early gradient. LSGAN replaces log with squared distance to targets. Hinge (used with spectral norm and in BigGAN/SAGAN) stops rewarding D once a sample is beyond the margin. WGAN drops probabilities entirely — the critic’s score difference estimates the Wasserstein distance, which Day 2 builds.',
        ask: 'Which losses use a Sigmoid on D’s output, and which use a raw score?',
      },
      render: () => (
        <Table
          compact
          headers={['Loss', 'D minimizes', 'G minimizes', 'D output', 'G’s push when D is confident']}
          rows={[
            ['Minimax (2014)', '−log D(x) − log(1 − D(G(z)))', 'log(1 − D(G(z)))', 'probability', 'vanishes (−σ(a) → 0)'],
            ['Non-saturating', 'same as minimax', '−log D(G(z))', 'probability', 'strong (σ(a) − 1 → −1)'],
            ['LSGAN', '(D(x) − 1)² + D(G(z))²', '(D(G(z)) − 1)²', 'raw score', 'grows with distance to 1'],
            ['Hinge', 'max(0, 1 − D(x)) + max(0, 1 + D(G(z)))', '−D(G(z))', 'raw score', 'constant −1'],
            ['WGAN (Day 2)', 'C(G(z)) − C(x)', '−C(G(z))', 'raw score, 1-Lipschitz', 'constant · tracks a distance'],
          ]}
          highlight={[1]}
        />
      ),
    },
    {
      id: 'loss-hinge-steps',
      section: 'GAN losses',
      kicker: 'Hinge loss · worked',
      title: 'Hinge stops rewarding D once a sample is past the margin',
      notes: {
        time: '3 min',
        say: 'D outputs raw scores; the margin is 1. Case 1: a real scored 0.5 is inside the margin, cost 0.5; a fake scored −2 is already past −1, cost 0 — D gets no reward for being even more certain. Case 2: real scored 2 costs 0, fake scored +0.5 costs 1.5. D only learns from samples near or on the wrong side of the margin.',
        ask: 'Why might “no reward beyond the margin” keep D from becoming too strong?',
      },
      render: () => (
        <FormulaSteps
          formula={<><span>L</span><sub>D</sub><Op>=</Op><span>max(0, 1 −</span><T tone="blue">D(x)</T><span>)</span><Op>+</Op><span>max(0, 1 +</span><T tone="coral">D(G(z))</T><span>)</span></>}
          given={['case 1: D(x) = 0.5, D(G(z)) = −2', 'case 2: D(x) = 2, D(G(z)) = 0.5']}
          steps={[
            { math: <>case 1: max(0, 0.5) + max(0, −1)</>, note: 'real inside margin · fake already past it' },
            { math: <>= 0.5 + 0 = 0.5</>, note: 'no credit for a more extreme fake score' },
            { math: <>case 2: max(0, −1) + max(0, 1.5)</>, note: 'real safely past · fake on the wrong side' },
          ]}
          result={<>case 1 → 0.5 · case 2 → 1.5</>}
        />
      ),
    },

    /* ------------------------------------------------------------ Check */
    {
      id: 'loss-check',
      section: 'Check',
      kicker: 'Knowledge check',
      title: 'Can you pick the loss — and predict its gradient?',
      reveal: true,
      notes: {
        time: '4 min',
        say: 'Ask for the reasoning before revealing each answer; most of these are about gradients, not values.',
        ask: 'Which answer surprised you most?',
      },
      render: ({ revealed }) => (
        <Quiz revealed={revealed} items={[
          { q: 'Data 3, 4, 5, 6, 30 — best constant under MSE vs MAE?', a: 'MSE: the mean 9.6 · MAE: the median 5.' },
          { q: 'Why not train a classifier on accuracy?', a: 'It is a step function — gradient 0 almost everywhere.' },
          { q: 'Model has nn.Sigmoid() and you use BCEWithLogitsLoss. What breaks?', a: 'Double sigmoid: outputs squeezed into (0.5, 0.731) — wrong loss and gradients.' },
          { q: 'Gradient of softmax CE w.r.t. the logits?', a: 'p − y (one-hot y).' },
          { q: 'MSE corresponds to which noise assumption?', a: 'Gaussian noise — MSE is its negative log-likelihood up to constants.' },
          { q: 'D(fake) = 0.01: minimax vs non-saturating gradient on the fake logit?', a: '−0.01 vs −0.99.' },
        ]} />
      ),
    },
    {
      id: 'loss-bridge',
      section: 'Check',
      kicker: 'Next part',
      title: 'A good loss still needs well-behaved networks to train',
      layout: 'bridge',
      notes: {
        time: '1 min',
        say: 'The loss decides the direction. Whether the gradient survives the trip through many layers depends on initialization, normalization and regularization — the training toolkit.',
        ask: 'What could make a perfect loss produce useless gradients deep in the network?',
      },
      render: () => <Bridge done="Loss functions · complete" question="Right loss, wrong network: what keeps gradients alive through 20 layers?" next="ADV · Training toolkit" />,
    },
  ],
};
