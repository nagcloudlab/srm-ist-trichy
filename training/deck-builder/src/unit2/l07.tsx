import './l07.css';
import type { ReactNode } from 'react';
import { Answer, Bridge, Cards, Divider, Equation, FormulaSteps, FormulaTerms, Predict, Quiz, Recap, Split, Stack, T, Table, Takeaway, Versus } from '../components/kit';
import { DistanceLab, SaturationLab } from '../labs/D2L07Labs';
import type { Part } from '../types';

const op = (s: ReactNode) => <span className="op">{s}</span>;

export const l07Part: Part = {
  id: 'l07',
  code: 'L07',
  label: 'Why BCE fails',
  title: 'Why BCE fails: the loss itself is the root cause',
  when: '',
  minutes: 0,
  slides: [
    /* ---------------- Open ---------------- */
    {
      id: 'l07-divider',
      section: 'Open',
      kicker: 'Lesson 07',
      title: 'Why BCE loss fails',
      layout: 'divider',
      notes: {
        time: '1 min',
        say: 'This lesson is the turning point. We stop patching symptoms and diagnose the real disease. By the end you will know exactly why BCE fails — and want WGAN.',
        ask: 'Remember the end of Unit 1 — label smoothing, instance noise, learning-rate balance? What if they were all band-aids?',
      },
      render: () => (
        <Divider
          code="L07"
          title="Why BCE loss fails"
          promise="The loss function itself is the root cause of GAN instability."
          items={['Saturation — and what Unit 1’s fix leaves', 'JS divergence stuck at log 2', 'The narrow sweet spot', 'Mode collapse built into the loss']}
        />
      ),
    },
    {
      id: 'l07-bandaids',
      section: 'Open',
      kicker: 'Band-aids vs surgery',
      title: 'Unit 1’s tricks treated symptoms — the disease is the loss',
      notes: {
        time: '2 min',
        say: 'Pick up exactly where Unit 1 ended: the Build GANs deck (When GANs break), after the MNIST GAN and DCGAN. We applied one-sided label smoothing, instance noise, learning-rate balance / TTUR. They helped. But they treat symptoms. Now we find the disease.',
        ask: 'If you had a headache every day, would you keep taking painkillers or go find the cause?',
      },
      render: () => (
        <Versus
          left={{ tag: 'Unit 1 · Build GANs deck (When GANs break)', title: 'The band-aids', tone: 'yellow', body: <ul><li>One-sided label smoothing (real = 0.9)</li><li>Instance noise on D’s inputs</li><li>Learning-rate balance / TTUR</li><li><b>Result:</b> training improved… somewhat</li></ul> }}
          right={{ tag: 'This lesson', title: 'The uncomfortable truth', tone: 'coral', body: <ul><li>All those tricks fight <b>symptoms</b></li><li>The disease is the loss function itself — <b>BCE</b></li><li>L07: understand why · L08: the cure</li></ul> }}
          mid="→"
        />
      ),
    },
    {
      id: 'l07-recap',
      section: 'Open',
      kicker: 'Quick recap',
      title: 'BCE in GANs: D separates, G fools',
      notes: {
        time: '2 min',
        say: 'Quick recap of Unit 1. D is trained with BCE. G is trained with the NON-saturating loss −log D(G(z)) = BCE(D(fake), 1), not the original minimax log(1 − D(G(z))). Simple — but flawed.',
        ask: 'Can you write the BCE loss for D and G from memory?',
      },
      render: () => (
        <Stack gap="lg">
          <Equation size="md">
            <span>L<sub>D</sub></span>{op('=')}<span>−[ log <T tone="coral">D</T>(<T tone="blue">x</T>)</span>{op('+')}<span>log(1 − <T tone="coral">D</T>(<T tone="mint">G(z)</T>)) ]</span>
          </Equation>
          <Equation size="md" reading="non-saturating — what Unit 1 trained">
            <span>L<sub>G</sub></span>{op('=')}<span>−log <T tone="coral">D</T>(<T tone="mint">G(z)</T>)</span>
          </Equation>
          <Cards cols={2} items={[
            { tag: 'D’s job', title: 'Push D(real) → 1 · D(fake) → 0', tone: 'coral' },
            { tag: 'G’s job', title: 'Push D(fake) → 1 — fool D', tone: 'mint' },
          ]} />
          <Takeaway>This works… until it doesn’t.</Takeaway>
        </Stack>
      ),
    },
    {
      id: 'l07-bce-terms',
      section: 'Open',
      kicker: 'Both BCE losses · term by term',
      title: 'Both losses are Unit 1 BCE, piece by piece',
      notes: {
        time: '3 min',
        say: 'Read the two losses aloud, then walk the symbols. Every piece is Unit 1 BCE: real → 1, fake → 0, and G trains with target 1 (the non-saturating form).',
        ask: 'Which term of L_D does G’s update actually depend on?',
      },
      render: () => (
        <FormulaTerms
          symbolWidth="9.5rem"
          reading="D: minus [ log D(real) + log(1 − D(fake)) ] · G: minus log D(fake)"
          formula={<><span>L<sub>D</sub> = −[ log <T tone="coral">D</T>(<T tone="blue">x</T>) + log(1 − <T tone="coral">D</T>(<T tone="mint">G(z)</T>)) ]</span>{op('·')}<span>L<sub>G</sub> = −log <T tone="coral">D</T>(<T tone="mint">G(z)</T>)</span></>}
          terms={[
            { symbol: 'x', name: 'Real image', meaning: 'Drawn from the training set', range: '784 pixels', tone: 'blue' },
            { symbol: 'z', name: 'Noise', meaning: 'G’s random input', range: '64 (labs)', tone: 'blue' },
            { symbol: 'G(z)', name: 'Fake image', meaning: 'What G makes from z', range: 'shape of x', tone: 'mint' },
            { symbol: 'D(·)', name: 'D’s score', meaning: 'Probability the input is real', range: '0 … 1', tone: 'coral' },
            { symbol: <span className="l07-sm">log D(x)</span>, name: 'Real term', meaning: '0 when D(x) = 1 · very negative as D(x) → 0', range: '−∞ … 0', tone: 'violet' },
            { symbol: <span className="l07-sm">log(1−D(G(z)))</span>, name: 'Fake term', meaning: '0 when D(fake) = 0', range: '−∞ … 0', tone: 'violet' },
            { symbol: <span className="l07-sm">−log D(G(z))</span>, name: 'G’s loss', meaning: 'Non-saturating · small when D is fooled', range: '0 … ∞', tone: 'mint' },
          ]}
        />
      ),
    },

    /* ---------------- Saturation ---------------- */
    {
      id: 'l07-predict-vanish',
      section: 'Saturation',
      kicker: 'Predict',
      title: 'D is winning hard — does G’s gradient vanish?',
      reveal: true,
      notes: {
        time: '2 min',
        say: 'Let everyone commit before revealing. This is the myth most textbooks repeat: “the GAN gradient vanishes”. Which loss you train decides the answer.',
        ask: 'Who said “vanishes”? Hold that thought for two slides.',
      },
      render: ({ revealed }) => (
        <Predict
          revealed={revealed}
          question="Does G’s gradient vanish?"
          facts={['G trains with −log D(G(z)) (Unit 1)', 'D(fake) = 0.0001 — D is sure it is fake', 'Look at the gradient on D’s logit a']}
          answer={<Answer verdict="No — it stays ≈ −1" points={[<>Non-saturating: ∂L/∂a = σ(a) − 1 ≈ <b>−0.9999</b></>, <>Only the <b>minimax</b> loss vanishes: −σ(a) ≈ −0.0001</>, 'The real problem is direction, not size — coming next']} />}
        />
      ),
    },
    {
      id: 'l07-saturation',
      section: 'Saturation',
      kicker: 'Problem 1',
      title: 'The minimax loss saturates — Unit 1’s loss does not',
      notes: {
        time: '3 min',
        say: 'Write D(fake) = σ(a), where a is D’s logit. The original minimax G loss log(1 − D(G(z))) has gradient −σ(a) on the logit: when D confidently says fake (D ≈ 0), that is ≈ 0 — it saturates exactly when G is worst. Unit 1’s non-saturating loss −log D(G(z)) has gradient σ(a) − 1 ≈ −1 there: strong. So the textbook “vanishing gradient” is the minimax loss, and Unit 1 already fixed it.',
        ask: 'Unit 1 trained G with BCE(D(fake), 1). Which row is that?',
      },
      render: () => (
        <>
          <Table
            headers={['G loss', '∂L/∂a', 'at D(fake) = 0.0001', 'Verdict']}
            rows={[
              ['Minimax · log(1 − D(G(z)))', '−σ(a)', '−0.0001', 'vanishes — no signal exactly when G is worst'],
              ['Non-saturating · −log D(G(z))', 'σ(a) − 1', '−0.9999', 'strong — Goodfellow 2014, used on Unit 1'],
            ]}
            highlight={[1]}
          />
          <Takeaway tone="mint">D(fake) = σ(a), with a = D’s logit. The <b>size</b> problem is solved — keep reading for what isn’t.</Takeaway>
        </>
      ),
    },
    {
      id: 'l07-saturation-steps',
      section: 'Saturation',
      kicker: 'Where −0.0001 and −0.9999 come from · worked',
      title: 'Each loss cancels a different factor of σ′ — that is the whole saturation story',
      notes: {
        time: '3 min',
        say: 'Derive both derivatives with the chain rule. The sigmoid derivative σ′(a) = σ(a)(1 − σ(a)) has two factors; each loss cancels a different one.',
        ask: 'If D(fake) were 0.5 instead, how would the two gradients compare?',
      },
      render: () => (
        <FormulaSteps
          given={['D(G(z)) = σ(a) = 0.0001', 'σ′(a) = σ(a)(1 − σ(a))']}
          steps={[
            { math: <>a = log(0.0001 / 0.9999) = −9.21</>, note: 'the fake logit, before the sigmoid' },
            { math: <>∂/∂a log(1 − σ(a)) = −σ(a) = −0.0001</>, note: 'minimax · cancels (1 − σ), leaves tiny σ' },
            { math: <>∂/∂a [−log σ(a)] = σ(a) − 1 = −0.9999</>, note: 'non-saturating · cancels tiny σ, leaves 1 − σ' },
            { math: <>0.9999 / 0.0001 ≈ 10,000</>, note: 'ratio of the two gradient sizes' },
          ]}
          result={<>non-saturating ≈ 10,000× more signal · at D = 0.5 both are −0.5</>}
        />
      ),
    },
    {
      id: 'l07-saturation-lab',
      section: 'Saturation',
      kicker: 'Live · gradient sizes',
      title: 'Slide D’s logit: minimax fades to zero, non-saturating stays near 1',
      lab: true,
      notes: {
        time: '3 min',
        say: 'Start at a = −9.21 (D(fake) = 0.0001): minimax −0.0001, non-saturating −0.9999. Drag right to a = 0: both meet at 0.5. The curves only differ once D starts winning — which is exactly when G needs help.',
        ask: 'Where on this axis does an untrained G live?',
      },
      render: () => <SaturationLab />,
    },
    {
      id: 'l07-not-fixed',
      section: 'Saturation',
      kicker: 'What the non-saturating loss does NOT fix',
      title: 'The gradient’s size survives — its direction does not',
      notes: {
        time: '3 min',
        say: 'Numbers from −log and σ. G’s loss climbs from 0.69 to 8.1 as D wins, and the logit gradient stays near −1. So why does Unit 1 training still break? The direction comes from back-propagating through a D that is almost perfect: near the fakes it is flat or erratic. Arjovsky & Bottou (2017): with a near-optimal D the −log D updates become noisy and unstable.',
        ask: 'If the gradient isn’t small, why can G still fail to improve?',
      },
      render: () => (
        <Split ratio="1.2fr 1fr" left={
          <Table
            headers={['D(fake)', 'G loss −log D', '|∂L/∂a| non-sat.', '|∂L/∂a| minimax']}
            align={['left', 'right', 'right', 'right']}
            rows={[
              ['0.50', '0.69', '0.50', '0.50'],
              ['0.04', '3.22', '0.96', '0.04'],
              ['0.0003', '8.11', '0.9997', '0.0003'],
            ]}
          />
        } right={
          <Cards cols={1} items={[{
            tag: 'Size survives — direction doesn’t', title: 'Big but uninformative steps', tone: 'coral',
            body: <ul><li>G’s update = gradient through D back to the image</li><li>A near-perfect D is flat or erratic around the fakes</li><li>Arjovsky &amp; Bottou, 2017</li></ul>,
          }]} />
        } />
      ),
    },

    /* ---------------- JS divergence ---------------- */
    {
      id: 'l07-js-terms',
      section: 'JS divergence',
      kicker: 'Problem 2 · JS divergence · term by term',
      title: 'An optimal D turns BCE into “minimize JS” — JS’s flaws become G’s',
      notes: {
        time: '3 min',
        say: 'Problem 2 is about what BCE is actually measuring behind the scenes. Define JS from KL and the mixture before we see why it gets stuck. Point at the range chip: JS can never exceed log 2.',
        ask: 'Why does the mixture M keep JS finite even when the two distributions do not overlap?',
      },
      render: () => (
        <FormulaTerms
          symbolWidth="6.5rem"
          reading="the average KL distance of each distribution from their 50/50 mixture"
          formula={<><span>JS(<T tone="blue">P<sub>r</sub></T> ‖ <T tone="mint">P<sub>g</sub></T>)</span>{op('=')}<span>½ KL(<T tone="blue">P<sub>r</sub></T> ‖ M)</span>{op('+')}<span>½ KL(<T tone="mint">P<sub>g</sub></T> ‖ M)</span>{op(',')}<span>M = ½(<T tone="blue">P<sub>r</sub></T> + <T tone="mint">P<sub>g</sub></T>)</span></>}
          terms={[
            { symbol: <>P<sub>r</sub></>, name: 'Real distribution', meaning: 'Where real images live', range: 'probability', tone: 'blue' },
            { symbol: <>P<sub>g</sub></>, name: 'Generated distribution', meaning: 'Where G’s fakes live', range: 'probability', tone: 'mint' },
            { symbol: 'M', name: 'Mixture', meaning: 'Half real, half fake — the “middle”', range: '½ Pr + ½ Pg', tone: 'violet' },
            { symbol: <span className="l07-sm">KL(P‖Q)</span>, name: 'KL divergence', meaning: 'Σ P log(P/Q) — cost of using Q when P is true', range: '0 … ∞', tone: 'yellow' },
            { symbol: 'D*(x)', name: 'Best possible D', meaning: 'pr / (pr + pg) — then BCE value = 2·JS − 2 log 2', range: '0 … 1', tone: 'coral' },
            { symbol: 'JS', name: 'Result', meaning: '0 when Pg = Pr · log 2 when they never overlap', range: '0 … 0.693', tone: 'plain' },
          ]}
        />
      ),
    },
    {
      id: 'l07-js-stuck',
      section: 'JS divergence',
      kicker: 'Problem 2',
      title: 'No overlap → JS is stuck at log 2 — and no overlap is the normal case',
      notes: {
        time: '3 min',
        say: 'With an optimal D, the minimax objective equals 2·JS(P_real, P_fake) − 2 log 2 (Goodfellow 2014). If the two distributions do not overlap, JS = log 2 ≈ 0.693 no matter how far apart they are — a constant has zero gradient. And no-overlap is the NORMAL case: real digits sit on a thin, low-dimensional manifold inside 784-D pixel space; G’s outputs come from a 64-D z — two thin surfaces almost never meet.',
        ask: 'Early in training, does G’s random noise look anything like real digits?',
      },
      render: () => (
        <Stack gap="lg">
          <Equation size="md" reading="no overlap → JS = log 2 ≈ 0.693 → ∇ = 0">
            <span>V(D*, G)</span>{op('=')}<span>2 · JS(<T tone="blue">P<sub>r</sub></T>, <T tone="mint">P<sub>g</sub></T>)</span>{op('−')}<span>2 log 2</span>
          </Equation>
          <Cards cols={3} items={[
            { tag: 'Real digits', title: 'A thin manifold', body: 'Low-dimensional surface inside 784-D pixel space', tone: 'blue' },
            { tag: 'Fakes', title: 'Another thin surface', body: 'Made from a 64-D z', tone: 'mint' },
            { tag: 'Result', title: 'They almost never overlap', body: 'A near-perfect D is easy · JS stuck at log 2 (Arjovsky & Bottou, 2017)', tone: 'coral' },
          ]} />
        </Stack>
      ),
    },
    {
      id: 'l07-js-steps',
      section: 'JS divergence',
      kicker: 'Two piles that never touch · worked',
      title: 'JS gives the same answer for 5 units or 50 units apart',
      notes: {
        time: '3 min',
        say: 'Work it on the board. The punchline is the last step: moving the fake pile ten times further away does not change JS at all, so the loss gives G no direction.',
        ask: 'What would JS be if the fake pile moved to overlap the real one exactly?',
      },
      render: () => (
        <FormulaSteps
          given={['Pr: ½ at x = 0, ½ at x = 1', 'Pg: ½ at x = 5, ½ at x = 6']}
          steps={[
            { math: <>M = ¼ at 0, 1, 5, 6</>, note: 'each pile contributes half its mass' },
            { math: <>KL(Pr ‖ M) = 2 · ½ · log(½ / ¼) = log 2</>, note: 'only Pr’s two points count' },
            { math: <>KL(Pg ‖ M) = log 2</>, note: 'same by symmetry' },
            { math: <>JS = ½ log 2 + ½ log 2 = log 2 ≈ 0.693</>, note: 'the maximum possible value' },
            { math: <>D*(0) = ½ / (½ + 0) = 1 · D*(5) = 0</>, note: 'a perfect D exists' },
            { math: <>move Pg to 50, 51 → JS still log 2</>, note: 'distance never enters the formula' },
          ]}
          result={<>BCE at D* = 2·log 2 − 2 log 2 = 0, whatever the gap</>}
        />
      ),
    },
    {
      id: 'l07-distance-lab',
      section: 'JS divergence',
      kicker: 'Live · JS vs Wasserstein',
      title: 'Slide the fake away: JS flatlines at log 2, Wasserstein keeps counting',
      lab: true,
      notes: {
        time: '4 min',
        say: 'Real = Uniform[0, 1]; fake = Uniform[θ, θ+1]. While the boxes overlap, JS grows with |θ|. At |θ| = 1 they stop touching and JS freezes at 0.693 — moving from 2 to 4 changes nothing. W₁ = |θ| keeps shrinking as the fake approaches. That is the preview of L08.',
        ask: 'At θ = 3, which number would tell G to move left?',
      },
      render: () => <DistanceLab />,
    },
    {
      id: 'l07-gps',
      section: 'JS divergence',
      kicker: 'The GPS analogy',
      title: 'BCE says “far away”; Wasserstein says “far away — go north”',
      notes: {
        time: '2 min',
        say: 'The GPS analogy makes it crystal clear. BCE tells you distance only — and not even that once nothing overlaps. What we need is a GPS that tells you both distance and direction. That’s Wasserstein — next lesson.',
        ask: 'If your GPS only said “you are far away” without direction, could you navigate?',
      },
      render: () => (
        <Versus
          left={{ tag: 'BCE / JS divergence', title: 'Distance only — you’re stuck', tone: 'coral', body: <ul className="l07-cmp"><li>“You are 500 km from destination”</li><li>“You are 500 km from destination”</li><li>“You are 500 km from destination”</li></ul> }}
          right={{ tag: 'What we need · Wasserstein', title: 'Distance and direction', tone: 'mint', body: <ul className="l07-cmp"><li>“You are 500 km <b>north</b>”</li><li>“You are 300 km <b>north</b>”</li><li>“You are 100 km <b>north</b>”</li></ul> }}
        />
      ),
    },

    /* ---------------- Instability ---------------- */
    {
      id: 'l07-sweet-spot',
      section: 'Instability',
      kicker: 'Problem 3',
      title: 'D must be “good but not too good” — a razor-thin sweet spot',
      notes: {
        time: '2 min',
        say: 'Even when gradients exist, D doing its job well HURTS G. D needs to be good enough to give feedback, but not so good the feedback becomes uninformative. The sweet spot is razor thin.',
        ask: 'How would you feel if your job required you to be “good but not too good”?',
      },
      render: () => (
        <>
          <Cards cols={3} items={[
            { tag: 'D too weak', title: 'Feedback is noise', body: 'G learns from a coin flip', tone: 'yellow' },
            { tag: 'D just right', title: 'Useful signal', body: 'Good enough to point G somewhere', tone: 'mint' },
            { tag: 'D too strong', title: 'Signal turns useless', body: 'Near-perfect D · flat around the fakes', tone: 'coral' },
          ]} />
          <Takeaway tone="coral">You spend more time tuning D’s strength than actually training the GAN.</Takeaway>
        </>
      ),
    },
    {
      id: 'l07-mode-collapse',
      section: 'Instability',
      kicker: 'Problem 4',
      title: 'BCE never asks for variety — mode collapse is built into the loss',
      notes: {
        time: '3 min',
        say: 'BCE only asks “can you fool D?” — never “are your outputs diverse?” Precisely: with an optimal D, the non-saturating gradient equals the gradient of KL(P_g‖P_r) − 2·JS (Arjovsky & Bottou 2017). That reverse KL punishes fakes where there is no real data, but dropping a whole real mode is nearly free.',
        ask: 'If a student gets an A by copying the same answer, does that mean they learned?',
      },
      render: () => (
        <>
          <Versus
            left={{ tag: 'What BCE asks', title: '“Can you fool D?”', tone: 'coral', body: <ul><li>G: “Yes, this one image works!”</li><li>BCE: “Great — low loss!”</li><li>Never asks: are your outputs varied?</li></ul> }}
            right={{ tag: 'What a better loss would ask', title: '“How close is your whole distribution?”', tone: 'mint', body: <ul><li>A missing mode should still cost something</li><li>Mass that has to be moved — Wasserstein</li></ul> }}
          />
          <Takeaway tone="coral">−log D* trains G on <b>KL(P<sub>g</sub> ‖ P<sub>r</sub>) − 2·JS</b>: fakes where there is no real data cost a lot · a real mode with no fakes is almost free.</Takeaway>
        </>
      ),
    },
    {
      id: 'l07-so-far',
      section: 'Instability',
      kicker: 'So far',
      title: 'Four ways BCE breaks a GAN',
      notes: {
        time: '2 min',
        say: 'Pause and make sure everyone has all four problems clear. Each one is a different way BCE breaks your GAN.',
        ask: 'Which of these four problems have you personally seen in training?',
      },
      render: () => (
        <Table
          headers={['Problem', 'What happens with BCE', 'Root cause']}
          rows={[
            ['Saturation', 'Minimax G gradient → 0 when D wins', 'log(1 − σ) flat · NS loss fixes size only'],
            ['No overlap', 'Near-perfect D, uninformative gradient', 'JS stuck at log 2 for disjoint supports'],
            ['Narrow sweet spot', 'D must be “good but not too good”', 'D’s strength fights G’s signal'],
            ['Mode collapse', 'Dropping modes is cheap', 'NS loss ≈ reverse KL − 2·JS'],
          ]}
        />
      ),
    },

    /* ---------------- The cure ---------------- */
    {
      id: 'l07-bandaids-really',
      section: 'The cure',
      kicker: 'Unit 1’s band-aids, decoded',
      title: 'Each trick fought one symptom — none changed what the loss measures',
      notes: {
        time: '2 min',
        say: 'Now we can see what Unit 1’s band-aids were REALLY doing. Each one fights a specific symptom caused by BCE. None changes what the loss measures.',
        ask: 'If all tricks fight symptoms, what would a cure look like?',
      },
      render: () => (
        <>
          <Table
            headers={['Trick', 'What it really does', 'Which problem it fights']}
            rows={[
              ['One-sided label smoothing', 'Caps D’s confidence on reals at 0.9', 'Near-perfect D'],
              ['Instance noise', 'Blurs both distributions so they overlap', 'JS stuck at log 2'],
              ['LR balance / TTUR', 'Keeps D near the “not too good” zone', 'Narrow sweet spot'],
            ]}
          />
          <Takeaway tone="coral">All tricks fight the <b>symptoms</b>. The disease is the loss function.</Takeaway>
        </>
      ),
    },
    {
      id: 'l07-need-wgan',
      section: 'The cure',
      kicker: 'What we need',
      title: 'Wasserstein answers “how different, and in which direction?”',
      notes: {
        time: '3 min',
        say: 'Here is the preview of what WGAN fixes. Every problem on the left gets an answer on the right. A stronger critic becomes a GOOD thing, and the loss becomes meaningful.',
        ask: 'Which improvement excites you most?',
      },
      render: () => (
        <>
          <Table
            compact
            headers={['', 'BCE (JS divergence)', 'Wasserstein distance']}
            rows={[
              ['No overlap', 'JS constant → no useful signal', 'Distance still shrinks as fakes move closer'],
              ['D too strong', 'Uninformative signal for G', 'Better critic = better gradient'],
              ['Mode collapse', 'Dropping a mode is nearly free', 'A missing mode still costs distance'],
              ['Training stability', 'Narrow sweet spot', 'Much more stable'],
              ['Loss meaning', 'Tracks the D–G fight, not quality', 'Estimate correlates with sample quality'],
            ]}
          />
          <Takeaway tone="mint">BCE / JS: “same or different?” (a binary answer) · Wasserstein: “<b>how</b> different, and in <b>which direction</b>?”</Takeaway>
        </>
      ),
    },

    /* ---------------- Check ---------------- */
    {
      id: 'l07-summary',
      section: 'Check',
      kicker: 'Lesson 07 summary',
      title: 'Three things to remember about BCE',
      notes: {
        time: '2 min',
        say: 'Three key takeaways. BCE is fundamentally flawed for GANs — and now you know exactly why.',
        ask: 'Which takeaway feels most important?',
      },
      render: () => (
        <Recap items={[
          <><b>Saturation is half the story:</b> minimax saturates; Unit 1’s −log D fixes the size — not the information.</>,
          <><b>JS divergence is blind:</b> disjoint supports (the normal case) → JS = log 2, whatever the distance.</>,
          <><b>Tricks are band-aids:</b> smoothing, noise and LR balance fight symptoms. The disease is what BCE measures.</>,
        ]} />
      ),
    },
    {
      id: 'l07-check',
      section: 'Check',
      kicker: 'Knowledge check',
      title: 'Can you explain why BCE fails?',
      reveal: true,
      notes: {
        time: '4 min',
        say: 'Three eye-opener questions. Give silent thinking time before revealing. Q1 is the myth most textbooks repeat.',
        ask: 'Try to answer each one before revealing.',
      },
      render: ({ revealed }) => (
        <Quiz revealed={revealed} cols={3} items={[
          { q: 'Unit 1’s G loss is −log D(G(z)). D(fake) = 0.0001. Does G’s gradient vanish?', a: 'No: σ(a) − 1 ≈ −0.9999 on the logit (minimax would give −0.0001). The problem is direction — it flows back through a near-perfect D.' },
          { q: 'Fakes 1 pixel-shift vs 100 pixel-shifts away, supports disjoint. What does JS say?', a: 'log 2 ≈ 0.693 for both — it can’t tell “almost there” from “hopeless”. You want a distance that shrinks: Wasserstein (L08).' },
          { q: 'Instance noise makes the distributions overlap. If it works, why replace the loss?', a: 'It blurs what D sees and must be decayed — which brings the disjoint-support problem back. A loss informative without overlap removes the need.' },
        ]} />
      ),
    },
    {
      id: 'l07-bridge',
      section: 'Check',
      kicker: 'Next up',
      title: 'Replace JS with a distance that still shrinks when nothing overlaps.',
      layout: 'bridge',
      notes: {
        time: '1 min',
        say: 'Now you know the disease. Next lesson brings the cure: WGAN replaces BCE with the Wasserstein distance, replaces the Discriminator with a Critic, and makes the loss meaningful.',
        ask: 'What would a critic need to output if it is no longer a probability?',
      },
      render: () => <Bridge done="Lesson 07 · complete" question="Replace JS with a distance that still shrinks when nothing overlaps." next="L08 · WGAN — the Discriminator becomes a Critic" />,
    },
  ],
};
