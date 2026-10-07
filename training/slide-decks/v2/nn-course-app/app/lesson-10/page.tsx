'use client';

import { courseLessons } from '../course-data';
import { InteractiveLab } from '../interactive-labs';
import { PresentationShell, type LessonSection, type PresenterNote, type SlideMeta } from '../presentation-shell';

const slides = [
  { kicker: 'PHASE 2 · DEEP NEURAL NETWORKS', title: 'Your First Hidden Layer', subtitle: 'Follow one input through neurons in the middle', kind: 'hidden-cover' },
  { kicker: 'LEARNING OUTCOMES', title: 'Open the network and trace every value', kind: 'hidden-objectives' },
  { kicker: 'WHERE WE ARE', title: 'ReLU created the bend. Now connect the pieces.', kind: 'hidden-map' },
  { kicker: 'FROM NEURON TO NETWORK', title: 'Put useful neurons in the middle', kind: 'neuron-v-network' },
  { kicker: 'WHY “HIDDEN”?', title: 'We never give hidden neurons target answers', kind: 'hidden-meaning' },
  { kicker: 'THE ARCHITECTURE', title: 'One input · two hidden neurons · one output', kind: 'network-architecture' },
  { kicker: 'FORWARD PASS', title: 'Follow x = 3 from input to prediction', kind: 'forward-setup' },
  { kicker: 'HIDDEN NEURON 1', title: 'The positive branch passes through', kind: 'positive-branch' },
  { kicker: 'HIDDEN NEURON 2', title: 'The negative branch is blocked', kind: 'negative-branch' },
  { kicker: 'OUTPUT NEURON', title: 'Combine the hidden activations', kind: 'combine-positive' },
  { kicker: 'FULL TRACE', title: 'Every number in the x = 3 forward pass', kind: 'positive-trace' },
  { kicker: 'OPPOSITE INPUT', title: 'Now follow x = −3', kind: 'negative-trace' },
  { kicker: 'TAKING TURNS', title: 'The opposite hidden neuron activates', kind: 'taking-turns' },
  { kicker: 'NEW NAMES', title: 'z is before ReLU · h is after ReLU', kind: 'zh-names' },
  { kicker: 'FORWARD-PASS TABLE', title: 'The network produces |x|', kind: 'forward-table' },
  { kicker: 'LIVE CALCULATOR', title: 'Change the input and the left-side influence', kind: 'hidden-live' },
  { kicker: 'PARAMETER MAP', title: 'This small network has seven learnable values', kind: 'parameter-map' },
  { kicker: 'OUTPUT-WEIGHT EXPERIMENT', title: 'Change v₂ from 1 to 2', kind: 'v2-change' },
  { kicker: 'LOCAL EFFECT', title: 'Only the left side changes', kind: 'left-effect' },
  { kicker: 'WASTED CAPACITY', title: 'Identical hidden weights learn the same feature', kind: 'same-hidden' },
  { kicker: 'INITIALIZATION RULE', title: 'Hidden neurons must start differently', kind: 'different-starts' },
  { kicker: 'LEARNING PREVIEW', title: 'The hidden layer can discover the V-shape', kind: 'learning-preview' },
  { kicker: 'PROOF', title: 'Predictions converge to every target', kind: 'learned-output' },
  { kicker: 'KNOWLEDGE CHECK', title: 'Can you trace a hidden-layer forward pass?', kind: 'hidden-check', reveal: true },
  { kicker: 'NEXT LESSON', title: 'The prediction moves forward. The error must move backward.', kind: 'backprop-bridge' },
] satisfies SlideMeta[];

const sections: LessonSection[] = [
  { label: 'Orient', at: 0 }, { label: 'Connect', at: 3 }, { label: 'Trace', at: 6 },
  { label: 'Explore', at: 15 }, { label: 'Learn', at: 19 }, { label: 'Check', at: 23 },
];

const notes: Record<string, PresenterNote> = {
  'hidden-cover': { time: '1 min', say: 'Lesson 9 built a V with hand-picked neurons. This lesson opens the network and follows the values.', ask: 'Where would you place neurons between input and output?' },
  'hidden-objectives': { time: '1 min', say: 'Promise one complete forward pass, a parameter count, and two experiments.', ask: 'What do you expect ReLU to do inside the network?' },
  'hidden-map': { time: '2 min', say: 'Connect the need for nonlinear pieces to the hidden layer that contains them.', ask: 'Which idea from Lesson 9 will sit between layers?' },
  'neuron-v-network': { time: '2 min', say: 'A network adds intermediate neurons without changing the direction of data flow.', ask: 'What is new in the second path?' },
  'hidden-meaning': { time: '2 min', say: 'Hidden means no direct target is supplied for these internal activations.', ask: 'Who decides what each hidden neuron should detect?' },
  'network-architecture': { time: '2 min', say: 'Count nodes first, then count the connections.', ask: 'How many hidden neurons are shown?' },
  'forward-setup': { time: '2 min', say: 'Fix all parameters so the class can focus on information flow.', ask: 'Which hidden branch receives a negative weighted sum?' },
  'positive-branch': { time: '2 min', say: 'Multiply first, then activate. Keep z and h separate.', ask: 'Why does three pass through ReLU unchanged?' },
  'negative-branch': { time: '2 min', say: 'The second weight reverses the sign; ReLU then blocks the negative value.', ask: 'What is h₂?' },
  'combine-positive': { time: '2 min', say: 'The output neuron weights and adds the two hidden activations.', ask: 'Which hidden neuron contributes to this prediction?' },
  'positive-trace': { time: '3 min', say: 'Trace the full left-to-right path without skipping any symbol.', ask: 'Where does z become h?' },
  'negative-trace': { time: '3 min', say: 'Repeat the same operations for negative three.', ask: 'Which branch is now open?' },
  'taking-turns': { time: '2 min', say: 'The neurons divide the input space: one handles each side.', ask: 'What happens at zero?' },
  'zh-names': { time: '2 min', say: 'Use z for the pre-activation and h for the value the next layer receives.', ask: 'Which one is changed by ReLU?' },
  'forward-table': { time: '3 min', say: 'Read each row as a complete forward pass.', ask: 'Why is the final prediction always nonnegative?' },
  'hidden-live': { time: '5 min', say: 'Move x through zero, then change v₂ and observe only the negative side.', ask: 'Which values change when v₂ changes?' },
  'parameter-map': { time: '3 min', say: 'Separate input-to-hidden parameters from hidden-to-output parameters.', ask: 'Why does the output need one shared bias?' },
  'v2-change': { time: '3 min', say: 'Only the second hidden activation is scaled differently.', ask: 'At x = 3, does h₂ contribute anything?' },
  'left-effect': { time: '2 min', say: 'The output weight controls the region where its hidden neuron is active.', ask: 'Why does the right side stay fixed?' },
  'same-hidden': { time: '3 min', say: 'Identical hidden weights produce identical activations for every input.', ask: 'What useful capacity is lost?' },
  'different-starts': { time: '2 min', say: 'Different starting values break symmetry so neurons can specialize.', ask: 'What roles did the two original neurons discover?' },
  'learning-preview': { time: '3 min', say: 'Do not derive backprop yet; use the loss record as proof that the network can learn.', ask: 'At which checkpoint is the loss nearly zero?' },
  'learned-output': { time: '2 min', say: 'Compare the five targets and predictions one by one.', ask: 'What shape has the network recovered?' },
  'hidden-check': { time: '4 min', say: 'Ask all questions before revealing the answers.', ask: 'Which question checks the difference between z and h?' },
  'backprop-bridge': { time: '1 min', say: 'Forward pass explains prediction. Backpropagation explains learning.', ask: 'What information must reach the hidden weights?' },
};

function NetworkFlow({ input = 'x', left = 'h₁', right = 'h₂', output = 'ŷ' }: { input?: string; left?: string; right?: string; output?: string }) {
  return <div className="l10-network" role="img" aria-label={`Input ${input} connects to hidden neurons ${left} and ${right}, then to output ${output}`}>
    <div className="input-node"><small>INPUT</small><strong>{input}</strong></div>
    <div className="l10-lines"><i /><i /></div>
    <div className="l10-hidden"><article><small>HIDDEN 1</small><strong>{left}</strong></article><article><small>HIDDEN 2</small><strong>{right}</strong></article></div>
    <div className="l10-lines output"><i /><i /></div>
    <div className="output-node"><small>OUTPUT</small><strong>{output}</strong></div>
  </div>;
}

export default function LessonTen() {
  return <PresentationShell courseLessons={courseLessons} lessonNumber="10" notes={notes} sections={sections} slides={slides}>
    {({ slide, revealed }) => <>
      {slide.kind === 'hidden-cover' && <div className="cover-layout"><div><p className="chapter">10 · PHASE 2</p><h1>{slide.title}</h1><p className="subtitle">{slide.subtitle}</p></div><div className="l10-cover-network"><NetworkFlow /></div></div>}
      {slide.kind === 'hidden-objectives' && <div className="content-layout objectives-layout"><div className="objectives-copy"><h1>{slide.title}</h1><p>By the end, you should trace z and h through a network, count every parameter, and explain why hidden neurons need different starts.</p></div><ul className="objective-list"><li><span>01</span><div><strong>Trace the flow</strong><p>Input → hidden activations → prediction.</p></div></li><li><span>02</span><div><strong>Count connections</strong><p>Every weight and bias has a job.</p></div></li><li><span>03</span><div><strong>Protect diversity</strong><p>Different starts create different features.</p></div></li></ul></div>}
      {slide.kind === 'hidden-map' && <div className="content-layout"><h1>{slide.title}</h1><div className="course-phase-map"><article><small>LESSONS 1–7</small><strong>One neuron learns</strong></article><article><small>LESSON 8</small><strong>Multiple inputs</strong></article><article><small>LESSON 9</small><strong>ReLU creates bends</strong></article><article className="active"><small>LESSON 10 · NOW</small><strong>Hidden layer</strong></article></div></div>}
      {slide.kind === 'neuron-v-network' && <div className="content-layout"><h1>{slide.title}</h1><div className="l10-compare"><article><small>LESSON 1 · ONE NEURON</small><div><span>Input</span><b>→</b><strong>Neuron</strong><b>→</b><span>Output</span></div></article><article><small>NOW · A NETWORK</small><div><span>Input</span><b>→</b><strong>Hidden neurons</strong><b>→</b><strong>Output neuron</strong><b>→</b><span>Output</span></div></article></div></div>}
      {slide.kind === 'hidden-meaning' && <div className="content-layout"><h1>{slide.title}</h1><div className="l10-hidden-meaning"><article><span>We provide</span><strong>input x</strong><strong>final target y</strong></article><b>but not</b><article><span>We do not provide</span><strong>target h₁</strong><strong>target h₂</strong></article></div><p className="takeaway">The hidden neurons <b>figure out useful intermediate features</b> during training.</p></div>}
      {slide.kind === 'network-architecture' && <div className="content-layout"><h1>{slide.title}</h1><NetworkFlow input="x" left="ReLU(z₁)" right="ReLU(z₂)" output="ŷ" /><div className="l10-layer-labels"><span>visible input</span><span>hidden layer</span><span>output layer</span></div></div>}
      {slide.kind === 'forward-setup' && <div className="content-layout"><h1>{slide.title}</h1><div className="example-values l10-values">{[['INPUT','x = 3'],['HIDDEN WEIGHT 1','w₁ = 1'],['HIDDEN WEIGHT 2','w₂ = −1'],['OUTPUT WEIGHTS','v₁ = 1 · v₂ = 1'],['ALL BIASES','0']].map(([label,value])=><article key={label}><small>{label}</small><strong>{value}</strong></article>)}</div><p className="takeaway">Data moves <b>forward</b>. Every step uses the output of the step before it.</p></div>}
      {slide.kind === 'positive-branch' && <div className="content-layout"><h1>{slide.title}</h1><div className="l10-arithmetic"><article><small>1 · WEIGHTED SUM</small><span>z₁ = w₁x + b₁</span><strong>z₁ = 1 × 3 + 0 = 3</strong></article><b>→</b><article className="active"><small>2 · ACTIVATION</small><span>h₁ = ReLU(z₁)</span><strong>h₁ = ReLU(3) = 3</strong></article></div></div>}
      {slide.kind === 'negative-branch' && <div className="content-layout"><h1>{slide.title}</h1><div className="l10-arithmetic"><article><small>1 · WEIGHTED SUM</small><span>z₂ = w₂x + b₂</span><strong>z₂ = −1 × 3 + 0 = −3</strong></article><b>→</b><article className="blocked"><small>2 · ACTIVATION</small><span>h₂ = ReLU(z₂)</span><strong>h₂ = ReLU(−3) = 0</strong></article></div></div>}
      {slide.kind === 'combine-positive' && <div className="content-layout"><h1>{slide.title}</h1><div className="l10-output-sum"><article><small>HIDDEN 1 CONTRIBUTION</small><span>v₁h₁</span><strong>1 × 3 = 3</strong></article><b>+</b><article><small>HIDDEN 2 CONTRIBUTION</small><span>v₂h₂</span><strong>1 × 0 = 0</strong></article><b>=</b><article className="total"><small>PREDICTION</small><span>v₁h₁ + v₂h₂ + c</span><strong>ŷ = 3</strong></article></div></div>}
      {slide.kind === 'positive-trace' && <div className="content-layout"><h1>{slide.title}</h1><NetworkFlow input="x = 3" left="z₁ = 3 → h₁ = 3" right="z₂ = −3 → h₂ = 0" output="ŷ = 3" /><p className="rule-chip">3 enters → hidden neurons transform it → output neuron combines them</p></div>}
      {slide.kind === 'negative-trace' && <div className="content-layout"><h1>{slide.title}</h1><NetworkFlow input="x = −3" left="z₁ = −3 → h₁ = 0" right="z₂ = 3 → h₂ = 3" output="ŷ = 3" /><p className="rule-chip">The same network. The opposite gate opens.</p></div>}
      {slide.kind === 'taking-turns' && <div className="content-layout"><h1>{slide.title}</h1><div className="l10-turns"><article><small>NEGATIVE INPUTS</small><strong>h₂ is active</strong><p>Neuron 2 handles the left side.</p></article><article><small>AT ZERO</small><strong>both are 0</strong><p>The two branches meet.</p></article><article><small>POSITIVE INPUTS</small><strong>h₁ is active</strong><p>Neuron 1 handles the right side.</p></article></div></div>}
      {slide.kind === 'zh-names' && <div className="content-layout"><h1>{slide.title}</h1><div className="l10-zh"><article><small>PRE-ACTIVATION</small><strong>z</strong><p>The weighted sum before ReLU.</p><span>z = wx + b</span></article><b>ReLU</b><article><small>ACTIVATION</small><strong>h</strong><p>The value after ReLU—the next layer’s input.</p><span>h = max(0, z)</span></article></div></div>}
      {slide.kind === 'forward-table' && <div className="content-layout"><h1>{slide.title}</h1><div className="l10-forward-table"><div><span>x</span><span>h₁ = ReLU(x)</span><span>h₂ = ReLU(−x)</span><span>ŷ = h₁ + h₂</span></div>{[['−3','0','3','3'],['−1','0','1','1'],['0','0','0','0'],['1','1','0','1'],['3','3','0','3']].map(row=><div key={row[0]}>{row.map((cell,i)=><span className={i===3?'prediction-cell':''} key={`${i}-${cell}`}>{cell}</span>)}</div>)}</div><p className="rule-chip">The forward pass computes |x|: input goes in, prediction comes out.</p></div>}
      {slide.kind === 'hidden-live' && <div className="generated-slide interactive-slide"><h1>{slide.title}</h1><InteractiveLab lab="hidden-layer" /></div>}
      {slide.kind === 'parameter-map' && <div className="content-layout"><h1>{slide.title}</h1><div className="l10-parameter-table"><div><span>Parameters</span><span>Connection</span><span>Count</span></div><div><strong>w₁, b₁</strong><span>Input → Hidden neuron 1</span><b>2</b></div><div><strong>w₂, b₂</strong><span>Input → Hidden neuron 2</span><b>2</b></div><div><strong>v₁, v₂</strong><span>Hidden layer → Output neuron</span><b>2</b></div><div><strong>c</strong><span>Output bias</span><b>1</b></div><div className="total"><strong>Total</strong><span>Lesson 1 had only 2</span><b>7</b></div></div></div>}
      {slide.kind === 'v2-change' && <div className="content-layout"><h1>{slide.title}</h1><div className="l10-experiment"><article><small>ORIGINAL</small><strong>v₁ = 1 · v₂ = 1</strong><p>ŷ = h₁ + h₂</p></article><b>change one value</b><article><small>EXPERIMENT</small><strong>v₁ = 1 · v₂ = 2</strong><p>ŷ = h₁ + 2h₂</p></article></div><div className="l10-mini-results"><span>x = −3 → ŷ = <b>6</b></span><span>x = 0 → ŷ = <b>0</b></span><span>x = 3 → ŷ = <b>3</b></span></div></div>}
      {slide.kind === 'left-effect' && <div className="content-layout"><h1>{slide.title}</h1><div className="l10-side-effect"><article><small>x &lt; 0 · h₂ ACTIVE</small><strong>output doubles</strong><span>−3 → 6</span></article><article><small>x = 0 · BOTH OFF</small><strong>no change</strong><span>0 → 0</span></article><article><small>x &gt; 0 · h₂ OFF</small><strong>no change</strong><span>3 → 3</span></article></div><p className="takeaway"><b>v₂ scales neuron 2</b>, so it changes only the region where neuron 2 is active.</p></div>}
      {slide.kind === 'same-hidden' && <div className="content-layout"><h1>{slide.title}</h1><div className="l10-same"><div><small>IDENTICAL START</small><strong>w₁ = 0.5 · w₂ = 0.5</strong></div><div className="l10-same-table"><span>x</span><span>h₁</span><span>h₂</span><span>result</span>{[['−2','0.0','0.0','same'],['0','0.0','0.0','same'],['2','1.0','1.0','same']].flatMap((row,r)=>row.map((cell,c)=><span className={c===3?'same-cell':''} key={`${r}-${c}`}>{cell}</span>))}</div></div><p className="takeaway">Two neurons doing the same job are <b>wasted capacity</b>.</p></div>}
      {slide.kind === 'different-starts' && <div className="content-layout"><h1>{slide.title}</h1><div className="l10-starts"><article><small>NEURON 1</small><strong>w₁ = +0.5</strong><p>Can specialize on positive inputs.</p></article><article><small>NEURON 2</small><strong>w₂ = −0.5</strong><p>Can specialize on negative inputs.</p></article></div><p className="rule-chip">Different initial weights break symmetry → different neurons can learn different features</p></div>}
      {slide.kind === 'learning-preview' && <div className="content-layout"><h1>{slide.title}</h1><div className="l10-learning-table"><div><span>Epoch</span><span>Loss</span><span>What changed</span></div><div><span>1</span><strong>0.84801916</strong><span>rough first prediction</span></div><div><span>100</span><strong>0.00230882</strong><span>nearly the V-shape</span></div><div className="learned"><span>2000</span><strong>0.00000000</strong><span>exact relationship</span></div></div><p className="takeaway">The network discovered useful hidden and output weights <b>from data</b>.</p></div>}
      {slide.kind === 'learned-output' && <div className="content-layout"><h1>{slide.title}</h1><div className="l10-proof"><div><small>INPUTS</small><strong>[−2, −1, 0, 1, 2]</strong></div><div><small>TARGETS</small><strong>[2, 1, 0, 1, 2]</strong></div><div className="learned"><small>PREDICTIONS</small><strong>[2, 1, 0, 1, 2]</strong></div></div><p className="rule-chip">It learned |x| exactly—but the backward-pass arithmetic comes next.</p></div>}
      {slide.kind === 'hidden-check' && <div className="content-layout"><h1>{slide.title}</h1><div className="quiz-grid l10-quiz">{[
        ['01','What does “hidden” mean?','We do not supply direct target outputs for those neurons.'],
        ['02','What are z and h?','z is before ReLU; h is after ReLU.'],
        ['03','How many parameters are here?','Seven: four input-hidden, two hidden-output, and one output bias.'],
        ['04','What if hidden weights are identical?','The neurons learn the same feature and waste capacity.'],
        ['05','What is a forward pass?','The sequence of calculations from input to prediction.'],
      ].map(([n,q,a])=><article className={revealed?'answered':''} key={n}><span>{n}</span><p>{q}</p><strong>{revealed?a:'Explain first…'}</strong></article>)}</div></div>}
      {slide.kind === 'backprop-bridge' && <div className="bridge-layout"><h1>{slide.title}</h1><div className="bridge-compare"><div><small>FORWARD PASS</small><strong>input → prediction</strong><p>compute what the network believes</p></div><span>→</span><div><small>BACKPROPAGATION</small><strong>error → hidden weights</strong><p>assign responsibility and learn</p></div></div><p className="next-question">How does each hidden connection receive the right gradient?</p><span className="next-lesson">NEXT · LESSON 11</span></div>}
    </>}
  </PresentationShell>;
}
