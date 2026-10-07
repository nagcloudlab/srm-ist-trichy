import './opt.css';
import type { ReactNode } from 'react';
import {
  Bridge, Cards, Divider, Equation, FormulaSteps, FormulaTerms, Quiz, Split, Stack, T, Table, Takeaway,
} from '../components/kit';
import { AdamInternalsLab, OptimizerRaceLab } from '../labs/DeepOptLabs';
import type { Part } from '../types';

const Op = ({ children }: { children: ReactNode }) => <span className="op">{children}</span>;

export const optPart: Part = {
  id: 'opt',
  code: 'OPT',
  label: 'Optimizers',
  title: 'Optimizers decide how far and which way each weight moves',
  when: '',
  minutes: 0,
  slides: [
    /* ------------------------------------------------------------------ Open */
    {
      id: 'opt-divider',
      section: 'Open',
      kicker: 'Part OPT',
      title: 'Optimizers',
      layout: 'divider',
      notes: {
        time: '1 min',
        say: 'Gradient descent gives the direction. An optimizer decides the actual step: how big, and whether to remember past steps. Every GAN recipe names one — Adam 2e-4 β1 0.5, RMSprop 5e-5, Adam β (0, 0.9). By the end those numbers will make sense.',
        ask: 'Why might one learning rate for all weights be a bad idea?',
      },
      render: () => (
        <Divider
          code="OPT"
          title="Optimizers"
          promise="They decide how far and which way each weight moves: memory (momentum), per-weight scale (RMSprop), or both (Adam)."
          items={['Limits of plain SGD', 'Momentum & Nesterov', 'AdaGrad & RMSprop', 'Adam & AdamW', 'Optimizers in GANs']}
        />
      ),
    },

    /* --------------------------------------------------------- Why not SGD */
    {
      id: 'opt-sgd-limits',
      section: 'Plain SGD',
      kicker: 'The baseline',
      title: 'Plain SGD uses one step size for every weight — and forgets every past step',
      notes: {
        time: '3 min',
        say: 'The update is the one from the gradient-descent part: weight minus learning rate times gradient. Four weaknesses: in a narrow valley it zig-zags across and crawls along; mini-batch noise makes it jitter; one η must suit every weight; and on flat plateaus or saddles the gradient is tiny so the step is tiny.',
        ask: 'Which of the four weaknesses would memory of past steps fix?',
      },
      render: () => (
        <Stack gap="lg">
          <Equation size="md" reading="new weight = old weight − learning rate × gradient">
            <T tone="violet">θ</T><Op>←</Op><T tone="violet">θ</T><Op>−</Op><T tone="yellow">η</T><Op>·</Op><T tone="coral">∇L(θ)</T>
          </Equation>
          <Cards cols={4} items={[
            { tag: 'Ravines', title: 'Zig-zags across, crawls along', body: 'Steep and shallow directions share one η', tone: 'blue' },
            { tag: 'Noise', title: 'Jitters', body: 'Each mini-batch gives a slightly different gradient', tone: 'coral' },
            { tag: 'One η', title: 'No per-weight scale', body: 'A weight with tiny gradients barely moves', tone: 'violet' },
            { tag: 'Plateaus', title: 'Tiny gradient → tiny step', body: 'Saddles and flat regions stall progress', tone: 'yellow' },
          ]} />
        </Stack>
      ),
    },
    {
      id: 'opt-race',
      section: 'Plain SGD',
      kicker: 'Live · optimizer race',
      title: 'In a narrow valley, memory and per-weight scaling beat plain SGD',
      lab: true,
      notes: {
        time: '5 min',
        say: 'The valley is 50 times steeper across than along. Press Race with the defaults: SGD must keep η below 2/50 = 0.04 or it explodes across the valley, so it crawls along x. Momentum builds speed along the floor. RMSprop and Adam rescale each direction so both move at a similar pace. Then push SGD’s η to 0.045 and watch it diverge; drop β to 0 and momentum becomes SGD.',
        ask: 'Why do SGD and Adam need different learning-rate sliders?',
      },
      render: () => <OptimizerRaceLab />,
    },

    /* ------------------------------------------------------------ Momentum */
    {
      id: 'opt-momentum-terms',
      section: 'Momentum',
      kicker: 'Formula · term by term',
      title: 'Momentum keeps a running velocity and steps along it',
      notes: {
        time: '3 min',
        say: 'Two lines. The velocity v is a decaying sum of past gradients: multiply the old velocity by β, add the current gradient. Then step along the velocity instead of the raw gradient. Directions that agree step after step add up; directions that flip sign cancel. Polyak’s heavy-ball method, 1964.',
        ask: 'If the gradient flips sign every step, what happens to v?',
      },
      render: () => (
        <FormulaTerms
          symbolWidth="7.5rem"
          reading="velocity = β × old velocity + gradient · then step along the velocity"
          formula={<><T tone="blue">v</T><Op>←</Op><T tone="violet">β</T><T tone="blue">v</T><Op>+</Op><T tone="coral">∇L(θ)</T><Op>;</Op><T tone="mint">θ</T><Op>←</Op><T tone="mint">θ</T><Op>−</Op><T tone="yellow">η</T><T tone="blue">v</T></>}
          terms={[
            { symbol: 'v', name: 'Velocity', meaning: 'Decaying sum of past gradients · starts at 0', range: 'same shape as θ', tone: 'blue' },
            { symbol: 'β', name: 'Momentum coefficient', meaning: 'How much of the old velocity survives each step', range: '0 … 1 · often 0.9', tone: 'violet' },
            { symbol: '∇L(θ)', name: 'Current gradient', meaning: 'Same gradient plain SGD would use', tone: 'coral' },
            { symbol: 'η v', name: 'The step', meaning: 'Consistent directions grow · flipping ones cancel', tone: 'yellow' },
            { symbol: 'θ', name: 'Weights', meaning: 'Move against the velocity, not the raw gradient', tone: 'mint' },
          ]}
        />
      ),
    },
    {
      id: 'opt-momentum-steps',
      section: 'Momentum',
      kicker: 'Formula · worked',
      title: 'With a steady gradient, momentum’s step grows toward 10× plain SGD',
      notes: {
        time: '3 min',
        say: 'Constant gradient 1, β = 0.9, η = 0.1. Plain SGD always steps 0.1. Momentum: v goes 1, 1.9, 2.71 … and approaches 1/(1 − β) = 10, so the step approaches 1.0 — ten times bigger. That is why momentum races along a shallow valley floor.',
        ask: 'What is the limit of v if β = 0.99?',
      },
      render: () => (
        <FormulaSteps
          formula={<><T tone="blue">v</T><Op>←</Op><T tone="violet">0.9</T><T tone="blue">v</T><Op>+</Op><T tone="coral">1</T></>}
          given={['g = 1 every step', 'β = 0.9', 'η = 0.1', 'v₀ = 0']}
          steps={[
            { math: <>v₁ = 0.9·0 + 1 = 1</>, note: 'step η·v = 0.1 · same as SGD' },
            { math: <>v₂ = 0.9·1 + 1 = 1.9</>, note: 'step 0.19' },
            { math: <>v₃ = 0.9·1.9 + 1 = 2.71</>, note: 'step 0.271' },
            { math: <>v∞ = 1 / (1 − 0.9) = 10</>, note: 'geometric series 1 + β + β² + …' },
          ]}
          result={<>step → η·10 = 1.0 · 10× plain SGD</>}
        />
      ),
    },
    {
      id: 'opt-momentum-window',
      section: 'Momentum',
      kicker: 'Memory length',
      title: 'β sets how many past steps momentum remembers: about 1/(1 − β)',
      notes: {
        time: '2 min',
        say: 'The same 1/(1 − β) is the effective window of the moving average. β = 0.9 averages roughly the last 10 gradients. DCGAN’s β1 = 0.5 remembers only about 2 — keep this table in mind for the GAN slides at the end of this part.',
        ask: 'In a game where the opponent changes every step, would you want a long or a short memory?',
      },
      render: () => (
        <Stack gap="md">
          <Table
            headers={['β', 'Window ≈ 1/(1 − β)', 'Max speed-up', 'Where you meet it']}
            rows={[
              ['0', '1 step', '1×', 'Plain SGD · WGAN-GP Adam β₁ = 0'],
              ['0.5', '2 steps', '2×', 'DCGAN Adam β₁ = 0.5'],
              ['0.9', '10 steps', '10×', 'Default momentum · Adam β₁ = 0.9'],
              ['0.99', '100 steps', '100×', 'Rare for momentum'],
              ['0.999', '1000 steps', '—', 'Adam β₂ (squared gradients)'],
            ]}
            highlight={[1]}
            align={['center', 'left', 'center', 'left']}
          />
          <Takeaway>High β = smooth, fast, but slow to change direction.</Takeaway>
        </Stack>
      ),
    },
    {
      id: 'opt-nesterov',
      section: 'Momentum',
      kicker: 'Formula · Nesterov',
      title: 'Nesterov measures the gradient where momentum is about to land',
      notes: {
        time: '2 min',
        say: 'Plain momentum computes the gradient at the current point, then adds the velocity. Nesterov first jumps ahead along the velocity, measures the gradient there, and corrects. If the look-ahead point is already past the minimum, the gradient pushes back before overshooting. Nesterov 1983; popularised for deep learning by Sutskever et al. 2013. In PyTorch: SGD(..., momentum=0.9, nesterov=True).',
        ask: 'Why does measuring the gradient one step ahead reduce overshoot?',
      },
      render: () => (
        <FormulaTerms
          symbolWidth="7.5rem"
          reading="velocity = β × old velocity + gradient measured at the look-ahead point"
          formula={<><T tone="blue">v</T><Op>←</Op><T tone="violet">β</T><T tone="blue">v</T><Op>+</Op><T tone="coral">∇L(θ − ηβv)</T><Op>;</Op><T tone="mint">θ</T><Op>←</Op><T tone="mint">θ</T><Op>−</Op><T tone="yellow">η</T><T tone="blue">v</T></>}
          terms={[
            { symbol: 'θ − ηβv', name: 'Look-ahead point', meaning: 'Where the old velocity alone would carry the weights', tone: 'violet' },
            { symbol: '∇L(θ − ηβv)', name: 'Gradient there', meaning: 'Sees the slope after the coast · brakes before overshooting', tone: 'coral' },
            { symbol: 'v, η, β', name: 'Same as momentum', meaning: 'Only the point where the gradient is measured changes', tone: 'blue' },
          ]}
        />
      ),
    },

    /* ------------------------------------------------------ Adaptive rates */
    {
      id: 'opt-adagrad',
      section: 'Adaptive rates',
      kicker: 'Formula · AdaGrad',
      title: 'AdaGrad gives each weight its own step — but the step shrinks forever',
      notes: {
        time: '3 min',
        say: 'AdaGrad (Duchi et al. 2011) keeps a running SUM of each weight’s squared gradients and divides by its square root. Weights with big gradients get small steps, rare weights get big ones. The flaw: the sum only grows. With a constant gradient the step is η/√t — after 4 steps half, after 100 steps a tenth. Long training stalls.',
        ask: 'What would fix the ever-growing sum?',
      },
      render: () => (
        <Split ratio="1.25fr 1fr" align="start" left={
          <FormulaTerms
          symbolWidth="7.5rem"
            reading="G = running sum of squared gradients · step = η × gradient ÷ √G"
            formula={<><T tone="violet">G</T><Op>←</Op><T tone="violet">G</T><Op>+</Op><T tone="coral">g²</T><Op>;</Op><T tone="mint">θ</T><Op>←</Op><T tone="mint">θ</T><Op>−</Op><T tone="yellow">η</T><span className="frac"><span><T tone="coral">g</T></span><span>√<T tone="violet">G</T> + ε</span></span></>}
            terms={[
              { symbol: 'G', name: 'Sum of squared gradients', meaning: 'Per weight · never forgets, only grows', range: '≥ 0', tone: 'violet' },
              { symbol: 'g / √G', name: 'Normalised step', meaning: 'Big-gradient weights move less', tone: 'coral' },
              { symbol: 'ε', name: 'Safety constant', meaning: 'Avoids ÷ 0 · e.g. 10⁻⁸', tone: 'plain' },
            ]}
          />
        } right={
          <Table
            headers={['Step t', 'G (g = 1)', 'Step ÷ η']}
            rows={[['1', '1', '1.00'], ['2', '2', '0.71'], ['3', '3', '0.58'], ['4', '4', '0.50'], ['100', '100', '0.10']]}
            highlight={[4]}
            align={['center', 'center', 'center']}
          />
        } />
      ),
    },
    {
      id: 'opt-rmsprop',
      section: 'Adaptive rates',
      kicker: 'Formula · RMSprop',
      title: 'RMSprop forgets old gradients, so the per-weight step never dies',
      notes: {
        time: '3 min',
        say: 'RMSprop (Hinton, 2012 lecture notes) swaps AdaGrad’s sum for an exponential moving average. s tracks the recent typical size of the gradient squared; dividing by √s makes the step roughly η in every direction — big-gradient and small-gradient weights move at similar speed. This is what the original WGAN uses, with η = 5e-5.',
        ask: 'If a weight’s gradients are always 100× larger than another’s, how do their RMSprop steps compare?',
      },
      render: () => (
        <FormulaTerms
          symbolWidth="7.5rem"
          reading="s = moving average of squared gradients · step = η × gradient ÷ √s"
          cols={2}
          formula={<><T tone="violet">s</T><Op>←</Op><T tone="blue">ρ</T><T tone="violet">s</T><Op>+</Op><span>(1 −</span><T tone="blue">ρ</T><span>)</span><T tone="coral">g²</T><Op>;</Op><T tone="mint">θ</T><Op>←</Op><T tone="mint">θ</T><Op>−</Op><T tone="yellow">η</T><span className="frac"><span><T tone="coral">g</T></span><span>√<T tone="violet">s</T> + ε</span></span></>}
          terms={[
            { symbol: 's', name: 'Mean squared gradient', meaning: 'Recent typical gradient size², per weight', range: '≥ 0 · starts at 0', tone: 'violet' },
            { symbol: 'ρ', name: 'Decay', meaning: 'Memory of the average · window ≈ 1/(1 − ρ)', range: '0.9 · PyTorch α = 0.99', tone: 'blue' },
            { symbol: 'g / √s', name: 'Scale-free direction', meaning: 'Gradient ÷ its own typical size ≈ ±1', range: '≈ −1 … 1', tone: 'coral' },
            { symbol: 'η', name: 'Learning rate', meaning: 'Now ≈ the actual step size per weight', range: 'WGAN: 5 × 10⁻⁵', tone: 'yellow' },
          ]}
        />
      ),
    },
    {
      id: 'opt-rmsprop-steps',
      section: 'Adaptive rates',
      kicker: 'Formula · worked',
      title: 'Gradients 10 and 0.1 get exactly the same RMSprop step',
      notes: {
        time: '3 min',
        say: 'Two weights, one with gradient 10 and one with gradient 0.1 — a 100× difference. Plain SGD would move the first 100× more. RMSprop, first step with ρ = 0.9: s = 0.1 g², so g/√s = 1/√0.1 = 3.16 for both. Once s has warmed up to g², the step settles to η for both. That first-step overshoot is exactly what Adam’s bias correction removes.',
        ask: 'Why is the very first RMSprop step bigger than later ones?',
      },
      render: () => (
        <FormulaSteps
          given={['ρ = 0.9, s₀ = 0', 'weight A: g = 10', 'weight B: g = 0.1']}
          steps={[
            { math: <>s_A = 0.1·10² = 10 · √s_A = 3.162</>, note: 'first step: s holds only 10% of g²' },
            { math: <>s_B = 0.1·0.1² = 0.001 · √s_B = 0.0316</>, note: '100× smaller gradient, 100× smaller √s' },
            { math: <>g/√s = 10/3.162 = 0.1/0.0316 = 3.16</>, note: 'identical for A and B' },
            { math: <>later: s → g² so g/√s → 1</>, note: 'step settles to η · SGD would differ 100×' },
          ]}
          result={<>same step for both weights · first one 3.16 η</>}
        />
      ),
    },

    /* ----------------------------------------------------------------- Adam */
    {
      id: 'opt-adam-terms',
      section: 'Adam',
      kicker: 'Formula · term by term',
      title: 'Adam = momentum for direction + RMSprop for scale + bias correction',
      notes: {
        time: '4 min',
        say: 'Kingma & Ba, 2014. m is momentum written as an average (note the 1 − β1 factor). v is RMSprop’s average of squared gradients. Both start at zero, so early on both are too small — the hats divide that bias away. The step is the corrected direction divided by the corrected scale. Defaults: η 1e-3, β1 0.9, β2 0.999, ε 1e-8 — exactly the number-7 GAN from Unit 1.',
        ask: 'Which part of Adam is momentum, and which part is RMSprop?',
      },
      render: () => (
        <FormulaTerms
          symbolWidth="7.5rem"
          reading="step = η × corrected average gradient ÷ (√corrected average squared gradient + ε)"
          cols={2}
          formula={<><T tone="mint">θ</T><Op>←</Op><T tone="mint">θ</T><Op>−</Op><T tone="yellow">η</T><span className="frac"><span><T tone="blue">m̂</T></span><span>√<T tone="violet">v̂</T> + ε</span></span><Op>,</Op><T tone="blue">m̂</T><Op>=</Op><span className="frac"><span><T tone="blue">m</T></span><span>1 − β₁ᵗ</span></span><Op>,</Op><T tone="violet">v̂</T><Op>=</Op><span className="frac"><span><T tone="violet">v</T></span><span>1 − β₂ᵗ</span></span></>}
          terms={[
            { symbol: 'm', name: 'First moment', meaning: 'm ← β₁m + (1 − β₁)g · average gradient', range: 'starts 0', tone: 'blue' },
            { symbol: 'v', name: 'Second moment', meaning: 'v ← β₂v + (1 − β₂)g² · average g²', range: 'starts 0', tone: 'violet' },
            { symbol: 'm̂, v̂', name: 'Bias-corrected', meaning: 'Undo the pull toward the zero start', range: 'matter for small t', tone: 'coral' },
            { symbol: 'β₁', name: 'Direction memory', meaning: 'Momentum part · window ≈ 10 steps', range: '0.9 default', tone: 'blue' },
            { symbol: 'β₂', name: 'Scale memory', meaning: 'RMSprop part · window ≈ 1000 steps', range: '0.999 default', tone: 'violet' },
            { symbol: 'η, ε', name: 'Step size, safety', meaning: 'm̂/√v̂ ≈ ±1, so η ≈ the step size', range: '10⁻³ · 10⁻⁸', tone: 'yellow' },
          ]}
        />
      ),
    },
    {
      id: 'opt-adam-steps',
      section: 'Adam',
      kicker: 'Formula · worked',
      title: 'Without bias correction, Adam’s first step is 3.16× too big',
      notes: {
        time: '4 min',
        say: 'Step 1 with g = 0.5. m = 0.1 × 0.5 = 0.05 and v = 0.001 × 0.25 = 0.00025 — both far too small because they started at zero. v is pulled down more, because β2 = 0.999 is closer to 1, so the ratio m/√v = 3.16 overshoots. Dividing by 1 − β1 = 0.1 and 1 − β2 = 0.001 gives m̂ = 0.5 and v̂ = 0.25 exactly, and the step is η. Step 2 with g = 0.3: corrected 0.957 η, uncorrected 4.07 η.',
        ask: 'After how many steps does the correction stop mattering for m? For v?',
      },
      render: () => (
        <FormulaSteps
          given={['β₁ = 0.9, β₂ = 0.999', 'g₁ = 0.5, g₂ = 0.3', 'm₀ = v₀ = 0']}
          steps={[
            { math: <>m₁ = 0.1·0.5 = 0.05 · v₁ = 0.001·0.25 = 0.00025</>, note: 'both pulled toward 0' },
            { math: <>uncorrected: 0.05 / √0.00025 = 3.162</>, note: 'v is under-estimated more → ratio overshoots' },
            { math: <>m̂₁ = 0.05/0.1 = 0.5 · v̂₁ = 0.00025/0.001 = 0.25</>, note: 'exactly g and g²' },
            { math: <>step₁ = 0.5 / √0.25 = 1.000 (× η)</>, note: 'corrected' },
            { math: <>t = 2: m̂₂ = 0.395, v̂₂ = 0.170 → 0.957</>, note: 'uncorrected would be 4.07' },
          ]}
          result={<>first steps ≈ η, not 3–4 η</>}
        />
      ),
    },
    {
      id: 'opt-adam-lab',
      section: 'Adam',
      kicker: 'Live · Adam internals',
      title: 'Step through Adam and watch bias correction keep early steps near η',
      lab: true,
      notes: {
        time: '5 min',
        say: 'Constant gradient first: corrected Adam steps exactly 1 × η every iteration; switch correction off and the steps start at 3.16, then 4.25, and climb to about 6.5 by t = 10 (still 6.2 at t = 20) — because v needs about a thousand steps to warm up. Then Sign flip: m nearly cancels, so steps shrink — momentum smoothing. Fading: steps stay near η even as the gradient shrinks — Adam is scale-free.',
        ask: 'With the fading sequence, why does Adam keep stepping almost η while SGD’s steps would shrink?',
      },
      render: () => <AdamInternalsLab />,
    },
    {
      id: 'opt-adamw',
      section: 'Adam',
      kicker: 'Weight decay',
      title: 'AdamW decays every weight equally; L2 inside Adam does not',
      notes: {
        time: '4 min',
        say: 'Weight decay pulls weights toward zero. Adding λθ to the gradient (L2) works for SGD, but in Adam that extra term gets divided by √v̂ like everything else — so weights with a big gradient history barely decay. Loshchilov & Hutter (AdamW) apply ηλθ directly, outside the adaptive scaling. Two weights both at θ = 1, λ = 0.01: with L2 the decay differs 100×; with AdamW it is identical.',
        ask: 'Which weights escape regularisation when L2 is mixed into Adam?',
      },
      render: () => (
        <Stack gap="md">
          <Split left={
            <Equation size="md" reading="L2 in Adam: decay is divided by √v̂">
              <span>step</span><Op>∝</Op><span className="frac"><span><T tone="blue">m̂</T> (incl. <T tone="coral">λθ</T>)</span><span>√<T tone="violet">v̂</T></span></span>
            </Equation>
          } right={
            <Equation size="md" reading="AdamW: decay applied directly">
              <span>step</span><Op>=</Op><T tone="yellow">η</T><span>(</span><span className="frac"><span><T tone="blue">m̂</T></span><span>√<T tone="violet">v̂</T></span></span><Op>+</Op><T tone="coral">λθ</T><span>)</span>
            </Equation>
          } />
          <Table
            headers={['θ = 1, λ = 0.01', 'Weight A · √v̂ = 10', 'Weight B · √v̂ = 0.1']}
            rows={[
              ['L2 inside Adam', 'decay ≈ η·0.01/10 = 0.001 η', 'decay ≈ η·0.01/0.1 = 0.1 η'],
              ['AdamW', '0.01 η', '0.01 η'],
            ]}
            highlight={[1]}
          />
        </Stack>
      ),
    },

    /* ------------------------------------------------------------- In GANs */
    {
      id: 'opt-gans',
      section: 'In GANs',
      kicker: 'Recipes you have met',
      title: 'Every GAN recipe in this course pins its optimizer — and its β',
      notes: {
        time: '3 min',
        say: 'Read the table top to bottom. The number-7 GAN can use Adam defaults because the game is tiny. DCGAN lowers η to 2e-4 and β1 to 0.5. The original WGAN drops momentum entirely for RMSprop. WGAN-GP returns to Adam but with β1 = 0 — no momentum at all — and β2 = 0.9.',
        ask: 'What do the last three rows have in common?',
      },
      render: () => (
        <Table
          headers={['Model', 'Optimizer', 'η', 'Momentum (β / β₁)', 'Second moment']}
          rows={[
            ['Number-7 GAN (Unit 1)', 'Adam', '1 × 10⁻³', '0.9 (default)', 'β₂ = 0.999'],
            ['DCGAN · Radford et al. 2015', 'Adam', '2 × 10⁻⁴', '0.5', 'β₂ = 0.999'],
            ['WGAN · Arjovsky et al. 2017', 'RMSprop', '5 × 10⁻⁵', 'none', 'moving average'],
            ['WGAN-GP · Gulrajani et al. 2017', 'Adam', '1 × 10⁻⁴', '0', 'β₂ = 0.9'],
          ]}
          highlight={[1, 2, 3]}
        />
      ),
    },
    {
      id: 'opt-gans-why',
      section: 'In GANs',
      kicker: 'Why less momentum',
      title: 'An opponent that keeps changing makes long momentum a liability',
      notes: {
        time: '4 min',
        say: 'In a GAN each network’s loss surface moves whenever the other network updates — the objective is non-stationary. Momentum keeps pushing along directions that were right a few steps ago. DCGAN: β1 = 0.9 gave oscillation and instability, 0.5 stabilised it. WGAN: Adam with β1 > 0 on the critic sometimes made training unstable, so they switched to RMSprop, known to work on very non-stationary problems. WGAN-GP: Adam with β1 = 0 and β2 = 0.9 worked well with the gradient penalty.',
        ask: 'Why does a shorter β2 (0.9 vs 0.999) also help when the gradient scale keeps changing?',
      },
      render: () => (
        <Cards cols={3} items={[
          { tag: 'DCGAN · β₁ = 0.5', title: 'Memory 10 → 2 steps', body: 'Paper: β₁ = 0.9 gave oscillation and instability; 0.5 stabilised training', tone: 'blue' },
          { tag: 'WGAN · RMSprop', title: 'No momentum on the critic', body: 'Paper: Adam (β₁ > 0) sometimes unstable · RMSprop copes with non-stationary losses', tone: 'coral' },
          { tag: 'WGAN-GP · β = (0, 0.9)', title: 'No momentum, short scale memory', body: 'Paper settings: Adam η 1e-4, β₁ 0, β₂ 0.9, 5 critic steps per G step', tone: 'mint' },
        ]} />
      ),
    },
    {
      id: 'opt-compare',
      section: 'In GANs',
      kicker: 'Cheat sheet',
      title: 'Choose by memory cost, tuning effort and how the loss surface behaves',
      notes: {
        time: '3 min',
        say: 'Extra memory is counted in values stored per parameter: Adam keeps two (m and v), so for a 10-million-parameter model that is 20 million extra numbers. Adaptive methods make η roughly the step size, so they are easier to tune; SGD with momentum is still competitive with a good schedule. Switching optimizer means re-tuning η — their scales differ by orders of magnitude.',
        ask: 'Why can’t you copy a learning rate from an SGD recipe into Adam?',
      },
      render: () => (
        <Stack gap="md">
          <Table
            compact
            headers={['Optimizer', 'Extra values per weight', 'η meaning', 'Use when']}
            rows={[
              ['SGD', '0', 'step ∝ gradient size', 'Baseline · with a good schedule'],
              ['Momentum / Nesterov', '1 (v)', 'step ∝ gradient · up to 1/(1 − β)×', 'Long valleys · noisy batches'],
              ['AdaGrad', '1 (G)', 'shrinks as 1/√t', 'Short runs · sparse features'],
              ['RMSprop', '1 (s)', '≈ step size', 'Non-stationary losses · WGAN'],
              ['Adam / AdamW', '2 (m, v)', '≈ step size', 'Default for deep nets & most GANs'],
            ]}
            highlight={[4]}
          />
          <Takeaway>Changing optimizer = re-tuning η. Adam’s 10⁻³ and SGD’s 10⁻¹ are both normal.</Takeaway>
        </Stack>
      ),
    },
    {
      id: 'opt-clipping',
      section: 'In GANs',
      kicker: 'Formula · gradient clipping',
      title: 'Clipping by norm shrinks an exploding gradient but keeps its direction',
      notes: {
        time: '3 min',
        say: 'If the whole gradient vector is longer than a threshold c, rescale it to length c; otherwise leave it. Direction unchanged, only length capped. torch.nn.utils.clip_grad_norm_(model.parameters(), c), called after backward and before step. Do not confuse it with WGAN weight clipping, which clamps the weights themselves to ±0.01.',
        ask: 'What is the difference between clipping gradients and WGAN’s clipping of weights?',
      },
      render: () => (
        <FormulaSteps
          formula={<><T tone="coral">g</T><Op>←</Op><T tone="coral">g</T><Op>·</Op><span>min(1,</span><span className="frac"><span><T tone="yellow">c</T></span><span>‖<T tone="coral">g</T>‖</span></span><span>)</span></>}
          given={['g = (3, 4)', 'threshold c = 1']}
          steps={[
            { math: <>‖g‖ = √(3² + 4²) = 5</>, note: 'length of the whole gradient vector' },
            { math: <>min(1, 1/5) = 0.2</>, note: 'longer than c → scale down' },
            { math: <>g ← 0.2 · (3, 4) = (0.6, 0.8)</>, note: 'same direction · length now 1' },
          ]}
          result={<>(0.6, 0.8) · only the length changed</>}
        />
      ),
    },

    /* ---------------------------------------------------------------- Check */
    {
      id: 'opt-check',
      section: 'Check',
      kicker: 'Knowledge check',
      title: 'Can you predict what each optimizer will do?',
      reveal: true,
      notes: {
        time: '5 min',
        say: 'Let pairs discuss before revealing. Listen for the scale-free idea (questions 3 and 6) and the non-stationary idea (question 4).',
        ask: 'Which answer surprised you most?',
      },
      render: ({ revealed }) => (
        <Quiz revealed={revealed} items={[
          { q: 'Momentum β = 0.9, constant gradient. Final step vs plain SGD?', a: '10× larger: v → 1/(1 − β) = 10.' },
          { q: 'Adam without bias correction: first step too big or too small?', a: 'Too big: m/√v = 3.16 because v starts further below g².' },
          { q: 'Gradients 100 and 0.01 on two weights. Adam steps after warm-up?', a: 'Both ≈ η — Adam divides each gradient by its own size.' },
          { q: 'Why did DCGAN lower Adam’s β₁ from 0.9 to 0.5?', a: 'The opponent keeps changing; a 10-step memory pushed stale directions and oscillated.' },
          { q: 'AdaGrad on a very long run: what goes wrong?', a: 'G only grows, so η/√G → 0 and learning stalls.' },
          { q: 'L2 penalty inside Adam vs AdamW: who escapes decay?', a: 'With L2, weights with large √v̂ barely decay; AdamW decays all equally.' },
        ]} />
      ),
    },
    {
      id: 'opt-bridge',
      section: 'Check',
      kicker: 'Next part',
      title: 'Optimizers move the weights — activations decide how gradients flow',
      layout: 'bridge',
      notes: {
        time: '1 min',
        say: 'An optimizer can only use the gradient it receives. If an activation saturates or dies, the gradient is already gone before Adam sees it. That is the next part.',
        ask: 'Which activation from Unit 1 can make a gradient exactly zero?',
      },
      render: () => (
        <Bridge
          done="Part OPT · complete"
          question="Adam can only scale the gradient it receives — what stops a gradient from arriving at all?"
          next="ACT · Activation functions"
        />
      ),
    },
  ],
};
