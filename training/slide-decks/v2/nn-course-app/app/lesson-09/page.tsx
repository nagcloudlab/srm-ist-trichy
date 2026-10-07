'use client';

import { courseLessons } from '../course-data';
import { InteractiveLab } from '../interactive-labs';
import { PresentationShell, type LessonSection, type PresenterNote, type SlideMeta } from '../presentation-shell';

const slides = [
  { kicker: 'PHASE 2 · DEEP NEURAL NETWORKS', title: 'Why One Neuron Is Not Enough', subtitle: 'A straight line cannot learn a curve', kind: 'nonlinear-cover' },
  { kicker: 'LEARNING OUTCOMES', title: 'Find the limit—then add the bend', kind: 'nonlinear-objectives' },
  { kicker: 'WHERE WE ARE', title: 'The learning loop works. Now the model must grow.', kind: 'nonlinear-map' },
  { kicker: 'NEW DATA', title: 'The target follows y = x²', kind: 'square-data' },
  { kicker: 'SEE THE SHAPE', title: 'These five points make a U-shape', kind: 'square-chart' },
  { kicker: 'LET IT LEARN', title: 'Give the linear neuron a fair attempt', kind: 'linear-attempt' },
  { kicker: 'TRAINING RECORD', title: 'Training settles—but the loss does not disappear', kind: 'linear-training' },
  { kicker: 'FINAL PREDICTIONS', title: 'The best line predicts 2 everywhere', kind: 'linear-results' },
  { kicker: 'VISUAL PROOF', title: 'The optimizer found the best line—not the curve', kind: 'best-line-chart' },
  { kicker: 'WHY THIS RESULT?', title: 'Symmetry removes the tilt', kind: 'symmetry' },
  { kicker: 'MODEL CAPACITY', title: 'This is not a training failure', kind: 'capacity' },
  { kicker: 'DEPTH WITHOUT ACTIVATION', title: 'Stacking linear layers still makes one line', kind: 'linear-collapse' },
  { kicker: 'ARITHMETIC CHECK', title: 'Two layers collapse into one equivalent rule', kind: 'collapse-example' },
  { kicker: 'THE MISSING PIECE', title: 'Meet ReLU', kind: 'relu-equation' },
  { kicker: 'RELU TABLE', title: 'Negative values stop. Positive values pass.', kind: 'relu-table' },
  { kicker: 'RELU SHAPE', title: 'The bend at zero creates nonlinearity', kind: 'relu-chart' },
  { kicker: 'LIVE LAB', title: 'Move through the ReLU gate', kind: 'relu-live' },
  { kicker: 'WHY IT MATTERS', title: 'ReLU prevents layers from collapsing', kind: 'relu-between' },
  { kicker: 'TWO NEURONS', title: 'Each ReLU neuron can handle one side', kind: 'two-relu-rules' },
  { kicker: 'ACTIVATION TABLE', title: 'Add the two sides to make |x|', kind: 'v-table' },
  { kicker: 'VISUAL BUILD', title: 'Right side + left side = V-shape', kind: 'v-charts' },
  { kicker: 'REMOVE RELU', title: 'Without the gates, the shape disappears', kind: 'remove-relu' },
  { kicker: 'DEEP NETWORK PATTERN', title: 'Weighted sum → ReLU → weighted sum', kind: 'deep-pattern' },
  { kicker: 'KNOWLEDGE CHECK', title: 'Can you explain why the bend matters?', kind: 'nonlinear-check', reveal: true },
  { kicker: 'NEXT LESSON', title: 'From hand-picked bends to learned hidden layers', kind: 'hidden-bridge' },
] satisfies SlideMeta[];

const sections: LessonSection[] = [
  { label: 'Orient', at: 0 }, { label: 'Limit', at: 3 }, { label: 'Diagnose', at: 8 },
  { label: 'ReLU', at: 13 }, { label: 'Build', at: 18 }, { label: 'Check', at: 23 },
];

const notes: Record<string, PresenterNote> = {
  'nonlinear-cover': { time: '1 min', say: 'Lesson 8 expanded the inputs. Lesson 9 expands what the model can represent.', ask: 'What shape can one equation y = wx + b always draw?' },
  'nonlinear-objectives': { time: '1 min', say: 'Promise a failed linear fit, a diagnosis, and one new operation that creates a bend.', ask: 'How might a model create a corner?' },
  'nonlinear-map': { time: '2 min', say: 'The optimizer and learning loop are no longer the mystery. Capacity is.', ask: 'What changed between Lessons 8 and 9?' },
  'square-data': { time: '2 min', say: 'Read the symmetric pairs before showing the graph.', ask: 'What do x = −2 and x = 2 have in common?' },
  'square-chart': { time: '2 min', say: 'Trace the targets from left to right and name the U-shape.', ask: 'Can one straight line touch all five points?' },
  'linear-attempt': { time: '3 min', say: 'Translate the program into its visible arithmetic loop.', ask: 'Which parts of this loop already appeared in earlier lessons?' },
  'linear-training': { time: '3 min', say: 'Training converges: weight approaches zero and bias approaches two.', ask: 'Does a stable loss always mean a good model?' },
  'linear-results': { time: '3 min', say: 'Compare every target with the constant prediction two.', ask: 'Where is the largest positive error?' },
  'best-line-chart': { time: '3 min', say: 'The dashed U is the desired relationship; the horizontal line is the best available model.', ask: 'What would more epochs change here?' },
  'symmetry': { time: '3 min', say: 'Any tilt helps one side and hurts the mirror side equally. The average target becomes the bias.', ask: 'Why is the average exactly two?' },
  'capacity': { time: '3 min', say: 'Separate optimization problems from representation problems.', ask: 'Which fix changes what the model can draw?' },
  'linear-collapse': { time: '3 min', say: 'Substitute the first linear rule into the second. The result still has one slope and one intercept.', ask: 'What operation is missing between the layers?' },
  'collapse-example': { time: '3 min', say: 'Use x equals four and show both routes reach thirty-one.', ask: 'Which combined slope comes from 3 × 2?' },
  'relu-equation': { time: '2 min', say: 'ReLU chooses the larger value: zero or z.', ask: 'What happens when z is negative?' },
  'relu-table': { time: '2 min', say: 'Classify each value as blocked or passed.', ask: 'What should ReLU return at zero?' },
  'relu-chart': { time: '2 min', say: 'The important feature is the corner at zero.', ask: 'Where does the rule change?' },
  'relu-live': { time: '5 min', say: 'Move z across zero and ask learners to predict the output first.', ask: 'When is the gate open?' },
  'relu-between': { time: '3 min', say: 'The activation separates two linear transformations so they cannot collapse into one.', ask: 'Which path can bend?' },
  'two-relu-rules': { time: '3 min', say: 'One unit passes positive x; the other passes negative x after reversing its sign.', ask: 'Which neuron is active at x = −2?' },
  'v-table': { time: '3 min', say: 'Add the two hidden activations row by row.', ask: 'Why are both neurons zero at x = 0?' },
  'v-charts': { time: '3 min', say: 'Each neuron owns one half-line. Their sum creates the V.', ask: 'How many bends appear in the combined shape?' },
  'remove-relu': { time: '2 min', say: 'Without gating, x and negative x cancel everywhere.', ask: 'What output remains after cancellation?' },
  'deep-pattern': { time: '3 min', say: 'Repeat weighted sum and activation to build depth with useful capacity.', ask: 'What prevents the stack from becoming one linear rule?' },
  'nonlinear-check': { time: '4 min', say: 'Ask all six questions before revealing the answers.', ask: 'Which answer distinguishes training from capacity?' },
  'hidden-bridge': { time: '1 min', say: 'The V-shape used hand-picked weights. Next, a hidden layer learns them.', ask: 'What must flow backward so those weights can change?' },
};

function Axes({ yMax = 4, xMin = -2, xMax = 2 }: { yMax?: number; xMin?: number; xMax?: number }) {
  const xs = Array.from({ length: xMax - xMin + 1 }, (_, i) => xMin + i);
  return <g className="l9-axes">
    <line x1="64" y1="334" x2="744" y2="334" /><line x1="404" y1="28" x2="404" y2="350" />
    {xs.map((value) => { const x = 404 + value * (680 / (xMax - xMin)); return <g key={value}><line x1={x} y1="328" x2={x} y2="340" /><text x={x} y="362">{value}</text></g>; })}
    {Array.from({ length: yMax + 1 }, (_, value) => { const y = 334 - value * (300 / yMax); return <g key={value}><line x1="398" y1={y} x2="410" y2={y} /><text x="382" y={y + 5}>{value}</text></g>; })}
    <text className="axis-title" x="730" y="327">x</text><text className="axis-title" x="414" y="42">y</text>
  </g>;
}

function SquarePlot({ showLine = false }: { showLine?: boolean }) {
  const points = [[64,34],[234,259],[404,334],[574,259],[744,34]];
  return <svg className="l9-chart" viewBox="0 0 808 382" role="img" aria-label={showLine ? 'U-shaped targets compared with a flat prediction of two' : 'Five target points forming a U-shape'}>
    <rect className="l9-chart-bg" x="1" y="1" width="806" height="380" rx="20" />
    <Axes />
    <path className="l9-target-curve" d="M64 34 Q404 634 744 34" />
    {showLine && <><line className="l9-flat-line" x1="64" y1="184" x2="744" y2="184" /><text className="l9-series-text flat" x="650" y="174">prediction = 2</text></>}
    {points.map(([cx,cy], index) => <circle className="l9-target-point" cx={cx} cy={cy} r="8" key={index} />)}
    <text className="l9-series-text" x="666" y="55">target x²</text>
  </svg>;
}

function ReluPlot({ side = 'relu' }: { side?: 'relu' | 'left' | 'v' }) {
  const path = side === 'left' ? 'M64 34 L404 334 L744 334' : side === 'v' ? 'M64 34 L404 334 L744 34' : 'M64 334 L404 334 L744 34';
  const label = side === 'left' ? 'ReLU(−x)' : side === 'v' ? 'ReLU(x) + ReLU(−x)' : 'ReLU(x)';
  return <svg className="l9-chart l9-mini-chart" viewBox="0 0 808 382" role="img" aria-label={`${label} chart`}>
    <rect className="l9-chart-bg" x="1" y="1" width="806" height="380" rx="20" />
    <Axes yMax={3} xMin={-3} xMax={3} />
    <path className="l9-relu-line" d={path} />
    <text className="l9-series-text" x="82" y="54">{label}</text>
  </svg>;
}

export default function LessonNine() {
  return <PresentationShell courseLessons={courseLessons} lessonNumber="09" notes={notes} sections={sections} slides={slides}>
    {({ slide, revealed }) => <>
      {slide.kind === 'nonlinear-cover' && <div className="cover-layout"><div><p className="chapter">09 · PHASE 2</p><h1>{slide.title}</h1><p className="subtitle">{slide.subtitle}</p></div><div className="l9-cover-chart"><ReluPlot /></div></div>}
      {slide.kind === 'nonlinear-objectives' && <div className="content-layout objectives-layout"><div className="objectives-copy"><h1>{slide.title}</h1><p>By the end, you should diagnose a capacity limit, evaluate ReLU, and combine two neurons into a nonlinear shape.</p></div><ul className="objective-list"><li><span>01</span><div><strong>See the limit</strong><p>A line cannot represent a U-shape.</p></div></li><li><span>02</span><div><strong>Add nonlinearity</strong><p>ReLU introduces a bend at zero.</p></div></li><li><span>03</span><div><strong>Build a shape</strong><p>Two gated neurons form a V.</p></div></li></ul></div>}
      {slide.kind === 'nonlinear-map' && <div className="content-layout"><h1>{slide.title}</h1><div className="course-phase-map"><article><small>LESSONS 1–7</small><strong>One neuron learns</strong></article><article><small>LESSON 8</small><strong>Multiple inputs</strong></article><article className="active"><small>LESSON 9 · NOW</small><strong>Linear limits + ReLU</strong></article><article><small>NEXT</small><strong>Hidden layers learn</strong></article></div></div>}
      {slide.kind === 'square-data' && <div className="content-layout"><h1>{slide.title}</h1><div className="l9-data-table"><div><span>Input x</span><span>Arithmetic</span><span>Target y</span></div>{[['−2','(−2)²','4'],['−1','(−1)²','1'],['0','0²','0'],['1','1²','1'],['2','2²','4']].map(row=><div key={row[0]}>{row.map(cell=><span key={cell}>{cell}</span>)}</div>)}</div></div>}
      {slide.kind === 'square-chart' && <div className="content-layout l9-chart-layout"><h1>{slide.title}</h1><SquarePlot /><aside><small>SHAPE</small><strong>U</strong><p>The left and right sides mirror each other around x = 0.</p></aside></div>}
      {slide.kind === 'linear-attempt' && <div className="content-layout"><h1>{slide.title}</h1><div className="l9-loop">{[['01','Predict','ŷ = wx + b'],['02','Compare','error = ŷ − y'],['03','Average gradients','gᵥ = mean(2ex) · gᵦ = mean(2e)'],['04','Update together','w ← w − 0.1gᵥ · b ← b − 0.1gᵦ']].map(([n,t,d])=><article key={n}><span>{n}</span><strong>{t}</strong><p>{d}</p></article>)}</div><p className="takeaway">Start at <b>w = 1</b>, <b>b = 0</b>, and train for <b>200 epochs</b>.</p></div>}
      {slide.kind === 'linear-training' && <div className="content-layout"><h1>{slide.title}</h1><div className="l9-training-table"><div><span>Epoch</span><span>Weight w</span><span>Bias b</span><span>Loss</span></div>{[['1','0.6000','0.4000','6.0800'],['10','0.0060','1.7853','2.8462'],['50','0.0000','2.0000','2.8000'],['200','0.0000','2.0000','2.8000']].map(row=><div key={row[0]}>{row.map((cell,i)=><span className={i===3?'loss-cell':''} key={cell}>{cell}</span>)}</div>)}</div><p className="rule-chip">The values stop changing. More training cannot lower this model’s best loss.</p></div>}
      {slide.kind === 'linear-results' && <div className="content-layout"><h1>{slide.title}</h1><div className="l9-result-table"><div><span>x</span><span>Target</span><span>Prediction</span><span>Error: prediction − target</span></div>{[['−2','4','2','−2'],['−1','1','2','+1'],['0','0','2','+2'],['1','1','2','+1'],['2','4','2','−2']].map(row=><div key={row[0]}>{row.map((cell,i)=><span className={i===3?'error-cell':''} key={`${i}-${cell}`}>{cell}</span>)}</div>)}</div></div>}
      {slide.kind === 'best-line-chart' && <div className="content-layout l9-chart-layout"><h1>{slide.title}</h1><SquarePlot showLine /><aside className="warning"><small>FINAL LOSS</small><strong>2.8</strong><p>The model stops because no line can follow both arms of the curve.</p></aside></div>}
      {slide.kind === 'symmetry' && <div className="content-layout"><h1>{slide.title}</h1><div className="l9-reason-grid"><article><small>WEIGHT</small><strong>w = 0</strong><p>Tilting up helps one side and hurts the mirror side equally. The best tilt is no tilt.</p></article><article><small>BIAS</small><strong>b = 2</strong><div className="l9-average"><span>4 + 1 + 0 + 1 + 4</span><b>÷ 5</b><em>= 2</em></div><p>The best constant prediction is the average target.</p></article></div></div>}
      {slide.kind === 'capacity' && <div className="content-layout"><h1>{slide.title}</h1><div className="l9-fix-table"><div><span>Problem</span><span>Useful response</span></div><div><span>Learning rate too small</span><strong>Tune the rate</strong></div><div><span>Not enough epochs</span><strong>Train longer</strong></div><div className="capacity-row"><span>Model cannot represent the shape</span><strong>Change the model</strong></div></div><p className="takeaway">The optimizer found the <b>best possible line</b>. The line is the limitation.</p></div>}
      {slide.kind === 'linear-collapse' && <div className="content-layout"><h1>{slide.title}</h1><div className="l9-layer-flow"><article><small>LAYER 1</small><strong>h = 2x + 1</strong></article><b>→</b><article><small>LAYER 2</small><strong>y = 3h + 4</strong></article><b>=</b><article className="combined"><small>COMBINED</small><strong>y = 6x + 7</strong></article></div><p className="takeaway">Linear after linear is still <b>one linear rule</b>. Depth alone does not add a bend.</p></div>}
      {slide.kind === 'collapse-example' && <div className="content-layout"><h1>{slide.title}</h1><div className="l9-route-compare"><article><small>TWO LAYERS · x = 4</small><p><span>h = 2(4) + 1</span><b>h = 9</b></p><p><span>y = 3(9) + 4</span><b>y = 31</b></p></article><strong>=</strong><article><small>ONE COMBINED LAYER</small><p><span>y = 6(4) + 7</span><b>y = 31</b></p><p><span>Same input</span><b>Same result</b></p></article></div></div>}
      {slide.kind === 'relu-equation' && <div className="equation-layout"><h1>{slide.title}</h1><div className="l9-relu-equation"><span>ReLU(z)</span><b>=</b><strong>max(0, z)</strong></div><p>Choose zero when z is negative. Otherwise, let z pass through.</p></div>}
      {slide.kind === 'relu-table' && <div className="content-layout"><h1>{slide.title}</h1><div className="l9-relu-table"><div><span>Input z</span><span>Compare with 0</span><span>ReLU(z)</span><span>Gate</span></div>{[['−3','max(0, −3)','0','blocked'],['−1','max(0, −1)','0','blocked'],['0','max(0, 0)','0','at the bend'],['2','max(0, 2)','2','passes'],['5','max(0, 5)','5','passes']].map(row=><div key={row[0]}>{row.map((cell,i)=><span className={i===3?cell.replaceAll(' ','-'):''} key={`${i}-${cell}`}>{cell}</span>)}</div>)}</div></div>}
      {slide.kind === 'relu-chart' && <div className="content-layout l9-chart-layout"><h1>{slide.title}</h1><ReluPlot /><aside><small>NONLINEARITY</small><strong>1 bend</strong><p>The rule changes at zero: flat on the left, rising on the right.</p></aside></div>}
      {slide.kind === 'relu-live' && <div className="generated-slide interactive-slide"><h1>{slide.title}</h1><InteractiveLab lab="relu" /></div>}
      {slide.kind === 'relu-between' && <div className="content-layout"><h1>{slide.title}</h1><div className="l9-path-compare"><article><small>WITHOUT RELU</small><div><span>Linear 1</span><b>→</b><span>Linear 2</span></div><strong>collapses to one line</strong></article><article className="with-relu"><small>WITH RELU</small><div><span>Linear 1</span><b>→</b><span>ReLU</span><b>→</b><span>Linear 2</span></div><strong>can bend</strong></article></div></div>}
      {slide.kind === 'two-relu-rules' && <div className="content-layout"><h1>{slide.title}</h1><div className="l9-reason-grid"><article><small>NEURON 1 · RIGHT SIDE</small><strong>h₁ = ReLU(x)</strong><p>Positive x passes. Negative x becomes zero.</p></article><article><small>NEURON 2 · LEFT SIDE</small><strong>h₂ = ReLU(−x)</strong><p>Negative x is reversed, then passes as a positive value.</p></article></div><p className="rule-chip">output = h₁ + h₂ = |x|</p></div>}
      {slide.kind === 'v-table' && <div className="content-layout"><h1>{slide.title}</h1><div className="l9-v-table"><div><span>x</span><span>h₁ = ReLU(x)</span><span>h₂ = ReLU(−x)</span><span>h₁ + h₂</span></div>{[['−2','0 · off','2 · on','2'],['−1','0 · off','1 · on','1'],['0','0','0','0'],['1','1 · on','0 · off','1'],['2','2 · on','0 · off','2']].map(row=><div key={row[0]}>{row.map((cell,i)=><span className={i===3?'sum-cell':''} key={`${i}-${cell}`}>{cell}</span>)}</div>)}</div></div>}
      {slide.kind === 'v-charts' && <div className="content-layout"><h1>{slide.title}</h1><div className="l9-triptych"><article><ReluPlot /><strong>handles the right</strong></article><article><ReluPlot side="left" /><strong>handles the left</strong></article><article><ReluPlot side="v" /><strong>V-shape</strong></article></div></div>}
      {slide.kind === 'remove-relu' && <div className="content-layout"><h1>{slide.title}</h1><div className="l9-cancel"><article><small>WITH RELU</small><span>ReLU(x) + ReLU(−x)</span><strong>[2, 1, 0, 1, 2]</strong></article><b>vs</b><article><small>WITHOUT RELU</small><span>x + (−x)</span><strong>[0, 0, 0, 0, 0]</strong></article></div><p className="takeaway">The two linear paths cancel. The <b>gates preserve the shape</b>.</p></div>}
      {slide.kind === 'deep-pattern' && <div className="content-layout"><h1>{slide.title}</h1><div className="l9-deep-flow">{[['Input','x'],['Weighted sum','Layer 1'],['ReLU','bend'],['Weighted sum','Layer 2'],['ReLU','bend'],['Output','ŷ']].map(([title,detail],i)=><article className={title==='ReLU'?'activation':''} key={`${title}-${i}`}><small>{title}</small><strong>{detail}</strong></article>)}</div><p className="takeaway">Each <b>weighted sum → ReLU</b> pair adds useful depth.</p></div>}
      {slide.kind === 'nonlinear-check' && <div className="content-layout"><h1>{slide.title}</h1><div className="quiz-grid l9-quiz">{[
        ['01','Why can’t ŷ = wx + b learn y = x²?','It can draw only a straight line, not a U-shape.'],
        ['02','Will more epochs solve a capacity problem?','No. Training cannot add a missing shape.'],
        ['03','Why do two linear layers still make a line?','Substitution collapses them into one linear rule.'],
        ['04','What is ReLU(−3)?','0'],['05','What is ReLU(5)?','5'],['06','Without ReLU, what is x + (−x)?','0'],
      ].map(([n,q,a])=><article className={revealed?'answered':''} key={n}><span>{n}</span><p>{q}</p><strong>{revealed?a:'Explain first…'}</strong></article>)}</div></div>}
      {slide.kind === 'hidden-bridge' && <div className="bridge-layout"><h1>{slide.title}</h1><div className="bridge-compare"><div><small>LESSON 9</small><strong>Hand-picked ReLU neurons</strong><p>we designed the V-shape</p></div><span>→</span><div><small>LESSON 10</small><strong>A hidden layer</strong><p>the network learns its weights</p></div></div><p className="next-question">How does responsibility flow backward through a network?</p><span className="next-lesson">NEXT · LESSON 10</span></div>}
    </>}
  </PresentationShell>;
}
