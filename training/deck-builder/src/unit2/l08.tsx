import type { ReactNode } from 'react';
import './l08.css';
import {
  Answer, Bridge, Cards, Code, Divider, Equation, FormulaSteps, FormulaTerms, LabDemo, Predict, Quiz, Recap, Split, Stack, Steps, T, Table, Takeaway, Versus,
} from '../components/kit';
import { ClipLab, EmdLab } from '../labs/D2L08Labs';
import type { Part } from '../types';

const Op = ({ children }: { children: ReactNode }) => <span className="op">{children}</span>;

export const l08Part: Part = {
  id: 'l08',
  code: 'L08',
  label: 'WGAN',
  title: 'WGAN: a distance that keeps shrinking',
  when: '',
  minutes: 0,
  slides: [
    /* ---------------- Open ---------------- */
    {
      id: 'l08-divider',
      section: 'Open',
      kicker: 'Lesson 08',
      title: 'WGAN — Wasserstein distance',
      layout: 'divider',
      notes: {
        time: '1 min',
        say: 'L07 diagnosed the disease. This lesson is the cure. WGAN replaces the loss, the discriminator, the optimizer and the training ratio. By the end, they will build one.',
        ask: 'L07: JS is stuck at log 2 when real and fake do not overlap. What would a better distance do?',
      },
      render: () => (
        <Divider
          code="L08"
          title="WGAN — Wasserstein distance"
          promise="Replace JS with a distance that still shrinks when real and fake don’t overlap (Arjovsky, Chintala & Bottou, 2017)."
          items={['Earth mover’s distance', 'The critic', 'The WGAN loss', 'Lipschitz + clipping', 'Training · lab-08']}
        />
      ),
    },
    {
      id: 'l08-predict',
      section: 'Open',
      kicker: 'Predict',
      title: 'What should a useful distance do when the piles never touch?',
      reveal: true,
      notes: {
        time: '2 min',
        say: 'Recall L07: with disjoint real and fake data, JS is log 2 whether the fakes are close or far. Ask what property the replacement must have before revealing.',
        ask: 'What would a better distance do as the fakes move closer?',
      },
      render: ({ revealed }) => (
        <Predict
          revealed={revealed}
          question="What must a better distance do?"
          facts={['Real and fake piles do not overlap', 'JS = log 2 ≈ 0.693 — near or far', 'G gets no sense of “closer”']}
          answer={<Answer verdict="Shrink as the fakes move closer" points={['Keep changing even with zero overlap', 'Give G a slope to follow all the way to 0', <>That distance is <b>Wasserstein-1</b> — the earth mover’s distance</>]} />}
        />
      ),
    },

    /* ---------------- Earth mover's distance ---------------- */
    {
      id: 'l08-sand',
      section: 'Earth mover',
      kicker: 'Two piles of sand',
      title: 'Distance = the least work to reshape one pile into the other',
      notes: {
        time: '2 min',
        say: 'Two piles of sand. Your job: reshape one to match the other. The minimum effort to do that IS the Wasserstein distance. This is the core idea of the entire lesson.',
        ask: 'If you had to move a pile of sand to a new location, how would you measure the work?',
      },
      render: () => (
        <>
          <svg className="l08-sand" viewBox="0 0 760 210" role="img" aria-label="A real pile on the left and a fake pile on the right, with arrows moving sand between them">
            <path d="M60 170 Q150 40 240 170 Z" fill="#e8edff" stroke="#3157d5" strokeWidth="3" />
            <path d="M520 170 Q610 70 700 170 Z" fill="#fff0ed" stroke="#eb5a46" strokeWidth="3" />
            <line x1="40" x2="720" y1="170" y2="170" stroke="rgba(17,24,39,.3)" strokeWidth="2" />
            <path d="M520 120 C440 60 320 60 250 110" fill="none" stroke="#111827" strokeWidth="3" strokeDasharray="8 7" markerEnd="url(#l08-arrow)" />
            <defs><marker id="l08-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="8" markerHeight="8" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#111827" /></marker></defs>
            <text x="150" y="196" textAnchor="middle" className="l08-sand-label">real pile · P_r</text>
            <text x="610" y="196" textAnchor="middle" className="l08-sand-label">fake pile · P_g</text>
            <text x="385" y="52" textAnchor="middle" className="l08-sand-label">move sand: amount × distance</text>
          </svg>
          <Cards cols={3} items={[
            { tag: 'Cost', title: 'Amount × distance', body: 'Moving more sand, or moving it farther, costs more.', tone: 'blue' },
            { tag: 'Plan', title: 'Many ways to move it', body: 'Each plan says how much goes from where to where.', tone: 'violet' },
            { tag: 'Distance', title: 'The cheapest plan', body: 'Less work = closer distributions = better fakes.', tone: 'mint' },
          ]} />
        </>
      ),
    },
    {
      id: 'l08-w-terms',
      section: 'Earth mover',
      kicker: 'Formula · term by term',
      title: 'Wasserstein-1 is the cheapest average distance mass must travel',
      notes: {
        time: '3 min',
        say: 'Translate the sand picture into symbols: a plan, its cost, and the cheapest plan. Stress that W keeps growing with distance — unlike JS, which tops out at log 2.',
        ask: 'What is W if the two piles are identical?',
      },
      render: () => (
        <FormulaTerms
          smallSymbols
          symbolWidth="8rem"
          reading="W = the cheapest plan's average distance moved, over all plans that turn one pile into the other"
          formula={<><T tone="mint">W</T>(<T tone="blue">P_r</T>, <T tone="coral">P_g</T>)<Op>=</Op><T tone="yellow">inf</T><sub>γ ∈ Π</sub> <T tone="violet">E</T><sub>(x, y) ∼ γ</sub>[ ‖x − y‖ ]</>}
          terms={[
            { symbol: 'P_r, P_g', name: 'The two piles', meaning: 'Real and generated distributions', range: 'probability', tone: 'blue' },
            { symbol: 'γ', name: 'Transport plan', meaning: 'How much mass goes from each x to each y', range: 'a table', tone: 'violet' },
            { symbol: 'Π(P_r, P_g)', name: 'All valid plans', meaning: 'Start as one pile, end exactly as the other', range: 'many', tone: 'violet' },
            { symbol: '‖x − y‖', name: 'Distance moved', meaning: 'Cost of moving one unit of mass', range: '≥ 0', tone: 'plain' },
            { symbol: 'E[…]', name: 'Average cost', meaning: 'Distance weighted by mass moved', range: '≥ 0', tone: 'plain' },
            { symbol: 'inf', name: 'Cheapest plan', meaning: 'The plan with the lowest average cost', range: 'one number', tone: 'yellow' },
          ]}
        />
      ),
    },
    {
      id: 'l08-w-steps',
      section: 'Earth mover',
      kicker: 'Formula · worked',
      title: 'Two small piles: the cheaper plan wins, so W = 2',
      notes: {
        time: '3 min',
        say: 'Compute both plans. W is the cheaper one. Then compare with JS: the piles never overlap, so JS is stuck at log 2 here exactly as in L07. In 1-D, matching the piles in sorted order is always cheapest.',
        ask: 'If the fake at 5 moved to 3, what would W become?',
      },
      render: () => (
        <FormulaSteps
          given={['real: ½ at 0, ½ at 2', 'fake: ½ at 1, ½ at 5']}
          steps={[
            { math: <>A: 1 → 0, 5 → 2 ⇒ ½·1 + ½·3 = 2.0</>, note: 'each fake to the nearer real spot' },
            { math: <>B: 1 → 2, 5 → 0 ⇒ ½·1 + ½·5 = 3.0</>, note: 'a worse plan' },
            { math: <>W = min(2.0, 3.0) = 2.0</>, note: 'inf = take the cheapest plan' },
            { math: <>JS = log 2 ≈ 0.693</>, note: 'no overlap — JS cannot tell 2 from 200' },
          ]}
          result={<>W = 2.0 — and it shrinks smoothly as the fake pile moves closer</>}
        />
      ),
    },
    {
      id: 'l08-emd-lab',
      section: 'Earth mover',
      kicker: 'Live · slide the fake pile',
      title: 'W tracks every move of the fake pile; JS only notices overlap',
      lab: true,
      notes: {
        time: '4 min',
        say: 'Start far away (θ = 7): W is 5.5, JS is log 2. Slide closer with no overlap (θ = 1.5): W falls to 0.5, JS still log 2. Only when the piles share positions (θ = 1) does JS move. Switch to the curve view: W is a slope to follow; JS is flat with spikes.',
        ask: 'Which number would you rather give G as its learning signal?',
      },
      render: () => <EmdLab />,
    },
    {
      id: 'l08-lines',
      section: 'Earth mover',
      kicker: 'The paper’s example',
      title: 'Parallel lines: JS is a step, W is a straight slope',
      notes: {
        time: '3 min',
        say: 'Arjovsky et al. Example 1: real mass on the line x = 0, fake mass on x = θ. Moving the fake line from θ = 100 to θ = 10 is real progress. JS says log 2 for every θ ≠ 0 and jumps to 0 only at θ = 0 — gradient zero. Wasserstein says |θ| — slope 1 everywhere.',
        ask: 'Which measurement would you rather follow downhill?',
      },
      render: () => (
        <>
          <Table
            headers={['Fake line at θ', 'JS divergence', 'Wasserstein-1']}
            rows={[
              ['θ = 100', 'log 2 = 0.693', 'W = 100'],
              ['θ = 50', 'log 2 = 0.693', 'W = 50'],
              ['θ = 10', 'log 2 = 0.693', 'W = 10'],
              ['θ = 0', '0', 'W = 0'],
            ]}
            highlight={[3]}
            align={['left', 'center', 'center']}
          />
          <Takeaway>JS is a step with zero gradient almost everywhere; <b>W = |θ|</b> has slope 1 all the way down.</Takeaway>
        </>
      ),
    },

    /* ---------------- The critic ---------------- */
    {
      id: 'l08-duality',
      section: 'The critic',
      kicker: 'From EMD to a network',
      title: 'Duality turns “search all plans” into “train one function”',
      notes: {
        time: '3 min',
        say: 'Searching transport plans is intractable for images. The Kantorovich–Rubinstein duality rewrites W as the largest gap E[f(real)] − E[f(fake)] over all functions with slope at most 1. We cannot search all f, so we train a neural network to be f. That network is the critic.',
        ask: 'What happens to the max gap if f is allowed any slope?',
      },
      render: () => (
        <>
          <Equation size="md" reading="Kantorovich–Rubinstein duality">
            <T tone="mint">W</T><Op>=</Op><T tone="yellow">max</T><sub>‖f‖<sub>L</sub> ≤ 1</sub> <T tone="blue">E<sub>x∼P_r</sub>[f(x)]</T><Op>−</Op><T tone="coral">E<sub>x∼P_g</sub>[f(x)]</T>
          </Equation>
          <Cards cols={3} items={[
            { tag: 'f = the critic C', title: 'A neural net', body: 'Trained to make the gap as large as possible.', tone: 'violet' },
            { tag: 'Raw score', title: 'No Sigmoid', body: 'f(x) can be any real number.', tone: 'blue' },
            { tag: 'Slope ≤ 1', title: 'Lipschitz', body: 'Without it the gap grows forever.', tone: 'coral' },
          ]} />
        </>
      ),
    },
    {
      id: 'l08-kr-terms',
      section: 'The critic',
      kicker: 'Formula · term by term',
      title: 'W is the biggest score gap a slope-limited critic can open',
      notes: {
        time: '3 min',
        say: 'The duality swaps an impossible search over transport plans for a search over functions — and a neural network is a function. That is why the critic exists.',
        ask: 'Why must the slope be limited — what would the gap do otherwise?',
      },
      render: () => (
        <FormulaTerms
          smallSymbols
          symbolWidth="8rem"
          reading="W equals the biggest gap in average score that any slope-limited function can open between real and fake"
          formula={<><T tone="mint">W</T><Op>=</Op><T tone="yellow">sup</T><sub>‖f‖<sub>L</sub> ≤ 1</sub> <T tone="blue">E<sub>x∼P_r</sub>[f(x)]</T><Op>−</Op><T tone="coral">E<sub>x∼P_g</sub>[f(x)]</T></>}
          terms={[
            { symbol: 'f', name: 'The critic C', meaning: 'Any function that scores an image', range: '−∞ … ∞', tone: 'violet' },
            { symbol: '‖f‖_L ≤ 1', name: '1-Lipschitz', meaning: '|f(x) − f(y)| ≤ ‖x − y‖', range: 'slope ≤ 1', tone: 'coral' },
            { symbol: 'E_r[f(x)]', name: 'Average real score', meaning: 'Critic’s mean on real images', range: 'a number', tone: 'blue' },
            { symbol: 'E_g[f(x)]', name: 'Average fake score', meaning: 'Critic’s mean on G’s images', range: 'a number', tone: 'coral' },
            { symbol: 'sup', name: 'Best critic', meaning: 'Training C approximates it', range: 'maximum', tone: 'yellow' },
            { symbol: 'W', name: 'Result', meaning: 'Same W as moving sand', range: '≥ 0', tone: 'mint' },
          ]}
        />
      ),
    },
    {
      id: 'l08-kr-steps',
      section: 'The critic',
      kicker: 'Formula · worked',
      title: 'A slope-1 critic recovers W = 2 on the same piles',
      notes: {
        time: '3 min',
        say: 'Reuse the same two piles. A simple slope-1 critic already reaches the transport answer. Then show why the Lipschitz rule matters: an unconstrained critic just scales itself up.',
        ask: 'Without any slope limit, how large could the gap get?',
      },
      render: () => (
        <FormulaSteps
          given={['real: ½ at 0, ½ at 2', 'fake: ½ at 1, ½ at 5', 'critic f(x) = −x (slope 1)']}
          steps={[
            { math: <>E_r[f] = −(½·0 + ½·2) = −1.0</>, note: 'average real score' },
            { math: <>E_g[f] = −(½·1 + ½·5) = −3.0</>, note: 'average fake score' },
            { math: <>gap = −1.0 − (−3.0) = 2.0</>, note: 'equals the cheapest plan' },
            { math: <>f(x) = −2x → gap = 4.0</>, note: 'slope 2 breaks the rule: double f, double the gap' },
          ]}
          result={<>With slope ≤ 1 the best gap is exactly W = 2.0</>}
        />
      ),
    },
    {
      id: 'l08-critic-vs-d',
      section: 'The critic',
      kicker: 'Critic vs discriminator',
      title: 'A bouncer says yes or no; a food critic gives a score',
      notes: {
        time: '3 min',
        say: 'Standard GAN: Sigmoid squashes to a probability. WGAN: the critic is the function f from the duality — any number, no Sigmoid. Only the gap between average real and average fake scores means anything; adding 100 to every score changes nothing.',
        ask: 'What is the difference between a bouncer and a food critic?',
      },
      render: () => (
        <>
          <Versus
            left={{ tag: 'Discriminator D', title: 'Real or fake?', body: <ul><li>Output: probability in [0, 1]</li><li>Last layer: Sigmoid</li><li>Confident D → saturated signal</li></ul>, tone: 'coral' }}
            right={{ tag: 'Critic C', title: 'How real does it look?', body: <ul><li>Output: any number</li><li>Last layer: Linear, no Sigmoid</li><li>Scores −50 or +200 still have gradients</li></ul>, tone: 'blue' }}
          />
          <Takeaway>Only <b>differences</b> in critic scores matter — adding 100 to every score changes nothing.</Takeaway>
        </>
      ),
    },

    /* ---------------- The WGAN loss ---------------- */
    {
      id: 'l08-critic-loss',
      section: 'WGAN loss',
      kicker: 'Critic loss',
      title: 'The critic pushes real scores up and fake scores down',
      notes: {
        time: '3 min',
        say: 'Critic loss: give high scores to real, low scores to fake. That is it. No BCE, no labels. The critic maximizes the gap, so we minimize its negative.',
        ask: 'Can you see how this is simpler than BCE?',
      },
      render: () => (
        <>
          <Equation size="md" reading="critic loss = average fake score − average real score  (minimizing it maximizes the gap ≈ W)">
            <T tone="violet">L_C</T><Op>=</Op><T tone="coral">E[C(G(z))]</T><Op>−</Op><T tone="blue">E[C(x)]</T>
          </Equation>
          <Split ratio="1fr 1.1fr" left={
            <Steps items={[
              { title: 'Make real scores HIGH', body: 'the − E[C(x)] term gets more negative', tone: 'blue' },
              { title: 'Make fake scores LOW', body: 'the E[C(G(z))] term gets smaller', tone: 'coral' },
            ]} />
          } right={<Code title="PyTorch" code={`loss_C = critic(fake).mean() - critic(real).mean()`} />} />
        </>
      ),
    },
    {
      id: 'l08-gen-loss',
      section: 'WGAN loss',
      kicker: 'Generator loss',
      title: 'G only wants the critic to score its fakes higher',
      notes: {
        time: '2 min',
        say: 'Generator loss: make the critic give high scores to fakes. One line of code. The minus sign turns “maximize the fake score” into something we can minimize.',
        ask: 'Why is there a minus sign in front?',
      },
      render: () => (
        <>
          <Equation size="md" reading="generator loss = minus the average critic score on fakes">
            <T tone="mint">L_G</T><Op>=</Op>−<T tone="coral">E[C(G(z))]</T>
          </Equation>
          <Split ratio="1fr 1fr" left={<Code title="PyTorch" code={`loss_G = -critic(fake).mean()`} />} right={
            <Cards cols={1} items={[{ tag: 'Compared with Unit 1', title: 'No BCELoss · no labels · no Sigmoid', body: 'Just means and minus signs.', tone: 'mint' }]} />
          } />
        </>
      ),
    },
    {
      id: 'l08-loss-steps',
      section: 'WGAN loss',
      kicker: 'Formula · worked',
      title: 'One batch: the critic loss is −3, so the W estimate is 3',
      notes: {
        time: '3 min',
        say: 'Two lines of code, worked by hand. Watch the sign: the critic loss is negative; its negative is the W estimate, and that estimate shrinks as the fakes get better.',
        ask: 'If the plotted critic loss climbs from −3.0 toward 0, is training going well or badly?',
      },
      render: () => (
        <FormulaSteps
          given={['C(real) = 2.0, 1.0, 3.0', 'C(fake) = −1.0, 0.0, −2.0']}
          steps={[
            { math: <>E[C(x)] = 2.0 · E[C(G(z))] = −1.0</>, note: 'mean scores' },
            { math: <>L_C = −1.0 − 2.0 = −3.0</>, note: 'critic minimizes this' },
            { math: <>W estimate = −L_C = 3.0</>, note: 'the real–fake gap' },
            { math: <>L_G = −(−1.0) = 1.0</>, note: 'G pushes fake scores up' },
            { math: <>later: E[C(G(z))] = 1.5 → L_C = −0.5</>, note: 'fakes improved: W estimate 0.5' },
          ]}
          result={<>−L_C tracks W and falls toward 0 as G improves</>}
        />
      ),
    },
    {
      id: 'l08-compare',
      section: 'WGAN loss',
      kicker: 'Side by side',
      title: 'WGAN changes the network, the loss, the optimizer and the ratio',
      notes: {
        time: '2 min',
        say: 'Every row is a difference. Emphasize the output, the activation, the ratio, and the relationship with D strength.',
        ask: 'Which change surprises you the most?',
      },
      render: () => (
        <Table
          compact
          headers={['', 'BCE GAN', 'WGAN']}
          rows={[
            ['Network', 'Discriminator (classifier)', 'Critic (scorer)'],
            ['Output', 'Probability [0, 1]', 'Score (−∞, +∞)'],
            ['Last layer', 'Sigmoid', 'None (linear)'],
            ['Loss', 'BCELoss', 'Mean subtraction'],
            ['Optimizer', 'Adam', 'RMSprop'],
            ['D : G steps', '1 : 1', '5 : 1'],
            ['Very strong D / C', 'Bad — useless signal', 'Good — better W estimate'],
            ['Loss curve', 'Tracks the fight, not quality', '−L_C ≈ W, follows quality'],
            ['Constraint', 'None', 'Lipschitz (weight clipping)'],
          ]}
        />
      ),
    },

    /* ---------------- Lipschitz ---------------- */
    {
      id: 'l08-speed-limit',
      section: 'Lipschitz',
      kicker: 'The speed limit',
      title: 'The critic may not change faster than its input',
      notes: {
        time: '3 min',
        say: '1-Lipschitz means: move the input a little, the output moves at most the same amount. Without it the critic just scales itself up and the gap becomes infinite.',
        ask: 'What would happen if a food critic gave scores of +1 million and −1 million?',
      },
      render: () => (
        <>
          <Equation size="md" reading="the change in score is at most the change in input">
            |<T tone="violet">C</T>(x₁) − <T tone="violet">C</T>(x₂)|<Op>≤</Op>‖x₁ − x₂‖
          </Equation>
          <Versus
            left={{ tag: 'Without the limit', title: 'Gap → ∞', body: <ul><li>C(real) = +1,000,000</li><li>C(fake) = −1,000,000</li><li>Scale C by 10 → gap × 10</li></ul>, tone: 'coral' }}
            right={{ tag: 'With 1-Lipschitz', title: 'Gap = W', body: <ul><li>C(real) = +3.2</li><li>C(fake) = −1.5</li><li>The best such gap is W (the duality)</li></ul>, tone: 'mint' }}
          />
        </>
      ),
    },
    {
      id: 'l08-clip-lab',
      section: 'Lipschitz',
      kicker: 'Live · cap the slope',
      title: 'Clipping caps the slope, so the best gap is K·W — not infinity',
      lab: true,
      notes: {
        time: '4 min',
        say: 'Same two piles, a one-weight critic C(x) = w·x. With clipping, press Best critic: w = −c and the gap is exactly 2c = c·W. Change c and the gap scales with it — a scaled W, fine for gradients. Switch to No clipping and drag w: the gap grows without limit.',
        ask: 'Why is a gap of 2c still useful to G even though it is not exactly W?',
      },
      render: () => <ClipLab />,
    },
    {
      id: 'l08-clipping',
      section: 'Lipschitz',
      kicker: 'Weight clipping',
      title: 'WGAN enforces the limit by clamping every critic weight',
      notes: {
        time: '3 min',
        say: 'The paper clamps every critic weight to [−0.01, 0.01] after each update. Bounded weights make C K-Lipschitz for some K that depends on c and the architecture — so we estimate K·W, which is fine for gradients. The authors themselves call clipping a clearly terrible way to enforce the constraint.',
        ask: 'If you limit a painter to only two colors, how good can the painting be?',
      },
      render: () => (
        <Split ratio="1.1fr 1fr" left={
          <Stack gap="md">
            <Code title="after every critic update" code={`for p in critic.parameters():
    p.data.clamp_(-0.01, 0.01)`} />
            <Takeaway>Bounded weights → C is K-Lipschitz → the critic estimates <b>K·W</b>.</Takeaway>
          </Stack>
        } right={
          <Table
            compact
            headers={['Paper setting', 'Value']}
            rows={[['Clip c', '0.01'], ['n_critic', '5 critic steps per G step'], ['Optimizer', 'RMSprop, lr = 5e-5'], ['Batch size', '64']]}
          />
        } />
      ),
    },
    {
      id: 'l08-so-far',
      section: 'Lipschitz',
      kicker: 'So far',
      title: 'Six ideas carry the whole of WGAN',
      notes: {
        time: '1.5 min',
        say: 'Pause and recap before the training loop. Ask learners to explain each row in their own words.',
        ask: 'Can you explain each row in your own words?',
      },
      render: () => (
        <Table
          headers={['Concept', 'Key idea']}
          rows={[
            ['Earth mover’s distance', 'Least work to reshape one pile into another — shrinks even without overlap'],
            ['KR duality', 'W = max gap E[f(real)] − E[f(fake)] over slope-≤1 functions f'],
            ['Critic', 'A network playing f — unbounded score, no Sigmoid'],
            ['WGAN loss', 'C maximizes the gap; G maximizes its fake scores'],
            ['Lipschitz constraint', 'The critic cannot change faster than its input'],
            ['Weight clipping', 'Brute force: clamp weights to [−c, c] after every update'],
          ]}
        />
      ),
    },

    /* ---------------- Training ---------------- */
    {
      id: 'l08-ratio',
      section: 'Training',
      kicker: 'Train the critic more',
      title: 'In WGAN a stronger critic is better — the opposite of Unit 1',
      notes: {
        time: '3 min',
        say: 'In BCE GANs we limit D. In WGAN we train C toward optimality: the gap is only W when C is near the best slope-limited function, and W stays informative even when C is perfect. n_critic = 5 in the paper; it even uses 100 critic steps early on and every 500 generator steps.',
        ask: 'Why is “stronger D is better” such a game-changer?',
      },
      render: () => (
        <Versus
          left={{ tag: 'BCE GAN · 1 : 1', title: 'Train D once, G once', body: <ul><li>D too strong → JS stuck at log 2</li><li>G’s signal becomes useless</li></ul>, tone: 'coral' }}
          right={{ tag: 'WGAN · 5 : 1', title: 'Train C five times, G once', body: <ul><li>C closer to optimal → better W estimate</li><li>You WANT a powerful critic</li></ul>, tone: 'mint' }}
        />
      ),
    },
    {
      id: 'l08-rmsprop',
      section: 'Training',
      kicker: 'Optimizer',
      title: 'RMSprop, not Adam: momentum fights a moving target',
      notes: {
        time: '1.5 min',
        say: 'With momentum-based optimizers like Adam (β1 = 0.5) WGAN training sometimes became unstable — the critic loss is non-stationary and the momentum direction stopped agreeing with the gradient. RMSprop has no momentum and does well on non-stationary problems, so they used it with lr 5e-5. WGAN-GP brings Adam back with β1 = 0.',
        ask: 'Why would momentum be a problem when the critic’s target keeps moving?',
      },
      render: () => (
        <Split ratio="1fr 1.1fr" left={
          <Steps items={[
            { title: 'Paper: Adam made training unstable', body: 'momentum kept pushing in an old direction', tone: 'coral' },
            { title: 'The critic’s target keeps moving', body: 'a non-stationary problem', tone: 'violet' },
            { title: 'RMSprop: per-weight steps, no momentum', body: 'behaves well there', tone: 'mint' },
          ]} />
        } right={
          <Stack gap="md">
            <Code title="lab-08" code={`opt_C = torch.optim.RMSprop(critic.parameters(), lr=5e-5)
opt_G = torch.optim.RMSprop(gen.parameters(),    lr=5e-5)`} />
            <Takeaway>WGAN-GP (L09) brings Adam back — with <b>β₁ = 0</b>, no momentum.</Takeaway>
          </Stack>
        } />
      ),
    },
    {
      id: 'l08-loop',
      section: 'Training',
      kicker: 'The training loop',
      title: 'Five clipped critic steps, then one generator step',
      notes: {
        time: '2.5 min',
        say: 'This is lab-08’s loop. Critic first, five times, clamping weights after every step. Then one generator step. Note the sign: we minimize critic(fake) − critic(real). The paper draws a fresh real batch for every critic step; reusing one batch five times, as here, is a common simplification.',
        ask: 'Where exactly does the weight clipping go — before or after opt_C.step()?',
      },
      render: () => (
        <Code
          title="lab-08-wgan.ipynb · training loop (optimizers from the previous slide)"
          code={`for real, _ in loader:
    real = real.to(device); bs = real.size(0)
    for _ in range(5):                                  # n_critic = 5
        z = torch.randn(bs, z_dim, device=device)
        fake = gen(z).detach()
        loss_C = critic(fake).mean() - critic(real).mean()
        opt_C.zero_grad(); loss_C.backward(); opt_C.step()
        for p in critic.parameters():
            p.data.clamp_(-0.01, 0.01)                  # weight clipping

    z = torch.randn(bs, z_dim, device=device)
    loss_G = -critic(gen(z)).mean()
    opt_G.zero_grad(); loss_G.backward(); opt_G.step()`}
          marks={{ 3: 'violet', 6: 'blue', 9: 'coral', 12: 'mint' }}
          notes={{ 3: 'critic trains 5×', 6: 'E[C(fake)] − E[C(real)]', 9: 'clip after each step', 12: 'G: raise fake scores' }}
        />
      ),
    },
    {
      id: 'l08-curve',
      section: 'Training',
      kicker: 'A meaningful loss',
      title: 'For the first time, the loss curve tells you if images improve',
      notes: {
        time: '2 min',
        say: 'Careful with the sign: the critic loss is E[C(fake)] − E[C(real)] = −(W estimate). Plot −C_loss. As samples improve, the W estimate shrinks, so C_loss rises toward 0. The numbers are illustrative; the scale depends on the critic and the clip value, so compare within one run.',
        ask: 'In your Unit 1 BCE GAN, could you tell from the loss if images were getting better?',
      },
      render: () => (
        <>
          <Versus
            left={{ tag: 'BCE GAN · illustrative', title: 'G loss wobbles in a band', body: <ul><li>Epoch 10: 0.9</li><li>Epoch 30: 1.4</li><li>Epoch 50: 0.8</li></ul>, tone: 'coral' }}
            right={{ tag: 'WGAN · illustrative', title: 'W estimate = −C_loss shrinks', body: <ul><li>Epoch 10: 0.89</li><li>Epoch 30: 0.57</li><li>Epoch 50: 0.23</li></ul>, tone: 'mint' }}
          />
          <Takeaway>Plot <b>−C_loss</b>: falling = images improving. Compare within one run — the scale depends on c.</Takeaway>
        </>
      ),
    },
    {
      id: 'l08-clip-problems',
      section: 'Training',
      kicker: 'The catch',
      title: 'Weight clipping works, but it cripples the critic',
      notes: {
        time: '2 min',
        say: 'Measured in the WGAN-GP paper (Gulrajani et al. 2017, Fig. 1): weights pile up at ±c, the critic learns overly simple functions, and with c = 0.001 gradients vanish while with c = 0.1 they explode through the layers. This sets up L09.',
        ask: 'What would happen if you could only use the numbers −0.01 and +0.01 to represent everything?',
      },
      render: () => (
        <>
          <Cards cols={3} items={[
            { tag: 'Capacity loss', title: 'Weights pile up at ±c', body: 'The critic learns overly simple functions.', tone: 'coral' },
            { tag: 'Sensitive to c', title: '0.001 vanishes · 0.1 explodes', body: 'Gradients shrink or blow up through the layers.', tone: 'violet' },
            { tag: 'Slow', title: 'Slow to converge', body: 'Large c: the critic takes long to reach its optimum.', tone: 'yellow' },
          ]} />
          <Takeaway>The fix: replace clipping with a <b>gradient penalty</b> — that is L09, WGAN-GP.</Takeaway>
        </>
      ),
    },
    {
      id: 'l08-lab',
      section: 'Training',
      kicker: 'Lab demo',
      title: 'Run lab-08: turn the Unit 1 GAN into a WGAN and read its loss',
      notes: {
        time: '5 min',
        say: 'Run the setup and model cells, start the training loop (25 epochs; on a laptop CPU the notebook trains on a 10k subset). While it runs, read the printed C_loss lines and flip the sign: −C_loss is the W estimate. Then run the two experiments: no clipping (scores blow up) and the weight histogram (weights piled at ±0.01).',
        ask: 'Before we run the no-clipping experiment: what do you expect the critic scores to do?',
      },
      render: () => (
        <LabDemo
          notebook="lab-08-wgan.ipynb"
          goal="Turn Unit 1’s GAN into a WGAN — critic, Wasserstein loss, clipping, 5 : 1 — and read its loss."
          steps={[
            <>Parts 1–2: data, <b>Critic</b> and Generator — the critic ends in <code>Linear(…, 1)</code>, no Sigmoid</>,
            <>Part 3: training loop — RMSprop <code>5e-5</code>, <code>n_critic = 5</code>, clip <code>0.01</code></>,
            <>Parts 4–5: the loss curve and generated digits</>,
            <>Parts 6–7: without weight clipping, then the weight histogram</>,
          ]}
          watch={[
            <><b>−C_loss</b> (the W estimate) shrinks as digits sharpen</>,
            <>No clipping: printed critic scores <b>grow without bound</b></>,
            <>Histogram: big spikes at exactly <b>±0.01</b></>,
          ]}
          yourTurn={<>Set <code>clip_value</code> to 0.1 and 0.001. Which stops learning, and which goes unstable?</>}
        />
      ),
    },

    /* ---------------- Check ---------------- */
    {
      id: 'l08-summary',
      section: 'Check',
      kicker: 'Lesson 08 summary',
      title: 'Three ideas to keep from WGAN',
      notes: {
        time: '1.5 min',
        say: 'Earth mover’s distance fixes the gradient problem. The critic replaces the discriminator. And for the first time, the loss tells you if training is working.',
        ask: 'Which concept was the biggest “aha” moment?',
      },
      render: () => (
        <Recap items={[
          <><b>Earth mover’s distance</b> shrinks as fakes move closer, even without overlap — and via KR duality a critic can estimate it.</>,
          <><b>Critic, not discriminator</b>: no Sigmoid, unbounded score, slope ≤ 1 — and trained hard, 5 critic steps per G step.</>,
          <><b>Meaningful loss</b>: −C_loss ≈ W shrinks as images improve — you can finally track progress.</>,
        ]} />
      ),
    },
    {
      id: 'l08-check',
      section: 'Check',
      kicker: 'Knowledge check',
      title: 'Can you read a WGAN like an expert?',
      reveal: true,
      notes: {
        time: '4 min',
        say: 'Let them think before revealing. Q2 catches the most common WGAN bug: reading the critic loss with the wrong sign.',
        ask: 'Try to answer each one before revealing.',
      },
      render: ({ revealed }) => (
        <Quiz revealed={revealed} cols={2} items={[
          { q: 'Unit 1: keep D from getting too strong. WGAN: train C 5× more. Why opposite advice?', a: 'A near-perfect D measures JS — stuck at log 2. A near-optimal C measures W — still shrinking as fakes approach.' },
          { q: 'Your critic loss goes −0.9 → −0.6 → −0.2. Better or worse?', a: 'Better. C_loss = −W estimate, so W fell from 0.9 to 0.2 — the distributions got closer.' },
          { q: 'Remove clipping entirely. Why is the “distance” meaningless, not just noisy?', a: 'Without a slope limit, doubling C doubles the gap — the max is ∞ for any two different distributions.' },
          { q: 'Why does the critic have no Sigmoid?', a: 'It plays f in the duality: any real score. Only score differences matter, and there is nothing to saturate.' },
        ]} />
      ),
    },
    {
      id: 'l08-bridge',
      section: 'Check',
      kicker: 'Next lesson',
      title: 'Clipping is a blunt tool — can we limit the slope directly?',
      layout: 'bridge',
      notes: {
        time: '1 min',
        say: 'WGAN’s idea is brilliant, but weight clipping is a blunt tool. L09 replaces it with a gradient penalty — the critic gets its full capacity back, and Adam returns with β1 = 0.',
        ask: 'If the rule is “slope ≤ 1”, what could we measure and penalize directly?',
      },
      render: () => (
        <Bridge
          done="L08 · complete — you can build and read a WGAN"
          question="Clipping is a blunt tool — can we limit the slope directly?"
          next="L09 · WGAN-GP — gradient penalty"
        />
      ),
    },
  ],
};
