'use client';

import { courseLessons } from '../course-data';
import { PresentationShell, type LessonSection, type PresenterNote, type SlideMeta } from '../presentation-shell';

const slides = [
  { kicker: 'NEURAL NETWORKS', title: 'How Wrong Is the Prediction?', subtitle: 'Loss gives the neuron one score to improve', kind: 'loss-cover' },
  { kicker: 'LEARNING OUTCOMES', title: 'Turn prediction mistakes into one useful number', kind: 'loss-objectives' },
  { kicker: 'FROM LESSON 01', title: 'A prediction is not enough to create learning', kind: 'prediction-gap' },
  { kicker: 'START WITH A BAD MODEL', title: 'The wrong weight makes every prediction too low', kind: 'wrong-model' },
  { kicker: 'SEE THE PATTERN', title: 'The error grows as distance grows', kind: 'error-table' },
  { kicker: 'SIGNED ERROR', title: 'Error tells us both size and direction', kind: 'error-equation' },
  { kicker: 'READ THE SIGN', title: 'Negative means low; positive means high', kind: 'error-signs' },
  { kicker: 'A DANGEROUS SHORTCUT', title: 'Raw errors can cancel and pretend everything is fine', kind: 'cancellation', reveal: true },
  { kicker: 'THE FIX', title: 'Squaring makes every mistake count', kind: 'squaring' },
  { kicker: 'MEAN SQUARED ERROR', title: 'MSE compresses many mistakes into one loss', kind: 'mse-equation' },
  { kicker: 'WORKED EXAMPLE', title: 'Square each error, then take the mean', kind: 'mse-worked' },
  { kicker: 'WHY THIS WORKS', title: 'Lower loss means predictions are closer to reality', kind: 'loss-meaning' },
  { kicker: 'THE ALGORITHM', title: 'MSE follows the same five-step story every time', kind: 'loss-code' },
  { kicker: 'WEIGHT EXPERIMENT', title: 'The best weight produces the lowest loss', kind: 'weight-lab', reveal: true },
  { kicker: 'REPEAT THE EXPERIMENT', title: 'Apply the same recipe to every candidate weight', kind: 'weight-code' },
  { kicker: 'THE LEARNING SYSTEM', title: 'Prediction and loss are the two pieces we have so far', kind: 'learning-system' },
  { kicker: 'KNOWLEDGE CHECK', title: 'Can you reason about loss without notes?', kind: 'loss-check', reveal: true },
  { kicker: 'LESSON 02 RECAP', title: 'Loss tells learning what “better” means', kind: 'loss-recap' },
  { kicker: 'THE NEXT QUESTION', title: 'We can score a weight—but which way should it move?', kind: 'gradient-bridge' },
] satisfies SlideMeta[];

const sections: LessonSection[] = [
  { label: 'Orient', at: 0 },
  { label: 'Error', at: 3 },
  { label: 'MSE', at: 8 },
  { label: 'Experiment', at: 13 },
  { label: 'Check', at: 16 },
  { label: 'Bridge', at: 18 },
];

const notes: Record<string, PresenterNote> = {
  'loss-cover': { time: '1 min', say: 'Connect directly to Lesson 1: the neuron can calculate, but it still cannot judge itself.', ask: 'What information would tell a model whether 13 minutes is a good prediction?' },
  'loss-objectives': { time: '1 min', say: 'Promise a concrete outcome: learners will calculate one complete MSE by hand.', ask: 'Which word—error, square, or mean—needs the most clarification?' },
  'prediction-gap': { time: '1 min', say: 'Separate making a prediction from evaluating it. Learning needs both.', ask: 'Can a neuron improve if it never measures its result?' },
  'wrong-model': { time: '2 min', say: 'Keep b at 5 and deliberately choose w = 1 instead of 2.', ask: 'Before calculating, will this model predict too high or too low?' },
  'error-table': { time: '2 min', say: 'Read one row left to right, then let learners complete the pattern.', ask: 'Why does the error become more negative as distance grows?' },
  'error-equation': { time: '2 min', say: 'Always subtract actual from prediction in this course so the sign has a stable meaning.', ask: 'If prediction is 12 and actual is 10, what is the error?' },
  'error-signs': { time: '2 min', say: 'Use the number line: negative is under, positive is over, zero is exact.', ask: 'What does an error of −4 tell us?' },
  cancellation: { time: '3 min', say: 'Let learners calculate the average before revealing why zero is deceptive.', ask: 'Does an average error of zero prove both predictions are correct?' },
  squaring: { time: '2 min', say: 'Squaring removes the sign and gives larger mistakes more influence.', ask: 'What do −2 and +2 become after squaring?' },
  'mse-equation': { time: '2 min', say: 'Translate the formula into words before discussing the notation.', ask: 'Where do you see square, mean, and error in the formula?' },
  'mse-worked': { time: '3 min', say: 'Move through the row in order: errors, squares, sum, divide.', ask: 'Which error contributes the most to the final loss?' },
  'loss-meaning': { time: '2 min', say: 'Loss is a comparison score, not a percentage and not automatically an accuracy.', ask: 'What is special about a loss of zero?' },
  'weight-lab': { time: '3 min', say: 'Ask learners to select the winner before revealing the highlight.', ask: 'Which weight should win, and why do weights 1 and 3 tie?' },
  'weight-code': { time: '2 min', say: 'Repeat one identical evaluation recipe for each candidate so the comparison is fair.', ask: 'Which value changes between the three runs?' },
  'loss-code': { time: '3 min', say: 'This table is the complete algorithm. Each row can later become a line or loop in Python.', ask: 'Which step prevents errors from cancelling?' },
  'learning-system': { time: '2 min', say: 'Name the two responsibilities clearly: the neuron predicts; the loss evaluates.', ask: 'What must change for loss to become smaller?' },
  'loss-check': { time: '4 min', say: 'Give silent thinking time, then reveal answers inside each card.', ask: 'Which answer distinguishes training performance from generalization?' },
  'loss-recap': { time: '2 min', say: 'Reconstruct the chain: prediction → error → square → mean → loss.', ask: 'Explain MSE in one plain-English sentence.' },
  'gradient-bridge': { time: '1 min', say: 'Loss can compare weights, but trying every value is not learning. Create the need for direction.', ask: 'How could we know whether increasing w will raise or lower the loss?' },
};

export default function LessonTwo() {
  return <PresentationShell courseLessons={courseLessons} lessonNumber="02" notes={notes} sections={sections} slides={slides}>
    {({ slide, revealed }) => <>
      {slide.kind === 'loss-cover' && <div className="cover-layout">
        <div><p className="chapter">02</p><h1>{slide.title}</h1><p className="subtitle">{slide.subtitle}</p></div>
        <div className="loss-mark" aria-label="Prediction compared with actual value"><span>ŷ</span><b>−</b><span>y</span><strong>?</strong></div>
      </div>}

      {slide.kind === 'loss-objectives' && <div className="content-layout objectives-layout">
        <div className="objectives-copy"><h1>{slide.title}</h1><p>By the end, you should be able to explain and calculate mean squared error.</p></div>
        <ul className="objective-list">
          <li><span>01</span><div><strong>Calculate signed error</strong><p>Use prediction minus actual.</p></div></li>
          <li><span>02</span><div><strong>Explain why we square</strong><p>Prevent cancellation and emphasize large mistakes.</p></div></li>
          <li><span>03</span><div><strong>Calculate MSE</strong><p>Turn several errors into one loss.</p></div></li>
        </ul>
      </div>}

      {slide.kind === 'prediction-gap' && <div className="content-layout">
        <h1>{slide.title}</h1>
        <div className="two-system-pieces"><article><small>PART 1 · LESSON 01</small><strong>Neuron</strong><p>ŷ = wx + b</p><span>Makes a prediction</span></article><b>+</b><article className="missing-piece"><small>PART 2 · TODAY</small><strong>Loss</strong><p>?</p><span>Measures prediction quality</span></article></div>
      </div>}

      {slide.kind === 'wrong-model' && <div className="content-layout wrong-model-layout">
        <div><h1>{slide.title}</h1><p className="subtitle">The correct rule needs w = 2. We deliberately start with a weaker slope.</p></div>
        <div className="parameter-card"><small>STARTING PARAMETERS</small><p><span>w</span><strong>1</strong></p><p><span>b</span><strong>5</strong></p><div>ŷ = 1x + 5</div></div>
      </div>}

      {slide.kind === 'error-table' && <div className="content-layout">
        <h1>{slide.title}</h1>
        <div className="loss-table"><div className="loss-table-head"><span>Distance</span><span>Actual y</span><span>Prediction ŷ</span><span>Error ŷ − y</span></div>{[[1,7,6,-1],[2,9,7,-2],[3,11,8,-3]].map(([x,y,p,e]) => <div key={x}><strong>{x} km</strong><span>{y} min</span><span>{p} min</span><b>{e}</b></div>)}</div>
        <p className="loss-table-takeaway">Every error is negative: the neuron <b>underpredicts</b>.</p>
      </div>}

      {slide.kind === 'error-equation' && <div className="equation-layout">
        <h1>{slide.title}</h1><div className="loss-equation"><span>error</span><b>=</b><span className="term-y">ŷ</span><b>−</b><span className="actual-term">y</span></div><p>error = prediction − actual</p>
      </div>}

      {slide.kind === 'error-signs' && <div className="content-layout">
        <h1>{slide.title}</h1><div className="sign-grid"><article className="negative"><strong>−</strong><h2>Underpredict</h2><p>Prediction is too low</p><small>Example: 8 − 11 = −3</small></article><article className="zero-sign"><strong>0</strong><h2>Exact</h2><p>Prediction matches reality</p><small>Example: 11 − 11 = 0</small></article><article className="positive"><strong>+</strong><h2>Overpredict</h2><p>Prediction is too high</p><small>Example: 14 − 11 = +3</small></article></div>
      </div>}

      {slide.kind === 'cancellation' && <div className="content-layout">
        <h1>{slide.title}</h1><div className="cancellation-stage"><div><small>TWO WRONG PREDICTIONS</small><p><b>−2</b><span>+</span><b>+2</b></p></div><span>÷ 2</span><div className={`false-zero ${revealed ? 'revealed' : ''}`}><small>AVERAGE ERROR</small><strong>0</strong><p>{revealed ? 'Zero looks perfect—but both predictions were wrong.' : 'Press R to inspect this result'}</p></div></div>
      </div>}

      {slide.kind === 'squaring' && <div className="content-layout">
        <h1>{slide.title}</h1><div className="square-stage"><article><small>NEGATIVE ERROR</small><strong>(−2)²</strong><span>4</span></article><b>=</b><article><small>POSITIVE ERROR</small><strong>(+2)²</strong><span>4</span></article></div><p className="takeaway centered">Both mistakes now contribute positively—and equally—to the loss.</p>
      </div>}

      {slide.kind === 'mse-equation' && <div className="equation-layout">
        <h1>{slide.title}</h1><div className="mse-formula"><span>MSE</span><b>=</b><span className="fraction"><i>1</i><i>n</i></span><span>Σ</span><span>(ŷᵢ − yᵢ)²</span></div><p>Square each error, then average them.</p>
      </div>}

      {slide.kind === 'mse-worked' && <div className="content-layout">
        <h1>{slide.title}</h1><div className="mse-track"><article><small>ERRORS</small><strong>−1, −2, −3</strong></article><span>→</span><article><small>SQUARE</small><strong>1, 4, 9</strong></article><span>→</span><article><small>SUM</small><strong>14</strong></article><span>→</span><article className="mse-result"><small>DIVIDE BY 3</small><strong>4.67</strong></article></div>
      </div>}

      {slide.kind === 'loss-meaning' && <div className="content-layout">
        <h1>{slide.title}</h1><div className="loss-scale"><div><span>HIGH LOSS</span><strong>Predictions are far away</strong></div><i>Learning moves this way →</i><div><span>ZERO LOSS</span><strong>Every training prediction matches</strong></div></div><div className="loss-rules"><p><b>Lower is better.</b> Loss compares model choices.</p><p><b>Large errors matter more.</b> Squaring amplifies them.</p><p><b>Zero is exact on this data.</b> It does not guarantee unseen-data performance.</p></div>
      </div>}

      {slide.kind === 'weight-lab' && <div className="content-layout">
        <h1>{slide.title}</h1><p className="fixed-parameter">Keep b = 5 · compare three weights</p><div className="weight-lab">{[
          { w: 1, predictions: '6, 7, 8', errors: '−1, −2, −3', mse: '4.67' },
          { w: 2, predictions: '7, 9, 11', errors: '0, 0, 0', mse: '0.00' },
          { w: 3, predictions: '8, 11, 14', errors: '+1, +2, +3', mse: '4.67' },
        ].map((item) => <article className={revealed && item.w === 2 ? 'winner' : ''} key={item.w}><small>WEIGHT</small><strong>w = {item.w}</strong><p>ŷ: {item.predictions}</p><p>error: {item.errors}</p><b>MSE {item.mse}</b>{revealed && item.w === 2 && <em>LOWEST LOSS</em>}</article>)}</div><p className="exercise-hint">{revealed ? 'w = 2 wins. Weights 1 and 3 tie because they are equally far from the ideal in opposite directions.' : 'Choose the winner, then press R'}</p>
      </div>}

      {slide.kind === 'loss-code' && <div className="content-layout code-layout">
        <div><h1>{slide.title}</h1><p className="subtitle">Inputs: x = 1, 2, 3 · y = 7, 9, 11 · w = 1 · b = 5</p></div><div className="algorithm-table"><div><small>STEP</small><small>OPERATION</small><small>RESULT</small></div>{[
          ['01','Predict: ŷ = wx + b','6, 7, 8'],['02','Subtract: ŷ − y','−1, −2, −3'],['03','Square every error','1, 4, 9'],['04','Add the squares','14'],['05','Divide by n = 3','MSE = 4.67'],
        ].map(([step,operation,result]) => <div key={step}><span>{step}</span><strong>{operation}</strong><b>{result}</b></div>)}</div>
      </div>}

      {slide.kind === 'weight-code' && <div className="content-layout code-layout">
        <div><h1>{slide.title}</h1><p className="subtitle">Keep b = 5 and the dataset fixed. Change only w.</p></div><div className="repeat-recipe"><div className="recipe-flow"><span>Choose w</span><b>→</b><span>Predict all</span><b>→</b><span>Calculate MSE</span><b>→</b><span>Record</span></div><div className="candidate-results"><p><b>w = 1</b><span>4.67</span></p><p className="best"><b>w = 2</b><span>0.00</span></p><p><b>w = 3</b><span>4.67</span></p></div></div>
      </div>}

      {slide.kind === 'learning-system' && <div className="content-layout">
        <h1>{slide.title}</h1><div className="system-summary"><article><small>PIECE 1</small><strong>Neuron</strong><p>ŷ = wx + b</p><span>Makes predictions</span></article><b>+</b><article><small>PIECE 2</small><strong>Loss function</strong><p>MSE = mean(ŷ − y)²</p><span>Measures prediction quality</span></article></div><p className="takeaway centered"><b>Learning</b> will change w and b so that MSE becomes smaller.</p>
      </div>}

      {slide.kind === 'loss-check' && <div className="content-layout">
        <h1>{slide.title}</h1><div className="quiz-grid">{[
          ['01', 'ŷ = 12, y = 10. Error?', '+2'],
          ['02', 'Why square errors?', 'Prevent cancellation; emphasize large errors'],
          ['03', 'MSE of −2, 0, +2?', '2.67'],
          ['04', 'Does MSE = 0 guarantee unseen success?', 'No—only these examples are perfect'],
        ].map(([number, question, answer]) => <article className={revealed ? 'answered' : ''} key={number}><span>{number}</span><p>{question}</p><strong>{revealed ? answer : 'Think first…'}</strong></article>)}</div>
      </div>}

      {slide.kind === 'loss-recap' && <div className="content-layout recap-layout recap-layout-single"><div><h1>{slide.title}</h1><ul className="recap-list"><li>Error is <b>prediction minus actual</b>.</li><li>The sign shows underprediction or overprediction.</li><li>Squaring prevents positive and negative errors from cancelling.</li><li>MSE averages squared errors into one loss.</li><li>Learning means changing parameters to make loss smaller.</li></ul></div></div>}

      {slide.kind === 'gradient-bridge' && <div className="bridge-layout">
        <h1>{slide.title}</h1><div className="gradient-choice"><article><small>TRY SMALLER</small><strong>w = 1.9</strong><p>Will loss rise or fall?</p></article><b>?</b><article><small>TRY LARGER</small><strong>w = 2.1</strong><p>Will loss rise or fall?</p></article></div><p className="next-question">The gradient tells us the direction.</p><span className="next-lesson">NEXT · LESSON 03</span>
      </div>}
    </>}
  </PresentationShell>;
}
