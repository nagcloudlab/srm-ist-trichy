'use client';

import { courseLessons } from '../course-data';
import { InteractiveLab } from '../interactive-labs';
import { PresentationShell, type LessonSection, type PresenterNote, type SlideMeta } from '../presentation-shell';

const slides = [
  { kicker: 'PHASE 3 · THE DISCRIMINATOR', title: 'Build a Binary Classifier', subtitle: 'Teach one neuron to separate negative from positive', kind: 'classifier-cover' },
  { kicker: 'LEARNING OUTCOMES', title: 'Turn all the pieces into one learning system', kind: 'classifier-objectives' },
  { kicker: 'WHERE WE ARE', title: 'We have every piece. Now we connect them.', kind: 'classifier-map' },
  { kicker: 'THE TASK', title: 'Can a neuron learn positive versus negative?', kind: 'classifier-task' },
  { kicker: 'TRAINING DATA', title: 'Six examples show the rule', kind: 'classifier-data' },
  { kicker: 'THE NETWORK', title: 'One score becomes one probability', kind: 'classifier-network' },
  { kicker: 'FORWARD PASS', title: 'Two arithmetic steps make a prediction', kind: 'classifier-forward' },
  { kicker: 'EXAMPLE · CLASS 0', title: 'Walk x = -3 through the network', kind: 'classifier-negative' },
  { kicker: 'EXAMPLE · CLASS 1', title: 'Walk x = 3 through the network', kind: 'classifier-positive' },
  { kicker: 'RANDOM START', title: 'w = 0.5 already points the right way', kind: 'classifier-start-table' },
  { kicker: 'MEASURE EVERY MISTAKE', title: 'BCE gives each example a loss', kind: 'classifier-bce' },
  { kicker: 'LOSS TABLE', title: 'The uncertain points cost the most', kind: 'classifier-loss-table' },
  { kicker: 'BATCH LOSS', title: 'Average the six penalties', kind: 'classifier-average' },
  { kicker: 'THE SHORTCUT', title: 'Sigmoid plus BCE gives a simple gradient', kind: 'classifier-gradient' },
  { kicker: 'READ THE SIGN', title: 'p - y says which way the score should move', kind: 'classifier-gradient-cases' },
  { kicker: 'TRAINING STEP', title: 'Average the blame, then update w and b', kind: 'classifier-update' },
  { kicker: 'FIRST UPDATE', title: 'One step makes the boundary sharper', kind: 'classifier-first-update' },
  { kicker: 'TRAINING CHECKPOINTS', title: 'The weight grows as the loss falls', kind: 'classifier-checkpoints' },
  { kicker: 'RESULT', title: 'Loss falls from 0.3296 to 0.0335', kind: 'classifier-loss-drop' },
  { kicker: 'CHECK THE MODEL', title: 'Every training example is classified correctly', kind: 'classifier-predictions' },
  { kicker: 'WHAT IT LEARNED', title: 'A positive weight separates the two classes', kind: 'classifier-learned' },
  { kicker: 'CONFIDENCE', title: 'A larger weight makes the transition sharper', kind: 'classifier-curve' },
  { kicker: 'LIVE LAB', title: 'Move the weight and the decision boundary', kind: 'classifier-live' },
  { kicker: 'BIAS EXPERIMENT', title: 'b shifts where p crosses 0.5', kind: 'classifier-bias' },
  { kicker: 'TWO JOBS', title: 'w controls sharpness · b controls position', kind: 'classifier-controls' },
  { kicker: 'KNOWLEDGE CHECK', title: 'Can you explain the whole classifier?', kind: 'classifier-check', reveal: true },
  { kicker: 'NEXT LESSON', title: 'Next: let PyTorch do the bookkeeping', kind: 'classifier-next' },
] satisfies SlideMeta[];

const sections: LessonSection[] = [
  { label: 'Orient', at: 0 }, { label: 'Forward', at: 5 }, { label: 'Loss', at: 10 },
  { label: 'Train', at: 13 }, { label: 'Inspect', at: 19 }, { label: 'Check', at: 25 },
];

const notes: Record<string, PresenterNote> = Object.fromEntries(slides.map((slide, index) => [slide.kind, {
  time: index === 0 || index === slides.length - 1 ? '1 min' : slide.kind === 'classifier-live' ? '5 min' : slide.kind === 'classifier-check' ? '4 min' : '2–3 min',
  say: slide.kind === 'classifier-live' ? 'Use the presets first. Then move w and b separately so learners can name each effect.' : `Connect ${slide.title.toLowerCase()} to the full classify-and-learn loop.`,
  ask: slide.kind === 'classifier-check' ? 'Ask for reasoning before revealing all six answers.' : 'What number changes next, and why?',
}])) as Record<string, PresenterNote>;

const startRows = [
  ['-3', '-1.5', '0.18', 'low · correct direction'], ['-1', '-0.5', '0.38', 'not low enough'],
  ['1', '0.5', '0.62', 'not high enough'], ['3', '1.5', '0.82', 'high · correct direction'],
];
const lossRows = [
  ['-3', '0', '0.1824', '0.2015'], ['-2', '0', '0.2689', '0.3133'], ['-1', '0', '0.3775', '0.4741'],
  ['1', '1', '0.6225', '0.4741'], ['2', '1', '0.7311', '0.3133'], ['3', '1', '0.8176', '0.2015'],
];
const predictionRows = [
  ['-3', '0.000844', 'negative', '0'], ['-2', '0.008854', 'negative', '0'], ['-1', '0.086354', 'negative', '0'],
  ['1', '0.913646', 'positive', '1'], ['2', '0.991146', 'positive', '1'], ['3', '0.999156', 'positive', '1'],
];

function ClassifierCurve() {
  const xAt = (x: number) => 72 + ((x + 3.5) / 7) * 675;
  const yAt = (p: number) => 322 - p * 260;
  const curve = (w: number) => Array.from({ length: 101 }, (_, i) => {
    const x = -3.5 + i * .07;
    return `${i ? 'L' : 'M'}${xAt(x).toFixed(1)},${yAt(1 / (1 + Math.exp(-w * x))).toFixed(1)}`;
  }).join(' ');
  return <svg className="l13-chart" viewBox="0 0 820 380" role="img" aria-label="Two sigmoid curves showing that a larger positive weight creates a sharper probability transition at zero">
    <rect x="1" y="1" width="818" height="378" rx="20" />
    <line x1="72" y1="322" x2="760" y2="322" /><line x1={xAt(0)} y1="38" x2={xAt(0)} y2="332" />
    <line className="decision" x1="72" y1={yAt(.5)} x2="760" y2={yAt(.5)} />
    {[-3,-2,-1,0,1,2,3].map(v => <text key={`x${v}`} x={xAt(v)} y="350">{v}</text>)}
    {[0,.5,1].map(v => <text key={`y${v}`} x="58" y={yAt(v)+5}>{v.toFixed(1)}</text>)}
    <path className="soft" d={curve(.5)} /><path className="sharp" d={curve(2.36)} />
    {[-3,-2,-1].map(x => <circle className="class-zero" key={`z${x}`} cx={xAt(x)} cy={yAt(0)} r="7" />)}
    {[1,2,3].map(x => <circle className="class-one" key={`o${x}`} cx={xAt(x)} cy={yAt(1)} r="7" />)}
    <text className="curve-label soft-label" x="590" y="168">w = 0.5</text><text className="curve-label sharp-label" x="500" y="82">w = 2.36</text>
    <text className="axis" x="725" y="313">input x</text><text className="axis" x="425" y="52">p(class 1)</text>
  </svg>;
}

export default function LessonThirteen() {
  return <PresentationShell courseLessons={courseLessons} lessonNumber="13" notes={notes} sections={sections} slides={slides}>
    {({ slide, revealed }) => <>
      {slide.kind === 'classifier-cover' && <div className="cover-layout"><div><p className="chapter">13 · PHASE 3</p><h1>{slide.title}</h1><p className="subtitle">{slide.subtitle}</p></div><div className="l13-cover"><span className="neg">-3</span><b>one neuron</b><span className="prob">0.001</span><i>class 0</i><span className="pos">+3</span><b>one neuron</b><span className="prob">0.999</span><i>class 1</i></div></div>}
      {slide.kind === 'classifier-objectives' && <div className="content-layout objectives-layout"><div className="objectives-copy"><h1>{slide.title}</h1><p>By the end, you should run the forward arithmetic, explain the BCE gradient, and read the learned boundary as a decision rule.</p></div><ul className="objective-list"><li><span>01</span><div><strong>Predict</strong><p>Turn x into a score, then a probability.</p></div></li><li><span>02</span><div><strong>Learn</strong><p>Use p - y to update weight and bias.</p></div></li><li><span>03</span><div><strong>Classify</strong><p>Use 0.5 as the decision threshold.</p></div></li></ul></div>}
      {slide.kind === 'classifier-map' && <div className="content-layout"><h1>{slide.title}</h1><div className="course-phase-map"><article><small>LESSON 10</small><strong>Hidden layer</strong></article><article><small>LESSON 11</small><strong>Backpropagation</strong></article><article><small>LESSON 12</small><strong>Sigmoid + BCE</strong></article><article className="active"><small>LESSON 13 · NOW</small><strong>Classifier</strong></article></div></div>}
      {slide.kind === 'classifier-task' && <div className="content-layout"><h1>{slide.title}</h1><div className="l13-task"><article><small>INPUT</small><strong>x = -3</strong><span>negative → class 0</span></article><b>learn the sign</b><article><small>INPUT</small><strong>x = +3</strong><span>positive → class 1</span></article></div><p className="takeaway">We know the rule. The neuron only sees <b>examples and labels</b>.</p></div>}
      {slide.kind === 'classifier-data' && <div className="content-layout"><h1>{slide.title}</h1><div className="l13-data-line"><div className="zero"><span>-3</span><span>-2</span><span>-1</span><strong>class 0</strong></div><i>decision boundary</i><div className="one"><span>1</span><span>2</span><span>3</span><strong>class 1</strong></div></div></div>}
      {slide.kind === 'classifier-network' && <div className="content-layout"><h1>{slide.title}</h1><div className="l13-network"><article><small>INPUT</small><strong>x</strong></article><b>× w + b</b><article><small>RAW SCORE</small><strong>z</strong></article><b>Sigmoid</b><article className="prob"><small>PROBABILITY</small><strong>p</strong><span>chance of class 1</span></article></div></div>}
      {slide.kind === 'classifier-forward' && <div className="content-layout"><h1>{slide.title}</h1><div className="l13-forward"><article><span>01</span><small>WEIGHTED SUM</small><strong>z = w × x + b</strong><p>Build the raw score.</p></article><article><span>02</span><small>SQUASH TO 0–1</small><strong>p = sigmoid(z)</strong><p>Read probability of class 1.</p></article></div></div>}
      {slide.kind === 'classifier-negative' && <div className="content-layout"><h1>{slide.title}</h1><div className="l13-arithmetic"><article><small>START</small><strong>w = 0.5 · b = 0</strong></article><span>→</span><article><small>RAW SCORE</small><strong>z = 0.5 × (-3) + 0 = -1.5</strong></article><span>→</span><article className="correct-zero"><small>PROBABILITY</small><strong>sigmoid(-1.5) = 0.1824</strong><b>low → class 0</b></article></div></div>}
      {slide.kind === 'classifier-positive' && <div className="content-layout"><h1>{slide.title}</h1><div className="l13-arithmetic"><article><small>START</small><strong>w = 0.5 · b = 0</strong></article><span>→</span><article><small>RAW SCORE</small><strong>z = 0.5 × 3 + 0 = 1.5</strong></article><span>→</span><article className="correct-one"><small>PROBABILITY</small><strong>sigmoid(1.5) = 0.8176</strong><b>high → class 1</b></article></div></div>}
      {slide.kind === 'classifier-start-table' && <div className="content-layout"><h1>{slide.title}</h1><div className="l13-table four"><div><span>x</span><span>z</span><span>p(class 1)</span><span>Reading</span></div>{startRows.map(row => <div key={row[0]}>{row.map((cell,i)=><span className={i===2?'accent':''} key={`${i}-${cell}`}>{cell}</span>)}</div>)}</div><p className="takeaway">Correct side of 0.5, but the inner points are still <b>uncertain</b>.</p></div>}
      {slide.kind === 'classifier-bce' && <div className="content-layout"><h1>{slide.title}</h1><div className="l13-bce"><article><small>WHEN y = 1</small><strong>loss = -log(p)</strong><p>Reward probability near 1.</p></article><b>BCE</b><article><small>WHEN y = 0</small><strong>loss = -log(1 - p)</strong><p>Reward probability near 0.</p></article></div></div>}
      {slide.kind === 'classifier-loss-table' && <div className="content-layout"><h1>{slide.title}</h1><div className="l13-table loss"><div><span>x</span><span>target y</span><span>probability p</span><span>BCE loss</span></div>{lossRows.map(row => <div key={row[0]}>{row.map((cell,i)=><span className={i===3?'loss-accent':''} key={`${i}-${cell}`}>{cell}</span>)}</div>)}</div></div>}
      {slide.kind === 'classifier-average' && <div className="content-layout"><h1>{slide.title}</h1><div className="l13-average"><span>0.2015 + 0.3133 + 0.4741 + 0.4741 + 0.3133 + 0.2015</span><i>÷ 6 examples</i><strong>average BCE = 0.3296</strong></div></div>}
      {slide.kind === 'classifier-gradient' && <div className="equation-layout"><h1>{slide.title}</h1><div className="l13-gradient"><small>BLAME AT THE SCORE</small><strong>gradient = p - y</strong><span>prediction probability minus target label</span></div><p>No long symbolic derivation is needed to train this output neuron.</p></div>}
      {slide.kind === 'classifier-gradient-cases' && <div className="content-layout"><h1>{slide.title}</h1><div className="l13-cases"><article className="up"><small>TARGET 1 · PREDICTED 0.8</small><strong>0.8 - 1 = -0.2</strong><span>negative gradient → push score up</span></article><article className="down"><small>TARGET 0 · PREDICTED 0.8</small><strong>0.8 - 0 = +0.8</strong><span>positive gradient → push score down</span></article></div></div>}
      {slide.kind === 'classifier-update' && <div className="content-layout"><h1>{slide.title}</h1><div className="l13-train-flow">{[['01','Forward','p = sigmoid(w × x + b)'],['02','Error','each example: p - y'],['03','Average','grad w = mean((p - y) × x) · grad b = mean(p - y)'],['04','Update','w ← w - 0.1 × grad w · b ← b - 0.1 × grad b']].map(([n,t,d])=><article key={n}><span>{n}</span><strong>{t}</strong><p>{d}</p></article>)}</div></div>}
      {slide.kind === 'classifier-first-update' && <div className="content-layout"><h1>{slide.title}</h1><div className="l13-first-update"><article><small>BATCH GRADIENTS</small><strong>grad w = -0.4876</strong><strong>grad b = 0.0000</strong></article><article><small>UPDATE WITH lr = 0.1</small><span>w = 0.5 - 0.1 × (-0.4876)</span><strong>w = 0.5488</strong><span>b stays 0</span></article></div><p className="takeaway">The symmetric data cancels the bias gradient. The weight grows.</p></div>}
      {slide.kind === 'classifier-checkpoints' && <div className="content-layout"><h1>{slide.title}</h1><div className="l13-table checkpoints"><div><span>Epoch</span><span>Weight w</span><span>Bias b</span><span>Average loss</span></div>{[['1','0.5488','0.0000','0.3296'],['10','0.8668','-0.0000','0.2027'],['50','1.5049','-0.0000','0.0876'],['200','2.3590','-0.0000','0.0335']].map(row=><div className={row[0]==='200'?'learned':''} key={row[0]}>{row.map((cell,i)=><span className={i===3?'loss-accent':''} key={`${i}-${cell}`}>{cell}</span>)}</div>)}</div></div>}
      {slide.kind === 'classifier-loss-drop' && <div className="content-layout"><h1>{slide.title}</h1><div className="l13-loss-drop"><article><small>RANDOM START</small><strong>0.3296</strong></article><span>→ 200 updates →</span><article><small>TRAINED</small><strong>0.0335</strong><b>about 90% lower</b></article></div></div>}
      {slide.kind === 'classifier-predictions' && <div className="content-layout"><h1>{slide.title}</h1><div className="l13-table predictions"><div><span>x</span><span>p(class 1)</span><span>Prediction</span><span>Target</span><span>Result</span></div>{predictionRows.map(row=><div key={row[0]}>{row.map((cell,i)=><span className={i===1?'accent':''} key={`${i}-${cell}`}>{cell}</span>)}<span className="check">✓</span></div>)}</div><p className="rule-chip">6 out of 6 correct · 100% training accuracy</p></div>}
      {slide.kind === 'classifier-learned' && <div className="content-layout"><h1>{slide.title}</h1><div className="l13-learned"><article><small>LEARNED PARAMETERS</small><strong>w = 2.36</strong><strong>b ≈ 0</strong></article><article><small>FOR x = 3</small><span>z = 2.36 × 3 = 7.08</span><strong>sigmoid(7.08) ≈ 0.999</strong></article><article><small>FOR x = -3</small><span>z = 2.36 × (-3) = -7.08</span><strong>sigmoid(-7.08) ≈ 0.001</strong></article></div></div>}
      {slide.kind === 'classifier-curve' && <div className="content-layout l13-chart-layout"><h1>{slide.title}</h1><ClassifierCurve /><aside><small>SAME BOUNDARY</small><strong>x = 0</strong><p>Growing positive w pulls negative inputs toward 0 and positive inputs toward 1.</p></aside></div>}
      {slide.kind === 'classifier-live' && <div className="generated-slide interactive-slide"><h1>{slide.title}</h1><InteractiveLab lab="classifier" /></div>}
      {slide.kind === 'classifier-bias' && <div className="content-layout"><h1>{slide.title}</h1><div className="l13-bias"><div><small>SETTINGS</small><strong>w = 5 · b = -5</strong><span>boundary = -b / w = 1</span></div><div className="l13-mini-table"><span>x</span><span>p</span><span>class</span>{[['-1','0.0000','negative'],['0','0.0067','negative'],['1','0.5000','decision point'],['2','0.9933','positive'],['3','1.0000','positive']].flatMap((row,i)=>row.map((cell,j)=><b key={`${i}-${j}`}>{cell}</b>))}</div></div></div>}
      {slide.kind === 'classifier-controls' && <div className="content-layout"><h1>{slide.title}</h1><div className="l13-controls"><article><small>WEIGHT w</small><strong>sharpness + direction</strong><p>Larger |w| makes confidence change faster. The sign decides which side maps to class 1.</p></article><article><small>BIAS b</small><strong>boundary position</strong><p>The 0.5 crossing occurs where w × x + b = 0, so x = -b / w.</p></article></div></div>}
      {slide.kind === 'classifier-check' && <div className="content-layout"><h1>{slide.title}</h1><div className="quiz-grid l13-quiz">{[
        ['01','What does the Sigmoid output represent?','Probability that the input belongs to class 1.'],
        ['02','Which loss trains this binary classifier?','Binary cross-entropy, or BCE.'],
        ['03','BCE + Sigmoid simplifies to which gradient?','p - y.'],
        ['04','What does a large |w| do?','It makes the probability transition sharper and predictions more confident.'],
        ['05','What does b control?','Where the 0.5 decision boundary sits.'],
        ['06','What changes for a classifier with many inputs?','Only the size: more weights in w · x + b — the same Sigmoid, BCE, and p − y update.'],
      ].map(([n,q,a])=><article className={revealed?'answered':''} key={n}><span>{n}</span><p>{q}</p><strong>{revealed?a:'Think first…'}</strong></article>)}</div></div>}
      {slide.kind === 'classifier-next' && <div className="bridge-layout"><h1>{slide.title}</h1><div className="bridge-compare"><div><small>TODAY · BY HAND</small><strong>Every gradient</strong><p>derived and checked manually</p></div><span>→</span><div><small>NEXT · PYTORCH</small><strong>Autograd</strong><p>computes every gradient for us</p></div></div><p className="next-question">What if the framework did the calculus for every weight?</p><span className="next-lesson">NEXT · LESSON 14</span></div>}
    </>}
  </PresentationShell>;
}
