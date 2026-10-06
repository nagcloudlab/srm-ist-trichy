import { Bridge, Cover, Flow, Quiz, Table, Takeaway, Mapping, Steps } from '../components/kit';
import type { Part } from '../types';

export const introPart: Part = {
  id: 'intro',
  code: 'DD',
  label: 'Open',
  title: 'How neural networks learn',
  when: '',
  minutes: 0,
  slides: [
    {
      id: 'intro-cover',
      section: 'Welcome',
      kicker: 'GAN Mastery · Deep dive',
      title: 'How neural networks learn',
      layout: 'cover',
      notes: {
        time: '1 min',
        say: 'This deck opens the box behind every training step in the course: the slope we follow, the optimizer that takes the step, the activations that shape signals, the loss that defines better, and the toolkit that keeps deep training stable.',
        ask: 'Which of these do you currently treat as a default you never question?',
      },
      render: () => (
        <Cover
          eyebrow="GAN Mastery · Deep dive"
          title="How neural networks learn"
          subtitle="Gradient descent · optimizers · activations · loss functions · the training toolkit — the math behind every GAN you train."
          meta={<><span className="pill">5 parts</span><span className="pill">live labs</span><span className="pill">every formula worked</span></>}
          art={
            <div className="day-cover-art" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 10, minWidth: 320 }}>
              {[['∇L', 'slope', 'var(--blue)'], ['Adam', 'step', 'var(--violet)'], ['σ · ReLU', 'shape', 'var(--mint)'], ['BCE', 'score', 'var(--coral)'], ['Norm · init', 'stability', 'var(--yellow)']].map(([a, b, c]) => (
                <div key={a} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 24, padding: '10px 16px', borderRadius: 14, background: '#fbfaf6', border: '1px solid var(--line)' }}>
                  <strong style={{ font: '700 28px var(--math)', color: c }}>{a}</strong>
                  <small style={{ font: '850 11px var(--mono)', letterSpacing: '.14em', color: 'var(--muted)', textTransform: 'uppercase' }}>{b}</small>
                </div>
              ))}
            </div>
          }
        />
      ),
    },
    {
      id: 'intro-loop',
      section: 'Welcome',
      kicker: 'The one loop',
      title: 'Every training step is the same five moves',
      notes: {
        time: '3 min',
        say: 'Trace the loop once with a finger. Forward pass through activations, score with a loss, backprop gives the gradient, the optimizer turns gradient into a step, and the toolkit — initialization, normalization, regularization — keeps the loop healthy for thousands of iterations.',
        ask: 'Which box would you blame first if a loss curve suddenly turns into NaN?',
      },
      render: () => (
        <>
          <Flow nodes={[
            { label: 'forward', value: 'ŷ = f(x; θ)', tone: 'mint', note: 'activations shape it' },
            { op: '→' },
            { label: 'loss', value: 'L(ŷ, y)', tone: 'coral', note: 'defines “better”' },
            { op: '→' },
            { label: 'backward', value: '∇θ L', tone: 'blue', note: 'the slope' },
            { op: '→' },
            { label: 'step', value: 'θ ← θ − η·g', tone: 'violet', note: 'the optimizer' },
          ]} caption="Repeat thousands of times · initialization, normalization and regularization keep it stable" />
          <Takeaway>Each part of this deck zooms into one box of this loop — and shows what breaks when it is chosen badly.</Takeaway>
        </>
      ),
    },
    {
      id: 'intro-map',
      section: 'Map',
      kicker: 'What is inside',
      title: 'Five parts, each one box of the loop',
      notes: {
        time: '2 min',
        say: 'Walk the five parts. Each ends with a GAN connection, because GANs stress every one of these choices: two players, two losses, two optimizers, unusual activations and fragile normalization.',
        ask: 'Which part do you expect to change how you configure your next GAN?',
      },
      render: () => (
        <Table
          headers={['Part', 'Core question', 'You will be able to']}
          rows={[
            ['GD · Gradient descent', 'Which way, and how far?', 'Pick a stable learning rate and read noisy loss curves'],
            ['OPT · Optimizers', 'How should each weight step?', 'Explain momentum, RMSprop, Adam and why GANs tune β'],
            ['ACT · Activations', 'What shape can the network take?', 'Choose activations per layer and spot vanishing gradients'],
            ['LOSS · Loss functions', 'What does “better” mean?', 'Match loss to task and compare the GAN loss family'],
            ['ADV · Training toolkit', 'How do we keep deep training stable?', 'Use init, normalization and regularization deliberately'],
          ]}
        />
      ),
    },
    {
      id: 'intro-prereq',
      section: 'Map',
      kicker: 'Before we start',
      title: 'You need three ideas from the neural-network basics',
      notes: {
        time: '2 min',
        say: 'Check these three before going on. If anyone is shaky on the chain rule, spend a minute on the example — everything later multiplies local slopes the same way.',
        ask: 'If ŷ = wx + b and L = (ŷ − y)², what is ∂L/∂w?',
      },
      render: () => (
        <>
          <Mapping leftLabel="Idea" rightLabel="One-line reminder" rows={[
            ['A neuron', 'ŷ = w·x + b — weights scale inputs, the bias shifts the result'],
            ['A loss', 'One number that is small when predictions are good'],
            ['The chain rule', '∂L/∂w = ∂L/∂ŷ · ∂ŷ/∂w = 2(ŷ − y) · x'],
          ]} />
          <Steps items={[{ title: 'Example: x = 2, w = 1, b = 0, y = 4', body: 'ŷ = 2 · ∂L/∂ŷ = 2(2 − 4) = −4 · ∂ŷ/∂w = 2 · ∂L/∂w = −8 → increase w', tone: 'blue' }]} />
        </>
      ),
    },
  ],
};

export const closePart: Part = {
  id: 'close',
  code: 'END',
  label: 'Wrap',
  title: 'Cheat sheet and check',
  when: '',
  minutes: 0,
  slides: [
    {
      id: 'close-cheat',
      section: 'Cheat sheet',
      kicker: 'Keep this slide',
      title: 'Good defaults — and when to change them',
      notes: {
        time: '3 min',
        say: 'These are starting points, not laws. Each row has the default and the symptom that tells you to change it.',
        ask: 'Which default here differs from what you used last time — and why?',
      },
      render: () => (
        <Table
          compact
          headers={['Choice', 'Good default', 'Change it when…']}
          rows={[
            ['Learning rate', 'Adam 1e-3 · GANs 1e-4 to 2e-4', 'Loss explodes (lower it) · barely moves (raise it, or warm up)'],
            ['Optimizer', 'Adam / AdamW · GANs: Adam β1 0.5 or β (0, 0.9)', 'Training oscillates · you need weight decay done right (AdamW)'],
            ['Batch size', '32–128', 'Gradients too noisy (bigger) · memory limits (smaller + more steps)'],
            ['Hidden activation', 'ReLU · GAN D: LeakyReLU(0.2)', 'Many dead units · smoother models (GELU / SiLU)'],
            ['Output activation', 'Linear (regression) · logit (classification) · Tanh (images in [−1, 1])', 'Output range must match the data'],
            ['Loss', 'MSE / Huber · BCEWithLogits · softmax cross-entropy', 'Outliers (Huber/MAE) · class imbalance (weights / focal)'],
            ['Initialization', 'He for ReLU · Xavier for tanh', 'Activations vanish or explode with depth'],
            ['Normalization', 'BatchNorm (CNNs) · LayerNorm (critics, transformers)', 'Small batches or WGAN-GP critic → avoid BatchNorm'],
          ]}
        />
      ),
    },
    {
      id: 'close-check',
      section: 'Check',
      kicker: 'Final check',
      title: 'Can you diagnose these from the loop?',
      reveal: true,
      notes: {
        time: '5 min',
        say: 'Each question is a symptom. Ask learners which box of the loop they would inspect first, then reveal.',
        ask: 'Which answer surprised you?',
      },
      render: ({ revealed }) => (
        <Quiz revealed={revealed} items={[
          { q: 'Loss jumps to NaN after a few steps.', a: 'Step too large: lower η, add warmup or gradient clipping; check for log(0).' },
          { q: 'A 20-layer sigmoid net barely trains.', a: 'Vanishing gradients: σ′ ≤ 0.25 per layer. Use ReLU-family + He init, or normalization / residuals.' },
          { q: 'A classifier outputs p = 0.01 for a positive and MSE barely corrects it.', a: 'MSE on probabilities saturates. Use BCE (gradient p − y on the logit).' },
          { q: 'Without Adam’s bias correction, are the first steps too small or too big?', a: 'Too big (β2 = 0.999): m₁ = 0.1·g but v₁ = 0.001·g², so m/√v ≈ 3.2. Correction gives ≈ 1.' },
          { q: 'Validation loss rises while training loss falls.', a: 'Overfitting: regularize (weight decay, dropout, augmentation) or stop early.' },
          { q: 'A WGAN-GP critic uses BatchNorm.', a: 'The per-sample gradient penalty breaks with batch-coupled statistics — use LayerNorm or none.' },
        ]} />
      ),
    },
    {
      id: 'close-bridge',
      section: 'Check',
      kicker: 'Back to GANs',
      title: 'Two networks, one loop each — now you know every knob.',
      layout: 'bridge',
      notes: {
        time: '1 min',
        say: 'A GAN runs this loop twice per iteration, with opposite goals. Every instability you meet in the course maps to one box of the loop.',
        ask: 'Which knob will you check first the next time a GAN collapses?',
      },
      render: () => <Bridge done="Deep dive · complete" question="Two networks, one loop each — now you know every knob." next="Back to the GAN sessions" />,
    },
  ],
};
