'use client';

import { courseLessons } from '../course-data';
import { LossCurve } from '../loss-curve';
import { PresentationShell, type LessonSection, type PresenterNote, type SlideMeta } from '../presentation-shell';

const slides = [
  { kicker: 'NEURAL NETWORKS', title: 'Which Direction Should the Weight Move?', subtitle: 'The gradient points toward lower loss', kind: 'gradient-cover' },
  { kicker: 'LEARNING OUTCOMES', title: 'Use slope to choose a better weight direction', kind: 'gradient-objectives' },
  { kicker: 'WHERE WE ARE', title: 'Prediction and loss now lead to direction', kind: 'gradient-journey' },
  { kicker: 'THE SCALE PROBLEM', title: 'A real neuron cannot try every possible weight', kind: 'weight-search', reveal: true },
  { kicker: 'THE GRADIENT', title: 'The gradient is the slope of loss at the current weight', kind: 'gradient-definition' },
  { kicker: 'READ THE SIGN', title: 'The sign tells us which direction lowers loss', kind: 'gradient-signs' },
  { kicker: 'LOSS LANDSCAPE', title: 'Both slopes point toward the minimum', kind: 'loss-hill' },
  { kicker: 'TINY EXPERIMENT', title: 'Estimate slope by nudging the weight', kind: 'finite-difference' },
  { kicker: 'CALCULATE THE SLOPE', title: 'A negative change in loss gives a negative gradient', kind: 'gradient-calculation', reveal: true },
  { kicker: 'REUSABLE LOSS RECIPE', title: 'First, define one consistent way to calculate loss', kind: 'gradient-loss-code' },
  { kicker: 'THE ESTIMATION ALGORITHM', title: 'Measure loss before and after a tiny change', kind: 'gradient-code' },
  { kicker: 'OBSERVED OUTPUT', title: 'At w = 1, increasing weight lowers loss', kind: 'gradient-output' },
  { kicker: 'BOTH SIDES', title: 'Negative on the left; positive on the right', kind: 'both-sides', reveal: true },
  { kicker: 'REPEAT THE TEST', title: 'The same procedure works on both sides', kind: 'both-sides-code' },
  { kicker: 'THE SHARED DESTINATION', title: 'Both gradients lead back toward w = 2', kind: 'toward-minimum' },
  { kicker: 'GRADIENT DESCENT', title: 'Move opposite to the gradient to reduce loss', kind: 'opposite-gradient' },
  { kicker: 'ONE LIMIT', title: 'Direction is not distance', kind: 'direction-distance' },
  { kicker: 'KNOWLEDGE CHECK', title: 'Can you choose the direction from the gradient?', kind: 'gradient-check', reveal: true },
  { kicker: 'THE NEXT DECISION', title: 'We know which way—but how far should we move?', kind: 'learning-rate-bridge' },
] satisfies SlideMeta[];

const sections: LessonSection[] = [
  { label: 'Orient', at: 0 }, { label: 'Meaning', at: 4 }, { label: 'Estimate', at: 7 },
  { label: 'Code', at: 9 }, { label: 'Descent', at: 14 }, { label: 'Check', at: 17 },
];

const notes: Record<string, PresenterNote> = {
  'gradient-cover': { time: '1 min', say: 'Loss tells us whether one model is better; gradient tells us which local direction improves it.', ask: 'If loss is high, what decision must the neuron make next?' },
  'gradient-objectives': { time: '1 min', say: 'Keep the promise focused on direction, not step size.', ask: 'What does slope mean outside machine learning?' },
  'gradient-journey': { time: '1 min', say: 'Rebuild the course chain: predict, measure, choose direction.', ask: 'Which lesson supplied each piece?' },
  'weight-search': { time: '2 min', say: 'Weights are continuous; exhaustive trial is impossible in a large network.', ask: 'What question could replace trying every value?' },
  'gradient-definition': { time: '2 min', say: 'Read the notation aloud: how loss changes when weight changes.', ask: 'What are the two changing quantities in this fraction?' },
  'gradient-signs': { time: '2 min', say: 'Separate what the gradient reports from the action gradient descent takes.', ask: 'If increasing w raises loss, which way should w move?' },
  'loss-hill': { time: '3 min', say: 'Trace left slope, right slope, and bottom. The gradient is local slope, not the full curve.', ask: 'Where is the gradient zero?' },
  'finite-difference': { time: '2 min', say: 'A tiny nudge creates a rise-over-run estimate.', ask: 'Why should the weight change be small?' },
  'gradient-calculation': { time: '3 min', say: 'Calculate numerator, denominator, and quotient in that order.', ask: 'What does the negative result predict?' },
  'gradient-loss-code': { time: '3 min', say: 'This is the Lesson 2 MSE calculation expressed as a reusable input-output recipe.', ask: 'What does the recipe return?' },
  'gradient-code': { time: '3 min', say: 'Only one new idea appears: calculate loss again after adding 0.01.', ask: 'Which row represents the tiny nudge?' },
  'gradient-output': { time: '2 min', say: 'The loss fell from 4.6667 to 4.5738; that makes the estimated slope negative.', ask: 'Does increasing w look helpful at w = 1?' },
  'both-sides': { time: '3 min', say: 'Reveal the movement arrows after learners interpret both signs.', ask: 'What direction should each starting weight move?' },
  'both-sides-code': { time: '2 min', say: 'The same calculation works anywhere on the loss curve; only the starting weight changes.', ask: 'Why do the final actions differ?' },
  'toward-minimum': { time: '2 min', say: 'Emphasize that opposite signs can recommend movement toward the same destination.', ask: 'What weight are both updates approaching?' },
  'opposite-gradient': { time: '3 min', say: 'Gradient points uphill—toward increasing loss. Descent uses its negative.', ask: 'What happens when we subtract a negative number?' },
  'direction-distance': { time: '2 min', say: 'Do not introduce the learning-rate formula yet. Establish the missing decision.', ask: 'What can happen if the step is too large?' },
  'gradient-check': { time: '4 min', say: 'Learners should answer direction questions without calculating a derivative.', ask: 'Which question cannot be answered from gradient alone?' },
  'learning-rate-bridge': { time: '1 min', say: 'End with the overshoot risk. Lesson 4 supplies step size.', ask: 'How could one number control the size of every update?' },
};

export default function LessonThree() {
  return <PresentationShell courseLessons={courseLessons} lessonNumber="03" notes={notes} sections={sections} slides={slides}>
    {({ slide, revealed }) => <>
      {slide.kind === 'gradient-cover' && <div className="cover-layout"><div><p className="chapter">03</p><h1>{slide.title}</h1><p className="subtitle">{slide.subtitle}</p></div><div className="gradient-mark"><span>∂L</span><i>∂w</i><b>↓</b></div></div>}
      {slide.kind === 'gradient-objectives' && <div className="content-layout objectives-layout"><div className="objectives-copy"><h1>{slide.title}</h1><p>By the end, a gradient sign should immediately suggest a movement direction.</p></div><ul className="objective-list"><li><span>01</span><div><strong>Interpret the gradient</strong><p>Read it as the local slope of loss.</p></div></li><li><span>02</span><div><strong>Estimate a gradient</strong><p>Use a tiny weight change and two losses.</p></div></li><li><span>03</span><div><strong>Choose a direction</strong><p>Move opposite to increasing loss.</p></div></li></ul></div>}
      {slide.kind === 'gradient-journey' && <div className="content-layout"><h1>{slide.title}</h1><div className="journey-row"><article><small>LESSON 01</small><strong>Predict</strong><p>ŷ = wx + b</p></article><span>→</span><article><small>LESSON 02</small><strong>Measure</strong><p>MSE</p></article><span>→</span><article className="current"><small>LESSON 03</small><strong>Choose direction</strong><p>gradient</p></article></div></div>}
      {slide.kind === 'weight-search' && <div className="content-layout"><h1>{slide.title}</h1><div className="weight-search"><div>{['1.000','1.001','1.002','…','1.999','2.000','…'].map((value) => <span key={value}>{value}</span>)}</div><p className={revealed ? 'revealed' : ''}>{revealed ? 'Ask one local question: “If w increases slightly, does loss rise or fall?”' : 'There are infinitely many possible weights. Press R for the better question.'}</p></div></div>}
      {slide.kind === 'gradient-definition' && <div className="equation-layout"><h1>{slide.title}</h1><div className="gradient-formula"><span>∂L</span><span>∂w</span></div><p>“How does the loss change when I change the weight?”</p></div>}
      {slide.kind === 'gradient-signs' && <div className="content-layout"><h1>{slide.title}</h1><div className="gradient-sign-grid"><article><strong>−</strong><h2>Increasing w lowers loss</h2><p>Increase the weight</p></article><article><strong>0</strong><h2>Loss is flat here</h2><p>No directional update</p></article><article><strong>+</strong><h2>Increasing w raises loss</h2><p>Decrease the weight</p></article></div></div>}
      {slide.kind === 'loss-hill' && <div className="content-layout hill-layout"><h1>{slide.title}</h1><LossCurve /></div>}
      {slide.kind === 'finite-difference' && <div className="content-layout"><h1>{slide.title}</h1><div className="nudge-stage"><article><small>BEFORE</small><strong>w = 1.00</strong><p>loss = 4.6667</p></article><span>+ 0.01 →</span><article><small>AFTER</small><strong>w = 1.01</strong><p>loss = 4.5738</p></article></div><p className="takeaway centered">Weight went up while loss went down: the slope must be negative.</p></div>}
      {slide.kind === 'gradient-calculation' && <div className="content-layout"><h1>{slide.title}</h1><div className="gradient-calc"><div><small>CHANGE IN LOSS</small><strong>4.5738 − 4.6667</strong><b>−0.0929</b></div><span>÷</span><div><small>CHANGE IN WEIGHT</small><strong>1.01 − 1.00</strong><b>0.01</b></div><span>=</span><div className={revealed ? 'revealed' : ''}><small>ESTIMATED GRADIENT</small><strong>{revealed ? '−9.29' : '?'}</strong><b>{revealed ? 'increase w' : 'Press R'}</b></div></div></div>}
      {slide.kind === 'gradient-loss-code' && <div className="content-layout code-layout"><div><h1>{slide.title}</h1><p className="subtitle">Input a weight and bias. Output one MSE value.</p></div><div className="algorithm-table"><div><small>STEP</small><small>OPERATION</small><small>OUTPUT</small></div>{[
        ['01','Use x = 1, 2, 3 and y = 7, 9, 11','paired examples'],['02','Predict each ŷ = wx + b','three predictions'],['03','Calculate (ŷ − y)²','three squared errors'],['04','Average the squared errors','one loss'],
      ].map(([step,operation,result]) => <div key={step}><span>{step}</span><strong>{operation}</strong><b>{result}</b></div>)}</div></div>}
      {slide.kind === 'gradient-code' && <div className="content-layout"><h1>{slide.title}</h1><div className="estimate-algorithm">{[
        ['01','Start','w = 1.00 · b = 5'],['02','Measure','loss before = 4.6667'],['03','Nudge','w + 0.01 = 1.01'],['04','Measure again','loss after = 4.5738'],['05','Divide changes','−0.0929 ÷ 0.01 = −9.2867'],
      ].map(([step,title,result]) => <article key={step}><span>{step}</span><small>{title}</small><strong>{result}</strong></article>)}</div></div>}
      {slide.kind === 'gradient-output' && <div className="content-layout"><h1>{slide.title}</h1><div className="terminal-output"><p>Loss at weight 1.00: <b>4.6667</b></p><p>Loss at weight 1.01: <b>4.5738</b></p><p>Estimated gradient: <strong>−9.2867</strong></p></div><p className="takeaway centered">The loss decreased, so moving toward a larger weight is helpful.</p></div>}
      {slide.kind === 'both-sides' && <div className="content-layout"><h1>{slide.title}</h1><div className="side-test"><article><small>LEFT OF MINIMUM</small><strong>w = 1.0</strong><p>gradient <b>−9.29</b></p><em>{revealed ? 'increase → toward 2' : 'direction?'}</em></article><span>w = 2</span><article><small>RIGHT OF MINIMUM</small><strong>w = 3.0</strong><p>gradient <b>+9.38</b></p><em>{revealed ? 'decrease → toward 2' : 'direction?'}</em></article></div></div>}
      {slide.kind === 'both-sides-code' && <div className="content-layout"><h1>{slide.title}</h1><div className="side-procedure"><div className="side-procedure-head"><span>START</span><span>LOSS BEFORE</span><span>LOSS AFTER +0.01</span><span>GRADIENT</span><span>ACTION</span></div><div><b>w = 1.0</b><span>4.6667</span><span>4.5738</span><strong>−9.2867</strong><em>increase</em></div><div><b>w = 3.0</b><span>4.6667</span><span>4.7605</span><strong>+9.3800</strong><em>decrease</em></div></div><p className="takeaway centered">Same recipe. Different sign. Both actions move toward w = 2.</p></div>}
      {slide.kind === 'toward-minimum' && <div className="content-layout hill-layout"><h1>{slide.title}</h1><LossCurve showTangents={false} /><p className="curve-caption">Different signs. Same destination. Both updates move toward lower loss.</p></div>}
      {slide.kind === 'opposite-gradient' && <div className="content-layout"><h1>{slide.title}</h1><div className="opposite-rule"><div><small>GRADIENT</small><strong>points uphill</strong><p>direction of increasing loss</p></div><span>× −1</span><div><small>IMPROVEMENT</small><strong>points downhill</strong><p>direction of decreasing loss</p></div></div><div className="direction-formula">direction of improvement = <b>−gradient</b></div></div>}
      {slide.kind === 'direction-distance' && <div className="content-layout"><h1>{slide.title}</h1><div className="distance-contrast"><article><small>TOO LITTLE</small><span>→</span><span>→</span><span>→</span><strong>Learning is slow</strong></article><article><small>TOO FAR</small><span className="long-step">⟶</span><b>minimum</b><span className="overshoot">⟶</span><strong>You overshoot</strong></article></div><p className="next-question centered">The gradient gives direction. The learning rate will choose distance.</p></div>}
      {slide.kind === 'gradient-check' && <div className="content-layout"><h1>{slide.title}</h1><div className="quiz-grid">{[
        ['01','What does a negative gradient mean?','Increasing w lowers loss'],['02','Positive gradient: increase or decrease w?','Decrease the weight'],['03','What does a zero gradient mean?','Loss is locally flat'],['04','Does gradient tell us how far to move?','No—only direction'],
      ].map(([number,question,answer]) => <article className={revealed ? 'answered' : ''} key={number}><span>{number}</span><p>{question}</p><strong>{revealed ? answer : 'Think first…'}</strong></article>)}</div></div>}
      {slide.kind === 'learning-rate-bridge' && <div className="bridge-layout"><h1>{slide.title}</h1><div className="step-choice"><span>tiny step</span><span>useful step</span><span>huge step</span></div><p className="next-question">The learning rate controls the step size—and the wrong value can make training crawl or explode.</p><span className="next-lesson">NEXT · LESSON 04</span></div>}
    </>}
  </PresentationShell>;
}
