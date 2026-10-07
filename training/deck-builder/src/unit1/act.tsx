import './act.css';
import { Bridge, Card, Cards, Code, Divider, Equation, Flow, FormulaSteps, FormulaTerms, Quiz, Split, Stats, T, Table, Takeaway, Versus } from '../components/kit';
import { ActivationExplorer, PixelNormLab, SaturationLab } from '../labs/ActLabs';
import type { Part } from '../types';

export const actPart: Part = {
  id: 'act',
  code: 'ACT',
  label: 'Activations',
  title: 'Activation functions in GANs',
  when: '',
  minutes: 45,
  slides: [
    {
      id: 'act-divider',
      section: 'Two jobs',
      kicker: 'Companion lesson',
      title: 'Activation functions in GANs',
      layout: 'divider',
      notes: {
        time: '1 min',
        say: 'A practical companion to the GANs you just built — the number 7 and the MNIST/DCGAN image GANs. About 45 minutes including discussion.',
        ask: 'In the lab-03 DCGAN you just saw, where does each activation sit?',
      },
      render: () => (
        <Divider
          code="ACT"
          title="Activation functions in GANs"
          promise="Build features. Match pixels. Keep gradients flowing. What to use in the Generator vs the Discriminator — and why."
          items={['ReLU & Leaky ReLU', 'Tanh & pixel ranges', 'Sigmoid, logits & BCE', 'Saturation & G’s gradient', 'The DCGAN recipe']}
        />
      ),
    },
    {
      id: 'act-two-jobs',
      section: 'Two jobs',
      kicker: 'Same parts, different jobs',
      title: 'One GAN, two networks with opposite jobs',
      notes: {
        time: '2 min',
        say: 'An activation changes a layer’s output on the way forward. On the way back, its derivative scales the gradient. Both directions matter in a GAN, because G learns only through D’s gradient.',
        ask: 'Why might the network that creates images want a different last activation from the network that judges them?',
      },
      render: () => (
        <>
          <Versus
            left={{ tag: 'Generator · creates', title: 'Noise → features → fake image', body: 'Its last activation must land in the same range as real pixels.', tone: 'mint' }}
            right={{ tag: 'Discriminator · judges', title: 'Image → evidence → real/fake score', body: 'Its last layer must produce a score the loss can read as “how real?”.', tone: 'coral' }}
          />
          <Takeaway>Activations shape both the forward signal and the backward gradient — and G’s only teacher is that gradient.</Takeaway>
        </>
      ),
    },
    {
      id: 'act-four',
      section: 'Two jobs',
      kicker: 'The four to know',
      title: 'Four activations cover the classic GAN recipe',
      notes: {
        time: '2 min',
        say: 'This is the practical starting recipe from DCGAN. Separate a good default from a rule for every architecture — modern GANs use other choices too.',
        ask: 'Which of these four produces negative outputs?',
      },
      render: () => (
        <>
          <Table
            headers={['Function', 'Where (classic)', 'Output range', 'Main idea']}
            rows={[
              [<T tone="mint">ReLU</T>, 'G hidden layers', '[0, ∞)', 'Pass positives; block negatives'],
              [<T tone="coral">Leaky ReLU</T>, 'D hidden layers', '(−∞, ∞)', 'Keep a small slope for negatives'],
              [<T tone="blue">Tanh</T>, 'G image output', '(−1, +1)', 'Match images normalized to [−1, +1]'],
              [<T tone="yellow">Sigmoid</T>, 'D probability output', '(0, 1)', 'Map a logit to a probability'],
            ]}
          />
          <Takeaway>Classic GAN / DCGAN defaults — not universal requirements.</Takeaway>
        </>
      ),
    },
    {
      id: 'act-relu',
      section: 'Hidden layers',
      kicker: 'ReLU · the Generator’s builder',
      title: 'ReLU passes positives — a unit that stays negative stops learning',
      notes: {
        time: '2 min',
        say: 'ReLU is the classic DCGAN generator hidden activation: simple, fast, slope 1 on the positive side. Dying ReLU means persistent inactivity across the data — not one negative activation. At zero ReLU has a kink; PyTorch uses derivative 0 there.',
        ask: 'Your hidden unit outputs 0 for this sample. Is it dead?',
      },
      render: () => (
        <Split
          ratio="1fr 1.1fr"
          left={<>
            <Equation size="lg" reading="Derivative: 0 for x < 0 · 1 for x > 0">f(x) <span className="op">=</span> max(0, x)</Equation>
            <Flow size="sm" nodes={[{ label: 'in', value: '−5 → 0', tone: 'coral' }, { label: 'in', value: '−1 → 0', tone: 'coral' }, { label: 'in', value: '2 → 2', tone: 'mint' }, { label: 'in', value: '5 → 5', tone: 'mint' }]} />
          </>}
          right={<div className="stack gap-md">
            <Card tag="One negative input" title="Output 0, local gradient 0 — for this sample" body="The unit can still fire for other samples. A zero on one sample is not proof of a dead neuron." tone="yellow" />
            <Card tag="A dead unit" title="Negative for every sample, every step" body="Its incoming weights stop receiving useful gradient — the unit no longer learns." tone="coral" />
          </div>}
        />
      ),
    },
    {
      id: 'act-leaky',
      section: 'Hidden layers',
      kicker: 'Leaky ReLU · the Discriminator’s choice',
      title: 'Leaky ReLU leaves a small path open for negative evidence',
      notes: {
        time: '2 min',
        say: 'α = 0.2 is the common GAN choice, not every framework’s default (PyTorch defaults to 0.01). A non-zero slope lowers dead-unit risk and lets negative features still influence D’s verdict — and therefore the gradient G receives. It does not prevent every vanishing gradient.',
        ask: 'Why does D in particular care about keeping negative features alive?',
      },
      render: () => (
        <>
          <Equation size="md" reading="slope α = 0.2 for negatives:  −5 → −1  ·  −1 → −0.2  ·  2 → 2">f(x) <span className="op">=</span> max(x, <T tone="violet">0.2</T>·x)</Equation>
          <Versus
            left={{ tag: 'ReLU at x = −5', title: 'Output 0 · slope 0', body: 'The evidence is erased and no gradient flows back through it.', tone: 'coral' }}
            right={{ tag: 'Leaky ReLU at x = −5', title: 'Output −1 · slope 0.2', body: 'The evidence still counts, and a gradient still flows.', tone: 'mint' }}
          />
          <Flow size="sm" nodes={[{ value: 'Image', tone: 'blue' }, { op: '→' }, { value: 'Conv / Linear' }, { op: '→' }, { value: 'LeakyReLU(0.2)', tone: 'coral' }, { op: '→' }, { value: '…' }, { op: '→' }, { value: 'score', tone: 'coral' }]} />
        </>
      ),
    },
    {
      id: 'act-leaky-terms',
      section: 'Hidden layers',
      kicker: 'Formula · term by term',
      title: 'One number, α, decides how much negative evidence survives',
      notes: {
        time: '2 min',
        say: 'Leaky ReLU is two straight lines. Positive inputs pass unchanged with slope 1. Negative inputs are multiplied by α — and so is any gradient flowing back through them. α = 0 is plain ReLU; GANs use 0.2 in D; PyTorch’s default is 0.01.',
        ask: 'With α = 0.2, what fraction of the incoming gradient flows back through x = −5?',
      },
      render: () => (
        <FormulaTerms
          symbolWidth="6rem"
          reading="f(x) = x when x is positive, α·x otherwise  ·  slope = 1 or α"
          formula={<>f(<T tone="blue">x</T>)<span className="op">=</span>max(<T tone="violet">α</T><T tone="blue">x</T>, <T tone="blue">x</T>)<span className="op">·</span>f′(<T tone="blue">x</T>)<span className="op">=</span>1 or <T tone="violet">α</T></>}
          terms={[
            { symbol: 'x', name: 'Pre-activation', meaning: 'The layer’s weighted sum, before the activation', range: 'any real', tone: 'blue' },
            { symbol: 'α', name: 'Negative slope', meaning: '0 = ReLU · 0.2 = GAN D · 0.01 = PyTorch default', range: '0 … 1', tone: 'violet' },
            { symbol: 'x > 0', name: 'Positive side', meaning: 'Output x, slope 1 — passes unchanged', range: '2 → 2', tone: 'mint' },
            { symbol: 'x ≤ 0', name: 'Negative side', meaning: 'Output α·x, slope α — scaled, not erased', range: '−5 → −1', tone: 'coral' },
          ]}
        />
      ),
    },
    {
      id: 'act-explorer',
      section: 'Hidden layers',
      kicker: 'Try it · signal and slope',
      title: 'Drag x to the edges: which curves flatten, which keep their slope?',
      lab: true,
      notes: {
        time: '4 min',
        say: 'Start at x = −2, then sweep to −5 and +5. Switch to the slope view. ReLU’s slope is 0 for all negatives; Leaky keeps 0.2; Tanh and Sigmoid flatten at both ends — σ′ peaks at 0.25 at x = 0, tanh′ at 1. These are local slopes only, not the full GAN loss gradient.',
        ask: 'Before moving the slider: at x = 5, which function has the smallest slope?',
      },
      render: () => <ActivationExplorer />,
    },
    {
      id: 'act-tanh-terms',
      section: 'Output layers',
      kicker: 'Formula · term by term',
      title: 'Tanh squashes any score into −1 … +1 — exactly the pixel range',
      notes: {
        time: '2 min',
        say: 'Tanh is an S-curve centred on zero: tanh(0) = 0 is mid-grey, large positive scores approach +1 (white), large negative ones −1 (black). Its slope 1 − tanh² is 1 at the centre and almost 0 in the tails — saturated pixels learn slowly.',
        ask: 'What is the slope of tanh at x = 2, where the output is 0.964?',
      },
      render: () => (
        <FormulaTerms
          symbolWidth="9rem"
          reading="tanh(x) = (eˣ − e⁻ˣ) ÷ (eˣ + e⁻ˣ)  ·  slope = 1 − tanh²(x)"
          cols={2}
          formula={<>tanh(<T tone="blue">x</T>)<span className="op">=</span><span className="frac"><span>e<sup>x</sup> − e<sup>−x</sup></span><span>e<sup>x</sup> + e<sup>−x</sup></span></span><span className="op">·</span>slope<span className="op">=</span>1 − tanh²(<T tone="blue">x</T>)</>}
          terms={[
            { symbol: 'x', name: 'G’s last pre-activation', meaning: 'Raw score for one pixel', range: 'any real', tone: 'blue' },
            { symbol: 'tanh(x)', name: 'Generated pixel', meaning: 'Matches normalized real pixels', range: '−1 … +1', tone: 'mint' },
            { symbol: 'tanh(0)', name: 'Centre', meaning: 'Score 0 → mid-grey', range: '0', tone: 'plain' },
            { symbol: '1 − tanh²', name: 'Local slope', meaning: '1 at x = 0 · 0.071 at x = 2 · 0.00018 at x = 5', range: '0 … 1', tone: 'violet' },
          ]}
        />
      ),
    },
    {
      id: 'act-tanh-pixels',
      section: 'Output layers',
      kicker: 'Tanh · the Generator’s finish',
      title: 'Tanh outputs (−1, +1), so real pixels must be scaled to match',
      lab: true,
      notes: {
        time: '3 min',
        say: 'Tanh approaches ±1 asymptotically (tanh(±3) ≈ ±0.995). Real images are scaled the same way so D compares like with like. Watch the trap: after ToTensor the data is already in [0, 1] — then use x * 2 − 1, not /127.5 again. Drag to 0 and 255 and note that tanh can only reach the ends at ±infinity.',
        ask: 'What byte value maps to 0 — and what color is it?',
      },
      render: () => <PixelNormLab />,
    },
    {
      id: 'act-output-range',
      section: 'Output layers',
      kicker: 'Choose them together',
      title: 'The output activation and the data preprocessing are one decision',
      notes: {
        time: '2 min',
        say: 'Connect to the first GAN: our Generator for the number 7 ended in a plain Linear layer, because 7 is outside every bounded range. A ReLU output can never produce a negative normalized pixel — D would get an easy shortcut.',
        ask: 'What would have happened if our first-GAN Generator had ended in Tanh?',
      },
      render: () => (
        <Split
          ratio="1.25fr 1fr"
          align="start"
          left={<Table
            headers={['G output', 'Real data range', 'Use case']}
            rows={[
              ['Tanh', '[−1, +1]', 'Common GAN image recipe'],
              ['Sigmoid', '[0, 1]', 'Another bounded image convention'],
              ['Linear', 'Task-dependent', 'Unbounded values — e.g. our target 7'],
              ['ReLU ✕', '[0, ∞)', 'Cannot produce negative pixels'],
            ]}
            highlight={[2]}
          />}
          right={<Code
            title="Normalize in, de-normalize out"
            code={`# real tensor already in [0, 1]
real_images = real_images * 2 - 1

# show generated images
display = ((fake + 1) / 2).clamp(0, 1)`}
            marks={{ 2: 'blue', 5: 'mint' }}
          />}
        />
      ),
    },
    {
      id: 'act-sigmoid',
      section: 'Discriminator output',
      kicker: 'Sigmoid · from score to probability',
      title: 'Sigmoid turns D’s raw score into a probability; BCE turns that into a loss',
      notes: {
        time: '2 min',
        say: 'Keep two ideas separate. The activation has no labels: it just maps a logit to (0, 1). The loss compares that prediction with a target. The probability is the model’s output, not a guarantee of calibration.',
        ask: 'Where does the target label (real = 1, fake = 0) enter this chain?',
      },
      render: () => (
        <>
          <Equation size="md">σ(<T tone="coral">a</T>) <span className="op">=</span> <span className="frac"><span>1</span><span>1 + e<sup>−a</sup></span></span></Equation>
          <Stats items={[
            { value: '0.018', label: 'logit −4 → “almost surely fake”', tone: 'coral' },
            { value: '0.500', label: 'logit 0 → “can’t tell”', tone: 'plain' },
            { value: '0.982', label: 'logit +4 → “almost surely real”', tone: 'mint' },
          ]} />
          <Flow size="sm" nodes={[{ label: 'D outputs', value: 'logit a', tone: 'coral' }, { op: '→' }, { label: 'activation', value: 'Sigmoid', tone: 'yellow' }, { op: '→' }, { label: 'prediction', value: 'p', tone: 'blue' }, { op: '+' }, { label: 'label', value: 'target y' }, { op: '→' }, { label: 'loss', value: 'BCE', tone: 'violet' }]} />
        </>
      ),
    },
    {
      id: 'act-sigmoid-steps',
      section: 'Discriminator output',
      kicker: 'Formula · worked',
      title: 'Sigmoid’s slope peaks at 0.25 and fades fast in the tails',
      notes: {
        time: '2 min',
        say: 'Compute σ and its slope σ(1 − σ) at two logits. At 0 the curve is steepest: 0.25. At 4 the output is already 0.982 and the slope is 14 times smaller. At ±10 it is about 0.000045 — the saturation the next lab explores.',
        ask: 'Why can σ′ never exceed 0.25?',
      },
      render: () => (
        <FormulaSteps
          formula={<>σ′(<T tone="coral">a</T>)<span className="op">=</span>σ(<T tone="coral">a</T>) · (1 − σ(<T tone="coral">a</T>))</>}
          given={['logit a = 0', 'logit a = 4']}
          steps={[
            { math: <>σ(0) = 1 / (1 + e⁰) = 0.5</>, note: '“can’t tell”' },
            { math: <>σ′(0) = 0.5 · 0.5 = 0.25</>, note: 'steepest point' },
            { math: <>σ(4) = 1 / (1 + e⁻⁴) = 0.982</>, note: 'e⁻⁴ = 0.018' },
            { math: <>σ′(4) = 0.982 · 0.018 = 0.0177</>, note: '14× flatter' },
          ]}
          result={<>σ′ ≤ 0.25 · σ′(±10) ≈ 0.000045</>}
        />
      ),
    },
    {
      id: 'act-bce-paths',
      section: 'Discriminator output',
      kicker: 'Two valid pairings',
      title: 'Give BCEWithLogitsLoss raw logits — never a Sigmoid output',
      notes: {
        time: '2 min',
        say: 'PyTorch fuses Sigmoid and BCE into one numerically stable computation. That improves numerical behavior; it does not fix GAN optimization problems. The classic bug is a double Sigmoid: D ends in Sigmoid AND the loss applies another one.',
        ask: 'D ends in nn.Sigmoid() and you use BCEWithLogitsLoss. What range do the “logits” now have, and what goes wrong?',
      },
      render: () => (
        <Split
          ratio="1.2fr 1fr"
          align="start"
          left={<>
            <Table
              headers={['D returns', 'Loss', 'Pairing']}
              rows={[
                ['Probability (ends in Sigmoid)', 'nn.BCELoss()', 'Classic — first GAN and labs 02–04'],
                ['Raw logit (no final Sigmoid)', 'nn.BCEWithLogitsLoss()', 'Numerically stable combined form'],
              ]}
              highlight={[1]}
            />
            <Takeaway tone="coral">Sigmoid then BCEWithLogitsLoss = a double Sigmoid. Outputs squeeze into (0.5, 0.73) and learning is distorted.</Takeaway>
          </>}
          right={<Code
            title="The stable path"
            code={`criterion = nn.BCEWithLogitsLoss()
loss = criterion(logits, targets)

# only when displaying probabilities:
probabilities = torch.sigmoid(logits)`}
            marks={{ 1: 'mint', 5: 'yellow' }}
          />}
        />
      ),
    },
    {
      id: 'act-bce-logits-steps',
      section: 'Discriminator output',
      kicker: 'Formula · worked',
      title: 'BCEWithLogitsLoss gives the same number as Sigmoid + BCE — computed safely',
      notes: {
        time: '2 min',
        say: 'Take a logit of 2 and target 1. The two-step path computes σ(2) = 0.881, then −log 0.881 = 0.127. The fused loss computes log(1 + e⁻²) directly — same value, no tiny probabilities to take logs of. Feed it a probability instead and the "logits" live in (0, 1), so σ squeezes them into (0.5, 0.731).',
        ask: 'With a double Sigmoid, can D ever output less than 0.5?',
      },
      render: () => (
        <FormulaSteps
          formula={<>BCEWithLogits(<T tone="coral">a</T>, <T tone="blue">y</T>)<span className="op">=</span>BCE(σ(<T tone="coral">a</T>), <T tone="blue">y</T>)</>}
          given={['raw logit a = 2', 'target y = 1']}
          steps={[
            { math: <>σ(2) = 0.881</>, note: 'what a Sigmoid layer would output' },
            { math: <>−log 0.881 = 0.127</>, note: 'two-step path: Sigmoid, then BCELoss' },
            { math: <>log(1 + e⁻²) = 0.127</>, note: 'fused path: same value, numerically stable' },
            { math: <>σ(0 … 1) = 0.5 … 0.731</>, note: 'bug: probabilities fed in as logits' },
          ]}
          result={<>pass raw logits — never a Sigmoid output</>}
        />
      ),
    },
    {
      id: 'act-saturation',
      section: 'Gradients',
      kicker: 'Try it · a confident Discriminator',
      title: 'When D confidently rejects a fake, the loss choice decides whether G still learns',
      lab: true,
      notes: {
        time: '4 min',
        say: 'Predict first: early in training D rejects fakes confidently — a far to the left, σ flat. Does G’s signal vanish? With the original minimax loss log(1 − σ(a)), the derivative is −σ(a) ≈ 0. With the non-saturating loss −log σ(a), it is σ(a) − 1 ≈ −1. Goodfellow et al. proposed the non-saturating version for exactly this reason, and BCE(D(fake), 1) — what we coded in the first GAN — is that version. These are scalar derivatives before the chain rule through D and G.',
        ask: 'Set a = −8. How many times stronger is the non-saturating signal?',
      },
      render: () => <SaturationLab />,
    },
    {
      id: 'act-grad-path',
      section: 'Gradients',
      kicker: 'Trace the gradient',
      title: 'G only learns if the gradient can travel back through D',
      notes: {
        time: '2 min',
        say: 'Every activation in D sits on G’s gradient path. In the D step we detach fakes so G is untouched. In the G step we keep the path through D but only step G’s optimizer. Freezing D’s parameters is not the same as torch.no_grad() around D — no_grad would cut the very path G needs.',
        ask: 'Why would wrapping D in torch.no_grad() during the G step silently stop G from learning?',
      },
      render: () => (
        <>
          <Flow size="sm" nodes={[{ label: 'forward', value: 'z', tone: 'blue' }, { op: '→' }, { value: 'G', tone: 'mint' }, { op: '→' }, { value: 'fake' }, { op: '→' }, { value: 'D', tone: 'coral' }, { op: '→' }, { value: 'logit' }, { op: '→' }, { value: 'G loss', tone: 'yellow' }]} />
          <Flow size="sm" nodes={[{ label: 'backward', value: 'G', tone: 'mint' }, { op: '←' }, { value: 'fake' }, { op: '←' }, { value: 'D', tone: 'coral' }, { op: '←' }, { value: 'logit' }, { op: '←' }, { value: 'G loss', tone: 'yellow' }]} />
          <Cards cols={2} items={[
            { tag: 'Train D', title: 'Detach the fakes', body: <code>D(G(z).detach())</code>, tone: 'coral' },
            { tag: 'Train G', title: 'Keep the path through D', body: 'Backprop through D to G; step only G’s optimizer. No torch.no_grad() around D.', tone: 'mint' },
          ]} />
        </>
      ),
    },
    {
      id: 'act-dcgan-map',
      section: 'The recipe',
      kicker: 'lab-03 · read the activations',
      title: 'In lab-03, every activation sits exactly where the DCGAN recipe puts it',
      notes: {
        time: '2 min',
        say: 'Same networks as the GANs-for-images part — now read only the activations. G: ReLU after every hidden layer, Tanh last. D: LeakyReLU(0.2) after every conv, Sigmoid last because lab-03 pairs D with BCELoss. Normalisation layers are shown faded: they are not activations.',
        ask: 'Which one line would you delete to switch lab-03’s D to BCEWithLogitsLoss?',
      },
      render: () => (
        <div className="act-map">
          <div className="act-col tone-mint">
            <small>GENERATOR · lab-03</small>
            <div className="flow-node tone-blue"><strong>z · 100</strong><span>noise</span></div><span className="act-down">↓</span>
            <div className="flow-node tone-plain"><strong>Linear → 256 × 7 × 7</strong><span>+ ReLU</span></div><span className="act-down">↓</span>
            <div className="flow-node tone-plain"><strong>ConvTranspose → 128 × 14 × 14</strong><span>BatchNorm + ReLU</span></div><span className="act-down">↓</span>
            <div className="flow-node tone-mint"><strong>ConvTranspose → 1 × 28 × 28</strong><span>+ Tanh → [−1, 1]</span></div>
          </div>
          <div className="act-col tone-coral">
            <small>DISCRIMINATOR · lab-03</small>
            <div className="flow-node tone-blue"><strong>image 1 × 28 × 28</strong><span>scaled to [−1, 1]</span></div><span className="act-down">↓</span>
            <div className="flow-node tone-plain"><strong>Conv → 64 × 14 × 14</strong><span>+ LeakyReLU(0.2)</span></div><span className="act-down">↓</span>
            <div className="flow-node tone-plain"><strong>Conv → 128 × 7 × 7</strong><span>BatchNorm + LeakyReLU(0.2)</span></div><span className="act-down">↓</span>
            <div className="flow-node tone-coral"><strong>Flatten → Linear → 1</strong><span>+ Sigmoid → P(real) · or a raw logit</span></div>
          </div>
        </div>
      ),
    },
    {
      id: 'act-mnist-code',
      section: 'The recipe',
      kicker: 'Hands-on · lab-02',
      title: 'Switch the MNIST Discriminator to logits: delete one line, change one line',
      notes: {
        time: '3 min',
        say: 'Left is lab-02’s D from the GANs-for-images part: Sigmoid last, paired with BCELoss. Right is the numerically stable version: drop the Sigmoid, swap in BCEWithLogitsLoss. The training loop does not change; only display code needs torch.sigmoid. Doing one change without the other is the double-Sigmoid bug.',
        ask: 'If you delete the Sigmoid but keep nn.BCELoss, what goes wrong?',
      },
      render: () => (
        <Split
          align="start"
          left={<Code
            title="GANs for images · lab-02 (probability path)"
            code={`D = nn.Sequential(
    nn.Linear(784, 512), nn.LeakyReLU(0.2),
    nn.Linear(512, 256), nn.LeakyReLU(0.2),
    nn.Linear(256, 1),   nn.Sigmoid(),
)
loss_fn = nn.BCELoss()`}
            marks={{ 4: 'coral', 6: 'coral' }}
            notes={{ 4: 'probability out', 6: 'expects (0, 1)' }}
          />}
          right={<Code
            title="Stable path (raw logit)"
            code={`D = nn.Sequential(
    nn.Linear(784, 512), nn.LeakyReLU(0.2),
    nn.Linear(512, 256), nn.LeakyReLU(0.2),
    nn.Linear(256, 1),   # raw logit
)
loss_fn = nn.BCEWithLogitsLoss()`}
            marks={{ 4: 'mint', 6: 'mint' }}
            notes={{ 4: 'Sigmoid removed', 6: 'Sigmoid inside the loss' }}
          />}
        />
      ),
    },
    {
      id: 'act-debug',
      section: 'The recipe',
      kicker: 'Experiment and debug',
      title: 'Test alternatives fairly, and match each symptom to its first check',
      notes: {
        time: '3 min',
        say: 'GELU and SiLU are smooth, but smooth does not guarantee better GAN training — compare within the same architecture, same seeds, several seeds, and judge samples not just loss curves. Changing G’s output range means changing preprocessing too, or D gets an easy shortcut. Mode collapse and oscillation have many causes; activations are one clue among data, capacity, optimizer, learning rates and loss.',
        ask: 'You swap D’s ReLU for LeakyReLU and samples improve on one seed. What else must you check before believing it?',
      },
      render: () => (
        <Split
          ratio="1fr 1.5fr"
          align="start"
          left={<div className="stack gap-md">
            <Card tag="Options to test" title="GELU · x Φ(x)  ·  SiLU · x σ(x)" body="Smooth, with small negative outputs." tone="violet" />
            <Card tag="Fair experiment" title="Change one thing" body="Same data, loss, steps and several seeds. Judge samples, not only losses." tone="yellow" />
          </div>}
          right={<Table
            headers={['Symptom', 'Check first']}
            rows={[
              ['G’s outputs can’t reach real data', 'Output activation vs preprocessing range'],
              ['BCE training behaves strangely', 'Double Sigmoid or wrong loss pairing'],
              ['Many D features stuck at zero', 'Persistent ReLU inactivity → LeakyReLU'],
              ['G stops improving', 'Loss objective (non-saturating?), gradient norms, G/D balance'],
            ]}
          />}
        />
      ),
    },
    {
      id: 'act-check',
      section: 'Check',
      kicker: 'Knowledge check',
      title: 'Explain each choice before you reveal it',
      reveal: true,
      notes: {
        time: '4 min',
        say: 'Let participants answer first — in pairs if possible — then press R to reveal all answers in place.',
        ask: 'Which answer would you most likely have gotten wrong in your own code?',
      },
      render: ({ revealed }) => (
        <Quiz revealed={revealed} cols={3} items={[
          { q: 'G ends in Tanh. How must real images be scaled?', a: 'To [−1, +1]: x * 2 − 1 for a [0, 1] tensor (or byte / 127.5 − 1).' },
          { q: 'You use BCEWithLogitsLoss. Should D end in Sigmoid?', a: 'No — pass raw logits. Apply torch.sigmoid only to display probabilities.' },
          { q: 'ReLU(−5) vs LeakyReLU(−5) with α = 0.2?', a: '0 vs −1. Local slopes: 0 vs 0.2.' },
          { q: 'σ is flat when D confidently rejects a fake. Does G’s signal vanish?', a: 'Not with the non-saturating loss: ∂/∂a = σ(a) − 1 ≈ −1. Only minimax’s −σ(a) ≈ 0 vanishes.' },
          { q: 'G ends in ReLU; real images are in [−1, 1]. What can D exploit?', a: 'Any negative pixel must be real — G can never produce one. An easy shortcut.' },
          { q: 'Why did the first GAN’s Generator end with no activation?', a: '7 lies outside Tanh’s (−1, 1) and Sigmoid’s (0, 1); only a Linear output can reach it.' },
        ]} />
      ),
    },
    {
      id: 'act-cheat',
      section: 'Check',
      kicker: 'Cheat sheet',
      title: 'Architecture, activation, data range and loss must agree',
      notes: {
        time: '2 min',
        say: 'This is the classic image GAN recipe. Other objectives use other choices — Unit 2’s WGAN critic outputs a raw score that is not a BCE logit at all. Sources: Radford et al. (DCGAN), Goodfellow et al. (non-saturating loss), PyTorch BCEWithLogitsLoss docs.',
        ask: 'Which of these four would you check first if fakes look washed out?',
      },
      render: () => (
        <div className="act-cheat">
          <article className="tone-mint">
            <h3>GENERATOR</h3>
            <dl>
              <dt>BUILD</dt><dd>ReLU<span>hidden layers create features</span></dd>
              <dt>FINISH</dt><dd>Tanh<span>match real images scaled to [−1, +1]</span></dd>
            </dl>
          </article>
          <article className="tone-coral">
            <h3>DISCRIMINATOR</h3>
            <dl>
              <dt>DETECT</dt><dd>LeakyReLU(0.2)<span>keep negative evidence and its gradient</span></dd>
              <dt>SCORE</dt><dd>Sigmoid + BCELoss<span>the labs · or a raw logit + BCEWithLogitsLoss (stable)</span></dd>
            </dl>
          </article>
        </div>
      ),
    },
    {
      id: 'act-bridge',
      section: 'Check',
      kicker: 'Next',
      title: 'Activations keep G’s gradient flowing — next we ask whether BCE points it the right way',
      layout: 'bridge',
      notes: {
        time: '1 min',
        say: 'Homework: annotate every activation in lab-02 and lab-03 with its job and output range. The non-saturating loss keeps G’s signal alive, but a too-good D still gives poor direction — Unit 2 · L07 shows why BCE itself is the problem, and WGAN replaces it.',
        ask: 'After this unit, what would you change first: the architecture, the activations, or the loss?',
      },
      render: () => <Bridge done="Unit 1 · complete" question="G’s gradient stays alive — but is BCE pointing it the right way?" next="Unit 2 · Better loss: from BCE to WGAN-GP" />,
    },
  ],
};
