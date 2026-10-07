'use client';

import { courseLessons } from '../course-data';
import { InteractiveLab } from '../interactive-labs';
import { PresentationShell, type LessonSection, type PresenterNote, type SlideMeta } from '../presentation-shell';

const slides = [
  { kicker: 'PHASE 3 · THE DISCRIMINATOR', title: 'Sigmoid and Binary Cross-Entropy', subtitle: 'Turn raw scores into probabilities—and punish confident mistakes', kind: 'prob-cover' },
  { kicker: 'LEARNING OUTCOMES', title: 'Build the output logic for real or fake', kind: 'prob-objectives' },
  { kicker: 'WHERE WE ARE', title: 'The network can learn. Now it must classify.', kind: 'prob-map' },
  { kicker: 'NEW TASK', title: 'From predicting numbers to choosing a class', kind: 'classification' },
  { kicker: 'THE RAW-SCORE PROBLEM', title: 'A neuron can output any number', kind: 'raw-score' },
  { kicker: 'WHAT WE NEED', title: 'Real-or-fake confidence must stay between 0 and 1', kind: 'prob-meaning' },
  { kicker: 'TOOL 1 · SIGMOID', title: 'Squash every raw score into a probability', kind: 'sigmoid-formula' },
  { kicker: 'SIGMOID VALUES', title: 'Negative feels fake · positive feels real', kind: 'sigmoid-table' },
  { kicker: 'SEE THE SHAPE', title: 'Sigmoid makes a smooth S-curve', kind: 'sigmoid-chart' },
  { kicker: 'THREE FACTS', title: 'Bounded · centered · smooth', kind: 'sigmoid-facts' },
  { kicker: 'ACTIVATION ROLES', title: 'ReLU builds features · Sigmoid reports probability', kind: 'relu-v-sigmoid' },
  { kicker: 'TOOL 2 · BCE', title: 'Classification needs a classification loss', kind: 'bce-intro' },
  { kicker: 'BCE FORMULA', title: 'Use the term that matches the target', kind: 'bce-formula' },
  { kicker: 'CORRECT PREDICTION', title: 'MSE and BCE are both small when confidence is right', kind: 'loss-correct' },
  { kicker: 'CONFIDENTLY WRONG', title: 'BCE makes the mistake impossible to ignore', kind: 'loss-wrong' },
  { kicker: 'TARGET = 1 · REAL', title: 'The closer p is to 1, the smaller the loss', kind: 'bce-real' },
  { kicker: 'TARGET = 0 · FAKE', title: 'The closer p is to 0, the smaller the loss', kind: 'bce-fake' },
  { kicker: 'MIRROR LOGIC', title: 'The same probability can be right or wrong', kind: 'bce-mirror' },
  { kicker: 'COMBINED FORMULA', title: 'One expression handles both targets', kind: 'bce-combined' },
  { kicker: 'LIVE LAB', title: 'Move the score—and switch the target', kind: 'bce-live' },
  { kicker: 'KNOWLEDGE CHECK', title: 'Can you reason about probability and BCE?', kind: 'prob-check', reveal: true },
  { kicker: 'NEXT LESSON', title: 'Put the pieces into a classification network', kind: 'classifier-bridge' },
] satisfies SlideMeta[];

const sections: LessonSection[] = [
  { label: 'Orient', at: 0 }, { label: 'Sigmoid', at: 4 }, { label: 'BCE', at: 11 },
  { label: 'Compare', at: 13 }, { label: 'Lab', at: 19 }, { label: 'Check', at: 20 },
];

const notes: Record<string, PresenterNote> = Object.fromEntries(slides.map((slide, index) => [slide.kind, {
  time: index === 0 || index === slides.length - 1 ? '1 min' : slide.kind === 'bce-live' ? '5 min' : slide.kind === 'prob-check' ? '4 min' : '2–3 min',
  say: slide.kind === 'bce-live' ? 'Move the score first, then switch the target without moving it.' : `Connect ${slide.title.toLowerCase()} to a yes-or-no classification decision.`,
  ask: slide.kind === 'prob-check' ? 'Ask learners to justify high versus low loss before revealing.' : 'Would this prediction be confident, uncertain, or wrong?',
}])) as Record<string, PresenterNote>;

function SigmoidPlot() {
  const points = Array.from({ length: 81 }, (_, i) => {
    const z = -6 + i * .15, p = 1 / (1 + Math.exp(-z));
    return `${i ? 'L' : 'M'}${70 + i * 8.35},${320 - p * 270}`;
  }).join(' ');
  return <svg className="l12-chart" viewBox="0 0 810 380" role="img" aria-label="Sigmoid curve from raw score minus six to six and probability zero to one">
    <rect x="1" y="1" width="808" height="378" rx="20" />
    <line x1="70" y1="320" x2="748" y2="320" /><line x1="409" y1="34" x2="409" y2="335" />
    <line className="midline" x1="70" y1="185" x2="748" y2="185" />
    {[-6,-4,-2,0,2,4,6].map(v=><text key={v} x={409+v*56.5} y="350">{v}</text>)}
    {[0,.5,1].map(v=><text key={v} x="55" y={325-v*270}>{v.toFixed(1)}</text>)}
    <path d={points} /><circle cx="409" cy="185" r="9" /><text className="label" x="425" y="174">z = 0 → p = 0.5</text>
    <text className="axis" x="714" y="311">raw z</text><text className="axis" x="420" y="48">p</text>
  </svg>;
}

export default function LessonTwelve() {
  return <PresentationShell courseLessons={courseLessons} lessonNumber="12" notes={notes} sections={sections} slides={slides}>
    {({ slide, revealed }) => <>
      {slide.kind === 'prob-cover' && <div className="cover-layout"><div><p className="chapter">12 · PHASE 3</p><h1>{slide.title}</h1><p className="subtitle">{slide.subtitle}</p></div><div className="l12-cover"><span>−∞</span><div><i /><b>0.5</b></div><span>+∞</span><strong>0 → probability → 1</strong></div></div>}
      {slide.kind === 'prob-objectives' && <div className="content-layout objectives-layout"><div className="objectives-copy"><h1>{slide.title}</h1><p>By the end, you should convert a score into probability, calculate BCE for either class, and explain why confident mistakes cost more.</p></div><ul className="objective-list"><li><span>01</span><div><strong>Read Sigmoid</strong><p>Any score becomes a value from 0 to 1.</p></div></li><li><span>02</span><div><strong>Calculate BCE</strong><p>Real and fake use mirrored log penalties.</p></div></li><li><span>03</span><div><strong>Read confidence</strong><p>A probability says how sure the model is.</p></div></li></ul></div>}
      {slide.kind === 'prob-map' && <div className="content-layout"><h1>{slide.title}</h1><div className="course-phase-map"><article><small>LESSON 9</small><strong>ReLU</strong></article><article><small>LESSON 10</small><strong>Hidden layer</strong></article><article><small>LESSON 11</small><strong>Backpropagation</strong></article><article className="active"><small>LESSON 12 · NOW</small><strong>Classification</strong></article></div></div>}
      {slide.kind === 'classification' && <div className="content-layout"><h1>{slide.title}</h1><div className="l12-task-compare"><article><small>REGRESSION · BEFORE</small><strong>13 minutes</strong><p>Predict a quantity.</p></article><b>→</b><article><small>CLASSIFICATION · NOW</small><strong>real or fake?</strong><p>Predict confidence in a class.</p></article></div></div>}
      {slide.kind === 'raw-score' && <div className="content-layout"><h1>{slide.title}</h1><div className="l12-raw"><span>−5</span><span>0</span><span>3.7</span><span>100</span></div><p className="takeaway">These scores have no natural probability meaning. We need to <b>squash</b> them.</p></div>}
      {slide.kind === 'prob-meaning' && <div className="content-layout"><h1>{slide.title}</h1><div className="l12-meaning"><article><strong>0</strong><span>“I think it is fake”</span></article><article><strong>0.5</strong><span>“I cannot tell”</span></article><article><strong>1</strong><span>“I think it is real”</span></article></div></div>}
      {slide.kind === 'sigmoid-formula' && <div className="equation-layout"><h1>{slide.title}</h1><div className="l12-sigmoid-equation"><span>σ(z)</span><b>=</b><strong>1</strong><i>1 + e<sup>−z</sup></i></div><p>Focus on the behavior: every possible z becomes a probability p.</p></div>}
      {slide.kind === 'sigmoid-table' && <div className="content-layout"><h1>{slide.title}</h1><div className="l12-table sigmoid"><div><span>Raw z</span><span>Sigmoid p</span><span>Meaning</span></div>{[['−5','0.0067','almost certainly fake'],['−2','0.1192','probably fake'],['−1','0.2689','leans fake'],['0','0.5000','cannot tell'],['1','0.7311','leans real'],['2','0.8808','probably real'],['5','0.9933','almost certainly real']].map(row=><div key={row[0]}>{row.map((cell,i)=><span className={i===1?'prob-cell':''} key={`${i}-${cell}`}>{cell}</span>)}</div>)}</div></div>}
      {slide.kind === 'sigmoid-chart' && <div className="content-layout l12-chart-layout"><h1>{slide.title}</h1><SigmoidPlot /><aside><small>MIDPOINT</small><strong>σ(0) = 0.5</strong><p>Negative scores fall below 0.5. Positive scores rise above it.</p></aside></div>}
      {slide.kind === 'sigmoid-facts' && <div className="content-layout"><h1>{slide.title}</h1><div className="l12-facts"><article><span>01</span><strong>Always 0–1</strong><p>Valid probability range.</p></article><article><span>02</span><strong>Zero becomes 0.5</strong><p>Exact uncertainty point.</p></article><article><span>03</span><strong>Smooth transition</strong><p>Confidence changes gradually.</p></article></div></div>}
      {slide.kind === 'relu-v-sigmoid' && <div className="content-layout"><h1>{slide.title}</h1><div className="l12-compare-table"><div><span></span><span>ReLU</span><span>Sigmoid</span></div>{[['Output range','0 to ∞','0 to 1'],['Shape','bent line','S-curve'],['Typical place','hidden layers','classification output'],['Purpose','build nonlinear features','produce probability']].map(row=><div key={row[0]}>{row.map((cell,i)=><span className={i===2?'sigmoid-cell':''} key={cell}>{cell}</span>)}</div>)}</div></div>}
      {slide.kind === 'bce-intro' && <div className="content-layout"><h1>{slide.title}</h1><div className="l12-task-compare"><article><small>NUMBER TARGETS</small><strong>Mean Squared Error</strong><p>Distance between quantities.</p></article><b>→</b><article><small>BINARY TARGETS · 0 OR 1</small><strong>Binary Cross-Entropy</strong><p>Penalty for probability judgments.</p></article></div></div>}
      {slide.kind === 'bce-formula' && <div className="content-layout"><h1>{slide.title}</h1><div className="l12-bce-equation"><span>BCE = −[</span><strong>y · log(p)</strong><b>+</b><strong>(1 − y) · log(1 − p)</strong><span>]</span></div><div className="l12-terms"><span><b>y</b> target: real 1 · fake 0</span><span><b>p</b> predicted probability of real</span></div></div>}
      {slide.kind === 'loss-correct' && <div className="content-layout"><h1>{slide.title}</h1><div className="l12-loss-compare"><article><small>TARGET y = 1 · PREDICTION p = 0.99</small><span>MSE = (0.99 − 1)²</span><strong>0.000100</strong></article><article><small>SAME CORRECT PREDICTION</small><span>BCE = −log(0.99)</span><strong>0.010050</strong></article></div><p className="takeaway">Both losses are small because the probability is <b>confident and correct</b>.</p></div>}
      {slide.kind === 'loss-wrong' && <div className="content-layout"><h1>{slide.title}</h1><div className="l12-loss-compare wrong"><article><small>TARGET y = 1 · PREDICTION p = 0.01</small><span>MSE = (0.01 − 1)²</span><strong>0.9801</strong></article><article><small>SAME CONFIDENT MISTAKE</small><span>BCE = −log(0.01)</span><strong>4.6052</strong></article></div><p className="takeaway">BCE punishes confident wrong classification <b>much more strongly</b>.</p></div>}
      {slide.kind === 'bce-real' && <div className="content-layout"><h1>{slide.title}</h1><div className="l12-table loss"><div><span>p(real)</span><span>BCE = −log(p)</span><span>Judgment</span></div>{[['0.01','4.6052','very wrong'],['0.10','2.3026','wrong'],['0.50','0.6931','uncertain'],['0.90','0.1054','correct'],['0.99','0.0101','almost exact']].map(row=><div key={row[0]}>{row.map((cell,i)=><span className={i===1?'loss-cell':''} key={`${i}-${cell}`}>{cell}</span>)}</div>)}</div></div>}
      {slide.kind === 'bce-fake' && <div className="content-layout"><h1>{slide.title}</h1><div className="l12-table loss"><div><span>p(real)</span><span>BCE = −log(1 − p)</span><span>Judgment</span></div>{[['0.01','0.0101','almost exact'],['0.10','0.1054','correct'],['0.50','0.6931','uncertain'],['0.90','2.3026','wrong'],['0.99','4.6052','very wrong']].map(row=><div key={row[0]}>{row.map((cell,i)=><span className={i===1?'loss-cell':''} key={`${i}-${cell}`}>{cell}</span>)}</div>)}</div></div>}
      {slide.kind === 'bce-mirror' && <div className="content-layout"><h1>{slide.title}</h1><div className="l12-mirror"><article><small>TARGET = REAL · y = 1</small><strong>p = 0.9</strong><span>loss = 0.1054 · good</span></article><article><small>SAME p · TARGET = FAKE · y = 0</small><strong>p = 0.9</strong><span>loss = 2.3026 · bad</span></article></div><p className="takeaway">A probability has meaning only when compared with the <b>correct target</b>.</p></div>}
      {slide.kind === 'bce-combined' && <div className="content-layout"><h1>{slide.title}</h1><div className="l12-switch"><article><small>WHEN y = 1</small><strong>−log(p)</strong><p>The second term becomes zero.</p></article><b>BCE</b><article><small>WHEN y = 0</small><strong>−log(1 − p)</strong><p>The first term becomes zero.</p></article></div></div>}
      {slide.kind === 'bce-live' && <div className="generated-slide interactive-slide"><h1>{slide.title}</h1><InteractiveLab lab="sigmoid-bce" /></div>}
      {slide.kind === 'prob-check' && <div className="content-layout"><h1>{slide.title}</h1><div className="quiz-grid l12-quiz">{[
        ['01','What range does Sigmoid output?','Between 0 and 1.'],['02','What is σ(0)?','0.5.'],
        ['03','Why use BCE instead of MSE?','BCE strongly penalizes confident wrong classifications.'],
        ['04','y = 1 and p = 0.99: high or low loss?','Low. The prediction is almost exactly right.'],
        ['05','y = 0 and p = 0.99: high or low loss?','High. It confidently calls a fake real.'],
        ['06','What does an output of 0.9 mean?','The model is 90% confident the input belongs to class 1.'],
      ].map(([n,q,a])=><article className={revealed?'answered':''} key={n}><span>{n}</span><p>{q}</p><strong>{revealed?a:'Explain first…'}</strong></article>)}</div></div>}
      {slide.kind === 'classifier-bridge' && <div className="bridge-layout"><h1>{slide.title}</h1><div className="bridge-compare"><div><small>PIECES READY</small><strong>hidden layers + backprop</strong><p>learn useful features</p></div><span>→</span><div><small>OUTPUT READY</small><strong>Sigmoid + BCE</strong><p>learn yes-or-no decisions</p></div></div><p className="next-question">How does one neuron learn a complete binary decision boundary?</p><span className="next-lesson">NEXT · LESSON 13</span></div>}
    </>}
  </PresentationShell>;
}
