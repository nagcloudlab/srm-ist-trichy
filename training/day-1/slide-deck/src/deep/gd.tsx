import './gd.css';
import type { ReactNode } from 'react';
import { Plot, type Pt } from '../components/art';
import {
  Answer, Bridge, Cards, Divider, FormulaSteps, FormulaTerms, Predict, Quiz, Split, Stack, T, Table, Takeaway,
} from '../components/kit';
import { BatchNoiseLab, SpiralLab, ValleyLab } from '../labs/DeepGdLabs';
import type { Part } from '../types';

const BLUE = '#3157d5', VIOLET = '#6a4bb5', CORAL = '#c8432f', MINT = '#277a59';
const Op = ({ children }: { children: ReactNode }) => <span className="op">{children}</span>;

/** Day 1 S3's delivery example with b = 5 fixed: MSE(w) = 14/3 · (w − 2)². */
const mse = (w: number) => (14 / 3) * (w - 2) ** 2;
const theta = <T tone="violet">θ</T>;
const eta = <T tone="yellow">η</T>;

export const gdPart: Part = {
  id: 'gd',
  code: 'GD',
  label: 'Gradient descent',
  title: 'Gradient descent: follow the slope downhill',
  when: '',
  minutes: 0,
  slides: [
    {
      id: 'gd-divider',
      section: 'Open',
      kicker: 'Part GD',
      title: 'Gradient descent: follow the slope downhill',
      layout: 'divider',
      notes: {
        time: '1 min',
        say: 'Every network in this course — G, D, the critic — learns with one loop: measure the slope, step downhill. This part makes that loop precise: what the gradient is, how big a step is safe, why batches add noise, and why two players descending at once can circle forever.',
        ask: 'When training diverged for you, what did you change first?',
      },
      render: () => (
        <Divider
          code="GD"
          title="Gradient descent: follow the slope downhill"
          promise="One update rule trains every network. Its learning rate, its batch size and its landscape decide whether it converges, crawls or explodes."
          items={['The gradient and the update', 'Learning rate and stability', 'Mini-batches and noise', 'Landscapes and schedules', 'Two players at once']}
        />
      ),
    },

    /* ---------------- the gradient ---------------- */
    {
      id: 'gd-landscape',
      section: 'The gradient',
      kicker: 'Loss landscape',
      title: 'Loss is a height; the gradient is the slope under your feet',
      notes: {
        time: '2 min',
        say: 'Day 1 S3 example: delivery times with b = 5 fixed. Loss as a function of w is a bowl, MSE = 14/3 · (w − 2)². At w = 1 the loss is 4.67 and the slope is −9.33 — negative, so loss falls if w grows. The bottom is at w = 2.',
        ask: 'If the slope at your current w were +3, which way would you move?',
      },
      render: () => (
        <Split ratio="1.3fr 1fr" left={
          <Plot
            ariaLabel="Loss bowl MSE(w) with the tangent at w equals 1"
            x={[0, 4]} y={[0, 20]} xTicks={[0, 1, 2, 3, 4]} yTicks={[0, 5, 10, 15, 20]} xLabel="weight w" yLabel="loss MSE(w)" height={320}
            lines={[
              { f: mse, color: VIOLET, label: 'MSE(w)' },
              { pts: [[0.2, mse(1) + 9.333 * 0.8], [1.5, mse(1) - 9.333 * 0.5]] as Pt[], color: CORAL, dash: true, width: 2.5, label: 'slope −9.33' },
            ]}
            points={[{ at: [1, mse(1)], color: CORAL, label: 'w = 1 · loss 4.67' }, { at: [2, 0], color: MINT, label: 'minimum' }]}
          />
        } right={
          <Cards cols={1} items={[
            { tag: 'Height', title: 'Loss = 4.67', body: 'How wrong the model is at w = 1', tone: 'violet' },
            { tag: 'Slope', title: 'Gradient = −9.33', body: 'Negative: loss falls if w grows', tone: 'coral' },
            { tag: 'Goal', title: 'Bottom at w = 2', body: 'Slope 0 · loss 0', tone: 'mint' },
          ]} />
        } />
      ),
    },
    {
      id: 'gd-gradient-terms',
      section: 'The gradient',
      kicker: 'Formula · term by term',
      title: 'The gradient stacks one slope per parameter into a vector',
      notes: {
        time: '3 min',
        say: 'With many parameters the slope becomes a vector: one partial derivative per parameter, each answering “if I nudge only this one, how fast does the loss change?”. That vector points uphill — the direction of steepest increase. Its length says how steep.',
        ask: 'Why do we step along the negative of this vector?',
      },
      render: () => (
        <FormulaTerms
          reading="the gradient of L = the list of partial derivatives, one per parameter"
          cols={2}
          symbolWidth="6.5rem"
          formula={<><span>∇L(</span>{theta}<span>)</span><Op>=</Op><span>(</span><span className="frac"><span>∂L</span><span>∂θ₁</span></span><span>,</span><span className="frac"><span>∂L</span><span>∂θ₂</span></span><span>, …,</span><span className="frac"><span>∂L</span><span>∂θₙ</span></span><span>)</span></>}
          terms={[
            { symbol: 'θ', name: 'Parameters', meaning: 'Every weight and bias, as one long vector', range: 'n numbers', tone: 'violet' },
            { symbol: '∂L/∂θᵢ', name: 'Partial derivative', meaning: 'Slope of L if only θᵢ moves', range: '− raise · + lower', tone: 'coral' },
            { symbol: '∇L', name: 'Gradient', meaning: 'Points uphill — the steepest increase', range: 'n numbers', tone: 'blue' },
            { symbol: '‖∇L‖', name: 'Its length', meaning: 'How steep the ground is · 0 at a flat point', range: '≥ 0', tone: 'mint' },
          ]}
        />
      ),
    },
    {
      id: 'gd-gradient-steps',
      section: 'The gradient',
      kicker: 'Formula · worked',
      title: 'In a narrow valley the gradient points mostly across, not along',
      notes: {
        time: '2 min',
        say: 'A two-parameter loss with a steep direction: L = θ₁² + 10·θ₂². At (3, 1) the partials are 6 and 20. The gradient is dominated by the steep direction even though most of the distance to the minimum is along θ₁. Keep this picture — it is why plain descent zig-zags.',
        ask: 'Which coordinate is farther from the minimum, and which has the bigger partial?',
      },
      render: () => (
        <FormulaSteps
          formula={<><span>L</span><Op>=</Op><span>θ₁²</span><Op>+</Op><span>10 θ₂²</span></>}
          given={['θ = (3, 1)', 'minimum at (0, 0)']}
          steps={[
            { math: <>∂L/∂θ₁ = 2θ₁ = 6</>, note: 'flat direction' },
            { math: <>∂L/∂θ₂ = 20θ₂ = 20</>, note: 'steep direction' },
            { math: <>∇L = (6, 20)</>, note: 'stack the partials' },
            { math: <>‖∇L‖ = √(36 + 400) = 20.88</>, note: 'steepness' },
          ]}
          result={<>∇L points 17° off the steep axis</>}
        />
      ),
    },

    /* ---------------- the update ---------------- */
    {
      id: 'gd-update-terms',
      section: 'The update',
      kicker: 'Formula · term by term',
      title: 'One rule trains every network: step against the gradient',
      notes: {
        time: '2 min',
        say: 'This is Day 1’s w ← w − lr × gradient, written for all parameters at once. Minus because the gradient points uphill. η scales the step. t counts steps — iterations — not epochs.',
        ask: 'What would happen with a plus sign instead of a minus?',
      },
      render: () => (
        <FormulaTerms
          reading="new parameters = old parameters minus learning rate times gradient"
          formula={<>{theta}<span>ₜ₊₁</span><Op>=</Op>{theta}<span>ₜ</span><Op>−</Op>{eta}<span>·</span><span>∇L(</span>{theta}<span>ₜ)</span></>}
          terms={[
            { symbol: 'θₜ', name: 'Parameters now', meaning: 'Where we stand after t steps', tone: 'violet' },
            { symbol: '∇L(θₜ)', name: 'Gradient here', meaning: 'Uphill direction at θₜ', tone: 'coral' },
            { symbol: '−', name: 'Minus', meaning: 'Turn uphill into downhill', tone: 'ink' },
            { symbol: 'η', name: 'Learning rate', meaning: 'Step size · the most important knob', range: 'e.g. 0.1 · 2e-4', tone: 'yellow' },
            { symbol: 'θₜ₊₁', name: 'Parameters next', meaning: 'One step later', tone: 'mint' },
          ]}
        />
      ),
    },
    {
      id: 'gd-update-steps',
      section: 'The update',
      kicker: 'Formula · worked',
      title: 'Two steps take w from 1 to 1.996 and the loss from 4.67 to 0.0001',
      notes: {
        time: '2 min',
        say: 'Same numbers as Day 1 S3. Step 1: gradient −9.33, step +0.93, w = 1.933, loss 0.021. Step 2: the slope is now small, −0.62, so the step is small too: w = 1.996. The step size shrinks on its own as the ground flattens.',
        ask: 'Why is the second step much smaller even though η did not change?',
      },
      render: () => (
        <FormulaSteps
          formula={<><T tone="violet">w</T><Op>←</Op><T tone="violet">w</T><Op>−</Op><T tone="yellow">η</T><span>·</span><span className="frac"><span>28</span><span>3</span></span><span>(w − 2)</span></>}
          given={['MSE = 14/3 · (w − 2)²', 'w = 1 · loss 4.67', 'η = 0.1']}
          steps={[
            { math: <>grad = 28/3 · (1 − 2) = −9.33</>, note: 'step 1 · steep' },
            { math: <>w = 1 − 0.1 · (−9.33) = 1.933</>, note: 'loss 0.021' },
            { math: <>grad = 28/3 · (1.933 − 2) = −0.62</>, note: 'step 2 · nearly flat' },
            { math: <>w = 1.933 − 0.1 · (−0.62) = 1.996</>, note: 'smaller step, same η' },
          ]}
          result={<>w = 1.996 · loss 0.0001</>}
        />
      ),
    },
    {
      id: 'gd-taylor',
      section: 'The update',
      kicker: 'Why it works',
      title: 'For a small step, loss drops by η times the gradient squared',
      notes: {
        time: '3 min',
        say: 'First-order Taylor: near θ the loss is almost a straight plane, so stepping by −η∇L changes it by about −η‖∇L‖². That is never positive — so a small enough step always helps. With η = 0.01 the prediction 3.80 is close to the true 3.84. With η = 0.1 the same formula predicts −4.04: impossible, because the bowl curves. Curvature, not the slope, limits the step size.',
        ask: 'Why can the straight-line prediction never be trusted for a large step?',
      },
      render: () => (
        <Stack gap="md">
          <FormulaSteps
            formula={<><span>L(</span>{theta}<Op>−</Op>{eta}<span>∇L)</span><Op>≈</Op><span>L(</span>{theta}<span>)</span><Op>−</Op>{eta}<span>‖∇L‖²</span></>}
            given={['w = 1 · L = 4.667', '∇L = −9.33', 'η = 0.01']}
            steps={[
              { math: <>‖∇L‖² = 9.33² = 87.11</>, note: 'always ≥ 0' },
              { math: <>predicted: 4.667 − 0.01 · 87.11 = 3.796</>, note: 'straight-line guess' },
              { math: <>actual: w = 1.093 → L = 3.836</>, note: 'close · small step' },
            ]}
            result={<>Small η: the guarantee holds</>}
          />
          <Takeaway tone="coral">With <b>η = 0.1</b> the same formula predicts <b>−4.04</b> — impossible. Large steps feel the bowl’s <b>curvature</b>.</Takeaway>
        </Stack>
      ),
    },

    /* ---------------- learning rate ---------------- */
    {
      id: 'gd-lr-predict',
      section: 'Learning rate',
      kicker: 'Predict',
      title: 'How large can the step get before training explodes?',
      reveal: true,
      notes: {
        time: '3 min',
        say: 'Same bowl, start at w = 1. Ask for votes on each η before revealing. The surprise: η = 0.2 still converges even though it overshoots every step.',
        ask: 'Which of the three learning rates diverges?',
      },
      render: ({ revealed }) => (
        <Predict
          revealed={revealed}
          question="Which learning rates still converge?"
          facts={['Loss 14/3 · (w − 2)², start at w = 1', 'Try η = 0.05 · 0.2 · 0.25']}
          answer={<Answer verdict="0.05 and 0.2 — 0.25 explodes" points={[
            <>η = 0.05: distance × <b>0.53</b> per step — creeps in</>,
            <>η = 0.2: × <b>−0.87</b> — overshoots, but shrinks</>,
            <>η = 0.25: × <b>−1.33</b> — every step lands farther away</>,
          ]} />}
        />
      ),
    },
    {
      id: 'gd-stability-terms',
      section: 'Learning rate',
      kicker: 'Formula · term by term',
      title: 'On a bowl, every step multiplies the distance by (1 − ηλ)',
      notes: {
        time: '3 min',
        say: 'Any smooth loss looks like a bowl near its minimum: L = ½λθ², where λ is the curvature (second derivative). The gradient is λθ, so one step gives θ(1 − ηλ). Converging means |1 − ηλ| < 1, which is 0 < η < 2/λ. In many dimensions the steepest direction — the largest λ — sets the limit.',
        ask: 'If the curvature doubles, what happens to the largest safe learning rate?',
      },
      render: () => (
        <FormulaTerms
          reading="for a bowl ½λθ², one step multiplies θ by m = 1 − ηλ — stable only if η < 2 / λmax"
          symbolWidth="8.5rem"
          formula={<>{theta}<span>ₜ₊₁</span><Op>=</Op><span>(1</span><Op>−</Op>{eta}<T tone="coral">λ</T><span>)</span>{theta}<span>ₜ</span><Op>⇒</Op><span>stable iff</span><span>0 &lt;</span>{eta}<span>&lt; 2 /</span><T tone="coral">λ</T><span>ₘₐₓ</span></>}
          terms={[
            { symbol: 'λ', name: 'Curvature', meaning: 'Second derivative · how sharply the bowl bends', range: '14/3 · 2 = 9.33 here', tone: 'coral' },
            { symbol: 'm = 1 − ηλ', name: 'Step multiplier', meaning: 'Scales the distance to the minimum each step', tone: 'yellow' },
            { symbol: '0 < m < 1', name: 'Smooth', meaning: 'Slides in from one side', range: 'η < 1/λ', tone: 'mint' },
            { symbol: '−1 < m < 0', name: 'Zig-zag', meaning: 'Overshoots, but each overshoot shrinks', range: '1/λ … 2/λ', tone: 'blue' },
            { symbol: '|m| > 1', name: 'Diverge', meaning: 'Each step lands farther away', range: 'η > 2/λ', tone: 'coral' },
          ]}
        />
      ),
    },
    {
      id: 'gd-stability-steps',
      section: 'Learning rate',
      kicker: 'Formula · worked',
      title: 'At η = 0.25 the error grows by a third every step',
      notes: {
        time: '2 min',
        say: 'Distance from the minimum θ = w − 2 starts at −1. λ = 9.33, so 2/λ = 0.214. At η = 0.25 the multiplier is −1.33: −1, +1.33, −1.78, +2.37 … At η = 0.2 it is −0.87: the signs flip but the size shrinks. The limit is sharp.',
        ask: 'Where exactly is the boundary between the two behaviours?',
      },
      render: () => (
        <FormulaSteps
          given={['θ = w − 2 = −1', 'λ = 9.33', 'limit 2/λ = 0.214']}
          steps={[
            { math: <>η = 0.25: 1 − 0.25 · 9.33 = −1.33</>, note: 'beyond the limit' },
            { math: <>θ: −1 → 1.33 → −1.78 → 2.37</>, note: 'grows · diverges' },
            { math: <>η = 0.2: 1 − 0.2 · 9.33 = −0.87</>, note: 'inside the limit' },
            { math: <>θ: −1 → 0.87 → −0.75 → 0.65</>, note: 'zig-zags inward' },
          ]}
          result={<>Stay below η = 2/λ = 0.214</>}
        />
      ),
    },
    {
      id: 'gd-valley-lab',
      section: 'Learning rate',
      kicker: 'Try it · learning rate on a valley',
      title: 'Push η past 2/λmax and the steep axis explodes first',
      lab: true,
      notes: {
        time: '5 min',
        say: 'Loss ½(θ₁² + κθ₂²). Start with κ = 10: η = 0.1 slides in; move η toward 0.2 and the steep axis zig-zags; pass 0.2 and it diverges. Then switch to κ = 25: the limit drops to 0.08, and at that η the flat axis crawls. That tension is ill-conditioning.',
        ask: 'With κ = 25, why can’t you just raise η to speed up the flat direction?',
      },
      render: () => <ValleyLab />,
    },
    {
      id: 'gd-condition',
      section: 'Learning rate',
      kicker: 'Formula · ill-conditioning',
      title: 'A valley 100× steeper one way needs about 360 steps',
      notes: {
        time: '3 min',
        say: 'The condition number κ = λmax / λmin. The steep direction caps η just below 2/λmax; the flat direction then shrinks by only (1 − ηλmin) per step. With κ = 10, reaching 1/1000 of the starting distance takes 33 steps; with κ = 100 it takes 360. Momentum and Adam (next part) exist to fix exactly this.',
        ask: 'Which matters for speed — the steepest or the flattest direction?',
      },
      render: () => (
        <FormulaSteps
          formula={<><span>κ</span><Op>=</Op><span className="frac"><span>λₘₐₓ</span><span>λₘᵢₙ</span></span><Op>,</Op><span>steps</span><Op>≈</Op><span className="frac"><span>ln(0.001)</span><span>ln(1 − ηλₘᵢₙ)</span></span></>}
          given={['λmax = 10 · λmin = 1', 'κ = 10', 'η = 1.9 / λmax = 0.19']}
          steps={[
            { math: <>steep: 1 − 0.19 · 10 = −0.90</>, note: 'zig-zags · barely stable' },
            { math: <>flat: 1 − 0.19 · 1 = 0.81</>, note: 'shrinks 19% per step' },
            { math: <>ln 0.001 / ln 0.81 = 32.8</>, note: '33 steps at κ = 10' },
            { math: <>κ = 100: η = 0.019, flat × 0.981</>, note: 'ln 0.001 / ln 0.981 = 360' },
          ]}
          result={<>Steps grow roughly in proportion to κ</>}
        />
      ),
    },

    /* ---------------- mini-batches ---------------- */
    {
      id: 'gd-batch-types',
      section: 'Mini-batches',
      kicker: 'Three ways to estimate the gradient',
      title: 'A mini-batch trades a little noise for many more steps',
      notes: {
        time: '3 min',
        say: 'The true gradient averages over all N examples. Full-batch GD uses all of them per step: exact but slow per step. SGD uses one: cheap but noisy. Mini-batches — 64 in the Day 1 MNIST lab — are the practical middle: parallel on a GPU, noisy enough to escape flat spots.',
        ask: 'Why might some gradient noise actually help?',
      },
      render: () => (
        <Table
          headers={['Method', 'Examples per step', 'Gradient', 'Steps per epoch (N = 60,000)', 'Used for']}
          rows={[
            ['Full batch', 'all N', 'exact', '1', 'small datasets, analysis'],
            ['Stochastic (SGD)', '1', 'very noisy', '60,000', 'theory, online learning'],
            ['Mini-batch', 'B (32–256)', 'noisy · std ∝ 1/√B', '⌈N / B⌉', 'almost all deep learning · GANs'],
          ]}
          highlight={[2]}
        />
      ),
    },
    {
      id: 'gd-batch-steps',
      section: 'Mini-batches',
      kicker: 'Formula · worked',
      title: 'Batch 64 on MNIST means 938 updates per epoch',
      notes: {
        time: '2 min',
        say: 'An epoch is one pass over the data; an iteration is one update. 60,000 / 64 = 937.5, so 938 iterations, the last batch holding 32 images. The gradient estimate is an average of B samples, so its noise standard deviation falls like 1/√B: going from 16 to 64 halves it.',
        ask: 'If you double the batch size, how many updates per epoch do you lose?',
      },
      render: () => (
        <FormulaSteps
          formula={<><span>iterations / epoch</span><Op>=</Op><span>⌈N / B⌉</span><Op>,</Op><span>noise std</span><Op>∝</Op><span className="frac"><span>1</span><span>√B</span></span></>}
          given={['N = 60,000 images', 'B = 64']}
          steps={[
            { math: <>60,000 / 64 = 937.5</>, note: 'round up' },
            { math: <>⌈937.5⌉ = 938 iterations</>, note: 'last batch: 32 images' },
            { math: <>B = 128 → 469 iterations</>, note: 'half the updates' },
            { math: <>B 16 → 64: √(16 / 64) = 0.5</>, note: 'noise std halves' },
          ]}
          result={<>938 updates per epoch</>}
        />
      ),
    },
    {
      id: 'gd-noise-lab',
      section: 'Mini-batches',
      kicker: 'Try it · batch size',
      title: 'Small batches wobble around the minimum; full batches glide',
      lab: true,
      notes: {
        time: '4 min',
        say: 'Fit y = 2x + 5 to 256 noisy points, 200 steps, η = 0.05. B = 1: the loss jumps around (jitter ≈ 3.5). B = 8: close to the best loss 4.08 with small wobble. B = 64 and all 256: smooth. Reshuffle B = 1 to show the path changes every run. Point out the cost: B = 256 used 200 epochs of compute, B = 8 used 6.25.',
        ask: 'Which batch size gives the best loss per example processed?',
      },
      render: () => <BatchNoiseLab />,
    },

    /* ---------------- landscape ---------------- */
    {
      id: 'gd-critical-points',
      section: 'Landscape',
      kicker: 'Where the gradient is zero',
      title: 'In high dimensions, flat points are mostly saddles, not traps',
      notes: {
        time: '3 min',
        say: '∇L = 0 at three kinds of point. A local minimum curves up in every direction. A saddle curves up in some, down in others — like x² − y² at the origin. A plateau is almost flat over a wide area — saturated sigmoids create these. With millions of parameters, a point that curves up in every single direction is rare, so most zero-gradient points are saddles that noise and momentum can escape.',
        ask: 'Why does mini-batch noise help at a saddle but not at a true minimum?',
      },
      render: () => (
        <Stack gap="md">
          <Cards cols={3} items={[
            { tag: 'Local minimum', title: 'Up in every direction', body: <ul><li>∇L = 0</li><li>All curvatures &gt; 0</li><li>Rare and usually good enough</li></ul>, tone: 'mint' },
            { tag: 'Saddle point', title: 'Up some ways, down others', body: <ul><li>f = x² − y² at (0, 0)</li><li>Curvatures +2 and −2</li><li>Escapable with noise</li></ul>, tone: 'yellow' },
            { tag: 'Plateau', title: 'Almost flat for a long way', body: <ul><li>‖∇L‖ ≈ 0, loss still high</li><li>Saturated sigmoids · dead ReLUs</li><li>Progress crawls</li></ul>, tone: 'coral' },
          ]} />
          <Takeaway>Zero gradient ≠ done. In high dimensions most flat points are <b>saddles</b>, which is why noise and momentum help.</Takeaway>
        </Stack>
      ),
    },
    {
      id: 'gd-schedules',
      section: 'Landscape',
      kicker: 'Learning-rate schedules',
      title: 'Big steps early, small steps late: schedules change η over time',
      notes: {
        time: '3 min',
        say: 'Early on you are far from the minimum and want big steps; near the end, mini-batch noise makes you wobble, so smaller steps settle you. Warmup does the opposite at the very start: tiny steps while Adam’s statistics and BatchNorm settle. Example with η₀ = 0.1: cosine is exactly 0.05 halfway; step decay ×0.1 every 30 epochs gives 0.01 at epoch 45.',
        ask: 'Why would a GAN usually keep a constant learning rate instead?',
      },
      render: () => {
        const T_END = 100, e0 = 0.1;
        const curve = (f: (t: number) => number): Pt[] => Array.from({ length: 101 }, (_, t) => [t, f(t)]);
        return (
          <Split ratio="1.1fr 1fr" left={
            <div className="gd-sched">
              <Plot
                ariaLabel="Four learning-rate schedules over 100 epochs"
                x={[0, 100]} y={[0, 0.1]} xTicks={[0, 25, 50, 75, 100]} yTicks={[0, 0.025, 0.05, 0.075, 0.1]} xLabel="epoch t" yLabel="η" height={300}
                lines={[
                  { pts: curve((t) => e0 * 0.1 ** Math.floor(t / 30)), color: BLUE },
                  { pts: curve((t) => e0 * Math.exp(-0.05 * t)), color: CORAL },
                  { pts: curve((t) => 0.5 * e0 * (1 + Math.cos((Math.PI * t) / T_END))), color: VIOLET },
                  { pts: curve((t) => (t < 10 ? (e0 * t) / 10 : e0)), color: MINT, dash: true },
                ]}
              />
              <div className="gd-legend">
                {([['step', BLUE], ['exponential', CORAL], ['cosine', VIOLET], ['warmup (10 epochs)', MINT]] as const).map(([name, c]) => <span key={name}><i style={{ background: c }} />{name}</span>)}
              </div>
            </div>
          } right={
            <Table compact
              headers={['Schedule', 'ηₜ', 'η₀ = 0.1 example']}
              rows={[
                ['Step', 'η₀ · γ^⌊t / s⌋', 'γ 0.1, s 30 → 0.01 at t 45'],
                ['Exponential', 'η₀ · e^(−k t)', 'k 0.05 → 0.037 at t 20'],
                ['Cosine', '½ η₀ (1 + cos(π t / T))', '0.05 at t = T/2'],
                ['Linear warmup', 'η₀ · t / Tw', '0.03 at 30% of warmup'],
              ]}
            />
          } />
        );
      },
    },
    {
      id: 'gd-gradcheck',
      section: 'Landscape',
      kicker: 'Formula · gradient checking',
      title: 'Check a gradient by nudging both ways: the result is exact here',
      notes: {
        time: '3 min',
        say: 'Before trusting a hand-written backward pass, compare it with a finite difference. The one-sided version, (L(w + h) − L(w)) / h, gives −9.287 — the number Day 1’s estimate slide used. The central difference, nudging both ways, gives −9.333: exact for a quadratic, and in general its error shrinks like h² instead of h.',
        ask: 'Why does nudging both ways cancel the curvature error?',
      },
      render: () => (
        <FormulaSteps
          formula={<><span className="frac"><span>∂L</span><span>∂w</span></span><Op>≈</Op><span className="frac"><span>L(w + h) − L(w − h)</span><span>2h</span></span></>}
          given={['L = 14/3 · (w − 2)²', 'w = 1 · h = 0.01', 'exact: −9.333']}
          steps={[
            { math: <>L(1.01) = 14/3 · 0.99² = 4.5738</>, note: 'nudge up' },
            { math: <>L(0.99) = 14/3 · 1.01² = 4.7605</>, note: 'nudge down' },
            { math: <>(4.5738 − 4.7605) / 0.02 = −9.333</>, note: 'central · exact here' },
            { math: <>one-sided: (4.5738 − 4.6667) / 0.01 = −9.287</>, note: 'error ∝ h' },
          ]}
          result={<>Central difference: error ∝ h²</>}
        />
      ),
    },

    /* ---------------- two players ---------------- */
    {
      id: 'gd-two-players',
      section: 'Two players',
      kicker: 'Formula · simultaneous descent',
      title: 'Two players descending at once can spiral away from balance',
      notes: {
        time: '3 min',
        say: 'A GAN is not one loss going down. Toy version: x minimizes f = xy, y maximizes it. The balance point is (0, 0). Simultaneous updates: x ← x − ηy, y ← y + ηx. Each step multiplies the distance from (0, 0) by √(1 + η²) > 1 — a slow outward spiral. After 100 steps at η = 0.1 you are 1.64× farther away. This is why GAN losses oscillate instead of falling.',
        ask: 'If each player is doing exactly the right thing for itself, why does the pair fail?',
      },
      render: () => (
        <FormulaSteps
          formula={<><span>min</span><sub>x</sub><span>max</span><sub>y</sub><span>f = x·y</span><Op>:</Op><span>x ← x − η y</span><Op>,</Op><span>y ← y + η x</span></>}
          given={['start (x, y) = (1, 0)', 'η = 0.1', 'balance at (0, 0)']}
          steps={[
            { math: <>step 1: x = 1, y = 0 + 0.1·1 = 0.1</>, note: 'y pushes up' },
            { math: <>step 2: x = 1 − 0.1·0.1 = 0.99, y = 0.2</>, note: 'x reacts' },
            { math: <>distance × √(1 + η²) = 1.005 each step</>, note: 'never shrinks' },
            { math: <>after 100 steps: 1.005¹⁰⁰ = 1.64</>, note: 'spirals outward' },
          ]}
          result={<>Simultaneous GD circles away from equilibrium</>}
        />
      ),
    },
    {
      id: 'gd-spiral-lab',
      section: 'Two players',
      kicker: 'Try it · two players',
      title: 'Simultaneous steps spiral out; alternating steps only orbit',
      lab: true,
      notes: {
        time: '4 min',
        say: 'Play simultaneous at η = 0.2: the path spirals out. Switch to alternating (y uses the new x — the order GAN code actually uses, D step then G step): the path stays on a closed loop, never reaching the centre. Raise η and both get worse. Real GANs add the fixes from Days 1–2: balanced learning rates (TTUR), momentum settings like β₁ = 0.5, and better losses (WGAN-GP).',
        ask: 'Which update order does our GAN training loop use?',
      },
      render: () => (
        <SpiralLab />
      ),
    },

    /* ---------------- check ---------------- */
    {
      id: 'gd-check',
      section: 'Check',
      kicker: 'Knowledge check',
      title: 'Can you predict what gradient descent will do?',
      reveal: true,
      notes: {
        time: '4 min',
        say: 'Give thinking time, then reveal. Push for the numbers in Q2 and Q3.',
        ask: 'Which answer surprised you most?',
      },
      render: ({ revealed }) => (
        <Quiz revealed={revealed} cols={3} items={[
          { q: 'The gradient points uphill. Why is it still the right direction to use?', a: 'We step along its negative · −∇L is steepest descent.' },
          { q: 'Curvature λ = 50. What is the largest stable η?', a: '2 / 50 = 0.04 · above it, |1 − ηλ| > 1.' },
          { q: 'Batch 32 on 60,000 images: updates per epoch?', a: '60,000 / 32 = 1,875.' },
          { q: 'Loss stops falling but ‖∇L‖ ≈ 0. Are you at a minimum?', a: 'Not necessarily · likely a saddle or plateau.' },
          { q: 'Raising η speeds up a round bowl. Why not a long valley?', a: 'The steep axis caps η; the flat axis stays slow (κ).' },
          { q: 'Why can a GAN’s losses oscillate forever?', a: 'Two players descend opposing losses · simultaneous GD spirals.' },
        ]} />
      ),
    },
    {
      id: 'gd-bridge',
      section: 'Check',
      kicker: 'Next part',
      title: 'Plain descent zig-zags in valleys — can a step remember where it was going?',
      layout: 'bridge',
      notes: {
        time: '1 min',
        say: 'Plain gradient descent has no memory: every step uses only the current slope, so long valleys force tiny steps and zig-zags. Optimizers add memory (momentum) and per-parameter step sizes (RMSprop, Adam).',
        ask: 'What would a ball rolling down this valley do differently?',
      },
      render: () => <Bridge done="Gradient descent · complete" question="Plain descent zig-zags in valleys — can a step remember where it was going?" next="OPT · Optimizers" />,
    },
  ],
};

