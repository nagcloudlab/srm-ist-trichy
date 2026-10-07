import './l09.css';
import { Answer, Bridge, Cards, Code, Divider, Equation, Flow, FormulaSteps, FormulaTerms, LabDemo, Predict, Quiz, Recap, Split, Stack, Steps, T, Table, Takeaway, Versus } from '../components/kit';
import { Plot, type Pt } from '../components/art';
import { InterpLab, PenaltyLab } from '../labs/D2L09Labs';
import type { Part } from '../types';

/* ---------- local visuals ---------- */

/** Illustrative weight histograms: clipping piles weights on ±c, a penalty lets them spread. */
function WeightHistograms() {
  const bins = 31;
  const clip = Array.from({ length: bins }, (_, i) => (i === 0 || i === bins - 1 ? 1 : i === 1 || i === bins - 2 ? 0.18 : 0.04 + 0.03 * Math.exp(-(((i - 15) / 6) ** 2))));
  const gp = Array.from({ length: bins }, (_, i) => Math.exp(-(((i - 15) / 6.5) ** 2)));
  const bars = (vals: number[], color: string) => (
    <svg viewBox="0 0 310 120" role="img" aria-hidden="true">
      <line x1="0" y1="110" x2="310" y2="110" stroke="rgba(17,24,39,.25)" />
      {vals.map((v, i) => <rect key={i} x={i * 10 + 1} y={110 - v * 100} width="8" height={v * 100} rx="1.5" fill={color} />)}
    </svg>
  );
  return (
    <div className="l09-hist">
      <figure>
        <figcaption><b>WGAN · weight clipping</b><span>L08</span></figcaption>
        {bars(clip, '#eb5a46')}
        <p>Weights pile up on the walls at −0.01 and +0.01</p>
      </figure>
      <figure>
        <figcaption><b>WGAN-GP · gradient penalty</b><span>L09</span></figcaption>
        {bars(gp, '#277a59')}
        <p>Weights spread naturally — the critic keeps its capacity</p>
      </figure>
    </div>
  );
}

const op = (s: string) => <span className="op">{s}</span>;

/* ---------- slides ---------- */

export const l09Part: Part = {
  id: 'l09',
  code: 'L09',
  label: 'WGAN-GP',
  title: 'WGAN-GP: enforce the slope rule directly, not by clipping',
  when: '',
  minutes: 0,
  slides: [
    {
      id: 'l09-divider',
      section: 'Open',
      kicker: 'Lesson 09 · Gulrajani et al., 2017',
      title: 'WGAN-GP: Gradient Penalty',
      layout: 'divider',
      notes: {
        time: '1 min',
        say: 'We fixed the loss in L08. Now we fix how we enforce the constraint. Weight clipping was a blunt hammer — the gradient penalty is a scalpel.',
        ask: 'What frustrated you most about weight clipping in L08?',
      },
      render: () => (
        <Divider
          code="L09"
          title="WGAN-GP: Gradient Penalty"
          promise="Same Lipschitz goal as L08 — enforced directly, where it matters, without crushing the critic."
          items={['Why clipping fails', 'The gradient penalty', 'The interpolation trick', 'autograd.grad', 'No BatchNorm in the critic', 'Adam returns']}
        />
      ),
    },

    /* ---------- clipping's problem ---------- */
    {
      id: 'l09-clip-vs-gp',
      section: 'Clipping',
      kicker: 'The problem we need to fix',
      title: 'Clipping crushes weights to the wall — a penalty lets them spread',
      notes: {
        time: '2 min',
        say: 'Weight clipping crushes all weights to the boundaries. Imagine a painter who can only use two colours — that is what we did to our critic. The gradient penalty gives it the full palette back. These histograms are illustrative; lab-09 prints the real ones.',
        ask: 'If you could only use two extreme values for every parameter, how expressive could your network be?',
      },
      render: () => (
        <>
          <WeightHistograms />
          <Takeaway>Clipping: “clip every weight to [−0.01, +0.01]”. Penalty: “weights can be anything — just don’t let the slope get too steep”.</Takeaway>
        </>
      ),
    },
    {
      id: 'l09-three-problems',
      section: 'Clipping',
      kicker: 'Recap of L08',
      title: 'Weight clipping fails in three ways',
      notes: {
        time: '2 min',
        say: 'Recap the three problems from L08. Each one matters. Capacity loss is the biggest — the critic becomes too simple to guide the generator.',
        ask: 'Which of these three problems do you think hurts image quality the most?',
      },
      render: () => (
        <>
          <Cards cols={3} items={[
            { tag: '1 · Capacity loss', title: 'The critic becomes too simple', body: 'Weights cluster at −c and +c — no nuance left', tone: 'coral' },
            { tag: '2 · Sensitive to c', title: 'No good value of c', body: <ul><li>c = 0.001 → gradients vanish</li><li>c = 0.1 → gradients explode</li></ul>, tone: 'yellow' },
            { tag: '3 · Slow convergence', title: 'More epochs, worse results', body: 'A restricted critic needs much longer to learn', tone: 'violet' },
          ]} />
          <Takeaway>What we actually want is <b>‖∇C‖ ≤ 1</b>. What if we enforce that directly?</Takeaway>
        </>
      ),
    },
    {
      id: 'l09-lipschitz',
      section: 'Clipping',
      kicker: 'The real goal · term by term',
      title: '1-Lipschitz means the critic’s score can never change faster than its input',
      notes: {
        time: '2 min',
        say: 'This is what we actually care about. The 1-Lipschitz rule means the critic cannot change its score too fast. In calculus terms: the gradient norm is at most 1 everywhere. Weight clipping was an indirect way to get there; the penalty is the direct way.',
        ask: 'In your own words, what does “gradient norm ≤ 1” mean for the critic?',
      },
      render: () => (
        <Split ratio="1.25fr 1fr" left={
          <FormulaTerms
            smallSymbols
            symbolWidth="11rem"
            reading="the score difference is never larger than the input distance"
            formula={<><span>|</span><T tone="violet">C(x₁)</T>{op('−')}<T tone="violet">C(x₂)</T><span>|</span>{op('≤')}<T tone="blue">‖x₁ − x₂‖</T></>}
            terms={[
              { symbol: '|C(x₁) − C(x₂)|', name: 'Score change', meaning: 'How much the critic’s score moves', range: '≥ 0', tone: 'violet' },
              { symbol: '‖x₁ − x₂‖', name: 'Input change', meaning: 'How far apart the two images are', range: '≥ 0', tone: 'blue' },
              { symbol: '‖∇C‖ ≤ 1', name: 'Same rule, locally', meaning: 'The slope is at most 1 everywhere', range: '0 … 1', tone: 'mint' },
            ]}
          />
        } right={
          <Plot
            ariaLabel="A gentle critic with slope at most 1 versus a cliff with slope up to 12"
            x={[-2, 2]} y={[-3.4, 3.4]} xTicks={[-2, -1, 0, 1, 2]} yTicks={[-3, 0, 3]}
            xLabel="input" yLabel="critic score" height={300}
            lines={[
              { f: (v) => 0.8 * v, color: '#277a59', label: 'slope 0.8 ✓' },
              { f: (v) => 3 * Math.tanh(4 * v), color: '#eb5a46', label: 'cliff ✗' },
            ]}
          />
        } />
      ),
    },

    /* ---------- the penalty ---------- */
    {
      id: 'l09-gp-idea',
      section: 'The penalty',
      kicker: 'The idea',
      title: 'Add a penalty to the loss instead of clipping the weights',
      notes: {
        time: '2 min',
        say: 'Here is the key insight. Instead of clipping weights (indirect), we add a penalty term to the loss (direct). If the gradient norm strays from 1, the critic pays a cost. Walk the four steps of computing it.',
        ask: 'Why is “add a penalty to the loss” more flexible than “clip the weights”?',
      },
      render: () => (
        <Split ratio="1fr 1fr" align="start" left={
          <Versus
            left={{ tag: 'WGAN · L08', title: 'Clip after every step', body: <ul><li>L_C = C(fake).mean() − C(real).mean()</li><li>then clamp every weight to [−c, c]</li></ul>, tone: 'coral' }}
            right={{ tag: 'WGAN-GP · L09', title: 'Penalize in the loss', body: <ul><li>L_C = C(fake).mean() − C(real).mean() + λ·GP</li><li>no clipping at all</li></ul>, tone: 'mint' }}
          />
        } right={
          <Steps items={[
            { title: 'Pick a point x̂', body: 'between a real and a fake image', tone: 'blue' },
            { title: 'Compute ∇C(x̂)', body: 'the critic’s gradient with respect to that input', tone: 'violet' },
            { title: 'Measure its length', body: 'the L2 norm ‖∇C(x̂)‖₂', tone: 'violet' },
            { title: 'Penalize (length − 1)²', body: 'zero only when the slope is exactly 1', tone: 'coral' },
          ]} />
        } />
      ),
    },
    {
      id: 'l09-lambda',
      section: 'The penalty',
      kicker: 'λ · the penalty weight',
      title: 'λ = 10 is the paper’s default for every experiment',
      notes: {
        time: '2 min',
        say: 'Lambda = 10. The paper used λ = 10 for every experiment — toy data, CIFAR-10, LSUN, ResNets — and most later work kept it. Treat it as a default, not a law.',
        ask: 'What would happen if lambda were 0? What about 1000?',
      },
      render: () => (
        <>
          <Equation size="md" reading="fake score minus real score, plus ten times the gradient penalty">
            <span>L_C</span>{op('=')}<T tone="coral">C(fake)</T>{op('−')}<T tone="blue">C(real)</T>{op('+')}<T tone="violet">10</T><span>·</span><span>GP</span>
          </Equation>
          <Cards cols={3} items={[
            { tag: 'λ = 0', title: 'No constraint', body: 'Critic scores blow up — like the un-clipped critic in L08', tone: 'coral' },
            { tag: 'λ = 10', title: 'Paper default', body: 'Used for every experiment in the paper', tone: 'mint' },
            { tag: 'λ = 1000', title: 'Too strong', body: 'The critic chases the penalty and ignores real vs fake', tone: 'yellow' },
          ]} />
        </>
      ),
    },
    {
      id: 'l09-predict-two-sided',
      section: 'The penalty',
      kicker: 'Predict',
      title: 'Should a slope of 0.5 be penalized?',
      reveal: true,
      notes: {
        time: '2 min',
        say: 'Let learners commit. Lipschitz only forbids slopes above 1, so the natural guess is “no”. The paper’s Proposition 1 says the optimal critic has slope exactly 1 on lines joining real and fake — so the penalty is two-sided.',
        ask: 'Who said “no penalty for 0.5”? Why?',
      },
      render: ({ revealed }) => (
        <Predict
          revealed={revealed}
          question="Does WGAN-GP penalize a slope of 0.5?"
          facts={['Lipschitz only needs ‖∇C‖ ≤ 1', 'A slope of 0.5 already satisfies that', 'The penalty is (‖∇C‖ − 1)²']}
          answer={<Answer verdict="Yes — it costs 0.25" points={[
            <>(0.5 − 1)² = <b>0.25</b>, the same as a slope of 1.5</>,
            <>Prop. 1: the optimal critic has slope <b>exactly 1</b> between real and fake</>,
            'So the target is 1 — pushing toward it costs nothing at the optimum',
          ]} />}
        />
      ),
    },
    {
      id: 'l09-interp',
      section: 'Interpolation',
      kicker: 'Where we measure · term by term',
      title: 'Measure the slope on random points between real and fake',
      notes: {
        time: '2 min',
        say: 'We cannot check gradients everywhere. The paper’s trick: sample x̂ on straight lines between a real and a fake sample, with ε ~ U[0, 1], a fresh ε for each image. That is exactly the region the generator’s gradient travels through.',
        ask: 'Why would the region between real and fake be more important than random points in pixel space?',
      },
      render: () => (
        <FormulaTerms
          cols={2}
          symbolWidth="4.5rem"
          reading="x-hat is epsilon of the real image plus one minus epsilon of the fake"
          formula={<><T tone="yellow">x̂</T>{op('=')}<T tone="violet">ε</T><T tone="blue">x</T>{op('+')}<span>(1 −</span><T tone="violet">ε</T><span>)</span><T tone="coral">x̃</T><span>,</span>&nbsp;<T tone="violet">ε</T>{op('∼')}<span>U[0, 1]</span></>}
          terms={[
            { symbol: 'x', name: 'Real image', meaning: 'From the batch', range: '784 pixels', tone: 'blue' },
            { symbol: 'x̃', name: 'Fake image', meaning: 'G(z), detached', range: '784 pixels', tone: 'coral' },
            { symbol: 'ε', name: 'Mixing weight', meaning: '0 = all fake · 0.5 = halfway · 1 = all real', range: 'U[0, 1]', tone: 'violet' },
            { symbol: 'x̂', name: 'Interpolate', meaning: 'Where the critic’s slope is checked', range: 'on the line', tone: 'yellow' },
          ]}
        />
      ),
    },
    {
      id: 'l09-interp-lab',
      section: 'Interpolation',
      kicker: 'Live · slide along the line',
      title: 'Move x̂ along the line and watch the penalty respond',
      lab: true,
      notes: {
        time: '4 min',
        say: 'Two-pixel images so we can draw them. Plane critic with k = 2 and ε = 0.25 reproduces the worked example: x̂ = (−0.1, 0.5), gradient (1.2, 1.6), slope 2, penalty 1. Set k to 1 — the penalty vanishes. Switch to the wavy critic: now the slope changes along the line, and some ε values are penalized more than others — that is why we sample ε at random.',
        ask: 'With the wavy critic, why would sampling only ε = 0.5 be a bad idea?',
      },
      render: () => <InterpLab />,
    },
    {
      id: 'l09-loss-terms',
      section: 'Interpolation',
      kicker: 'The full critic loss · term by term',
      title: 'The WGAN-GP critic loss: L08’s loss plus a soft slope rule',
      notes: {
        time: '3 min',
        say: 'Every symbol in one place. The first two terms are unchanged from L08; the new part replaces weight clipping with a soft penalty measured at random interpolates.',
        ask: 'Why penalize slopes below 1 as well as above?',
      },
      render: () => (
        <FormulaTerms
          cols={2}
          smallSymbols
          symbolWidth="11rem"
          reading="fake score minus real score, plus lambda times the average squared distance of the slope from one"
          formula={<><span>L_C</span>{op('=')}<span>E[</span><T tone="coral">C(x̃)</T><span>]</span>{op('−')}<span>E[</span><T tone="blue">C(x)</T><span>]</span>{op('+')}<T tone="violet">λ</T><span>·E[(</span><T tone="mint">‖∇C(x̂)‖₂</T>{op('−')}<span>1)²]</span></>}
          terms={[
            { symbol: 'E[C(x̃)] − E[C(x)]', name: 'Wasserstein part', meaning: 'Exactly L08’s critic loss', range: '−∞ … ∞', tone: 'coral' },
            { symbol: 'x̂', name: 'Interpolate', meaning: 'Random point between real and fake', range: 'ε ∼ U[0, 1]', tone: 'yellow' },
            { symbol: '∇C(x̂)', name: 'Input gradient', meaning: 'How the score changes per pixel of x̂', range: '784 numbers', tone: 'violet' },
            { symbol: '‖ · ‖₂', name: 'Slope size', meaning: 'Length of that gradient vector', range: '≥ 0', tone: 'mint' },
            { symbol: '( … − 1)²', name: 'Penalty', meaning: '0 at slope 1 · grows above and below', range: '≥ 0', tone: 'mint' },
            { symbol: 'λ', name: 'Penalty weight', meaning: 'How hard slope 1 is enforced', range: '10 (paper)', tone: 'violet' },
          ]}
        />
      ),
    },
    {
      id: 'l09-loss-steps',
      section: 'Interpolation',
      kicker: 'The full critic loss · worked',
      title: 'On a batch of four, one steep sample dominates the penalty',
      notes: {
        time: '3 min',
        say: 'Walk one sample from interpolation to penalty, then average the batch. A single steep sample (slope 2) adds 2.5 of the 3.75 penalty — that is the force pushing slopes back toward 1. Slopes of 0.5 and 1.5 cost the same: the penalty is two-sided.',
        ask: 'Which sample would add nothing to the penalty, and why?',
      },
      render: () => (
        <FormulaSteps
          given={['ε = 0.25', 'x = (0.8, 0.2)', 'x̃ = (−0.4, 0.6)', 'slopes: 2, 1, 0.5, 1.5', 'E[C(x̃)] = −1 · E[C(x)] = 2', 'λ = 10']}
          steps={[
            { math: <>x̂ = 0.25·x + 0.75·x̃ = (−0.1, 0.5)</>, note: 'one interpolate (a 2-pixel image)' },
            { math: <>‖(1.2, 1.6)‖ = √(1.44 + 2.56) = 2.0</>, note: 'its slope' },
            { math: <>(2−1)², (1−1)², (0.5−1)², (1.5−1)²</>, note: '= 1, 0, 0.25, 0.25 · one per sample' },
            { math: <>GP = 1.5 / 4 = 0.375 → λ·GP = 3.75</>, note: 'average, then weight' },
            { math: <>L_C = −1 − 2 + 3.75</>, note: 'Wasserstein part + penalty' },
          ]}
          result={<>L_C = 0.75</>}
        />
      ),
    },
    {
      id: 'l09-penalty-lab',
      section: 'Interpolation',
      kicker: 'Live · how hard is each slope punished?',
      title: 'Two-sided: slopes too flat and too steep both pay',
      lab: true,
      notes: {
        time: '3 min',
        say: 'Drag the slope from 0 to 3. The two-sided penalty (WGAN-GP) is a parabola with its minimum at 1; the one-sided version ignores flat slopes. Then move λ: 0 switches the constraint off, large λ makes every deviation very expensive.',
        ask: 'At λ = 10, what does a slope of 0 cost? And a slope of 2?',
      },
      render: () => <PenaltyLab />,
    },

    /* ---------- in code ---------- */
    {
      id: 'l09-gp-code',
      section: 'In code',
      kicker: 'lab-09 · gradient_penalty',
      title: 'The penalty is four steps: interpolate, score, differentiate, penalize',
      notes: {
        time: '3 min',
        say: 'This is lab-09’s function. The trickiest part is torch.autograd.grad — it computes gradients of the score with respect to the INPUT, not the weights. That is unusual, but exactly what the penalty needs.',
        ask: 'Why do we need gradients with respect to the input image, not the weights?',
      },
      render: () => (
        <Code
          title="lab-09-wgan-gp.ipynb · gradient_penalty"
          code={`def gradient_penalty(critic, real, fake, device):
    bs = real.size(0)
    epsilon = torch.rand(bs, 1, 1, 1, device=device)   # one per image
    interpolated = (epsilon * real + (1 - epsilon) * fake).requires_grad_(True)
    scores = critic(interpolated)
    gradients = torch.autograd.grad(
        outputs=scores, inputs=interpolated,
        grad_outputs=torch.ones_like(scores),
        create_graph=True, retain_graph=True,
    )[0]
    gradients = gradients.view(bs, -1)
    return ((gradients.norm(2, dim=1) - 1) ** 2).mean()`}
          marks={{ 3: 'yellow', 4: 'yellow', 6: 'violet', 9: 'violet', 12: 'coral' }}
          notes={{ 3: '1 · ε ~ U[0, 1]', 4: '1 · x̂ on the line', 5: '2 · critic scores', 6: '3 · gradient w.r.t. the INPUT', 9: 'keep the graph for backward()', 11: 'one row per image', 12: '4 · (‖∇‖ − 1)², averaged' }}
        />
      ),
    },
    {
      id: 'l09-autograd',
      section: 'In code',
      kicker: 'autograd.grad vs backward()',
      title: 'autograd.grad asks how the score changes when a pixel wiggles',
      notes: {
        time: '2 min',
        say: 'This is the most confusing part for students. Normal backprop computes gradients of the loss with respect to WEIGHTS so we can update them. autograd.grad computes the gradient of the output with respect to the INPUT. create_graph=True lets us differentiate through that gradient later, because the penalty is part of the loss.',
        ask: 'What does create_graph=True enable that we couldn’t do without it?',
      },
      render: () => (
        <>
          <Versus
            left={{ tag: 'Normal backprop', title: 'loss.backward()', body: <ul><li>Gradients of the loss w.r.t. <b>weights</b></li><li>“How should I change the weights?”</li></ul>, tone: 'blue' }}
            right={{ tag: 'Gradient penalty', title: 'torch.autograd.grad(score, x̂)', body: <ul><li>Gradient of the score w.r.t. the <b>input</b></li><li>“How much does the score move when a pixel wiggles?”</li></ul>, tone: 'violet' }}
          />
          <Takeaway tone="coral">The penalty is part of the loss, so <b>loss_C.backward()</b> must differentiate through the gradient itself — <b>create_graph=True</b> keeps that graph.</Takeaway>
        </>
      ),
    },
    {
      id: 'l09-so-far',
      section: 'In code',
      kicker: 'So far',
      title: 'Five ideas carry the whole penalty',
      notes: {
        time: '1 min',
        say: 'Quick recap before the implementation changes. Make sure everyone has these locked in.',
        ask: 'Can you explain the interpolation trick in one sentence?',
      },
      render: () => (
        <Table
          headers={['Concept', 'Key idea']}
          rows={[
            ['Clipping’s problem', 'Crushes weights to the walls and kills critic capacity'],
            ['Gradient penalty', 'Add (‖∇C‖ − 1)² to the loss'],
            ['Interpolation', 'Check the slope at random points between real and fake'],
            ['autograd.grad', 'Gradient of the output w.r.t. the input, not the weights'],
            ['λ = 10', 'The paper’s default — rarely needs tuning'],
          ]}
        />
      ),
    },

    /* ---------- what changes ---------- */
    {
      id: 'l09-changes',
      section: 'What changes',
      kicker: 'WGAN → WGAN-GP',
      title: 'Switching to WGAN-GP changes five settings',
      notes: {
        time: '2 min',
        say: 'Five key changes. The BatchNorm one surprises people — it worked fine in WGAN, but the penalty needs each sample’s gradient to depend only on that sample. BatchNorm mixes samples, breaking that.',
        ask: 'Why does BatchNorm work fine in the generator but not the critic?',
      },
      render: () => (
        <Table
          headers={['Aspect', 'WGAN · L08', 'WGAN-GP · L09']}
          rows={[
            ['Lipschitz enforcement', 'Weight clipping', 'Gradient penalty in the loss'],
            ['After a critic step', 'clamp_(−c, c)', 'Nothing'],
            ['Optimizer', 'RMSprop, lr 5e-5', 'Adam, lr 1e-4, β = (0, 0.9)'],
            ['Norm in the critic', 'BatchNorm OK', 'None / LayerNorm (paper) · InstanceNorm (our lab)'],
            ['Critic capacity', 'Limited — weights crushed', 'Full — weights free'],
            ['λ', '—', '10'],
          ]}
          highlight={[3]}
        />
      ),
    },
    {
      id: 'l09-no-bn',
      section: 'What changes',
      kicker: 'Why no BatchNorm in the critic',
      title: 'BatchNorm mixes samples, so the per-sample penalty stops being valid',
      notes: {
        time: '2 min',
        say: 'BatchNorm makes each sample’s score depend on the whole batch. The penalty constrains the gradient of each sample’s score with respect to THAT sample’s input — with BatchNorm that is no longer a per-input function, so the penalty is no longer valid. Be precise about the replacement: the paper used no critic normalization and recommends layer normalization. InstanceNorm, which lab-09 uses, is also per-sample and equally valid — but it is the lab’s choice, not the paper’s.',
        ask: 'LayerNorm, InstanceNorm, BatchNorm — which ones mix samples?',
      },
      render: () => (
        <>
          <Versus
            left={{ tag: 'BatchNorm', title: 'Statistics across the batch', body: <ul><li>Each score depends on the other samples</li><li>The penalty assumes it doesn’t → <b>broken</b></li></ul>, tone: 'coral' }}
            right={{ tag: 'Per-sample norms', title: 'Statistics within one sample', body: <ul><li>Paper: none, or <b>LayerNorm</b> (recommended)</li><li>Our lab: InstanceNorm — also per sample</li></ul>, tone: 'mint' }}
          />
          <Takeaway tone="mint">The generator keeps BatchNorm — the penalty only applies to the critic.</Takeaway>
        </>
      ),
    },
    {
      id: 'l09-adam',
      section: 'What changes',
      kicker: 'The optimizer',
      title: 'Adam returns — with momentum switched off',
      notes: {
        time: '2 min',
        say: 'In L08, the WGAN authors saw instability with momentum-based Adam and switched to RMSprop. WGAN-GP returns to Adam but switches momentum off: β1 = 0, β2 = 0.9, lr = 1e-4 (Gulrajani et al. 2017, Algorithm 1). β1 = 0 removes the first-moment average; β2 still keeps per-weight step sizes.',
        ask: 'What does Adam with β1 = 0 have in common with RMSprop?',
      },
      render: () => (
        <>
          <Flow nodes={[
            { label: 'WGAN · L08', value: 'RMSprop', tone: 'coral', note: 'lr 5e-5 · no momentum' },
            { op: '→' },
            { label: 'WGAN-GP · L09', value: 'Adam', tone: 'mint', note: 'lr 1e-4 · β = (0, 0.9)' },
          ]} />
          <Code
            title="lab-09 · optimizers"
            code={`opt_C = torch.optim.Adam(critic.parameters(), lr=1e-4, betas=(0.0, 0.9))
opt_G = torch.optim.Adam(gen.parameters(),    lr=1e-4, betas=(0.0, 0.9))`}
            marks={{ 1: 'mint', 2: 'mint' }}
          />
          <Takeaway>β1 = 0 → no momentum. β2 = 0.9 → still a per-weight step size, like RMSprop.</Takeaway>
        </>
      ),
    },
    {
      id: 'l09-critic-code',
      section: 'What changes',
      kicker: 'lab-09 · the critic',
      title: 'The critic swaps BatchNorm for InstanceNorm — and still has no Sigmoid',
      notes: {
        time: '2 min',
        say: 'lab-09’s critic. InstanceNorm2d with affine=True normalizes per sample and learns scale and shift. The paper’s own recommendation is LayerNorm (e.g. nn.GroupNorm(1, 128) or nn.LayerNorm([128, 7, 7])); either is per-sample, so the penalty stays valid. No Sigmoid at the end — same as WGAN.',
        ask: 'What is the only structural difference from the WGAN critic?',
      },
      render: () => (
        <Stack gap="md">
          <Code
            title="lab-09-wgan-gp.ipynb · Critic"
            code={`self.model = nn.Sequential(
    # 1 x 28 x 28
    nn.Conv2d(1, 64, 4, 2, 1),                  # -> 64 x 14 x 14
    nn.LeakyReLU(0.2),
    nn.Conv2d(64, 128, 4, 2, 1),                # -> 128 x 7 x 7
    nn.InstanceNorm2d(128, affine=True),        # NOT BatchNorm!
    nn.LeakyReLU(0.2),
    nn.Flatten(),
    nn.Linear(128 * 7 * 7, 1),                  # raw score, no Sigmoid
)`}
            marks={{ 6: 'mint', 9: 'violet' }}
          />
          <Flow size="sm" nodes={[
            { value: '1×28×28', tone: 'blue' }, { op: '→' },
            { value: '64×14×14', tone: 'plain' }, { op: '→' },
            { value: '128×7×7', tone: 'plain' }, { op: '→' },
            { value: '6272', tone: 'plain' }, { op: '→' },
            { value: '1 score', tone: 'violet' },
          ]} />
        </Stack>
      ),
    },
    {
      id: 'l09-loop-code',
      section: 'What changes',
      kicker: 'lab-09 · the training loop',
      title: 'The loop is L08’s loop — with the penalty in the loss and no clamp',
      notes: {
        time: '3 min',
        say: 'Compare with WGAN: no clamp after the critic step — the penalty is in the loss. Python detail on the slide: wrap a multi-line loss in parentheses; a line starting with + after a complete statement is a separate expression, so loss_C would silently lose its last term. Same simplification as L08: one real batch is reused for the 5 critic steps; the paper samples a fresh one each time.',
        ask: 'Can you spot where labels or conditions appear in this loop? (Trick question — there are none. That is L10.)',
      },
      render: () => (
        <Code
          title="lab-09-wgan-gp.ipynb · training step (simplified)"
          code={`for real, _ in loader:
    for _ in range(n_critic):                     # 5 critic steps
        fake = gen(torch.randn(bs, z_dim, device=device)).detach()
        gp = gradient_penalty(critic, real, fake, device)
        loss_C = (-critic(real).mean() + critic(fake).mean()
                  + lambda_gp * gp)               # GP replaces clipping
        opt_C.zero_grad(); loss_C.backward(); opt_C.step()
        # no clamp_() any more

    fake = gen(torch.randn(bs, z_dim, device=device))
    loss_G = -critic(fake).mean()                 # 1 generator step
    opt_G.zero_grad(); loss_G.backward(); opt_G.step()`}
          marks={{ 4: 'violet', 5: 'violet', 6: 'violet', 8: 'mint', 11: 'blue' }}
        />
      ),
    },
    {
      id: 'l09-gp-curve',
      section: 'What changes',
      kicker: 'Reading the GP curve (illustrative)',
      title: 'A healthy GP curve starts high and settles small',
      notes: {
        time: '2 min',
        say: 'The GP value tells you how well the constraint holds at the interpolated points. These numbers are illustrative — look at lab-09’s actual curve. Typical shape: higher early, then settling at a small value as the critic learns to keep gradient norms near 1.',
        ask: 'If GP stays high after many epochs, what does that tell you?',
      },
      render: () => {
        const pts: Pt[] = Array.from({ length: 51 }, (_, i) => { const e = i / 2; return [e, 0.01 + 0.49 * Math.exp(-e / 4)]; });
        return (
          <Split ratio="1.4fr 1fr" left={
            <Plot
              ariaLabel="Illustrative gradient-penalty curve falling from 0.5 to about 0.01 over 25 epochs"
              x={[0, 25]} y={[0, 0.55]} xTicks={[0, 5, 10, 15, 20, 25]} yTicks={[0, 0.1, 0.2, 0.3, 0.4, 0.5]}
              xLabel="epoch" yLabel="GP" height={300}
              lines={[{ pts, color: '#7353bd', label: 'GP' }]}
            />
          } right={
            <Steps items={[
              { title: 'Early · GP ≈ 0.5', body: 'Random critic, random slopes', tone: 'coral' },
              { title: 'Mid · GP ≈ 0.1', body: 'Slopes coming under control', tone: 'yellow' },
              { title: 'Late · GP ≈ 0.01', body: 'Slope ≈ 1 between real and fake', tone: 'mint' },
            ]} />
          } />
        );
      },
    },

    /* ---------- big picture ---------- */
    {
      id: 'l09-compare',
      section: 'Big picture',
      kicker: 'Side by side',
      title: 'WGAN-GP wins on everything except a few extra lines of code',
      notes: {
        time: '2 min',
        say: 'The full comparison. WGAN-GP wins on every dimension except implementation complexity — the penalty function is a few extra lines. But the results are significantly better.',
        ask: 'Given all these advantages, is there ever a reason to use weight clipping over GP?',
      },
      render: () => (
        <Table
          headers={['Aspect', 'WGAN · clipping', 'WGAN-GP']}
          rows={[
            ['Lipschitz method', 'Clip weights to [−c, c]', 'Add λ·GP to the loss'],
            ['Weight distribution', 'Crushed to the walls', 'Natural spread'],
            ['Critic capacity', 'Limited', 'Full'],
            ['Optimizer', 'RMSprop', 'Adam, β1 = 0'],
            ['BatchNorm in critic', 'OK', 'No — LayerNorm / InstanceNorm'],
            ['Implementation', 'One-line clamp', 'A short GP function'],
            ['Convergence', 'Slower', 'Faster'],
          ]}
        />
      ),
    },
    {
      id: 'l09-evolution',
      section: 'Big picture',
      kicker: 'The evolution so far',
      title: 'Three steps took GAN training from fragile to stable',
      notes: {
        time: '2 min',
        say: 'Zoom out. We started with standard GANs that were unstable. WGAN fixed the loss. WGAN-GP fixed the constraint enforcement. Next: we add control — tell the GAN WHAT to generate.',
        ask: 'Which lesson’s improvement made the biggest difference to training stability?',
      },
      render: () => (
        <Flow nodes={[
          { label: 'Unit 1', value: 'GAN / DCGAN', tone: 'coral', note: 'BCE · JS stuck at log 2 · mode collapse' },
          { op: '→' },
          { label: 'L08', value: 'WGAN', tone: 'blue', note: 'Wasserstein loss · clipping kills capacity' },
          { op: '→' },
          { label: 'L09 · you are here', value: 'WGAN-GP', tone: 'mint', note: 'gradient penalty · full capacity · Adam' },
        ]} caption="The standard recipe for stable GAN training" />
      ),
    },
    {
      id: 'l09-lab',
      section: 'Big picture',
      kicker: 'Lab demo',
      title: 'Run lab-09: swap clipping for a penalty and compare with lab-08',
      notes: {
        time: '5 min',
        say: 'Live demo of lab-09. Same skeleton as lab-08, so move fast through data and models; spend the time on the gradient-penalty function and the GP column. Start training and talk over it. Then the two experiments: the critic weight histogram — compare with lab-08’s spikes at ±0.01 — and the strip of interpolated images, which is literally where the penalty is measured.',
        ask: 'Before we look: what should the critic weight histogram look like now that there is no clipping?',
      },
      render: () => (
        <LabDemo
          notebook="lab-09-wgan-gp.ipynb"
          goal="Swap clipping for a gradient penalty and compare against lab-08."
          steps={[
            <>2 · Critic &amp; Generator: InstanceNorm in the critic, no Sigmoid</>,
            <>3 · The Gradient Penalty Function: interpolate → score → <code>autograd.grad</code> → (‖∇‖ − 1)²</>,
            <>4 · Training: Adam <code>1e-4</code>, <code>betas=(0.0, 0.9)</code>, <code>lambda_gp = 10</code>, <code>n_critic = 5</code></>,
            <>5–8 · GP curve, samples, weight histogram, interpolated images</>,
          ]}
          watch={[
            <>Printed <code>GP:</code> column settles at a small value</>,
            <>Weight range and std dev spread out — no wall at ±0.01</>,
            <>ε strip: the fake (ε = 0) fades into the real (ε = 1)</>,
          ]}
          yourTurn={<>Set <code>lambda_gp</code> to 0, then 100 — compare critic scores and the GP column.</>}
        />
      ),
    },

    /* ---------- check ---------- */
    {
      id: 'l09-recap',
      section: 'Check',
      kicker: 'Lesson 09 summary',
      title: 'Six ideas to keep from WGAN-GP',
      notes: {
        time: '2 min',
        say: 'Six key takeaways. If you remember only three: the penalty replaces clipping, no BatchNorm in the critic, λ = 10.',
        ask: 'Which concept was hardest to understand?',
      },
      render: () => (
        <Recap items={[
          <>Clipping fails: <b>capacity loss</b>, sensitivity to c, slow convergence.</>,
          <>The gradient penalty charges <b>(‖∇C‖ − 1)²</b> — two-sided, aimed at slope 1.</>,
          <>The slope is measured at <b>x̂ = εx + (1 − ε)x̃</b>, between real and fake.</>,
          <><b>autograd.grad</b> gives the gradient w.r.t. the input; <b>create_graph=True</b> lets the loss backprop through it.</>,
          <>No BatchNorm in the critic: <b>LayerNorm</b> (paper) or InstanceNorm (lab).</>,
          <>Adam returns with <b>lr 1e-4, β = (0, 0.9)</b>; λ = 10.</>,
        ]} />
      ),
    },
    {
      id: 'l09-check',
      section: 'Check',
      kicker: 'Knowledge check',
      title: 'Three silent mistakes a WGAN-GP can hide',
      reveal: true,
      notes: {
        time: '4 min',
        say: 'Eye-opener questions. Give learners time to think before revealing. Q1 is a silent bug: the code runs fine and the results are just worse.',
        ask: 'Try all three before revealing any.',
      },
      render: ({ revealed }) => (
        <Quiz revealed={revealed} cols={3} items={[
          { q: 'You reuse Unit 1’s DCGAN discriminator (with BatchNorm) as the critic. It trains with no errors. What is wrong?', a: 'Each score depends on the whole batch, so the per-sample penalty is silently invalid. Use no norm, LayerNorm or InstanceNorm.' },
          { q: 'Lipschitz only needs ‖∇C‖ ≤ 1. Why push small slopes up to 1?', a: 'The optimal critic has slope exactly 1 between real and fake (Prop. 1). Aiming at 1 there costs nothing at the optimum and gives a smooth target.' },
          { q: 'GP only checks points between real and fake. What if C is a cliff somewhere else?', a: 'Then C is not truly 1-Lipschitz — GP is a soft, sampled rule. It works because G’s gradient only comes from C near the fakes and the path to the reals.' },
        ]} />
      ),
    },
    {
      id: 'l09-pivot',
      section: 'Check',
      kicker: 'Pivot · from stable training to control',
      title: 'Training is now stable — next we control what gets generated',
      notes: {
        time: '1 min',
        say: 'We have spent three lessons perfecting HOW GANs train. Now we shift to controlling WHAT they generate.',
        ask: 'What is the difference between stable training and controllable generation?',
      },
      render: () => (
        <Cards cols={2} items={[
          { tag: 'Better loss · L07–L09', title: 'Training is now stable', body: <ul><li>L07 · Why BCE fails</li><li>L08 · WGAN — Wasserstein distance</li><li>L09 · WGAN-GP — gradient penalty</li></ul>, tone: 'mint' },
          { tag: 'Control · L10–L11', title: 'Tell the GAN what to make', body: <ul><li>L10 · Conditional GAN</li><li>L11 · Controllable generation</li></ul>, tone: 'blue' },
        ]} />
      ),
    },
    {
      id: 'l09-bridge',
      section: 'Check',
      kicker: 'Next deck · Control',
      title: 'Stop generating random digits — ask for a 7 and get a 7.',
      layout: 'bridge',
      notes: {
        time: '1 min',
        say: 'This deck perfected how GANs train. But they still generate random outputs. The Control deck tells the GAN exactly WHAT to make.',
        ask: 'Where would you feed the label “7” into G — and into the critic?',
      },
      render: () => <Bridge done="Lesson 09 · complete" question="Stop generating random digits — ask for a 7 and get a 7." next="Control deck · L10 Conditional GAN" />,
    },
  ],
};
