'use client';

import { courseLessons } from '../course-data';
import { InteractiveLab } from '../interactive-labs';
import { LearningRateCurve } from '../learning-rate-curve';
import { PresentationShell, type LessonSection, type PresenterNote, type SlideMeta } from '../presentation-shell';

const slides = [
  { kicker: 'NEURAL NETWORKS', title: 'How Far Should the Weight Move?', subtitle: 'The learning rate controls the size of every update', kind: 'rate-cover' },
  { kicker: 'LEARNING OUTCOMES', title: 'Turn a gradient direction into a controlled step', kind: 'rate-objectives' },
  { kicker: 'WHERE WE ARE', title: 'Direction is useful only when we choose a distance', kind: 'rate-journey' },
  { kicker: 'THE LEARNING RATE', title: 'One number controls how boldly the weight moves', kind: 'rate-definition' },
  { kicker: 'THE UPDATE RULE', title: 'New weight equals old weight minus a scaled gradient', kind: 'update-rule' },
  { kicker: 'THE FOUR ROLES', title: 'Each part of the update rule answers one question', kind: 'update-symbols' },
  { kicker: 'ONE COMPLETE UPDATE', title: 'A negative gradient moves this weight upward', kind: 'worked-update', reveal: true },
  { kicker: 'WHY SUBTRACT?', title: 'Subtracting the gradient works for either sign', kind: 'subtract-logic' },
  { kicker: 'ONE LEARNING STEP', title: 'Predict, measure, update, then verify', kind: 'learning-step' },
  { kicker: 'BEFORE AND AFTER', title: 'One controlled step cuts the loss sharply', kind: 'rate-result' },
  { kicker: 'COMPARE STEP SIZES', title: 'Change only the learning rate and the outcome changes', kind: 'rate-comparison' },
  { kicker: 'LIVE LAB', title: 'Change the learning rate and watch the weight move', kind: 'rate-live' },
  { kicker: 'SEE THE TRADE-OFF', title: 'Tiny, useful, and oversized steps land differently', kind: 'rate-curve' },
  { kicker: 'THE TRADE-OFF', title: 'Safe and slow competes with fast and unstable', kind: 'rate-tradeoff' },
  { kicker: 'OVERSHOOTING', title: 'The right direction can still land in a worse place', kind: 'overshoot', reveal: true },
  { kicker: 'REPEATABLE ALGORITHM', title: 'The same arithmetic compares every learning rate', kind: 'rate-algorithm' },
  { kicker: 'FOUR PARTS', title: 'Every learning step has the same four responsibilities', kind: 'four-parts' },
  { kicker: 'KNOWLEDGE CHECK', title: 'Can you calculate an update without notes?', kind: 'rate-check', reveal: true },
  { kicker: 'LESSON 04 RECAP', title: 'Learning rate turns direction into distance', kind: 'rate-recap' },
  { kicker: 'THE NEXT NEED', title: 'One good update is not enough', kind: 'loop-bridge' },
] satisfies SlideMeta[];

const sections: LessonSection[] = [
  { label: 'Orient', at: 0 }, { label: 'Rule', at: 3 }, { label: 'Update', at: 6 },
  { label: 'Compare', at: 10 }, { label: 'Algorithm', at: 15 }, { label: 'Check', at: 17 },
];

const notes: Record<string, PresenterNote> = {
  'rate-cover': { time: '1 min', say: 'Lesson 3 supplied direction. Today adds a controlled distance.', ask: 'Can a correct direction still produce a bad result?' },
  'rate-objectives': { time: '1 min', say: 'Promise one complete update and one comparison of three step sizes.', ask: 'Which sounds riskier: too small or too large?' },
  'rate-journey': { time: '1 min', say: 'Reconstruct all four decisions in order.', ask: 'Which decision remains after the gradient?' },
  'rate-definition': { time: '2 min', say: 'Learning rate is a multiplier—not a direction and not a loss.', ask: 'What happens to the step when the rate doubles?' },
  'update-rule': { time: '2 min', say: 'Read the rule in plain language before using eta notation.', ask: 'Which term controls the size of the move?' },
  'update-symbols': { time: '2 min', say: 'Keep roles separate: location, scale, slope, destination.', ask: 'Which symbol is chosen by the trainer?' },
  'worked-update': { time: '3 min', say: 'Reveal the final weight only after learners handle subtracting a negative.', ask: 'Should the updated weight be above or below 1?' },
  'subtract-logic': { time: '2 min', say: 'Both signs work because subtraction reverses the uphill direction.', ask: 'What does subtracting a positive gradient do?' },
  'learning-step': { time: '2 min', say: 'Translate the original program into four visible arithmetic responsibilities.', ask: 'Why must we check the loss again?' },
  'rate-result': { time: '2 min', say: 'One step moves w from 1 to 1.4643 and loss from 4.6667 to 1.3391.', ask: 'What evidence shows this was a useful update?' },
  'rate-comparison': { time: '3 min', say: 'All conditions stay fixed except eta, making this a fair experiment.', ask: 'Which rate gives the lowest new loss?' },
  'rate-live': { time: '5 min', say: 'Move the rate while the starting weight and gradient stay fixed. Compare the landing point and new loss.', ask: 'Before moving the slider, will this rate improve the loss or overshoot?' },
  'rate-curve': { time: '3 min', say: 'Follow each colored arrow from the same starting point.', ask: 'Which arrow crosses the minimum?' },
  'rate-tradeoff': { time: '2 min', say: 'No single label means universally best; here 0.10 balances speed and stability.', ask: 'Why is safe-but-slow still a cost?' },
  overshoot: { time: '3 min', say: 'Reveal the landing point after learners predict where eta 0.30 goes.', ask: 'Was the gradient direction wrong, or was the step too large?' },
  'rate-algorithm': { time: '3 min', say: 'Use the same gradient and starting weight; only the rate changes.', ask: 'Which arithmetic row produces the new weight?' },
  'four-parts': { time: '2 min', say: 'These four responsibilities become the training loop in Lesson 5.', ask: 'Which part must repeat after the update?' },
  'rate-check': { time: '4 min', say: 'Let learners calculate questions two and three before revealing.', ask: 'Which question explains overshooting?' },
  'rate-recap': { time: '2 min', say: 'Rebuild the relationship among gradient, learning rate, update, and loss.', ask: 'Explain learning rate without using the word speed.' },
  'loop-bridge': { time: '1 min', say: 'The next lesson repeats this step until the model settles.', ask: 'What four actions must a training loop repeat?' },
};

export default function LessonFour() {
  return <PresentationShell courseLessons={courseLessons} lessonNumber="04" notes={notes} sections={sections} slides={slides}>
    {({ slide, revealed }) => <>
      {slide.kind === 'rate-cover' && <div className="cover-layout"><div><p className="chapter">04</p><h1>{slide.title}</h1><p className="subtitle">{slide.subtitle}</p></div><div className="rate-mark"><span>η</span><div><i>small</i><i>useful</i><i>large</i></div></div></div>}
      {slide.kind === 'rate-objectives' && <div className="content-layout objectives-layout"><div className="objectives-copy"><h1>{slide.title}</h1><p>By the end, you should calculate one update and diagnose a bad step size.</p></div><ul className="objective-list"><li><span>01</span><div><strong>Read the update rule</strong><p>Separate weight, gradient, and learning rate.</p></div></li><li><span>02</span><div><strong>Calculate a new weight</strong><p>Handle positive and negative gradients.</p></div></li><li><span>03</span><div><strong>Diagnose step size</strong><p>Recognize slow learning and overshooting.</p></div></li></ul></div>}
      {slide.kind === 'rate-journey' && <div className="content-layout"><h1>{slide.title}</h1><div className="journey-row four"><article><small>01</small><strong>Predict</strong><p>ŷ</p></article><span>→</span><article><small>02</small><strong>Measure</strong><p>loss</p></article><span>→</span><article><small>03</small><strong>Direction</strong><p>gradient</p></article><span>→</span><article className="current"><small>04</small><strong>Distance</strong><p>learning rate</p></article></div></div>}
      {slide.kind === 'rate-definition' && <div className="content-layout"><h1>{slide.title}</h1><div className="rate-definition"><article><strong className="tiny-step">η = 0.01</strong><h2>Cautious</h2><p>Small move, lower risk, more iterations.</p></article><article><strong className="useful-step">η = 0.10</strong><h2>Useful here</h2><p>Large enough to learn, small enough to stay stable.</p></article><article><strong className="huge-step">η = 0.30</strong><h2>Aggressive</h2><p>Can jump past the minimum and increase loss.</p></article></div><p className="takeaway">The learning rate scales the gradient into a step.</p></div>}
      {slide.kind === 'update-rule' && <div className="equation-layout"><h1>{slide.title}</h1><div className="update-equation"><span>w<sub>new</sub></span><b>=</b><span>w<sub>old</sub></span><b>−</b><span className="eta">η</span><b>×</b><span className="grad">gradient</span></div><p>w<sub>new</sub> = w<sub>old</sub> − η · ∂L/∂w</p></div>}
      {slide.kind === 'update-symbols' && <div className="content-layout"><h1>{slide.title}</h1><div className="update-symbol-grid"><article><strong>w<sub>old</sub></strong><span>Current weight</span><p>Where are we now?</p></article><article><strong>η</strong><span>Learning rate</span><p>How large is the step?</p></article><article><strong>∂L/∂w</strong><span>Gradient</span><p>Which way is uphill?</p></article><article><strong>w<sub>new</sub></strong><span>Updated weight</span><p>Where do we land?</p></article></div></div>}
      {slide.kind === 'worked-update' && <div className="content-layout"><h1>{slide.title}</h1><div className="worked-update"><article><small>SUBSTITUTE</small><strong>1.0 − 0.05 × (−9.2867)</strong></article><span>→</span><article><small>SIMPLIFY</small><strong>1.0 + 0.4643</strong></article><span>→</span><article className={revealed ? 'revealed' : ''}><small>NEW WEIGHT</small><strong>{revealed ? '1.4643' : '?'}</strong></article></div><p className="exercise-hint">{revealed ? 'The weight moved upward toward the ideal value 2.0.' : 'Calculate first, then press R'}</p></div>}
      {slide.kind === 'subtract-logic' && <div className="content-layout"><h1>{slide.title}</h1><div className="subtract-grid"><article><small>NEGATIVE GRADIENT</small><strong>w − η(−g)</strong><p>subtract negative = add</p><b>weight increases →</b></article><article><small>POSITIVE GRADIENT</small><strong>w − η(+g)</strong><p>subtract positive = subtract</p><b>← weight decreases</b></article></div><p className="takeaway centered">Both updates move opposite to increasing loss.</p></div>}
      {slide.kind === 'learning-step' && <div className="content-layout"><h1>{slide.title}</h1><div className="step-algorithm">{[['01','Current loss','4.6667'],['02','Gradient','−9.2867'],['03','Update w','1.4643'],['04','New loss','1.3391']].map(([n,label,value]) => <article key={n}><span>{n}</span><small>{label}</small><strong>{value}</strong></article>)}</div></div>}
      {slide.kind === 'rate-result' && <div className="content-layout"><h1>{slide.title}</h1><div className="before-after"><article><small>BEFORE</small><p>w = <strong>1.0000</strong></p><p>loss = <b>4.6667</b></p></article><span>one learning step →</span><article><small>AFTER</small><p>w = <strong>1.4643</strong></p><p>loss = <b>1.3391</b></p></article></div><p className="loss-drop">Loss decreased by <b>71%</b> in one step.</p></div>}
      {slide.kind === 'rate-comparison' && <div className="content-layout"><h1>{slide.title}</h1><p className="fixed-parameter">Start w = 1.0 · gradient = −9.2867 · change only η</p><div className="rate-table"><div className="rate-table-head"><span>Learning rate</span><span>New weight</span><span>New loss</span><span>Result</span></div><div><b>0.01</b><span>1.0929</span><strong>3.8402</strong><em>tiny improvement</em></div><div className="best"><b>0.10</b><span>1.9287</span><strong>0.0237</strong><em>big improvement</em></div><div className="bad"><b>0.30</b><span>3.7860</span><strong>14.8857</strong><em>loss got worse</em></div></div></div>}
      {slide.kind === 'rate-live' && <div className="generated-slide interactive-slide"><h1>{slide.title}</h1><InteractiveLab lab="step-size" /></div>}
      {slide.kind === 'rate-curve' && <div className="content-layout rate-curve-layout"><h1>{slide.title}</h1><LearningRateCurve /></div>}
      {slide.kind === 'rate-tradeoff' && <div className="content-layout"><h1>{slide.title}</h1><div className="rate-tradeoff"><article><small>η = 0.01</small><strong>Too small</strong><p>Safe but slow</p><p>Many steps needed</p><b>Loss decreases slowly</b></article><article className="just-right"><small>η = 0.10</small><strong>Useful here</strong><p>Fast and stable</p><p>Near the minimum</p><b>Loss drops rapidly</b></article><article className="too-large"><small>η = 0.30</small><strong>Too large</strong><p>Jumps past minimum</p><p>Farther than start</p><b>Loss gets worse</b></article></div></div>}
      {slide.kind === 'overshoot' && <div className="content-layout"><h1>{slide.title}</h1><div className="overshoot-stage"><div className="number-line"><span className="start">1.0<small>start</small></span><span className="ideal">2.0<small>ideal</small></span><span className={`landed ${revealed ? 'shown' : ''}`}>{revealed ? '3.79' : '?'}<small>landed</small></span></div><div className={`overshoot-arrow ${revealed ? 'shown' : ''}`}>too far! ⟶</div></div><p className="exercise-hint">{revealed ? 'The direction was correct. The step size was too large.' : 'Predict the landing point, then press R'}</p></div>}
      {slide.kind === 'rate-algorithm' && <div className="content-layout"><h1>{slide.title}</h1><div className="algorithm-table"><div><small>RATE η</small><small>ARITHMETIC: 1 − η(−9.2867)</small><small>CHECK NEW LOSS</small></div><div><span>.01</span><strong>1 + 0.0929 = 1.0929</strong><b>3.8402 ↓</b></div><div><span>.10</span><strong>1 + 0.9287 = 1.9287</strong><b>0.0237 ↓</b></div><div><span>.30</span><strong>1 + 2.7860 = 3.7860</strong><b className="bad-value">14.8857 ↑</b></div></div></div>}
      {slide.kind === 'four-parts' && <div className="content-layout"><h1>{slide.title}</h1><div className="four-part-cycle">{[['01','Calculate current loss'],['02','Calculate gradient'],['03','Update w = w − ηg'],['04','Check the new loss']].map(([n,label]) => <article key={n}><span>{n}</span><strong>{label}</strong></article>)}</div><p className="takeaway centered">This is one learning step. Next, we repeat it.</p></div>}
      {slide.kind === 'rate-check' && <div className="content-layout"><h1>{slide.title}</h1><div className="quiz-grid">{[
        ['01','What does the learning rate control?','The update step size'],['02','g = −4, η = 0.1. Change in w?','+0.4 · weight increases'],['03','g = +6, η = 0.05. Change in w?','−0.3 · weight decreases'],['04','Why can the correct direction worsen loss?','The step can overshoot'],
      ].map(([number,question,answer]) => <article className={revealed ? 'answered' : ''} key={number}><span>{number}</span><p>{question}</p><strong>{revealed ? answer : 'Calculate first…'}</strong></article>)}</div></div>}
      {slide.kind === 'rate-recap' && <div className="content-layout recap-layout recap-layout-single"><div><h1>{slide.title}</h1><ul className="recap-list"><li>The gradient supplies the direction.</li><li>The learning rate <b>η</b> scales the step size.</li><li>The update is <b>w<sub>new</sub> = w<sub>old</sub> − ηg</b>.</li><li>Small rates learn slowly; large rates can overshoot.</li><li>Always verify that the new loss went down.</li></ul></div></div>}
      {slide.kind === 'loop-bridge' && <div className="bridge-layout"><h1>{slide.title}</h1><div className="loop-preview"><span>predict</span><b>→</b><span>loss</span><b>→</b><span>gradient</span><b>→</b><span>update</span><b>↻</b></div><p className="next-question">Training repeats the learning step until the parameters settle.</p><span className="next-lesson">NEXT · LESSON 05</span></div>}
    </>}
  </PresentationShell>;
}
