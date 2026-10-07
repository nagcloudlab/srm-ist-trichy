import './s5.css';
import { Answer, Bridge, Cards, FormulaSteps, FormulaTerms, LabDemo, Code, Divider, Equation, Flow, Mapping, Predict, ProsCons, Quiz, Recap, Split, Stack, Stats, Steps, T, Table, Takeaway, Versus } from '../components/kit';
import { digitGrid, mulberry32, PixelDigit, Plot } from '../components/art';
import { CollapseLab, ConvLab, NumGrid, ShapeLab } from '../labs/S5Labs';
import type { Part } from '../types';

/* ---------- local visuals ---------- */

/** Draw any 14×14 intensity grid the way PixelDigit does. */
function GridImage({ values, size = 14, px = 170, label }: { values: number[]; size?: number; px?: number; label: string }) {
  return (
    <svg className="pixel-digit" viewBox={`0 0 ${size} ${size}`} width={px} height={px} role="img" aria-label={label} shapeRendering="crispEdges">
      <rect width={size} height={size} fill="#111827" />
      {values.map((v, i) => v > 0.02 && <rect key={i} x={i % size} y={Math.floor(i / size)} width="1" height="1" fill="#f7f4ed" opacity={v} />)}
    </svg>
  );
}

/** The same pixels in a fixed random order — what a Linear layer “sees” is no different. */
function ShuffleDemo() {
  const seven = digitGrid('7', 14, 0, 0, 3, 0.03);
  const three = digitGrid('3', 14, 0, 0, 4, 0.03);
  const rand = mulberry32(2024);
  const perm = Array.from({ length: 196 }, (_, i) => i);
  for (let i = perm.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [perm[i], perm[j]] = [perm[j], perm[i]]; }
  const shuffle = (g: number[]) => perm.map((p) => g[p]);
  return (
    <div className="s5-shuffle">
      <div className="s5-shuffle-row">
        <small>What you see</small>
        <GridImage values={seven} label="a seven" px={130} />
        <GridImage values={three} label="a three" px={130} />
      </div>
      <div className="s5-shuffle-row">
        <small>Same pixels, one fixed shuffle</small>
        <GridImage values={shuffle(seven)} label="the seven, pixels shuffled" px={130} />
        <GridImage values={shuffle(three)} label="the three, pixels shuffled" px={130} />
      </div>
    </div>
  );
}

const CONV_IMAGE = [1, 0, 1, 0, 0, 0, 1, 1, 1, 0, 1, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 1, 0, 0];
const CONV_FILTER = [1, 0, 1, 0, 1, 0, 1, 0, 1];
const PATCH_00 = [1, 0, 1, 0, 1, 1, 1, 1, 1];

function ProgressStrip() {
  const stages = [
    { epoch: 'Epoch 1', note: 'random pixels', noise: 1, blur: 0 },
    { epoch: 'Epoch 10', note: 'blobs', noise: 0.55, blur: 1 },
    { epoch: 'Epoch 30', note: 'digit-like shapes', noise: 0.25, blur: 0.67 },
    { epoch: 'Epoch 50', note: 'readable, but soft', noise: 0.12, blur: 0.34 },
  ];
  return (
    <div className="s5-strip">
      {stages.map((s, i) => (
        <figure key={s.epoch}>
          <div className="s5-strip-row">
            {['7', '3', '0'].map((d, k) => <PixelDigit key={d} digit={d} noise={s.noise} blur={s.blur} seed={10 * i + k + 1} wobble={0.04} px={78} label={`${s.epoch}: ${d}`} />)}
          </div>
          <figcaption><b>{s.epoch}</b>{s.note}</figcaption>
        </figure>
      ))}
    </div>
  );
}

function BlurVsSharp() {
  return (
    <div className="s5-compare">
      {[
        { label: 'Real MNIST', blur: 0, noise: 0, wob: 0.05 },
        { label: 'Linear GAN (typical)', blur: 0.67, noise: 0.14, wob: 0.06 },
        { label: 'DCGAN (typical)', blur: 0, noise: 0.03, wob: 0.06 },
      ].map((row, r) => (
        <div key={row.label} className="s5-compare-row">
          <small>{row.label}</small>
          {['0', '1', '2', '3', '4', '7', '8'].map((d, k) => <PixelDigit key={d} digit={d} blur={row.blur} noise={row.noise} wobble={row.wob} seed={30 * r + k + 2} px={64} label={`${row.label} ${d}`} />)}
        </div>
      ))}
    </div>
  );
}

/* Illustrative loss curves for the oscillation slide (not a real run). */
const healthyD = (t: number) => 1.3 + 0.07 * Math.sin(t * 1.7) + 0.04 * Math.sin(t * 5.3);
const healthyG = (t: number) => 0.78 + 0.08 * Math.sin(t * 2.1 + 1) + 0.04 * Math.sin(t * 6.1);
const swingG = (t: number) => 1.6 + 1.1 * Math.sin(t * 0.9) * (0.6 + 0.4 * Math.sin(t * 0.21));
const swingD = (t: number) => 0.9 - 0.55 * Math.sin(t * 0.9 + 0.2) * (0.6 + 0.4 * Math.sin(t * 0.21));

/* ---------- the part ---------- */

export const s5Part: Part = {
  id: 's5',
  code: 'IMG',
  label: 'GANs for images',
  title: 'GANs for Images',
  when: '',
  minutes: 163,
  slides: [
    /* ================= OPEN ================= */
    {
      id: 's5-divider',
      section: 'Open',
      kicker: 'Unit 1 · GANs for images',
      title: 'GANs for Images',
      layout: 'divider',
      notes: {
        time: '1 min',
        say: 'The first-GAN part trained a GAN on one number. Now the same loop draws 28 × 28 handwritten digits — first with Linear layers, then with convolutions, then we learn how training breaks.',
        ask: 'What do you expect to be the first problem when the output becomes 784 pixels?',
      },
      render: () => (
        <Divider
          code="IMG"
          title="GANs for Images"
          promise="Same adversarial loop, real pictures: from one number to 784 pixels, from blurry to sharp, and from broken to balanced."
          items={['MNIST GAN', 'Convolutions', 'DCGAN', 'When GANs break', '3 lab demos']}
        />
      ),
    },
    {
      id: 's5-what-changes',
      section: 'Open',
      kicker: 'From one number to an image',
      title: 'The loop stays — only the sizes and activations change',
      notes: {
        time: '2 min',
        say: 'Read the table row by row. Everything in the left column worked in the first GAN; the right column is the MNIST lab. Step A, Step B, .detach(), BCE and two optimizers are untouched.',
        ask: 'Which row would break the GAN if we forgot to change it?',
      },
      render: () => (
        <>
          <Table
            headers={['', 'First GAN · the number 7', 'GANs for images · MNIST']}
            rows={[
              ['Real data', '1 number (7.0)', '784 numbers (28 × 28 pixels)'],
              ['G output', '1 number, no activation', '784 numbers, Tanh → [−1, 1]'],
              ['D input', '1 number', '784 numbers'],
              ['Noise size', '1', '64 (lab-02) · 100 for DCGAN'],
              ['Hidden layers', '16 neurons, ReLU', 'G: 256, 512 · ReLU — D: 512, 256 · LeakyReLU(0.2)'],
              ['Learning rate', '0.001', '0.0002, batches of 64'],
            ]}
            compact
          />
          <Takeaway>Step A, Step B, <b>.detach()</b>, BCE and two optimizers are exactly the same code.</Takeaway>
        </>
      ),
    },
    {
      id: 's5-predict-pixels',
      section: 'Open',
      kicker: 'Predict',
      title: 'What has to change when G draws a picture?',
      reveal: true,
      notes: {
        time: '2 min',
        say: 'Give everyone 30 seconds to commit. Most people expect a new training algorithm — the surprise is that only the shapes and the output activation change.',
        ask: 'Do we need a new loss function for images?',
      },
      render: ({ revealed }) => (
        <Predict
          revealed={revealed}
          question="What must change in the first-GAN code?"
          facts={['First GAN: G output is one number', 'Now: 784 pixel values per image', 'Each pixel is scaled to [−1, 1]']}
          answer={<Answer verdict="Shapes and one activation" points={['Layer sizes: 784 out of G, 784 into D', <>A <b>Tanh</b> at G’s output to match [−1, 1] pixels</>, 'The loss and the training loop stay the same']} />}
        />
      ),
    },

    /* ================= MNIST GAN ================= */
    {
      id: 's5-mnist',
      section: 'MNIST GAN',
      kicker: 'The dataset',
      title: 'MNIST: 60,000 handwritten digits, each 28 × 28 pixels',
      notes: {
        time: '2 min',
        say: 'MNIST is the “hello world” of image generation: small, grayscale, and fast enough to train on a laptop CPU. Each image has 784 pixels. We ignore the labels — a basic GAN does not get told which digit to draw.',
        ask: 'Why is it useful that we can ignore the labels?',
      },
      render: () => (
        <Stack gap="lg">
          <div className="s5-digit-row">
            {['0', '1', '2', '3', '4', '7', '8'].map((d, i) => <PixelDigit key={d} digit={d} seed={i + 1} wobble={0.05} px={92} label={`MNIST-style ${d}`} />)}
          </div>
          <Stats items={[
            { value: '60,000', label: 'training images', tone: 'blue' },
            { value: '28 × 28', label: '= 784 pixels per image', tone: 'violet' },
            { value: '1', label: 'channel (grayscale)', tone: 'plain' },
            { value: '0', label: 'labels used by a basic GAN', tone: 'coral' },
          ]} />
        </Stack>
      ),
    },
    {
      id: 's5-flatten',
      section: 'MNIST GAN',
      kicker: 'Flatten and reshape',
      title: 'A Linear layer needs a flat list, so 28 × 28 becomes 784',
      notes: {
        time: '2 min',
        say: '.view(batch, −1) keeps the batch dimension and squashes everything else into one row of 784 numbers. To look at G’s output we do the reverse: .view(−1, 28, 28).',
        ask: 'What information does flattening throw away?',
      },
      render: () => (
        <>
          <Flow nodes={[
            { label: 'batch from DataLoader', value: '[64, 1, 28, 28]', tone: 'blue', note: 'images, channel, rows, cols' },
            { op: '→' },
            { label: '.view(64, −1)', value: '[64, 784]', tone: 'violet', note: 'one row of pixels per image' },
            { op: '→' },
            { label: 'G output · .view(−1, 28, 28)', value: '[64, 28, 28]', tone: 'mint', note: 'back to pictures for display' },
          ]} />
          <Takeaway tone="coral">Flattening keeps every pixel value — but the layer no longer knows which pixels are <b>neighbours</b>.</Takeaway>
        </>
      ),
    },
    {
      id: 's5-normalize',
      section: 'MNIST GAN',
      kicker: 'Match G’s output range',
      title: 'Real pixels are rescaled to the range Tanh produces: −1 to +1',
      notes: {
        time: '3 min',
        say: 'ToTensor divides by 255; Normalize(0.5, 0.5) subtracts 0.5 and divides by 0.5. Walk one pixel through: 178 becomes 0.698, then 0.396. If real images were in [0, 1] and G produced [−1, 1], D would spot fakes by their range alone.',
        ask: 'What would D learn if real pixels were never negative but G’s often were?',
      },
      render: () => (
        <FormulaTerms
          symbolWidth="6.5rem"
          reading="normalized pixel = 2 × (byte ÷ 255) − 1  ·  the same as byte ÷ 127.5 − 1"
          formula={<><T tone="mint">x′</T><span className="op">=</span>2 · (<T tone="blue">pixel</T> / 255)<span className="op">−</span>1</>}
          terms={[
            { symbol: 'pixel', name: 'Raw byte', meaning: 'MNIST stores each pixel as 0 (black) … 255 (white)', range: '0 … 255', tone: 'blue' },
            { symbol: '÷ 255', name: 'ToTensor()', meaning: 'Scales bytes into 0 … 1', range: '0 … 1', tone: 'violet' },
            { symbol: '× 2 − 1', name: 'Normalize(0.5, 0.5)', meaning: '(x − 0.5) / 0.5 — for a tensor already in 0 … 1, use x · 2 − 1', range: '−1 … +1', tone: 'violet' },
            { symbol: 'x′', name: 'What D sees', meaning: 'Same range as G’s Tanh output, so range alone gives nothing away', range: '−1 … +1', tone: 'mint' },
          ]}
        />
      ),
    },
    {
      id: 's5-normalize-steps',
      section: 'MNIST GAN',
      kicker: 'Formula · worked',
      title: 'Pixel 178 becomes 0.396 — and 0, 127.5, 255 land on −1, 0, +1',
      notes: {
        time: '2 min',
        say: 'Walk one byte through both transforms, then check the three landmarks. To display a generated image, run it backwards: (x′ + 1) / 2 brings Tanh’s output into 0 … 1.',
        ask: 'Which byte value maps exactly to 0?',
      },
      render: () => (
        <FormulaSteps
          given={['pixel = 178', 'landmarks 0 · 127.5 · 255']}
          steps={[
            { math: <>178 / 255 = 0.698</>, note: 'ToTensor: into 0 … 1' },
            { math: <>0.698 × 2 = 1.396</>, note: 'stretch to 0 … 2' },
            { math: <>1.396 − 1 = 0.396</>, note: 'shift to −1 … +1' },
            { math: <>0 → −1 · 127.5 → 0 · 255 → +1</>, note: 'black, mid-grey, white' },
          ]}
          result={<>x′ = 0.396 (= 178 / 127.5 − 1)</>}
        />
      ),
    },
    {
      id: 's5-batches',
      section: 'MNIST GAN',
      kicker: 'DataLoader',
      title: 'Batches of 64, shuffled every epoch: 938 updates per pass',
      notes: {
        time: '2 min',
        say: '60,000 ÷ 64 = 937.5, so one epoch is 938 batches — 937 full ones and a last batch of 32. Shuffling stops the network seeing all the zeros, then all the ones.',
        ask: 'Why would an unshuffled MNIST be a problem for D?',
      },
      render: () => (
        <>
          <Stats items={[
            { value: '64', label: 'images per batch — one update per batch', tone: 'blue' },
            { value: '938', label: 'batches per epoch (937 × 64 + one batch of 32)', tone: 'violet' },
            { value: '50', label: 'epochs in lab-02 ≈ 46,900 updates', tone: 'mint' },
          ]} />
          <Code title="lab-02 · data" code={`transform = transforms.Compose([
    transforms.ToTensor(),               # [0, 255] → [0, 1]
    transforms.Normalize([0.5], [0.5]),  # [0, 1]  → [−1, 1]
])
dataset = datasets.MNIST(root='./data', train=True, download=True, transform=transform)
dataloader = DataLoader(dataset, batch_size=64, shuffle=True)`} marks={{ 3: 'mint', 6: 'blue' }} />
        </>
      ),
    },
    {
      id: 's5-mlp',
      section: 'MNIST GAN',
      kicker: 'The two networks',
      title: 'G expands 64 → 784, D compresses 784 → 1 — mirror images',
      notes: {
        time: '3 min',
        say: 'G grows a small noise vector into a full image; D shrinks an image into one probability. ReLU inside G, Tanh at its output; LeakyReLU(0.2) inside D, Sigmoid at its output. Both have about half a million parameters.',
        ask: 'Why do both networks need so many more parameters than the 49 in the first GAN?',
      },
      render: () => (
        <Stack gap="lg">
          <div className="s5-mirror">
            <small>GENERATOR · 550,416 parameters</small>
            <Flow size="sm" nodes={[
              { label: 'noise', value: '64', tone: 'blue' }, { op: '→' },
              { label: 'Linear · ReLU', value: '256', tone: 'mint' }, { op: '→' },
              { label: 'Linear · ReLU', value: '512', tone: 'mint' }, { op: '→' },
              { label: 'Linear · Tanh', value: '784', tone: 'mint' },
            ]} />
          </div>
          <div className="s5-mirror">
            <small>DISCRIMINATOR · 533,505 parameters</small>
            <Flow size="sm" nodes={[
              { label: 'image', value: '784', tone: 'blue' }, { op: '→' },
              { label: 'Linear · LeakyReLU', value: '512', tone: 'coral' }, { op: '→' },
              { label: 'Linear · LeakyReLU', value: '256', tone: 'coral' }, { op: '→' },
              { label: 'Linear · Sigmoid', value: '1', tone: 'coral' },
            ]} />
          </div>
        </Stack>
      ),
    },
    {
      id: 's5-mlp-code',
      section: 'MNIST GAN',
      kicker: 'lab-02 · the code',
      title: 'Twelve lines define both networks',
      notes: {
        time: '2 min',
        say: 'Point at the three lines that differ from the first GAN: Tanh at G’s output, LeakyReLU(0.2) in D, and the 784s. The activation-functions deck explains each choice in depth.',
        ask: 'Which line guarantees G’s pixels can never leave [−1, 1]?',
      },
      render: () => (
        <Code title="lab-02-mnist-gan.ipynb" code={`NOISE_SIZE, IMAGE_SIZE = 64, 784            # 784 = 28 * 28

generator = nn.Sequential(
    nn.Linear(NOISE_SIZE, 256), nn.ReLU(),
    nn.Linear(256, 512),        nn.ReLU(),
    nn.Linear(512, IMAGE_SIZE), nn.Tanh(),  # pixels in [−1, 1]
)
discriminator = nn.Sequential(
    nn.Linear(IMAGE_SIZE, 512), nn.LeakyReLU(0.2),
    nn.Linear(512, 256),        nn.LeakyReLU(0.2),
    nn.Linear(256, 1),          nn.Sigmoid(),  # P(real)
)`} marks={{ 6: 'mint', 9: 'coral', 10: 'coral', 11: 'coral' }} notes={{ 6: 'matches the normalised data', 9: 'keeps a 0.2 slope for negatives', 11: 'a probability for BCELoss' }} />
      ),
    },
    {
      id: 's5-leaky',
      section: 'MNIST GAN',
      kicker: 'Why LeakyReLU in D',
      title: 'LeakyReLU keeps a small gradient where ReLU gives zero',
      notes: {
        time: '2 min',
        say: 'For positive inputs they are identical. For negative inputs ReLU outputs 0 with gradient 0; LeakyReLU(0.2) outputs 0.2·x with gradient 0.2. D is G’s only teacher, so D’s features should keep passing gradient back.',
        ask: 'If a D unit outputs 0 for every image, what does G learn through it?',
      },
      render: () => (
        <>
          <Table
            headers={['Input', 'ReLU output', 'ReLU slope', 'LeakyReLU(0.2) output', 'LeakyReLU slope']}
            rows={[['5', '5', '1', '5', '1'], ['2', '2', '1', '2', '1'], ['−3', '0', '0', '−0.6', '0.2'], ['−5', '0', '0', '−1.0', '0.2']]}
            highlight={[2, 3]}
            align={['right', 'right', 'right', 'right', 'right']}
          />
          <Takeaway tone="coral">D is G’s only teacher — every D unit should keep passing a learning signal back.</Takeaway>
        </>
      ),
    },
    {
      id: 's5-loop-diff',
      section: 'MNIST GAN',
      kicker: 'The training loop',
      title: 'Only four lines of the first-GAN loop change',
      notes: {
        time: '3 min',
        say: 'Flatten the real batch, make noise and labels for the whole batch, use a smaller learning rate, and loop over batches inside each epoch. Everything else — Step A, Step B, .detach() — is literally the same.',
        ask: 'Why do the labels now need the batch size?',
      },
      render: () => (
        <Mapping
          leftLabel="First GAN · number 7"
          rightLabel="GANs for images · MNIST"
          rows={[
            [<code>real_data = torch.tensor([[7.0]])</code>, <code>real_flat = real_images.view(batch_size, −1)</code>],
            [<code>noise = torch.randn(1, 1)</code>, <code>noise = torch.randn(batch_size, 64)</code>],
            [<code>real_label = torch.tensor([[1.0]])</code>, <code>real_labels = torch.ones(batch_size, 1)</code>],
            [<code>Adam(lr=0.001) · 2000 epochs</code>, <code>Adam(lr=0.0002) · 50 epochs × 938 batches</code>],
          ]}
        />
      ),
    },
    {
      id: 's5-progress',
      section: 'MNIST GAN',
      kicker: 'Watch it learn · illustration',
      title: 'Digits emerge over 50 epochs — readable, but soft',
      notes: {
        time: '2 min',
        say: 'These panels are illustrations of what learners typically see in lab-02 at fixed noise; their own runs will differ. The point is the trend: structure appears, but edges stay soft and noisy.',
        ask: 'If D can still see the softness, why doesn’t training fix it?',
      },
      render: () => (
        <>
          <ProgressStrip />
          <Takeaway>The GAN works — it learned what digits look like. It just can’t make the edges crisp.</Takeaway>
        </>
      ),
    },
    {
      id: 's5-blurry-why',
      section: 'MNIST GAN',
      kicker: 'Why blurry?',
      title: 'A Linear layer has no idea which pixels are neighbours',
      notes: {
        time: '3 min',
        say: 'Careful with the usual story: a Linear layer does connect every pixel to every unit — it is not “one pixel at a time”. What it lacks is any built-in notion of position or locality, and it shares no weights: a stroke at the top-left and the same stroke one pixel to the right are unrelated patterns it must learn separately.',
        ask: 'How many separate weight patterns would a Linear layer need to recognise “a short horizontal stroke” anywhere in the image?',
      },
      render: () => (
        <ProsCons
          goodLabel="What a Linear layer does"
          badLabel="What it is missing"
          good={['Connects all 784 pixels to every hidden unit', 'Can, in principle, represent any pattern', 'Learns position-specific templates']}
          bad={['No notion of “next to” — pixel order is arbitrary to it', 'No weight sharing: the same stroke at a new position is a new pattern', 'Huge parameter count for the structure it learns']}
        />
      ),
    },
    {
      id: 's5-shuffle',
      section: 'MNIST GAN',
      kicker: 'A thought experiment',
      title: 'Shuffle the pixels once — a Linear GAN would not even notice',
      notes: {
        time: '2 min',
        say: 'Apply one fixed random shuffle to every pixel of every training image. You can no longer read the digits. A Linear-layer GAN can learn the shuffled dataset exactly as well, because reordering its inputs is just reordering its weights. That is what “no spatial awareness” means.',
        ask: 'Would a convolutional network cope as well with the shuffled data? Why not?',
      },
      render: () => (
        <>
          <ShuffleDemo />
          <Takeaway>For a Linear layer, pixel order is arbitrary. Images are not — neighbours matter.</Takeaway>
        </>
      ),
    },

    /* ================= CONVOLUTIONS ================= */
    {
      id: 's5-lab-02',
      section: 'MNIST GAN',
      kicker: 'Lab demo',
      title: 'Run lab-02: a Linear GAN learns readable digits in 50 epochs',
      notes: {
        time: '15 min',
        say: 'Live-run the notebook. Show the printed shapes and the 550,416 parameter count before training, then start Part 5 and keep talking while epochs print. Stop at about epoch 10 if time is short — the fixed-noise grid is already digit-like. Point at D_loss and G_loss hovering, not falling to zero.',
        ask: 'Why do D’s scores on real and fake both sit near 0.5 before training?',
      },
      render: () => (
        <LabDemo
          notebook="lab-02-mnist-gan.ipynb"
          minutes={15}
          goal="Train the Linear GAN from this section on MNIST and watch digits appear."
          steps={[
            <>Parts 1–3: load MNIST, build <b>G</b> and <b>D</b> — check the printed shapes</>,
            <>Part 3 test cell: D scores a real and a fake image before training</>,
            <>Part 5: train (<code>num_epochs = 50</code>) — watch the fixed-noise grid</>,
            <>Part 6: loss curves and the real-vs-fake grid</>,
          ]}
          watch={[
            <>Batch <code>[64, 1, 28, 28]</code>, pixel range <b>[−1.0, 1.0]</b></>,
            <>G parameters <b>550,416</b> · 60,000 images · <b>938</b> batches per epoch</>,
            <>Untrained D ≈ <b>0.5</b> on both; trained digits are readable but soft</>,
          ]}
          yourTurn="Part 8 · Experiment 2: compare noise sizes 2, 16, 64 and 256."
        />
      ),
    },
    {
      id: 's5-conv-idea',
      section: 'Convolutions',
      kicker: 'The new tool',
      title: 'A convolution slides one small filter over every position',
      notes: {
        time: '2 min',
        say: 'At each position: multiply the 3 × 3 patch by the 3 × 3 filter element by element, and add the nine products. One number out per position. The same nine weights are reused everywhere. (PyTorch’s Conv2d computes exactly this — technically a cross-correlation, no flipping.)',
        ask: 'Why is reusing the same nine weights everywhere a good idea for images?',
      },
      render: () => (
        <>
          <Equation size="md" reading="At output position (i, j): multiply the filter with the patch under it and add everything up.">
            <T tone="mint">out(i, j)</T><span className="op">=</span><span className="s5-sigma">Σ<sub>m</sub>Σ<sub>n</sub></span><span><T tone="violet">K(m, n)</T> · <T tone="blue">I(i + m, j + n)</T></span>
          </Equation>
          <Flow nodes={[
            { label: 'patch', value: '3 × 3 pixels', tone: 'blue' }, { op: '×' },
            { label: 'filter', value: '3 × 3 weights', tone: 'violet' }, { op: '→' },
            { label: 'multiply-add', value: '9 products', tone: 'plain' }, { op: '→' },
            { label: 'output', value: '1 number', tone: 'mint' },
          ]} caption="then slide one step and repeat" />
        </>
      ),
    },
    {
      id: 's5-conv-terms',
      section: 'Convolutions',
      kicker: 'Formula · term by term',
      title: 'Every output pixel is one filter-weighted sum of a small patch',
      notes: {
        time: '3 min',
        say: 'i, j says where the filter sits; m, n walk over the filter’s own cells. For a 3 × 3 filter m and n run 0 … 2, so each output is a sum of nine products, plus one bias. The same K and b are reused at every (i, j).',
        ask: 'How many products feed one output value for a 4 × 4 filter?',
      },
      render: () => (
        <FormulaTerms
          symbolWidth="5rem"
          reading="out at (i, j) = sum over the filter cells of weight × pixel under it, plus a bias"
          formula={<><T tone="mint">out(i, j)</T><span className="op">=</span><span className="s5-sigma">Σ<sub>m</sub>Σ<sub>n</sub></span><T tone="violet">K(m, n)</T> · <T tone="blue">I(i + m, j + n)</T><span className="op">+</span><T tone="coral">b</T></>}
          terms={[
            { symbol: 'I', name: 'Input image', meaning: 'Pixel at row i + m, column j + n', range: 'one channel', tone: 'blue' },
            { symbol: 'K', name: 'Filter (kernel)', meaning: 'Learned weights, reused at every position', range: '3 × 3', tone: 'violet' },
            { symbol: 'm, n', name: 'Offsets inside the filter', meaning: 'Walk over the filter’s cells', range: '0 … 2', tone: 'plain' },
            { symbol: 'i, j', name: 'Output position', meaning: 'Where the filter’s top-left corner sits', range: '0 … n − k', tone: 'plain' },
            { symbol: 'Σ Σ', name: 'Sum of products', meaning: 'Multiply matching cells, add all nine', range: '9 terms', tone: 'yellow' },
            { symbol: 'b', name: 'Bias', meaning: 'One per filter, added after the sum', range: '1 number', tone: 'coral' },
          ]}
        />
      ),
    },
    {
      id: 's5-conv-worked',
      section: 'Convolutions',
      kicker: 'Worked example · top-left',
      title: 'Top-left position: nine products add up to 5',
      notes: {
        time: '3 min',
        say: 'Trace it with your finger: the filter’s ones sit on the four corners and the centre of the patch. Those five image pixels are all 1, so the sum is 5. Every other product is zero.',
        ask: 'Which five image pixels does this filter actually look at?',
      },
      render: () => (
        <div className="s5-worked">
          <NumGrid values={CONV_IMAGE} cols={5} cell={56} binary hi={{ r: 0, c: 0, size: 3 }} label="image 5 × 5" />
          <span className="s5-op">·</span>
          <NumGrid values={CONV_FILTER} cols={3} cell={56} scale={1} label="filter 3 × 3" />
          <span className="s5-op">=</span>
          <NumGrid values={PATCH_00.map((v, i) => v * CONV_FILTER[i])} cols={3} cell={56} scale={1} label="products" />
          <span className="s5-op">→</span>
          <div className="s5-sum"><small>SUM</small><strong>5</strong><span>out[0, 0]</span></div>
        </div>
      ),
    },
    {
      id: 's5-conv-steps',
      section: 'Convolutions',
      kicker: 'Formula · worked',
      title: 'Row by row, the top-left patch sums to 2 + 1 + 2 = 5',
      notes: {
        time: '2 min',
        say: 'Same numbers as the picture, written as the formula. Multiply each patch row by the matching filter row, add, then add the three row sums. The bias is 0 here, so out[0, 0] = 5.',
        ask: 'If the bias were −2, what would out[0, 0] be?',
      },
      render: () => (
        <FormulaSteps
          given={['patch rows 1 0 1 · 0 1 1 · 1 1 1', 'filter rows 1 0 1 · 0 1 0 · 1 0 1', 'bias b = 0']}
          steps={[
            { math: <>1·1 + 0·0 + 1·1 = 2</>, note: 'row 1' },
            { math: <>0·0 + 1·1 + 1·0 = 1</>, note: 'row 2' },
            { math: <>1·1 + 1·0 + 1·1 = 2</>, note: 'row 3' },
            { math: <>2 + 1 + 2 + 0</>, note: 'add the rows, then the bias' },
          ]}
          result={<>out[0, 0] = 5</>}
        />
      ),
    },
    {
      id: 's5-conv-predict',
      section: 'Convolutions',
      kicker: 'Your turn',
      title: 'Slide the filter one step right — what comes out?',
      reveal: true,
      notes: {
        time: '3 min',
        say: 'Let pairs compute out[0, 1]. The new patch is columns 1–3 of rows 0–2. Then reveal the full map. Note: the lesson notes printed some wrong cells in this map — every value here has been recomputed.',
        ask: 'Why is the output 3 × 3 and not 5 × 5?',
      },
      render: ({ revealed }) => (
        <Split
          ratio="0.8fr 1.3fr"
          left={<div className="s5-worked s5-worked-tight">
            <NumGrid values={CONV_IMAGE} cols={5} cell={40} binary hi={{ r: 0, c: 1, size: 3 }} label="window moved right" />
            <span className="s5-op">·</span>
            <NumGrid values={CONV_FILTER} cols={3} cell={40} label="same filter" />
          </div>}
          right={<Predict
            revealed={revealed}
            question="What is out[0, 1]?"
            facts={['Window: rows 0–2, columns 1–3', 'Filter: corners and centre are 1']}
            answer={<Stack gap="sm">
              <Answer verdict="out[0, 1] = 2" points={['Corners 0, 0, 1, 0 plus centre 1', 'Full output map (5 − 3 + 1 = 3):']} />
              <NumGrid values={[5, 2, 3, 3, 4, 2, 3, 2, 3]} cols={3} cell={40} scale={5} label="output 3 × 3" />
            </Stack>}
          />}
        />
      ),
    },
    {
      id: 's5-conv-lab',
      section: 'Convolutions',
      kicker: 'Live · slide a filter',
      title: 'Different filters light up different strokes of the same 7',
      lab: true,
      notes: {
        time: '5 min',
        say: 'Start with the vertical-edge filter and press “Slide the filter”. Watch the output fill in: positive where ink begins on the right of the window, negative where it ends. Switch to horizontal edge and point at the top bar. Then blur and sharpen. In a CNN nobody chooses these numbers — they are learned.',
        ask: 'Which filter responds most strongly to the 7’s top bar, and why?',
      },
      render: () => <ConvLab />,
    },
    {
      id: 's5-size-formula',
      section: 'Convolutions',
      kicker: 'Padding and stride',
      title: 'One formula predicts every output size',
      notes: {
        time: '3 min',
        say: 'n = input size, k = kernel, p = padding, s = stride. Padding adds a ring of zeros so the filter fits at the edges; stride is how far it jumps. Check each row with the class — the last two rows are exactly D’s two layers in DCGAN.',
        ask: 'What padding keeps a 28 × 28 image 28 × 28 with a 3 × 3 kernel and stride 1?',
      },
      render: () => (
        <>
          <Equation size="md">
            <T tone="mint">out</T><span className="op">=</span>⌊ (<T tone="blue">n</T> − <T tone="violet">k</T> + 2<T tone="coral">p</T>) / <T tone="yellow">s</T> ⌋<span className="op">+</span>1
          </Equation>
          <Table
            headers={['Input n', 'Kernel k', 'Padding p', 'Stride s', 'Output', 'Where']}
            rows={[
              ['5', '3', '0', '1', '3', 'the worked example'],
              ['5', '3', '1', '1', '5', 'padding keeps the size'],
              ['28', '3', '1', '1', '28', 'Conv2d(1, 16, 3, padding=1)'],
              ['28', '4', '1', '2', '14', 'DCGAN D · layer 1'],
              ['14', '4', '1', '2', '7', 'DCGAN D · layer 2'],
            ]}
            highlight={[3, 4]}
            align={['right', 'right', 'right', 'right', 'right', 'left']}
            compact
          />
        </>
      ),
    },
    {
      id: 's5-size-terms',
      section: 'Convolutions',
      kicker: 'Formula · term by term',
      title: 'Each letter in the size formula is one design choice',
      notes: {
        time: '2 min',
        say: 'Padding widens the input on both sides, the kernel uses up k cells, stride sets the jump. The floor drops a final partial step that would hang off the edge; + 1 counts the starting position.',
        ask: 'Why 2p and not p?',
      },
      render: () => (
        <FormulaTerms
          symbolWidth="5rem"
          reading="out = floor of (input + 2 × padding − kernel) ÷ stride, plus 1"
          formula={<><T tone="mint">out</T><span className="op">=</span>⌊ (<T tone="blue">n</T><span className="op">+</span>2<T tone="coral">p</T><span className="op">−</span><T tone="violet">k</T>) / <T tone="yellow">s</T> ⌋<span className="op">+</span>1</>}
          terms={[
            { symbol: 'n', name: 'Input size', meaning: 'Height (or width) of the incoming map', range: '28 for MNIST', tone: 'blue' },
            { symbol: '2p', name: 'Padding, both sides', meaning: 'A ring of zeros so the filter fits at the edges', range: 'p = 0, 1, …', tone: 'coral' },
            { symbol: 'k', name: 'Kernel size', meaning: 'Cells the filter covers', range: '3 or 4', tone: 'violet' },
            { symbol: 's', name: 'Stride', meaning: 'How far the filter jumps each step', range: '1 or 2', tone: 'yellow' },
            { symbol: '⌊ ⌋', name: 'Floor', meaning: 'Drop a partial jump that would leave the image', range: 'round down', tone: 'plain' },
            { symbol: '+ 1', name: 'Starting position', meaning: 'Count the first placement too', range: '', tone: 'plain' },
          ]}
        />
      ),
    },
    {
      id: 's5-size-steps',
      section: 'Convolutions',
      kicker: 'Formula · worked',
      title: 'DCGAN’s first D layer halves 28 to 14',
      notes: {
        time: '2 min',
        say: 'Kernel 4, stride 2, padding 1 is the DCGAN downsampling recipe. Pad to 30, subtract the kernel to get 26 cells of room, divide by the jump to get 13 moves, add the starting spot: 14. Run it again on 14 to get 7.',
        ask: 'Run the formula on n = 14 with the same settings.',
      },
      render: () => (
        <FormulaSteps
          given={['n = 28', 'k = 4', 'p = 1', 's = 2']}
          steps={[
            { math: <>28 + 2·1 = 30</>, note: 'pad both sides' },
            { math: <>30 − 4 = 26</>, note: 'room left for the filter to move' },
            { math: <>⌊26 / 2⌋ = 13</>, note: 'number of jumps' },
            { math: <>13 + 1 = 14</>, note: 'count the starting position' },
          ]}
          result={<>out = 14 · then 14 → 7</>}
        />
      ),
    },
    {
      id: 's5-feature-maps',
      section: 'Convolutions',
      kicker: 'Many filters',
      title: 'Sixteen filters give sixteen feature maps — all learned',
      notes: {
        time: '2 min',
        say: 'out_channels = how many filters. Each filter scans the whole image and produces its own map. lab-03 shows eight random filters applied to a real digit before any training — every map already looks different.',
        ask: 'Who decides that filter 3 should find corners?',
      },
      render: () => (
        <>
          <Flow nodes={[
            { label: 'input', value: '[B, 1, 28, 28]', tone: 'blue', note: '1 grayscale channel' },
            { op: '→' },
            { label: 'Conv2d(1, 16, kernel_size=3, padding=1)', value: '16 filters', tone: 'violet', note: '3 × 3 each' },
            { op: '→' },
            { label: 'output', value: '[B, 16, 28, 28]', tone: 'mint', note: '16 feature maps' },
          ]} />
          <Cards cols={4} items={[
            { tag: 'map 1', title: 'Vertical edges', tone: 'plain' },
            { tag: 'map 2', title: 'Horizontal edges', tone: 'plain' },
            { tag: 'map 3', title: 'Corners', tone: 'plain' },
            { tag: 'map 16', title: 'Diagonals', tone: 'plain' },
          ]} />
          <Takeaway>Nobody hand-picks the filters — backpropagation learns them, like any other weight.</Takeaway>
        </>
      ),
    },
    {
      id: 's5-params',
      section: 'Convolutions',
      kicker: 'Weight sharing',
      title: 'Sharing one filter everywhere needs thousands of times fewer weights',
      notes: {
        time: '2 min',
        say: 'A Linear layer from 784 inputs to 512 units has 401,408 weights. Sixteen 3 × 3 filters have 144 weights (160 with biases) — and they still look at the whole image, because they slide. Locality plus sharing is exactly the structure images have.',
        ask: 'What would a Linear layer have to do to detect the same edge at 100 different positions?',
      },
      render: () => (
        <Stats items={[
          { value: '401,408', label: 'weights · Linear(784, 512)', tone: 'coral' },
          { value: '144', label: 'weights · Conv2d(1, 16, 3) — 16 × 3 × 3 (+16 biases)', tone: 'mint' },
          { value: '≈ 2,800×', label: 'fewer weights for a layer that scans every position', tone: 'blue' },
        ]} />
      ),
    },
    {
      id: 's5-params-steps',
      section: 'Convolutions',
      kicker: 'Formula · worked',
      title: 'Conv2d(1, 16, 3) has 160 parameters — Linear(784, 512) has 401,920',
      notes: {
        time: '2 min',
        say: 'A conv layer’s parameters depend only on the filter size and channel counts — not on the image size. Each of the 16 filters has 3 × 3 weights per input channel, plus one bias. The Linear layer needs one weight per input-output pair.',
        ask: 'How many parameters does Conv2d(64, 128, 4) have?',
      },
      render: () => (
        <FormulaSteps
          formula={<><T tone="violet">params</T><span className="op">=</span><T tone="yellow">k</T> · <T tone="yellow">k</T> · <T tone="blue">C_in</T> · <T tone="mint">C_out</T><span className="op">+</span><T tone="mint">C_out</T></>}
          given={['Conv2d(1, 16, kernel_size=3)', 'k = 3 · C_in = 1 · C_out = 16']}
          steps={[
            { math: <>3 · 3 = 9</>, note: 'weights per filter, per input channel' },
            { math: <>9 · 1 = 9</>, note: '× input channels' },
            { math: <>9 · 16 = 144</>, note: '× filters (output channels)' },
            { math: <>144 + 16 = 160</>, note: 'one bias per filter' },
            { math: <>784 · 512 + 512 = 401,920</>, note: 'Linear(784, 512) for comparison' },
          ]}
          result={<>160 vs 401,920 parameters</>}
        />
      ),
    },
    {
      id: 's5-hierarchy',
      section: 'Convolutions',
      kicker: 'Stacking layers',
      title: 'Stacked convolutions build edges into strokes into digits',
      notes: {
        time: '2 min',
        say: 'Each layer combines the previous layer’s maps over a slightly larger area of the image. D reads this ladder upwards to reach a verdict; G walks it downwards, from rough layout to fine edges.',
        ask: 'Which layer of G decides the overall shape of the digit?',
      },
      render: () => (
        <Steps items={[
          { title: 'Layer 1 · edges and lines', body: 'small 3 × 3 or 4 × 4 neighbourhoods', tone: 'blue' },
          { title: 'Layer 2 · curves and corners', body: 'combinations of edges over a larger area', tone: 'violet' },
          { title: 'Layer 3 · digit parts', body: 'loops, bars, strokes', tone: 'mint' },
          { title: 'Decision or image', body: 'D: “real or fake?” · G: a whole 28 × 28 digit', tone: 'coral' },
        ]} />
      ),
    },
    {
      id: 's5-convt',
      section: 'Convolutions',
      kicker: 'Growing images',
      title: 'ConvTranspose2d runs the other way: small map in, bigger map out',
      notes: {
        time: '3 min',
        say: 'Each input value stamps a scaled copy of the k × k filter into the output, spaced by the stride; where stamps overlap, they add. With kernel 4, stride 2, padding 1, the size exactly doubles: 7 → 14 → 28. That is how G grows an image.',
        ask: 'Plug in n = 14: what does the formula give?',
      },
      render: () => (
        <>
          <Equation size="md" reading="kernel 4 · stride 2 · padding 1:  (7 − 1)·2 − 2 + 4 = 14   and   (14 − 1)·2 − 2 + 4 = 28">
            <T tone="mint">out</T><span className="op">=</span>(<T tone="blue">n</T> − 1) · <T tone="yellow">s</T><span className="op">−</span>2<T tone="coral">p</T><span className="op">+</span><T tone="violet">k</T>
          </Equation>
          <Flow nodes={[
            { label: 'feature map', value: '7 × 7', tone: 'blue' }, { op: '→' },
            { label: 'ConvTranspose2d', value: '14 × 14', tone: 'mint' }, { op: '→' },
            { label: 'ConvTranspose2d', value: '28 × 28', tone: 'mint' },
          ]} caption="each input value stamps a weighted 4 × 4 filter · overlapping stamps add" />
          <Takeaway>D shrinks with Conv2d (28 → 14 → 7); G grows with ConvTranspose2d (7 → 14 → 28) — mirror images.</Takeaway>
        </>
      ),
    },
    {
      id: 's5-convt-steps',
      section: 'Convolutions',
      kicker: 'Formula · worked',
      title: 'ConvTranspose2d grows 7 to 14 with the same k, s, p',
      notes: {
        time: '2 min',
        say: 'Read the transpose formula as the reverse of the conv one: the n − 1 gaps between input values get stretched by the stride, padding trims a border, and the last stamp adds a whole kernel. 7 → 14, then 14 → 28.',
        ask: 'With k = 4, s = 2, p = 1, which map size grows to 56?',
      },
      render: () => (
        <FormulaSteps
          formula={<><T tone="mint">out</T><span className="op">=</span>(<T tone="blue">n</T> − 1) · <T tone="yellow">s</T><span className="op">−</span>2<T tone="coral">p</T><span className="op">+</span><T tone="violet">k</T></>}
          given={['n = 7', 'k = 4', 'p = 1', 's = 2']}
          steps={[
            { math: <>7 − 1 = 6</>, note: 'gaps between input values' },
            { math: <>6 · 2 = 12</>, note: 'stride spreads the stamps apart' },
            { math: <>12 − 2·1 = 10</>, note: 'padding trims the border' },
            { math: <>10 + 4 = 14</>, note: 'the last stamp adds a full kernel' },
          ]}
          result={<>out = 14 · then 14 → 28</>}
        />
      ),
    },
    {
      id: 's5-bn-terms',
      section: 'Convolutions',
      kicker: 'Formula · term by term',
      title: 'BatchNorm: standardize with the batch’s statistics, then let the layer rescale',
      notes: {
        time: '3 min',
        say: 'Two lines. First standardize: subtract the batch mean, divide by the batch standard deviation (ε only prevents division by zero). Then rescale with two learned numbers, γ and β, so the layer can undo the normalization if that helps. In a CNN, μ and σ² are computed per channel over the batch and all positions.',
        ask: 'If γ = σ and β = μ, what does BatchNorm output?',
      },
      render: () => (
        <FormulaTerms
          symbolWidth="5rem"
          reading="x̂ = (x − mean) ÷ √(variance + ε)   ·   y = γ x̂ + β"
          formula={<><T tone="mint">x̂</T><span className="op">=</span>(<T tone="blue">x</T> − <T tone="violet">μ</T>) / √(<T tone="violet">σ²</T> + <T tone="plain">ε</T>)<span className="op">·</span><T tone="mint">y</T><span className="op">=</span><T tone="coral">γ</T><T tone="mint">x̂</T><span className="op">+</span><T tone="coral">β</T></>}
          terms={[
            { symbol: 'x', name: 'One activation', meaning: 'A value in the batch (per channel in a CNN)', range: 'any', tone: 'blue' },
            { symbol: 'μ', name: 'Batch mean', meaning: 'Average of the batch’s values', range: 'per channel', tone: 'violet' },
            { symbol: 'σ²', name: 'Batch variance', meaning: 'Average squared distance from μ', range: '≥ 0', tone: 'violet' },
            { symbol: 'ε', name: 'Tiny constant', meaning: 'Avoids dividing by zero', range: '10⁻⁵', tone: 'plain' },
            { symbol: 'x̂', name: 'Standardized value', meaning: 'Mean 0, spread 1 across the batch', range: '≈ −3 … 3', tone: 'mint' },
            { symbol: 'γ, β', name: 'Learned scale and shift', meaning: 'Start at 1 and 0; trained like weights', range: '2 per channel', tone: 'coral' },
          ]}
        />
      ),
    },
    {
      id: 's5-batchnorm',
      section: 'Convolutions',
      kicker: 'BatchNorm · worked',
      title: 'BatchNorm re-centres every layer’s values to mean 0, spread 1',
      notes: {
        time: '3 min',
        say: 'Four activations from a batch: 52, 81, 37, 69. Mean 59.75, standard deviation 16.69. Subtract and divide: −0.46, 1.27, −1.36, 0.55. Then the layer learns its own scale γ and shift β. In a CNN this is done per channel, across the batch and all positions.',
        ask: 'Why let the network learn γ and β at all, if we just normalised?',
      },
      render: () => (
        <>
          <FormulaSteps
            given={['batch: 52 · 81 · 37 · 69', 'γ = 1, β = 0 (at the start)']}
            steps={[
              { math: <>μ = (52 + 81 + 37 + 69) / 4 = 59.75</>, note: 'batch mean' },
              { math: <>σ² = 278.69 → σ = 16.69</>, note: 'mean of squared deviations' },
              { math: <>x̂(52) = (52 − 59.75) / 16.69 = −0.46</>, note: 'subtract, divide' },
              { math: <>x̂ = −0.46 · 1.27 · −1.36 · 0.55</>, note: 'all four values' },
            ]}
            result={<>y = γ·x̂ + β = x̂ at the start</>}
          />
          <Takeaway>Stable input ranges for every layer → smoother, faster GAN training.</Takeaway>
        </>
      ),
    },

    /* ================= DCGAN ================= */
    {
      id: 's5-dcgan-rules',
      section: 'DCGAN',
      kicker: 'Radford, Metz & Chintala · 2015',
      title: 'DCGAN: five architecture rules that made GANs train reliably',
      notes: {
        time: '3 min',
        say: 'These are the paper’s guidelines for stable deep convolutional GANs. Note the precise BatchNorm rule: not on G’s output layer and not on D’s input layer. The paper also says G’s first layer — a matrix multiply from z — can be called fully connected; the rule is about removing fully connected hidden layers.',
        ask: 'Why skip BatchNorm on D’s very first layer?',
      },
      render: () => (
        <Cards cols={3} items={[
          { tag: 'Rule 1', title: 'Strided convolutions, no pooling', body: 'D downsamples with stride-2 Conv2d; G upsamples with ConvTranspose2d.', tone: 'blue' },
          { tag: 'Rule 2', title: 'BatchNorm in G and D', body: 'Except G’s output layer and D’s input layer.', tone: 'violet' },
          { tag: 'Rule 3', title: 'No fully connected hidden layers', body: 'Only z’s projection and D’s final score are dense.', tone: 'plain' },
          { tag: 'Rule 4', title: 'G: ReLU, Tanh at the output', body: 'Pixels land in [−1, 1].', tone: 'mint' },
          { tag: 'Rule 5', title: 'D: LeakyReLU everywhere', body: 'Slope 0.2 for negative inputs.', tone: 'coral' },
          { tag: 'Training', title: 'Adam · lr 0.0002 · β₁ = 0.5', body: 'Weights initialised from N(0, 0.02).', tone: 'yellow' },
        ]} />
      ),
    },
    {
      id: 's5-g-trace',
      section: 'DCGAN',
      kicker: 'Generator · shape trace',
      title: 'G turns 100 numbers into 256 maps of 7 × 7, then doubles twice',
      notes: {
        time: '3 min',
        say: 'Read the shape column top to bottom — it is exactly what lab-03 prints. 12,544 is 256 × 7 × 7. Each ConvTranspose2d halves the channels and doubles the size, until one channel of 28 × 28 pixels comes out of Tanh.',
        ask: 'Where does the “256” in 256 × 7 × 7 come from — is it forced by the data?',
      },
      render: () => (
        <Table
          headers={['Layer', 'Output shape', 'Size math']}
          rows={[
            ['noise z', '[B, 100]', '—'],
            ['Linear(100, 12544) · ReLU', '[B, 12544]', '256 × 7 × 7 = 12,544'],
            ['Unflatten(1, (256, 7, 7))', '[B, 256, 7, 7]', 'reshape only'],
            ['ConvTranspose2d(256, 128, 4, 2, 1) · BatchNorm · ReLU', '[B, 128, 14, 14]', '(7 − 1)·2 − 2 + 4 = 14'],
            ['ConvTranspose2d(128, 1, 4, 2, 1) · Tanh', '[B, 1, 28, 28]', '(14 − 1)·2 − 2 + 4 = 28'],
          ]}
          highlight={[4]}
          compact
        />
      ),
    },
    {
      id: 's5-shape-lab',
      section: 'DCGAN',
      kicker: 'Live · step through the layers',
      title: 'Follow one tensor through G and D, layer by layer',
      lab: true,
      notes: {
        time: '4 min',
        say: 'Step through G first: watch the grid grow 7 → 14 → 28 while channels shrink 256 → 128 → 1. Then switch to D and watch the mirror: 28 → 14 → 7 → one number. Point at the parameter counts — G’s first Linear layer alone holds 1.27 million.',
        ask: 'Which layer of G has the most parameters, and why?',
      },
      render: () => <ShapeLab />,
    },
    {
      id: 's5-d-trace',
      section: 'DCGAN',
      kicker: 'Discriminator · shape trace',
      title: 'D halves the image twice, then makes one decision',
      notes: {
        time: '2 min',
        say: 'Conv2d with kernel 4, stride 2, padding 1 halves: 28 → 14 → 7. No BatchNorm on the first layer, so D sees raw pixel statistics. Flatten 128 × 7 × 7 = 6,272 numbers into one Linear unit and a Sigmoid.',
        ask: 'Why does D only need 138,817 parameters when G needs 1.79 million?',
      },
      render: () => (
        <Table
          headers={['Layer', 'Output shape', 'Size math']}
          rows={[
            ['image', '[B, 1, 28, 28]', '—'],
            ['Conv2d(1, 64, 4, 2, 1) · LeakyReLU(0.2) — no BatchNorm', '[B, 64, 14, 14]', '(28 − 4 + 2)/2 + 1 = 14'],
            ['Conv2d(64, 128, 4, 2, 1) · BatchNorm · LeakyReLU(0.2)', '[B, 128, 7, 7]', '(14 − 4 + 2)/2 + 1 = 7'],
            ['Flatten', '[B, 6272]', '128 × 7 × 7 = 6,272'],
            ['Linear(6272, 1) · Sigmoid', '[B, 1]', 'one probability'],
          ]}
          highlight={[4]}
          compact
        />
      ),
    },
    {
      id: 's5-dcgan-code',
      section: 'DCGAN',
      kicker: 'lab-03 · the Generator',
      title: 'The whole DCGAN Generator fits on one screen',
      notes: {
        time: '2 min',
        say: 'This is lab-03’s generator. Nothing here is new: Linear, Unflatten, ConvTranspose2d, BatchNorm, ReLU, Tanh. The Discriminator is its mirror with Conv2d and LeakyReLU.',
        ask: 'Which line would you delete to run the “no BatchNorm” experiment in lab-03?',
      },
      render: () => (
        <Code title="lab-03-dcgan.ipynb · DCGenerator" code={`class DCGenerator(nn.Module):
    def __init__(self):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(100, 256 * 7 * 7), nn.ReLU(),
            nn.Unflatten(1, (256, 7, 7)),
            nn.ConvTranspose2d(256, 128, kernel_size=4, stride=2, padding=1),
            nn.BatchNorm2d(128), nn.ReLU(),
            nn.ConvTranspose2d(128, 1, kernel_size=4, stride=2, padding=1),
            nn.Tanh(),
        )
    def forward(self, z):
        return self.net(z)`} marks={{ 5: 'blue', 7: 'mint', 8: 'violet', 9: 'mint', 10: 'mint' }} notes={{ 5: '→ 12,544 numbers', 7: '7 → 14', 8: 'the BatchNorm experiment', 9: '14 → 28', 10: 'pixels in [−1, 1]' }} />
      ),
    },
    {
      id: 's5-dcgan-train',
      section: 'DCGAN',
      kicker: 'Training settings',
      title: 'Same loop, three DCGAN settings: init, Adam β₁ = 0.5, no flattening',
      notes: {
        time: '3 min',
        say: 'The loop body is unchanged. The differences: images stay [B, 1, 28, 28], noise is 100-dimensional, weights start from N(0, 0.02), and Adam uses β₁ = 0.5 — less momentum, because the target a GAN chases keeps moving. The paper used batches of 128; lab-03 uses 64.',
        ask: 'Why might heavy momentum hurt when your opponent keeps changing?',
      },
      render: () => (
        <Split
          ratio="1.1fr 1fr"
          left={<Code title="lab-03 · optimisers" code={`gen_opt = torch.optim.Adam(gen.parameters(),
                           lr=0.0002, betas=(0.5, 0.999))
dis_opt = torch.optim.Adam(dis.parameters(),
                           lr=0.0002, betas=(0.5, 0.999))

real_pred = dis(real_images)        # no .view() any more
noise = torch.randn(batch_size, 100)`} marks={{ 2: 'yellow', 4: 'yellow', 6: 'blue' }} />}
          right={<Stats items={[
            { value: '0.02', label: 'std of initial weights · N(0, 0.02)', tone: 'violet' },
            { value: '0.5', label: 'Adam β₁ instead of 0.9', tone: 'yellow' },
            { value: '0.0002', label: 'learning rate for G and D', tone: 'blue' },
          ]} />}
        />
      ),
    },
    {
      id: 's5-params-predict',
      section: 'DCGAN',
      kicker: 'Predict',
      title: 'Is DCGAN sharper because it is smaller?',
      reveal: true,
      notes: {
        time: '3 min',
        say: 'A common claim is “convolutions win because they need fewer parameters”. Count them. The DCGAN Generator is more than three times bigger than the Linear one — almost all of it in the projection from z. The Discriminator is four times smaller. Sharpness comes from structure: locality and weight sharing.',
        ask: 'So what does a convolution give G that extra Linear capacity could not?',
      },
      render: ({ revealed }) => (
        <Predict
          revealed={revealed}
          question="Which GAN has more parameters?"
          facts={['Linear G 550,416 · Linear D 533,505', 'DCGAN G ? · DCGAN D ?']}
          answer={<Answer verdict="No — G got bigger" points={[<>DCGAN G: <b>1,793,665</b> (1,266,944 in the first Linear)</>, <>DCGAN D: <b>138,817</b> — about 4× smaller</>, 'Sharpness comes from locality and weight sharing, not size']} />}
        />
      ),
    },
    {
      id: 's5-results',
      section: 'DCGAN',
      kicker: 'The payoff',
      title: 'Convolutions turn soft blobs into crisp strokes',
      notes: {
        time: '2 min',
        say: 'These rows are illustrations of the comparison lab-03 runs for real at the end of the notebook: real digits, a Linear GAN, and the DCGAN, all on MNIST. Let learners run it and compare their own grid.',
        ask: 'Besides sharpness, what else should you check when comparing two generators?',
      },
      render: () => (
        <>
          <BlurVsSharp />
          <Takeaway>Same game, same loop — the architecture alone made the images sharp.</Takeaway>
        </>
      ),
    },

    /* ================= WHEN GANS BREAK ================= */
    {
      id: 's5-lab-03',
      section: 'DCGAN',
      kicker: 'Lab demo',
      title: 'Run lab-03: the same loop with convolutions draws sharp digits',
      notes: {
        time: '15 min',
        say: 'Start with the Part 2 cells — they print exactly the 28 → 14 → 7 and 7 → 14 → 28 traces from the slides, and BatchNorm turning a mean-50 batch into mean 0, std 1. Then build G and D, start the 20-epoch training, and finish on the Part 10 side-by-side with the Linear GAN.',
        ask: 'The DCGAN Generator has three times the Linear one’s parameters. Is that why it is sharper?',
      },
      render: () => (
        <LabDemo
          notebook="lab-03-dcgan.ipynb"
          minutes={15}
          goal="Swap Linear layers for convolutions and compare the images head to head."
          steps={[
            <>Part 2: 8 random filters on a digit · Conv2d shrink · ConvTranspose2d grow · BatchNorm</>,
            <>Parts 3–4: build G and D — run the shape-trace cells</>,
            <>Parts 6–7: <code>weights_init</code>, Adam β₁ = 0.5, train <code>num_epochs = 20</code></>,
            <>Part 10: Linear GAN vs DCGAN on the same epochs</>,
          ]}
          watch={[
            <><code>28 → 14 → 7</code> and <code>7 → 14 → 28</code>; BatchNorm → mean <b>0.00</b>, std <b>1.00</b></>,
            <>DCGAN G <b>1,793,665</b> params vs Linear G <b>559,632</b> (noise 100)</>,
            <>Crisp strokes from DCGAN; soft blobs from the Linear GAN</>,
          ]}
          yourTurn="Part 12: train without BatchNorm, then on Fashion-MNIST."
        />
      ),
    },
    {
      id: 's5-hard',
      section: 'When GANs break',
      kicker: 'Why it is fragile',
      title: 'Two networks with opposite goals have no fixed target',
      notes: {
        time: '2 min',
        say: 'An ordinary network minimises one loss on fixed data. In a GAN each player’s target moves every time the other updates. If one side gets far ahead, the other loses its learning signal. Training is a balance, not a descent.',
        ask: 'What happens to G if D becomes perfect very early?',
      },
      render: () => (
        <Versus
          left={{ tag: 'Normal training', title: 'One network, one fixed loss', body: <p>The data never changes — keep going downhill.</p>, tone: 'blue' }}
          right={{ tag: 'GAN training', title: 'Two networks, opposite goals', body: <p>Every D update changes G’s target, and vice versa.</p>, tone: 'coral' }}
        />
      ),
    },
    {
      id: 's5-collapse',
      section: 'When GANs break',
      kicker: 'Failure 1 · mode collapse',
      title: 'Mode collapse: G finds a few outputs that fool D and stops exploring',
      notes: {
        time: '3 min',
        say: 'Many different noise vectors map to the same few images. Each image alone may look real, so G’s loss can look fine — which is why you must look at samples. In the first GAN every output was ≈ 7, and that was correct because the data was a single value; here the data has ten digits.',
        ask: 'Why can the G loss look healthy during mode collapse?',
      },
      render: () => (
        <Cards cols={3} items={[
          { tag: 'What', title: 'Many z → the same image', body: 'Variety disappears: all 7s, or a handful of digits.', tone: 'coral' },
          { tag: 'Why', title: 'A shortcut that fools D', body: 'G chases whatever D currently accepts instead of covering all the data.', tone: 'violet' },
          { tag: 'Spot it', title: 'Look at a grid of samples', body: 'Look at a fixed-noise grid; lab-04 also computes a diversity score.', tone: 'blue' },
        ]} />
      ),
    },
    {
      id: 's5-collapse-lab',
      section: 'When GANs break',
      kicker: 'Live · measure variety',
      title: 'A collapsed Generator is easy to see and easy to measure',
      lab: true,
      notes: {
        time: '4 min',
        say: 'Switch between healthy, partial and full collapse. The diversity score is the mean Euclidean distance between every pair of samples — the same measure lab-04 computes with torch.cdist. lab-04 forces a version of this by shrinking the noise to 2 dimensions; real collapse happens even with large noise.',
        ask: 'Would D catch a full collapse if each single image looks perfectly real?',
      },
      render: () => <CollapseLab />,
    },
    {
      id: 's5-d-strong',
      section: 'When GANs break',
      kicker: 'Failure 2 · D wins too easily',
      title: 'When D becomes certain, G’s losses explode and the images stop improving',
      notes: {
        time: '3 min',
        say: 'D’s job is easier than G’s, so it often learns faster. lab-04 forces this by giving D a learning rate of 0.01 against G’s 0.0002. Watch the numbers: D loss collapses towards zero while G loss climbs and the samples freeze. The healthy column matches the equilibrium we saw in the first GAN.',
        ask: 'Which of these four numbers would you put on a dashboard first?',
      },
      render: () => (
        <Table
          headers={['Signal', 'Healthy', 'D too strong']}
          rows={[
            ['D loss', '≈ 1.2 – 1.4, fluctuating (2 ln 2 ≈ 1.386 at balance)', '→ 0.01'],
            ['G loss (−log D(G(z)))', '≈ 0.7 – 1, fluctuating', 'high, e.g. −ln 0.001 ≈ 6.9'],
            ['D(real) · D(fake)', 'both drift around 0.3 – 0.7', '≈ 0.999 · ≈ 0.001'],
            ['Samples', 'keep improving', 'stuck'],
          ]}
          highlight={[1]}
          compact
        />
      ),
    },
    {
      id: 's5-vanishing',
      section: 'When GANs break',
      kicker: 'The gradient, precisely',
      title: 'The non-saturating loss keeps G’s signal alive — but a perfect D still misleads it',
      notes: {
        time: '4 min',
        say: 'Correct a common myth: with the loss we train, −log D(G(z)), the gradient on D’s fake logit is σ(a) − 1, which is about −1 when D says 0.0001 — it does not vanish there. The original minimax loss log(1 − D(G(z))) is the one whose gradient −σ(a) shrinks to −0.0001. The remaining problem is real: a near-perfect D is flat or erratic around the fakes, so the direction it gives G through the image is poor. The root cause is the BCE objective itself — Unit 2’s WGAN replaces it.',
        ask: 'If the output-side gradient is about −1, where can the signal still get lost?',
      },
      render: () => (
        <>
          <Table
            headers={['G loss', 'Gradient w.r.t. D’s fake logit a', 'At D(fake) = 0.0001']}
            rows={[
              ['Minimax: log(1 − σ(a))', '−σ(a)', '−0.0001 → vanishes'],
              ['Non-saturating: −log σ(a) (what BCE(D(fake), 1) trains)', 'σ(a) − 1', '−0.9999 → strong'],
            ]}
            highlight={[1]}
            compact
          />
          <Takeaway tone="coral">Even so, a D that is <b>certain everywhere</b> gives G a flat or erratic direction through the image — the loss itself is the root problem.</Takeaway>
        </>
      ),
    },
    {
      id: 's5-grad-steps',
      section: 'When GANs break',
      kicker: 'Formula · worked',
      title: 'One line of calculus: −σ(a) vanishes, σ(a) − 1 does not',
      notes: {
        time: '3 min',
        say: 'a is D’s raw score (logit) for the fake; D(G(z)) = σ(a). Sigmoid’s slope is σ(1 − σ). Differentiate both G losses with the chain rule: the (1 − σ) cancels in one, the σ cancels in the other. When D rejects the fake (σ = 0.0001), only the non-saturating loss still pushes.',
        ask: 'Which factor cancels in each derivative?',
      },
      render: () => (
        <FormulaSteps
          given={['a = D’s logit for the fake', 'D(G(z)) = σ(a) = 0.0001']}
          steps={[
            { math: <>σ′(a) = σ(1 − σ)</>, note: 'sigmoid’s slope' },
            { math: <>d/da log(1 − σ) = −σ(1 − σ)/(1 − σ) = −σ(a)</>, note: 'minimax G loss' },
            { math: <>d/da [−log σ] = −σ(1 − σ)/σ = σ(a) − 1</>, note: 'non-saturating G loss' },
            { math: <>−0.0001 vs −0.9999</>, note: 'plug in σ = 0.0001' },
          ]}
          result={<>≈ 10,000× stronger push with −log D(G(z))</>}
        />
      ),
    },
    {
      id: 's5-smoothing',
      section: 'When GANs break',
      kicker: 'Band-aid 1 · label smoothing',
      title: 'One-sided label smoothing caps D’s confidence on real images at 0.9',
      notes: {
        time: '3 min',
        say: 'Train D with real targets of 0.9 instead of 1.0. BCE with target 0.9 is lowest at p = 0.9, so D has no reason to push to 0.999. Salimans et al. (2016) recommend one-sided smoothing — keep fake targets at 0; lab-04 also tries fake = 0.1 so you can compare.',
        ask: 'Why might smoothing the fake labels (0 → 0.1) reward G for bad samples?',
      },
      render: () => (
        <Split
          ratio="1.1fr 1fr"
          left={<Code title="one-sided smoothing · lab-04 also tries fake = 0.1" code={`# before
real_labels = torch.ones(batch_size, 1)          # 1.0
# one-sided smoothing (recommended)
real_labels = torch.ones(batch_size, 1) * 0.9    # 0.9
fake_labels = torch.zeros(batch_size, 1)         # stays 0.0`} marks={{ 4: 'mint' }} />}
          right={<Stats items={[
            { value: '0.9', label: 'D’s best answer for a real image now', tone: 'mint' },
            { value: '0.325', label: 'BCE at p = 0.9 (its minimum)', tone: 'blue' },
            { value: '0.470', label: 'BCE at p = 0.99 — over-confidence is penalised', tone: 'coral' },
          ]} />}
        />
      ),
    },
    {
      id: 's5-smoothing-steps',
      section: 'When GANs break',
      kicker: 'Formula · worked',
      title: 'With target 0.9, answering 0.99 costs D more than answering 0.9',
      notes: {
        time: '2 min',
        say: 'BCE with a soft target y = 0.9 keeps both terms switched on. At p = 0.9 the loss is 0.325; at p = 0.99 the 0.1·log(1 − p) term explodes and the loss rises to 0.470. Its minimum is exactly at p = y, so over-confidence is penalised.',
        ask: 'Where is the minimum of BCE(p, y) for any target y?',
      },
      render: () => (
        <FormulaSteps
          formula={<>BCE(<T tone="coral">p</T>, 0.9)<span className="op">=</span>−[0.9 · log <T tone="coral">p</T><span className="op">+</span>0.1 · log(1 − <T tone="coral">p</T>)]</>}
          given={['smoothed real target y = 0.9', 'compare p = 0.9 and p = 0.99']}
          steps={[
            { math: <>p = 0.9: 0.9 · 0.105 + 0.1 · 2.303</>, note: '−log 0.9 = 0.105 · −log 0.1 = 2.303' },
            { math: <>= 0.095 + 0.230 = 0.325</>, note: 'the minimum' },
            { math: <>p = 0.99: 0.9 · 0.010 + 0.1 · 4.605</>, note: '−log 0.99 = 0.010 · −log 0.01 = 4.605' },
            { math: <>= 0.009 + 0.461 = 0.470</>, note: 'over-confidence costs more' },
          ]}
          result={<>best answer for a real image: p = 0.9</>}
        />
      ),
    },
    {
      id: 's5-noise-lr',
      section: 'When GANs break',
      kicker: 'Band-aids 2 and 3',
      title: 'Blur D’s view with instance noise, and balance the learning rates',
      notes: {
        time: '3 min',
        say: 'Instance noise adds small Gaussian noise to what D sees — real and fake — so the two distributions overlap and D cannot become perfectly certain; start around 0.05–0.1 and decay it. Learning-rate balance is the first thing to try: lab-04’s broken run has D at 0.01 vs G at 0.0002. TTUR (Heusel et al. 2017) gives each player its own rate; many later GANs actually give D the larger one, e.g. 4e-4 vs 1e-4.',
        ask: 'Why add the noise to fake images too, not only to real ones?',
      },
      render: () => (
        <Cards cols={3} items={[
          { tag: 'Instance noise', title: 'x + 0.05 · randn', body: 'Applied to real and fake inputs of D; decay towards 0 during training.', tone: 'blue' },
          { tag: 'Balance', title: 'Same speed first', body: 'Start with lr 0.0002 for both; lab-04 breaks D at 0.01.', tone: 'violet' },
          { tag: 'TTUR', title: 'Separate learning rates', body: 'Tune G and D independently — often D 4e-4, G 1e-4.', tone: 'mint' },
        ]} />
      ),
    },
    {
      id: 's5-oscillation',
      section: 'When GANs break',
      kicker: 'Failure 3 · oscillation',
      title: 'Oscillating losses mean the players keep overshooting each other',
      notes: {
        time: '3 min',
        say: 'These curves are illustrations, not a real run. Healthy: both losses wobble in a band and samples keep improving. Oscillating: big swings, samples get better then worse. Lower learning rates and β₁ = 0.5 help; Unit 2’s gradient penalty helps more. Always look at samples, not just losses — GAN losses do not tell you image quality.',
        ask: 'Why is “the loss went down” not good news by itself in a GAN?',
      },
      render: () => (
        <Split
          left={<div className="s5-plot"><small>Healthy · illustration</small><Plot ariaLabel="Illustrative healthy GAN losses: both curves wobble in a narrow band" x={[0, 40]} y={[0, 3]} xLabel="training time" yLabel="loss" height={280} xTicks={[0, 10, 20, 30, 40]} yTicks={[0, 1, 2, 3]} lines={[{ f: healthyD, color: '#eb5a46', label: 'D' }, { f: healthyG, color: '#277a59', label: 'G' }]} /></div>}
          right={<div className="s5-plot"><small>Oscillating · illustration</small><Plot ariaLabel="Illustrative oscillating GAN losses: both curves swing widely" x={[0, 40]} y={[0, 3]} xLabel="training time" yLabel="loss" height={280} xTicks={[0, 10, 20, 30, 40]} yTicks={[0, 1, 2, 3]} lines={[{ f: swingD, color: '#eb5a46', label: 'D' }, { f: swingG, color: '#277a59', label: 'G' }]} /></div>}
        />
      ),
    },
    {
      id: 's5-diagnostics',
      section: 'When GANs break',
      kicker: 'Field guide',
      title: 'Read the symptom, then try the cheapest fix first',
      notes: {
        time: '2 min',
        say: 'This is the table to keep next to lab-04. Each row starts with the cheapest check. Notice how often the fix is “change the balance” rather than “change the model”.',
        ask: 'Which row did you hit most in the first GAN or lab-02?',
      },
      render: () => (
        <Table
          headers={['Symptom', 'Likely cause', 'Try first']}
          rows={[
            ['All samples look alike', 'Mode collapse', 'Check fixed-noise grids; rebalance; Unit 2 losses'],
            ['D loss → 0, G loss climbs', 'D too strong', 'Lower D lr, one-sided smoothing, instance noise'],
            ['Losses swing wildly', 'Oscillation', 'Lower both lrs, Adam β₁ = 0.5'],
            ['Images stop improving', 'Poor gradient from D', 'Instance noise, balance; Unit 2 WGAN'],
            ['Images are blurry', 'No spatial structure', 'Switch to DCGAN'],
            ['G output never reaches −1 or +1', 'Range mismatch', 'Tanh output + [−1, 1] data'],
          ]}
          compact
        />
      ),
    },
    {
      id: 's5-bandaids',
      section: 'When GANs break',
      kicker: 'The honest summary',
      title: 'These fixes are band-aids — Unit 2 fixes the loss itself',
      notes: {
        time: '2 min',
        say: 'Label smoothing, instance noise and learning-rate tuning treat symptoms of the BCE objective. Unit 2 asks why BCE fails and replaces it with the Wasserstein distance, then adds a gradient penalty and conditioning.',
        ask: 'If you could change only one thing about the GAN, what would it be now?',
      },
      render: () => (
        <Mapping
          leftLabel="Problem · the band-aid"
          rightLabel="Unit 2 · the real fix"
          rows={[
            ['D too strong · smoothing, instance noise', 'WGAN: a critic score instead of a probability'],
            ['Weak or erratic gradients · lr balance', 'Wasserstein distance — useful even when D is good'],
            ['Oscillation · lower lr, β₁ = 0.5', 'WGAN-GP: gradient penalty (λ = 10)'],
            ['No control over the digit', 'Conditional GAN: add the label'],
          ]}
        />
      ),
    },
    {
      id: 's5-lab-04',
      section: 'When GANs break',
      kicker: 'Lab demo',
      title: 'Run lab-04: break the GAN on purpose, then repair it',
      notes: {
        time: '15 min',
        say: 'Each experiment is 10 short epochs of the lab-03 DCGAN. Run mode collapse (z = 2) and the diversity scores, then D too strong (D lr 0.01), then one fix. Finish with the Part 8 dashboard printing its warnings. Leave the Part 10 challenge to the learners — it is the best test of this deck.',
        ask: 'Which warning do you expect the dashboard to print for the D-too-strong run?',
      },
      render: () => (
        <LabDemo
          notebook="lab-04-training-tricks.ipynb"
          minutes={15}
          goal="Cause each failure mode, read its symptoms, then apply the band-aids."
          steps={[
            <>Part 2: healthy (z = 100) vs collapsed (z = 2) — run the diversity scores</>,
            <>Part 3: D too strong — <code>lr_d = 0.01</code> vs G’s 0.0002</>,
            <>Parts 4–6: label smoothing (0.9 / 0.1), instance noise (σ = 0.1), lr balance</>,
            <>Part 8: <code>diagnose_training()</code> prints its warnings</>,
          ]}
          watch={[
            <>Collapsed G: much lower diversity score; near-identical samples</>,
            <>D too strong: <b>D_loss → 0</b>, G_loss stuck high, D(fake) &lt; 0.05</>,
            <>Each fix helps — none removes the cause: BCE (Unit 2)</>,
          ]}
          yourTurn="Part 10: fix the broken GAN (G lr 0.00005, D lr 0.005, 3 D steps)."
        />
      ),
    },

    /* ================= CHECK ================= */
    {
      id: 's5-recap',
      section: 'Check',
      kicker: 'GANs for images · recap',
      title: 'Five ideas take you from one number to sharp images',
      notes: {
        time: '2 min',
        say: 'Rebuild the chain out loud: same loop, image shapes, convolutions, DCGAN rules, then the failure modes and their band-aids.',
        ask: 'Which of these would you explain to a colleague first?',
      },
      render: () => (
        <Recap items={[
          <>The loop is unchanged — images change <b>shapes</b> and add a Tanh output.</>,
          <>Linear layers have <b>no notion of neighbours</b>, so their images stay soft.</>,
          <>Convolutions slide <b>shared filters</b>: Conv2d shrinks, ConvTranspose2d grows.</>,
          <>DCGAN: strided convs, BatchNorm, ReLU + Tanh in G, LeakyReLU in D.</>,
          <>Collapse, a too-strong D, oscillation — these fixes are <b>band-aids</b>.</>,
        ]} />
      ),
    },
    {
      id: 's5-check',
      section: 'Check',
      kicker: 'Knowledge check · GANs for images',
      title: 'Can you reason about image GANs without the slides?',
      reveal: true,
      notes: {
        time: '5 min',
        say: 'Thinking time first, then pairs, then reveal. Spend the most time on questions 3 and 6 — they correct the two most common misconceptions.',
        ask: 'Which answer would you have got wrong before this part?',
      },
      render: ({ revealed }) => (
        <Quiz
          revealed={revealed}
          items={[
            { q: 'Why must real images be normalised to [−1, 1]?', a: 'G ends in Tanh, so fakes live in [−1, 1]; otherwise D could separate them by range alone.' },
            { q: 'What does Conv2d(64, 128, 4, stride 2, padding 1) do to a 14 × 14 map?', a: '(14 − 4 + 2)/2 + 1 = 7 → [B, 128, 7, 7].' },
            { q: 'Is DCGAN sharper because it has fewer parameters?', a: 'No: its G has 1.79 M vs 0.55 M. Locality and weight sharing make it sharp.' },
            { q: 'Where does DCGAN skip BatchNorm?', a: 'On G’s output layer and on D’s input layer.' },
            { q: 'G loss looks fine but every sample is a 1. What is it, and how do you spot it?', a: 'Mode collapse — look at a grid from fixed noise or a diversity score, not the loss.' },
            { q: 'With −log D(G(z)), does G’s gradient vanish when D(fake) = 0.0001?', a: 'Not at D’s output (σ(a) − 1 ≈ −1); a near-perfect D still gives poor direction — the loss is the root issue.' },
          ]}
        />
      ),
    },
    {
      id: 's5-bridge',
      section: 'Check',
      kicker: 'Next',
      title: 'Every activation in these networks has a job — next we name them',
      layout: 'bridge',
      notes: {
        time: '1 min',
        say: 'You have now seen ReLU, LeakyReLU, Tanh and Sigmoid in real image GANs. The activation-functions deck explains why each sits where it does, how BCEWithLogitsLoss changes D’s last layer, and why the non-saturating loss keeps G learning.',
        ask: 'Which activation choice in DCGAN are you least sure about?',
      },
      render: () => (
        <Bridge
          done="Build GANs · complete — you can build and debug an image GAN"
          question="Why ReLU and Tanh in G, LeakyReLU and Sigmoid in D?"
          next="Next deck · Activation functions in GANs"
        />
      ),
    },
  ],
};
