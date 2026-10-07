'use client';

import { courseLessons } from '../course-data';
import { InteractiveLab } from '../interactive-labs';
import { PresentationShell, type LessonSection, type PresenterNote, type SlideMeta } from '../presentation-shell';

const slides = [
  { kicker: 'PHASE 2 · DEEP NEURAL NETWORKS', title: 'Backpropagation', subtitle: 'Pass responsibility backward—one connection at a time', kind: 'backprop-cover' },
  { kicker: 'LEARNING OUTCOMES', title: 'Trace the error all the way to a hidden weight', kind: 'backprop-objectives' },
  { kicker: 'WHERE WE ARE', title: 'The forward pass predicts. The backward pass learns.', kind: 'backprop-map' },
  { kicker: 'THE PROBLEM', title: 'The error is two connections away from w', kind: 'backprop-problem' },
  { kicker: 'STEP 1 · FORWARD', title: 'Calculate—and save—every intermediate value', kind: 'bp-forward' },
  { kicker: 'WHY SAVE VALUES?', title: 'The backward pass needs the forward-pass evidence', kind: 'bp-save' },
  { kicker: 'STEP 2 · START BACKWARD', title: 'How wrong is the prediction?', kind: 'bp-blame' },
  { kicker: 'STEP 3 · OUTPUT WEIGHT', title: 'How much did v affect the prediction?', kind: 'bp-grad-v' },
  { kicker: 'STEP 4 · MOVE LEFT', title: 'Pass the blame to h', kind: 'bp-blame-h' },
  { kicker: 'STEP 5 · RELU GATE', title: 'Does the activation let blame through?', kind: 'bp-relu' },
  { kicker: 'STEP 6 · HIDDEN WEIGHT', title: 'The blame reaches the deepest weight', kind: 'bp-grad-w' },
  { kicker: 'STEP 7 · UPDATE', title: 'Move both weights together', kind: 'bp-update' },
  { kicker: 'STEP 8 · CHECK', title: 'Run forward again: did the loss drop?', kind: 'bp-check' },
  { kicker: 'FULL BACKWARD FLOW', title: 'One chain assigns responsibility to both weights', kind: 'bp-full-flow' },
  { kicker: 'LIVE CALCULATOR', title: 'Open and close the backward ReLU gate', kind: 'bp-live' },
  { kicker: 'EXPERIMENT · RELU OFF', title: 'A negative z blocks the hidden gradient', kind: 'bp-off-forward' },
  { kicker: 'BLOCKED BACKWARD PASS', title: 'Large error · zero gradient for w', kind: 'bp-off-backward' },
  { kicker: 'COMPARE THE GATES', title: 'Open learns · closed gets stuck', kind: 'bp-gate-compare' },
  { kicker: 'DEAD RELU', title: 'A fully closed gate can stop a neuron learning', kind: 'dead-relu' },
  { kicker: 'LEAKY RELU', title: 'Keep a tiny backward path open', kind: 'leaky-relu' },
  { kicker: 'TRAIN THE NETWORK', title: 'Repeat forward → backward → update', kind: 'bp-training-loop' },
  { kicker: 'TRAINING RECORD', title: 'Two thousand passes recover |x|', kind: 'bp-training-record' },
  { kicker: 'LEARNED RESULT', title: 'The final predictions match every target', kind: 'bp-result' },
  { kicker: 'THE 8-STEP RECIPE', title: 'Backpropagation is a repeatable sequence', kind: 'bp-summary' },
  { kicker: 'KNOWLEDGE CHECK', title: 'Can you move blame through the network?', kind: 'bp-check-quiz', reveal: true },
  { kicker: 'NEXT LESSON', title: 'From number prediction to real-or-fake probability', kind: 'sigmoid-bridge' },
] satisfies SlideMeta[];

const sections: LessonSection[] = [
  { label: 'Orient', at: 0 }, { label: 'Forward', at: 3 }, { label: 'Backward', at: 6 },
  { label: 'Gate', at: 14 }, { label: 'Train', at: 20 }, { label: 'Check', at: 24 },
];

const notes: Record<string, PresenterNote> = Object.fromEntries(slides.map((slide, index) => [slide.kind, {
  time: index === 0 || index === 25 ? '1 min' : slide.kind === 'bp-live' ? '5 min' : slide.kind === 'bp-check-quiz' ? '4 min' : '2–3 min',
  say: slide.kind === 'bp-live' ? 'Move x across zero and predict whether the hidden gradient will survive.' : slide.kind.startsWith('bp-') ? `Keep the backward chain visible while explaining ${slide.title.toLowerCase()}.` : `Connect ${slide.title.toLowerCase()} to the forward-pass ideas from Lesson 10.`,
  ask: slide.kind === 'bp-check-quiz' ? 'Ask for reasons before revealing each answer.' : 'Which value controls the next operation?',
}])) as Record<string, PresenterNote>;

const flow = [
  ['2','ŷ = 2','blame = −4'],['3','v = 1','grad v = −8'],['4','h = 2','blame at h = −4'],
  ['5','z = 2','gate 1 → blame at z = −4'],['6','w = 1','grad w = −8'],
];

export default function LessonEleven() {
  return <PresentationShell courseLessons={courseLessons} lessonNumber="11" notes={notes} sections={sections} slides={slides}>
    {({ slide, revealed }) => <>
      {slide.kind === 'backprop-cover' && <div className="cover-layout"><div><p className="chapter">11 · PHASE 2</p><h1>{slide.title}</h1><p className="subtitle">{slide.subtitle}</p></div><div className="l11-cover-flow"><span>loss</span><i>←</i><span>ŷ</span><i>←</i><span>h</span><i>←</i><span>z</span><i>←</i><span>w</span></div></div>}
      {slide.kind === 'backprop-objectives' && <div className="content-layout objectives-layout"><div className="objectives-copy"><h1>{slide.title}</h1><p>By the end, you should calculate both gradients, explain the ReLU gate, and verify that one update improves the network.</p></div><ul className="objective-list"><li><span>01</span><div><strong>Save the forward pass</strong><p>Backward calculations reuse z, h, and ŷ.</p></div></li><li><span>02</span><div><strong>Pass blame backward</strong><p>Multiply by each connection’s local influence.</p></div></li><li><span>03</span><div><strong>Respect the gate</strong><p>ReLU may pass or block the gradient.</p></div></li></ul></div>}
      {slide.kind === 'backprop-map' && <div className="content-layout"><h1>{slide.title}</h1><div className="course-phase-map"><article><small>LESSON 9</small><strong>ReLU + V-shape</strong></article><article><small>LESSON 10</small><strong>Hidden-layer forward pass</strong></article><article className="active"><small>LESSON 11 · NOW</small><strong>Backward pass</strong></article><article><small>NEXT</small><strong>Probability + classification loss</strong></article></div></div>}
      {slide.kind === 'backprop-problem' && <div className="content-layout"><h1>{slide.title}</h1><div className="l11-problem"><article><small>HIDDEN WEIGHT</small><strong>w = 1</strong><span>x = 2</span></article><b>→</b><article><small>HIDDEN VALUE</small><strong>z = 2 → h = 2</strong><span>ReLU open</span></article><b>→</b><article><small>OUTPUT</small><strong>ŷ = 2</strong><span>target = 4 · loss = 4</span></article></div><p className="takeaway">The error is at the output. How does responsibility reach <b>w</b>?</p></div>}
      {slide.kind === 'bp-forward' && <div className="content-layout"><h1>{slide.title}</h1><div className="l11-forward-steps">{[['1','z = wx','1 × 2 = 2'],['2','h = ReLU(z)','ReLU(2) = 2'],['3','ŷ = vh','1 × 2 = 2'],['4','L = (ŷ − y)²','(2 − 4)² = 4']].map(([n,rule,math])=><article key={n}><span>{n}</span><small>{rule}</small><strong>{math}</strong></article>)}</div></div>}
      {slide.kind === 'bp-save' && <div className="content-layout"><h1>{slide.title}</h1><div className="l11-save"><article><small>SAVE z = 2</small><strong>Was ReLU open?</strong><p>Step 5 needs the sign of z.</p></article><article><small>SAVE h = 2</small><strong>How strongly did v act?</strong><p>Step 3 multiplies blame by h.</p></article><article><small>SAVE ŷ = 2</small><strong>How wrong were we?</strong><p>Step 2 compares ŷ with the target.</p></article></div></div>}
      {slide.kind === 'bp-blame' && <div className="content-layout"><h1>{slide.title}</h1><div className="l11-equation"><small>LOSS SLOPE AT THE OUTPUT</small><span>blame = 2 × (ŷ − target)</span><strong>2 × (2 − 4) = −4</strong></div><p className="takeaway"><b>−4</b> means the prediction is too low, so gradient descent will push it up.</p></div>}
      {slide.kind === 'bp-grad-v' && <div className="content-layout"><h1>{slide.title}</h1><div className="l11-cause"><article><small>OUTPUT RULE</small><strong>ŷ = v × h</strong><p>v touches h directly.</p></article><b>therefore</b><article className="result"><small>OUTPUT-WEIGHT GRADIENT</small><strong>grad v = blame × h</strong><p>−4 × 2 = <b>−8</b></p></article></div></div>}
      {slide.kind === 'bp-blame-h' && <div className="content-layout"><h1>{slide.title}</h1><div className="l11-cause"><article><small>CONNECTION TO OUTPUT</small><strong>ŷ = v × h</strong><p>h reaches the output through v.</p></article><b>move left</b><article className="result"><small>BLAME AT h</small><strong>blame × v</strong><p>−4 × 1 = <b>−4</b></p></article></div></div>}
      {slide.kind === 'bp-relu' && <div className="content-layout"><h1>{slide.title}</h1><div className="l11-gate"><article><small>FORWARD EVIDENCE</small><strong>z = 2 &gt; 0</strong><p>ReLU passed the value.</p></article><span>gate = 1</span><article className="open"><small>BACKWARD RESULT</small><strong>−4 × 1 = −4</strong><p>Blame passes unchanged.</p></article></div></div>}
      {slide.kind === 'bp-grad-w' && <div className="content-layout"><h1>{slide.title}</h1><div className="l11-equation"><small>HIDDEN RULE · z = w × x</small><span>grad w = blame at z × x</span><strong>−4 × 2 = −8</strong></div><p className="takeaway">The output error has reached the <b>deepest weight</b>.</p></div>}
      {slide.kind === 'bp-update' && <div className="content-layout"><h1>{slide.title}</h1><div className="l11-updates"><article><small>HIDDEN WEIGHT</small><span>w − η · grad w</span><strong>1 − 0.01(−8) = 1.08</strong></article><article><small>OUTPUT WEIGHT</small><span>v − η · grad v</span><strong>1 − 0.01(−8) = 1.08</strong></article></div><p className="rule-chip">Compute every gradient first. Then update every weight.</p></div>}
      {slide.kind === 'bp-check' && <div className="content-layout"><h1>{slide.title}</h1><div className="l11-check-calc"><article><small>NEW z</small><strong>1.08 × 2 = 2.16</strong></article><article><small>NEW h</small><strong>ReLU(2.16) = 2.16</strong></article><article><small>NEW ŷ</small><strong>1.08 × 2.16 = 2.3328</strong></article><article className="improved"><small>NEW LOSS</small><strong>(2.3328 − 4)² = 2.78</strong></article></div><div className="l11-loss-drop"><span>4.00</span><b>→</b><strong>2.78</strong></div></div>}
      {slide.kind === 'bp-full-flow' && <div className="content-layout"><h1>{slide.title}</h1><div className="l11-back-chain">{flow.map(([n,label,detail])=><article key={n}><span>{n}</span><small>{label}</small><strong>{detail}</strong></article>)}</div></div>}
      {slide.kind === 'bp-live' && <div className="generated-slide interactive-slide"><h1>{slide.title}</h1><InteractiveLab lab="backprop-gate" /></div>}
      {slide.kind === 'bp-off-forward' && <div className="content-layout"><h1>{slide.title}</h1><div className="l11-forward-steps off">{[['1','z = wx','1 × (−2) = −2'],['2','h = ReLU(z)','ReLU(−2) = 0'],['3','ŷ = vh','1 × 0 = 0'],['4','L = (ŷ − y)²','(0 − 4)² = 16']].map(([n,rule,math])=><article key={n}><span>{n}</span><small>{rule}</small><strong>{math}</strong></article>)}</div></div>}
      {slide.kind === 'bp-off-backward' && <div className="content-layout"><h1>{slide.title}</h1><div className="l11-blocked-chain"><article><small>STRONG OUTPUT BLAME</small><strong>2 × (0 − 4) = −8</strong></article><b>→</b><article><small>CLOSED RELU GATE</small><strong>−8 × 0 = 0</strong></article><b>→</b><article><small>HIDDEN GRADIENT</small><strong>grad w = 0 × (−2) = 0</strong></article></div></div>}
      {slide.kind === 'bp-gate-compare' && <div className="content-layout"><h1>{slide.title}</h1><div className="l11-gate-compare"><article className="open"><small>x = 2 · z = 2</small><strong>gate open</strong><p>blame at z = −4</p><b>grad w = −8 · learns</b></article><article className="closed"><small>x = −2 · z = −2</small><strong>gate closed</strong><p>blame at z = 0</p><b>grad w = 0 · stuck</b></article></div></div>}
      {slide.kind === 'dead-relu' && <div className="content-layout"><h1>{slide.title}</h1><div className="l11-dead"><strong>loss = 16</strong><span>but</span><strong>grad w = 0</strong></div><p className="next-question centered">A neuron can be very wrong and still receive no learning signal.</p></div>}
      {slide.kind === 'leaky-relu' && <div className="content-layout"><h1>{slide.title}</h1><div className="l11-leaky"><article><small>RELU</small><strong>max(0, z)</strong><p>negative side slope = 0</p></article><b>→</b><article><small>LEAKY RELU</small><strong>max(0.01z, z)</strong><p>negative side keeps a tiny slope</p></article></div><p className="rule-chip">The gate never fully closes, so a small gradient can still pass.</p></div>}
      {slide.kind === 'bp-training-loop' && <div className="content-layout"><h1>{slide.title}</h1><div className="l11-cycle">{[['01','Forward','save z, h, ŷ'],['02','Backward','pass blame through every path'],['03','Update','move all weights together'],['04','Repeat','use the next epoch']].map(([n,t,d])=><article key={n}><span>{n}</span><strong>{t}</strong><p>{d}</p></article>)}</div><p className="takeaway">The full two-neuron network repeats the same eight-step logic for <b>each path</b>.</p></div>}
      {slide.kind === 'bp-training-record' && <div className="content-layout"><h1>{slide.title}</h1><div className="l11-training-table"><div><span>Epoch</span><span>Loss</span><span>Status</span></div><div><span>1</span><strong>0.84801916</strong><span>rough first step</span></div><div><span>100</span><strong>0.00230882</strong><span>V-shape nearly learned</span></div><div className="learned"><span>2000</span><strong>0.00000000</strong><span>exact relationship</span></div></div></div>}
      {slide.kind === 'bp-result' && <div className="content-layout"><h1>{slide.title}</h1><div className="l11-result"><div><small>INPUTS</small><strong>[−2, −1, 0, 1, 2]</strong></div><div><small>TARGETS</small><strong>[2, 1, 0, 1, 2]</strong></div><div className="learned"><small>PREDICTIONS</small><strong>[2, 1, 0, 1, 2]</strong></div></div><p className="rule-chip">The network learned |x| by repeating Steps 1–8.</p></div>}
      {slide.kind === 'bp-summary' && <div className="content-layout"><h1>{slide.title}</h1><div className="l11-summary">{[['1','Forward','save z, h, ŷ'],['2','Output blame','2(ŷ − target)'],['3','Gradient for v','blame × h'],['4','Blame at h','blame × v'],['5','Through ReLU','blame at h × gate'],['6','Gradient for w','blame at z × x'],['7','Update','all weights together'],['8','Check','run forward again']].map(([n,t,d])=><article key={n}><span>{n}</span><strong>{t}</strong><small>{d}</small></article>)}</div></div>}
      {slide.kind === 'bp-check-quiz' && <div className="content-layout"><h1>{slide.title}</h1><div className="quiz-grid l11-quiz">{[
        ['01','At each connection, what multiplies the blame?','That connection’s local influence on the next value.'],
        ['02','If z = 5, does ReLU pass blame?','Yes—at Step 5, the gate equals 1.'],
        ['03','If z = −3, does ReLU pass blame?','No. The gate equals 0.'],
        ['04','Why save z in Step 1?','Its sign determines the backward ReLU gate.'],
        ['05','Why update after all gradients?','Every gradient must describe the same parameter state.'],
      ].map(([n,q,a])=><article className={revealed?'answered':''} key={n}><span>{n}</span><p>{q}</p><strong>{revealed?a:'Explain first…'}</strong></article>)}</div></div>}
      {slide.kind === 'sigmoid-bridge' && <div className="bridge-layout"><h1>{slide.title}</h1><div className="bridge-compare"><div><small>SO FAR</small><strong>predict a number</strong><p>squared-error loss</p></div><span>→</span><div><small>CLASSIFIER</small><strong>yes or no?</strong><p>probability + classification loss</p></div></div><p className="next-question">How do we turn any raw score into a probability between 0 and 1?</p><span className="next-lesson">NEXT · LESSON 12</span></div>}
    </>}
  </PresentationShell>;
}
