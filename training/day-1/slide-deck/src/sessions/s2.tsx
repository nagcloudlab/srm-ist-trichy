import './s2.css';
import { Bridge, Cards, Code, Divider, Equation, Flow, FormulaSteps, FormulaTerms, Mapping, Output, Predict, Quiz, Quote, Recap, Split, Stats, Steps, T, Table, Takeaway, Timeline, Versus, Answer } from '../components/kit';
import { PixelDigit, Player } from '../components/art';
import { BceLab, OppositeGoalsLab } from '../labs/S2Labs';
import type { Part } from '../types';

const op = (s: string) => <span className="op">{s}</span>;

function DataFlowDiagram({ trainingOnly }: { trainingOnly?: boolean }) {
  return (
    <figure className="s2-diagram">
      <svg viewBox="0 0 960 380" role="img" aria-label="Noise goes into the Generator which makes a fake; the Discriminator sees fake and real images and outputs real or fake; gradients flow back to both networks">
        <defs>
          <marker id="s2-arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#374151" /></marker>
          <marker id="s2-arr-c" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#c8432f" /></marker>
        </defs>
        {/* boxes */}
        <rect x="10" y="70" width="130" height="80" rx="14" fill="#e8edff" stroke="#3157d5" strokeWidth="2.5" />
        <text x="75" y="104" textAnchor="middle" fontSize="15" fontWeight="750" fill="#3157d5" letterSpacing="2">NOISE z</text>
        <text x="75" y="128" textAnchor="middle" fontSize="14" fill="#374151">random numbers</text>

        <rect x="180" y="70" width="150" height="80" rx="14" fill="#dff5ea" stroke="#277a59" strokeWidth="3" />
        <text x="255" y="108" textAnchor="middle" fontSize="26" fontWeight="800" fill="#277a59">G</text>
        <text x="255" y="132" textAnchor="middle" fontSize="14" fill="#374151">Generator</text>

        <rect x="375" y="70" width="140" height="80" rx="14" fill="#fffdf8" stroke="#277a59" strokeWidth="2.5" strokeDasharray="6 4" />
        <text x="445" y="104" textAnchor="middle" fontSize="15" fontWeight="750" fill="#277a59" letterSpacing="2">FAKE</text>
        <text x="445" y="128" textAnchor="middle" fontSize="14" fill="#374151">G(z)</text>

        <rect x="375" y="270" width="140" height="80" rx="14" fill="#e8edff" stroke="#3157d5" strokeWidth="2.5" />
        <text x="445" y="304" textAnchor="middle" fontSize="15" fontWeight="750" fill="#3157d5" letterSpacing="2">REAL</text>
        <text x="445" y="328" textAnchor="middle" fontSize="14" fill="#374151">training data x</text>

        <rect x="575" y="170" width="150" height="100" rx="14" fill="#fde9e5" stroke="#c8432f" strokeWidth="3" />
        <text x="650" y="215" textAnchor="middle" fontSize="26" fontWeight="800" fill="#c8432f">D</text>
        <text x="650" y="240" textAnchor="middle" fontSize="14" fill="#374151">Discriminator</text>

        <rect x="775" y="185" width="175" height="70" rx="35" fill="#fbefc9" stroke="#8a6500" strokeWidth="2" />
        <text x="862" y="216" textAnchor="middle" fontSize="16" fontWeight="750" fill="#111827">real or fake?</text>
        <text x="862" y="238" textAnchor="middle" fontSize="13" fill="#374151">a probability 0 → 1</text>

        {/* forward arrows */}
        <path className="s2-flowline" d="M140,110 L176,110" stroke="#374151" strokeWidth="2.5" fill="none" markerEnd="url(#s2-arr)" />
        <path className="s2-flowline" d="M330,110 L371,110" stroke="#374151" strokeWidth="2.5" fill="none" markerEnd="url(#s2-arr)" />
        <path className="s2-flowline" d="M515,110 C550,110 545,195 571,200" stroke="#374151" strokeWidth="2.5" fill="none" markerEnd="url(#s2-arr)" />
        <path className="s2-flowline" d="M515,310 C550,310 545,245 571,240" stroke="#374151" strokeWidth="2.5" fill="none" markerEnd="url(#s2-arr)" />
        <path className="s2-flowline" d="M725,220 L771,220" stroke="#374151" strokeWidth="2.5" fill="none" markerEnd="url(#s2-arr)" />

        {/* feedback */}
        {!trainingOnly && <>
          <path d="M650,166 C650,45 255,45 255,66" stroke="#c8432f" strokeWidth="2.5" fill="none" strokeDasharray="7 6" markerEnd="url(#s2-arr-c)" />
          <text x="452" y="26" textAnchor="middle" fontSize="14" fontWeight="700" fill="#c8432f">feedback to G: gradients through D</text>
          <path d="M700,274 C720,330 600,330 620,276" stroke="#c8432f" strokeWidth="2.5" fill="none" strokeDasharray="7 6" markerEnd="url(#s2-arr-c)" />
          <text x="660" y="352" textAnchor="middle" fontSize="14" fontWeight="700" fill="#c8432f">D learns from its mistakes</text>
        </>}
      </svg>
    </figure>
  );
}

export const s2Part: Part = {
  id: 's2',
  code: 'S2',
  label: 'The GAN idea',
  title: 'What Is a GAN?',
  when: 'Morning 2',
  minutes: 90,
  slides: [
    /* ---------------- Idea ---------------- */
    {
      id: 's2-divider',
      section: 'The idea',
      kicker: 'Session 2',
      title: 'What Is a GAN?',
      layout: 'divider',
      notes: { time: '1 min', say: 'Session 1 told us where GANs fit. Now we open the box: two networks, one game.', ask: 'From Session 1: what was the one-line idea behind GANs?' },
      render: () => (
        <Divider code="S2" title="What Is a GAN?" promise="The forger-versus-detective story, turned into a training loop you could write from memory."
          items={['The one idea', 'The two players', 'Noise and data flow', 'The training loop', 'The loss', 'The code', 'The big picture']} />
      ),
    },
    {
      id: 's2-one-sentence',
      section: 'The idea',
      kicker: 'The one-sentence version',
      title: 'Everything else is details',
      notes: { time: '2 min', say: 'Read the sentence slowly. Every slide that follows unpacks one phrase of it.', ask: 'Which word in this sentence is doing the most work?' },
      render: () => (
        <>
          <Quote by="The whole idea of a Generative Adversarial Network">Two neural networks compete against each other — one <T tone="mint">creates fakes</T>, the other <T tone="coral">detects them</T> — and both get better through the competition.</Quote>
          <Takeaway><span>Generative = it creates. Adversarial = by competing. Network = both players are neural networks.</span></Takeaway>
        </>
      ),
    },
    {
      id: 's2-predict-blind',
      section: 'The idea',
      kicker: 'Predict',
      title: 'Can a forger who never sees a real painting still learn to forge?',
      reveal: true,
      notes: { time: '2 min', say: 'Let people commit. Most say no. The surprise is the heart of GANs.', ask: 'Hands up: yes or no? What would the forger need instead?' },
      render: ({ revealed }) => (
        <Predict revealed={revealed}
          facts={['Locked in a room', 'Never sees a single real painting', <>Only hears the detective: <b>“fake”</b> — and how strongly</>]}
          answer={<Answer verdict="Yes." points={['The detective has seen the real paintings', <>Its judgement says <b>which way</b> to change the fake</>, <>In a GAN, that judgement arrives as <b>gradients flowing back through D</b></>]} />} />
      ),
    },
    {
      id: 's2-story-rounds',
      section: 'The idea',
      kicker: 'The story · forger vs detective',
      title: 'Each round, both players get sharper',
      notes: { time: '3 min', say: 'Walk left to right. The forger improves because the detective keeps catching it; the detective must get sharper because the fakes keep improving. The D numbers are illustrative.', ask: 'Why does the detective end up at 0.5 rather than 0 or 1?' },
      render: () => (
        <>
          <div className="s2-rounds">
            {[
              { r: 'ROUND 1', g: 'Random scribbles', d: '0.02', v: '“Obviously fake.”', p: { noise: 0.85, seed: 5 } },
              { r: 'ROUND 10', g: 'Right shape, blurry', d: '0.15', v: '“Brushwork is wrong.”', p: { blur: 1, noise: 0.25, seed: 5 } },
              { r: 'ROUND 100', g: 'Close, a bit wobbly', d: '0.38', v: '“Fake… I think?”', p: { wobble: 0.09, blur: 0.3, seed: 6 } },
              { r: 'ROUND 1000', g: 'Nearly perfect', d: '0.50', v: '“I literally cannot tell.”', p: { wobble: 0.02, seed: 4 } },
            ].map((x) => (
              <div className="s2-round" key={x.r}>
                <small>{x.r}</small>
                <PixelDigit digit="7" px={136} {...x.p} label={`Forger's attempt in ${x.r.toLowerCase()}`} />
                <span className="s2-round-g">G: {x.g}</span>
                <span className="s2-round-d"><b>D = {x.d}</b>{x.v}</span>
              </div>
            ))}
          </div>
          <Takeaway><span>Both improved <b>because of each other</b> — the competition is the teacher.</span></Takeaway>
        </>
      ),
    },

    /* ---------------- Players ---------------- */
    {
      id: 's2-players',
      section: 'The players',
      kicker: 'The two players',
      title: 'A forger that creates, a detective that judges',
      notes: { time: '2 min', say: 'Introduce the two players you will see all day: mint G and coral D. The colours stay fixed for the whole course — mint is always the Generator, coral always the Discriminator.', ask: 'Which of the two is just an ordinary classifier?' },
      render: () => (
        <Versus
          left={{ icon: <Player who="G" size={110} label={false} />, tag: 'Generator · G · the forger', title: 'Turns random noise into a fake', body: 'Goal: make the detective say “real”.', tone: 'mint' }}
          right={{ icon: <Player who="D" size={110} label={false} />, tag: 'Discriminator · D · the detective', title: 'Looks at one image, says real or fake', body: 'Goal: catch every fake, accept every real.', tone: 'coral' }}
          mid="vs"
        />
      ),
    },
    {
      id: 's2-players-table',
      section: 'The players',
      kicker: 'Side by side',
      title: 'Same kind of building block, opposite jobs',
      notes: { time: '2 min', say: 'Read row by row. Stress the Input row: G never receives an image — only noise.', ask: 'What does the Discriminator output — a picture or a number?' },
      render: () => (
        <Table
          headers={['', 'Forger', 'Detective']}
          rows={[
            ['GAN name', <T tone="mint">Generator (G)</T>, <T tone="coral">Discriminator (D)</T>],
            ['Input', 'Random noise z', 'An image (real or fake)'],
            ['Output', 'A fake image G(z)', 'One number: P(real), from 0 to 1'],
            ['Goal', 'Fool the detective', 'Catch the fakes'],
            ['Built with', 'Neural network', 'Neural network (a classifier)'],
          ]}
          highlight={[1]}
        />
      ),
    },

    /* ---------------- Noise & data flow ---------------- */
    {
      id: 's2-noise',
      section: 'Noise & data flow',
      kicker: 'What is random noise?',
      title: 'Noise is just a list of random numbers — no meaning at all',
      notes: { time: '2 min', say: 'torch.randn draws numbers from a normal distribution: mostly between −2 and 2, centred on 0. Your printed numbers will differ — that is the point.', ask: 'If you run this twice, do you get the same numbers?' },
      render: () => (
        <Split ratio="1.1fr 1fr"
          left={<Code title="noise.py" code={`import torch

noise = torch.randn(1, 5)    # 5 random numbers
print(noise)`} marks={{ 3: 'blue' }} />}
          right={<>
            <Output title="EXAMPLE OUTPUT · yours will differ">{`tensor([[-0.42,  1.31, -0.87,  0.15,  2.01]])`}</Output>
            <Takeaway tone="blue"><span>Shape <b>(1, 5)</b> = one sample of five numbers. Image GANs use more: 64 in today’s MNIST lab, 100 in DCGAN.</span></Takeaway>
          </>}
        />
      ),
    },
    {
      id: 's2-noise-trigger',
      section: 'Noise & data flow',
      kicker: 'Noise is a trigger',
      title: 'Different noise in, a different creation out',
      notes: { time: '2 min', say: 'The Generator decides what to make; the noise only picks which variation. Without noise, G would make the same image every time. The digits here are illustrative.', ask: 'What would happen if we fed G the same noise vector every time?' },
      render: () => (
        <>
          <div className="s2-noise-rows">
            {[
              { v: '[-0.42, 1.31, -0.87, 0.15, 2.01, …]', d: '3', s: 2 },
              { v: '[ 0.93, -1.12, 0.06, 1.74, -0.51, …]', d: '7', s: 4 },
              { v: '[ 1.58, 0.22, -2.04, -0.33, 0.87, …]', d: '4', s: 9 },
            ].map((r) => (
              <div className="s2-noise-row" key={r.v}>
                <span className="s2-vec">z = {r.v}</span>
                <span className="s2-arrow">→</span>
                <span className="s2-g">G</span>
                <span className="s2-arrow">→</span>
                <PixelDigit digit={r.d} seed={r.s} wobble={0.03} px={74} label={`Generated digit ${r.d}`} />
              </div>
            ))}
          </div>
          <Takeaway tone="blue"><span>Noise gives <b>variety</b>. The Generator gives <b>meaning</b>.</span></Takeaway>
        </>
      ),
    },
    {
      id: 's2-dataflow',
      section: 'Noise & data flow',
      kicker: 'How it works · the data flow',
      title: 'Fakes and reals meet at the detective',
      notes: { time: '3 min', say: 'Trace with your hand: noise into G, fake into D. Real images also into D. D outputs one probability. The dashed coral arrows are learning signals — D learns from its mistakes, G learns through D.', ask: 'Which box is the only one that ever touches real data?' },
      render: () => <DataFlowDiagram />,
    },
    {
      id: 's2-dataflow-steps',
      section: 'Noise & data flow',
      kicker: 'Read the diagram',
      title: 'Four moves make one round',
      notes: { time: '2 min', say: 'Turn the diagram into words. Step 4 is where the two training steps of the next section come from.', ask: 'In step 2, does D know which images are fake?' },
      render: () => (
        <Steps items={[
          { title: 'G turns random noise into a fake image', tone: 'mint' },
          { title: 'D is shown both real and fake images, mixed', body: 'During training we know which is which — D does not.', tone: 'blue' },
          { title: 'D outputs a probability: real or fake?', tone: 'coral' },
          { title: 'Both networks learn from the result', body: 'D to judge better, G to fool better — in two separate steps.', tone: 'yellow' },
        ]} />
      ),
    },

    /* ---------------- Training loop ---------------- */
    {
      id: 's2-step-a',
      section: 'Training loop',
      kicker: 'Step A · train the Discriminator',
      title: 'First, teach D: real → 1, fake → 0',
      notes: { time: '3 min', say: 'D is just a classifier with two kinds of labelled example. G is frozen here — it only supplies fakes.', ask: 'What label do we give the fake image when training D?' },
      render: () => (
        <div className="s2-phase">
          <div className="stack gap-md">
            <Flow size="sm" nodes={[{ label: 'real', value: 'image', tone: 'blue' }, { op: '→' }, { label: 'D', value: 'D(x)', tone: 'coral' }, { op: '→' }, { label: 'target', value: '1', tone: 'mint' }]} />
            <Flow size="sm" nodes={[{ label: 'fake', value: 'G(z)', tone: 'mint' }, { op: '→' }, { label: 'D', value: 'D(G(z))', tone: 'coral' }, { op: '→' }, { label: 'target', value: '0', tone: 'coral' }]} />
            <Takeaway tone="coral"><span>Update <b>only D's weights</b> to get better at this.</span></Takeaway>
          </div>
          <div className="s2-chars">
            <div className="s2-frozen"><Player who="G" size={130} /></div>
            <div style={{ position: 'relative' }}><span className="s2-tag">LEARNING</span><Player who="D" size={160} mood="happy" /></div>
          </div>
        </div>
      ),
    },
    {
      id: 's2-step-b',
      section: 'Training loop',
      kicker: 'Step B · train the Generator',
      title: 'Then teach G: make D say 1 for your fake',
      notes: { time: '3 min', say: 'Now D is the frozen one: it judges, but its weights do not change in this step. G is scored on how real D thinks its fake is.', ask: 'Which label does G want D to give its fake?' },
      render: () => (
        <div className="s2-phase">
          <div className="s2-chars">
            <div style={{ position: 'relative' }}><span className="s2-tag">LEARNING</span><Player who="G" size={160} mood="happy" /></div>
            <div className="s2-frozen"><Player who="D" size={130} /></div>
          </div>
          <div className="stack gap-md">
            <Flow size="sm" nodes={[{ label: 'noise', value: 'z', tone: 'blue' }, { op: '→' }, { label: 'G', value: 'fake', tone: 'mint' }, { op: '→' }, { label: 'D', value: 'D(G(z))', tone: 'coral' }, { op: '→' }, { label: 'G wants', value: '1', tone: 'mint' }]} />
            <Takeaway tone="mint"><span>Update <b>only G's weights</b> to fool D better.</span></Takeaway>
          </div>
        </div>
      ),
    },
    {
      id: 's2-repeat',
      section: 'Training loop',
      kicker: 'Repeat',
      title: 'Alternate A and B thousands of times',
      notes: { time: '1 min', say: 'One iteration = Step A then Step B. Repeat. That loop is the whole training algorithm.', ask: 'Why alternate instead of training D to perfection first?' },
      render: () => (
        <>
          <Flow size="lg" nodes={[{ label: 'Step A', value: 'train D', tone: 'coral' }, { op: '→' }, { label: 'Step B', value: 'train G', tone: 'mint' }, { op: '↻' }, { label: '× thousands', value: 'repeat', tone: 'yellow' }]} caption="Both improve. The fakes get more realistic." />
          <Takeaway><span>Alternating keeps the two players close in strength: a detective that is far too good gives the forger nothing useful to learn from.</span></Takeaway>
        </>
      ),
    },
    {
      id: 's2-opposite',
      section: 'Training loop',
      kicker: 'Why this works · opposite goals',
      title: 'They disagree about one thing: the fakes',
      notes: { time: '2 min', say: 'Point to the fake-images row. That disagreement is the tension that drives learning. G does not care about real images at all.', ask: 'Why does G not care what D says about real images?' },
      render: () => (
        <>
          <Table
            headers={['', 'D wants', 'G wants']}
            rows={[
              ['For real images', 'D(real) = 1', '(doesn’t care)'],
              ['For fake images', <T tone="coral">D(fake) = 0</T>, <T tone="mint">D(fake) = 1</T>],
            ]}
            highlight={[1]}
          />
          <Takeaway><span>Same number, opposite wishes. That tension is the <b>adversarial</b> in GAN.</span></Takeaway>
        </>
      ),
    },
    {
      id: 's2-equilibrium',
      section: 'Training loop',
      kicker: 'The end goal',
      title: 'G wins when D can only guess: 0.5 for everything',
      notes: { time: '2 min', say: 'At the ideal end point the fakes follow the same distribution as the real data, so the best D can do is say 0.5 — a coin flip. In practice training wobbles around this point rather than sitting exactly on it.', ask: 'If D outputs 0.5 for everything, is D broken?' },
      render: () => (
        <>
          <Stats items={[
            { value: 'D(real) ≈ 0.5', label: 'Not sure this real image is real', tone: 'blue' },
            { value: 'D(fake) ≈ 0.5', label: 'Not sure this fake is fake', tone: 'mint' },
            { value: '= coin flip', label: '“I have no idea” — the fakes match the real data', tone: 'yellow' },
          ]} />
          <Takeaway><span>D isn't broken at 0.5 — there is simply nothing left to tell apart.</span></Takeaway>
        </>
      ),
    },
    {
      id: 's2-patterns',
      section: 'Training loop',
      kicker: 'What does G actually learn?',
      title: 'G learns the patterns, not the pictures',
      notes: { time: '2 min', say: 'G cannot copy what it never saw. It learns what real digits have in common — and creates new ones. That is why GANs are useful for new data, not just retrieval.', ask: 'Name one pattern every real handwritten digit shares.' },
      render: () => (
        <Split ratio="1fr 1fr"
          left={<Cards cols={1} items={[{ tag: 'Real digits look like', title: 'Shared patterns', tone: 'blue', body: <ul><li>White strokes on a black background</li><li>Smooth curves and straight lines</li><li>Similar stroke thickness</li><li>Centred in the image</li></ul> }]} />}
          right={<div>
            <div className="s2-patterns">
              {[1, 2, 3, 4, 5].map((s) => <PixelDigit key={s} digit="7" seed={s + 20} wobble={0.08} px={84} label="A new generated seven" />)}
            </div>
            <p className="s2-caption">Five new 7s — each follows the patterns, none is a copy.</p>
          </div>}
        />
      ),
    },
    {
      id: 's2-after',
      section: 'Training loop',
      kicker: 'After training',
      title: "The detective's job is done — throw it away",
      notes: { time: '2 min', say: 'D was a training tool. Deployment needs only G plus fresh noise. That is why GAN generation is fast: one forward pass through one network.', ask: 'Why do we still need noise after training?' },
      render: () => (
        <>
          <div className="stack gap-sm">
            <div className="s2-lane"><small>During training · both needed</small><span className="s2-chip tone-blue">noise</span>→<span className="s2-chip tone-mint">Generator</span>→<span className="s2-chip tone-coral">Discriminator</span></div>
            <div className="s2-lane"><small>After training · D not needed</small><span className="s2-chip tone-blue">noise</span>→<span className="s2-chip tone-mint">Generator</span>→<span className="s2-chip tone-yellow">new image!</span><span className="s2-chip tone-coral s2-gone">Discriminator</span></div>
          </div>
          <Split ratio="1.2fr 1fr"
            left={<Code title="generate.py · after training" code={`noise = torch.randn(1, 100)
new_image = generator(noise)    # no discriminator`} marks={{ 2: 'mint' }} />}
            right={<Takeaway><span>One forward pass through one network = one image. That is why GANs are <b>fast</b>.</span></Takeaway>}
          />
        </>
      ),
    },

    /* ---------------- Loss ---------------- */
    {
      id: 's2-bce',
      section: 'The loss',
      kicker: 'The loss function',
      title: 'Both players are scored with Binary Cross-Entropy',
      notes: { time: '3 min', say: 'BCE is the classification loss. Walk the rows: p and y are the inputs. The label works as a switch — y = 1 turns on the real term, y = 0 turns on the fake term. The minus sign only makes the number positive.', ask: 'When y = 1, which half of the formula disappears?' },
      render: () => (
        <FormulaTerms
          reading="loss = minus [ label × log(prediction) + (1 − label) × log(1 − prediction) ]"
          formula={<><span>BCE</span>{op('=')}<span>−[</span><T tone="blue">y</T><span>· log</span><T tone="coral">p</T>{op('+')}<span>(1 −</span><T tone="blue">y</T><span>) · log(1 −</span><T tone="coral">p</T><span>) ]</span></>}
          terms={[
            { symbol: 'p', name: 'Prediction', meaning: "D's probability that the input is real", range: '0 … 1', tone: 'coral' },
            { symbol: 'y', name: 'Label', meaning: '1 = real image · 0 = fake image', range: '0 or 1', tone: 'blue' },
            { symbol: 'y·log p', name: 'Real term', meaning: 'On only when y = 1 · near 0 when p → 1', range: '−∞ … 0', tone: 'mint' },
            { symbol: '(1−y)·log(1−p)', name: 'Fake term', meaning: 'On only when y = 0 · near 0 when p → 0', range: '−∞ … 0', tone: 'violet' },
            { symbol: '−[ ]', name: 'Flip the sign', meaning: 'Logs of probabilities are ≤ 0 · the minus makes loss ≥ 0', range: '0 … ∞', tone: 'yellow' },
          ]}
        />
      ),
    },
    {
      id: 's2-bce-steps',
      section: 'The loss',
      kicker: 'BCE · worked',
      title: 'With y = 1 the fake term switches off: p = 0.9 costs 0.105',
      notes: { time: '2 min', say: 'Substitute slowly. The (1 − y) factor becomes 0, so the whole fake term disappears. What is left is −log p.', ask: 'Redo it with y = 0 and p = 0.9. Which term survives, and what is the loss?' },
      render: () => (
        <FormulaSteps
          given={['p = 0.9 · D says “real”', 'y = 1 · it is real']}
          steps={[
            { math: <>−[ 1 · log 0.9 + (1 − 1) · log 0.1 ]</>, note: 'substitute p and y' },
            { math: <>−[ log 0.9 + 0 ]</>, note: '(1 − y) = 0 switches the fake term off' },
            { math: <>−(−0.105)</>, note: 'log 0.9 = −0.105' },
          ]}
          result={<>BCE = 0.105 · small: D was right</>}
        />
      ),
    },
    {
      id: 's2-bce-worked',
      section: 'The loss',
      kicker: 'Worked example',
      title: 'Confident and wrong costs far more than confident and right',
      notes: { time: '2 min', say: 'Same image, y = 1. A good D says 0.9 and pays 0.105. A bad D says 0.1 and pays 2.303 — twenty times more.', ask: 'What would the loss be if D said exactly 0.5?' },
      render: () => (
        <>
        <Split
          left={<Flow size="lg" caption="Confident and right" nodes={[{ label: 'real · y = 1', value: 'p = 0.9', tone: 'blue' }, { op: '→' }, { label: '−log(0.9)', value: '0.105', tone: 'mint', note: 'small penalty' }]} />}
          right={<Flow size="lg" caption="Confident and wrong" nodes={[{ label: 'real · y = 1', value: 'p = 0.1', tone: 'blue' }, { op: '→' }, { label: '−log(0.1)', value: '2.303', tone: 'coral', note: '≈ 22× bigger' }]} />}
        />
          <Takeaway><span>A shrug — p = 0.5 — costs −log(0.5) = <b>0.693</b>. Remember that number: it returns in Session 4.</span></Takeaway>
        </>
      ),
    },
    {
      id: 's2-bce-lab',
      section: 'The loss',
      kicker: 'Try it · BCE explorer',
      title: 'Drag the prediction and watch the penalty explode near the wrong end',
      lab: true,
      notes: { time: '4 min', say: 'Set y = 1 and drag p toward 0. Then flip y to 0 and repeat. Compare with MSE, which never goes above 1.', ask: 'Why do we want a loss that punishes confident mistakes this hard?' },
      render: () => <BceLab />,
    },
    {
      id: 's2-d-loss',
      section: 'The loss',
      kicker: "The Discriminator's loss",
      title: "D's loss: be right about reals and right about fakes",
      notes: { time: '2 min', say: 'Two BCE terms added: real images with target 1, fakes with target 0. Minimising this makes D(x) → 1 and D(G(z)) → 0.', ask: 'Which term punishes D for being fooled?' },
      render: () => (
        <>
          <Equation size="md" reading="Real images should score 1; fakes should score 0.">
            <span>L<sub>D</sub></span> {op('=')} <span>−[ log <T tone="coral">D</T>(<T tone="blue">x</T>)</span> {op('+')} <span>log(1 − <T tone="coral">D</T>(<T tone="mint">G(z)</T>)) ]</span>
          </Equation>
          <Cards cols={2} items={[
            { tag: 'Term 1 · real images', title: <>−log D(x): small when D(x) → 1</>, body: 'Punishes D for doubting a real image.', tone: 'blue' },
            { tag: 'Term 2 · fake images', title: <>−log(1 − D(G(z))): small when D(G(z)) → 0</>, body: 'Punishes D for being fooled by a fake.', tone: 'coral' },
          ]} />
          <Code title="in code" code={`D_loss = BCE(D(real), 1) + BCE(D(fake), 0)`} marks={{ 1: 'coral' }} />
        </>
      ),
    },
    {
      id: 's2-d-loss-steps',
      section: 'The loss',
      kicker: "D's loss · worked",
      title: 'A decent D still pays 0.33 for one real and one fake',
      notes: { time: '2 min', say: 'One real image scored 0.9, one fake scored 0.2. Each term is a BCE: the real one with target 1, the fake one with target 0. Add them.', ask: 'What would D have to output to make this loss exactly 0?' },
      render: () => (
        <FormulaSteps
          given={['D(x) = 0.9 · real image', 'D(G(z)) = 0.2 · fake image']}
          steps={[
            { math: <>−[ log 0.9 + log(1 − 0.2) ]</>, note: 'substitute both scores' },
            { math: <>−[ log 0.9 + log 0.8 ]</>, note: 'the fake should score low · 1 − 0.2 = 0.8' },
            { math: <>−[ (−0.105) + (−0.223) ]</>, note: 'real term + fake term' },
          ]}
          result={<>L<sub>D</sub> ≈ 0.33 · → 0 only if D(x) = 1 and D(G(z)) = 0</>}
        />
      ),
    },
    {
      id: 's2-g-loss',
      section: 'The loss',
      kicker: "The Generator's loss · two versions",
      title: 'In practice G minimises −log D(G(z)), not the textbook minimax term',
      notes: { time: '4 min', say: 'Be honest here. The 2014 paper writes the game with G minimising log(1 − D(G(z))). But early on D easily rejects fakes, D(G(z)) ≈ 0, and that curve is flat — G gets almost no gradient. The same paper suggests the non-saturating version, −log D(G(z)). That is exactly BCE(D(fake), 1), which is what everyone codes.', ask: 'Both versions want D(G(z)) to go up. Why does it matter which one we use?' },
      render: () => (
        <>
          <Versus mid="vs"
            left={{ tag: 'Non-saturating · what we train', title: <>L<sub>G</sub> = −log D(G(z))</>, tone: 'mint', body: <ul><li>In code: <code>BCE(D(fake), 1)</code> — “G wants D to say 1”</li><li>Steep when D(G(z)) ≈ 0 → strong signal early on</li></ul> }}
            right={{ tag: 'Minimax · the textbook game', title: <>G minimises log(1 − D(G(z)))</>, tone: 'coral', body: <ul><li>Same goal: push D(G(z)) up</li><li>Flat when D(G(z)) ≈ 0 → G barely learns at the start</li></ul> }} />
          <Takeaway><span>Both appear in Goodfellow et al. (2014). The paper itself recommends the non-saturating version for training G.</span></Takeaway>
        </>
      ),
    },
    {
      id: 's2-g-loss-steps',
      section: 'The loss',
      kicker: "G's loss · worked",
      title: 'When D rejects a fake, the non-saturating loss pushes G 99× harder',
      notes: { time: '3 min', say: 'Early in training D easily spots fakes: D(G(z)) ≈ 0.01. Write the fake score as p = σ(a), where a is D’s raw score. The push G receives is the slope with respect to a. Non-saturating: p − 1 = −0.99. Minimax: −p = −0.01. Same goal, 99 times the signal.', ask: 'At D(G(z)) = 0.5, how do the two pushes compare?' },
      render: () => (
        <FormulaSteps
          given={['D(G(z)) = p = 0.01', 'D is sure it is fake', 'p = σ(a) · a = raw score']}
          steps={[
            { math: <>−log 0.01 = 4.61</>, note: 'non-saturating loss · large: G knows it is bad' },
            { math: <>slope = p − 1 = −0.99</>, note: 'strong push on a' },
            { math: <>log(1 − 0.01) = −0.01</>, note: 'minimax loss · almost flat' },
            { math: <>slope = −p = −0.01</>, note: 'almost no push' },
          ]}
          result={<>0.99 ÷ 0.01 = 99× stronger signal</>}
        />
      ),
    },
    {
      id: 's2-opposite-lab',
      section: 'The loss',
      kicker: 'Try it · opposite goals',
      title: 'Slide one fake from “caught” to “fooled” and watch the two losses pull apart',
      lab: true,
      notes: { time: '4 min', say: 'Start at D(G(z)) = 0.01: D is happy (low coral loss), G is unhappy (high mint loss). Slide right and they swap. Then read the two “push” numbers: at 0.01 the minimax push is 0.01, the non-saturating push is 0.99.', ask: 'At which end of the slider does the minimax version leave G stuck?' },
      render: () => <OppositeGoalsLab />,
    },
    {
      id: 's2-minimax',
      section: 'The loss',
      kicker: 'The full GAN objective',
      title: 'One value: D tries to push it up, G tries to push it down',
      notes: { time: '3 min', say: 'This is the min-max game from the original paper. D maximises: real → 1, fake → 0. G minimises: fake → 1. They play until neither can improve — the 0.5 balance. Remember: for G we train the non-saturating version from the previous slides.', ask: 'Which player controls the first term, E[log D(x)]?' },
      render: () => (
        <FormulaTerms
          reading="D chooses its weights to make V big · G chooses its weights to make V small"
          formula={<><span>min<sub><T tone="mint">G</T></sub> max<sub><T tone="coral">D</T></sub></span><span>𝔼<sub>x</sub>[ log <T tone="coral">D</T>(<T tone="blue">x</T>) ]</span>{op('+')}<span>𝔼<sub>z</sub>[ log(1 − <T tone="coral">D</T>(<T tone="mint">G(z)</T>)) ]</span></>}
          terms={[
            { symbol: 'min max', name: 'The game', meaning: 'D maximises V · G minimises the same V', range: '2 players', tone: 'yellow' },
            { symbol: <>𝔼<sub>x</sub>[ ]</>, name: 'Average over real images', meaning: 'x is a sample from the training set', range: 'batch mean', tone: 'blue' },
            { symbol: 'log D(x)', name: "D's score on reals", meaning: 'Near 0 when D(x) → 1 · D wants this', range: '−∞ … 0', tone: 'coral' },
            { symbol: <>𝔼<sub>z</sub>[ ]</>, name: 'Average over noise', meaning: 'z is random noise · G(z) is a fake', range: 'batch mean', tone: 'mint' },
            { symbol: 'log(1−D(G(z)))', name: "D's score on fakes", meaning: 'D wants it near 0 · G wants it → −∞', range: '−∞ … 0', tone: 'violet' },
            { symbol: 'V', name: 'Value of the game', meaning: 'Sum of both averages · one number', range: '−∞ … 0', tone: 'plain' },
          ]}
        />
      ),
    },

    /* ---------------- Code ---------------- */
    {
      id: 's2-minimax-steps',
      section: 'The loss',
      kicker: 'The objective · worked',
      title: 'One batch gives one number: V ≈ −0.33 for a decent D',
      notes: { time: '2 min', say: '𝔼 is just the batch average. Two reals scored 0.9 and 0.8; two fakes scored 0.2 and 0.1. Average each term, then add. D would like V to climb to 0; G would like it to fall.', ask: 'Which single score would G most like to change in this batch?' },
      render: () => (
        <FormulaSteps
          given={['reals: D(x) = 0.9, 0.8', 'fakes: D(G(z)) = 0.2, 0.1']}
          steps={[
            { math: <>𝔼[log D(x)] = (log 0.9 + log 0.8) / 2</>, note: '= −0.164 · real-image average' },
            { math: <>𝔼[log(1 − D(G(z)))] = (log 0.8 + log 0.9) / 2</>, note: '= −0.164 · fake-image average' },
            { math: <>V = −0.164 + (−0.164)</>, note: 'add the two averages' },
          ]}
          result={<>V ≈ −0.33 · D pushes it up to 0 · G pushes it down</>}
        />
      ),
    },
    {
      id: 's2-balance-steps',
      section: 'The loss',
      kicker: 'The balance point · worked',
      title: 'At the balance point the numbers become 2 ln 2 and ln 2',
      notes: { time: '2 min', say: 'When fakes match the real data, D’s best answer is 0.5 everywhere. Plug it in. These exact numbers — 1.386 and 0.693 — are what the loss curves settle at in Session 4.', ask: 'If you see D loss ≈ 1.386 and G loss ≈ 0.693 in a log, what does it mean?' },
      render: () => (
        <FormulaSteps
          given={['D(x) = 0.5 · every real', 'D(G(z)) = 0.5 · every fake']}
          steps={[
            { math: <>𝔼[log D(x)] = log 0.5 = −0.693</>, note: 'real-image term' },
            { math: <>𝔼[log(1 − D(G(z)))] = log 0.5 = −0.693</>, note: 'fake-image term' },
            { math: <>V = −1.386 = −log 4</>, note: 'value of the game at balance' },
            { math: <>G loss = −log 0.5 = 0.693</>, note: 'non-saturating · = ln 2' },
          ]}
          result={<>D loss = 1.386 (2 ln 2) · G loss = 0.693 (ln 2)</>}
        />
      ),
    },
    {
      id: 's2-detach',
      section: 'The code',
      kicker: 'The key trick · .detach()',
      title: 'While D learns, cut the fake loose from G',
      notes: { time: '3 min', say: '.detach() returns the same numbers with no link back to G. Precise reasons: Step A is D’s step, so only D’s gradients should be computed; it saves a wasted backward pass through G; and it keeps D-step gradients out of G’s .grad. In our loop forgetting it would not break G, because g_optimizer.zero_grad() clears those stray gradients — but move zero_grad and they would leak into G’s update.', ask: 'Does .detach() change the values of the fake image?' },
      render: () => (
        <Split ratio="1.05fr 1fr" align="start"
          left={<div className="stack gap-md">
            <Code title="Step A · training D" code={`fake = generator(noise).detach()   # only D learns`} marks={{ 1: 'coral' }} />
            <Code title="Step B · training G" code={`fake = generator(noise)            # G learns from D`} marks={{ 1: 'mint' }} />
          </div>}
          right={<Cards cols={1} items={[
            { tag: 'What it does', title: 'Same numbers, no gradient path back to G', tone: 'blue' },
            { tag: 'Why', title: 'Step A should only compute and change D', body: <ul><li>No wasted backward pass through G</li><li>No D-step gradients left in G’s .grad</li><li>Don’t rely on a later zero_grad to clean up</li></ul>, tone: 'yellow' },
          ]} />}
        />
      ),
    },
    {
      id: 's2-code-a',
      section: 'The code',
      kicker: 'The full training step · part A',
      title: 'Step A in code: judge reals, judge detached fakes, update D',
      notes: { time: '3 min', say: 'Walk line by line using the margin notes. Note zero_grad before backward — PyTorch adds gradients up unless you clear them.', ask: 'Which line guarantees G is not touched in this step?' },
      render: () => (
        <Code title="Step A · train the Discriminator"
          code={`real_pred = D(real_images)
fake_images = G(noise).detach()
fake_pred = D(fake_images)
d_loss = BCE(real_pred, 1) + BCE(fake_pred, 0)
d_optimizer.zero_grad()
d_loss.backward()
d_optimizer.step()`}
          marks={{ 2: 'coral', 4: 'yellow', 7: 'coral' }}
          notes={{ 1: 'D judges real images', 2: 'fakes, cut from G', 3: 'D judges fakes', 4: 'real → 1, fake → 0', 5: 'clear old gradients', 6: 'gradients for D only', 7: "only D's weights move" }} />
      ),
    },
    {
      id: 's2-code-b',
      section: 'The code',
      kicker: 'The full training step · part B',
      title: "Step B in code: no detach, and the target is 'real'",
      notes: { time: '3 min', say: 'Two differences from Step A: no .detach(), and the label is 1 even though the image is fake. g_loss.backward() also fills D’s .grad, but only g_optimizer steps, and d_optimizer.zero_grad() clears D’s grads next round.', ask: 'Why is the target 1 here when the image is definitely fake?' },
      render: () => (
        <>
          <Code title="Step B · train the Generator"
            code={`fake_images = G(noise)
fake_pred = D(fake_images)
g_loss = BCE(fake_pred, 1)
g_optimizer.zero_grad()
g_loss.backward()
g_optimizer.step()`}
            marks={{ 1: 'mint', 3: 'yellow', 6: 'mint' }}
            notes={{ 1: 'no detach — G learns', 2: 'D judges the fakes', 3: 'G wants D to say “real”', 4: 'clear old G gradients', 5: 'gradients flow through D into G', 6: "only G's weights move" }} />
          <Takeaway><span>That's the complete GAN training loop. Everything else this course builds on it.</span></Takeaway>
        </>
      ),
    },

    /* ---------------- Big picture ---------------- */
    {
      id: 's2-engine',
      section: 'Big picture',
      kicker: 'Basic GAN vs variations',
      title: 'The basic GAN is the engine; every famous GAN is a car built around it',
      notes: { time: '2 min', say: 'Each variation changes one thing around the same two-player loop. We will build most of these over the four days.', ask: 'Which variation would you need to say “generate a 7” on command?' },
      render: () => (
        <Mapping leftLabel="Variation" rightLabel="= basic GAN +"
          rows={[
            [<b>DCGAN</b>, 'convolutions'],
            [<b>WGAN</b>, 'a better loss function'],
            [<b>cGAN</b>, 'a label as extra input'],
            [<b>Pix2Pix</b>, 'an image as input'],
            [<b>CycleGAN</b>, 'the cycle-consistency trick'],
            [<b>StyleGAN</b>, 'a style-based architecture'],
          ]} />
      ),
    },
    {
      id: 's2-teacher-story',
      section: 'Big picture',
      kicker: 'The whole thing in one story',
      title: 'A teacher who never shows the paintings',
      notes: { time: '3 min', say: 'Tell it as a story. The teacher has 1000 real paintings but never shows them. The student picks a random number as a starting idea, paints, and only hears feedback.', ask: 'In this story, what plays the role of the random number?' },
      render: () => (
        <Split ratio="1.6fr 1fr" left={<Timeline items={[
          { when: 'Day 1', title: 'Random number 42 → a painting', body: 'Teacher: “Terrible. Not realistic at all.” Student adjusts.', tone: 'coral' },
          { when: 'Day 10', title: 'Random number 77 → better', body: 'Teacher: “Better, but the colours are wrong.” Student adjusts.', tone: 'yellow' },
          { when: 'Day 100', title: 'Random number 15 → good', body: 'Teacher: “Hmm… I almost can’t tell if this is real or yours.”', tone: 'blue' },
          { when: 'Day 1000', title: 'Any random number → beautiful', body: 'Teacher: “I cannot tell the difference anymore.”', tone: 'mint' },
        ]} />} right={<div className="s2-chars"><Player who="G" size={130} mood="happy" /><Player who="D" size={130} mood="unsure" /></div>} />
      ),
    },
    {
      id: 's2-teacher-map',
      section: 'Big picture',
      kicker: 'Map the story to a GAN',
      title: 'Every piece of the story has a GAN name',
      notes: { time: '2 min', say: 'After graduation the teacher goes home — D is not needed. The student paints alone: any random number gives a new, original painting.', ask: 'What happens to the teacher after graduation?' },
      render: () => (
        <Mapping leftLabel="Story" rightLabel="GAN"
          rows={[
            ['Student', <T tone="mint">Generator</T>],
            ['Teacher', <T tone="coral">Discriminator</T>],
            ['Random number', <T tone="blue">Noise z (the trigger)</T>],
            ["Student's painting", 'Fake image G(z)'],
            ['Real paintings', 'Training dataset'],
            ['“Good” or “bad” feedback', 'Loss function (BCE)'],
            ['Student adjusts', "Backpropagation updates G's weights"],
          ]} />
      ),
    },

    /* ---------------- Check ---------------- */
    {
      id: 's2-recap',
      section: 'Check',
      kicker: 'Session 2 recap',
      title: 'Five ideas carry the whole session',
      notes: { time: '2 min', say: 'Have learners say each line back before you reveal the next part of the day.', ask: 'Which of these would you explain first to a colleague?' },
      render: () => (
        <Recap items={[
          <>G turns <b>noise</b> into fakes; D outputs <b>P(real)</b>.</>,
          <>Step A: D learns real → 1, <b>detached</b> fake → 0. Step B: G learns to make D say 1.</>,
          <>Both use <b>BCE</b>; G trains with the non-saturating −log D(G(z)).</>,
          <>G never sees real data — it learns only through <b>D's gradients</b>.</>,
          <>At balance D ≈ 0.5; after training, <b>throw D away</b>.</>,
        ]} />
      ),
    },
    {
      id: 's2-check',
      section: 'Check',
      kicker: 'Knowledge check',
      title: 'Explain it without the slides',
      reveal: true,
      notes: { time: '6 min', say: 'Give a minute of silent thinking, then take answers before pressing R. Q4, Q5 and Q6 are the eye-openers: what detach really protects, why 0.5 is success, and why a basic GAN cannot take requests.', ask: 'Which question split the room?' },
      render: ({ revealed }) => (
        <Quiz revealed={revealed} cols={3} items={[
          { q: 'What are the two networks in a GAN, and what does each do?', a: 'Generator: noise → fake. Discriminator: image → probability it is real.' },
          { q: 'What is random noise, and why does G need it?', a: 'A vector of random numbers. It is the trigger that gives variety — without it G makes one output forever.' },
          { q: 'Does the Generator ever see real images?', a: 'Never. It learns only from gradients flowing back through D’s judgement.' },
          { q: 'You forget .detach() in Step A. What actually goes wrong?', a: 'If G’s grads are zeroed before its own backward: only wasted compute. If not, D’s “catch the fake” gradients leak into G’s update.' },
          { q: 'D outputs 0.5 for every image. Broken D, or great G?', a: 'Great G — if the fakes match the real data, 0.5 is the best D can do. (A D at 0.5 from step 1 is untrained, not beaten.)' },
          { q: 'Can a basic GAN generate a specific thing on command, like “a 7”?', a: 'No — it picks from what it learned at random. Control needs a conditional GAN (Day 2).' },
        ]} />
      ),
    },
    {
      id: 's2-bridge',
      section: 'Check',
      kicker: 'Next',
      title: 'G and D are neural networks. What is actually inside them?',
      layout: 'bridge',
      notes: { time: '1 min', say: 'We have the game and the loop. To build G and D we need neurons, layers, activations, backprop and PyTorch — that is the afternoon’s first session.', ask: 'What is the smallest piece a neural network is made of?' },
      render: () => <Bridge done="Session 2 · complete" question="G and D are neural networks. What is actually inside them?" next="S3 · Neural Networks Fast-Track" />,
    },
  ],
};
