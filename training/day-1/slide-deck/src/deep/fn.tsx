import './fn.css';
import type { ReactNode } from 'react';
import { Plot } from '../components/art';
import {
  Answer, Bridge, Cards, Divider, FormulaSteps, FormulaTerms, Predict, Quiz, Split, T, Table, Takeaway,
} from '../components/kit';
import { ActivationZooLab, DepthGradientLab, SoftmaxTemperatureLab } from '../labs/DeepFnLabs';
import type { Part } from '../types';

const BLUE = '#3157d5', VIOLET = '#6a4bb5', CORAL = '#c8432f', MINT = '#277a59';
const Op = ({ children }: { children: ReactNode }) => <span className="op">{children}</span>;
const relu = (x: number) => Math.max(0, x);

export const fnPart: Part = {
  id: 'fn',
  code: 'ACT',
  label: 'Activations',
  title: 'Activations give networks their shape — and decide how gradients flow',
  when: '',
  minutes: 0,
  slides: [
    {
      id: 'fn-divider',
      section: 'Open',
      kicker: 'Part ACT',
      title: 'Activation functions',
      layout: 'divider',
      notes: {
        time: '1 min',
        say: 'Day 1 gave the GAN recipe: ReLU, LeakyReLU, Tanh, Sigmoid. Here we open the box: why a bend is needed, how each function shapes the gradient, and how to choose.',
        ask: 'If you removed every activation from a 10-layer network, what could it still learn?',
      },
      render: () => (
        <Divider
          code="ACT"
          title="Activation functions"
          promise="Two jobs: bend the forward signal, scale the backward gradient."
          items={['Why a bend', 'Sigmoid & tanh', 'Through depth', 'ReLU family', 'Softmax', 'Choosing']}
        />
      ),
    },

    /* ---------------- why a bend ---------------- */
    {
      id: 'fn-collapse',
      section: 'Why a bend',
      kicker: 'Worked · two linear layers',
      title: 'Two linear layers collapse into one line',
      notes: {
        time: '3 min',
        say: 'Stack two linear layers with no activation. Substitute the first into the second and the hidden layer disappears: 3(2x + 1) − 4 is just 6x − 1. Any depth of pure linear layers is one linear layer.',
        ask: 'What would 100 stacked linear layers collapse into?',
      },
      render: () => (
        <>
          <FormulaSteps
            formula={<><span>y</span><Op>=</Op><T tone="violet">3</T><span>·</span><span>(</span><T tone="blue">2x + 1</T><span>)</span><Op>−</Op><span>4</span></>}
            given={['Layer 1: h = 2x + 1', 'Layer 2: y = 3h − 4', 'Test input: x = 2']}
            steps={[
              { math: <>y = 3·(2x + 1) − 4</>, note: 'substitute h into layer 2' },
              { math: <>y = 6x + 3 − 4</>, note: 'distribute the 3' },
              { math: <>y = 6x − 1</>, note: 'one weight, one bias — a single line' },
              { math: <>x = 2: h = 5, y = 11 · 6·2 − 1 = 11</>, note: 'both routes agree' },
            ]}
            result={<>Linear ∘ linear = linear</>}
          />
          <Takeaway>Without a nonlinear bend between layers, depth adds <b>nothing</b> to what a network can represent.</Takeaway>
        </>
      ),
    },
    {
      id: 'fn-kinks',
      section: 'Why a bend',
      kicker: 'Universal approximation · intuition',
      title: 'Three ReLU kinks already build a bump',
      notes: {
        time: '3 min',
        say: 'Each ReLU unit is a hinge. Add three hinges with weights +1, −2, +1 and you get a triangle bump: 0, up to 1 at x = 0, back to 0. Enough bumps, scaled and shifted, approximate any continuous curve on a range — that is the universal approximation idea.',
        ask: 'How would you build two bumps at different places?',
      },
      render: () => (
        <Split ratio="1.25fr 1fr" left={
          <Plot
            ariaLabel="Three shifted ReLU hinges summing to a triangle bump"
            x={[-2, 2]} y={[-2.2, 3.2]} xTicks={[-2, -1, 0, 1, 2]} yTicks={[-2, -1, 0, 1, 2, 3]} xLabel="x" height={320}
            lines={[
              { f: (x) => relu(x + 1), color: BLUE, width: 2, dash: true, label: 'ReLU(x+1)' },
              { f: (x) => -2 * relu(x), color: CORAL, width: 2, dash: true, label: '−2·ReLU(x)' },
              { f: (x) => relu(x - 1), color: VIOLET, width: 2, dash: true, label: 'ReLU(x−1)' },
              { f: (x) => relu(x + 1) - 2 * relu(x) + relu(x - 1), color: MINT, width: 5, label: 'sum' },
            ]}
          />
        } right={
          <Table
            headers={['x', 'sum']}
            rows={[['−2', '0'], ['−1', '0'], ['−0.5', '0.5'], ['0', '1'], ['0.5', '0.5'], ['1', '0'], ['2', '0']]}
            highlight={[3]} compact align={['center', 'center']}
          />
        } />
      ),
    },

    /* ---------------- squashing ---------------- */
    {
      id: 'fn-squash-terms',
      section: 'Squashing',
      kicker: 'Sigmoid and tanh · term by term',
      title: 'Sigmoid maps to (0, 1), tanh to (−1, 1) — both flatten at the ends',
      notes: {
        time: '3 min',
        say: 'Read both formulas. e to the minus z is the engine: huge for very negative z, tiny for very positive z. Tanh is a stretched, shifted sigmoid: 2σ(2x) − 1. Their derivatives peak at 0: 0.25 for sigmoid, 1 for tanh.',
        ask: 'Why can tanh pass back four times more gradient than sigmoid at z = 0?',
      },
      render: () => (
        <FormulaTerms
          reading="sigma of z = 1 over (1 + e to the minus z) · tanh x = 2·sigma(2x) − 1"
          formula={<><span>σ(z)</span><Op>=</Op><span className="frac"><span>1</span><span>1 + e<sup>−z</sup></span></span><span className="fn-sep">·</span><span>tanh x</span><Op>=</Op><span>2σ(2x)</span><Op>−</Op><span>1</span></>}
          symbolWidth="5.5rem"
          cols={2}
          terms={[
            { symbol: 'e⁻ᶻ', name: 'The engine', meaning: 'z = −5 → 148, σ ≈ 0 · z = 5 → 0.007, σ ≈ 1', range: '(0, ∞)', tone: 'blue' },
            { symbol: 'σ′(z)', name: 'Sigmoid slope = σ(1 − σ)', meaning: 'Peaks at z = 0: 0.5 × 0.5', range: 'max 0.25', tone: 'violet' },
            { symbol: 'tanh', name: 'Tanh output', meaning: 'Same S-shape, centred on 0', range: '(−1, 1)', tone: 'mint' },
            { symbol: 'tanh′', name: 'Tanh slope = 1 − tanh²', meaning: 'Peaks at x = 0', range: 'max 1', tone: 'yellow' },
          ]}
        />
      ),
    },
    {
      id: 'fn-squash-steps',
      section: 'Squashing',
      kicker: 'Worked · slopes at z = 2',
      title: 'At z = 2 both slopes have already fallen below 0.11',
      notes: {
        time: '2 min',
        say: 'Work z = 2 by hand. Sigmoid is 0.881, so its slope is 0.881 × 0.119 = 0.105. Tanh(2) is 0.964, slope 1 − 0.929 = 0.071. Two units of input from the centre and the gradient is already cut by ten.',
        ask: 'What happens to these slopes at z = 5?',
      },
      render: () => (
        <FormulaSteps
          given={['z = 2', 'e⁻² = 0.135']}
          steps={[
            { math: <>σ(2) = 1 / (1 + 0.135) = 0.881</>, note: 'sigmoid value' },
            { math: <>σ′(2) = 0.881 × (1 − 0.881) = 0.105</>, note: 'sigmoid slope · was 0.25 at z = 0' },
            { math: <>tanh(2) = 0.964</>, note: 'tanh value' },
            { math: <>tanh′(2) = 1 − 0.964² = 0.071</>, note: 'tanh slope · was 1 at z = 0' },
            { math: <>check: 2σ(2) − 1 = 2 × 0.881 − 1 = 0.762 = tanh(1)</>, note: 'the tanh–sigmoid identity' },
          ]}
          result={<>Saturation: away from 0, slopes vanish</>}
        />
      ),
    },
    {
      id: 'fn-zero-centred',
      section: 'Squashing',
      kicker: 'Zero-centred outputs',
      title: 'Tanh beats sigmoid in hidden layers because its outputs are centred on 0',
      notes: {
        time: '2 min',
        say: 'If every input to the next layer is positive, as with sigmoid outputs, then every weight gradient of a unit has the same sign as its upstream gradient. All weights must move up together or down together — a zig-zag path. Tanh outputs are positive and negative, so weights can move independently.',
        ask: 'Which Day 1 activation produces only non-negative outputs too?',
      },
      render: () => (
        <>
          <Cards cols={2} items={[
            { tag: 'Sigmoid hidden units', title: 'Outputs all positive', body: <ul><li>∂L/∂wᵢ = δ · aᵢ with every aᵢ &gt; 0</li><li>All weights of a unit share δ's sign</li><li>Updates zig-zag toward the minimum</li></ul>, tone: 'coral' },
            { tag: 'Tanh hidden units', title: 'Outputs centred on 0', body: <ul><li>aᵢ can be positive or negative</li><li>Each weight can move its own way</li><li>Faster, straighter descent</li></ul>, tone: 'mint' },
          ]} />
          <Takeaway>Today both are mostly <b>output</b> activations: sigmoid for a probability, tanh for images in [−1, 1] (the GAN generator).</Takeaway>
        </>
      ),
    },

    /* ---------------- gradients through depth ---------------- */
    {
      id: 'fn-vanish-steps',
      section: 'Through depth',
      kicker: 'Worked · the chain rule multiplies slopes',
      title: 'Ten sigmoid layers can shrink a gradient a million times',
      notes: {
        time: '3 min',
        say: 'Backprop multiplies one local slope per layer. Sigmoid’s best case is 0.25. Ten layers at the best case: 0.25 to the tenth, about one in a million. That is the vanishing-gradient problem, and why deep sigmoid networks stalled before ReLU.',
        ask: 'If each layer multiplied by 1.1 instead, what would 30 layers do?',
      },
      render: () => (
        <FormulaSteps
          formula={<><span>∂L/∂x₀</span><Op>=</Op><span>∂L/∂x_L</span><span>·</span><span>Π</span><span>w<sub>ℓ</sub>·</span><T tone="violet">f′(z<sub>ℓ</sub>)</T></>}
          given={['best-case sigmoid slope 0.25', 'weights with |w| = 1', 'upstream gradient 1']}
          steps={[
            { math: <>3 layers: 0.25³ = 0.0156</>, note: 'already 64× smaller' },
            { math: <>5 layers: 0.25⁵ = 0.00098</>, note: 'about 1 / 1,000' },
            { math: <>10 layers: 0.25¹⁰ = 9.5 × 10⁻⁷</>, note: 'about 1 / 1,000,000' },
            { math: <>30 layers, factor 1.1: 1.1³⁰ = 17.4</>, note: 'the opposite: exploding' },
          ]}
          result={<>Keep the per-layer factor near 1</>}
        />
      ),
    },
    {
      id: 'fn-depth-lab',
      section: 'Through depth',
      kicker: 'Live · gradient through depth',
      title: 'Drag z away from 0: sigmoid dies first, ReLU holds at ×1',
      lab: true,
      notes: {
        time: '5 min',
        say: 'Each line is the gradient magnitude after passing L layers, on a log scale. Start z = 0.5, gain 1: sigmoid falls fastest. Move z negative: ReLU drops to zero at once (dead). Push gain above 1: everything explodes. Point out the assumption in the footer.',
        ask: 'Which single setting keeps all four lines flat?',
      },
      render: () => <DepthGradientLab />,
    },

    /* ---------------- the ReLU family ---------------- */
    {
      id: 'fn-relu-terms',
      section: 'ReLU family',
      kicker: 'ReLU, LeakyReLU, PReLU · term by term',
      title: 'ReLU passes a slope of exactly 1 — and 0 on the negative side',
      notes: {
        time: '3 min',
        say: 'ReLU’s slope is 1 for positive inputs, so it never shrinks the gradient there — the depth fix. Its weakness is the flat negative side: a unit that is negative for every input never updates again. LeakyReLU keeps a small slope α; PReLU learns α. PyTorch’s default LeakyReLU slope is 0.01; GAN discriminators use 0.2.',
        ask: 'What is LeakyReLU(−5) with α = 0.2, and with PyTorch’s default?',
      },
      render: () => (
        <FormulaTerms
          reading="ReLU = max(0, x) · LeakyReLU = x if positive, else alpha times x"
          formula={<><span>ReLU(x)</span><Op>=</Op><span>max(0, x)</span><span className="fn-sep">·</span><span>Leaky(x)</span><Op>=</Op><span>max(</span><T tone="coral">α</T><span>x, x)</span></>}
          symbolWidth="6.5rem"
          cols={2}
          terms={[
            { symbol: 'max(0, x)', name: 'ReLU', meaning: 'Negative → 0 · positive passes unchanged', range: '[0, ∞)', tone: 'mint' },
            { symbol: 'ReLU′', name: 'Its slope', meaning: '1 when x > 0 (no shrinking) · 0 when x < 0 (no update)', range: '0 or 1', tone: 'violet' },
            { symbol: 'α', name: 'Leak slope', meaning: 'Leaky(−5) = −1 at α = 0.2 (GAN D) · −0.05 at 0.01 (PyTorch default)', range: '0.01 … 0.3', tone: 'coral' },
            { symbol: 'PReLU', name: 'Learned α', meaning: 'α is a parameter, trained by backprop like any weight', range: 'learned', tone: 'blue' },
          ]}
        />
      ),
    },
    {
      id: 'fn-elu-terms',
      section: 'ReLU family',
      kicker: 'ELU and SELU · term by term',
      title: 'ELU curves smoothly below zero; SELU scales it to self-normalize',
      notes: {
        time: '3 min',
        say: 'ELU replaces the hard leak with an exponential that levels off at −α, so the mean activation sits closer to 0 and the slope is smooth. SELU multiplies ELU by fixed constants λ ≈ 1.0507 and α ≈ 1.6733, chosen so activations keep mean 0 and variance 1 layer after layer — under specific conditions: LeCun-normal init and plain fully-connected layers.',
        ask: 'What is ELU(−1) with α = 1, and its slope there?',
      },
      render: () => (
        <FormulaTerms
          reading="ELU = x if positive, else alpha·(e to the x − 1) · SELU = lambda · ELU with fixed alpha"
          formula={<><span>ELU(x)</span><Op>=</Op><span>x  if x &gt; 0,</span><span>  </span><T tone="coral">α</T><span>(eˣ − 1)  else</span><span className="fn-sep">·</span><span>SELU</span><Op>=</Op><T tone="violet">λ</T><span>·ELU</span></>}
          symbolWidth="8rem"
          cols={2}
          terms={[
            { symbol: 'α(eˣ−1)', name: 'Negative side', meaning: 'ELU(−1) = e⁻¹ − 1 = −0.632 · flattens toward −α', range: '(−α, 0)', tone: 'coral' },
            { symbol: 'αeˣ', name: 'Negative slope', meaning: 'ELU′(−1) = 0.368 · never exactly 0, so no dead units', range: '(0, α)', tone: 'violet' },
            { symbol: 'λ, α', name: 'SELU constants', meaning: 'λ ≈ 1.0507, α ≈ 1.6733 · SELU(1) = 1.051, SELU(−1) = −1.111', range: 'fixed', tone: 'blue' },
            { symbol: 'SELU', name: 'Self-normalizing', meaning: 'Mean ≈ 0, variance ≈ 1 · needs LeCun-normal init, dense layers', range: '(−1.758, ∞)', tone: 'mint' },
          ]}
        />
      ),
    },
    {
      id: 'fn-gelu-terms',
      section: 'ReLU family',
      kicker: 'GELU and SiLU · term by term',
      title: 'GELU and SiLU gate x by a smooth probability instead of a hard switch',
      notes: {
        time: '3 min',
        say: 'ReLU multiplies x by a hard 0-or-1 gate. GELU multiplies x by Φ(x), the chance a standard normal is below x — a soft gate. SiLU, also called Swish, uses σ(x) as the gate. Both dip slightly below 0 and are smooth everywhere. GELU is the Transformer default; it is worth testing in GANs, not a guaranteed win.',
        ask: 'Why does GELU(−1) come out slightly negative rather than 0?',
      },
      render: () => (
        <FormulaTerms
          reading="GELU = x times Phi of x · SiLU = x times sigma of x"
          formula={<><span>GELU(x)</span><Op>=</Op><span>x ·</span><T tone="violet">Φ(x)</T><span className="fn-sep">·</span><span>SiLU(x)</span><Op>=</Op><span>x ·</span><T tone="coral">σ(x)</T></>}
          symbolWidth="4.5rem"
          cols={2}
          terms={[
            { symbol: 'Φ(x)', name: 'Soft gate (GELU)', meaning: 'Normal CDF · Φ(1) = 0.841 → GELU(1) = 0.841, GELU(−1) = −0.159', range: '(0, 1)', tone: 'violet' },
            { symbol: '≈ tanh', name: 'Fast GELU', meaning: '0.5x(1 + tanh(√(2/π)(x + 0.0447x³))) → 0.841 at x = 1', range: '≈ exact', tone: 'blue' },
            { symbol: 'σ(x)', name: 'Soft gate (SiLU)', meaning: 'SiLU(1) = 0.731 · SiLU(−1) = −0.269', range: '(0, 1)', tone: 'coral' },
            { symbol: 'min', name: 'Small dip below 0', meaning: 'GELU ≈ −0.170 at x ≈ −0.75 · SiLU ≈ −0.278 at x ≈ −1.28', range: 'bounded', tone: 'mint' },
          ]}
        />
      ),
    },
    {
      id: 'fn-zoo-lab',
      section: 'ReLU family',
      kicker: 'Live · activation zoo',
      title: 'Compare signal and slope for seven activations side by side',
      lab: true,
      notes: {
        time: '5 min',
        say: 'Pick GELU, slide x from −5 to 5, then switch to the slope view. Compare with sigmoid and tanh: their slopes collapse at both ends. ReLU’s slope is a step. The faint lines keep every other function visible.',
        ask: 'Which functions still pass a useful slope at x = −5?',
      },
      render: () => <ActivationZooLab />,
    },

    /* ---------------- softmax ---------------- */
    {
      id: 'fn-softmax-terms',
      section: 'Softmax',
      kicker: 'Softmax · term by term',
      title: 'Softmax turns K scores into K probabilities that sum to 1',
      notes: {
        time: '3 min',
        say: 'Exponentiate each logit so it is positive, then divide by the total so they sum to 1. Adding the same constant to every logit changes nothing — that is why implementations subtract the max first: e to the 1000 overflows, e to the 0 does not. Temperature divides the logits before softmax.',
        ask: 'Sigmoid is softmax with how many classes?',
      },
      render: () => (
        <FormulaTerms
          reading="probability of class i = e to the (z_i over T), divided by the sum over all classes"
          formula={<><span>pᵢ</span><Op>=</Op><span className="frac"><span>e<sup>zᵢ / T</sup></span><span>Σⱼ e<sup>zⱼ / T</sup></span></span></>}
          symbolWidth="5.5rem"
          cols={2}
          terms={[
            { symbol: 'zᵢ', name: 'Logit for class i', meaning: 'Raw score from the last linear layer', range: '(−∞, ∞)', tone: 'blue' },
            { symbol: 'e^(·)', name: 'Make positive', meaning: 'Bigger score → exponentially bigger weight', range: '(0, ∞)', tone: 'violet' },
            { symbol: 'Σⱼ', name: 'Normalize', meaning: 'Divide by the total so all pᵢ sum to 1', range: 'Σ pᵢ = 1', tone: 'mint' },
            { symbol: '− max', name: 'Stability trick', meaning: 'Subtract max z first: same p, no overflow (e¹⁰⁰⁰ = ∞)', range: 'top term = 1', tone: 'coral' },
            { symbol: 'T', name: 'Temperature', meaning: 'T < 1 sharpens · T > 1 flattens · T = 1 standard', range: '(0, ∞)', tone: 'yellow' },
          ]}
        />
      ),
    },
    {
      id: 'fn-softmax-steps',
      section: 'Softmax',
      kicker: 'Worked · logits 2, 1, 0.1, −1',
      title: 'Halving the temperature turns 64% confidence into 86%',
      notes: {
        time: '3 min',
        say: 'Subtract the max, 2, to get 0, −1, −1.9, −3. Exponentiate: 1, 0.368, 0.150, 0.050. Sum 1.567. Divide: 0.638, 0.235, 0.095, 0.032 — identical to using the raw logits. At T = 0.5 the top class jumps to 0.862; at T = 2 it falls to 0.451.',
        ask: 'Does temperature ever change which class is ranked first?',
      },
      render: () => (
        <FormulaSteps
          given={['z = 2, 1, 0.1, −1', 'T = 1, then 0.5 and 2']}
          steps={[
            { math: <>z − max = 0, −1, −1.9, −3</>, note: 'subtract 2 · probabilities unchanged' },
            { math: <>e^(·) = 1, 0.368, 0.150, 0.050</>, note: 'sum = 1.567' },
            { math: <>p = 0.638, 0.235, 0.095, 0.032</>, note: 'T = 1 · sums to 1' },
            { math: <>T = 0.5 → 0.862, 0.117, 0.019, 0.002</>, note: 'sharper' },
            { math: <>T = 2 → 0.451, 0.274, 0.174, 0.101</>, note: 'flatter' },
          ]}
          result={<>Temperature changes confidence, never the ranking</>}
        />
      ),
    },
    {
      id: 'fn-softmax-lab',
      section: 'Softmax',
      kicker: 'Live · softmax temperature',
      title: 'Slide T from 0.1 to 5 and watch confidence melt into uniform',
      lab: true,
      notes: {
        time: '3 min',
        say: 'Start at T = 1 (0.638 top). Drag toward 0.1: the bars become one-hot. Drag toward 5: every class approaches 0.25 and entropy approaches 2 bits. The ranking never changes.',
        ask: 'Where have you seen a temperature setting before?',
      },
      render: () => <SoftmaxTemperatureLab />,
    },

    /* ---------------- choosing ---------------- */
    {
      id: 'fn-predict-output',
      section: 'Choosing',
      kicker: 'Predict',
      title: 'The output activation must match the target’s range',
      reveal: true,
      notes: {
        time: '3 min',
        say: 'Ask for each task in turn and wait for answers before revealing. The rule: hidden layers need a good gradient; the output layer needs the right range for the target and a matching loss.',
        ask: 'Which pairing goes wrong if you use ReLU at the generator output?',
      },
      render: ({ revealed }) => (
        <Predict
          revealed={revealed}
          question="Which output activation for each?"
          facts={['A · house price', 'B · real or fake (one probability)', 'C · one of 10 digits', 'D · an image normalized to [−1, 1]']}
          answer={<Answer verdict="Match the range" points={[<>A · <b>none</b> (linear) + MSE</>, <>B · <b>sigmoid</b> + BCE, or a raw logit + BCEWithLogits</>, <>C · <b>softmax</b> + cross-entropy</>, <>D · <b>tanh</b> — the GAN generator</>]} />}
        />
      ),
    },
    {
      id: 'fn-cheat',
      section: 'Choosing',
      kicker: 'Cheat sheet',
      title: 'Range and slope decide where each activation belongs',
      notes: {
        time: '3 min',
        say: 'Read across a row: range, slope at 0, worst-case slope, typical home. The GAN column ties back to Day 1: G hidden ReLU, G output tanh, D hidden LeakyReLU(0.2), D output a logit with BCEWithLogits.',
        ask: 'Which two rows can never output a negative number?',
      },
      render: () => (
        <Table
          compact
          headers={['Function', 'Range', 'f′(0)', 'Far negative', 'Typical use · GAN']}
          rows={[
            ['Sigmoid', '(0, 1)', '0.25', 'slope → 0', 'Binary output · D probability'],
            ['Tanh', '(−1, 1)', '1', 'slope → 0', 'Bounded output · G image'],
            ['ReLU', '[0, ∞)', '0 | 1', 'slope 0 (dead)', 'Default hidden · G hidden'],
            ['LeakyReLU', '(−∞, ∞)', 'α | 1', 'slope α', 'Hidden · D hidden (α = 0.2)'],
            ['ELU / SELU', '(−α, ∞)', '1', 'slope → 0 smoothly', 'Hidden · self-normalizing nets'],
            ['GELU / SiLU', '≈ [−0.2, ∞)', '0.5', 'slope → 0 smoothly', 'Transformers · worth testing'],
            ['Softmax', 'simplex', '—', '—', 'Multi-class output'],
          ]}
          highlight={[1, 3]}
        />
      ),
    },
    {
      id: 'fn-check',
      section: 'Check',
      kicker: 'Knowledge check',
      title: 'Can you defend every activation choice?',
      reveal: true,
      notes: {
        time: '4 min',
        say: 'Give thinking time, then reveal. Push for the reason in each answer — slope, range or stability.',
        ask: 'Which answer surprised you?',
      },
      render: ({ revealed }) => (
        <Quiz revealed={revealed} items={[
          { q: 'A 20-layer net with no activations — what can it learn?', a: 'Only a linear function; the layers collapse into one.' },
          { q: 'Why does a 10-layer sigmoid net train slowly?', a: 'Each layer multiplies the gradient by ≤ 0.25 → ≈ 10⁻⁶ after 10.' },
          { q: 'ReLU(−3) and its slope? LeakyReLU(−3), α = 0.2?', a: '0 and 0 · −0.6 and 0.2.' },
          { q: 'Logits 1000, 999: why subtract the max first?', a: 'e¹⁰⁰⁰ overflows; softmax(0, −1) gives the same 0.731, 0.269.' },
          { q: 'Lower the temperature: does the top class change?', a: 'No — only the confidence rises; ranking is unchanged.' },
          { q: 'Why tanh, not ReLU, at the generator output?', a: 'Real images are in [−1, 1]; ReLU cannot output negatives.' },
        ]} />
      ),
    },
    {
      id: 'fn-bridge',
      section: 'Check',
      kicker: 'Next part',
      title: 'Activations shape the output — the loss decides what “wrong” costs',
      layout: 'bridge',
      notes: {
        time: '1 min',
        say: 'We now know what comes out of each layer and how gradients pass back through it. Next: the loss — the number that starts every backward pass, and why its shape matters as much as the activation.',
        ask: 'Why do sigmoid and BCE belong together?',
      },
      render: () => <Bridge done="Activations · complete" question="Activations shape the output — the loss decides what “wrong” costs." next="LOSS · Loss functions" />,
    },
  ],
};

