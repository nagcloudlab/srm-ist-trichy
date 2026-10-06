import './adv.css';
import { Bridge, Cards, Divider, Flow, FormulaSteps, FormulaTerms, Predict, Answer, Quiz, Steps, T, Table, Takeaway } from '../components/kit';
import { Plot } from '../components/art';
import { InitLab, NormLab } from '../labs/DeepAdvLabs';
import type { Part } from '../types';

const BLUE = '#3157d5', CORAL = '#eb5a46';
const op = (s: string) => <span className="op">{s}</span>;

/* illustrative curves: training keeps falling, validation turns up after ≈ epoch 11 */
const train = (x: number) => 2 * Math.exp(-x / 6) + 0.1;
const val = (x: number) => train(x) + 0.0025 * x * x;

export const advPart: Part = {
  id: 'adv',
  code: 'ADV',
  label: 'Training toolkit',
  title: 'Initialization, normalization and regularization keep deep training on the rails',
  when: '',
  minutes: 0,
  slides: [
    /* ---------------- Backprop graph ---------------- */
    {
      id: 'adv-divider',
      section: 'Backprop graph',
      kicker: 'Part ADV',
      title: 'Training toolkit',
      layout: 'divider',
      notes: {
        time: '1 min',
        say: 'Gradient descent, optimizers, activations and losses tell a network where to go. This part is about keeping the signal healthy on the way: how gradients travel, how weights start, how activations are kept in range, and how we stop memorising.',
        ask: 'Which of these have you already met in the GAN labs — BatchNorm, dropout, weight init, spectral norm?',
      },
      render: () => (
        <Divider
          code="ADV"
          title="Training toolkit"
          promise="Initialization, normalization and regularization keep deep training on the rails — and each one shows up in a GAN."
          items={['Backprop as a graph', 'Initialization', 'Normalization', 'Regularization', 'Residuals & debugging']}
        />
      ),
    },
    {
      id: 'adv-graph',
      section: 'Backprop graph',
      kicker: 'Computational graph',
      title: 'Backprop walks the forward graph in reverse, one local derivative per node',
      notes: {
        time: '3 min',
        say: 'Every forward pass builds a graph: each node stores its inputs. Backward starts from one number, the loss, and each node multiplies the incoming gradient by its own local derivative. That is all autograd does. Because there is one output and millions of inputs, reverse mode is the cheap direction.',
        ask: 'Why does the forward pass have to keep its intermediate values in memory?',
      },
      render: () => (
        <>
          <Flow size="sm" nodes={[
            { label: 'input', value: 'x', tone: 'blue' }, { op: '→ W →' },
            { label: 'pre-act', value: 'z', tone: 'violet' }, { op: '→ ReLU →' },
            { label: 'hidden', value: 'h', tone: 'mint' }, { op: '→ V →' },
            { label: 'output', value: 'ŷ', tone: 'mint' }, { op: '→' },
            { label: 'scalar', value: 'L', tone: 'coral' },
          ]} caption="forward: store x, z, h, ŷ · backward: ∂L/∂ŷ → ∂L/∂h → ∂L/∂z → ∂L/∂x" />
          <Cards cols={3} items={[
            { tag: 'Forward', title: 'Compute and remember', body: 'Each node saves what it needs for its local derivative.', tone: 'blue' },
            { tag: 'Backward', title: 'Multiply by local Jacobians', body: 'Upstream gradient × local derivative, node by node.', tone: 'violet' },
            { tag: 'Reverse mode', title: 'One loss → one sweep', body: 'All parameter gradients for ≈ 2–3× the cost of one forward pass.', tone: 'mint' },
          ]} />
        </>
      ),
    },
    {
      id: 'adv-vjp-terms',
      section: 'Backprop graph',
      kicker: 'Formula · term by term',
      title: 'Through a linear layer, the gradient flows back through Wᵀ',
      notes: {
        time: '2 min',
        say: 'For y = Wx the Jacobian ∂y/∂x is simply W. The chain rule in vector form multiplies the upstream gradient by that Jacobian — transposed, because the gradient is a row of sensitivities. PyTorch never builds the full Jacobian; it computes this vector–Jacobian product directly.',
        ask: 'If W is 256 × 512, what shape is ∂L/∂x?',
      },
      render: () => (
        <FormulaTerms cols={2}
          reading="the gradient at the input = W-transpose times the gradient at the output"
          formula={<><T tone="blue">∂L/∂x</T>{op('=')}<T tone="violet">Wᵀ</T>{op('·')}<T tone="coral">∂L/∂y</T>{op('for')}<span>y = Wx</span></>}
          symbolWidth="7rem"
          terms={[
            { symbol: '∂L/∂y', name: 'Upstream gradient', meaning: 'How much the loss changes with each output of this layer', range: 'size of y', tone: 'coral' },
            { symbol: 'W', name: 'Jacobian of y = Wx', meaning: 'Row i = how output i depends on every input', range: 'out × in', tone: 'violet' },
            { symbol: 'Wᵀ', name: 'Transpose', meaning: 'Sends each output’s blame back to the inputs that fed it', range: 'in × out', tone: 'violet' },
            { symbol: '∂L/∂x', name: 'Downstream gradient', meaning: 'Passed to the previous layer — the next step of backprop', range: 'size of x', tone: 'blue' },
          ]}
        />
      ),
    },
    {
      id: 'adv-vjp-steps',
      section: 'Backprop graph',
      kicker: 'Formula · worked',
      title: 'Two outputs pull in opposite directions — the input gradient is −2, −2',
      notes: {
        time: '2 min',
        say: 'A 2 × 2 layer. Output 1 should rise (gradient +1), output 2 should fall (gradient −1). Each input collects blame from both outputs through its column of W.',
        ask: 'Which input receives more blame from output 2, and why?',
      },
      render: () => (
        <FormulaSteps
          formula={<><T tone="blue">∂L/∂x</T>{op('=')}<T tone="violet">Wᵀ</T>{op('·')}<T tone="coral">∂L/∂y</T></>}
          given={['W = [[1, 2], [3, 4]]', '∂L/∂y = [1, −1]', 'Wᵀ = [[1, 3], [2, 4]]']}
          steps={[
            { math: <>x₁: 1·1 + 3·(−1)</>, note: 'column 1 of W: weights from x₁' },
            { math: <>= 1 − 3 = −2</>, note: 'output 2 dominates' },
            { math: <>x₂: 2·1 + 4·(−1)</>, note: 'column 2 of W: weights from x₂' },
            { math: <>= 2 − 4 = −2</>, note: 'same total by coincidence' },
          ]}
          result={<>∂L/∂x = [−2, −2]</>}
        />
      ),
    },

    /* ---------------- Initialization ---------------- */
    {
      id: 'adv-init-predict',
      section: 'Initialization',
      kicker: 'Predict',
      title: 'Ten ReLU layers can turn a sensible input into astronomical numbers',
      reveal: true,
      notes: {
        time: '2 min',
        say: 'Let learners guess before revealing. Each layer multiplies the signal’s variance by n·Var(w)/2. With n = 256 and Var(w) = 1 that is 128 per layer — ten layers later the scale is absurd. With std 0.01 it shrinks to nothing instead.',
        ask: 'Is the problem the depth, the width, or the weight scale?',
      },
      render: ({ revealed }) => (
        <Predict
          revealed={revealed}
          question="What is the activation variance after 10 layers?"
          facts={['Weights ~ N(0, 1)', '256 inputs per neuron · ReLU', 'Input variance = 1']}
          answer={<Answer verdict="≈ 1.2 × 10²¹" points={[<>Each layer multiplies variance by <b>256 × 1 ÷ 2 = 128</b></>, <>128¹⁰ ≈ 1.2 × 10²¹ — std ≈ 3.4 × 10¹⁰</>, <>With std 0.01: × 0.0128 per layer → <b>1.2 × 10⁻¹⁹</b></>]} />}
        />
      ),
    },
    {
      id: 'adv-variance-terms',
      section: 'Initialization',
      kicker: 'Formula · term by term',
      title: 'A layer multiplies variance by fan-in × weight variance',
      notes: {
        time: '2 min',
        say: 'One neuron adds n products w·x. If weights and inputs are independent with zero-mean weights, variances add: n copies of Var(w)·Var(x). Keep that product at 1 and the signal neither grows nor shrinks — that is the whole idea behind every initialization rule.',
        ask: 'What value of Var(w) keeps Var(y) = Var(x) for a linear layer with n = 100?',
      },
      render: () => (
        <FormulaTerms
          reading="output variance = fan-in × weight variance × input variance"
          formula={<><span>Var(</span><T tone="mint">y</T><span>)</span>{op('=')}<T tone="blue">n</T>{op('·')}<span>Var(</span><T tone="violet">w</T><span>)</span>{op('·')}<span>Var(</span><T tone="blue">x</T><span>)</span></>}
          terms={[
            { symbol: 'n', name: 'Fan-in', meaning: 'Number of inputs summed by one neuron', range: 'e.g. 256', tone: 'blue' },
            { symbol: 'Var(w)', name: 'Weight variance', meaning: 'Chosen at initialization — the knob we control', range: '> 0', tone: 'violet' },
            { symbol: 'Var(x)', name: 'Input variance', meaning: 'For ReLU inputs, use the second moment E[x²]', range: '≈ 1', tone: 'blue' },
            { symbol: 'Var(y)', name: 'Output variance', meaning: 'Want ≈ Var(x): the signal keeps its size layer after layer', range: 'target 1×', tone: 'mint' },
          ]}
          symbolWidth="6rem"
        />
      ),
    },
    {
      id: 'adv-he-steps',
      section: 'Initialization',
      kicker: 'Formula · worked',
      title: 'ReLU drops half the signal, so He init doubles the weight variance',
      notes: {
        time: '3 min',
        say: 'ReLU zeros the negative half of a symmetric input, so it keeps half of the second moment: E[ReLU(z)²] = Var(z)/2. To keep the scale, n·Var(w)/2 must equal 1, so Var(w) = 2/n. Xavier, designed for tanh, averages fan-in and fan-out and has no factor 2 — under ReLU it shrinks the signal by √2 per layer.',
        ask: 'For LeakyReLU with slope 0.2, should the factor be bigger or smaller than 2?',
      },
      render: () => (
        <FormulaSteps
          formula={<><span>Var(</span><T tone="violet">w</T><span>)</span>{op('=')}<span className="frac"><span>2</span><span><T tone="blue">n</T></span></span>{op('(He)')}</>}
          given={['n = 256', 'ReLU keeps ½ of E[z²]', 'Xavier: n_in = n_out = 256']}
          steps={[
            { math: <>n · Var(w) · ½ = 1</>, note: 'keep the scale after ReLU' },
            { math: <>Var(w) = 2 / 256 = 0.0078</>, note: 'He / Kaiming' },
            { math: <>std = √0.0078 = 0.088</>, note: 'what you pass to normal_()' },
            { math: <>Xavier: 2 / 512 = 0.0039 → std 0.0625</>, note: 'half He’s variance' },
          ]}
          result={<>He std 0.088 · Xavier std 0.0625</>}
        />
      ),
    },
    {
      id: 'adv-init-lab',
      section: 'Initialization',
      kicker: 'Live · watch the signal',
      title: 'Only the right scale keeps the signal alive through twenty layers',
      lab: true,
      notes: {
        time: '4 min',
        say: 'Start with std 1 and slide depth to 20: the scale explodes. Switch to std 0.01: it vanishes. Xavier drifts down slowly under ReLU. He stays on the line at 1. This is a real simulation of a width-64 ReLU network with random weights.',
        ask: 'Why does Xavier lose about 30% of the scale per layer here?',
      },
      render: () => <InitLab />,
    },
    {
      id: 'adv-init-table',
      section: 'Initialization',
      kicker: 'Which init, where',
      title: 'Match the init rule to the activation that follows',
      notes: {
        time: '2 min',
        say: 'Xavier for tanh and sigmoid, He for the ReLU family. PyTorch’s Linear default is a uniform rule with variance 1/(3n) — smaller than both. DCGAN overrides everything with N(0, 0.02), which works because BatchNorm rescales the activations anyway.',
        ask: 'Why can DCGAN get away with a fixed std of 0.02?',
      },
      render: () => (
        <Table
          headers={['Rule', 'Var(w)', 'n = 256', 'Use with']}
          rows={[
            ['Xavier / Glorot (2010)', '2 / (n_in + n_out)', '0.0039', 'tanh, sigmoid'],
            ['He / Kaiming (2015)', '2 / n_in', '0.0078', 'ReLU · LeakyReLU: 2 / ((1 + a²) n)'],
            ['PyTorch nn.Linear default', 'U(±1/√n) → 1 / (3n)', '0.0013', 'a safe-small starting point'],
            ['DCGAN (Radford 2015)', 'N(0, 0.02²) = 0.0004', '0.0004', 'all layers — BatchNorm fixes the scale'],
          ]}
          highlight={[1]}
        />
      ),
    },

    /* ---------------- Normalization ---------------- */
    {
      id: 'adv-bn-modes',
      section: 'Normalization',
      kicker: 'BatchNorm · train vs eval',
      title: 'BatchNorm trains on batch statistics but predicts with running averages',
      notes: {
        time: '3 min',
        say: 'In training, BatchNorm normalizes with the current batch’s mean and variance and updates a running average with momentum 0.1. In eval it uses only the running average. A few batches in, the running mean is still far from the truth — and forgetting model.eval() means every prediction depends on what else is in the batch.',
        ask: 'Why is BatchNorm risky with a batch size of 2?',
      },
      render: () => (
        <>
          <FormulaSteps
            formula={<><T tone="violet">μ_run</T>{op('←')}<span>0.9 ·</span><T tone="violet">μ_run</T>{op('+')}<span>0.1 ·</span><T tone="blue">μ_batch</T></>}
            given={['μ_run starts at 0', 'every batch mean = 5', 'momentum = 0.1']}
            steps={[
              { math: <>0.9 · 0 + 0.1 · 5 = 0.5</>, note: 'after batch 1' },
              { math: <>0.9 · 0.5 + 0.5 = 0.95</>, note: 'after batch 2' },
              { math: <>0.9 · 0.95 + 0.5 = 1.355</>, note: 'after batch 3' },
            ]}
            result={<>μ_run = 1.355 — still far from 5</>}
          />
          <Takeaway>Train: <b>batch</b> statistics. Eval: <b>running</b> statistics — always call <b>model.eval()</b> before sampling.</Takeaway>
        </>
      ),
    },
    {
      id: 'adv-norm-family',
      section: 'Normalization',
      kicker: 'Four ways to normalize',
      title: 'The norms differ only in which axes share one mean and variance',
      notes: {
        time: '3 min',
        say: 'Same formula — subtract the mean, divide by the standard deviation, scale and shift — but over different axes. BatchNorm averages across the batch, so samples influence each other. The other three work on one sample at a time. Spectral norm is different: it normalizes the weights, not the activations.',
        ask: 'Which of these lets two images in the same batch affect each other’s outputs?',
      },
      render: () => (
        <Table
          compact
          headers={['Norm', 'Statistics over (N, C, H, W)', 'Batch-dependent', 'Where in GANs']}
          rows={[
            ['BatchNorm', 'N, H, W — one per channel', 'yes', 'DCGAN G and D (not G output / D input)'],
            ['LayerNorm', 'C, H, W — one per sample', 'no', 'WGAN-GP critic (recommended), transformers'],
            ['InstanceNorm', 'H, W — one per sample and channel', 'no', 'Style transfer, CycleGAN'],
            ['GroupNorm', 'channel groups, H, W — per sample', 'no', 'Small batches'],
            ['Spectral norm', 'the weights: W / σ(W)', 'no', 'SN-GAN discriminator, BigGAN'],
          ]}
          highlight={[1]}
        />
      ),
    },
    {
      id: 'adv-norm-lab',
      section: 'Normalization',
      kicker: 'Live · see the axes',
      title: 'Click a block to see which values are normalized together',
      lab: true,
      notes: {
        time: '4 min',
        say: 'Each block is one channel of one sample, four pixels each. BatchNorm: the anchor’s channel lights up in every sample — the batch is coupled. LayerNorm: the whole sample. InstanceNorm: just one block. GroupNorm: half the channels of one sample.',
        ask: 'Why does a per-sample gradient penalty (WGAN-GP) break when samples share statistics?',
      },
      render: () => <NormLab />,
    },
    {
      id: 'adv-spectral-terms',
      section: 'Normalization',
      kicker: 'Formula · term by term',
      title: 'Spectral norm caps how much a layer can stretch any input',
      notes: {
        time: '3 min',
        say: 'σ(W) is the largest stretch factor of the layer: the most any input direction can grow. Dividing by it makes the layer 1-Lipschitz. Stack such layers with ReLU or LeakyReLU — which are themselves 1-Lipschitz — and the whole discriminator has bounded slopes. That is the same goal as WGAN’s Lipschitz constraint, achieved by construction.',
        ask: 'How is this different from WGAN’s weight clipping?',
      },
      render: () => (
        <FormulaTerms cols={2}
          reading="normalized weights = weights divided by their largest singular value"
          formula={<><T tone="mint">W_SN</T>{op('=')}<span className="frac"><span><T tone="violet">W</T></span><span><T tone="coral">σ(W)</T></span></span>{op(',')}<T tone="coral">σ(W)</T>{op('=')}<span>max ‖Wv‖ / ‖v‖</span></>}
          symbolWidth="6rem"
          terms={[
            { symbol: 'W', name: 'Raw weight matrix', meaning: 'What the optimizer actually updates', range: 'out × in', tone: 'violet' },
            { symbol: 'σ(W)', name: 'Largest singular value', meaning: 'The biggest factor by which W stretches any vector', range: '≥ 0', tone: 'coral' },
            { symbol: 'W_SN', name: 'Normalized weights', meaning: 'Used in the forward pass — its largest stretch is exactly 1', range: 'σ = 1', tone: 'mint' },
            { symbol: 'v', name: 'Power iteration vector', meaning: 'Kept between steps; one cheap iteration per training step', range: 'unit length', tone: 'blue' },
          ]}
        />
      ),
    },
    {
      id: 'adv-spectral-steps',
      section: 'Normalization',
      kicker: 'Formula · worked',
      title: 'Three power-iteration steps find the stretch factor 3',
      notes: {
        time: '2 min',
        say: 'Start from any vector, multiply by W and Wᵀ, normalize, repeat. The estimate climbs 2.86, 3.00, 3.00. Dividing W by 3 gives a layer that never stretches anything by more than 1. In training, PyTorch’s spectral_norm does one such step per iteration and keeps the vector.',
        ask: 'Why is one iteration per training step enough?',
      },
      render: () => (
        <FormulaSteps
          given={['W = [[2, 1], [1, 2]]', 'start v = [1, 0]', 'true σ(W) = 3']}
          steps={[
            { math: <>u = Wv / ‖Wv‖ = [0.894, 0.447]</>, note: 'push forward, normalize' },
            { math: <>σ ≈ ‖Wᵀu‖ = 2.864</>, note: 'iteration 1' },
            { math: <>σ ≈ 2.998</>, note: 'iteration 2' },
            { math: <>σ ≈ 3.000</>, note: 'iteration 3 — converged' },
          ]}
          result={<>W_SN = W / 3 → largest stretch = 1</>}
        />
      ),
    },

    /* ---------------- Regularization ---------------- */
    {
      id: 'adv-overfit',
      section: 'Regularization',
      kicker: 'Overfitting',
      title: 'When validation loss turns up, the model has started memorizing',
      notes: {
        time: '3 min',
        say: 'Training loss keeps falling; validation loss falls, then rises. The gap is variance — memorized detail that does not generalize. Early stopping takes the checkpoint at the bottom of the validation curve. The curves are illustrative. For GANs the same idea appears as a discriminator that memorizes a small dataset — the reason for ADA and DiffAugment.',
        ask: 'What does a D that memorizes the training images do to G’s learning signal?',
      },
      render: () => (
        <>
          <Plot
            ariaLabel="Illustrative training and validation loss curves with an early-stopping point near epoch 11"
            x={[0, 30]} y={[0, 2.4]} xTicks={[0, 5, 10, 15, 20, 25, 30]} yTicks={[0, 0.5, 1, 1.5, 2]}
            xLabel="epoch (illustrative)" yLabel="loss" height={250}
            marks={[{ x: 11, label: 'early stop' }]}
            lines={[{ f: train, color: BLUE, label: 'train' }, { f: val, color: CORAL, label: 'validation' }]}
          />
          <Cards cols={4} items={[
            { tag: 'Data', title: 'Augmentation', body: 'Flips, crops, colour — ADA / DiffAugment for small-data GANs.', tone: 'blue' },
            { tag: 'Weights', title: 'L2 / weight decay', body: 'Pulls every weight toward 0 each step.', tone: 'violet' },
            { tag: 'Units', title: 'Dropout', body: 'Randomly silences units during training.', tone: 'mint' },
            { tag: 'Time', title: 'Early stopping', body: 'Keep the best validation checkpoint.', tone: 'coral' },
          ]} />
        </>
      ),
    },
    {
      id: 'adv-decay-steps',
      section: 'Regularization',
      kicker: 'Formula · worked',
      title: 'Weight decay shrinks every weight a little before each gradient step',
      notes: {
        time: '2 min',
        say: 'Adding λ/2·‖w‖² to the loss adds λw to the gradient. Rearranged, each step first multiplies the weight by (1 − lr·λ) — here 0.999 — then takes the normal step. With Adam the two are not equivalent, which is why AdamW decouples them (see the optimizers part).',
        ask: 'What happens to a weight whose loss gradient is exactly 0?',
      },
      render: () => (
        <FormulaSteps
          formula={<><T tone="violet">w</T>{op('←')}<T tone="violet">w</T>{op('−')}<T tone="blue">lr</T><span>· (</span><T tone="coral">∂L/∂w</T>{op('+')}<T tone="mint">λ</T><T tone="violet">w</T><span>)</span></>}
          given={['w = 2', '∂L/∂w = 0.5', 'lr = 0.1 · λ = 0.01']}
          steps={[
            { math: <>λw = 0.01 · 2 = 0.02</>, note: 'the decay pull' },
            { math: <>0.5 + 0.02 = 0.52</>, note: 'total gradient' },
            { math: <>0.1 · 0.52 = 0.052</>, note: 'step size' },
            { math: <>same as 0.999 · 2 − 0.05</>, note: 'shrink, then step' },
          ]}
          result={<>w = 2 − 0.052 = 1.948</>}
        />
      ),
    },
    {
      id: 'adv-dropout-steps',
      section: 'Regularization',
      kicker: 'Formula · worked',
      title: 'Inverted dropout scales survivors so the expected activation never changes',
      notes: {
        time: '3 min',
        say: 'During training each unit is kept with probability 1 − p and the survivors are multiplied by 1/(1 − p). On average the activation is unchanged, so at evaluation time we simply switch dropout off — no rescaling needed. That switch is what model.eval() does for dropout.',
        ask: 'With p = 0.2, what are the survivors multiplied by?',
      },
      render: () => (
        <FormulaSteps
          formula={<><T tone="mint">h̃</T>{op('=')}<span className="frac"><span><T tone="blue">m</T><span> ⊙ </span><T tone="violet">h</T></span><span>1 − <T tone="coral">p</T></span></span>{op(',')}<T tone="blue">m</T><span> ~ Bernoulli(1 − </span><T tone="coral">p</T><span>)</span></>}
          given={['p = 0.5', 'h = [1.0, 0.4, 2.0, 0.6]', 'mask m = [1, 0, 1, 0]']}
          steps={[
            { math: <>1 / (1 − 0.5) = 2</>, note: 'survivor scale' },
            { math: <>m ⊙ h = [1.0, 0, 2.0, 0]</>, note: 'drop two units' },
            { math: <>× 2 = [2.0, 0, 4.0, 0]</>, note: 'training output' },
            { math: <>E[h̃ᵢ] = (1 − p) · hᵢ / (1 − p) = hᵢ</>, note: 'expectation preserved' },
          ]}
          result={<>eval: h unchanged — [1.0, 0.4, 2.0, 0.6]</>}
        />
      ),
    },

    /* ---------------- Residuals & debugging ---------------- */
    {
      id: 'adv-residual-terms',
      section: 'Residuals & debugging',
      kicker: 'Formula · term by term',
      title: 'A skip connection adds an identity path the gradient can always take',
      notes: {
        time: '2 min',
        say: 'A residual block outputs its input plus a correction. Its derivative is 1 plus the correction’s derivative — so even if F learns nothing useful yet, the gradient passes straight through. That is why ResNets, U-Nets (Pix2Pix) and StyleGAN-era generators can be very deep.',
        ask: 'What does the block compute if F(x) = 0?',
      },
      render: () => (
        <FormulaTerms
          reading="output = input + learned correction · derivative = 1 + correction’s derivative"
          formula={<><T tone="mint">y</T>{op('=')}<T tone="blue">x</T>{op('+')}<T tone="violet">F(x)</T><span className="op">⇒</span><span>∂</span><T tone="mint">y</T><span>/∂</span><T tone="blue">x</T>{op('=')}<span>1</span>{op('+')}<T tone="violet">F′(x)</T></>}
          symbolWidth="6rem"
          terms={[
            { symbol: 'x', name: 'Block input', meaning: 'Copied unchanged around the block (the skip)', range: 'any', tone: 'blue' },
            { symbol: 'F(x)', name: 'Residual branch', meaning: 'Conv / Linear layers that learn only the correction', range: 'starts ≈ 0', tone: 'violet' },
            { symbol: '1', name: 'Identity path', meaning: 'The gradient highway — never vanishes', range: 'I for vectors', tone: 'mint' },
            { symbol: 'F′(x)', name: 'Branch derivative', meaning: 'Adds to, rather than multiplies, the highway', range: 'small', tone: 'violet' },
          ]}
        />
      ),
    },
    {
      id: 'adv-residual-steps',
      section: 'Residuals & debugging',
      kicker: 'Formula · worked',
      title: 'Ten weak layers erase the gradient — ten residual blocks keep it',
      notes: {
        time: '2 min',
        say: 'Suppose each layer’s local derivative is only 0.1. Chained plainly, ten layers multiply to 10⁻¹⁰ — the first layer learns nothing. With skips each factor becomes 1.1 and the product stays order one.',
        ask: 'Why does the residual product not explode in practice when F′ fluctuates around 0?',
      },
      render: () => (
        <FormulaSteps
          given={['10 layers', 'each local derivative F′ = 0.1']}
          steps={[
            { math: <>plain: 0.1¹⁰</>, note: 'multiply the local derivatives' },
            { math: <>= 1 × 10⁻¹⁰</>, note: 'vanished' },
            { math: <>residual: (1 + 0.1)¹⁰</>, note: 'each block contributes 1 + F′' },
            { math: <>= 2.59</>, note: 'still order one' },
          ]}
          result={<>gradient reaches layer 1: 10⁻¹⁰ → 2.59</>}
        />
      ),
    },
    {
      id: 'adv-checklist',
      section: 'Residuals & debugging',
      kicker: 'Debugging checklist',
      title: 'Five checks catch most training bugs before you tune anything',
      notes: {
        time: '3 min',
        say: 'Before blaming the architecture: check the loss at step 0 — for C balanced classes it should be about ln C, for a binary D about ln 2. Overfit one batch to near zero; if you cannot, there is a bug. Watch per-layer gradient norms — clip if they spike (see the optimizers part). Sweep the learning rate. With mixed precision, let GradScaler scale the loss so tiny gradients do not underflow in float16.',
        ask: 'Your 10-class model starts at loss 9.7. What is the first thing you check?',
      },
      render: () => (
        <Steps items={[
          { title: 'Loss at init ≈ ln C', body: '10 classes → 2.303 · binary D → 0.693. Much higher = overconfident init.', tone: 'blue' },
          { title: 'Overfit one batch', body: 'Loss should reach ≈ 0 on 8–32 examples. If not, it is a bug.', tone: 'violet' },
          { title: 'Watch gradient norms per layer', body: 'Vanishing or spiking? Fix init / norm, or clip (OPT part).', tone: 'mint' },
          { title: 'Learning-rate range test', body: 'Sweep lr exponentially; pick ≈ 10× below where loss blows up.', tone: 'coral' },
          { title: 'Mixed precision: scale the loss', body: 'float16 flushes gradients below ≈ 6 × 10⁻⁸ to 0 — GradScaler multiplies by 65,536 first.', tone: 'yellow' },
        ]} />
      ),
    },

    /* ---------------- Check ---------------- */
    {
      id: 'adv-quiz',
      section: 'Check',
      kicker: 'Knowledge check',
      title: 'Explain each tool by the failure it prevents',
      reveal: true,
      notes: {
        time: '4 min',
        say: 'Ask for the failure each tool prevents, not its definition. Reveal once every pair has an answer.',
        ask: 'Which answer surprised you most?',
      },
      render: ({ revealed }) => (
        <Quiz
          revealed={revealed}
          cols={3}
          items={[
            { q: 'Why is He init 2/n and not 1/n?', a: 'ReLU zeroes half the input, halving E[x²]; the factor 2 restores the scale.' },
            { q: 'Why no BatchNorm in a WGAN-GP critic?', a: 'The penalty is per sample; BatchNorm couples samples. Use LayerNorm or none.' },
            { q: 'Dropout p = 0.2: training scale?', a: 'Survivors × 1/(1 − 0.2) = 1.25; at eval, no dropout and no scaling.' },
            { q: '10-class model starts at loss 9.7 — what is wrong?', a: 'Expected ≈ ln 10 = 2.30; the initial logits are too large — check init / last layer.' },
            { q: 'What does dividing W by σ(W) guarantee?', a: 'No input is stretched by more than 1: a 1-Lipschitz layer.' },
            { q: 'Why do 100-layer ResNets still train?', a: '∂y/∂x = I + ∂F/∂x — the identity path keeps gradients near 1.' },
          ]}
        />
      ),
    },
    {
      id: 'adv-bridge',
      section: 'Check',
      kicker: 'Part complete',
      title: 'Every tool protects the gradient signal — the wrap puts them on one page',
      layout: 'bridge',
      notes: {
        time: '1 min',
        say: 'Initialization keeps the signal sized at step 0, normalization keeps it sized during training, regularization stops memorizing, residuals keep the path open. The wrap collects everything from the deep dive on one cheat sheet.',
        ask: 'Which single tool would you reach for first if a GAN’s discriminator gradients explode?',
      },
      render: () => (
        <Bridge
          done="ADV · complete — the training toolkit"
          question="Which tool would you reach for first when a discriminator’s gradients explode?"
          next="Wrap · cheat sheet and check"
        />
      ),
    },
  ],
};
