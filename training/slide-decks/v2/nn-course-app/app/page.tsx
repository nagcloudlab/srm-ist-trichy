'use client';

import { courseLessons } from './course-data';
import { PresentationShell, type LessonSection, type PresenterNote, type SlideMeta } from './presentation-shell';
import { ResponsiveLineChart, type ChartSeries } from './responsive-line-chart';

const weightSeries = [
  { label: 'w = 0', color: '#6b7280', slope: 0, intercept: 5 },
  { label: 'w = 1', color: '#277a59', slope: 1, intercept: 5 },
  { label: 'w = 2', color: '#3157d5', slope: 2, intercept: 5 },
  { label: 'w = 3', color: '#eb5a46', slope: 3, intercept: 5 },
] satisfies ChartSeries[];

const biasSeries = [
  { label: 'b = 0', color: '#3157d5', slope: 2, intercept: 0 },
  { label: 'b = 5', color: '#eb5a46', slope: 2, intercept: 5 },
  { label: 'b = 10', color: '#277a59', slope: 2, intercept: 10 },
] satisfies ChartSeries[];

const slides = [
  { kicker: 'NEURAL NETWORKS', title: 'What Is a Neuron?', subtitle: 'The smallest building block of every neural network', kind: 'cover' },
  { kicker: 'LEARNING OUTCOMES', title: 'What you will be able to explain', kind: 'objectives' },
  { kicker: 'START WITH A PATTERN', title: 'Can you predict the next delivery time?', kind: 'prediction' },
  { kicker: 'THE HIDDEN RULE', title: 'The pattern has two parts', kind: 'pattern' },
  { kicker: 'THE CORE IDEA', title: 'A neuron turns numbers into a prediction', kind: 'neuron' },
  { kicker: 'THE MODEL', title: 'One equation describes the neuron', kind: 'equation' },
  { kicker: 'THE FOUR ROLES', title: 'Each symbol has one job', kind: 'symbols' },
  { kicker: 'FORWARD PASS', title: 'Follow one prediction through the neuron', kind: 'forward' },
  { kicker: 'WEIGHT', title: 'The weight controls influence', kind: 'weight' },
  { kicker: 'EDGE CASE', title: 'A zero weight ignores the input', kind: 'zero' },
  { kicker: 'BIAS', title: 'The bias shifts every prediction', kind: 'bias' },
  { kicker: 'QUICK PRACTICE', title: 'Your turn: predict before calculating', kind: 'exercise', reveal: true },
  { kicker: 'SAME NEURON, NEW INPUTS', title: 'One rule can process many inputs', kind: 'sequence' },
  { kicker: 'LESSON 01 RECAP', title: 'Check the essentials before moving on', kind: 'recap' },
  { kicker: 'THE IMPORTANT GAP', title: 'The neuron calculated — but it did not learn', kind: 'bridge' },
] satisfies SlideMeta[];

export default function Home() {
  const sections: LessonSection[] = [
    { label: 'Intro', at: 0 }, { label: 'Pattern', at: 2 }, { label: 'Model', at: 4 },
    { label: 'Parameters', at: 8 }, { label: 'Practice', at: 11 }, { label: 'Recap', at: 13 },
  ];
  const notesByKind: Record<string, PresenterNote> = {
    cover: { time: '1 min', say: 'Frame this as the first small step toward building neural networks. Keep the biological analogy brief.', ask: 'Where have you already seen a model make a numerical prediction?' },
    objectives: { time: '1 min', say: 'Read these as promises, not an agenda. Define success before teaching.', ask: 'Which outcome feels least familiar right now?' },
    prediction: { time: '2 min', say: 'Wait for predictions before moving on. Let learners notice the +2 pattern themselves.', ask: 'What will 4 km take, and what rule did you use?' },
    pattern: { time: '2 min', say: 'Name the changing contribution and fixed starting cost separately.', ask: 'Which part changes with distance?' },
    neuron: { time: '1 min', say: 'Use plain language: numbers in, a calculation, one number out.', ask: 'What are the input and output in this example?' },
    equation: { time: '2 min', say: 'Read the equation aloud as “y-hat equals w times x plus b.”', ask: 'Which part represents the fixed starting cost?' },
    symbols: { time: '2 min', say: 'Keep pointing back to the delivery example so the symbols do not become abstract.', ask: 'What real-world meaning does w have here?' },
    forward: { time: '2 min', say: 'Trace left to right with your hand. Name this movement a forward pass.', ask: 'What operation happens first?' },
    weight: { time: '2 min', say: 'Focus on influence and slope. Do not introduce gradients yet.', ask: 'What happens to the line when w gets larger?' },
    zero: { time: '1 min', say: 'Pause after 1 km and ask learners to predict the 100 km output.', ask: 'Why does distance stop mattering?' },
    bias: { time: '2 min', say: 'The lines stay parallel: influence is unchanged; only the starting point moves.', ask: 'Does changing b alter the slope?' },
    exercise: { time: '3 min', say: 'Give learners 60 seconds. Reveal only after everyone commits.', ask: 'Which example completely ignores the input?' },
    sequence: { time: '1 min', say: 'The rule stays fixed; only the input changes. This is reuse, not learning.', ask: 'What remains constant across all five predictions?' },
    recap: { time: '2 min', say: 'Listen for confusion between selecting parameters and learning them.', ask: 'Explain the role of weight and bias in one sentence.' },
    bridge: { time: '1 min', say: 'End on the unresolved problem. Lesson 2 introduces loss as a measure of wrongness.', ask: 'How could the neuron measure how wrong 13 minutes is?' },
  };
  return (
    <PresentationShell courseLessons={courseLessons} lessonNumber="01" notes={notesByKind} sections={sections} slides={slides}>
      {({ slide, revealed }) => <>
        {slide.kind === 'cover' && <div className="cover-layout">
          <div><p className="chapter">01</p><h1>{slide.title}</h1><p className="subtitle">{slide.subtitle}</p></div>
          <div className="neuron-mark" aria-label="Stylized neuron"><span className="orbit orbit-a" /><span className="orbit orbit-b" /><span className="orbit orbit-c" /><span className="core">ŷ</span></div>
        </div>}

        {slide.kind === 'objectives' && <div className="content-layout objectives-layout">
          <div className="objectives-copy">
            <h1>{slide.title}</h1>
            <p>By the end of this short lesson, the neuron equation should feel like a simple story—not a mysterious formula.</p>
          </div>
          <ul className="objective-list">
            <li><span>01</span><div><strong>Describe a neuron</strong><p>Numbers go in, a calculation happens, and one prediction comes out.</p></div></li>
            <li><span>02</span><div><strong>Read ŷ = wx + b</strong><p>Identify the input, weight, bias, and predicted output.</p></div></li>
            <li><span>03</span><div><strong>Calculate a forward pass</strong><p>Follow a value through multiplication, addition, and prediction.</p></div></li>
          </ul>
        </div>}

        {slide.kind === 'prediction' && <div className="content-layout">
          <h1>{slide.title}</h1>
          <div className="delivery-table">
            <div className="table-head"><span>Distance</span><span>Delivery time</span></div>
            <div><span>1 km</span><strong>7 min</strong></div><div><span>2 km</span><strong>9 min</strong></div><div><span>3 km</span><strong>11 min</strong></div>
            <div className="mystery"><span>4 km</span><strong>?</strong></div>
          </div><p className="prompt">Make a prediction before moving on.</p>
        </div>}

        {slide.kind === 'pattern' && <div className="content-layout">
          <h1>{slide.title}</h1>
          <div className="pattern-stage">
            <div className="rule rule-weight"><span>×</span><p>Every kilometre adds</p><strong>2 minutes</strong></div>
            <div className="rule rule-bias"><span>+</span><p>Every delivery starts with</p><strong>5 minutes</strong></div>
            <div className="answer"><small>4 km delivery</small><strong>13</strong><span>minutes</span></div>
          </div>
        </div>}

        {slide.kind === 'neuron' && <div className="content-layout">
          <h1>{slide.title}</h1>
          <div className="flow flow-neuron">
            <div className="flow-node input-node"><small>INPUT</small><strong>4 km</strong></div><span className="flow-arrow">→</span>
            <div className="machine"><span className="machine-core">N</span><p>simple<br/>calculation</p></div><span className="flow-arrow">→</span>
            <div className="flow-node output-node"><small>PREDICTION</small><strong>13 min</strong></div>
          </div>
          <p className="takeaway">Numbers in. A simple calculation. One number out.</p>
        </div>}

        {slide.kind === 'equation' && <div className="equation-layout">
          <h1>{slide.title}</h1>
          <div className="equation" aria-label="y hat equals w x plus b">
            <span className="term term-y">ŷ</span><span>=</span><span className="term term-w">w</span><span className="term term-x">x</span><span>+</span><span className="term term-b">b</span>
          </div>
          <p>Prediction = influence × input + starting value</p>
        </div>}

        {slide.kind === 'symbols' && <div className="content-layout">
          <h1>{slide.title}</h1>
          <div className="symbol-line">
            <div className="symbol symbol-x"><strong>x</strong><span>Input</span><p>distance</p></div>
            <div className="symbol symbol-w"><strong>w</strong><span>Weight</span><p>minutes per km</p></div>
            <div className="symbol symbol-b"><strong>b</strong><span>Bias</span><p>preparation time</p></div>
            <div className="symbol symbol-y"><strong>ŷ</strong><span>Prediction</span><p>delivery time</p></div>
          </div>
        </div>}

        {slide.kind === 'forward' && <div className="content-layout">
          <h1>{slide.title}</h1>
          <div className="calculation-track">
            <div className="calc-step step-x"><small>INPUT</small><strong>4</strong></div><div className="operator">×</div>
            <div className="calc-step step-w"><small>WEIGHT</small><strong>2</strong></div><div className="operator">+</div>
            <div className="calc-step step-b"><small>BIAS</small><strong>5</strong></div><div className="operator">=</div>
            <div className="calc-step step-y"><small>PREDICTION</small><strong>13</strong></div>
          </div>
          <div className="forward-label"><span>DATA MOVES FORWARD</span><span className="long-arrow">━━━━━━━━━━━━━━━━━━▶</span></div>
        </div>}

        {slide.kind === 'weight' && <div className="content-layout chart-layout">
          <h1>{slide.title}</h1>
          <div className="weight-chart">
            <ResponsiveLineChart ariaLabel="Prediction by distance for weights zero through three" lines={weightSeries} />
          </div>
          <p className="chart-copy"><small>b = 5 held constant</small><strong>Larger weight</strong><br/>The input has more influence on the prediction.</p>
        </div>}

        {slide.kind === 'zero' && <div className="content-layout">
          <h1>{slide.title}</h1>
          <div className="zero-stage">
            <div><small>1 KM</small><span>0 × 1 + 5</span><strong>5 min</strong></div>
            <div className="equals-mark">=</div>
            <div><small>100 KM</small><span>0 × 100 + 5</span><strong>5 min</strong></div>
          </div>
          <p className="takeaway centered">When <b>w = 0</b>, changing the input changes nothing.</p>
        </div>}

        {slide.kind === 'bias' && <div className="content-layout chart-layout bias-layout">
          <h1>{slide.title}</h1>
          <div className="bias-chart">
            <ResponsiveLineChart ariaLabel="Parallel prediction lines for bias values zero, five, and ten" lines={biasSeries} />
          </div>
          <p className="chart-copy"><small>w = 2 held constant</small><strong>Same influence. New starting point.</strong><br/>The bias shifts every prediction equally.</p>
        </div>}

        {slide.kind === 'exercise' && <div className="content-layout">
          <h1>{slide.title}</h1>
          <div className="exercise-grid">
            {[['A','3','5','17'],['B','2','0','8'],['C','0','5','5'],['D','1','10','14']].map(([name,w,b,answer]) => <div className={`exercise-item ${revealed ? 'answered' : ''}`} key={name}><span>{name}</span><p><b className="c-w">w = {w}</b><b className="c-b">b = {b}</b><b className="c-x">x = 4</b></p><strong>{revealed ? `ŷ = ${answer}` : 'ŷ = ?'}</strong></div>)}
          </div>
          <p className="exercise-hint" aria-live="polite">{revealed ? 'Answers revealed in place' : 'Calculate first, then press R to reveal'}</p>
        </div>}

        {slide.kind === 'sequence' && <div className="content-layout">
          <h1>{slide.title}</h1>
          <p className="fixed-rule"><span className="c-w">w = 2</span><span className="c-b">b = 5</span></p>
          <div className="sequence-row">{[[1,7],[2,9],[3,11],[4,13],[5,15]].map(([x,y]) => <div className="sequence-item" key={x}><small>x = {x}</small><span>→</span><strong>{y}</strong></div>)}</div>
          <p className="takeaway centered">The parameters stay fixed while the input changes.</p>
        </div>}

        {slide.kind === 'recap' && <div className="content-layout recap-layout recap-layout-single">
          <div>
            <h1>{slide.title}</h1>
            <ul className="recap-list">
              <li>A neuron transforms numbers into a prediction.</li>
              <li><b>w</b> controls how strongly the input matters.</li>
              <li><b>b</b> adds the same fixed shift to every prediction.</li>
              <li>A forward pass moves data from input to output.</li>
            </ul>
          </div>
        </div>}

        {slide.kind === 'bridge' && <div className="bridge-layout">
          <h1>{slide.title}</h1>
          <div className="bridge-compare"><div><small>TODAY</small><strong>We chose</strong><p>w = 2 and b = 5</p></div><span>≠</span><div><small>LEARNING</small><strong>The neuron discovers</strong><p>w and b from data</p></div></div>
          <p className="next-question">How can the neuron know whether its prediction is wrong?</p>
          <span className="next-lesson">NEXT · LESSON 02</span>
        </div>}

      </>}
    </PresentationShell>
  );
}
