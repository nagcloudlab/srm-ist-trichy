import './s3.css';
import { Plot } from '../components/art';
import {
  Bridge, Cards, Code, Divider, Equation, Flow, FormulaSteps, FormulaTerms, LabDemo, Mapping, Output, Predict, Quiz, Recap, Split, Stack, T, Table, Takeaway, Versus, Answer,
} from '../components/kit';
import { BackpropLab, HiddenLayerLab, HiddenNet, NeuronLab, SigmoidBceLab } from '../labs/S3Labs';
import type { Part } from '../types';

const BLUE = '#3157d5', VIOLET = '#6a4bb5', CORAL = '#c8432f', MINT = '#277a59', YELLOW = '#8a6500', MUTED = '#68707c';
const relu = (z: number) => Math.max(0, z);
const sigmoid = (z: number) => 1 / (1 + Math.exp(-z));
const Op = ({ children }: { children: React.ReactNode }) => <span className="op">{children}</span>;

export const s3Part: Part = {
  id: 's3',
  code: 'S3',
  label: 'NN fast-track',
  title: 'Neural Networks Fast-Track',
  when: 'Afternoon 1',
  minutes: 90,
  slides: [
    /* ------------------------------------------------------------ Open */
    {
      id: 's3-divider',
      section: 'Open',
      kicker: 'Session 3',
      title: 'Neural Networks Fast-Track',
      layout: 'divider',
      notes: {
        time: '1 min',
        say: 'This session opens the two boxes we drew this morning. G and D are just neural networks — so we build one from the smallest piece upward. Enough to build a GAN today, nothing more.',
        ask: 'What do you think is actually inside the Generator box?',
      },
      render: () => (
        <Divider
          code="S3"
          title="Neural Networks Fast-Track"
          promise="You need to understand what is inside G and D before building them. A rapid tour — exactly enough to build a GAN today."
          items={['A neuron', 'Why one is not enough', 'Hidden layers', 'Backpropagation', 'Sigmoid + BCE', 'PyTorch']}
        />
      ),
    },
    {
      id: 's3-ladder',
      section: 'Open',
      kicker: 'Where this is going',
      title: 'A GAN is built from neurons — so we start with one',
      lede: 'Every step up the ladder reuses the step below it.',
      notes: {
        time: '1 min',
        say: 'Read the ladder left to right. By the end of this session we reach the third box; Session 4 adds the fourth.',
        ask: 'Which step do you already feel comfortable with?',
      },
      render: () => (
        <>
          <Flow nodes={[
            { label: 'Part A', value: 'One neuron', tone: 'blue', note: 'ŷ = wx + b' },
            { op: '→' },
            { label: 'Parts B–C', value: 'A layer', tone: 'violet', note: 'many neurons + ReLU' },
            { op: '→' },
            { label: 'Parts D–F', value: 'A deep network', tone: 'mint', note: 'trained by backprop' },
            { op: '→' },
            { label: 'Session 4', value: 'A GAN', tone: 'coral', note: 'two networks competing' },
          ]} />
          <Takeaway>Today's goal is practical: know each part well enough to write G and D in PyTorch.</Takeaway>
        </>
      ),
    },

    /* ------------------------------------------------------------ Part A */
    {
      id: 's3-predict-delivery',
      section: 'A · The neuron',
      kicker: 'Start with a pattern',
      title: 'Can you predict the next delivery time?',
      reveal: true,
      notes: {
        time: '2 min',
        say: 'Wait for everyone to commit to a number. Let them notice the +2 per km and the 5-minute start on their own.',
        ask: 'What will 4 km take — and what rule did you use?',
      },
      render: ({ revealed }) => (
        <Split ratio="0.8fr 1.2fr" left={
          <div className="s3-delivery" role="table" aria-label="Delivery times">
            <span className="s3-head">Distance</span><span className="s3-head">Time</span>
            <span>1 km</span><span>7 min</span>
            <span>2 km</span><span>9 min</span>
            <span>3 km</span><span>11 min</span>
            <span className="s3-mystery">4 km</span><span className="s3-mystery">{revealed ? '13 min' : '?'}</span>
          </div>
        } right={
          <Predict revealed={revealed} question="How long will a 4 km delivery take?" facts={['Commit to a number', 'Say your rule out loud']} answer={<Answer verdict="13 minutes" points={[<>Every km adds <T tone="violet">2</T> minutes</>, <>Every delivery starts with <T tone="coral">5</T> minutes</>, <>2 × 4 + 5 = <b>13</b></>]} />} />
        } />
      ),
    },
    {
      id: 's3-neuron-equation',
      section: 'A · The neuron',
      kicker: 'The neuron equation',
      title: 'One neuron is one line: multiply, then add',
      notes: {
        time: '2 min',
        say: 'Read it aloud: y-hat equals w times x plus b. Then point to each row of the table and map it back to the delivery example.',
        ask: 'Which symbol is the fixed starting cost?',
      },
      render: () => (
        <Split ratio="1fr 1.1fr" left={
          <Equation size="xl" reading="prediction = weight × input + bias">
            <T tone="mint">ŷ</T><Op>=</Op><T tone="violet">w</T><Op>×</Op><T tone="blue">x</T><Op>+</Op><T tone="coral">b</T>
          </Equation>
        } right={
          <Table
            headers={['Symbol', 'Name', 'Delivery example']}
            rows={[
              [<T tone="blue">x</T>, 'Input', 'distance (km)'],
              [<T tone="violet">w</T>, 'Weight', '2 — how strongly the input matters'],
              [<T tone="coral">b</T>, 'Bias', '5 — fixed baseline added every time'],
              [<T tone="mint">ŷ</T>, 'Output', 'predicted delivery time'],
            ]}
          />
        } />
      ),
    },
    {
      id: 's3-forward-pass',
      section: 'A · The neuron',
      kicker: 'Forward pass',
      title: 'Follow one prediction through the neuron',
      notes: {
        time: '2 min',
        say: 'Trace left to right with your hand. This movement — input to output — is called the forward pass. The code is the same three numbers and one line.',
        ask: 'What operation happens first, multiply or add?',
      },
      render: () => (
        <Stack gap="lg">
          <Flow size="lg" nodes={[
            { label: 'input x', value: '4 km', tone: 'blue' }, { op: '×' },
            { label: 'weight w', value: '2', tone: 'violet' }, { op: '+' },
            { label: 'bias b', value: '5', tone: 'coral' }, { op: '=' },
            { label: 'prediction ŷ', value: '13 min', tone: 'mint' },
          ]} caption="Data moves forward: input → multiply → add → prediction" />
          <Split ratio="1.2fr 1fr" left={
            <Code title="neuron.py" code={`distance = 4
weight = 2
bias = 5

prediction = weight * distance + bias
print("Predicted time:", prediction, "minutes")`} marks={{ 5: 'yellow' }} />
          } right={<Output>{'Predicted time: 13 minutes'}</Output>} />
        </Stack>
      ),
    },
    {
      id: 's3-knobs',
      section: 'A · The neuron',
      kicker: 'What each part does',
      title: 'Weight is a volume knob; bias is a fixed shift',
      notes: {
        time: '2 min',
        say: 'Left chart: changing w changes the slope — how much the input matters. Right chart: changing b moves every prediction up or down equally. Learning means finding both automatically.',
        ask: 'If w = 0, does the distance matter at all?',
      },
      render: () => (
        <>
          <div className="cards" style={{ '--cols': 2 } as React.CSSProperties}>
            <article className="card tone-violet">
              <small className="card-tag">Weight w · b = 5 fixed</small>
              <strong className="card-title">Bigger w → input matters more</strong>
              <Plot ariaLabel="Lines with weight 0, 1, 2 and 3" x={[0, 4]} y={[0, 18]} xTicks={[0, 1, 2, 3, 4]} yTicks={[0, 6, 12, 18]} height={230}
                lines={[0, 1, 2, 3].map((w, i) => ({ f: (x: number) => w * x + 5, color: [MUTED, MINT, VIOLET, CORAL][i], label: `w = ${w}` }))} />
            </article>
            <article className="card tone-coral">
              <small className="card-tag">Bias b · w = 2 fixed</small>
              <strong className="card-title">Bigger b → every prediction shifts</strong>
              <Plot ariaLabel="Parallel lines with bias 0, 5 and 10" x={[0, 4]} y={[0, 18]} xTicks={[0, 1, 2, 3, 4]} yTicks={[0, 6, 12, 18]} height={230}
                lines={[0, 5, 10].map((b, i) => ({ f: (x: number) => 2 * x + b, color: [BLUE, CORAL, MINT][i], label: `b = ${b}` }))} />
            </article>
          </div>
          <Takeaway><span>Learning = finding the right <T tone="violet">w</T> and <T tone="coral">b</T> automatically from data.</span></Takeaway>
        </>
      ),
    },
    {
      id: 's3-neuron-lab',
      section: 'A · The neuron',
      kicker: 'Your turn',
      title: 'Tune w and b until the line hits every delivery',
      lab: true,
      notes: {
        time: '4 min',
        say: 'Start at w = 1, b = 5 (MSE 4.67). Let a volunteer drive. The dashed red lines are the errors; MSE is their squared average. Stop when MSE reaches 0 at w = 2, b = 5.',
        ask: 'Which knob fixes the slope problem, and which fixes the starting point?',
      },
      render: () => <NeuronLab />,
    },
    {
      id: 's3-mse',
      section: 'A · The neuron',
      kicker: 'Mean squared error · term by term',
      title: 'MSE: square each miss, then average',
      notes: { time: '2 min', say: 'The lab showed an MSE number. Here is where it comes from. Error first: prediction minus truth. Square it so the sign disappears and big misses count more. Then average over all examples.', ask: 'Why not just average the raw errors?' },
      render: () => (
        <FormulaTerms
          reading="MSE = the average, over all n examples, of (prediction − truth) squared"
          formula={<><span>MSE</span><Op>=</Op><span className="frac"><span>1</span><span>n</span></span><span>Σ</span><span>(</span><T tone="mint">ŷᵢ</T><Op>−</Op><T tone="blue">yᵢ</T><span>)²</span></>}
          terms={[
            { symbol: 'ŷᵢ − yᵢ', name: 'Error on example i', meaning: 'Prediction minus truth · + too high, − too low', range: '−∞ … ∞', tone: 'coral' },
            { symbol: '( )²', name: 'Square', meaning: 'Removes the sign · big misses count much more', range: '≥ 0', tone: 'violet' },
            { symbol: 'Σ', name: 'Sum', meaning: 'Add the squared errors over every example', tone: 'blue' },
            { symbol: '1/n', name: 'Average', meaning: 'Divide by the number of examples', range: 'n = 3 here', tone: 'yellow' },
            { symbol: 'MSE', name: 'Loss', meaning: 'One number for the whole dataset · 0 = perfect', range: '0 … ∞', tone: 'mint' },
          ]}
        />
      ),
    },
    {
      id: 's3-mse-steps',
      section: 'A · The neuron',
      kicker: 'MSE · worked',
      title: 'With w = 1 the neuron misses by 1, 2 and 3 minutes → MSE 4.67',
      notes: { time: '2 min', say: 'Same delivery data. w = 1 is too small, so every prediction is too low. Predict, subtract, square, average.', ask: 'Which single delivery contributes most to the loss?' },
      render: () => (
        <FormulaSteps
          given={['w = 1, b = 5', 'x = 1, 2, 3 km', 'y = 7, 9, 11 min']}
          steps={[
            { math: <>ŷ = 1·x + 5 = 6, 7, 8</>, note: 'predict' },
            { math: <>ŷ − y = −1, −2, −3</>, note: 'all too low' },
            { math: <>(ŷ − y)² = 1, 4, 9</>, note: 'square · the biggest miss dominates' },
            { math: <>(1 + 4 + 9) / 3 = 14 / 3</>, note: 'average over n = 3' },
          ]}
          result={<>MSE = 4.67</>}
        />
      ),
    },
    {
      id: 's3-gradient',
      section: 'A · The neuron',
      kicker: 'The gradient · term by term',
      title: 'The gradient says how MSE changes when w grows',
      notes: { time: '3 min', say: 'Chain rule in plain words: how the loss changes with the prediction, times how the prediction changes with w. The square gives 2 × error. ŷ = wx + b gives x. Average over the examples. The sign tells direction, the size tells steepness.', ask: 'If every error were 0, what would the gradient be?' },
      render: () => (
        <FormulaTerms
          reading="chain rule: (how MSE changes with ŷ) × (how ŷ changes with w), averaged"
          cols={2}
          formula={<><span className="frac"><span>∂MSE</span><span>∂<T tone="violet">w</T></span></span><Op>=</Op><span className="frac"><span>2</span><span>n</span></span><span>Σ</span><span>(</span><T tone="mint">ŷᵢ</T><Op>−</Op><T tone="blue">yᵢ</T><span>) ·</span><T tone="blue">xᵢ</T></>}
          terms={[
            { symbol: '∂MSE/∂w', name: 'Gradient', meaning: 'How fast MSE changes if w grows a little', range: '− grow w · + shrink w', tone: 'violet' },
            { symbol: '2(ŷᵢ − yᵢ)', name: 'From the square', meaning: 'Derivative of error² is 2 × error', tone: 'coral' },
            { symbol: 'xᵢ', name: 'From ŷ = wx + b', meaning: 'Nudge w by 1 → ŷ moves by x', tone: 'blue' },
            { symbol: '(1/n) Σ', name: 'Average', meaning: 'Average the product over all examples', tone: 'yellow' },
          ]}
        />
      ),
    },
    {
      id: 's3-gradient-steps',
      section: 'A · The neuron',
      kicker: 'The gradient · worked',
      title: 'The gradient is −9.33: growing w will lower the loss',
      notes: { time: '2 min', say: 'Reuse the errors from the MSE slide. Multiply each by its input, add, scale by 2/n. Negative means the loss falls if w grows — which matches our intuition that w = 1 is too small.', ask: 'Which example pushes w hardest, and why?' },
      render: () => (
        <FormulaSteps
          given={['errors = −1, −2, −3', 'x = 1, 2, 3', 'n = 3']}
          steps={[
            { math: <>error × x = −1, −4, −9</>, note: 'each example’s pull on w' },
            { math: <>sum = −14</>, note: 'add them' },
            { math: <>(2 / 3) × (−14)</>, note: 'the 2 from the square · average over 3' },
          ]}
          result={<>∂MSE/∂w = −9.33 · negative → grow w</>}
        />
      ),
    },
    {
      id: 's3-learning-step',
      section: 'A · The neuron',
      kicker: 'How learning moves a weight',
      title: 'Learning = step each weight against its gradient',
      notes: {
        time: '3 min',
        say: 'You tuned w by hand. Learning does it with one rule. The gradient says how the loss changes if w grows: here −9.33, so growing w lowers the loss. Multiply by a small learning rate (0.1) and step the other way: w goes 1 → 1.93 and MSE drops from 4.67 to 0.02 in one step. Keep b = 5 fixed for this example.',
        ask: 'If the gradient were +9.33, which way would w move?',
      },
      render: () => (
        <Stack gap="lg">
          <Equation size="md" reading="sign of the gradient = which way · learning rate × size = how far">
            <T tone="violet">w</T><Op>←</Op><T tone="violet">w</T><Op>−</Op><T tone="yellow">lr</T><Op>×</Op><span>gradient</span>
          </Equation>
          <Flow nodes={[
            { label: 'start', value: 'w = 1', tone: 'violet', note: 'MSE 4.67' }, { op: '→' },
            { label: 'gradient', value: '−9.33', tone: 'coral', note: 'loss falls if w grows' }, { op: '→' },
            { label: 'step · lr 0.1', value: '+0.93', tone: 'yellow', note: '−0.1 × (−9.33)' }, { op: '→' },
            { label: 'after one step', value: 'w = 1.93', tone: 'mint', note: 'MSE 0.02' },
          ]} />
          <Takeaway>Repeat this step and the loss keeps falling. <b>Backprop</b> (Part D) is how we find the gradient for weights buried deep inside a network.</Takeaway>
        </Stack>
      ),
    },
    {
      id: 's3-lab-p1',
      section: 'A · The neuron',
      kicker: 'Lab demo',
      title: 'Lab P1: watch one neuron discover w = 2 by itself',
      notes: {
        time: '8 min demo · 45 min lab',
        say: 'Project the notebook and run Parts 1–5 live. Pause on the one-step cell: it is exactly the slide we just did (gradient −9.33 → w 1.93, loss 0.021). Then let the loop run and read the weight column out loud.',
        ask: 'Why does the weight barely move after step 4?',
      },
      render: () => (
        <LabDemo
          notebook="lab-p1-the-learning-neuron.ipynb"
          minutes={45}
          goal="A single neuron learns w = 2 from three deliveries — pure Python, no libraries."
          steps={[
            'Parts 1–2: predictions and MSE — w = 1 gives loss 4.67',
            'Part 3: nudge w to estimate the gradient → −9.29',
            'Part 4: one step with lr 0.1 → w = 1.93, loss 0.021',
            'Part 5: run the 20-step training loop',
          ]}
          watch={[
            'w: 1.00 → 1.93 → 1.995 → 1.9995 by step 4',
            'Loss 4.67 → 0.000001 — and x = 10 predicts 24.99, never seen',
            'Experiment 2: lr 0.3 diverges — w jumps 3.80 → −1.24 → 7.83',
          ]}
          yourTurn="Experiment 3: learn w and b from w = 0.5, b = 1 (lr 0.01). Why is it still off after 200 steps?"
        />
      ),
    },

    /* ------------------------------------------------------------ Part B */
    {
      id: 's3-predict-curve',
      section: 'B · One is not enough',
      kicker: 'Predict',
      title: 'What happens when the data curves?',
      reveal: true,
      notes: {
        time: '2 min',
        say: 'Data: x = −2…2, y = x². Ask learners to sketch the best straight line before revealing.',
        ask: 'What is the best a straight line can do on a U shape?',
      },
      render: ({ revealed }) => (
        <Split ratio="1fr 1.25fr" left={
          <Plot ariaLabel="Five data points forming a U shape" x={[-2.5, 2.5]} y={[-0.5, 4.8]} xTicks={[-2, -1, 0, 1, 2]} yTicks={[0, 1, 2, 3, 4]} xLabel="x" yLabel="y" height={280}
            lines={revealed ? [{ f: () => 2, color: VIOLET, label: 'ŷ = 2' }] : []}
            points={[-2, -1, 0, 1, 2].map((x) => ({ at: [x, x * x] as [number, number], color: BLUE, r: 8 }))} />
        } right={<Predict
          revealed={revealed}
          question="The best straight line — and its lowest loss?"
          facts={['y = x² at x = −2…2 → 4, 1, 0, 1, 4']}
          answer={<Answer verdict="A flat line: ŷ = 2" points={['It predicts the average every time', <>MSE = (4 + 1 + 4 + 1 + 4) / 5 = <b>2.8</b></>, <>More training never lowers it — a line <b>cannot bend</b></>]} />}
        />} />
      ),
    },
    {
      id: 's3-line-fails',
      section: 'B · One is not enough',
      kicker: 'The limit of a line',
      title: 'A single neuron can only draw straight lines',
      notes: {
        time: '2 min',
        say: 'The flat line is the best any w and b can do — every red dashed error stays. More epochs do not help; the problem is the shape of the model, not training time.',
        ask: 'Is this a training problem or a capacity problem?',
      },
      render: () => (
        <Split ratio="1.5fr 1fr" left={
          <Plot ariaLabel="Five points on a U shape with the best straight line y equals 2" x={[-2.5, 2.5]} y={[-0.5, 4.8]} xTicks={[-2, -1, 0, 1, 2]} yTicks={[0, 1, 2, 3, 4]}
            xLabel="x" yLabel="y" height={330}
            lines={[{ f: (x) => x * x, color: MINT, dash: true, label: 'true: x²' }, { f: () => 2, color: VIOLET, label: 'best line' }]}
            points={[-2, -1, 0, 1, 2].map((x) => ({ at: [x, x * x] as [number, number], color: BLUE }))}
          >
            {(sx, sy) => [-2, -1, 0, 1, 2].map((x) => <line key={x} x1={sx(x)} x2={sx(x)} y1={sy(x * x)} y2={sy(2)} stroke={CORAL} strokeWidth="2.5" strokeDasharray="4 4" />)}
          </Plot>
        } right={
          <Stack gap="md">
            <Code code={`x = [-2, -1, 0, 1, 2]
y = [ 4,  1, 0, 1, 4]   # U-shaped!

# best a line can do: predict 2
# loss = 2.8 — never improves`} marks={{ 4: 'coral', 5: 'coral' }} />
            <Takeaway tone="coral">The model can't bend. We need a different shape, not more epochs.</Takeaway>
          </Stack>
        } />
      ),
    },
    {
      id: 's3-collapse',
      section: 'B · One is not enough',
      kicker: 'Tempting fix',
      title: 'Stacking linear layers still gives one line',
      notes: {
        time: '2 min',
        say: 'Substitute layer 1 into layer 2 on the board: 3(2x + 1) + 4 = 6x + 7. However many linear layers you stack, the algebra collapses them into one.',
        ask: 'If we stacked 100 linear layers, what shape would we get?',
      },
      render: () => (
        <Stack gap="lg">
          <Flow size="lg" nodes={[
            { label: 'layer 1', value: 'h = 2x + 1', tone: 'blue' }, { op: '→' },
            { label: 'layer 2', value: 'y = 3h + 4', tone: 'violet' }, { op: '=' },
            { label: 'combined', value: 'y = 6x + 7', tone: 'coral', note: 'STILL A LINE' },
          ]} />
          <Equation size="md" reading="substitute h into layer 2 — the two layers collapse into one">
            <span>y</span><Op>=</Op><span>3(2x + 1) + 4</span><Op>=</Op><T tone="coral">6x + 7</T>
          </Equation>
        </Stack>
      ),
    },
    {
      id: 's3-relu',
      section: 'B · One is not enough',
      kicker: 'The fix',
      title: 'ReLU blocks negatives and passes positives',
      notes: {
        time: '2 min',
        say: 'ReLU is the simplest bend there is: below zero → 0, above zero → unchanged. Read the table rows, including ReLU(0) = 0.',
        ask: 'What is ReLU(−3)? ReLU(5)?',
      },
      render: () => (
        <Split ratio="1fr 1.15fr" left={
          <Stack gap="md">
            <Equation size="lg"><span>ReLU(z)</span><Op>=</Op><span>max(0, z)</span></Equation>
            <Table compact align={['right', 'right', 'left']} headers={['Input z', 'ReLU(z)', '']} rows={[
              ['−3', '0', 'blocked'], ['−1', '0', 'blocked'], ['0', '0', ''], ['2', '2', 'passes through'], ['5', '5', 'passes through'],
            ]} highlight={[3, 4]} />
          </Stack>
        } right={
          <Plot ariaLabel="ReLU: zero for negative inputs, identity for positive inputs" x={[-5, 5]} y={[-1, 5]} xTicks={[-4, -2, 0, 2, 4]} yTicks={[0, 1, 2, 3, 4, 5]}
            xLabel="input z" yLabel="ReLU(z)" height={330}
            lines={[{ f: relu, color: YELLOW, label: 'ReLU' }]}
            points={[-3, -1, 0, 2, 5].map((z) => ({ at: [z, relu(z)] as [number, number], color: z > 0 ? MINT : CORAL }))}
          />
        } />
      ),
    },
    {
      id: 's3-bend',
      section: 'B · One is not enough',
      kicker: 'Why it works',
      title: 'The bend at zero stops layers from collapsing',
      notes: {
        time: '2 min',
        say: 'Put ReLU between the linear layers and the algebra no longer collapses — the kink at zero survives. That is what makes a network "deep" in a useful sense.',
        ask: 'Where exactly is the nonlinearity in ReLU?',
      },
      render: () => (
        <>
          <Versus
            left={{ tag: 'Without ReLU', tone: 'coral', title: 'Collapses to a line', body: <>
              <div className="s3-pipe"><span>Linear</span><b>→</b><span>Linear</span><b>=</b><span>line</span></div>
              <Plot ariaLabel="Two stacked linear layers give the straight line 6x plus 7" x={[-2, 2]} y={[-6, 20]} xTicks={[-2, -1, 0, 1, 2]} yTicks={[-5, 0, 5, 10, 15, 20]} height={210}
                lines={[{ f: (x) => 6 * x + 7, color: CORAL, label: '6x + 7' }]} />
            </> }}
            right={{ tag: 'With ReLU', tone: 'mint', title: 'Can bend', body: <>
              <div className="s3-pipe"><span>Linear</span><b>→</b><span className="relu">ReLU</span><b>→</b><span>Linear</span><b>=</b><span>bends!</span></div>
              <Plot ariaLabel="Two ReLU units combine into the V shape absolute value of x" x={[-2, 2]} y={[0, 2.2]} xTicks={[-2, -1, 0, 1, 2]} yTicks={[0, 1, 2]} height={210}
                lines={[{ f: (x) => Math.abs(x), color: MINT, label: '|x|' }]} />
            </> }}
          />
          <Takeaway><span>The <b>bend at zero</b> is the nonlinearity. Placed between layers, it is what makes depth worth having.</span></Takeaway>
        </>
      ),
    },

    /* ------------------------------------------------------------ Part C */
    {
      id: 's3-hidden-net',
      section: 'C · Hidden layers',
      kicker: 'The architecture',
      title: 'Hidden neurons sit between input and output',
      notes: {
        time: '2 min',
        say: 'Two hidden neurons, each with its own weight and a ReLU. Note w₂ = −1: the second neuron looks at the input flipped. Then one output neuron adds them with v₁ and v₂.',
        ask: 'Why might it help that one hidden weight is negative?',
      },
      render: () => <figure className="s3-figure"><HiddenNet /></figure>,
    },
    {
      id: 's3-trace-x3',
      section: 'C · Hidden layers',
      kicker: 'Worked example · x = 3',
      title: 'Follow x = 3: one neuron fires, one is blocked',
      notes: {
        time: '2 min',
        say: 'Go branch by branch. Left: 1 × 3 = 3, ReLU keeps it. Right: −1 × 3 = −3, ReLU blocks it. The output adds them: 3 + 0 = 3.',
        ask: 'What would change if x were −3 instead?',
      },
      render: () => (
        <Stack gap="md">
          <div className="s3-branches">
            <div className="s3-branch">
              <small>Hidden neuron 1 · w₁ = 1</small>
              <div className="s3-branch-row"><b>multiply</b><span>z₁ = 1 × 3 = 3</span></div>
              <div className="s3-branch-row on"><b>ReLU</b><span>h₁ = max(0, 3) = 3 · ON</span></div>
            </div>
            <div className="s3-branch">
              <small>Hidden neuron 2 · w₂ = −1</small>
              <div className="s3-branch-row"><b>multiply</b><span>z₂ = −1 × 3 = −3</span></div>
              <div className="s3-branch-row off"><b>ReLU</b><span>h₂ = max(0, −3) = 0 · OFF</span></div>
            </div>
          </div>
          <div className="s3-sum">ŷ = v₁·h₁ + v₂·h₂ = 1·3 + 1·0 = 3</div>
        </Stack>
      ),
    },
    {
      id: 's3-abs-table',
      section: 'C · Hidden layers',
      kicker: 'Run it for five inputs',
      title: 'Two ReLU neurons produce |x| — a V a line cannot make',
      notes: {
        time: '2 min',
        say: 'Same network, five inputs. Negative x lights up h₂, positive x lights up h₁. The output is the absolute value — a V shape, impossible for one linear neuron.',
        ask: 'Which hidden neuron is "in charge" for negative inputs?',
      },
      render: () => (
        <Split ratio="1.25fr 1fr" left={
          <Code title="hidden_layer.py" code={`def relu(z):
    return max(0.0, z)

w1, w2 = 1.0, -1.0
v1, v2 = 1.0, 1.0

for x in [-3.0, -1.0, 0.0, 1.0, 3.0]:
    h1 = relu(w1 * x)
    h2 = relu(w2 * x)
    prediction = v1 * h1 + v2 * h2
    print(f"x={x:4.0f}  h1={h1:.0f} h2={h2:.0f}  y={prediction:.0f}")`} marks={{ 8: 'mint', 9: 'mint', 10: 'yellow' }} />
        } right={
          <Stack gap="md">
            <Output>{`x=  -3  h1=0 h2=3  y=3
x=  -1  h1=0 h2=1  y=1
x=   0  h1=0 h2=0  y=0
x=   1  h1=1 h2=0  y=1
x=   3  h1=3 h2=0  y=3`}</Output>
            <Takeaway tone="mint">The output is |x| — impossible with one linear neuron.</Takeaway>
          </Stack>
        } />
      ),
    },
    {
      id: 's3-hidden-lab',
      section: 'C · Hidden layers',
      kicker: 'Live',
      title: 'Slide x across zero and watch the gates switch',
      lab: true,
      notes: {
        time: '3 min',
        say: 'Drag x from −4 to 4 slowly. Watch which gate is green. At exactly 0 both are off and the output is 0 — the tip of the V.',
        ask: 'Is there any x where both neurons are on at the same time?',
      },
      render: () => <HiddenLayerLab />,
    },

    /* ------------------------------------------------------------ Part D */
    {
      id: 's3-blame',
      section: 'D · Backpropagation',
      kicker: 'The learning question',
      title: 'How does the error reach a hidden weight?',
      notes: {
        time: '2 min',
        say: 'The output is wrong by 2. The output weight v is right next to the error — but w is buried inside. Backpropagation answers: pass the blame backward, one connection at a time.',
        ask: 'Who deserves more blame for the error: v or w?',
      },
      render: () => (
        <Stack gap="lg">
          <Flow size="sm" nodes={[
            { label: 'input', value: 'x = 2', tone: 'blue' }, { op: '— w = 1 →' },
            { label: 'sum', value: 'z = 2', tone: 'violet' }, { op: '— ReLU →' },
            { label: 'hidden', value: 'h = 2', tone: 'mint' }, { op: '— v = 1 →' },
            { label: 'output', value: 'y = 2', tone: 'mint' }, { op: 'vs' },
            { label: 'target 4', value: 'loss = 4', tone: 'coral' },
          ]} />
          <Takeaway>The prediction is wrong. <b>v</b> sits next to the error, <b>w</b> is buried inside — pass the blame backward, one connection at a time.</Takeaway>
        </Stack>
      ),
    },
    {
      id: 's3-chain-rule',
      section: 'D · Backpropagation',
      kicker: 'The chain rule · term by term',
      title: 'Blame reaches w as a product: one local factor per connection',
      notes: { time: '3 min', say: 'Read right to left through the network: output blame, times v, times the ReLU gate, times x. Each factor is a local question: if this input moves a little, how much does this output move? The ReLU factor is either 1 (open) or 0 (closed) — that is the gate.', ask: 'Which factor turns the whole gradient into 0 when z is negative?' },
      render: () => (
        <>
          <FormulaTerms
            reading="output blame × one local derivative per connection on the way back"
            cols={2}
            formula={<><span className="frac"><span>∂L</span><span>∂<T tone="violet">w</T></span></span><Op>=</Op><span className="frac"><span>∂L</span><span>∂y</span></span><Op>·</Op><span className="frac"><span>∂y</span><span>∂h</span></span><Op>·</Op><span className="frac"><span>∂h</span><span>∂z</span></span><Op>·</Op><span className="frac"><span>∂z</span><span>∂<T tone="violet">w</T></span></span></>}
            terms={[
              { symbol: '∂L/∂y', name: 'Blame at the output', meaning: 'L = (y − target)² → 2(y − target) = 2(2 − 4)', range: '= −4', tone: 'coral' },
              { symbol: '∂y/∂h', name: 'Through the output weight', meaning: 'y = v·h → nudging h moves y by v', range: '= v = 1', tone: 'violet' },
              { symbol: '∂h/∂z', name: 'The ReLU gate', meaning: 'ReLU′(z) = 1 if z > 0 (open) · 0 if z ≤ 0 (closed)', range: '= 1', tone: 'yellow' },
              { symbol: '∂z/∂w', name: 'Through the input weight', meaning: 'z = w·x → nudging w moves z by x', range: '= x = 2', tone: 'blue' },
            ]}
          />
          <Takeaway>−4 × 1 × 1 × 2 = <b>−8</b> — exactly step 6 in the table that follows.</Takeaway>
        </>
      ),
    },
    {
      id: 's3-backprop-table',
      section: 'D · Backpropagation',
      kicker: 'Eight steps · learning rate 0.01',
      title: 'Backprop: blame flows back, then both weights move',
      notes: {
        time: '3 min',
        say: 'Rows 2–6 move right-to-left through the network. Each step multiplies the blame by one local value. In step 7 BOTH weights are updated — that is why the loss in step 8 drops to 2.78. Updating w alone would only reach 3.39.',
        ask: 'Why do both gradients come out as −8 here?',
      },
      render: () => (
        <Table
          compact
          headers={['Step', 'What', 'Calculation']}
          align={['right', 'left', 'left']}
          rows={[
            ['1', 'Forward pass', 'z = 2, h = 2, y = 2, loss = (2 − 4)² = 4'],
            ['2', 'How wrong?', 'blame = 2 × (2 − 4) = −4'],
            ['3', 'Output weight gradient', 'grad_v = blame × h = −4 × 2 = −8'],
            ['4', 'Pass blame to h', 'blame_at_h = blame × v = −4 × 1 = −4'],
            ['5', 'Through ReLU?', 'z = 2 > 0 → gate OPEN → blame passes'],
            ['6', 'Hidden weight gradient', 'grad_w = blame_at_h × x = −4 × 2 = −8'],
            ['7', 'Update both weights', 'v = 1 − 0.01 × (−8) = 1.08 · w = 1 − 0.01 × (−8) = 1.08'],
            ['8', 'Check', 'y = 1.08 × (1.08 × 2) = 2.3328 → loss ≈ 2.78 (was 4.0)'],
          ]}
          highlight={[6, 7]}
        />
      ),
    },
    {
      id: 's3-backprop-lab',
      section: 'D · Backpropagation',
      kicker: 'Step through it',
      title: 'Walk the blame backward, one connection at a time',
      lab: true,
      notes: {
        time: '4 min',
        say: 'Press Next for each step and say the multiplication out loud before the panel shows it. Coral = backward (blame), blue = forward or update.',
        ask: 'At step 5, what would happen if z had been −2?',
      },
      render: () => <BackpropLab />,
    },
    {
      id: 's3-dead-relu',
      section: 'D · Backpropagation',
      kicker: 'A closed gate',
      title: 'A blocked ReLU also blocks the blame',
      notes: {
        time: '2 min',
        say: 'If z was negative on the forward pass, ReLU output 0 and its slope is 0 — so no blame gets through backward. A neuron that is negative for every input stops learning: a dead ReLU. GAN discriminators use LeakyReLU, which keeps a small slope (0.2) for negatives.',
        ask: 'Why would a Discriminator especially want every neuron to keep learning?',
      },
      render: () => (
        <Split ratio="1fr 1fr" left={
          <Cards cols={1} items={[
            { tag: 'Forward', tone: 'coral', title: 'z < 0 → output 0', body: 'The gate is closed for this input.' },
            { tag: 'Backward', tone: 'coral', title: 'slope 0 → blame × 0 = 0', body: 'Weights before the gate get no update from this example.' },
            { tag: 'GAN fix', tone: 'mint', title: 'LeakyReLU keeps a small path open', body: 'Negative inputs pass with slope 0.2, so gradients keep flowing.' },
          ]} />
        } right={
          <Plot ariaLabel="ReLU is flat below zero; LeakyReLU has slope 0.2 below zero" x={[-5, 5]} y={[-1.5, 5]} xTicks={[-4, -2, 0, 2, 4]} yTicks={[-1, 0, 1, 2, 3, 4, 5]}
            xLabel="input z" yLabel="output" height={340}
            lines={[{ f: relu, color: CORAL, width: 5 }, { f: (z) => (z > 0 ? z : 0.2 * z), color: MINT, dash: true }]}
          >
            {(sx, sy) => (
              <g className="s3-legend">
                <text x={sx(-4.8)} y={sy(0.45)} fill={CORAL}>ReLU · slope 0 here</text>
                <text x={sx(-4.8)} y={sy(-1.25)} fill={MINT}>LeakyReLU · slope 0.2</text>
              </g>
            )}
          </Plot>
        } />
      ),
    },
    {
      id: 's3-lab-p2',
      section: 'D · Backpropagation',
      kicker: 'Lab demo',
      title: 'Lab P2: write backprop by hand — and meet a dead ReLU',
      notes: {
        time: '10 min demo · 60 min lab',
        say: 'Run Parts 1–4 live: the stuck single neuron, the two forward traces, one backward pass. Then Part 5. The saved run with random.seed(42) does NOT learn |x|: loss sticks at 2.00 because hidden neuron 1 died (w1 ≈ −0.005). The notebook text claims success — point out the printout disagrees. Change the seed to 1 and rerun: loss goes to 0. In our check, 14 of seeds 0–19 got stuck.',
        ask: 'Why can a dead hidden neuron never recover on its own?',
      },
      render: () => (
        <LabDemo
          notebook="lab-p2-hidden-layers-and-backprop.ipynb"
          minutes={60}
          goal="A 1 → 2 → 1 ReLU network: forward pass and backprop written by hand, trained on y = |x|."
          steps={[
            'Part 1: one neuron on |x| is stuck at loss 1.06 — a flat line',
            'Part 3: trace x = 3 and x = −3 — one gate on, one blocked',
            'Part 4: one backward pass at x = 2 → grad_w1 = −3.84, grad_v1 = −2.40, blocked side 0',
            'Part 5: train 500 epochs with lr 0.01',
          ]}
          watch={[
            'random.seed(42): loss sticks at 2.00 and x > 0 predicts 0',
            'Cause: w1 ≈ −0.005, so neuron 1 is off for every input — a dead ReLU',
            'random.seed(1): loss → 0 and |x| is learned exactly',
          ]}
          yourTurn="Find two seeds that learn and two that die. What do the dead runs have in common?"
        />
      ),
    },
    {
      id: 's3-so-far',
      section: 'D · Backpropagation',
      kicker: 'So far',
      title: 'Four pieces of a network, each with one job',
      notes: {
        time: '2 min',
        say: 'Mid-session checkpoint. Read each row and ask someone to give the one-word job before you point to it.',
        ask: 'Which of these four would you remove first, and what would break?',
      },
      render: () => (
        <Mapping leftLabel="Piece" rightLabel="Its one job" rows={[
          [<><b>Neuron</b> · ŷ = wx + b</>, 'Turns an input into a prediction with two learnable numbers'],
          [<><b>ReLU</b> · max(0, z)</>, 'Adds a bend so layers do not collapse into one line'],
          [<><b>Hidden layer</b></>, 'Builds intermediate features — like the two halves of |x|'],
          [<><b>Backprop</b></>, 'Passes blame backward to compute every weight\'s gradient'],
        ]} />
      ),
    },

    /* ------------------------------------------------------------ Part E */
    {
      id: 's3-sigmoid',
      section: 'E · Sigmoid + BCE',
      kicker: 'The Discriminator\'s last layer',
      title: 'Sigmoid squashes any score into a probability',
      notes: {
        time: '2 min',
        say: 'D must answer "real or fake?" as a probability between 0 and 1. Sigmoid takes any number — negative, huge, anything — and squashes it into (0, 1). Zero maps to exactly 0.5: "can\'t tell".',
        ask: 'What score would make D 99% sure the image is real?',
      },
      render: () => (
        <Split ratio="1fr 1.1fr" left={
          <Stack gap="md">
            <Equation size="lg">
              <span>σ(z)</span><Op>=</Op><span className="frac"><span>1</span><span>1 + e<sup>−z</sup></span></span>
            </Equation>
            <Table compact align={['right', 'right', 'left']} headers={['z', 'σ(z)', 'D means']} rows={[
              ['−5', '0.0067', 'almost certainly fake'],
              ['−2', '0.1192', 'probably fake'],
              ['0', '0.5000', "can't tell"],
              ['2', '0.8808', 'probably real'],
              ['5', '0.9933', 'almost certainly real'],
            ]} highlight={[2]} />
          </Stack>
        } right={
          <Plot ariaLabel="Sigmoid curve from 0 to 1 crossing 0.5 at zero" x={[-6, 6]} y={[0, 1]} xTicks={[-6, -4, -2, 0, 2, 4, 6]} yTicks={[0, 0.25, 0.5, 0.75, 1]}
            xLabel="score z" yLabel="σ(z)" height={340} marks={[{ y: 0.5, label: '0.5' }]}
            lines={[{ f: sigmoid, color: BLUE, label: 'sigmoid' }]}
            points={[-5, -2, 0, 2, 5].map((z) => ({ at: [z, sigmoid(z)] as [number, number], color: VIOLET }))}
          />
        } />
      ),
    },
    {
      id: 's3-sigmoid-terms',
      section: 'E · Sigmoid + BCE',
      kicker: 'Sigmoid · term by term',
      title: 'Sigmoid can never leave (0, 1): 1 divided by something above 1',
      notes: { time: '2 min', say: 'Build it inside out. e to any power is positive. Add 1 and the denominator is always above 1. One over a number above 1 lands between 0 and 1. At z = 0, e⁰ = 1, so σ = 1/2.', ask: 'What happens to e^−z when z is a huge positive number?' },
      render: () => (
        <FormulaTerms
          reading="sigma of z = one over (one plus e to the minus z)"
          formula={<><span>σ(</span><T tone="blue">z</T><span>)</span><Op>=</Op><span className="frac"><span>1</span><span>1 + e<sup>−z</sup></span></span></>}
          terms={[
            { symbol: 'z', name: 'Score (logit)', meaning: 'Raw output of the last Linear layer · any number', range: '−∞ … ∞', tone: 'blue' },
            { symbol: 'e⁻ᶻ', name: 'Exponential', meaning: 'Always positive · huge when z ≪ 0, tiny when z ≫ 0', range: '0 … ∞', tone: 'violet' },
            { symbol: '1 + e⁻ᶻ', name: 'Denominator', meaning: 'Always above 1', range: '1 … ∞', tone: 'yellow' },
            { symbol: '1 / ( )', name: 'Flip', meaning: '1 over a number above 1 lands between 0 and 1', range: '0 … 1', tone: 'mint' },
            { symbol: 'σ(0)', name: 'Midpoint', meaning: 'e⁰ = 1 → 1 / 2 = 0.5 · “can’t tell”', range: '0.5', tone: 'coral' },
          ]}
        />
      ),
    },
    {
      id: 's3-sigmoid-steps',
      section: 'E · Sigmoid + BCE',
      kicker: 'Sigmoid · worked',
      title: 'A score of 2 becomes 0.88: “probably real”',
      notes: { time: '1 min', say: 'Three operations: exponentiate, add 1, flip. Check it against the table row for z = 2.', ask: 'Without calculating, is σ(−2) above or below 0.5?' },
      render: () => (
        <FormulaSteps
          given={['z = 2 · D’s raw score']}
          steps={[
            { math: <>e<sup>−2</sup> = 0.135</>, note: 'small, because z is positive' },
            { math: <>1 + 0.135 = 1.135</>, note: 'denominator · just above 1' },
            { math: <>1 / 1.135</>, note: 'flip' },
          ]}
          result={<>σ(2) = 0.881 · probably real</>}
        />
      ),
    },
    {
      id: 's3-relu-vs-sigmoid',
      section: 'E · Sigmoid + BCE',
      kicker: 'Two activations, two places',
      title: 'ReLU lives inside; Sigmoid sits at the output',
      notes: {
        time: '1 min',
        say: 'Different jobs. ReLU adds nonlinearity in hidden layers. Sigmoid produces a probability at the output of a classifier — like D.',
        ask: 'Could we use Sigmoid in every hidden layer instead? What might go wrong?',
      },
      render: () => (
        <>
          <Table headers={['', 'ReLU', 'Sigmoid']} rows={[
            ['Output range', '0 to ∞', <b>0 to 1</b>],
            ['Used for', 'Hidden layers', <b>Output layer (classification)</b>],
            ['Purpose', 'Add nonlinearity', <b>Produce a probability</b>],
          ]} />
          <Takeaway>In a GAN, the Discriminator ends in Sigmoid: its output is P(real).</Takeaway>
        </>
      ),
    },
    {
      id: 's3-predict-bce',
      section: 'E · Sigmoid + BCE',
      kicker: 'Predict',
      title: 'How hard should we punish a confident wrong answer?',
      reveal: true,
      notes: {
        time: '2 min',
        say: 'The image is real (target 1), but D says 0.01 — confidently wrong. Ask: MSE gives (1 − 0.01)²; what does BCE give? Reveal.',
        ask: 'Which loss would make D learn faster from this mistake?',
      },
      render: ({ revealed }) => (
        <Predict
          revealed={revealed}
          question={<>Will BCE be <b>smaller</b> — or <b>much bigger</b>?</>}
          facts={['Target = 1 (real)', 'D predicts p = 0.01', 'MSE = (1 − 0.01)² = 0.98', 'BCE = −ln(0.01) = ?']}
          answer={<Answer verdict="Much bigger: 4.61" points={[<>BCE <b>4.61</b> vs MSE <b>0.98</b> — almost 5× harsher</>, 'BCE punishes confident wrong answers hard', 'Exactly what a classifier (and D) needs']} />}
        />
      ),
    },
    {
      id: 's3-bce',
      section: 'E · Sigmoid + BCE',
      kicker: 'Binary cross-entropy',
      title: 'BCE picks one log term depending on the label',
      notes: {
        time: '2 min',
        say: 'Only one term is ever active. If y = 1 the loss is −log p: push p toward 1. If y = 0 the loss is −log(1 − p): push p toward 0.',
        ask: 'If y = 0 and p = 0, what is the loss?',
      },
      render: () => (
        <Stack gap="lg">
          <Equation size="md" reading="y = target label (1 real, 0 fake) · p = D's prediction (0 to 1)">
            <span>BCE</span><Op>=</Op><span>−[ <T tone="mint">y</T> · log(p) + (1 − <T tone="coral">y</T>) · log(1 − p) ]</span>
          </Equation>
          <Cards cols={2} items={[
            { tag: 'When y = 1 (real)', tone: 'mint', title: 'BCE = −log(p)', body: 'Pushes p toward 1. At p = 0.01 → 4.61; at p = 0.99 → 0.01.' },
            { tag: 'When y = 0 (fake)', tone: 'coral', title: 'BCE = −log(1 − p)', body: 'Pushes p toward 0. At p = 0.8 → 1.61; at p = 0.01 → 0.01.' },
          ]} />
        </Stack>
      ),
    },
    {
      id: 's3-bce-steps',
      section: 'E · Sigmoid + BCE',
      kicker: 'BCE vs MSE · worked',
      title: 'One confident mistake costs 4.61 in BCE but only 0.98 in MSE',
      notes: { time: '2 min', say: 'The prediction slide revealed the numbers; here is the arithmetic. The label switches off the fake term, leaving −log p. log 0.01 is −4.6, so the loss is 4.6 — almost five times MSE’s 0.98, which can never exceed 1 for probabilities.', ask: 'What is the largest MSE can ever be when p and y are between 0 and 1?' },
      render: () => (
        <FormulaSteps
          given={['y = 1 · real', 'p = 0.01 · D says fake']}
          steps={[
            { math: <>−[ 1 · log 0.01 + 0 · log 0.99 ]</>, note: 'substitute · fake term off' },
            { math: <>−(−4.605) = 4.61</>, note: 'BCE' },
            { math: <>(1 − 0.01)² = 0.98</>, note: 'MSE on the same mistake' },
          ]}
          result={<>BCE ≈ 4.7 × MSE · confident mistakes hurt</>}
        />
      ),
    },
    {
      id: 's3-bce-lab',
      section: 'E · Sigmoid + BCE',
      kicker: 'Live',
      title: 'Drag D toward a confident mistake and compare penalties',
      lab: true,
      notes: {
        time: '3 min',
        say: 'Set target = 1, slide the logit to −5. MSE barely moves past 1; BCE climbs past 5. Then flip the target and repeat on the other side.',
        ask: 'Where on the curve are the two losses almost equal?',
      },
      render: () => <SigmoidBceLab />,
    },
    {
      id: 's3-gan-link',
      section: 'E · Sigmoid + BCE',
      kicker: 'Connect to GANs',
      title: 'Sigmoid + BCE is how D grades a fake',
      notes: {
        time: '2 min',
        say: 'D was fooled: it gave a fake image 0.8. With target 0, D’s loss is −ln(0.2) = 1.61 — “you were fooled”. G grades the same verdict with target 1: −ln(0.8) = 0.22 — small, because its fake worked. Same p, opposite targets.',
        ask: 'If D had said 0.1 instead, would the loss be bigger or smaller?',
      },
      render: () => (
        <Stack gap="lg">
          <Flow nodes={[
            { label: 'Generator', value: 'fake image', tone: 'mint' }, { op: '→' },
            { label: 'Discriminator', value: 'score', tone: 'coral' }, { op: '→' },
            { label: 'Sigmoid', value: 'p = 0.8', tone: 'blue' }, { op: '→' },
            { label: 'BCE · target 0', value: '−ln(1 − 0.8) = 1.61', tone: 'yellow', note: '"you were fooled!"' },
          ]} />
          <Cards cols={2} items={[
            { tag: 'D updates', tone: 'coral', title: 'Output lower p for fakes', body: 'Its loss falls when it calls fakes fake.' },
            { tag: 'G updates', tone: 'mint', title: 'Make fakes that get higher p', body: 'G’s loss uses target 1: −ln(0.8) = 0.22 — already small, D was fooled.' },
          ]} />
        </Stack>
      ),
    },
    {
      id: 's3-lab-p3',
      section: 'E · Sigmoid + BCE',
      kicker: 'Lab demo',
      title: 'Lab P3: a one-neuron classifier is a baby Discriminator',
      notes: {
        time: '8 min demo · 45 min lab',
        say: 'Run Parts 2–5 live. Stop on the gradient cell: with Sigmoid + BCE the gradient is just p − y. Then train and watch w grow — a bigger w means a steeper, more confident sigmoid. Finish on Part 7, where the same model is read as D(real) and D(fake).',
        ask: 'Which parameter moves the decision boundary, and which makes it sharper?',
      },
      render: () => (
        <LabDemo
          notebook="lab-p3-build-a-classifier.ipynb"
          minutes={45}
          goal="One neuron + Sigmoid + BCE separates negatives (0) from positives (1) — pure Python."
          steps={[
            'Part 2: the sigmoid table — σ(0) = 0.5, σ(5) = 0.9933',
            'Part 3: BCE for target 1 at p = 0.01 → 4.61',
            'Part 4: the Sigmoid + BCE gradient is simply p − y',
            'Part 5: train 200 epochs from w = 0.5, lr 0.1',
          ]}
          watch={[
            'Loss 0.284 → 0.0074 while w grows 0.75 → 3.82',
            '100% accuracy; x = −1 and +1 sit at 2.1% and 97.9%',
            'Part 7, read as D: D(3) = 1.0000, D(−3) = 0.0000',
          ]}
          yourTurn="Experiment 1: move the boundary to x = 2.5. Which parameter does the work?"
        />
      ),
    },

    /* ------------------------------------------------------------ Part F */
    {
      id: 's3-autograd',
      section: 'F · PyTorch',
      kicker: 'Automatic gradients',
      title: 'PyTorch computes every gradient with one call',
      notes: {
        time: '2 min',
        say: 'Same numbers as our backprop example — w = 1, x = 2, target 4 — on a single neuron. We derived −8 by hand; loss.backward() gives it instantly, for one weight or a million.',
        ask: 'What does requires_grad=True tell PyTorch?',
      },
      render: () => (
        <Split ratio="1.4fr 1fr" left={
          <Code title="autograd.py" code={`import torch

w = torch.tensor(1.0, requires_grad=True)
x = torch.tensor(2.0)
target = torch.tensor(4.0)

prediction = w * x
loss = (prediction - target) ** 2

loss.backward()         # ALL gradients, automatically!
print(f"gradient of w = {w.grad.item()}")`} marks={{ 3: 'violet', 10: 'yellow' }} notes={{ 3: 'track this tensor' }} />
        } right={
          <Stack gap="md">
            <Output>{'gradient of w = -8.0'}</Output>
            <Takeaway>By hand: 2 × (2 − 4) × 2 = −8. PyTorch agrees.</Takeaway>
          </Stack>
        } />
      ),
    },
    {
      id: 's3-sequential',
      section: 'F · PyTorch',
      kicker: 'Build a network',
      title: 'nn.Sequential stacks the layers you already know',
      notes: {
        time: '2 min',
        say: 'Read the code top to bottom and point at the matching box. Linear is our neuron, ReLU is our bend, Sigmoid our probability. This exact shape becomes D in Session 4.',
        ask: 'How many weights does Linear(1, 4) have? (4 weights + 4 biases)',
      },
      render: () => (
        <Stack gap="lg">
          <Code code={`import torch.nn as nn

model = nn.Sequential(
    nn.Linear(1, 4),      # 1 input -> 4 hidden neurons
    nn.ReLU(),            # activation
    nn.Linear(4, 1),      # 4 hidden -> 1 output
    nn.Sigmoid()          # squash to 0-1
)`} marks={{ 4: 'violet', 5: 'yellow', 6: 'violet', 7: 'blue' }} />
          <Flow size="sm" nodes={[
            { label: 'input', value: '1 number', tone: 'blue' }, { op: '→' },
            { label: 'Linear(1, 4)', value: '4 × (wx + b)', tone: 'violet' }, { op: '→' },
            { label: 'ReLU', value: 'bend', tone: 'yellow' }, { op: '→' },
            { label: 'Linear(4, 1)', value: 'combine', tone: 'violet' }, { op: '→' },
            { label: 'Sigmoid', value: 'p ∈ (0, 1)', tone: 'mint' },
          ]} />
        </Stack>
      ),
    },
    {
      id: 's3-three-lines',
      section: 'F · PyTorch',
      kicker: 'The training loop',
      title: 'Three lines replace everything we did by hand',
      notes: {
        time: '2 min',
        say: 'Map each line to the backprop table: backward() is steps 2–6, step() is step 7. zero_grad() exists because PyTorch adds gradients up — without clearing, last round\'s blame leaks into this round.',
        ask: 'What would happen if we forgot zero_grad()?',
      },
      render: () => (
        <Split ratio="1fr 1.2fr" left={
          <Code code={`optimizer.zero_grad()   # 1. clear old gradients
loss.backward()         # 2. calculate ALL gradients
optimizer.step()        # 3. update ALL weights`} marks={{ 1: 'coral', 2: 'yellow', 3: 'mint' }} />
        } right={
          <Table headers={['Line', 'What it does', 'What we did manually']} rows={[
            ['zero_grad()', 'Clears old gradients', '— (we started fresh each time)'],
            ['backward()', 'Backpropagation', 'Steps 2–6'],
            ['step()', 'w ← w − lr × gradient', 'Step 7 · the Part A rule'],
          ]} />
        } />
      ),
    },
    {
      id: 's3-classifier',
      section: 'F · PyTorch',
      kicker: 'Complete classifier',
      title: 'A full classifier: data, model, loss, optimizer, loop',
      notes: {
        time: '3 min',
        say: 'Negative inputs are class 0, positive are class 1. Every piece from today appears once. The loss shrinks toward zero; exact numbers depend on the random starting weights — in our checks across 20 random starts, epoch 200 landed between about 0.01 and 0.09 (most near 0.014).',
        ask: 'Which line is the Discriminator-shaped part we will reuse in Session 4?',
      },
      render: () => (
        <Split ratio="1.5fr 1fr" left={
          <Code title="classifier.py · full version in the lab notebook" code={`X = torch.tensor([[-3.], [-2.], [-1.], [1.], [2.], [3.]])
y = torch.tensor([[0.], [0.], [0.], [1.], [1.], [1.]])

model = nn.Sequential(nn.Linear(1, 4), nn.ReLU(),
                      nn.Linear(4, 1), nn.Sigmoid())
loss_fn = nn.BCELoss()
optimizer = torch.optim.SGD(model.parameters(), lr=0.1)

for epoch in range(1, 201):
    pred = model(X)
    loss = loss_fn(pred, y)
    optimizer.zero_grad()
    loss.backward()
    optimizer.step()`} marks={{ 4: 'violet', 5: 'violet', 6: 'coral', 12: 'yellow', 13: 'yellow', 14: 'yellow' }} />
        } right={
          <Stack gap="md">
            <Output title="TYPICAL RANGE · 20 RANDOM STARTS">{`Epoch   1: loss ≈ 0.5 – 1.0
Epoch  50: loss ≈ 0.05 – 0.37
Epoch 200: loss ≈ 0.01 – 0.09`}</Output>
            <Takeaway tone="mint">Your exact numbers will differ — the trend (down toward 0) will not.</Takeaway>
          </Stack>
        } />
      ),
    },
    {
      id: 's3-replaced',
      section: 'F · PyTorch',
      kicker: 'What PyTorch replaced',
      title: 'Every manual idea has a one-line PyTorch twin',
      notes: {
        time: '2 min',
        say: 'Read the table as a translation dictionary. Nothing in PyTorch is new — it automates what you already did by hand today.',
        ask: 'Which row saves you the most work?',
      },
      render: () => (
        <Mapping leftLabel="What you learned" rightLabel="PyTorch equivalent" rows={[
          ['y = w × x + b', <code>nn.Linear(1, 1)</code>],
          ['ReLU(z) = max(0, z)', <code>nn.ReLU()</code>],
          ['Sigmoid(z)', <code>nn.Sigmoid()</code>],
          ['BCE loss', <code>nn.BCELoss()</code>],
          ['Manual gradients (backprop)', <code>loss.backward()</code>],
          ['w = w − lr × grad', <code>optimizer.step()</code>],
        ]} />
      ),
    },
    {
      id: 's3-lab-00',
      section: 'F · PyTorch',
      kicker: 'Lab demo',
      title: 'Lab 00: everything from today, rewritten in PyTorch',
      notes: {
        time: '10 min demo · 45 min lab',
        say: 'Run Parts 2–4 and 7 live, mapping each to the hand-written labs: autograd gives −8.0 exactly like Part D; the 3-line loop replaces our update code. Part 6 introduces Adam — GANs almost always use it, and Session 4 will. End on Part 9: real MNIST batches, the data for Session 5.',
        ask: 'Which hand-written lab did the 3-line loop replace, line by line?',
      },
      render: () => (
        <LabDemo
          notebook="lab-00-intro-to-pytorch.ipynb"
          minutes={45}
          goal="Redo P1–P3 in PyTorch: tensors, autograd, nn.Sequential, the 3-line loop, Adam, MNIST."
          steps={[
            'Parts 2–3: tensors, then autograd on w · x → gradient −8.0',
            'Part 4: train y = 3x — w 0.5 → 3.0000 by epoch 50',
            'Parts 6–7: Adam (lr 0.05) + the 3-line loop on the ±x classifier',
            'Part 9: load MNIST — 60,000 images, 938 batches of 64',
          ]}
          watch={[
            'Classifier loss 0.596 → 0.0004 by epoch 50',
            'One batch is [64, 1, 28, 28] — 784 pixels per image',
            'Part 10: a 0-vs-1 MNIST classifier reaches 99.2% in one epoch',
          ]}
          yourTurn="Part 11: run the .detach() preview. Which tensor stops receiving gradients?"
        />
      ),
    },

    /* ------------------------------------------------------------ Check */
    {
      id: 's3-recap',
      section: 'Check',
      kicker: 'Session 3 recap',
      title: 'Everything inside G and D, in five sentences',
      notes: {
        time: '2 min',
        say: 'Rebuild the chain: neuron → bend → hidden layer → backprop → probability + loss → PyTorch.',
        ask: 'Explain backpropagation in one sentence without using the word "gradient".',
      },
      render: () => (
        <Recap items={[
          <>A neuron computes <b>ŷ = wx + b</b>; learning means finding w and b from data.</>,
          <>Linear layers stacked still make a line — <b>ReLU</b> adds the bend that makes depth useful.</>,
          <>Hidden neurons combine into shapes like |x| that one neuron cannot draw.</>,
          <><b>Backprop</b> passes blame backward; a closed ReLU blocks it, so GANs often use LeakyReLU.</>,
          <><b>Sigmoid + BCE</b> turn a score into a probability and punish confident mistakes — and PyTorch automates all of it.</>,
        ]} />
      ),
    },
    {
      id: 's3-quiz',
      section: 'Check',
      kicker: 'Knowledge check',
      title: 'Can you answer these without your notes?',
      reveal: true,
      notes: {
        time: '5 min',
        say: 'Give two minutes of silent thinking, then reveal. Spend time on 2 and 4 — they are the ones that matter most for GANs.',
        ask: 'Which answer surprised you?',
      },
      render: ({ revealed }) => (
        <Quiz revealed={revealed} cols={4} items={[
          { q: <>What is ŷ when w = 3, b = 2, x = 5?</>, a: '3 × 5 + 2 = 17.' },
          { q: 'Why can\'t stacking linear layers learn a curve?', a: 'They collapse into one linear function (e.g. 2x + 1 then 3h + 4 = 6x + 7).' },
          { q: 'ReLU(−3)? ReLU(5)?', a: '0 and 5.' },
          { q: 'In backprop, what happens when a ReLU gate is closed?', a: 'Its slope is 0, so no blame passes back — weights before it get no update from that example.' },
          { q: 'What range does Sigmoid output?', a: 'Between 0 and 1 (σ(0) = 0.5).' },
          { q: 'What does loss.backward() do?', a: 'Runs backpropagation: computes the gradient of the loss for every parameter.' },
          { q: 'The 3 lines of the PyTorch training loop?', a: 'optimizer.zero_grad() · loss.backward() · optimizer.step()' },
          { q: 'Why did both v and w need updating for loss to reach 2.78?', a: 'Updating w alone gives y = 2.16 → loss 3.39; with v too, y = 2.33 → 2.78.' },
        ]} />
      ),
    },
    {
      id: 's3-bridge',
      section: 'Check',
      kicker: 'Next',
      title: 'We have every part — now build G and D',
      layout: 'bridge',
      notes: {
        time: '1 min',
        say: 'Generator = Linear, ReLU, Linear. Discriminator = Linear, ReLU, Linear, Sigmoid. You have seen every piece. After the break we put them in a ring and let them fight.',
        ask: 'Which of today\'s pieces will the Generator NOT need?',
      },
      render: () => <Bridge done="Session 3 · complete" question="We have every part — now build G and D and let them compete." next="S4 · Build your first GAN" />,
    },
  ],
};

