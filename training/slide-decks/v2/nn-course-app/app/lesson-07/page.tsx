'use client';

import { courseLessons } from '../course-data';
import { InteractiveLab } from '../interactive-labs';
import { PresentationShell, type LessonSection, type PresenterNote, type SlideMeta } from '../presentation-shell';

const slides = [
  { kicker: 'PHASE 1 FINALE', title: 'Learn Weight and Bias Together', subtitle: 'A complete neuron must discover both parameters from data', kind: 'both-cover' },
  { kicker: 'LEARNING OUTCOMES', title: 'Coordinate two parameters without mixing their gradients', kind: 'both-objectives' },
  { kicker: 'WHERE WE ARE', title: 'The seventh ingredient completes the learning system', kind: 'both-journey' },
  { kicker: 'THE REAL PROBLEM', title: 'This time, neither parameter is known', kind: 'both-unknown' },
  { kicker: 'DIFFERENT JOBS', title: 'Weight tilts; bias shifts', kind: 'parameter-effects' },
  { kicker: 'TWO GRADIENTS', title: 'Each parameter needs its own measure of influence', kind: 'two-gradients' },
  { kicker: 'WHY NO x?', title: 'Bias touches every prediction equally', kind: 'bias-derivative' },
  { kicker: 'WORKED EXAMPLE', title: 'Start with both parameters wrong', kind: 'both-setup' },
  { kicker: 'THREE EXAMPLES', title: 'Each row casts two gradient votes', kind: 'dual-contributions' },
  { kicker: 'WEIGHT GRADIENT', title: 'Average the votes that include input x', kind: 'weight-average' },
  { kicker: 'BIAS GRADIENT', title: 'Average the direct error votes', kind: 'bias-average' },
  { kicker: 'FIRST UPDATE', title: 'Apply both gradients with the same learning rate', kind: 'both-update' },
  { kicker: 'EXPECTED BEHAVIOR', title: 'The weight overshoots—and that is okay', kind: 'first-overshoot' },
  { kicker: 'CRITICAL RULE', title: 'Calculate both, then update both', kind: 'simultaneous-rule' },
  { kicker: 'WHY SIMULTANEOUS?', title: 'Both gradients must describe the same point', kind: 'same-point' },
  { kicker: 'TRAIN BOTH', title: 'One training cycle has five responsibilities', kind: 'dual-algorithm' },
  { kicker: 'LIVE LAB', title: 'Watch slope and shift learn together', kind: 'both-live' },
  { kicker: 'TRAINING RECORD', title: 'The neuron discovers w = 2 and b = 5', kind: 'dual-record' },
  { kicker: 'READ THE STORY', title: 'Weight returns while bias keeps climbing', kind: 'training-story' },
  { kicker: 'COMPENSATION', title: 'Parameters can cover for each other temporarily', kind: 'parameter-compensation' },
  { kicker: 'PHASE 1 COMPLETE', title: 'Seven ideas now form one learning system', kind: 'phase-one-system' },
  { kicker: 'BIG PICTURE', title: 'Deep networks use this same learning process', kind: 'same-process' },
  { kicker: 'KNOWLEDGE CHECK', title: 'Can you coordinate two learnable parameters?', kind: 'both-check', reveal: true },
  { kicker: 'PHASE 2', title: 'Next: give one neuron more than one input', kind: 'multi-input-bridge' },
] satisfies SlideMeta[];

const sections: LessonSection[] = [
  { label: 'Orient', at: 0 }, { label: 'Compare', at: 4 }, { label: 'Calculate', at: 7 },
  { label: 'Coordinate', at: 13 }, { label: 'Train', at: 16 }, { label: 'Complete', at: 20 }, { label: 'Check', at: 22 },
];

const notes: Record<string, PresenterNote> = {
  'both-cover': { time: '1 min', say: 'This is the Phase 1 finale: the neuron must learn both numbers in its rule.', ask: 'Which value have we kept fixed until now?' },
  'both-objectives': { time: '1 min', say: 'Promise two gradients, simultaneous updates, and a complete training story.', ask: 'What might go wrong when two values change at once?' },
  'both-journey': { time: '1 min', say: 'Connect every earlier lesson to today’s two-parameter learner.', ask: 'Which lesson gave us the exact 2ex formula?' },
  'both-unknown': { time: '2 min', say: 'Real problems do not reveal either weight or bias in advance.', ask: 'What must the data teach the neuron now?' },
  'parameter-effects': { time: '3 min', say: 'A weight change depends on x; a bias change is identical for every input.', ask: 'Which parameter controls slope?' },
  'two-gradients': { time: '3 min', say: 'Compare the formulas and circle the only difference: x.', ask: 'Why does x appear only in the weight gradient?' },
  'bias-derivative': { time: '2 min', say: 'The local derivative of prediction with respect to bias is one.', ask: 'If bias rises by one, how much does every prediction rise?' },
  'both-setup': { time: '1 min', say: 'Begin at w equals one and b equals zero so both parameters are wrong.', ask: 'What are the first three predictions?' },
  'dual-contributions': { time: '4 min', say: 'For each example, calculate error once and use it in both gradient columns.', ask: 'Which row exerts the largest pull on weight?' },
  'weight-average': { time: '2 min', say: 'Average minus 12, minus 28, and minus 48 to get minus 29.33.', ask: 'What does the negative sign ask weight to do?' },
  'bias-average': { time: '2 min', say: 'Bias receives minus 12, minus 14, and minus 16; their mean is minus 14.', ask: 'Why are these votes smaller than the later weight votes?' },
  'both-update': { time: '3 min', say: 'Apply learning rate 0.1 separately to both gradients.', ask: 'What are the two new parameter values?' },
  'first-overshoot': { time: '2 min', say: 'The weight jumps past two because it is compensating for a bias that is still too low.', ask: 'Does one overshoot prove training has failed?' },
  'simultaneous-rule': { time: '3 min', say: 'Keep the order strict: calculate everything first, then update both.', ask: 'At what point may either parameter change?' },
  'same-point': { time: '3 min', say: 'Updating weight early would make the bias gradient describe a different model.', ask: 'Why is mixing old and new parameters unfair?' },
  'dual-algorithm': { time: '3 min', say: 'Present the training responsibilities as arithmetic, not projected program code.', ask: 'Which two steps must finish before either update?' },
  'both-live': { time: '6 min', say: 'Adjust the sliders, then animate training. Blue predictions should meet coral targets.', ask: 'How do slope and shift change the line differently?' },
  'dual-record': { time: '3 min', say: 'Read the four checkpoints from both wrong to the exact rule.', ask: 'At which checkpoint is the model already close?' },
  'training-story': { time: '3 min', say: 'Narrate the motion of each parameter instead of reading only the loss.', ask: 'Why does weight fall after its first jump?' },
  'parameter-compensation': { time: '3 min', say: 'Individual parameters may move indirectly; the combined loss is the scoreboard.', ask: 'What can a high weight compensate for?' },
  'phase-one-system': { time: '4 min', say: 'Reconstruct the seven-part system from prediction through simultaneous updates.', ask: 'Which step turns separate gradient votes into learning?' },
  'same-process': { time: '2 min', say: 'Scale changes, but prediction, loss, gradients, and updates remain the core loop.', ask: 'What will become more numerous in a deep network?' },
  'both-check': { time: '4 min', say: 'Ask all four questions before revealing concise answers.', ask: 'Which answer explains simultaneous updates most precisely?' },
  'multi-input-bridge': { time: '1 min', say: 'Phase 2 begins when one neuron receives several features.', ask: 'How many weights will two inputs require?' },
};

export default function LessonSeven() {
  return <PresentationShell courseLessons={courseLessons} lessonNumber="07" notes={notes} sections={sections} slides={slides}>
    {({ slide, revealed }) => <>
      {slide.kind === 'both-cover' && <div className="cover-layout"><div><p className="chapter">07 · PHASE 1 FINALE</p><h1>{slide.title}</h1><p className="subtitle">{slide.subtitle}</p></div><div className="both-mark" aria-hidden="true"><span>w</span><b>+</b><span>b</span><strong>learn together</strong></div></div>}
      {slide.kind === 'both-objectives' && <div className="content-layout objectives-layout"><div className="objectives-copy"><h1>{slide.title}</h1><p>By the end, you should calculate two gradients, update them fairly, and explain their shared training path.</p></div><ul className="objective-list"><li><span>01</span><div><strong>Separate influence</strong><p>See why weight uses x and bias does not.</p></div></li><li><span>02</span><div><strong>Update together</strong><p>Keep both gradients at the same point.</p></div></li><li><span>03</span><div><strong>Read the journey</strong><p>Follow compensation toward the exact rule.</p></div></li></ul></div>}
      {slide.kind === 'both-journey' && <div className="content-layout"><h1>{slide.title}</h1><div className="phase-journey">{[['L1','Predict'],['L2','Loss'],['L3','Direction'],['L4','Step size'],['L5','Repeat'],['L6','Exact gradient'],['L7','Both params']].map(([number,label],index)=><article className={index===6?'current':''} key={number}><small>{number}</small><strong>{label}</strong></article>)}</div></div>}
      {slide.kind === 'both-unknown' && <div className="content-layout"><h1>{slide.title}</h1><div className="unknown-equation"><span>ŷ =</span><strong>w</strong><b>x +</b><strong>b</strong></div><div className="unknown-cards"><article><small>BEFORE</small><b>b = 5</b><p>fixed for us</p></article><article><small>NOW</small><b>w = ? &nbsp; b = ?</b><p>learned from data alone</p></article></div></div>}
      {slide.kind === 'parameter-effects' && <div className="content-layout"><h1>{slide.title}</h1><div className="effect-compare"><article><small>INCREASE w BY 1</small><strong>prediction changes by x</strong><div className="tilted-line">slope depends on input</div></article><article><small>INCREASE b BY 1</small><strong>prediction changes by 1</strong><div className="shifted-lines">same shift for every input</div></article></div><p className="takeaway">Different effects require <b>different gradients</b>.</p></div>}
      {slide.kind === 'two-gradients' && <div className="content-layout"><h1>{slide.title}</h1><div className="gradient-pair"><article><small>WEIGHT</small><strong>∂L/∂w = mean(2ex)</strong><p>Weight is multiplied by x.</p></article><article><small>BIAS</small><strong>∂L/∂b = mean(2e)</strong><p>Bias is added directly.</p></article></div><p className="gradient-difference">The only formula difference is <b>x</b>.</p></div>}
      {slide.kind === 'bias-derivative' && <div className="content-layout"><h1>{slide.title}</h1><div className="local-effect-pair"><article><small>WEIGHT’S LOCAL EFFECT</small><strong>∂ŷ/∂w = x</strong><p>Its influence changes with the input.</p></article><article><small>BIAS’S LOCAL EFFECT</small><strong>∂ŷ/∂b = 1</strong><p>It shifts every prediction by the same amount.</p></article></div></div>}
      {slide.kind === 'both-setup' && <div className="content-layout"><h1>{slide.title}</h1><div className="both-start"><article><small>STARTING WEIGHT</small><strong>w = 1</strong></article><b>+</b><article><small>STARTING BIAS</small><strong>b = 0</strong></article><span>→</span><article><small>FIRST PREDICTIONS</small><strong>1, 2, 3</strong><p>targets: 7, 9, 11</p></article></div></div>}
      {slide.kind === 'dual-contributions' && <div className="content-layout"><h1>{slide.title}</h1><div className="dual-data-table"><div><span>x</span><span>y</span><span>ŷ</span><span>error e</span><span>weight 2ex</span><span>bias 2e</span></div>{[['1','7','1','−6','−12','−12'],['2','9','2','−7','−28','−14'],['3','11','3','−8','−48','−16']].map(row=><div key={row[0]}>{row.map((cell,index)=><span className={index>3?'vote':''} key={`${index}-${cell}`}>{cell}</span>)}</div>)}</div></div>}
      {slide.kind === 'weight-average' && <div className="content-layout"><h1>{slide.title}</h1><div className="gradient-average weight-average"><span>−12 + (−28) + (−48)</span><b>÷ 3</b><strong>= −29.33</strong></div><p className="takeaway">Negative gradient → the first update will <b>increase w</b>.</p></div>}
      {slide.kind === 'bias-average' && <div className="content-layout"><h1>{slide.title}</h1><div className="gradient-average bias-average"><span>−12 + (−14) + (−16)</span><b>÷ 3</b><strong>= −14</strong></div><p className="takeaway">Negative gradient → the first update will <b>increase b</b>.</p></div>}
      {slide.kind === 'both-update' && <div className="content-layout"><h1>{slide.title}</h1><div className="dual-update"><article><small>UPDATE WEIGHT</small><strong>1 − 0.1(−29.33)</strong><span>= 1 + 2.933</span><b>w = 3.933</b></article><article><small>UPDATE BIAS</small><strong>0 − 0.1(−14)</strong><span>= 0 + 1.4</span><b>b = 1.4</b></article></div></div>}
      {slide.kind === 'first-overshoot' && <div className="content-layout"><h1>{slide.title}</h1><div className="overshoot-strip"><span>start<br/><b>w = 1</b></span><i></i><strong>target<br/><b>w = 2</b></strong><i></i><span>first update<br/><b>w = 3.933</b></span></div><p className="takeaway">Both parameters are adjusting together over many steps. One temporary overshoot is not failure.</p></div>}
      {slide.kind === 'simultaneous-rule' && <div className="content-layout"><h1>{slide.title}</h1><div className="simultaneous-steps">{[['01','Predict','current w and b'],['02','Calculate','weight gradient'],['03','Calculate','bias gradient'],['04','Update','w'],['05','Update','b']].map(([number,verb,detail],index)=><article className={index>2?'update-step':''} key={number}><span>{number}</span><strong>{verb}</strong><p>{detail}</p></article>)}</div><div className="update-divider"><span>CALCULATE EVERYTHING</span><b>THEN</b><span>UPDATE BOTH</span></div></div>}
      {slide.kind === 'same-point' && <div className="content-layout"><h1>{slide.title}</h1><div className="same-point-diagram"><article><small>CURRENT MODEL</small><strong>(w, b)</strong><p>calculate ∂L/∂w</p><p>calculate ∂L/∂b</p></article><span>→</span><article><small>ONE COORDINATED MOVE</small><strong>(w − ηg<sub>w</sub>, b − ηg<sub>b</sub>)</strong><p>both gradients agree on the starting point</p></article></div><p className="danger-takeaway">Updating w early mixes old and new parameters.</p></div>}
      {slide.kind === 'dual-algorithm' && <div className="content-layout"><h1>{slide.title}</h1><div className="dual-training-cycle">{[['01','Predict all rows','ŷ = wx + b'],['02','Reuse each error','e = ŷ − y'],['03','Average two gradients','mean(2ex), mean(2e)'],['04','Update together','w − ηgʷ, b − ηgᵇ'],['05','Measure and repeat','loss → next epoch']].map(([number,title,detail])=><article key={number}><span>{number}</span><strong>{title}</strong><p>{detail}</p></article>)}</div></div>}
      {slide.kind === 'both-live' && <div className="generated-slide interactive-slide"><h1>{slide.title}</h1><InteractiveLab lab="dual-parameter" /></div>}
      {slide.kind === 'dual-record' && <div className="content-layout"><h1>{slide.title}</h1><div className="dual-training-record"><div><span>Epoch</span><span>Weight</span><span>Bias</span><span>Loss</span><span>State</span></div>{[['0','1.00','0.00','—','both wrong'],['1','3.93','1.40','2.56','weight overshoots'],['10','3.32','2.00','1.29','bias climbing'],['100','2.15','4.66','0.02','getting close'],['1000','2.00','5.00','0.00','exact rule']].map(row=><div key={row[0]}>{row.map((cell,index)=><span className={index===4?'state-cell':''} key={`${index}-${cell}`}>{cell}</span>)}</div>)}</div></div>}
      {slide.kind === 'training-story' && <div className="content-layout"><h1>{slide.title}</h1><div className="parameter-story"><article><small>EPOCH 1</small><strong>w 3.93</strong><span>b 1.40</span><p>Weight jumps; bias begins climbing.</p></article><article><small>EPOCH 10</small><strong>w 3.32</strong><span>b 2.00</span><p>Weight comes back; bias keeps climbing.</p></article><article><small>EPOCH 100</small><strong>w 2.15</strong><span>b 4.66</span><p>Both are close; loss is almost gone.</p></article><article><small>EPOCH 1000</small><strong>w 2.00</strong><span>b 5.00</span><p>The exact rule is learned from data.</p></article></div></div>}
      {slide.kind === 'parameter-compensation' && <div className="content-layout"><h1>{slide.title}</h1><div className="compensation-pair"><article><strong>Weight too high?</strong><p>Bias can adjust downward to offset it.</p></article><b>↔</b><article><strong>Bias too low?</strong><p>Weight can rise to compensate.</p></article></div><p className="takeaway">Individual paths may look indirect. The <b>combined loss</b> is the scoreboard.</p></div>}
      {slide.kind === 'phase-one-system' && <div className="content-layout"><h1>{slide.title}</h1><div className="phase-system-table">{[['1','Prediction','ŷ = wx + b'],['2','Error measurement','MSE = mean((ŷ − y)²)'],['3','Direction','gradient sign'],['4','Step size','parameter − η × gradient'],['5','Repetition','training loop'],['6','Exact gradient','chain rule: 2ex'],['7','Multiple parameters','separate gradients, simultaneous update']].map(row=><article key={row[0]}><span>{row[0]}</span><strong>{row[1]}</strong><p>{row[2]}</p></article>)}</div></div>}
      {slide.kind === 'same-process' && <div className="content-layout"><h1>{slide.title}</h1><div className="scale-process"><span>predict</span><b>→</b><span>measure loss</span><b>→</b><span>calculate gradients</span><b>→</b><span>update together</span><b>→</b><span>repeat</span></div><p className="takeaway">From one neuron to deep networks, the number of parameters grows—but the learning logic remains.</p></div>}
      {slide.kind === 'both-check' && <div className="content-layout"><h1>{slide.title}</h1><div className="quiz-grid">{[['01','Why does only the weight gradient contain x?','Weight’s effect on prediction depends on x; bias’s effect is 1.'],['02','Why calculate both gradients before updating?','Both must describe the same current model.'],['03','Can a parameter move away from its final value?','Yes—parameters can compensate while total loss falls.'],['04','What rule was learned after 1000 epochs?','ŷ = 2x + 5.']].map(([number,question,answer])=><article className={revealed?'answered':''} key={number}><span>{number}</span><p>{question}</p><strong>{revealed?answer:'Explain first…'}</strong></article>)}</div></div>}
      {slide.kind === 'multi-input-bridge' && <div className="bridge-layout"><h1>{slide.title}</h1><div className="bridge-compare"><div><small>PHASE 1</small><strong>One input</strong><p>one weight + one bias</p></div><span>→</span><div><small>PHASE 2</small><strong>Many inputs</strong><p>one weight for each feature</p></div></div><p className="next-question">What changes when a neuron sees more than one feature?</p><span className="next-lesson">NEXT · LESSON 08</span></div>}
    </>}
  </PresentationShell>;
}
