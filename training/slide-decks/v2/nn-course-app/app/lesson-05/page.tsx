'use client';

import { courseLessons } from '../course-data';
import { InteractiveLab } from '../interactive-labs';
import { PresentationShell, type LessonSection, type PresenterNote, type SlideMeta } from '../presentation-shell';
import { TrainingConvergenceChart } from '../training-convergence-chart';

const slides = [
  { kicker: 'NEURAL NETWORKS', title: 'Make the Neuron Learn Repeatedly', subtitle: 'One update becomes a training loop', kind: 'loop-cover' },
  { kicker: 'LEARNING OUTCOMES', title: 'Turn one useful update into reliable learning', kind: 'loop-objectives' },
  { kicker: 'WHERE WE ARE', title: 'The fifth ingredient is repetition', kind: 'loop-journey' },
  { kicker: 'THE NEED', title: 'One good update is only the beginning', kind: 'one-step' },
  { kicker: 'THE TRAINING LOOP', title: 'Calculate, update, and begin again', kind: 'loop-rule' },
  { kicker: 'ONE ITERATION', title: 'Each trip around the loop is one training step', kind: 'iteration' },
  { kicker: 'RECALCULATE', title: 'A new weight lives on a new slope', kind: 'recalculate' },
  { kicker: 'TEN STEPS', title: 'The same four responsibilities repeat', kind: 'ten-step-algorithm' },
  { kicker: 'TRAINING RECORD', title: 'The weight settles as the loss disappears', kind: 'training-table' },
  { kicker: 'LIVE LAB', title: 'Run the training loop yourself', kind: 'training-live' },
  { kicker: 'READ THE PATTERN', title: 'Large corrections naturally become small refinements', kind: 'training-pattern' },
  { kicker: 'WHY NOT EXACTLY 2?', title: 'The estimated gradient stops slightly early', kind: 'approximation' },
  { kicker: 'COMPARE RATES', title: 'Ten steps expose speed and stability', kind: 'rate-results' },
  { kicker: 'LOSS OVER TIME', title: 'Stable learning falls while divergence explodes', kind: 'convergence-chart' },
  { kicker: 'DIVERGENCE', title: 'With η = 0.30, every overshoot grows', kind: 'divergence-story' },
  { kicker: 'WHY IT FAILS', title: 'A large rate creates a feedback loop in the wrong direction', kind: 'divergence-explain' },
  { kicker: 'THE COMPLETE PROCESS', title: 'Every neural network trains with the same five-part pattern', kind: 'complete-process' },
  { kicker: 'KNOWLEDGE CHECK', title: 'Can you diagnose a training run?', kind: 'loop-check', reveal: true },
  { kicker: 'LESSON 05 RECAP', title: 'Learning is repeated correction', kind: 'loop-recap' },
  { kicker: 'THE NEXT NEED', title: 'Approximation worked—now make the gradient exact', kind: 'derivative-bridge' },
] satisfies SlideMeta[];

const sections: LessonSection[] = [
  { label: 'Orient', at: 0 }, { label: 'Loop', at: 3 }, { label: 'Train', at: 7 },
  { label: 'Compare', at: 12 }, { label: 'System', at: 16 }, { label: 'Check', at: 17 },
];

const notes: Record<string, PresenterNote> = {
  'loop-cover': { time: '1 min', say: 'Lesson 4 made one controlled update. This lesson turns that update into learning.', ask: 'Why is one good step usually not enough?' },
  'loop-objectives': { time: '1 min', say: 'Learners will run, read, and diagnose a training loop.', ask: 'What evidence would convince you that the neuron learned?' },
  'loop-journey': { time: '1 min', say: 'Rebuild the course sequence from prediction to repetition.', ask: 'Which earlier four ingredients must repeat?' },
  'one-step': { time: '2 min', say: 'The first update improves the model but does not finish the job.', ask: 'What should happen after checking the new loss?' },
  'loop-rule': { time: '2 min', say: 'Read the loop clockwise. Every arrow means use the newly updated weight.', ask: 'Where does the loop begin again?' },
  iteration: { time: '2 min', say: 'Step and iteration mean one complete pass through the update cycle.', ask: 'Name two sensible reasons to stop training.' },
  recalculate: { time: '3 min', say: 'A gradient belongs to one location on the loss curve. Moving invalidates it.', ask: 'Why is the old gradient no longer trustworthy?' },
  'ten-step-algorithm': { time: '3 min', say: 'Translate the program into four arithmetic responsibilities inside a repeat frame.', ask: 'Which value must be recalculated first on the next step?' },
  'training-table': { time: '3 min', say: 'Trace the rapid early progress and the tiny later refinements.', ask: 'Between which steps does the largest improvement happen?' },
  'training-live': { time: '5 min', say: 'Predict the behavior, choose a rate, then animate ten steps.', ask: 'Will this rate crawl, converge, or diverge?' },
  'training-pattern': { time: '3 min', say: 'Connect each observed pattern to the changing gradient.', ask: 'Why do updates shrink near the minimum?' },
  approximation: { time: '2 min', say: 'The small-change estimate reports a near-zero slope at 1.9995.', ask: 'Is 1.9995 a training failure?' },
  'rate-results': { time: '3 min', say: 'All three runs use the same data and ten steps; only the rate changes.', ask: 'Which rate best balances speed and stability here?' },
  'convergence-chart': { time: '3 min', say: 'The vertical axis is logarithmic so tiny and enormous losses fit together.', ask: 'Which line shows divergence most clearly?' },
  'divergence-story': { time: '3 min', say: 'Follow the sign flip and growing magnitude step by step.', ask: 'What is growing: only the weight, only the loss, or both?' },
  'divergence-explain': { time: '2 min', say: 'Each oversized landing creates a steeper gradient, which creates an even larger next jump.', ask: 'How could we break this feedback loop?' },
  'complete-process': { time: '3 min', say: 'This five-part loop remains the core of every larger neural network.', ask: 'Which part tells us whether the update helped?' },
  'loop-check': { time: '4 min', say: 'Pause before revealing. Require an explanation for every answer.', ask: 'Which answer connects slope, step size, and stability?' },
  'loop-recap': { time: '2 min', say: 'Summarize training as repeated correction guided by fresh gradients.', ask: 'Explain why the first step is usually the largest.' },
  'derivative-bridge': { time: '1 min', say: 'Lesson 6 replaces the small-change estimate with the exact chain-rule derivative.', ask: 'What would improve if the gradient were exact?' },
};

export default function LessonFive() {
  return <PresentationShell courseLessons={courseLessons} lessonNumber="05" notes={notes} sections={sections} slides={slides}>
    {({ slide, revealed }) => <>
      {slide.kind === 'loop-cover' && <div className="cover-layout"><div><p className="chapter">05</p><h1>{slide.title}</h1><p className="subtitle">{slide.subtitle}</p></div><div className="loop-mark" aria-hidden="true"><span>1</span><b>→</b><span>2</span><b>→</b><span>3</span><i>↻</i></div></div>}
      {slide.kind === 'loop-objectives' && <div className="content-layout objectives-layout"><div className="objectives-copy"><h1>{slide.title}</h1><p>By the end, you should explain convergence, recognize divergence, and read a training record.</p></div><ul className="objective-list"><li><span>01</span><div><strong>Run the loop</strong><p>Repeat loss, gradient, and update.</p></div></li><li><span>02</span><div><strong>Read convergence</strong><p>Connect smaller slopes to smaller steps.</p></div></li><li><span>03</span><div><strong>Diagnose divergence</strong><p>Recognize growing overshoots.</p></div></li></ul></div>}
      {slide.kind === 'loop-journey' && <div className="content-layout"><h1>{slide.title}</h1><div className="training-journey">{[['01','Predict'],['02','Measure'],['03','Direction'],['04','Step size'],['05','Repeat']].map(([number,label], index) => <article className={index === 4 ? 'current' : ''} key={number}><small>{number}</small><strong>{label}</strong></article>)}</div></div>}
      {slide.kind === 'one-step' && <div className="content-layout"><h1>{slide.title}</h1><div className="single-step-story"><article><small>START</small><strong>w = 1.0000</strong><p>loss = 4.6667</p></article><span>one update →</span><article className="improved"><small>BETTER</small><strong>w = 1.9329</strong><p>loss = 0.0210</p></article><b>not finished</b></div><p className="takeaway">The next improvement needs a fresh gradient at the new weight.</p></div>}
      {slide.kind === 'loop-rule' && <div className="content-layout"><h1>{slide.title}</h1><div className="training-loop-ring"><article><span>01</span><strong>Calculate loss</strong></article><b>→</b><article><span>02</span><strong>Calculate gradient</strong></article><b>→</b><article><span>03</span><strong>Update weight</strong></article><b>↻</b></div><p className="takeaway">Repeat with the new weight.</p></div>}
      {slide.kind === 'iteration' && <div className="content-layout"><h1>{slide.title}</h1><div className="iteration-layout"><div><small>ONE STEP · ONE ITERATION</small><strong>loss → gradient → update</strong></div><div className="stop-conditions"><article><span>STOP WHEN</span><b>loss is small enough</b></article><article><span>OR WHEN</span><b>the planned steps are complete</b></article></div></div></div>}
      {slide.kind === 'recalculate' && <div className="content-layout"><h1>{slide.title}</h1><div className="slope-change"><article><small>OLD POSITION</small><strong>w = 1.0000</strong><p>gradient ≈ −9.33</p><i>steep slope</i></article><span>move →</span><article><small>NEW POSITION</small><strong>w = 1.9329</strong><p>gradient ≈ −0.62</p><i>gentle slope</i></article></div><p className="takeaway"><b>Old gradient + new weight = wrong update.</b> Recalculate every time.</p></div>}
      {slide.kind === 'ten-step-algorithm' && <div className="content-layout"><h1>{slide.title}</h1><div className="repeat-frame"><span>REPEAT × 10</span><div className="four-part-cycle">{[['01','Measure current loss'],['02','Find current gradient'],['03','Update the weight'],['04','Measure new loss']].map(([number,label]) => <article key={number}><span>{number}</span><strong>{label}</strong></article>)}</div></div></div>}
      {slide.kind === 'training-table' && <div className="content-layout"><h1>{slide.title}</h1><div className="training-record"><div className="training-record-head"><span>Step</span><span>Weight</span><span>Loss</span><span>What changed?</span></div>{[['0','1.0000','4.666667','starting point'],['1','1.9329','0.021032','largest jump'],['2','1.9951','0.000114','close to minimum'],['3','1.9992','0.000003','tiny refinement'],['10','1.9995','0.000001','settled']].map((row) => <div key={row[0]}>{row.map((cell,index) => <span key={cell} className={index === 2 ? 'loss-cell' : ''}>{cell}</span>)}</div>)}</div></div>}
      {slide.kind === 'training-live' && <div className="generated-slide interactive-slide"><h1>{slide.title}</h1><InteractiveLab lab="descent" /></div>}
      {slide.kind === 'training-pattern' && <div className="content-layout"><h1>{slide.title}</h1><div className="pattern-evidence">{[['Biggest jump at step 1','The gradient is largest far from the minimum'],['Steps get smaller','The gradient shrinks near the minimum'],['Weight settles near 1.9995','The ideal weight is 2.0'],['Loss falls near zero','Predictions match the data'],['4 km predicts ≈ 13 min','The neuron learned the rule']].map(([observation,reason],index) => <article key={observation}><span>{String(index+1).padStart(2,'0')}</span><strong>{observation}</strong><p>{reason}</p></article>)}</div></div>}
      {slide.kind === 'approximation' && <div className="content-layout"><h1>{slide.title}</h1><div className="approximation-scale"><article><small>TRUE MINIMUM</small><strong>2.0000</strong></article><span>difference = 0.0005</span><article><small>ESTIMATED STOP</small><strong>1.9995</strong></article></div><p className="takeaway">The small-change estimate is close, but not exact. Lesson 6 replaces it with a derivative.</p></div>}
      {slide.kind === 'rate-results' && <div className="content-layout"><h1>{slide.title}</h1><div className="rate-table"><div className="rate-table-head"><span>Learning rate</span><span>Weight after 10</span><span>Final loss</span><span>Behavior</span></div><div><b>0.01</b><span>1.624303</span><strong>0.658692</strong><em>slow</em></div><div className="best"><b>0.10</b><span>1.999500</span><strong>0.000001</strong><em>fast + stable</em></div><div className="bad"><b>0.30</b><span>−354.868699</span><strong>594,324.586530</strong><em>exploded</em></div></div></div>}
      {slide.kind === 'convergence-chart' && <div className="content-layout training-chart-layout"><h1>{slide.title}</h1><TrainingConvergenceChart /></div>}
      {slide.kind === 'divergence-story' && <div className="content-layout"><h1>{slide.title}</h1><div className="divergence-timeline">{[['0','1.00','4.67'],['1','3.80','15.10'],['2','−1.24','48.95'],['3','7.83','158.54'],['4','−8.49','513.80']].map(([step,weight,runLoss]) => <article key={step}><small>STEP {step}</small><strong>{weight}</strong><span>loss {runLoss}</span></article>)}</div><p className="danger-takeaway">The weight flips sides while both distance and loss grow.</p></div>}
      {slide.kind === 'divergence-explain' && <div className="content-layout"><h1>{slide.title}</h1><div className="feedback-loop"><span>overshoot</span><b>→</b><span>steeper slope</span><b>→</b><span>larger update</span><b>→</b><span>worse overshoot</span><b>↻</b></div><p className="takeaway">This runaway pattern is called <b>divergence</b>.</p></div>}
      {slide.kind === 'complete-process' && <div className="content-layout"><h1>{slide.title}</h1><div className="five-part-process">{[['01','Predict','Use the current weight'],['02','Measure','Calculate the loss'],['03','Direction','Calculate the gradient'],['04','Move','Update the weight'],['05','Repeat','Continue until settled']].map(([number,title,detail]) => <article key={number}><span>{number}</span><strong>{title}</strong><p>{detail}</p></article>)}</div><p className="takeaway">This same core loop trains every deep network.</p></div>}
      {slide.kind === 'loop-check' && <div className="content-layout"><h1>{slide.title}</h1><div className="quiz-grid">{[['01','Why recalculate the gradient?','The slope changes after the weight moves'],['02','Why do updates shrink near the minimum?','The gradient becomes smaller'],['03','What does η = 0.01 do in 10 steps?','Learns safely, but remains short of 2.0'],['04','Why does η = 0.30 diverge?','Each overshoot creates an even larger next update']].map(([number,question,answer]) => <article className={revealed ? 'answered' : ''} key={number}><span>{number}</span><p>{question}</p><strong>{revealed ? answer : 'Think first…'}</strong></article>)}</div></div>}
      {slide.kind === 'loop-recap' && <div className="content-layout recap-layout recap-layout-single"><div><h1>{slide.title}</h1><ul className="recap-list"><li>Training repeats loss, gradient, and update calculations.</li><li>The gradient must be refreshed at every new weight.</li><li>Updates shrink as the model approaches the minimum.</li><li>A useful learning rate converges; an oversized one diverges.</li><li>After ten stable steps, the neuron predicts 4 km in about <b>13 minutes</b>.</li></ul></div></div>}
      {slide.kind === 'derivative-bridge' && <div className="bridge-layout"><h1>{slide.title}</h1><div className="bridge-compare"><div><small>NOW</small><strong>Estimated gradient</strong><p>small-change measurement</p></div><span>→</span><div><small>NEXT</small><strong>Exact gradient</strong><p>chain rule derivative</p></div></div><p className="next-question">Can calculus give us the slope directly?</p><span className="next-lesson">NEXT · LESSON 06</span></div>}
    </>}
  </PresentationShell>;
}
