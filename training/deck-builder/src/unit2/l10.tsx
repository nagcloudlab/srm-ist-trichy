import './l10.css';
import { Answer, Bridge, Code, Divider, Flow, FormulaSteps, FormulaTerms, LabDemo, Mapping, Predict, Quiz, Recap, Split, Stack, T, Table, Takeaway, Versus } from '../components/kit';
import { EmbeddingLab, LabelMapLab, WhatHowLab } from '../labs/D2L10Labs';
import type { Part } from '../types';

const Op = ({ children }: { children: string }) => <span className="op">{children}</span>;

export const l10Part: Part = {
  id: 'l10',
  code: 'L10',
  label: 'Conditional GAN',
  title: 'A label steers the GAN: say “7”, get a 7',
  when: '',
  minutes: 0,
  slides: [
    /* ================= OPEN ================= */
    {
      id: 'l10-divider',
      section: 'Open',
      kicker: 'Lesson 10',
      title: 'Conditional GAN',
      layout: 'divider',
      notes: {
        time: '1 min',
        say: 'L07–L09 fixed HOW GANs train. Now we fix WHAT they generate. No more random digits — we tell the GAN exactly what we want.',
        ask: 'If you could tell a GAN to generate one specific thing, what would you choose?',
      },
      render: () => (
        <Divider
          code="L10"
          title="Conditional GAN"
          promise="Stop generating random digits — say “generate a 7” and get a 7."
          items={['The label goes to both', 'Embeddings and label maps', 'Training a cGAN', 'Label = what · noise = how', 'cGAN + WGAN-GP', 'Lab demo']}
        />
      ),
    },
    {
      id: 'l10-frustration',
      section: 'Open',
      kicker: 'The frustration',
      title: 'Our GANs work — but we can’t choose what they draw',
      notes: {
        time: '2 min',
        say: 'Press generate and you get something — a 3, a 9, anything. Fine for research, useless for real applications. A hospital that needs synthetic pneumonia X-rays cannot use a random X-ray.',
        ask: 'In what real application would you NEED to control what a GAN generates?',
      },
      render: () => (
        <>
          <Versus
            left={{ tag: 'Our GANs so far', title: 'noise → G → ???', tone: 'coral', body: <ul><li>Could be any digit</li><li>No control over the class</li><li>A chef cooking “something”</li></ul> }}
            right={{ tag: 'What we want', title: 'noise + “7” → G → 7', tone: 'mint', body: <ul><li>The label is a steering wheel</li><li>We pick the class every time</li><li>Ordering “pasta” — you get pasta</li></ul> }}
          />
          <Takeaway>Unit 1 gave a GAN that works. L07–L09 made it train stably. L10 adds steering.</Takeaway>
        </>
      ),
    },
    {
      id: 'l10-predict',
      section: 'Open',
      kicker: 'Predict',
      title: 'Is giving the label to the Generator enough?',
      reveal: true,
      notes: {
        time: '2 min',
        say: 'Let learners commit before revealing. This is the key insight of the lesson — and exactly the last experiment in lab-10.',
        ask: 'Who teaches G — and can that teacher see the label?',
      },
      render: ({ revealed }) => (
        <Predict
          revealed={revealed}
          question="Will G’s digits match their labels?"
          facts={['G gets noise + the label “7”', 'D sees only the image', 'Samples look perfectly real']}
          answer={<Answer verdict="Usually not." points={[<>G’s only teacher is <b>D</b></>, 'D can’t see the label — it can’t punish a 3 drawn for a 7', <>So G is free to <b>ignore the label</b> — and usually does</>]} />}
        />
      ),
    },

    /* ================= CORE IDEA ================= */
    {
      id: 'l10-core',
      section: 'The idea',
      kicker: 'Mirza & Osindero, 2014',
      title: 'The label goes to both networks',
      notes: {
        time: '2 min',
        say: 'The core idea is simple: feed the label to BOTH networks. G gets it to know what to make; D gets it to check whether the output matches. The original cGAN paper is Mirza & Osindero, 2014.',
        ask: 'Why do we need to give the label to both networks, not just the Generator?',
      },
      render: () => (
        <Stack gap="lg">
          <Flow size="sm" caption="Standard GAN" nodes={[
            { label: 'noise', value: 'z', tone: 'blue' }, { op: '→' },
            { label: 'generator', value: 'G', tone: 'mint' }, { op: '→' },
            { label: 'fake', value: 'x̃', tone: 'plain' }, { op: '→' },
            { label: 'discriminator', value: 'D', tone: 'coral' }, { op: '→' },
            { label: 'output', value: 'real / fake?', tone: 'plain' },
          ]} />
          <Flow size="sm" caption="Conditional GAN · D checks: “does this image match this label?”" nodes={[
            { label: 'noise + label', value: 'z, y', tone: 'blue' }, { op: '→' },
            { label: 'generator', value: 'G', tone: 'mint' }, { op: '→' },
            { label: 'fake + label', value: 'x̃, y', tone: 'plain' }, { op: '→' },
            { label: 'discriminator', value: 'D', tone: 'coral' }, { op: '→' },
            { label: 'output', value: 'real & matching?', tone: 'plain' },
          ]} />
        </Stack>
      ),
    },
    {
      id: 'l10-roles',
      section: 'The idea',
      kicker: 'Two uses of one label',
      title: 'For G the label is a recipe; for D it is a checklist',
      notes: {
        time: '2 min',
        say: 'G uses the label as instructions — “make a 7”. D uses it as a checklist — “is this really a 7?”. Without the label, D cannot verify the match.',
        ask: 'What happens if G generates a perfect 3 but the label says 7?',
      },
      render: () => (
        <>
          <Versus
            left={{ tag: 'Generator gets the label', title: '“Draw something that looks like a 7”', tone: 'mint', body: <ul><li>Label = instructions</li><li>A chef’s recipe card</li></ul> }}
            right={{ tag: 'Discriminator gets the label', title: '“Does this image look like a 7?”', tone: 'coral', body: <ul><li>Label = checklist</li><li>A waiter checking the order slip</li></ul> }}
            mid="+"
          />
          <Takeaway tone="coral">A perfect 3 sent with label “7” → D says <b>fake</b>. G must match the label, not just draw nicely.</Takeaway>
        </>
      ),
    },

    /* ================= FEEDING LABELS ================= */
    {
      id: 'l10-embedding',
      section: 'Feeding labels',
      kicker: 'nn.Embedding',
      title: 'An embedding turns the label 7 into 50 learned numbers',
      notes: {
        time: '2 min',
        say: 'Labels are integers 0–9; networks need tensors. nn.Embedding is a learnable lookup table: label 7 in, a 50-number vector out. It is exactly one_hot(y) @ W — a linear layer on the one-hot vector. The original cGAN fed the one-hot directly; lab-10 uses an embedding in G and fixed one-hot maps in D. Both are standard.',
        ask: 'Why learn the embedding instead of feeding the one-hot vector?',
      },
      render: () => (
        <Split ratio="1.1fr 1fr" left={
          <Code title="lab-10 · label embedding" code={`embed = nn.Embedding(num_classes=10, embedding_dim=50)

label_vec = embed(torch.tensor([7]))   # shape (1, 50)`} marks={{ 1: 'violet', 3: 'blue' }} />
        } right={
          <Mapping leftLabel="Label" rightLabel="Learned row of W (50 numbers)" rows={[
            ['0', '[ … 50 numbers … ]'],
            ['1', '[ … 50 numbers … ]'],
            ['…', '…'],
            ['7', '[ 0.3, −0.8, 1.2, … ]'],
            ['9', '[ … 50 numbers … ]'],
          ]} />
        } />
      ),
    },
    {
      id: 'l10-terms',
      section: 'Feeding labels',
      kicker: 'Formula · term by term',
      title: 'Conditioning only changes the inputs: G(z, y) and D(x, y)',
      notes: {
        time: '3 min',
        say: 'Every new symbol in the conditional GAN. The game and the loss are unchanged — both networks simply get the label as extra input.',
        ask: 'If we forgot to give D the label, what could G get away with?',
      },
      render: () => (
        <FormulaTerms
          symbolWidth="8rem"
          smallSymbols
          cols={2}
          reading="G reads noise plus a label vector; D reads the image plus ten label channels"
          formula={<><T tone="mint">x̃</T><Op>=</Op><span>G([</span><T tone="blue">z</T><span>;</span><T tone="violet">e(y)</T><span>])</span><Op>,</Op><T tone="violet">e(y)</T><Op>=</Op><span>onehot(</span><T tone="yellow">y</T><span>)·</span><T tone="violet">W</T></>}
          terms={[
            { symbol: 'y', name: 'Label', meaning: 'Which digit we ask for', range: '0 … 9', tone: 'yellow' },
            { symbol: 'onehot(y)', name: 'One-hot vector', meaning: '1 at position y, 0 elsewhere', range: '10 numbers', tone: 'blue' },
            { symbol: 'W', name: 'Embedding table', meaning: 'Learned — one row per class', range: '10 × 50', tone: 'violet' },
            { symbol: 'e(y)', name: 'Label embedding', meaning: 'Row y of W', range: '50 numbers', tone: 'violet' },
            { symbol: '[z ; e(y)]', name: 'G’s input', meaning: 'Noise then label, side by side', range: '64 + 50 = 114', tone: 'blue' },
            { symbol: '[x ; maps(y)]', name: 'D’s input', meaning: 'Image plus 10 label channels', range: '1 + 10 = 11 ch', tone: 'coral' },
          ]}
        />
      ),
    },
    {
      id: 'l10-embed-steps',
      section: 'Feeding labels',
      kicker: 'Formula · worked',
      title: 'An embedding lookup is a one-hot product',
      notes: {
        time: '3 min',
        say: 'Toy sizes: 4 classes, 3-number embedding. Show that the lookup and the matrix product give the same vector, then scale up to the lab: 64 noise + 50 label numbers into G, 11 channels into D.',
        ask: 'Because the lookup is linear, what happens if you blend two one-hot vectors?',
      },
      render: () => (
        <FormulaSteps
          given={['4 classes · 3-number embedding', 'y = 2', 'z = (0.5, −1.0)', 'row 2 of W = (−0.5, 0.9, 0.2)']}
          steps={[
            { math: <>onehot(2) = (0, 0, 1, 0)</>, note: 'a 1 in position 2' },
            { math: <>onehot · W = 0·w₀ + 0·w₁ + 1·w₂ + 0·w₃</>, note: 'every other row × 0' },
            { math: <>e(2) = (−0.5, 0.9, 0.2)</>, note: 'nn.Embedding just looks this row up' },
            { math: <>[z ; e] = (0.5, −1.0, −0.5, 0.9, 0.2)</>, note: '2 + 3 = 5 numbers' },
            { math: <>lab: 64 + 50 = 114 · D: 1 + 10 = 11</>, note: 'same idea at full size' },
          ]}
          result={<>Embedding = one learned row per class</>}
        />
      ),
    },
    {
      id: 'l10-embed-lab',
      section: 'Feeding labels',
      kicker: 'Live · one-hot × W',
      title: 'Pick a label and watch one row of W become G’s label input',
      lab: true,
      notes: {
        time: '3 min',
        say: 'Click through a few labels. The one-hot keeps exactly one row of W; that row is appended to the 64 noise numbers. Only 5 of the 50 columns are shown, and the values are toy numbers — in training W is learned.',
        ask: 'How many numbers in W change when we train on a batch of only 7s?',
      },
      render: () => <EmbeddingLab />,
    },
    {
      id: 'l10-g-input',
      section: 'Feeding labels',
      kicker: 'Generator input',
      title: 'G simply concatenates noise and label: 64 + 50 = 114',
      notes: {
        time: '2 min',
        say: 'For G it is plain concatenation. The 64 noise numbers get the 50 label numbers appended — 114 in total — and that goes into the first Linear layer.',
        ask: 'What would happen with a very small embedding, say 2 numbers?',
      },
      render: () => (
        <>
          <Flow nodes={[
            { label: 'noise z', value: '64', tone: 'blue', note: 'z₁ … z₆₄' }, { op: '+' },
            { label: 'label embedding', value: '50', tone: 'violet', note: 'e₁ … e₅₀' }, { op: '=' },
            { label: 'G input', value: '114', tone: 'mint', note: '[z ; e(y)]' },
          ]} />
          <Code title="Generator.forward" code={`label_vec = self.label_embed(labels)     # (batch, 50)
x = torch.cat([z, label_vec], dim=1)      # (batch, 114)
return self.model(x)`} marks={{ 2: 'violet' }} />
        </>
      ),
    },
    {
      id: 'l10-d-input',
      section: 'Feeding labels',
      kicker: 'Discriminator input',
      title: 'D gets the label as 10 extra image channels',
      notes: {
        time: '2 min',
        say: 'D’s input is a 2-D image, so we cannot just append a vector. The trick: one-hot the label, then spread each value over a full 28 × 28 plane. Label 7 → channel 7 all ones, the other nine all zeros. Image plus label maps = 11 channels.',
        ask: 'Why expand to full 28 × 28 planes instead of adding one number?',
      },
      render: () => (
        <>
          <Flow nodes={[
            { label: 'image', value: '1 × 28 × 28', tone: 'mint' }, { op: '+' },
            { label: 'label channels', value: '10 × 28 × 28', tone: 'violet', note: 'one-hot, spread out' }, { op: '=' },
            { label: 'D input', value: '11 × 28 × 28', tone: 'coral' },
          ]} />
          <Mapping rows={[
            ['Label 7 → one-hot', '[0, 0, 0, 0, 0, 0, 0, 1, 0, 0]'],
            ['Expand each value to 28 × 28', 'Channel for 7 = all 1s · others = all 0s'],
            ['Concatenate with the image', '1 + 10 = 11 input channels'],
          ]} />
        </>
      ),
    },
    {
      id: 'l10-maps-lab',
      section: 'Feeding labels',
      kicker: 'Live · label maps',
      title: 'Pick a label: one of ten channels lights up beside the image',
      lab: true,
      notes: {
        time: '2 min',
        say: 'Change the label and watch which channel turns white. Every 3 × 3 conv window sees the label at every position — that is why we spread it over the whole grid.',
        ask: 'The label maps hold 10× more numbers than the image. Is that wasteful?',
      },
      render: () => <LabelMapLab />,
    },
    {
      id: 'l10-make-maps',
      section: 'Feeding labels',
      kicker: 'make_label_maps',
      title: 'Label maps are pure reshaping — no learnable parameters',
      notes: {
        time: '2 min',
        say: 'scatter_ does the one-hot encoding (same as F.one_hot(labels, 10).float()). view adds two spatial dimensions. expand fills each value across the 28 × 28 grid without copying memory.',
        ask: 'What does the 1 in scatter_(1, …) mean?',
      },
      render: () => (
        <Code
          title="Discriminator.make_label_maps"
          code={`def make_label_maps(self, labels, h, w):
    bs = labels.size(0)                          # labels e.g. [7, 3]
    one_hot = torch.zeros(bs, 10, device=labels.device)
    one_hot.scatter_(1, labels.unsqueeze(1), 1.0)
    # [0,0,0,0,0,0,0,1,0,0]  <- label 7
    # [0,0,0,1,0,0,0,0,0,0]  <- label 3
    return (one_hot.view(bs, 10, 1, 1)           # (batch, 10, 1, 1)
                   .expand(-1, -1, h, w))         # (batch, 10, h, w)`}
          marks={{ 4: 'blue', 7: 'violet', 8: 'violet' }}
          notes={{ 4: 'one-hot along dim 1', 7: 'add spatial dims', 8: 'fill each plane' }}
        />
      ),
    },

    /* ================= ARCHITECTURE & TRAINING ================= */
    {
      id: 'l10-g-arch',
      section: 'Build & train',
      kicker: 'Generator',
      title: 'Only G’s first layer grows: Linear(64 + 50, 256·7·7)',
      notes: {
        time: '2 min',
        say: 'The same DCGAN generator as Unit 1. The only change: the first Linear takes z_dim + embed_dim = 114 inputs. The embedding is learned with the rest of the network. That adds 50 × 12,544 = 627,200 weights to the first layer, plus the 500-number table.',
        ask: 'Which layer is the only one that changes size compared to Unit 1’s generator?',
      },
      render: () => (
        <Stack gap="md">
          <Code title="lab-10 · Generator" code={`class Generator(nn.Module):
    def __init__(self, z_dim=64, num_classes=10, embed_dim=50):
        super().__init__()
        self.label_embed = nn.Embedding(num_classes, embed_dim)
        self.model = nn.Sequential(
            nn.Linear(z_dim + embed_dim, 256 * 7 * 7),
            nn.Unflatten(1, (256, 7, 7)),
            nn.ConvTranspose2d(256, 128, 4, 2, 1),
            nn.BatchNorm2d(128), nn.ReLU(),
            nn.ConvTranspose2d(128, 1, 4, 2, 1),
            nn.Tanh(),
        )`} marks={{ 4: 'violet', 6: 'mint' }} notes={{ 4: '10 × 50 = 500 numbers', 6: '114 inputs (was 64)' }} />
          <div className="l10-trace"><span>114</span><b>→</b><span>256 × 7 × 7</span><b>→</b><span>128 × 14 × 14</span><b>→</b><span>1 × 28 × 28</span></div>
        </Stack>
      ),
    },
    {
      id: 'l10-d-arch',
      section: 'Build & train',
      kicker: 'Discriminator',
      title: 'Only D’s first conv grows: 11 input channels instead of 1',
      notes: {
        time: '2 min',
        say: 'D’s first Conv2d takes 1 + 10 = 11 channels — the image plus the label maps. Everything after it is Unit 1’s DCGAN discriminator. It learns to check whether the image matches the label.',
        ask: 'Where does the 11 come from?',
      },
      render: () => (
        <Code title="lab-10 · Discriminator" code={`class Discriminator(nn.Module):
    def __init__(self, num_classes=10):
        super().__init__()
        self.model = nn.Sequential(
            nn.Conv2d(1 + num_classes, 64, 4, 2, 1),   # 11 x 28 x 28 in
            nn.LeakyReLU(0.2),
            nn.Conv2d(64, 128, 4, 2, 1), nn.BatchNorm2d(128), nn.LeakyReLU(0.2),
            nn.Flatten(), nn.Linear(128 * 7 * 7, 1), nn.Sigmoid(),
        )

    def forward(self, images, labels):
        label_maps = self.make_label_maps(labels, 28, 28)
        x = torch.cat([images, label_maps], dim=1)       # (batch, 11, 28, 28)
        return self.model(x)`} marks={{ 5: 'coral', 12: 'violet', 13: 'violet' }} notes={{ 5: '1 image + 10 label channels', 13: 'image + label maps' }} />
      ),
    },
    {
      id: 'l10-so-far',
      section: 'Build & train',
      kicker: 'So far',
      title: 'Five pieces turn a GAN into a conditional GAN',
      notes: {
        time: '1 min',
        say: 'Quick checkpoint before training. Every piece is about getting the label into both networks.',
        ask: 'Describe the data flow from label integer to D’s input in one sentence.',
      },
      render: () => (
        <Table
          headers={['Piece', 'How it works']}
          rows={[
            ['Core idea', 'Feed the label to BOTH G and D'],
            ['Embedding', 'nn.Embedding turns the integer label into a learned 50-number vector'],
            ['G input', 'Concatenate noise + label embedding → 114 numbers'],
            ['D input', 'Concatenate image + label channels → 11 × 28 × 28'],
            ['Label channels', 'One-hot, then expand to ten full 28 × 28 planes'],
          ]}
        />
      ),
    },
    {
      id: 'l10-train',
      section: 'Build & train',
      kicker: 'Training loop',
      title: 'Training is Unit 1’s loop with labels passed everywhere',
      notes: {
        time: '3 min',
        say: 'Almost identical to Unit 1. The only difference: pass labels into every G and D call. Fakes reuse the batch’s real labels so classes stay balanced; random labels work too. Why BCE again after three lessons against it? lab-10 keeps Unit 1’s DCGAN recipe so only ONE thing changes — conditioning. The WGAN-GP version comes in two slides.',
        ask: 'Spot the places where labels appear in this loop.',
      },
      render: () => (
        <Code title="lab-10 · one iteration" code={`for real_images, real_labels in data:
    bs = real_images.size(0)
    # -- Step A: train D --
    noise = torch.randn(bs, z_dim, device=device)
    fake_images = gen(noise, real_labels).detach()
    loss_D = BCE(disc(real_images, real_labels), ones) + \\
             BCE(disc(fake_images, real_labels), zeros)
    opt_D.zero_grad(); loss_D.backward(); opt_D.step()
    # -- Step B: train G --
    noise = torch.randn(bs, z_dim, device=device)
    pred_fake = disc(gen(noise, real_labels), real_labels)
    loss_G = BCE(pred_fake, ones)
    opt_G.zero_grad(); loss_G.backward(); opt_G.step()`} marks={{ 5: 'violet', 6: 'violet', 7: 'violet', 11: 'violet' }} notes={{ 5: 'label → G', 6: 'label → D (real)', 7: 'label → D (fake)', 11: 'label → G and D' }} />
      ),
    },
    {
      id: 'l10-why-d',
      section: 'Build & train',
      kicker: 'Why D needs the label',
      title: 'Without the order slip, D can’t reject the wrong dish',
      notes: {
        time: '2 min',
        say: 'Use the restaurant analogy. Without the label, D is a waiter who never checks the order slip: a burger when you ordered pasta? “Looks like good food!” The label is the order slip.',
        ask: 'In the restaurant analogy, who is the customer?',
      },
      render: () => (
        <Versus
          left={{ tag: 'Only G gets the label · wrong', title: 'A perfect 3 for “7” passes', tone: 'coral', body: <ul><li>D sees the image only: “looks real!”</li><li>Mismatch is never punished</li><li>Waiter without an order slip</li></ul> }}
          right={{ tag: 'Both get the label · correct', title: 'A 3 for “7” is rejected', tone: 'mint', body: <ul><li>D sees image + “7”: “not a 7 — fake”</li><li>G must match the label</li><li>Waiter checks the slip</li></ul> }}
        />
      ),
    },

    /* ================= CONTROL ================= */
    {
      id: 'l10-generate',
      section: 'What vs how',
      kicker: 'Generate on demand',
      title: 'After training, every row is one digit and every column one style',
      notes: {
        time: '2 min',
        say: 'Same noise with different labels gives different digits in the same style. Same label with different noise gives the same digit in different styles. Noise controls HOW, the label controls WHAT.',
        ask: 'What would the grid look like if you fixed the noise AND the label?',
      },
      render: () => (
        <Split ratio="1.2fr 1fr" left={
          <Code title="lab-10 · the payoff" code={`gen.eval()
for digit in range(10):
    noise  = torch.randn(8, z_dim, device=device)
    labels = torch.full((8,), digit, dtype=torch.long,
                        device=device)
    fakes  = gen(noise, labels)          # one row`} marks={{ 4: 'violet', 6: 'mint' }} />
        } right={
          <Mapping leftLabel="Grid" rightLabel="Expected" rows={[
            ['Row 0', '0 0 0 0 0 0 0 0'],
            ['Row 1', '1 1 1 1 1 1 1 1'],
            ['…', '…'],
            ['Row 9', '9 9 9 9 9 9 9 9'],
          ]} />
        } />
      ),
    },
    {
      id: 'l10-what-how-lab',
      section: 'What vs how',
      kicker: 'Live · what vs how',
      title: 'The label picks the digit; the noise picks the handwriting',
      lab: true,
      notes: {
        time: '3 min',
        say: 'Fix the label and re-roll the noise: same digit, new styles. Switch to “fix noise”: one style, all ten digits. This is an illustration of the split a trained cGAN learns — real samples come from lab-10.',
        ask: 'Which knob would you turn to get a thicker 7 — the label or the noise?',
      },
      render: () => <WhatHowLab />,
    },
    {
      id: 'l10-what-how',
      section: 'What vs how',
      kicker: 'Separation of concerns',
      title: 'Label controls what; noise controls how',
      notes: {
        time: '2 min',
        say: 'The label controls the category — WHAT. The noise controls the variation — HOW: thick or thin, tilted or straight, rounded or angular. Together they give full control.',
        ask: 'Like ordering food: which part is the dish name and which is the chef’s touch?',
      },
      render: () => (
        <>
          <Versus
            left={{ tag: 'Label controls WHAT', title: 'The class', tone: 'violet', body: <ul><li>“Generate a 7”</li><li>“Generate a 3”</li></ul> }}
            right={{ tag: 'Noise controls HOW', title: 'The style', tone: 'blue', body: <ul><li>Thick or thin strokes</li><li>Tilted or straight</li><li>Rounded or angular</li></ul> }}
          />
          <Mapping rows={[
            ['y = 7, noise A', 'a thick, tilted 7'],
            ['y = 7, noise B', 'a thin, straight 7'],
            ['y = 3, noise A', 'a thick, tilted 3'],
          ]} />
        </>
      ),
    },
    {
      id: 'l10-wgan-gp',
      section: 'What vs how',
      kicker: 'cGAN + WGAN-GP',
      title: 'Combine conditioning with WGAN-GP — the penalty needs labels too',
      notes: {
        time: '2 min',
        say: 'Conditioning is orthogonal to the loss: use a conditional critic with the Wasserstein loss and gradient penalty from L08–L09. The critic has no Sigmoid and no BatchNorm, trains 5:1, and the gradient-penalty function must pass labels because the critic expects them.',
        ask: 'What changes in the gradient-penalty function when the critic is conditional?',
      },
      render: () => (
        <Split ratio="1fr 1.2fr" left={
          <Recap items={['Critic, not discriminator (no Sigmoid)', 'Wasserstein loss + gradient penalty', 'No BatchNorm in the critic', '5 critic steps per G step']} />
        } right={
          <Code title="conditional WGAN-GP" code={`loss_C = (critic(fake, labels).mean()
          - critic(real, labels).mean()
          + 10 * gradient_penalty(critic, real, fake,
                                  labels, device))
loss_G = -critic(fake, labels).mean()

# inside gradient_penalty:
scores = critic(interpolated, labels)   # labels!`} marks={{ 3: 'violet', 8: 'violet' }} notes={{ 8: 'interpolates keep their labels' }} />
        } />
      ),
    },
    {
      id: 'l10-lab',
      section: 'What vs how',
      kicker: 'Lab demo',
      title: 'Run lab-10: say “generate a 7” — then prove D needs the label',
      notes: {
        time: '5 min',
        say: 'Run Data (labels kept this time), the conditional G and D, and the label-map test — show the 10 channels for digit 7. Start training and talk over it. Then the payoff grid, the same-noise row, and finally the broken cGAN where D ignores labels — the most convincing two minutes of the lesson. The trained generator is saved for lab-11.',
        ask: 'Before the last experiment: if D can’t see the label, what will G do with it?',
      },
      render: () => (
        <LabDemo
          notebook="lab-10-conditional-gan.ipynb"
          goal="Say “generate a 7” and get a 7 — then prove D needs the label."
          steps={[
            <>Parts 1–3: conditional <b>G</b> (114-number input) and <b>D</b> (11 × 28 × 28), then the label-map test for digit 7</>,
            <>Part 4: train — BCE, Adam <code>2e-4</code>, betas <code>(0.5, 0.999)</code>, <code>30</code> epochs; saves <code>cgan_generator.pt</code></>,
            <>Parts 6–7: the payoff grid, then “same noise, different labels”</>,
            <>Part 8: the broken cGAN — D never sees the label</>,
          ]}
          watch={[
            <>Label maps shape <code>(1, 10, 28, 28)</code> — only channel 7 is white</>,
            <>Grid: each row one digit, each column one style</>,
            <>Broken cGAN: digits <b>don’t match</b> their labels</>,
          ]}
          yourTurn="Train G with random labels for its fakes instead of the batch’s real labels. Any difference?"
        />
      ),
    },

    /* ================= CHECK ================= */
    {
      id: 'l10-recap',
      section: 'Check',
      kicker: 'Lesson 10 recap',
      title: 'Labels go to both networks — everything else follows',
      notes: {
        time: '2 min',
        say: 'Six takeaways. The core insight: the label goes to both networks.',
        ask: 'Which takeaway would you explain to a friend?',
      },
      render: () => (
        <Recap items={[
          <>The label goes to <b>both</b> G and D</>,
          <>Embedding: integer label → learned vector, = onehot(y)·W</>,
          <>D sees the label as <b>10 extra channels</b> → 11 input channels</>,
          <>D needs the label to reject mismatches</>,
          <>Label = <b>what</b> · noise = <b>how</b></>,
          <>cGAN + WGAN-GP: control and stability together</>,
        ]} />
      ),
    },
    {
      id: 'l10-check',
      section: 'Check',
      kicker: 'Knowledge check',
      title: 'Can you predict what a conditional GAN does?',
      reveal: true,
      notes: {
        time: '4 min',
        say: 'Eye-opener questions. Give learners a minute on each before revealing.',
        ask: 'Try all four before revealing any.',
      },
      render: ({ revealed }) => (
        <Quiz revealed={revealed} cols={2} items={[
          { q: 'Ten one-hot maps are 10× the pixels. Why not one channel holding y / 10?', a: 'One value invents an order (“4 is between 3 and 5”). One-hot keeps classes unrelated; at 1000 classes use a projection discriminator (Miyato & Koyama 2018).' },
          { q: '10% of training 7s are mislabelled as 1. What happens when you ask for a 1?', a: 'D learns “7-shaped image + label 1” is real, so G is rewarded for sometimes drawing a 7. Label noise flows straight into samples.' },
          { q: 'You fix the noise and change only the label. What stays the same?', a: 'The style — thickness, slant, roundness — while the digit changes.' },
          { q: 'Embedding vs feeding the raw one-hot to G: is one more powerful?', a: 'No — onehot·W is what the first Linear does anyway. The embedding is a cheap lookup with the same expressiveness.' },
        ]} />
      ),
    },
    {
      id: 'l10-bridge',
      section: 'Check',
      kicker: 'Next lesson',
      title: 'We control WHAT. Can we control a thicker, more tilted 7?',
      layout: 'bridge',
      notes: {
        time: '1 min',
        say: 'We can now choose WHICH digit. But finer control — thicker, more tilted, more rounded — lives in the noise. That is latent-space manipulation, next lesson.',
        ask: 'Which direction in noise space do you think makes a 7 thicker?',
      },
      render: () => <Bridge done="Lesson 10 · complete" question="We control WHAT. Can we control a thicker, more tilted 7?" next="L11 · Controllable generation" />,
    },
  ],
};
