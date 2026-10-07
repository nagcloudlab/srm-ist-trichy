'use client';

import { courseLessons } from '../course-data';
import { InteractiveLab } from '../interactive-labs';
import { PresentationShell, type LessonSection, type PresenterNote, type SlideMeta } from '../presentation-shell';

const slides = [
  { kicker: 'NEURAL NETWORKS', title: 'Calculate the Gradient Directly', subtitle: 'The chain rule replaces estimation with an exact slope', kind: 'exact-cover' },
  { kicker: 'LEARNING OUTCOMES', title: 'Follow cause and effect from weight to loss', kind: 'exact-objectives' },
  { kicker: 'WHERE WE ARE', title: 'Repetition works better with an exact gradient', kind: 'exact-journey' },
  { kicker: 'THE PROBLEM', title: 'The small-change method is useful—but approximate', kind: 'estimate-problem' },
  { kicker: 'OLD METHOD', title: 'Estimation measures a tiny before-and-after difference', kind: 'estimate-arithmetic' },
  { kicker: 'THE CHAIN', title: 'The weight reaches loss through four connected effects', kind: 'chain-path' },
  { kicker: 'ONE EXAMPLE', title: 'Hold one data point in view from start to finish', kind: 'example-setup' },
  { kicker: 'STEPS 1–2', title: 'Prediction creates the error', kind: 'prediction-error' },
  { kicker: 'STEP 3', title: 'Two local derivatives describe two links', kind: 'local-derivatives' },
  { kicker: 'STEP 4', title: 'The chain rule multiplies the links', kind: 'chain-multiply' },
  { kicker: 'LIVE LAB', title: 'Move the weight and watch the exact gradient respond', kind: 'exact-live' },
  { kicker: 'INTUITION', title: 'The contribution 2ex combines wrongness and influence', kind: 'gradient-intuition' },
  { kicker: 'ALL EXAMPLES', title: 'Every example contributes its own vote', kind: 'contribution-table' },
  { kicker: 'AVERAGE THEM', title: 'MSE averages the three gradient contributions', kind: 'average-gradient' },
  { kicker: 'EXACT TRAINING', title: 'The algorithm is simpler when the slope has a formula', kind: 'exact-algorithm' },
  { kicker: 'TRAINING RECORD', title: 'Exact gradients reach exactly w = 2', kind: 'exact-record' },
  { kicker: 'COMPARE METHODS', title: 'Exact is cleaner, faster, and more accurate', kind: 'method-comparison' },
  { kicker: 'FORMULA TO REMEMBER', title: 'Error × input is the heart of the weight gradient', kind: 'remember-formula' },
  { kicker: 'KNOWLEDGE CHECK', title: 'Can you explain the chain rule in plain language?', kind: 'exact-check', reveal: true },
  { kicker: 'LESSON 06 RECAP', title: 'Local effects multiply; examples average', kind: 'exact-recap' },
  { kicker: 'THE NEXT NEED', title: 'The bias needs its own gradient', kind: 'bias-bridge' },
] satisfies SlideMeta[];

const sections: LessonSection[] = [
  { label: 'Orient', at: 0 }, { label: 'Problem', at: 3 }, { label: 'Derive', at: 5 },
  { label: 'Average', at: 11 }, { label: 'Train', at: 14 }, { label: 'Check', at: 18 },
];

const notes: Record<string, PresenterNote> = {
  'exact-cover': { time: '1 min', say: 'Lesson 5 proved repeated updates work. Now remove the approximation.', ask: 'What could improve if the slope were exact?' },
  'exact-objectives': { time: '1 min', say: 'Promise one complete derivation, one dataset average, and one comparison.', ask: 'Which sounds more useful: memorizing a formula or understanding its links?' },
  'exact-journey': { time: '1 min', say: 'Place exact gradients as the sixth ingredient in the learning system.', ask: 'Which earlier lesson introduced the approximate gradient?' },
  'estimate-problem': { time: '2 min', say: 'The estimate depends on an arbitrary small change and stops slightly early.', ask: 'What could go wrong if the nudge is too large?' },
  'estimate-arithmetic': { time: '2 min', say: 'Read the numerator as change in loss and the denominator as change in weight.', ask: 'How many loss calculations does this estimate need?' },
  'chain-path': { time: '3 min', say: 'The weight affects loss indirectly through prediction and error.', ask: 'Which link contains the input x?' },
  'example-setup': { time: '1 min', say: 'Keep x=2, y=9, w=1, and b=5 visible for the full derivation.', ask: 'What prediction do these values produce?' },
  'prediction-error': { time: '2 min', say: 'Calculate the forward values first: prediction 7, error minus 2.', ask: 'Does the negative error mean too high or too low?' },
  'local-derivatives': { time: '3 min', say: 'Each derivative answers how one quantity changes another.', ask: 'Why does dŷ/dw equal x?' },
  'chain-multiply': { time: '3 min', say: 'Multiply minus 4 by 2 to get this example’s gradient contribution minus 8.', ask: 'Which sign should the weight update have?' },
  'exact-live': { time: '5 min', say: 'Change weight and input independently. Read the prediction, loss, and exact gradient together.', ask: 'Where does the gradient become zero?' },
  'gradient-intuition': { time: '2 min', say: 'Error measures wrongness; input measures how strongly this weight matters.', ask: 'Why should a larger input create a larger contribution?' },
  'contribution-table': { time: '3 min', say: 'Calculate 2ex for each row before revealing the total.', ask: 'Which example has the strongest vote, and why?' },
  'average-gradient': { time: '3 min', say: 'Because the loss is a mean, its gradient is a mean too.', ask: 'What exact average do minus 2, minus 8, and minus 18 produce?' },
  'exact-algorithm': { time: '3 min', say: 'The projected algorithm keeps the arithmetic responsibilities, not Python syntax.', ask: 'What disappeared from the old procedure?' },
  'exact-record': { time: '3 min', say: 'Trace the gradient collapsing to zero as the weight reaches exactly two.', ask: 'At which step is the model effectively finished?' },
  'method-comparison': { time: '3 min', say: 'Compare the methods row by row, especially accuracy and number of loss calculations.', ask: 'Which advantage matters most for a large network?' },
  'remember-formula': { time: '2 min', say: 'State the one-example formula first, then show averaging across the dataset.', ask: 'Where do the 2, error, and input each come from?' },
  'exact-check': { time: '4 min', say: 'Ask for explanations before revealing the answers.', ask: 'Which answer best captures the meaning of the chain rule?' },
  'exact-recap': { time: '2 min', say: 'Reconstruct exact gradient calculation without symbols first.', ask: 'Summarize 2ex in one sentence.' },
  'bias-bridge': { time: '1 min', say: 'The weight is now learned exactly, but bias is still fixed.', ask: 'Will the bias gradient also contain x?' },
};

export default function LessonSix() {
  return <PresentationShell courseLessons={courseLessons} lessonNumber="06" notes={notes} sections={sections} slides={slides}>
    {({ slide, revealed }) => <>
      {slide.kind === 'exact-cover' && <div className="cover-layout"><div><p className="chapter">06</p><h1>{slide.title}</h1><p className="subtitle">{slide.subtitle}</p></div><div className="exact-mark" aria-hidden="true"><span>2</span><i>e</i><b>×</b><span>x</span><strong>= exact</strong></div></div>}
      {slide.kind === 'exact-objectives' && <div className="content-layout objectives-layout"><div className="objectives-copy"><h1>{slide.title}</h1><p>By the end, you should derive one gradient contribution, average a dataset, and explain why the result is exact.</p></div><ul className="objective-list"><li><span>01</span><div><strong>Follow the chain</strong><p>Weight → prediction → error → loss.</p></div></li><li><span>02</span><div><strong>Multiply local effects</strong><p>Derive 2 × error × input.</p></div></li><li><span>03</span><div><strong>Train exactly</strong><p>Replace the small-change estimate.</p></div></li></ul></div>}
      {slide.kind === 'exact-journey' && <div className="content-layout"><h1>{slide.title}</h1><div className="derivative-journey">{[['L1','Predict'],['L2','Loss'],['L3','Direction'],['L4','Step size'],['L5','Repeat'],['L6','Exact gradient']].map(([number,label],index) => <article className={index===5?'current':''} key={number}><small>{number}</small><strong>{label}</strong></article>)}</div></div>}
      {slide.kind === 'estimate-problem' && <div className="content-layout"><h1>{slide.title}</h1><div className="estimate-problems"><article><span>01</span><strong>Choose a nudge</strong><p>The answer depends on small_change.</p></article><article><span>02</span><strong>Calculate loss twice</strong><p>Once at w and once at w + 0.001.</p></article><article><span>03</span><strong>Stop slightly early</strong><p>w settled at 1.9995, not exactly 2.</p></article></div></div>}
      {slide.kind === 'estimate-arithmetic' && <div className="content-layout"><h1>{slide.title}</h1><div className="estimate-fraction"><span>loss at (w + 0.001) − loss at w</span><b>0.001</b></div><div className="estimate-labels"><span>change in loss</span><span>÷</span><span>change in weight</span><strong>≈ gradient</strong></div></div>}
      {slide.kind === 'chain-path' && <div className="content-layout"><h1>{slide.title}</h1><div className="chain-path">{[['w','weight'],['ŷ = wx + b','prediction'],['e = ŷ − y','error'],['e²','squared error'],['mean(e²)','loss']].map(([formula,label],index) => <article key={formula}><small>{String(index+1).padStart(2,'0')}</small><strong>{formula}</strong><span>{label}</span></article>)}</div><p className="takeaway">The chain rule multiplies the derivatives along this path.</p></div>}
      {slide.kind === 'example-setup' && <div className="content-layout"><h1>{slide.title}</h1><div className="example-values">{[['x','2','input'],['y','9','actual'],['w','1','weight'],['b','5','bias']].map(([symbol,value,label]) => <article key={symbol}><small>{label}</small><strong>{symbol} = {value}</strong></article>)}</div></div>}
      {slide.kind === 'prediction-error' && <div className="content-layout"><h1>{slide.title}</h1><div className="arithmetic-ladder"><article><small>01 · PREDICT</small><strong>ŷ = 1 × 2 + 5</strong><b>= 7</b></article><span>→</span><article><small>02 · ERROR</small><strong>e = 7 − 9</strong><b>= −2</b></article></div><p className="takeaway">The prediction is <b>2 too low</b>.</p></div>}
      {slide.kind === 'local-derivatives' && <div className="content-layout"><h1>{slide.title}</h1><div className="derivative-links"><article><small>WEIGHT → PREDICTION</small><strong>dŷ/dw = x</strong><b>= 2</b><p>One unit of weight changes prediction by x.</p></article><article><small>PREDICTION → SQUARED ERROR</small><strong>d(e²)/dŷ = 2e</strong><b>= −4</b><p>The squared error changes according to twice the error.</p></article></div></div>}
      {slide.kind === 'chain-multiply' && <div className="content-layout"><h1>{slide.title}</h1><div className="chain-equation"><span>2e</span><b>×</b><span>x</span><b>=</b><span>2(−2)(2)</span><b>=</b><strong>−8</strong></div><p className="takeaway">This one example wants the weight to <b>increase</b>.</p></div>}
      {slide.kind === 'exact-live' && <div className="generated-slide interactive-slide"><h1>{slide.title}</h1><InteractiveLab lab="gradient" /></div>}
      {slide.kind === 'gradient-intuition' && <div className="content-layout"><h1>{slide.title}</h1><div className="intuition-pair"><article><strong>e</strong><h2>Error</h2><p>How wrong is the prediction—and in which direction?</p></article><b>×</b><article><strong>x</strong><h2>Input</h2><p>How strongly does this weight influence the prediction?</p></article><span>= how much this example wants w to change</span></div></div>}
      {slide.kind === 'contribution-table' && <div className="content-layout"><h1>{slide.title}</h1><div className="gradient-data-table"><div className="gradient-data-head"><span>x</span><span>Actual y</span><span>Prediction ŷ</span><span>Error e</span><span>2ex</span></div>{[['1','7','6','−1','−2'],['2','9','7','−2','−8'],['3','11','8','−3','−18']].map(row => <div key={row[0]}>{row.map((cell,index)=><span className={index===4?'contribution':''} key={cell}>{cell}</span>)}</div>)}</div></div>}
      {slide.kind === 'average-gradient' && <div className="content-layout"><h1>{slide.title}</h1><div className="average-equation"><span>−2 + (−8) + (−18)</span><b>÷ 3</b><strong>= −9.3333…</strong></div><div className="estimate-vs-exact"><span>estimated: −9.2867</span><span>exact: <b>−9.3333</b></span></div></div>}
      {slide.kind === 'exact-algorithm' && <div className="content-layout"><h1>{slide.title}</h1><div className="exact-algorithm">{[['01','Predict each example','ŷ = wx + b'],['02','Find each error','e = ŷ − y'],['03','Create each contribution','2 × e × x'],['04','Average contributions','gradient = mean'],['05','Update the weight','w = w − ηg']].map(([number,title,detail]) => <article key={number}><span>{number}</span><strong>{title}</strong><p>{detail}</p></article>)}</div><p className="takeaway">No nudge. No second loss calculation.</p></div>}
      {slide.kind === 'exact-record' && <div className="content-layout"><h1>{slide.title}</h1><div className="exact-training-record"><div><span>Step</span><span>Gradient</span><span>Weight</span><span>Loss</span></div>{[['1','−9.333333','1.933333','0.02074074'],['2','−0.622222','1.995556','0.00009218'],['3','−0.041481','1.999704','0.00000041'],['4','−0.002765','1.999980','≈ 0'],['5','−0.000184','1.999999','≈ 0'],['6','−0.000012','2.000000','≈ 0'],['7–10','settles at zero','2.000000','0']].map(row=><div key={row[0]}>{row.map((cell,index)=><span className={index===2?'exact-weight':''} key={cell}>{cell}</span>)}</div>)}</div></div>}
      {slide.kind === 'method-comparison' && <div className="content-layout"><h1>{slide.title}</h1><div className="method-table"><div><span></span><strong>Estimated</strong><strong>Exact</strong></div>{[['Method','Nudge and measure','Chain-rule formula'],['Needs small_change?','Yes','No'],['Gradient at w = 1','−9.2867','−9.3333'],['Final weight','1.9995','2.0000'],['Work','2 loss calculations','1 formula']].map(row=><div key={row[0]}><span>{row[0]}</span><p>{row[1]}</p><b>{row[2]}</b></div>)}</div></div>}
      {slide.kind === 'remember-formula' && <div className="content-layout"><h1>{slide.title}</h1><div className="formula-stack"><article><small>ONE EXAMPLE</small><strong>gradient contribution = 2(ŷ − y)x</strong></article><article><small>FULL DATASET</small><strong>∂L/∂w = mean of 2(ŷᵢ − yᵢ)xᵢ</strong></article></div></div>}
      {slide.kind === 'exact-check' && <div className="content-layout"><h1>{slide.title}</h1><div className="quiz-grid">{[['01','What does dŷ/dw = x mean?','Changing w by 1 changes prediction by x'],['02','Why multiply error by input?','Combine wrongness with the weight’s influence'],['03','Why average the contributions?','Because MSE averages the squared errors'],['04','Why prefer the exact derivative?','No nudge; faster and exactly accurate']].map(([number,question,answer]) => <article className={revealed?'answered':''} key={number}><span>{number}</span><p>{question}</p><strong>{revealed?answer:'Explain first…'}</strong></article>)}</div></div>}
      {slide.kind === 'exact-recap' && <div className="content-layout recap-layout recap-layout-single"><div><h1>{slide.title}</h1><ul className="recap-list"><li>The weight affects loss through a chain of connected quantities.</li><li>The chain rule multiplies the local derivatives along that path.</li><li>One example contributes <b>2 × error × input</b>.</li><li>The dataset gradient averages all example contributions.</li><li>Exact gradients reach <b>w = 2.0000</b> without small_change.</li></ul></div></div>}
      {slide.kind === 'bias-bridge' && <div className="bridge-layout"><h1>{slide.title}</h1><div className="bridge-compare"><div><small>LEARNED NOW</small><strong>Weight w</strong><p>gradient contains input x</p></div><span>+</span><div><small>LEARN NEXT</small><strong>Bias b</strong><p>needs a separate gradient</p></div></div><p className="next-question">How do we update both parameters together?</p><span className="next-lesson">NEXT · LESSON 07</span></div>}
    </>}
  </PresentationShell>;
}
