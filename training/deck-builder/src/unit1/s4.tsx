import './s4.css';
import { Bridge, Cards, Code, Divider, Equation, Flow, FormulaSteps, FormulaTerms, LabDemo, Output, Predict, Quiz, Split, Stack, Steps, T, Table, Takeaway, Versus, Answer } from '../components/kit';
import { GanSevenLab } from '../labs/GanSevenLab';
import { S4SamplesLab } from '../labs/S4SamplesLab';
import type { Part } from '../types';

const C = { blue: '#3157d5', blueSoft: '#e8edff', mint: '#277a59', mintSoft: '#dff5ea', coral: '#c8432f', coralSoft: '#fde9e5', ink: '#111827', muted: '#68707c' };

function Box({ x, y, w, h, fill, stroke, title, sub }: { x: number; y: number; w: number; h: number; fill: string; stroke: string; title: string; sub?: string }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx="14" fill={fill} stroke={stroke} strokeWidth="2.5" />
      <text x={x + w / 2} y={y + (sub ? h / 2 - 4 : h / 2 + 7)} textAnchor="middle" fontSize="21" fontWeight="750" fill={C.ink}>{title}</text>
      {sub && <text x={x + w / 2} y={y + h / 2 + 20} textAnchor="middle" fontSize="15" fill={C.muted} fontFamily="var(--mono)">{sub}</text>}
    </g>
  );
}

/** The whole first-GAN system: noise → G → fake, real 7.0, both into D → probability. */
function Architecture({ highlight }: { highlight?: 'all' | 'feedback' }) {
  return (
    <figure className="s4-arch">
      <svg viewBox="0 0 980 390" role="img" aria-label="Architecture: noise goes into the Generator (1 to 16 to 1) to make a fake number; the fake and the real value 7.0 go into the Discriminator (1 to 16 to 1 plus Sigmoid), which outputs a probability between 0 and 1. Gradients flow from the Discriminator back to the Generator.">
        <defs>
          <marker id="s4-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerUnits="userSpaceOnUse" markerWidth="14" markerHeight="14" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill={C.ink} /></marker>
          <marker id="s4-arrow-mint" viewBox="0 0 10 10" refX="9" refY="5" markerUnits="userSpaceOnUse" markerWidth="16" markerHeight="16" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill={C.mint} /></marker>
        </defs>
        <text x="560" y="22" textAnchor="middle" fontSize="15" fontWeight="700" fill={C.mint}>gradient: “how to look more real”</text>
        <g transform="translate(0 30)">
        <Box x={20} y={50} w={150} h={84} fill={C.blueSoft} stroke={C.blue} title="Noise z" sub="1 number" />
        <Box x={235} y={40} w={190} h={104} fill={C.mintSoft} stroke={C.mint} title="Generator" sub="1 → 16 → 1" />
        <Box x={490} y={50} w={150} h={84} fill={C.mintSoft} stroke={C.mint} title="Fake" sub="G(z)" />
        <Box x={490} y={226} w={150} h={84} fill={C.blueSoft} stroke={C.blue} title="Real" sub="7.0" />
        <Box x={700} y={124} w={170} h={112} fill={C.coralSoft} stroke={C.coral} title="Discriminator" sub="1→16→1 + Sigmoid" />
        <line x1="170" y1="92" x2="231" y2="92" stroke={C.ink} strokeWidth="2.5" markerEnd="url(#s4-arrow)" />
        <line x1="425" y1="92" x2="486" y2="92" stroke={C.ink} strokeWidth="2.5" markerEnd="url(#s4-arrow)" />
        <path d="M640 92 C 675 92, 680 150, 697 160" fill="none" stroke={C.ink} strokeWidth="2.5" markerEnd="url(#s4-arrow)" />
        <path d="M640 268 C 675 268, 680 210, 697 200" fill="none" stroke={C.ink} strokeWidth="2.5" markerEnd="url(#s4-arrow)" />
        <line x1="870" y1="180" x2="925" y2="180" stroke={C.ink} strokeWidth="2.5" markerEnd="url(#s4-arrow)" />
        <text x="952" y="174" textAnchor="middle" fontSize="20" fontWeight="750" fill={C.coral}>p</text>
        <text x="952" y="196" textAnchor="middle" fontSize="13" fill={C.muted}>0…1</text>
        <path d="M785 124 C 785 14, 330 6, 330 36" fill="none" stroke={C.mint} strokeWidth={highlight === 'feedback' ? 4 : 2.5} strokeDasharray="8 7" markerEnd="url(#s4-arrow-mint)" />
        <text x="95" y="290" textAnchor="start" fontSize="15" fill={C.muted}>Step A · train D: real → 1, fake (detached) → 0</text>
        <text x="95" y="316" textAnchor="start" fontSize="15" fill={C.muted}>Step B · train G: make D say 1 for fakes</text>
        <text x="95" y="342" textAnchor="start" fontSize="15" fill={C.muted}>Repeat · both improve through competition</text>
        </g>
      </svg>
    </figure>
  );
}

export const s4Part: Part = {
  id: 's4',
  code: 'G7',
  label: 'First GAN',
  title: 'Build Your First GAN',
  when: '',
  minutes: 90,
  slides: [
    /* ---------------- Orient ---------------- */
    {
      id: 's4-divider',
      section: 'Orient',
      kicker: 'Unit 1 · First GAN',
      title: 'Build Your First GAN',
      layout: 'divider',
      notes: {
        time: '1 min',
        say: 'You know the idea from the GAN-idea deck and the building blocks from the neural-networks deck. Now we put them together and watch a real GAN learn.',
        ask: 'Which part of the GAN training loop do you expect to be hardest to write?',
      },
      render: () => (
        <Divider
          code="G7"
          title="Build Your First GAN"
          promise="Teach a Generator to produce the number 7 — no images yet, just one number, so every moving part is visible."
          items={['Build G and D', 'Loss + two optimizers', 'The training loop', 'Watch it learn live', 'Understand each line', 'Scale it up']}
        />
      ),
    },
    {
      id: 's4-task',
      section: 'Orient',
      kicker: 'The task',
      title: 'The simplest possible GAN: the real data is one number, 7.0',
      lede: 'Strip away images and convolutions so the GAN mechanics are the only thing left on the table.',
      notes: {
        time: '2 min',
        say: 'Three components. The real dataset is literally the single value 7.0. G maps noise to a number; D maps a number to a probability of "real".',
        ask: 'If the dataset is just the number 7, what would a perfect Generator output?',
      },
      render: () => (
        <>
          <Table
            headers={['Component', 'What it is', 'Input → output']}
            rows={[
              ['Real data', 'The number 7.0', '—'],
              ['Generator (G)', 'Tries to output 7.0', 'random noise → a fake number'],
              ['Discriminator (D)', 'Judges real (1) vs fake (0)', 'a number → probability it is real'],
            ]}
          />
          <Takeaway>Nobody ever tells G “the answer is 7”. It only hears D's verdict.</Takeaway>
        </>
      ),
    },
    {
      id: 's4-predict',
      section: 'Orient',
      kicker: 'Predict first',
      title: 'Can G find 7 when no one tells it the answer?',
      reveal: true,
      notes: {
        time: '3 min',
        say: 'Let people commit. Many will say no — G never sees the data. The reveal: D sees 7, learns "7 means real", and D\'s gradient tells G which direction looks more real.',
        ask: 'G never sees the number 7. Will it learn to produce it? Hands up for yes, no, sometimes.',
      },
      render: ({ revealed }) => (
        <Predict
          revealed={revealed}
          question="After 2000 rounds, will G output ≈ 7?"
          facts={['G starts with random weights', <>G <b>never sees 7.0</b></>, 'D only says “real” or “fake”']}
          answer={<Answer verdict="Yes — it lands on ≈ 7" points={['D sees the real 7 and learns “near 7 looks real”', <>D's gradient tells G: <b>“move this way to look more real”</b></>, 'G follows that slope until it reaches 7']} />}
        />
      ),
    },

    /* ---------------- Build G and D ---------------- */
    {
      id: 's4-g-math',
      section: 'Build G & D',
      kicker: 'The Generator · inside',
      title: 'The Generator is Linear → ReLU → Linear',
      notes: {
        time: '2 min',
        say: 'This is exactly the hidden-layer network from the neural-networks deck: 16 hidden neurons with ReLU, and a plain linear output — no activation at the end, because 7 is an unbounded number, not a pixel.',
        ask: 'Why is there no Sigmoid at the end of the Generator?',
      },
      render: () => (
        <>
          <Flow
            nodes={[
              { label: 'noise', value: 'z', tone: 'blue', note: '1 number' },
              { op: '→' },
              { label: 'Linear(1, 16)', value: 'Wz + b', tone: 'violet', note: '16 values' },
              { op: '→' },
              { label: 'ReLU', value: 'max(0, ·)', tone: 'mint', note: 'bend' },
              { op: '→' },
              { label: 'Linear(16, 1)', value: 'W₂h + b₂', tone: 'violet', note: '1 value' },
              { op: '→' },
              { label: 'fake', value: 'G(z)', tone: 'mint', note: 'trying to be 7' },
            ]}
          />
          <Equation size="md" reading="49 learnable numbers in total: 16 + 16 in the first layer, 16 + 1 in the second.">
            <T tone="mint">output</T><span className="op">=</span><T tone="violet">W₂</T><span className="op">·</span>ReLU(<T tone="violet">W</T><span className="op">·</span><T tone="blue">noise</T><span className="op">+</span><T tone="violet">b</T>)<span className="op">+</span><T tone="violet">b₂</T>
          </Equation>
        </>
      ),
    },
    {
      id: 's4-g-terms',
      section: 'Build G & D',
      kicker: 'Formula · term by term',
      title: 'Six pieces turn one random number into one fake number',
      notes: {
        time: '3 min',
        say: 'Read the formula aloud from the inside out: noise times W plus b gives 16 numbers; ReLU zeroes the negatives; W₂ mixes the 16 survivors into one number; b₂ shifts it. Only W, b, W₂ and b₂ learn — z is fresh randomness every time.',
        ask: 'Which of these six pieces changes during training, and which is new on every call?',
      },
      render: () => (
        <FormulaTerms
          symbolWidth="5.5rem"
          reading="output = W₂ times ReLU of (W times noise plus b), plus b₂"
          formula={<><T tone="mint">output</T><span className="op">=</span><T tone="violet">W₂</T><span className="op">·</span>ReLU(<T tone="violet">W</T><span className="op">·</span><T tone="blue">z</T><span className="op">+</span><T tone="violet">b</T>)<span className="op">+</span><T tone="violet">b₂</T></>}
          terms={[
            { symbol: 'z', name: 'Noise', meaning: 'One random number, new on every call', range: '≈ −3 … 3', tone: 'blue' },
            { symbol: 'W', name: 'First weights', meaning: 'One weight per hidden neuron — spreads z into 16 values', range: '16 numbers', tone: 'violet' },
            { symbol: 'b', name: 'First biases', meaning: 'Shifts each of the 16 values', range: '16 numbers', tone: 'violet' },
            { symbol: 'ReLU', name: 'The bend', meaning: 'Keeps positives, sets negatives to 0', range: '0 … ∞', tone: 'mint' },
            { symbol: 'W₂', name: 'Output weights', meaning: 'Mixes the 16 hidden values into one', range: '16 numbers', tone: 'violet' },
            { symbol: 'b₂', name: 'Output bias', meaning: 'Final shift — no activation after it', range: '1 number', tone: 'violet' },
          ]}
        />
      ),
    },
    {
      id: 's4-g-params',
      section: 'Build G & D',
      kicker: 'Formula · worked',
      title: 'Count the learnable numbers: 16 + 16 + 16 + 1 = 49',
      notes: {
        time: '2 min',
        say: 'Every Linear layer has in × out weights plus out biases. Count both layers. D has the same two Linear layers — Sigmoid adds no parameters — so D also has 49.',
        ask: 'How many parameters would Linear(1, 64) → Linear(64, 1) have?',
      },
      render: () => (
        <FormulaSteps
          formula={<><T tone="violet">parameters</T><span className="op">=</span><T tone="blue">in</T><span className="op">×</span><T tone="mint">out</T><span className="op">+</span><T tone="mint">out</T></>}
          given={['Linear(1, 16)', 'Linear(16, 1)']}
          steps={[
            { math: <>1 × 16 = 16</>, note: 'layer 1 weights: one per hidden neuron' },
            { math: <>16</>, note: 'layer 1 biases: one per hidden neuron' },
            { math: <>16 × 1 = 16</>, note: 'layer 2 weights: one per hidden value' },
            { math: <>1</>, note: 'layer 2 bias' },
            { math: <>16 + 16 + 16 + 1</>, note: 'add all four groups' },
          ]}
          result={<>49 learnable numbers (D: also 49)</>}
        />
      ),
    },
    {
      id: 's4-g-code',
      section: 'Build G & D',
      kicker: 'The Generator · code',
      title: 'An untrained Generator outputs random garbage',
      notes: {
        time: '3 min',
        say: 'Three lines of nn.Sequential build it. Feed one random number in, get one number out. Right now the weights are random, so the output is meaningless — that is the starting point.',
        ask: 'If you run this cell twice, will you get the same output? Why not?',
      },
      render: () => (
        <Split
          ratio="1.35fr 1fr"
          left={<Code
            title="generator.py"
            code={`import torch
import torch.nn as nn

generator = nn.Sequential(
    nn.Linear(1, 16),
    nn.ReLU(),
    nn.Linear(16, 1),
)

noise = torch.randn(1, 1)
fake = generator(noise)
print(f"Noise: {noise.item():.4f}")
print(f"Generator output: {fake.item():.4f}")`}
            marks={{ 5: 'violet', 6: 'mint', 7: 'violet', 10: 'blue' }}
            notes={{ 5: 'noise → 16 hidden neurons', 6: 'the bend', 7: '16 → 1 output number', 10: 'one random number' }}
          />}
          right={<Stack>
            <Output title="EXAMPLE OUTPUT · RANDOM INIT">{`Noise: 0.3367
Generator output: -0.0547`}</Output>
            <Takeaway tone="coral">−0.05 is nowhere near 7. G knows nothing yet.</Takeaway>
          </Stack>}
        />
      ),
    },
    {
      id: 's4-d-code',
      section: 'Build G & D',
      kicker: 'The Discriminator',
      title: 'The Discriminator is the classifier we built, pointed at numbers',
      notes: {
        time: '3 min',
        say: 'Same body as G, plus a Sigmoid so the answer is a probability. Untrained, it says about 0.5 for anything — it cannot tell yet.',
        ask: 'What does an output of 0.5 mean in plain words?',
      },
      render: () => (
        <Split
          ratio="1.35fr 1fr"
          left={<Code
            title="discriminator.py"
            code={`discriminator = nn.Sequential(
    nn.Linear(1, 16),
    nn.ReLU(),
    nn.Linear(16, 1),
    nn.Sigmoid(),
)

real_data = torch.tensor([[7.0]])
output = discriminator(real_data)
print(f"Input: {real_data.item()}")
print(f"D says: {output.item():.4f}")`}
            marks={{ 5: 'coral', 8: 'blue' }}
            notes={{ 2: 'number → 16 hidden', 4: '16 → 1 raw score', 5: 'squash to 0…1', 8: 'the real data' }}
          />}
          right={<Stack>
            <Output>{`Input: 7.0
D says: ≈ 0.5   (exact value depends on init)`}</Output>
            <Cards cols={1} items={[{ tag: 'Reading D', title: '1 = real · 0 = fake · 0.5 = no idea', body: 'Sigmoid turns the raw score into a probability.', tone: 'coral' }]} />
          </Stack>}
        />
      ),
    },
    {
      id: 's4-arch',
      section: 'Build G & D',
      kicker: 'The full architecture',
      title: 'Two 49-parameter networks wired into one game',
      notes: {
        time: '2 min',
        say: 'Trace the picture with your hand: noise into G, fake out. Real 7 and the fake both go into D. D outputs a probability. The dashed green line is the important one — the gradient that tells G how to look more real.',
        ask: 'Which arrow carries information about the real data to G?',
      },
      render: () => <Architecture highlight="feedback" />,
    },

    /* ---------------- Loss and optimizers ---------------- */
    {
      id: 's4-loss-opt',
      section: 'Loss & optimizers',
      kicker: 'Loss and optimizers',
      title: 'One loss function, two independent optimizers',
      notes: {
        time: '3 min',
        say: 'BCE is the classification loss from the neural-networks deck. New here: Adam instead of SGD — same zero_grad / backward / step, but it adapts each weight’s step size, which keeps GAN training steadier (lab 00, Part 6). Each network gets its own Adam that only knows its own parameters. The two label tensors are the targets for BCE.',
        ask: 'Which optimizer will ever change the Generator\'s weights?',
      },
      render: () => (
        <Split
          ratio="1.3fr 1fr"
          left={<Code
            code={`loss_fn = nn.BCELoss()

gen_optimizer = torch.optim.Adam(
    generator.parameters(), lr=0.001)
dis_optimizer = torch.optim.Adam(
    discriminator.parameters(), lr=0.001)

real_label = torch.tensor([[1.0]])   # "this is real"
fake_label = torch.tensor([[0.0]])   # "this is fake"`}
            marks={{ 1: 'yellow', 4: 'mint', 6: 'coral' }}
          />}
          right={<Cards cols={1} items={[
            { tag: 'Adam, not SGD', title: 'Same three lines, smarter steps', body: 'Adam adapts each weight’s step size.', tone: 'blue' },
            { tag: 'G optimizer', title: 'Updates only G', body: 'It holds G\'s 49 parameters — nothing else.', tone: 'mint' },
            { tag: 'D optimizer', title: 'Updates only D', body: 'It holds D\'s 49 parameters — nothing else.', tone: 'coral' },
          ]} />}
        />
      ),
    },

    /* ---------------- Training loop ---------------- */
    {
      id: 's4-loop-overview',
      section: 'Training loop',
      kicker: 'The heart of every GAN',
      title: 'Every epoch is two steps: train D, then train G',
      notes: {
        time: '2 min',
        say: 'Before the code, the shape. Step A is a normal classifier update for D. Step B updates G through D. Repeat thousands of times. Every GAN you will meet this week keeps this exact skeleton.',
        ask: 'In Step B, which network\'s weights change?',
      },
      render: () => (
        <>
          <Steps items={[
            { title: 'Step A · show D the real 7 → target 1', body: 'loss_real = BCE(D(7.0), 1)', tone: 'coral' },
            { title: 'Step A · show D a detached fake → target 0', body: 'loss_fake = BCE(D(G(z).detach()), 0) — then update only D', tone: 'coral' },
            { title: 'Step B · make a fresh fake and let D judge it', body: 'fake_pred = D(G(z)) — no detach this time', tone: 'mint' },
            { title: 'Step B · G wants D to say 1', body: 'gen_loss = BCE(fake_pred, 1) — then update only G', tone: 'mint' },
          ]} />
          <Takeaway>Repeat 2000 times. Both get better because the other one does.</Takeaway>
        </>
      ),
    },
    {
      id: 's4-step-a-code',
      section: 'Training loop',
      kicker: 'Step A · code',
      title: 'Step A trains D like any classifier: real → 1, fake → 0',
      notes: {
        time: '4 min',
        say: 'Read the four blocks: real half, fake half, add the losses, the three-line update. Point at line 7 — .detach() — we will come back to exactly why.',
        ask: 'Which two lines produce the targets D is trained against?',
      },
      render: () => (
        <Code
          title="Step A · train the Discriminator"
          code={`real_data = torch.tensor([[7.0]])
real_pred = discriminator(real_data)
loss_real = loss_fn(real_pred, real_label)

noise = torch.randn(1, 1)
fake_data = generator(noise).detach()
fake_pred = discriminator(fake_data)
loss_fake = loss_fn(fake_pred, fake_label)

dis_loss = loss_real + loss_fake
dis_optimizer.zero_grad()
dis_loss.backward()
dis_optimizer.step()`}
          marks={{ 3: 'blue', 6: 'yellow', 8: 'coral', 13: 'coral' }}
          notes={{ 2: 'D judges the real 7', 3: 'should say 1', 6: 'fake value — cut off from G', 8: 'should say 0', 10: 'one loss for both halves', 11: 'clear old gradients', 12: 'gradients for D', 13: 'update D only' }}
        />
      ),
    },
    {
      id: 's4-step-a-picture',
      section: 'Training loop',
      kicker: 'Step A · picture',
      title: 'D sees both halves and learns to pull them apart',
      notes: {
        time: '2 min',
        say: 'Two forward passes through the same D, two targets. The fake arrives detached: for D it is just a number, with no history pointing back into G.',
        ask: 'Early in training, which half of D\'s loss will be easy to get low?',
      },
      render: () => (
        <>
          <div className="s4-pair">
            <div className="s4-pair-row">
              <small>Real half</small>
              <Flow size="sm" nodes={[{ label: 'real', value: '7.0', tone: 'blue' }, { op: '→' }, { label: 'D', value: 'p_real', tone: 'coral' }, { op: '→' }, { label: 'target', value: '1', tone: 'ink' }, { op: '→' }, { label: 'loss', value: '−log p_real', tone: 'yellow' }]} />
            </div>
            <div className="s4-pair-row">
              <small>Fake half</small>
              <Flow size="sm" nodes={[{ label: 'noise', value: 'z', tone: 'blue' }, { op: '→' }, { label: 'G · detached', value: 'G(z)', tone: 'mint' }, { op: '→' }, { label: 'D', value: 'p_fake', tone: 'coral' }, { op: '→' }, { label: 'target', value: '0', tone: 'ink' }, { op: '→' }, { label: 'loss', value: '−log(1 − p_fake)', tone: 'yellow' }]} />
            </div>
          </div>
          <Takeaway tone="coral">Only D's optimizer steps. G is used as a supplier of fakes, not as a learner.</Takeaway>
        </>
      ),
    },
    {
      id: 's4-d-loss-terms',
      section: 'Training loop',
      kicker: 'Formula · term by term',
      title: 'D’s loss is two BCE terms: one for the real half, one for the fake half',
      notes: {
        time: '3 min',
        say: 'BCE with target 1 is −log p; with target 0 it is −log(1 − p). Step A uses both: the real 7.0 should get a high D(x), the detached fake a low D(G(z)). Each term is small only when D is right.',
        ask: 'Which term grows if D starts calling the fake “real”?',
      },
      render: () => (
        <FormulaTerms
          symbolWidth="9.5rem"
          reading="D loss = minus log D(real) minus log (1 − D(fake))"
          formula={<><T tone="coral">D_loss</T><span className="op">=</span>−log <T tone="coral">D(x)</T><span className="op">−</span>log(1 − <T tone="coral">D(G(z))</T>)</>}
          terms={[
            { symbol: 'x', name: 'Real data', meaning: 'The number 7.0', range: 'target 1', tone: 'blue' },
            { symbol: 'D(x)', name: 'D’s verdict on the real', meaning: 'Probability it is real — D wants it near 1', range: '0 … 1', tone: 'coral' },
            { symbol: 'G(z)', name: 'Detached fake', meaning: 'G’s output, frozen so only D learns', range: 'target 0', tone: 'mint' },
            { symbol: 'D(G(z))', name: 'D’s verdict on the fake', meaning: 'D wants it near 0', range: '0 … 1', tone: 'coral' },
            { symbol: '−log D(x)', name: 'Real half = BCE(D(x), 1)', meaning: 'Large when D doubts a real', range: '0 … ∞', tone: 'violet' },
            { symbol: '−log(1 − ·)', name: 'Fake half = BCE(D(G(z)), 0)', meaning: 'Large when D believes a fake', range: '0 … ∞', tone: 'violet' },
          ]}
        />
      ),
    },
    {
      id: 's4-d-loss-steps',
      section: 'Training loop',
      kicker: 'Formula · worked',
      title: 'A fairly sharp D pays 0.105 + 0.223 = 0.33',
      notes: {
        time: '2 min',
        say: 'Plug in one round: D says 0.9 for the real 7 and 0.2 for the fake. Both halves are small, so D’s loss is small — D is doing its job. If D said 0.5 for both, each half would cost 0.693.',
        ask: 'What would D’s loss be if it said 0.5 for both?',
      },
      render: () => (
        <FormulaSteps
          given={['D(x) = 0.9', 'D(G(z)) = 0.2']}
          steps={[
            { math: <>−log 0.9 = 0.105</>, note: 'real half: D is fairly sure — small cost' },
            { math: <>−log(1 − 0.2) = −log 0.8</>, note: 'fake half: flip the fake’s score' },
            { math: <>−log 0.8 = 0.223</>, note: 'D mostly caught the fake — small cost' },
            { math: <>0.105 + 0.223</>, note: 'add the two halves' },
          ]}
          result={<>D_loss = 0.33</>}
        />
      ),
    },
    {
      id: 's4-step-b-code',
      section: 'Training loop',
      kicker: 'Step B · code',
      title: 'Step B trains G to make D say “real”',
      notes: {
        time: '3 min',
        say: 'Fresh noise, a fresh fake — and this time no detach, so the computation graph runs from the loss through D back into G. The target is real_label: G is graded on how well it fooled D.',
        ask: 'Gradients flow through D here too. Why don\'t D\'s weights change in Step B?',
      },
      render: () => (
        <Split
          ratio="1.4fr 1fr"
          left={<Code
            title="Step B · train the Generator"
            code={`noise = torch.randn(1, 1)
fake_data = generator(noise)
fake_pred = discriminator(fake_data)

gen_loss = loss_fn(fake_pred, real_label)

gen_optimizer.zero_grad()
gen_loss.backward()
gen_optimizer.step()`}
            marks={{ 2: 'mint', 5: 'yellow', 9: 'mint' }}
            notes={{ 2: 'no .detach() — G must learn', 3: 'D judges the fake', 5: 'target = REAL (1)', 7: 'clear G\'s old gradients', 8: 'gradients flow D → G', 9: 'update G only' }}
          />}
          right={<Cards cols={1} items={[
            { tag: 'Why D stays still', title: 'Only gen_optimizer steps', body: 'D’s .grad fills up but is never applied — Step A’s zero_grad() clears it.', tone: 'coral' },
          ]} />}
        />
      ),
    },
    {
      id: 's4-step-b-picture',
      section: 'Training loop',
      kicker: 'Step B · the gradient path',
      title: 'G learns through D: the verdict flows backward into G',
      notes: {
        time: '2 min',
        say: 'This is the clever part. G has no data and no target of its own. Its only signal is the derivative of D\'s verdict with respect to the fake number — "nudge your output this way and D will believe you more".',
        ask: 'What would G learn if D were still random and untrained?',
      },
      render: () => (
        <>
          <Flow
            size="lg"
            nodes={[
              { label: 'noise', value: 'z', tone: 'blue' },
              { op: '→' },
              { label: 'G · updated', value: 'G', tone: 'mint' },
              { op: '→' },
              { label: 'fake', value: 'G(z)', tone: 'mint' },
              { op: '→' },
              { label: 'D · frozen', value: 'D', tone: 'coral' },
              { op: '→' },
              { label: 'loss', value: '−log D(G(z))', tone: 'yellow' },
            ]}
            caption="Forward: left to right. Backward: the gradient returns right to left — through D, into G."
          />
          <Takeaway tone="mint">D is used as a measuring instrument: G reads its slope and climbs toward “looks real”.</Takeaway>
        </>
      ),
    },
    {
      id: 's4-g-loss-steps',
      section: 'Training loop',
      kicker: 'Formula · worked',
      title: 'The same fake costs G 1.61 — five times what it cost D',
      notes: {
        time: '2 min',
        say: 'Same fake, same D(G(z)) = 0.2, but now the target is real_label = 1. The second BCE term switches off and G pays −log 0.2 = 1.61. D paid only 0.22 for that fake. One number, opposite judgements — that is the adversarial game.',
        ask: 'What D(G(z)) would make G’s loss 0.11?',
      },
      render: () => (
        <FormulaSteps
          formula={<><T tone="mint">G_loss</T><span className="op">=</span>−log <T tone="coral">D(G(z))</T></>}
          given={['D(G(z)) = 0.2', 'target y = 1 (real_label)']}
          steps={[
            { math: <>−[1 · log 0.2 + (1 − 1) · log 0.8]</>, note: 'BCE with target 1' },
            { math: <>−[log 0.2 + 0]</>, note: 'the (1 − y) term switches off' },
            { math: <>−(−1.609)</>, note: 'log 0.2 = −1.609' },
          ]}
          result={<>G_loss = 1.61 · D paid 0.22 for the same fake</>}
        />
      ),
    },
    {
      id: 's4-logging',
      section: 'Training loop',
      kicker: 'Logging progress',
      title: 'Print the generated value — that is the number to watch',
      notes: {
        time: '2 min',
        say: 'Wrap Steps A and B in a loop of 2000 epochs and print every so often. This output is the idealised run from the course notes. Real runs are bumpier — and we are about to see one.',
        ask: 'Which column tells you whether G is learning?',
      },
      render: () => (
        <Split
          ratio="1.25fr 1fr"
          left={<Code
            code={`for epoch in range(1, 2001):
    # ... Step A: train D ...
    # ... Step B: train G ...
    if epoch in [1, 100, 500, 1000, 2000]:
        test_noise = torch.randn(1, 1)
        generated = generator(test_noise).item()
        print(f"Epoch {epoch:4d}: "
              f"D_loss={dis_loss.item():.4f}  "
              f"G_loss={gen_loss.item():.4f}  "
              f"Generated={generated:.4f}")`}
            marks={{ 1: 'blue', 6: 'mint' }}
          />}
          right={<Stack gap="sm">
            <Output title="IDEALISED OUTPUT · COURSE NOTES">{`Epoch    1: Generated=-0.1423
Epoch  100: Generated= 3.2156
Epoch  500: Generated= 5.8734
Epoch 1000: Generated= 6.5421
Epoch 2000: Generated= 6.9847`}</Output>
            <Takeaway>Smooth climb on paper. Let's train a real one.</Takeaway>
          </Stack>}
        />
      ),
    },

    /* ---------------- Watch it learn ---------------- */
    {
      id: 's4-live-trace',
      section: 'Watch it learn',
      kicker: 'Live · a real GAN in your browser',
      title: 'Train it: G climbs toward 7, overshoots, then settles',
      lab: true,
      notes: {
        time: '6 min',
        say: 'This is the exact first-GAN network — 1→16→1 with ReLU, BCE, two Adam optimizers at lr 0.001 — trained live with hand-written backprop. Press Train at 5×. Point at the green line climbing past 7 around epoch 800 (to about 11), then falling back and flattening near 7 by epoch 2000. Watch D(real 7) drift to 0.5 and the losses settle at 1.386 and 0.693. Then press New run: every seed takes a different path.',
        ask: 'Before you press Train: will the line approach 7 smoothly from below, or will it overshoot?',
      },
      render: () => <GanSevenLab />,
    },
    {
      id: 's4-real-run',
      section: 'Watch it learn',
      kicker: 'What a real run looks like',
      title: 'Real GANs overshoot and oscillate before they settle',
      notes: {
        time: '3 min',
        say: 'These are the real numbers from the live lab, seed 11. Around epoch 750–800, G is at 11 — past the target. Why? D has learned "bigger is more real" from the gap between 0 and 7, and keeps pushing until D catches up. Then G swings back. This chase is normal adversarial dynamics, not a bug.',
        ask: 'Why would G go past 7 if 7 is the only real value?',
      },
      render: () => (
        <>
          <Table
            headers={['Epoch', 'G output (avg of 8 noises)', 'D(real 7)', 'D loss', 'G loss', 'What is happening']}
            align={['right', 'right', 'right', 'right', 'right', 'left']}
            compact
            rows={[
              ['1', '0.00', '0.594', '1.307', '0.614', 'random start'],
              ['250', '2.17', '0.904', '0.719', '0.730', 'D is winning; G chases'],
              ['500', '6.80', '0.540', '1.402', '0.744', 'G reaches 7…'],
              ['750', '11.00', '0.365', '1.570', '0.910', '…and overshoots (peak 11.2 at ≈ 800)'],
              ['1000', '8.95', '0.485', '1.305', '0.808', 'D corrects; G swings back'],
              ['2000', '7.00', '0.503', '1.385', '0.708', 'settled near 7'],
              ['3000', '7.03', '0.502', '1.387', '0.689', 'equilibrium'],
            ]}
            highlight={[3, 6]}
          />
          <Takeaway>The course-notes table is the tidy version. Expect detours — and judge success by where it settles.</Takeaway>
        </>
      ),
    },
    {
      id: 's4-equilibrium',
      section: 'Watch it learn',
      kicker: 'Reading the losses',
      title: 'At equilibrium D says 0.5 to everything — and the losses become ln 2',
      notes: {
        time: '3 min',
        say: 'When G outputs 7 and D cannot tell, D says 0.5 for real and fake. Plug 0.5 into BCE: −ln 0.5 is 0.693. D pays it twice (real half + fake half) so D loss is 1.386; G pays it once. Those are the numbers on the lab.',
        ask: 'Is a G loss of 0.69 good or bad? (Trick question — it means the game is balanced.)',
      },
      render: () => (
        <>
          <FormulaSteps
            given={['D(real) = 0.5', 'D(fake) = 0.5']}
            steps={[
              { math: <>D_loss = −log 0.5 − log(1 − 0.5)</>, note: 'real half + fake half' },
              { math: <>= 0.693 + 0.693</>, note: 'each half costs −ln 0.5 = ln 2' },
              { math: <>G_loss = −log 0.5 = 0.693</>, note: 'G pays one term' },
            ]}
            result={<>D → 2 ln 2 ≈ 1.386 · G → ln 2 ≈ 0.693</>}
          />
          <Takeaway>GAN losses don't go to zero. Flat, balanced losses are the success signal.</Takeaway>
        </>
      ),
    },
    {
      id: 's4-live-judge',
      section: 'Watch it learn',
      kicker: "Live · D's point of view",
      title: "Watch D's opinion bend around 7 as G moves",
      lab: true,
      notes: {
        time: '4 min',
        say: 'Same lab, D\'s view. The red curve is D(x) — how real D thinks every number from −2 to 12 is. Green dots are G\'s samples. Train and watch: D first rises toward 7, G\'s dots slide along that slope, overshoot, and D bends to push them back. At the end the curve is near 0.5 where the dots sit.',
        ask: 'Where on the red curve do the green dots want to be — and why?',
      },
      render: () => <GanSevenLab initialView="judge" />,
    },

    /* ---------------- Samples ---------------- */
    {
      id: 's4-samples',
      section: 'Samples',
      kicker: 'Generate after training',
      title: 'Ten different noises, ten answers near 7',
      reveal: true,
      notes: {
        time: '4 min',
        say: 'After training we only need G — wrap it in torch.no_grad() and feed noise. Draw new noises a few times. Then the eye-opener: every noise gives about 7. In the GANs-for-images part that same symptom has a scary name. Let them argue before revealing.',
        ask: 'Every noise produces ≈ 7. Is that mode collapse?',
      },
      render: ({ revealed }) => (
        <>
          <S4SamplesLab />
          <Predict
            revealed={revealed}
            question={<>Is this <b>mode collapse</b>?</>}
            facts={['Different noise in', 'Nearly the same output']}
            answer={<Answer verdict="Not here." points={[<>The real data is <b>one value</b> — so one output is correct</>, 'With images (next part), real digits vary', <>Same digit for every noise <b>would</b> be mode collapse</>]} />}
          />
        </>
      ),
    },

    /* ---------------- Understand each part ---------------- */
    {
      id: 's4-detach',
      section: 'Understand each part',
      kicker: 'Why .detach() in Step A?',
      title: '.detach() keeps Step A about D — and only D',
      notes: {
        time: '4 min',
        say: 'Be precise here. .detach() cuts the graph at the fake, so dis_loss.backward() stops at D. Without it, PyTorch also computes gradients for G — wasted work, and those gradients sit in G\'s .grad. In our code order gen_optimizer.zero_grad() wipes them before G\'s backward, so nothing breaks. Move zero_grad, or accumulate, and D\'s "make fakes easier to catch" gradients would leak into G\'s update.',
        ask: 'If you delete .detach() in this exact script, does training break? What would make it break?',
      },
      render: () => (
        <Split
          ratio="1fr 1.2fr"
          left={<Code
            code={`# Step A: D learns, G doesn't
fake_data = generator(noise).detach()

# Step B: G learns through D
fake_data = generator(noise)`}
            marks={{ 2: 'yellow', 5: 'mint' }}
          />}
          right={<Cards cols={1} items={[
            { tag: 'What it does', title: '“Use this value, send no gradient to G”', body: 'The fake becomes a plain number for D\'s update.', tone: 'yellow' },
            { tag: 'Why it matters', title: 'No wasted backprop, no stray gradients', body: 'Without it, D’s loss fills G’s .grad. zero_grad() wipes it here — reorder the calls and it corrupts G’s step.', tone: 'coral' },
          ]} />}
        />
      ),
    },
    {
      id: 's4-real-label',
      section: 'Understand each part',
      kicker: 'Why does G use real_label?',
      title: 'G is graded on how “real” D thinks its fake is',
      notes: {
        time: '3 min',
        say: 'BCE with target 1 is −log p. If D catches the fake (p small), the loss is big; if D is fooled (p near 1), the loss is tiny. Minimising it means: make D say real.',
        ask: 'What is G\'s loss when D says 0.1 for its fake? And at 0.9?',
      },
      render: () => (
        <Split
          left={<Stack>
            <Equation size="md" reading="BCE(p, 1) for the fake — G wants this small.">
              <T tone="mint">gen_loss</T><span className="op">=</span>−log <T tone="coral">D(G(z))</T>
            </Equation>
            <Code code={`gen_loss = loss_fn(fake_pred, real_label)   # G wants 1`} marks={{ 1: 'mint' }} />
          </Stack>}
          right={<Table
            headers={['D(fake)', 'D thinks…', 'G loss']}
            align={['right', 'left', 'right']}
            rows={[
              ['0.10', 'caught — fake', '2.30'],
              ['0.50', 'can’t tell', '0.69'],
              ['0.90', 'fooled — real', '0.11'],
            ]}
            highlight={[0]}
          />}
        />
      ),
    },
    {
      id: 's4-two-losses',
      section: 'Understand each part',
      kicker: 'Two losses, two optimizers',
      title: 'Opposite goals, separate updates — that is what “adversarial” means',
      notes: {
        time: '3 min',
        say: 'Same fake, opposite wishes: D wants 0, G wants 1. Each network has its own optimizer holding only its own weights, and they take turns. With one optimizer over both, Step B would be the problem: gen_loss.backward() also fills D’s .grad, so the shared step would train D to be fooled. Separate optimizers keep each update on one side.',
        ask: 'What would go wrong with a single optimizer over both networks?',
      },
      render: () => (
        <>
          <Table
            headers={['Loss', 'Who learns', 'Goal for the fake', 'Optimizer']}
            rows={[
              ['dis_loss', 'Discriminator', 'D(fake) → 0  (and D(real) → 1)', 'dis_optimizer'],
              ['gen_loss', 'Generator', 'D(fake) → 1', 'gen_optimizer'],
            ]}
          />
          <Versus
            left={{ tag: 'D wants', title: 'Catch the fake', body: 'Push D(fake) down.', tone: 'coral' }}
            mid="⇄"
            right={{ tag: 'G wants', title: 'Fool D', body: 'Push D(fake) up.', tone: 'mint' }}
          />
        </>
      ),
    },

    /* ---------------- Recap ---------------- */
    {
      id: 's4-what-happened',
      section: 'Recap',
      kicker: 'What just happened',
      title: 'You built a working GAN — the same pattern scales to images',
      notes: {
        time: '2 min',
        say: 'Read the table as a story. The striking line is the fourth one: G produced 7 without ever being told 7.',
        ask: 'Which row would surprise someone who has only trained classifiers?',
      },
      render: () => (
        <Table
          headers={['What', 'How']}
          rows={[
            ['Built a Generator', 'nn.Sequential(Linear, ReLU, Linear)'],
            ['Built a Discriminator', 'nn.Sequential(Linear, ReLU, Linear, Sigmoid)'],
            ['Trained them against each other', 'Alternating Step A and Step B'],
            ['G learned to output ≈ 7', 'Without ever being told “the answer is 7”'],
            ['G only got feedback from D', 'Gradients of D’s verdict — that’s all'],
          ]}
          highlight={[3]}
        />
      ),
    },
    {
      id: 's4-scale',
      section: 'Recap',
      kicker: 'Scaling up',
      title: 'Scaling up changes the sizes, not the loop',
      notes: {
        time: '3 min',
        say: 'In the GANs-for-images part the data is 784 pixels. The networks get wider and the output gets a Tanh to match pixel range. Step A, Step B, detach, real_label, two optimizers — identical.',
        ask: 'Why might G need a Tanh at the end for images when it needed nothing for 7?',
      },
      render: () => (
        <Table
          headers={['', 'First GAN · the number 7', 'GANs for images · MNIST']}
          rows={[
            ['Real data', '1 number (7.0)', '784 pixels (28 × 28), scaled to −1…1'],
            ['Noise', '1 number', '64 numbers (lab-02)'],
            ['Generator', '1 → 16 → 1', '64 → 256 → 512 → 784, then Tanh'],
            ['Discriminator', '1 → 16 → 1 + Sigmoid', '784 → 512 → 256 → 1 · LeakyReLU(0.2) · Sigmoid'],
            ['Training loop', 'Step A, Step B, repeat', 'Step A, Step B, repeat — unchanged'],
          ]}
          highlight={[4]}
        />
      ),
    },

    /* ---------------- Your turn ---------------- */
    {
      id: 's4-full-code',
      section: 'Your turn',
      kicker: 'The whole loop',
      title: 'The complete training loop fits on one screen',
      notes: {
        time: '3 min',
        say: 'This is the compact version from the notes — networks, loss and optimizers above it, ten lines of loop. Ask learners to find Step A, Step B and the detach before the lab.',
        ask: 'Can you point to Step A, Step B and the detach in this compact form?',
      },
      render: () => (
        <Split
          ratio="1.6fr 1fr"
          left={<Code
            title="core loop · the compact version"
            code={`for epoch in range(1, 2001):
    # Step A: train D
    real_data = torch.tensor([[7.0]])
    fake = generator(torch.randn(1, 1)).detach()
    dis_loss = loss_fn(discriminator(real_data), real_label) \\
             + loss_fn(discriminator(fake), fake_label)
    dis_opt.zero_grad(); dis_loss.backward(); dis_opt.step()

    # Step B: train G
    fake = generator(torch.randn(1, 1))
    gen_loss = loss_fn(discriminator(fake), real_label)
    gen_opt.zero_grad(); gen_loss.backward(); gen_opt.step()`}
            marks={{ 4: 'yellow', 7: 'coral', 12: 'mint' }}
          />}
          right={<Cards cols={1} items={[
            { tag: 'Find', title: 'Step A · Step B · detach', body: 'Lines 2–7 · lines 9–12 · line 4', tone: 'blue' },
            { tag: 'Then', title: 'Generate with no_grad()', body: 'with torch.no_grad(): generator(torch.randn(1, 1)) — no gradients needed to generate.', tone: 'mint' },
          ]} />}
        />
      ),
    },
    {
      id: 's4-lab-01',
      section: 'Your turn',
      kicker: 'Lab demo',
      title: 'Lab 01: train the 7-GAN yourself, then break it four ways',
      notes: {
        time: '10 min demo · 45 min lab',
        say: 'Run Parts 2–5 live and read the progress prints; then Part 7. The PyTorch run will take a different path from the browser lab — judge where it settles, not the route. For Part 9, pairs pick one experiment and must write a prediction first. From our browser checks: a negative target (−3) was found as easily as 7, so expect −5 to work; very small networks are fragile (2 hidden units sometimes died or stalled near 10.5); a faster learning rate still lands near 7 but with a wider spread.',
        ask: 'Which experiment do you predict will fail — and how will you recognise it in the printout?',
      },
      render: () => (
        <LabDemo
          notebook="lab-01-simple-gan.ipynb"
          minutes={45}
          goal="Build and train the number-7 GAN, then break it on purpose and explain what you see."
          steps={[
            'Parts 2–4: build G and D (49 parameters each), BCE + two Adam optimizers',
            'Part 5: train 2000 epochs — progress prints at 1, 50, 100 … 2000',
            'Part 7: 20 samples under torch.no_grad() — mean ≈ 7',
            'Part 9: targets 3, 7, 15, −5 · four lr pairs · hidden 4 / 16 / 64 / 256 · learn N(7, 1)',
          ]}
          watch={[
            'Healthy: losses hover near D ≈ 1.39 and G ≈ 0.69 — neither drops to 0',
            'Your run differs from the browser lab — compare where it settles',
            'Experiment 4 learns a whole distribution, N(7, 1): outputs must vary',
          ]}
          yourTurn="Write a prediction before each experiment, then explain the gap between prediction and result."
        />
      ),
    },

    /* ---------------- Check ---------------- */
    {
      id: 's4-check',
      section: 'Check',
      kicker: 'Knowledge check · First GAN',
      title: 'Explain the build without looking at the code',
      reveal: true,
      notes: {
        time: '6 min',
        say: 'Silent thinking for a minute, then pairs. Reveal and spend the most time on question 5 — it is the whole point of GANs.',
        ask: 'Which answer would you have got wrong before this part?',
      },
      render: ({ revealed }) => (
        <Quiz
          revealed={revealed}
          items={[
            { q: 'What does the Generator take as input, and what does it output?', a: 'Random noise (one number here) → one number trying to look like the real data.' },
            { q: 'What does the Discriminator output, and what does it mean?', a: 'A probability (via Sigmoid) that its input is real: 1 = real, 0 = fake, 0.5 = can’t tell.' },
            { q: 'Why does G use real_label in its loss?', a: 'G wants D to say “real”: BCE(D(G(z)), 1) = −log D(G(z)) is large when D catches the fake.' },
            { q: 'What does .detach() do in Step A, and why?', a: 'Cuts the graph at the fake so only D gets gradients: no wasted backprop through G and no stray gradients in G’s .grad.' },
            { q: 'G never saw 7. How did it learn to produce it?', a: 'D learned that 7 looks real; the gradient of D’s verdict with respect to its input pointed G toward 7.' },
            { q: 'Why two separate optimizers?', a: 'Each updates only its own network. One shared optimizer would also step D in Step B — using gen_loss gradients that train D to be fooled.' },
          ]}
        />
      ),
    },
    {
      id: 's4-bridge',
      section: 'Check',
      kicker: 'Next',
      title: 'Same loop, 784 pixels: what has to change when G draws images?',
      layout: 'bridge',
      notes: {
        time: '1 min',
        say: 'Celebrate: that was a real GAN. In the next part the output becomes 784 pixels — the loop stays, but the data, the activations and eventually the layers change.',
        ask: 'Which activation would you put at the end of G if the outputs had to be pixels between −1 and 1?',
      },
      render: () => (
        <Bridge
          done="First GAN · complete — you trained a GAN"
          question="Same loop, 784 pixels: what has to change when G draws images?"
          next="Next part · GANs for images"
        />
      ),
    },
  ],
};
