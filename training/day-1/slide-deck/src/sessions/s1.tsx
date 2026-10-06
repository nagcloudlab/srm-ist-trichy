import './s1.css';
import { Bridge, Cards, Divider, Flow, Mapping, Predict, ProsCons, Quiz, Recap, Split, Stats, Steps, Table, Takeaway, Timeline, Versus, Answer } from '../components/kit';
import { PixelDigit } from '../components/art';
import { S1GenerationLab } from '../labs/S1GenerationLab';
import type { Part } from '../types';

/** Noise → G → fake ↘ D ← real : the adversarial setup at a glance. */
function GanSketch() {
  return (
    <figure className="figure s1-gan-sketch">
      <svg viewBox="0 0 760 280" role="img" aria-label="Noise goes into the Generator, which makes a fake image. The Discriminator sees fake and real images and answers real or fake.">
        <defs>
          <marker id="s1-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#68707c" /></marker>
        </defs>
        <rect x="10" y="40" width="120" height="70" rx="14" fill="#e8edff" stroke="#3157d5" strokeWidth="2.5" />
        <text x="70" y="70" textAnchor="middle" className="s1-svg-label" fill="#3157d5">NOISE</text>
        <text x="70" y="94" textAnchor="middle" className="s1-svg-value">z</text>
        <rect x="180" y="30" width="150" height="90" rx="16" fill="#dff5ea" stroke="#277a59" strokeWidth="3" />
        <text x="255" y="66" textAnchor="middle" className="s1-svg-label" fill="#277a59">GENERATOR</text>
        <text x="255" y="98" textAnchor="middle" className="s1-svg-value">G</text>
        <rect x="380" y="40" width="120" height="70" rx="14" fill="#fffdf8" stroke="#277a59" strokeWidth="2" strokeDasharray="6 5" />
        <text x="440" y="70" textAnchor="middle" className="s1-svg-label" fill="#277a59">FAKE</text>
        <text x="440" y="94" textAnchor="middle" className="s1-svg-small">image</text>
        <rect x="380" y="170" width="120" height="70" rx="14" fill="#e8edff" stroke="#3157d5" strokeWidth="2.5" />
        <text x="440" y="200" textAnchor="middle" className="s1-svg-label" fill="#3157d5">REAL</text>
        <text x="440" y="224" textAnchor="middle" className="s1-svg-small">image</text>
        <rect x="545" y="95" width="180" height="90" rx="16" fill="#fde9e5" stroke="#c8432f" strokeWidth="3" />
        <text x="635" y="131" textAnchor="middle" className="s1-svg-label" fill="#c8432f">DISCRIMINATOR</text>
        <text x="635" y="163" textAnchor="middle" className="s1-svg-value">D</text>
        <path d="M130 75 L176 75" stroke="#68707c" strokeWidth="2.5" markerEnd="url(#s1-arrow)" />
        <path d="M330 75 L376 75" stroke="#68707c" strokeWidth="2.5" markerEnd="url(#s1-arrow)" />
        <path d="M500 75 Q528 75 541 113" stroke="#68707c" strokeWidth="2.5" fill="none" markerEnd="url(#s1-arrow)" />
        <path d="M500 205 Q528 205 541 167" stroke="#68707c" strokeWidth="2.5" fill="none" markerEnd="url(#s1-arrow)" />
        <path d="M725 140 L752 140" stroke="#68707c" strokeWidth="2.5" markerEnd="url(#s1-arrow)" />
        <text x="635" y="232" textAnchor="middle" className="s1-svg-small">“real or fake?”</text>
      </svg>
    </figure>
  );
}

const rankings: { label: string; note: string; order: { name: string; tone: string }[] }[] = [
  { label: 'Image quality', note: 'best first', order: [{ name: 'Diffusion', tone: 'blue' }, { name: 'GAN', tone: 'mint' }, { name: 'VAE', tone: 'violet' }] },
  { label: 'Generation speed', note: 'fastest first', order: [{ name: 'GAN', tone: 'mint' }, { name: 'VAE', tone: 'violet' }, { name: 'Diffusion', tone: 'blue' }] },
  { label: 'Training ease', note: 'easiest first', order: [{ name: 'VAE', tone: 'violet' }, { name: 'Diffusion', tone: 'blue' }, { name: 'GAN', tone: 'mint' }] },
];

export const s1Part: Part = {
  id: 's1',
  code: 'S1',
  label: 'GenAI',
  title: 'The World of Generative AI',
  when: 'Morning 1',
  minutes: 75,
  slides: [
    {
      id: 's1-divider',
      section: 'Big picture',
      kicker: 'Session 1',
      title: 'The World of Generative AI',
      layout: 'divider',
      notes: {
        time: '1 min',
        say: 'This session is the map. Before we zoom into GANs, we see the whole landscape so you know where GANs sit and why we are spending four days on them.',
        ask: 'What is one generative AI tool you used in the last month?',
      },
      render: () => (
        <Divider
          code="S1"
          title="The World of Generative AI"
          promise="See the big picture — what generative AI is, the four main approaches, and why GANs are worth mastering."
          items={['Understand vs create', 'Four approaches', 'Compare them', 'Where GANs shine', 'The GAN family tree']}
        />
      ),
    },
    {
      id: 's1-understand-create',
      section: 'Big picture',
      kicker: 'Two kinds of AI',
      title: 'Normal AI understands; generative AI creates',
      notes: {
        time: '3 min',
        say: 'Most AI you have met answers a question about an input: spam or not, cat or dog, rain or no rain. Generative AI produces something that did not exist before. The output is content, not a label.',
        ask: 'Is a spam filter generative? Why not?',
      },
      render: () => (
        <>
          <Versus
            left={{ tag: 'Normal AI', title: 'Understands things', tone: 'blue', body: <ul><li>“Is this email spam?” — classification</li><li>“What's in this photo?” — detection</li><li>“Will it rain tomorrow?” — prediction</li></ul> }}
            right={{ tag: 'Generative AI', title: 'Creates new things', tone: 'mint', body: <ul><li>A poem that never existed</li><li>A face that belongs to no one</li><li>Music no one has heard · an X-ray for training doctors</li></ul> }}
          />
          <div className="s1-two-flows">
            <Flow size="sm" nodes={[{ label: 'input', value: 'email', tone: 'blue' }, { op: '→' }, { label: 'answer', value: 'spam ✓', tone: 'ink' }]} />
            <Flow size="sm" nodes={[{ label: 'input', value: '“a cat”', tone: 'blue' }, { op: '→' }, { label: 'new content', value: 'cat image', tone: 'mint' }]} />
          </div>
        </>
      ),
    },
    {
      id: 's1-predict-generative',
      section: 'Big picture',
      kicker: 'Quick sort',
      title: 'Which of these systems is generative?',
      reveal: true,
      notes: {
        time: '3 min',
        say: 'Read the four systems. Ask everyone to commit: generative or not. The test is simple — does the output contain new content, or a judgement about existing content?',
        ask: 'Which one did the room disagree on most?',
      },
      render: ({ revealed }) => (
        <Predict
          revealed={revealed}
          question={<>
            <p>Sort these four:</p>
            <ol className="predict-list">
              <li><span>A</span>A face-unlock check</li>
              <li><span>B</span>Autocomplete writing your next sentence</li>
              <li><span>C</span>A tumour detector on X-rays</li>
              <li><span>D</span>A tool that makes synthetic X-rays for training</li>
            </ol>
          </>}
          answer={<Answer verdict="B and D are generative" points={[<><b>B, D</b> output new content</>, <><b>A, C</b> output a judgement about an existing input</>, 'X-rays sit on both sides — what matters is the output']} />}
        />
      ),
    },
    {
      id: 's1-what-creates',
      section: 'Big picture',
      kicker: 'What it can create',
      title: 'Different media, one big idea',
      notes: {
        time: '3 min',
        say: 'Walk the table quickly — these are the tools people already know. The point is the last line: different tools, same idea. Learn patterns from real data, then create new data that follows those patterns.',
        ask: 'Which row surprises you most — maybe synthetic data rows?',
      },
      render: () => (
        <>
          <Table
            compact
            headers={['Type', 'What it creates', "You've probably seen"]}
            rows={[
              ['Text', 'Stories, emails, chat', 'ChatGPT, Gemini, Claude'],
              ['Images', 'Photos, art, designs', 'DALL·E, Midjourney, Stable Diffusion'],
              ['Audio', 'Speech, music, sound effects', 'Suno, ElevenLabs'],
              ['Video', 'Clips, animations', 'Sora, Runway'],
              ['3D', 'Objects, scenes', 'Point-E, 3D-GAN'],
              ['Data', 'Synthetic table rows, medical records', 'CTGAN'],
              ['Code', 'Programs, functions', 'GitHub Copilot'],
            ]}
          />
          <Takeaway>Same big idea everywhere: learn patterns from real data, then create new data that follows those patterns.</Takeaway>
        </>
      ),
    },
    {
      id: 's1-patterns',
      section: 'Big picture',
      kicker: 'How a machine “creates”',
      title: 'It learns patterns from examples, then produces something new',
      notes: {
        time: '4 min',
        say: 'The machine does not imagine. Show it many examples — here, many handwritten 7s — and it learns what they have in common: a top bar, a diagonal stroke, similar thickness. Then it produces a new 7 that follows those patterns but matches none of the examples exactly.',
        ask: 'If every training 7 has a top bar, what will a generated 7 almost certainly have?',
      },
      render: () => (
        <>
          <div className="s1-patterns">
            <figure className="s1-pattern-group">
              <small>TRAINING · many real examples</small>
              <div className="s1-digit-grid">
                {[11, 12, 13, 14, 15, 16, 17, 18].map((seed) => <PixelDigit key={seed} digit="7" seed={seed} wobble={0.09} px={78} label="A training 7" />)}
              </div>
              <figcaption>learns: top bar · diagonal · stroke thickness · centred</figcaption>
            </figure>
            <span className="s1-big-arrow" aria-hidden="true">→</span>
            <figure className="s1-pattern-group s1-pattern-new">
              <small>GENERATING · “give me a new 7”</small>
              <PixelDigit digit="7" seed={42} wobble={0.09} px={170} label="A newly generated 7" />
              <figcaption><b>New</b> — follows the patterns, copies no example</figcaption>
            </figure>
          </div>
          <Takeaway tone="blue">The key question for the rest of today: <b>how exactly</b> does a model learn patterns and create? Each approach answers differently.</Takeaway>
        </>
      ),
    },
    {
      id: 's1-four-approaches',
      section: 'Four approaches',
      kicker: 'The landscape',
      title: 'Four families of generative models',
      notes: {
        time: '2 min',
        say: 'Here is the menu. One sentence each — we will open each card next. Notice they all solve the same problem in completely different ways.',
        ask: 'From the one-line descriptions, which do you predict gives the sharpest images? The fastest?',
      },
      render: () => (
        <Cards cols={4} items={[
          { tag: '1 · VAE', title: 'Compress and rebuild', body: 'Squeeze data into a small code, then decode codes into new samples.', tone: 'violet', icon: <PixelDigit digit="7" seed={5} blur={0.9} px={64} /> },
          { tag: '2 · GAN', title: 'Compete', body: 'A generator makes fakes, a discriminator catches them — both improve.', tone: 'mint', icon: <PixelDigit digit="7" seed={5} px={64} /> },
          { tag: '3 · Transformer', title: 'Predict the next piece', body: 'Generate one token (word, pixel patch) at a time from what came before.', tone: 'yellow', icon: <span className="s1-icon-text">the cat sat…</span> },
          { tag: '4 · Diffusion', title: 'Remove noise', body: 'Start from pure static; denoise step by step until an image appears.', tone: 'blue', icon: <PixelDigit digit="7" seed={5} noise={0.6} px={64} /> },
        ]} />
      ),
    },
    {
      id: 's1-vae',
      section: 'Four approaches',
      kicker: '1 · Autoencoders / VAEs',
      title: 'A VAE squeezes an image into a tiny code, then rebuilds it',
      notes: {
        time: '4 min',
        say: 'Encoder compresses 784 pixels to about 20 numbers; decoder rebuilds. After training, throw away the encoder and feed random codes to the decoder — new images. Like zipping a photo too hard: details get lost, so results look blurry.',
        ask: 'Why would forcing 784 numbers through 20 lose the fine details?',
      },
      render: () => (
        <>
          <Flow nodes={[
            { label: 'image', value: <PixelDigit digit="3" seed={2} px={84} />, tone: 'blue', note: '784 pixels' },
            { op: '→' },
            { label: 'encoder', value: 'E', tone: 'violet' },
            { op: '→' },
            { label: 'small code', value: '20 nums', tone: 'yellow', note: 'the bottleneck' },
            { op: '→' },
            { label: 'decoder', value: 'D', tone: 'violet' },
            { op: '→' },
            { label: 'rebuilt', value: <PixelDigit digit="3" seed={2} blur={0.85} px={84} />, tone: 'blue', note: '784 pixels' },
          ]} caption="To generate: discard the encoder and decode a random code." />
          <ProsCons good={['Simple to understand', 'Stable training', 'Fast generation']} bad={['Images are blurry', 'Not very sharp or detailed', 'Limited quality']} />
        </>
      ),
    },
    {
      id: 's1-gan',
      section: 'Four approaches',
      kicker: '2 · GANs',
      title: 'A GAN makes two networks compete — and both improve',
      notes: {
        time: '4 min',
        say: 'Noise goes into the Generator, which makes a fake. The Discriminator sees fakes and real images and says which is which. A forger versus a detective: the competition makes both better. This is the course.',
        ask: 'What does the Generator get as input — notice it is not an image.',
      },
      render: () => (
        <Split
          ratio="1.4fr 1fr"
          left={<GanSketch />}
          right={<>
            
            <ProsCons good={['Sharp, realistic images', 'Fast generation', 'Faces, art, medical']} bad={['Hard to train', 'Can be unstable', 'Mode collapse (gets stuck)']} />
          </>}
        />
      ),
    },
    {
      id: 's1-transformer',
      section: 'Four approaches',
      kicker: '3 · Transformers',
      title: 'A transformer generates one piece at a time, predicting what comes next',
      notes: {
        time: '4 min',
        say: 'The model looks at everything so far and scores every possible next token. Pick one, append it, repeat. Phone autocomplete, but enormously smarter. Original DALL·E (2021) generated images this way too, token by token. The probabilities here are illustrative.',
        ask: 'If it writes one word per step, how many steps for a 500-word answer?',
      },
      render: () => (
        <Split
          ratio="1.2fr 1fr"
          left={
            <figure className="figure s1-tokens">
              <p className="s1-context">“The cat sat on the <span className="s1-blank">___</span>”</p>
              {[['mat', 0.62], ['floor', 0.18], ['sofa', 0.11], ['roof', 0.05]].map(([word, p]) => (
                <div key={word as string} className="s1-token-row">
                  <span>{word}</span>
                  <div className="s1-token-bar"><i style={{ width: `${(p as number) * 100}%` }} /></div>
                  <b>{Math.round((p as number) * 100)}%</b>
                </div>
              ))}
              <figcaption>Illustrative next-token probabilities → pick “mat”, append, repeat.</figcaption>
            </figure>
          }
          right={<ProsCons good={['Best for text (ChatGPT, …)', 'Can do images too (DALL·E 2021)', 'Understands context well']} bad={['Needs massive data', 'Very large models', 'Expensive to train']} />}
        />
      ),
    },
    {
      id: 's1-diffusion',
      section: 'Four approaches',
      kicker: '4 · Diffusion models',
      title: 'Diffusion starts from static and removes noise, step by step',
      notes: {
        time: '4 min',
        say: 'Training teaches the model to remove a little noise. Generation starts from pure static and repeats the denoising step many times — like sculpting: start with a rough block, carve away. Highest quality today, but every image needs many network passes.',
        ask: 'If each step is one full network pass, what does 50 steps cost compared with a GAN?',
      },
      render: () => (
        <>
          <div className="s1-strip">
            {[1, 0.75, 0.5, 0.28, 0.1, 0].map((n, i) => (
              <figure key={i}>
                <PixelDigit digit="7" seed={5} noise={n} px={118} label={`Noise level ${n}`} />
                <figcaption>{['step 0 · static', 'shapes?', 'a stroke', 'a 7 appears', 'almost', 'step N · clear'][i]}</figcaption>
              </figure>
            ))}
          </div>
          <ProsCons good={['Very high quality images', 'More stable than GANs', 'State of the art for image quality']} bad={['Slow: many steps needed', 'Heavy computation', 'More complex math']} />
        </>
      ),
    },
    {
      id: 's1-lab-cost',
      section: 'Four approaches',
      kicker: 'Generation cost',
      title: 'One pass versus many: see why GANs are fast',
      lab: true,
      notes: {
        time: '5 min',
        say: 'All three panels produce a 7. VAE and GAN each need exactly one network pass. Drag the diffusion slider: each step is another full pass. Switch N to 100 and run it — watch the pass counter and the time climb while the GAN panel was done at step one.',
        ask: 'For a live video filter at 30 frames per second, which column can you afford?',
      },
      render: () => <S1GenerationLab />,
    },
    {
      id: 's1-compare',
      section: 'Compare',
      kicker: 'Side by side',
      title: 'Each approach wins somewhere — GANs win on sharp and fast',
      notes: {
        time: '3 min',
        say: 'Read across the GAN row: sharp, fast, but tricky to train. That trade-off is the theme of this course — Session 5 shows how GANs break, and Day 2 fixes the training itself.',
        ask: 'Which column would you check first when choosing for a phone app?',
      },
      render: () => (
        <Table
          headers={['Approach', 'Best for', 'Quality', 'Training', 'Speed']}
          rows={[
            ['VAE', 'Simple generation', 'Blurry', 'Easy', 'Fast'],
            ['GAN', 'Images, faces, medical', 'Sharp', 'Tricky', 'Fast'],
            ['Transformer', 'Text, code, chat', 'Excellent', 'Needs huge data', 'Medium'],
            ['Diffusion', 'High-quality images', 'Best', 'Stable', 'Slow'],
          ]}
          highlight={[1]}
        />
      ),
    },
    {
      id: 's1-rankings',
      section: 'Compare',
      kicker: 'Image models ranked',
      title: 'No approach is first on every ranking',
      notes: {
        time: '3 min',
        say: 'Three rankings for image generation. Diffusion leads quality, GAN leads speed, VAE leads ease. GAN is last on training ease — which is exactly why debugging GANs gets its own section in Session 5 today, and Day 2 fixes the loss.',
        ask: 'If training ease mattered most, which would you pick — and what would you give up?',
      },
      render: () => (
        <div className="s1-ranks">
          {rankings.map((r) => (
            <article key={r.label} className="s1-rank">
              <header><strong>{r.label}</strong><small>{r.note}</small></header>
              <ol>
                {r.order.map((o, i) => <li key={o.name} className={`tone-${o.tone} ${o.name === 'GAN' ? 's1-rank-gan' : ''}`} style={{ width: `${100 - i * 22}%` }}><span>{i + 1}</span>{o.name}</li>)}
              </ol>
            </article>
          ))}
        </div>
      ),
    },
    {
      id: 's1-predict-choice',
      section: 'Compare',
      kicker: 'Your call',
      title: 'Pick the right tool for the job',
      reveal: true,
      notes: {
        time: '3 min',
        say: 'Three scenarios. Ask learners to vote for each before revealing. There is no single best model — only the best fit for the constraint.',
        ask: 'Which constraint drove your choice in each case: speed, quality, or data?',
      },
      render: ({ revealed }) => (
        <Predict
          revealed={revealed}
          question={<>
            <p>Which approach fits each job?</p>
            <ol className="predict-list">
              <li><span>1</span>A live face filter at 30 fps on a phone</li>
              <li><span>2</span>A poster-quality image — waiting 10 s is fine</li>
              <li><span>3</span>A chatbot that writes emails</li>
            </ol>
          </>}
          answer={
            <ol className="predict-list">
              <li><span>1</span><div><b>GAN</b> — one sharp pass per frame fits the 33 ms budget.</div></li>
              <li><span>2</span><div><b>Diffusion</b> — best quality, and you can afford the steps.</div></li>
              <li><span>3</span><div><b>Transformer</b> — next-token prediction is built for text.</div></li>
            </ol>
          }
        />
      ),
    },
    {
      id: 's1-shine-speed',
      section: 'Where GANs shine',
      kicker: 'Strength 1 & 2',
      title: 'GANs are fast and sharp',
      notes: {
        time: '3 min',
        say: 'One forward pass gives one image — milliseconds. Standard diffusion samplers need tens of denoising steps (often 25–100) — seconds. Distilled models like SDXL Turbo cut that to 1–4 steps, using a GAN-style discriminator to do it. And GAN outputs are crisp, without the VAE blur.',
        ask: 'Why does one pass versus 50 passes matter more on a phone than on a server?',
      },
      render: () => (
        <>
          <Stats items={[
            { value: '1', label: 'forward pass per GAN image — milliseconds', tone: 'mint' },
            { value: '25–100', label: 'denoising steps per standard diffusion image — seconds', tone: 'blue' },
            { value: 'Sharp', label: 'crisp outputs, no VAE-style blur', tone: 'yellow' },
          ]} />
          <Takeaway tone="mint">When latency matters — video, games, interactive tools — the single forward pass is decisive.</Takeaway>
        </>
      ),
    },
    {
      id: 's1-applications',
      section: 'Where GANs shine',
      kicker: 'Strength 3 · applications',
      title: 'GANs power real applications across many fields',
      notes: {
        time: '4 min',
        say: 'Pick two or three to dwell on. Medical: synthetic scans to train doctors and models when real data is scarce or private. Image translation — sketch to photo, satellite to map — is what we build on Day 4.',
        ask: 'Which of these could help a project you are working on?',
      },
      render: () => (
        <Cards cols={4} items={[
          { tag: 'Medical', title: 'Synthetic X-rays, MRIs', body: 'Training data without exposing patients.', tone: 'coral' },
          { tag: 'Augmentation', title: 'More training data', body: 'When you have too little of a rare class.', tone: 'blue' },
          { tag: 'Faces', title: 'Realistic people', body: 'StyleGAN faces of no real person.', tone: 'mint' },
          { tag: 'Editing', title: 'Change attributes', body: 'Hair colour, add a smile, age a face.', tone: 'violet' },
          { tag: 'Translation', title: 'Image → image', body: 'Sketch → photo, satellite → map, day → night.', tone: 'yellow' },
          { tag: 'Super-res', title: 'Low-res → high-res', body: 'Add plausible fine detail.', tone: 'blue' },
          { tag: 'Privacy', title: 'Look-real data', body: 'Synthetic rows with no real individuals.', tone: 'ink' },
          { tag: 'Art', title: 'Textures & patterns', body: 'Generated artwork and design assets.', tone: 'mint' },
        ]} />
      ),
    },
    {
      id: 's1-why-2026',
      section: 'Where GANs shine',
      kicker: 'Why learn GANs in 2026?',
      title: 'Diffusion did not make GANs obsolete — it absorbed their ideas',
      notes: {
        time: '3 min',
        say: 'Three reasons. Foundation: the adversarial idea is everywhere. Still used: real-time systems rely on GANs. Building blocks: generators, discriminators and adversarial loss appear inside modern models — next slide shows exactly where.',
        ask: 'Which matters more to you: using GANs directly, or understanding the ideas inside newer models?',
      },
      render: () => (
        <Cards cols={3} items={[
          { tag: '1 · Foundation', title: 'The adversarial idea', body: 'Learning from a critic that improves alongside you is one of the core ideas in generative modelling.', tone: 'coral' },
          { tag: '2 · Still used', title: 'Fast, real-time generation', body: 'One-pass generation keeps GANs in production for video, super-resolution and speech.', tone: 'mint' },
          { tag: '3 · Building blocks', title: 'Parts inside modern models', body: 'Discriminators, adversarial losses and image translation reappear in hybrid systems.', tone: 'blue' },
        ]} />
      ),
    },
    {
      id: 's1-adversarial-everywhere',
      section: 'Where GANs shine',
      kicker: 'Concrete evidence',
      title: 'Adversarial training hides inside many modern systems',
      notes: {
        time: '3 min',
        say: 'Make it concrete. Stable Diffusion’s image autoencoder (from VQGAN-style training) uses an adversarial loss to keep details sharp. SDXL Turbo uses adversarial diffusion distillation to generate in one to four steps. Text-to-speech often uses GAN vocoders like HiFi-GAN; Real-ESRGAN does super-resolution.',
        ask: 'Why would a diffusion model borrow a discriminator — what problem does it fix?',
      },
      render: () => (
        <>
          <Mapping
            leftLabel="Modern system"
            rightLabel="Where the GAN idea lives"
            rows={[
              ['Stable Diffusion autoencoder', 'Adversarial (VQGAN-style) loss keeps decoded images sharp'],
              ['SDXL Turbo', 'Adversarial diffusion distillation → 1–4 steps instead of ~50'],
              ['Text-to-speech (e.g. HiFi-GAN)', 'GAN vocoder turns spectrograms into audio in real time'],
              ['Real-ESRGAN', 'GAN-based super-resolution for photos and video'],
            ]}
          />
          <Takeaway>Learn GANs well and you understand a key ingredient of modern generative AI — not all of it, but a part that keeps coming back.</Takeaway>
        </>
      ),
    },
    {
      id: 's1-roadmap',
      section: 'The road ahead',
      kicker: 'This training',
      title: 'Four days: understand, scale, stabilise, evaluate and translate',
      notes: {
        time: '2 min',
        say: 'Today is understanding, your first GAN, and GANs that draw digits. Each later day adds one capability on top of the same engine: better loss and control, then evaluation and StyleGAN, then image translation.',
        ask: 'Which day’s topic sounds most useful for your own work?',
      },
      render: () => (
        <Steps items={[
          { title: 'Day 1 · From the idea to image GANs', body: 'Today — the idea, the parts, a GAN that learns 7, then MNIST, convolutions, DCGAN and debugging.', tone: 'mint' },
          { title: 'Day 2 · Better loss, stable training, control', body: 'Why BCE fails, WGAN, WGAN-GP, conditional GANs, controllable generation.', tone: 'blue' },
          { title: 'Day 3 · Evaluate and scale', body: 'Inception Score and FID, bias and fairness, StyleGAN.', tone: 'violet' },
          { title: 'Day 4 · Image translation', body: 'Pix2Pix, augmentation and privacy, CycleGAN, satellite → map capstone.', tone: 'coral' },
        ]} />
      ),
    },
    {
      id: 's1-family-tree',
      section: 'The road ahead',
      kicker: 'The GAN family tree',
      title: 'Seven years of GANs, each solving the last one’s problem',
      notes: {
        time: '3 min',
        say: 'Ian Goodfellow’s 2014 paper started it. Each later model fixed a specific weakness. Years are first-publication (arXiv) years. Note StyleGAN3 — the alias-free GAN — is 2021. After that, GAN ideas merge into diffusion and hybrid models.',
        ask: 'Which of these names have you already heard?',
      },
      render: () => (
        <div className="s1-tree">
          <Timeline items={[
            { when: '2014', title: 'GAN', body: 'The original adversarial idea — Goodfellow et al.', tone: 'coral' },
            { when: '2015', title: 'DCGAN', body: 'Add convolutions → sharp images.', tone: 'mint' },
            { when: '2016', title: 'Pix2Pix', body: 'Paired image-to-image translation.', tone: 'blue' },
            { when: '2017', title: 'WGAN · CycleGAN', body: 'A better loss · unpaired translation.', tone: 'violet' },
          ]} />
          <Timeline items={[
            { when: '2018', title: 'StyleGAN', body: 'Photorealistic, style-controlled faces.', tone: 'mint' },
            { when: '2019', title: 'StyleGAN2', body: 'Fixes artefacts — even better faces.', tone: 'mint' },
            { when: '2021', title: 'StyleGAN3', body: 'Alias-free generation for smooth motion.', tone: 'mint' },
            { when: '2021+', title: 'Merge', body: 'GAN ideas flow into diffusion and hybrid models.', tone: 'yellow' },
          ]} />
        </div>
      ),
    },
    {
      id: 's1-each-solved',
      section: 'The road ahead',
      kicker: 'Problem → fix',
      title: 'Every variant is the basic GAN plus one fix',
      notes: {
        time: '2 min',
        say: 'Read each row as: here was the pain, here is the fix. We build the important ones over the four days — DCGAN today, WGAN and conditional GANs on Day 2, StyleGAN on Day 3, Pix2Pix and CycleGAN on Day 4.',
        ask: 'Which problem would you hit first if you trained a GAN on images today?',
      },
      render: () => (
        <Mapping
          leftLabel="Problem"
          rightLabel="Fix"
          rows={[
            ['Fully connected GANs give blurry, unstable images', 'DCGAN — convolutions + BatchNorm (today)'],
            ['BCE loss gives weak, unstable gradients', 'WGAN / WGAN-GP — a better distance (Day 2)'],
            ['No control over what gets generated', 'Conditional GAN — add a label (Day 2)'],
            ['Need to turn one image into another', 'Pix2Pix (paired) · CycleGAN (unpaired) (Day 4)'],
            ['Faces need realism and style control', 'StyleGAN — style-based generator (Day 3)'],
          ]}
        />
      ),
    },
    {
      id: 's1-recap',
      section: 'Check',
      kicker: 'Session 1 recap',
      title: 'Five ideas to carry into Session 2',
      notes: {
        time: '2 min',
        say: 'Rebuild the session from these five lines. If any feels shaky, ask now — Session 2 assumes them.',
        ask: 'Explain in one sentence why a GAN is faster than diffusion at generation time.',
      },
      render: () => (
        <Recap items={[
          <>Generative AI <b>creates new content</b>; normal AI judges existing content.</>,
          <>All approaches <b>learn patterns</b> from real data, then sample new data that follows them.</>,
          <>VAE: compress & rebuild (blurry) · GAN: compete (sharp, tricky) · Transformer: next token · Diffusion: denoise (best, slow).</>,
          <>GANs shine when you need <b>one-pass speed</b> and sharp detail.</>,
          <>GAN ideas — discriminators, adversarial loss — <b>live on</b> inside modern models.</>,
        ]} />
      ),
    },
    {
      id: 's1-check',
      section: 'Check',
      kicker: 'Knowledge check',
      title: 'Can you reason about the landscape without notes?',
      reveal: true,
      notes: {
        time: '5 min',
        say: 'Give two minutes of silent thinking, then take answers before revealing. Push for the why, not just the name.',
        ask: 'Which answer would you most like to argue with?',
      },
      render: ({ revealed }) => (
        <Quiz revealed={revealed} items={[
          { q: 'One model labels X-rays “tumour / no tumour”; another makes new X-rays. Which is generative — and what is the test?', a: 'The second. Test: new content out, or a judgement about the input?' },
          { q: 'VAEs and GANs both decode a small random code into an image. Why is the VAE result blurrier?', a: 'The VAE’s pixel loss averages over uncertainty → blur. A GAN’s discriminator punishes blur as unreal.' },
          { q: 'Diffusion beats GANs on quality. Why hasn’t everyone switched?', a: 'Speed: one pass vs tens of passes — decisive in real time. And GAN ideas live inside diffusion anyway.' },
          { q: 'Name the four approaches with the core move of each.', a: 'VAE: compress → rebuild · GAN: G vs D · Transformer: next token · Diffusion: denoise step by step.' },
          { q: 'Give three real applications where a GAN’s strengths matter.', a: 'E.g. synthetic medical images, data augmentation, super-resolution (or faces, editing, translation).' },
          { q: 'One network pass takes 20 ms. Can a 50-step diffusion model run a 30 fps live filter? Can a GAN?', a: 'Diffusion: 50 × 20 ms = 1 s per frame ≈ 1 fps — no. GAN: 20 ms < 33 ms budget — yes.' },
        ]} />
      ),
    },
    {
      id: 's1-bridge',
      section: 'Check',
      kicker: 'Next session',
      title: 'How can two networks teach each other just by competing?',
      layout: 'bridge',
      notes: {
        time: '1 min',
        say: 'We have seen GANs from the outside. Next session opens the box: the forger, the detective, and the training loop that makes them improve.',
        ask: 'If the Generator never sees a real image, how could it possibly learn what one looks like?',
      },
      render: () => <Bridge done="Session 1 · complete" question="How can two networks teach each other just by competing?" next="S2 · What Is a GAN?" />,
    },
  ],
};

