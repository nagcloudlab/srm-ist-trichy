'use client';

import { courseLessons } from '../course-data';
import { InteractiveLab } from '../interactive-labs';
import { PresentationShell, type LessonSection, type PresenterNote, type SlideMeta } from '../presentation-shell';

const slides = [
  { kicker: 'PHASE 3 · THE DISCRIMINATOR', title: 'Introduction to PyTorch', subtitle: 'Keep the understanding · automate the bookkeeping', kind: 'torch-cover' },
  { kicker: 'LEARNING OUTCOMES', title: 'Move from hand-built math to framework thinking', kind: 'torch-objectives' },
  { kicker: 'WHERE WE ARE', title: 'We learned the mechanics before using the machine', kind: 'torch-map' },
  { kicker: 'WHY PYTORCH?', title: 'Real networks make manual gradients impossible', kind: 'torch-why' },
  { kicker: 'ONE-TIME SETUP', title: 'Install the toolkit', kind: 'torch-install' },
  { kicker: 'CORE DATA TYPE', title: 'A tensor is an array with superpowers', kind: 'torch-tensors' },
  { kicker: 'TENSOR ARITHMETIC', title: 'The operations already feel familiar', kind: 'torch-operations' },
  { kicker: 'WHY TENSORS?', title: 'They remember work and can run it at scale', kind: 'torch-superpowers' },
  { kicker: 'AUTOGRAD SETUP', title: 'Tell PyTorch which value should learn', kind: 'torch-autograd-setup' },
  { kicker: 'FORWARD PASS', title: 'The prediction and loss are still ordinary arithmetic', kind: 'torch-forward' },
  { kicker: 'BACKWARD PASS', title: 'One call calculates the gradient', kind: 'torch-backward' },
  { kicker: 'LIVE LAB', title: 'Change the problem · let autograd report the gradient', kind: 'torch-live' },
  { kicker: 'BY HAND VS PYTORCH', title: 'Same chain rule · less bookkeeping', kind: 'torch-compare' },
  { kicker: 'READY-MADE BLOCKS', title: 'nn.Sequential describes the network in order', kind: 'torch-sequential' },
  { kicker: 'NETWORK BLUEPRINT', title: 'One input · four hidden neurons · one output', kind: 'torch-architecture' },
  { kicker: 'COUNT PARAMETERS · LAYER 1', title: 'Input to hidden uses 8 learned numbers', kind: 'torch-count-one' },
  { kicker: 'COUNT PARAMETERS · LAYER 2', title: 'Hidden to output adds 5 · total 13', kind: 'torch-count-two' },
  { kicker: 'FORWARD CALL', title: 'Calling the model runs every block', kind: 'torch-model-call' },
  { kicker: 'SAME CLASSIFIER', title: 'Reuse the six examples from Lesson 13', kind: 'torch-data' },
  { kicker: 'TRAINING SETUP', title: 'Model · loss · optimizer each own one job', kind: 'torch-setup' },
  { kicker: 'THE TRAINING LOOP', title: 'Three actions repeat on every epoch', kind: 'torch-loop' },
  { kicker: 'LEARNING PROGRESS', title: 'Representative loss falls toward zero', kind: 'torch-epochs' },
  { kicker: 'CHECK PREDICTIONS', title: 'The trained network separates every example', kind: 'torch-predictions' },
  { kicker: 'IMPORTANT DETAIL', title: 'Random starts produce slightly different numbers', kind: 'torch-randomness' },
  { kicker: 'GO DEEPER', title: 'Add blocks · PyTorch keeps every gradient straight', kind: 'torch-deeper' },
  { kicker: 'PARAMETER SCALE', title: 'Shallow: 13 · deep: 129', kind: 'torch-deep-count' },
  { kicker: 'TRANSLATION GUIDE', title: 'PyTorch names the ideas you already know', kind: 'torch-replaced' },
  { kicker: 'THEORY CHECKPOINT', title: 'Understanding stays with you', kind: 'torch-understanding' },
  { kicker: 'KNOWLEDGE CHECK', title: 'Can you explain the PyTorch workflow?', kind: 'torch-check', reveal: true },
  { kicker: 'COURSE COMPLETE', title: 'You can now build and train a neural network', kind: 'torch-next' },
] satisfies SlideMeta[];

const sections: LessonSection[] = [
  { label: 'Why', at: 0 }, { label: 'Tensors', at: 5 }, { label: 'Autograd', at: 8 },
  { label: 'Network', at: 13 }, { label: 'Train', at: 18 }, { label: 'Scale', at: 24 }, { label: 'Check', at: 28 },
];

const notes: Record<string, PresenterNote> = Object.fromEntries(slides.map((slide, index) => [slide.kind, {
  time: index === 0 || index === slides.length - 1 ? '1 min' : slide.kind === 'torch-live' ? '5 min' : slide.kind === 'torch-check' ? '4 min' : '2–3 min',
  say: slide.kind === 'torch-live' ? 'Change one value at a time and compare the reported gradient with the arithmetic shown below.' : `Connect ${slide.title.toLowerCase()} to an idea learners already built by hand.`,
  ask: slide.kind === 'torch-check' ? 'Ask learners to name the three training actions in order before revealing.' : 'Which earlier lesson does this automate?',
}])) as Record<string, PresenterNote>;

const theory = (items: Array<[string, string]>) => <ul className="l14-bullets">{items.map(([title, detail], index) =>
  <li key={title}><span>{String(index + 1).padStart(2, '0')}</span><div><strong>{title}</strong><p>{detail}</p></div></li>
)}</ul>;

export default function LessonFourteen() {
  return <PresentationShell courseLessons={courseLessons} lessonNumber="14" notes={notes} sections={sections} slides={slides}>
    {({ slide, revealed }) => <>
      {slide.kind === 'torch-cover' && <div className="cover-layout"><div><p className="chapter">14 · PHASE 3</p><h1>{slide.title}</h1><p className="subtitle">{slide.subtitle}</p></div><div className="l14-cover"><div><small>YOU DESIGN</small><strong>network + loss</strong></div><span>PyTorch</span><div><small>IT AUTOMATES</small><strong>gradients + updates</strong></div></div></div>}
      {slide.kind === 'torch-objectives' && <div className="content-layout objectives-layout"><div className="objectives-copy"><h1>{slide.title}</h1><p>By the end, you should work with tensors, explain autograd, count a network’s parameters, and read the three-step training loop.</p></div><ul className="objective-list"><li><span>01</span><div><strong>Represent data</strong><p>Use tensors and familiar array operations.</p></div></li><li><span>02</span><div><strong>Build networks</strong><p>Stack Linear, ReLU, and Sigmoid blocks.</p></div></li><li><span>03</span><div><strong>Train automatically</strong><p>Clear, backpropagate, and update.</p></div></li></ul></div>}
      {slide.kind === 'torch-map' && <div className="content-layout"><h1>{slide.title}</h1><div className="course-phase-map"><article><small>LESSON 11</small><strong>Backpropagation</strong></article><article><small>LESSON 12</small><strong>Sigmoid + BCE</strong></article><article><small>LESSON 13</small><strong>Classifier</strong></article><article className="active"><small>LESSON 14 · NOW</small><strong>PyTorch</strong></article></div></div>}
      {slide.kind === 'torch-why' && <div className="content-layout"><h1>{slide.title}</h1>{theory([['Lessons 1–13 built understanding','You calculated forward passes, gradients, and updates yourself.'],['Large models change the scale','Millions of weights would require millions of linked derivatives.'],['PyTorch automates the hard parts','You describe the model; autograd calculates every required gradient.']])}</div>}
      {slide.kind === 'torch-install' && <div className="content-layout"><h1>{slide.title}</h1><div className="l14-command"><small>RUN ONCE IN YOUR TERMINAL</small><strong>pip install torch</strong><span>Then use <b>import torch</b> in your program.</span></div></div>}
      {slide.kind === 'torch-tensors' && <div className="content-layout"><h1>{slide.title}</h1>{theory([['Same mental model as NumPy','A tensor stores numbers in an ordered shape.'],['Works with scalars, vectors, matrices, and batches','The shape tells PyTorch how values are organized.'],['Carries learning information','A tensor can remember the operations that produced it.']])}</div>}
      {slide.kind === 'torch-operations' && <div className="content-layout"><h1>{slide.title}</h1><div className="l14-ops"><div><span>a</span><strong>[1, 2, 3]</strong></div><div><span>b</span><strong>[4, 5, 6]</strong></div><article><small>ADD</small><strong>a + b = [5, 7, 9]</strong></article><article><small>MULTIPLY BY POSITION</small><strong>a × b = [4, 10, 18]</strong></article><article><small>DOT PRODUCT</small><strong>1×4 + 2×5 + 3×6 = 32</strong></article></div></div>}
      {slide.kind === 'torch-superpowers' && <div className="content-layout"><h1>{slide.title}</h1>{theory([['Automatic differentiation','Track the calculation graph and derive gradients backward.'],['Hardware acceleration','Move the same tensor operations to a GPU when available.'],['Neural-network ecosystem','Use tested layers, losses, optimizers, datasets, and utilities.']])}</div>}
      {slide.kind === 'torch-autograd-setup' && <div className="content-layout"><h1>{slide.title}</h1><div className="l14-autograd-setup"><article><small>LEARNABLE VALUE</small><strong>w = tensor(1.0)</strong><b>requires_grad = True</b></article><article><small>FIXED VALUES</small><strong>x = 2 · target = 4</strong><b>No gradient storage needed</b></article></div><p className="takeaway"><b>requires_grad=True</b> tells PyTorch to track how the loss depends on w.</p></div>}
      {slide.kind === 'torch-forward' && <div className="content-layout"><h1>{slide.title}</h1><div className="l14-arithmetic"><article><small>PREDICTION</small><span>w × x</span><strong>1 × 2 = 2</strong></article><b>→</b><article><small>ERROR</small><span>prediction - target</span><strong>2 - 4 = -2</strong></article><b>→</b><article><small>LOSS</small><span>error²</span><strong>(-2)² = 4</strong></article></div></div>}
      {slide.kind === 'torch-backward' && <div className="content-layout"><h1>{slide.title}</h1><div className="l14-backward"><span>loss.backward()</span><article><small>PYTORCH TRACES THE GRAPH</small><strong>gradient of w = -8</strong><p>Same result as 2 × error × input = 2 × (-2) × 2.</p></article></div></div>}
      {slide.kind === 'torch-live' && <div className="generated-slide interactive-slide"><h1>{slide.title}</h1><InteractiveLab lab="autograd" /></div>}
      {slide.kind === 'torch-compare' && <div className="content-layout"><h1>{slide.title}</h1><div className="l14-compare"><article><small>BY HAND · LESSON 11</small>{['Find output error','Find output-weight gradient','Send blame to hidden layer','Apply the ReLU gate','Find input-weight gradient'].map((x,i)=><p key={x}><span>{i+1}</span>{x}</p>)}</article><article><small>PYTORCH</small><strong>loss.backward()</strong><p>Traverses the same chain and fills every parameter’s gradient.</p></article></div></div>}
      {slide.kind === 'torch-sequential' && <div className="content-layout"><h1>{slide.title}</h1>{theory([['Sequential means “run in this order”','Each block receives the output of the block before it.'],['Linear layers own weights and biases','PyTorch creates and initializes those parameters.'],['Activation layers shape behavior','ReLU builds features; Sigmoid reports a probability.']])}</div>}
      {slide.kind === 'torch-architecture' && <div className="content-layout"><h1>{slide.title}</h1><div className="l14-network"><article><small>INPUT</small><strong>1 value</strong></article><b>Linear</b><article><small>HIDDEN</small><strong>4 values</strong></article><b>ReLU</b><article><small>ACTIVATED</small><strong>4 values</strong></article><b>Linear + Sigmoid</b><article className="output"><small>OUTPUT</small><strong>1 probability</strong></article></div></div>}
      {slide.kind === 'torch-count-one' && <div className="content-layout"><h1>{slide.title}</h1><div className="l14-count"><article><small>WEIGHTS</small><span>4 neurons × 1 input</span><strong>4</strong></article><b>+</b><article><small>BIASES</small><span>1 for each hidden neuron</span><strong>4</strong></article><b>=</b><article className="total"><small>LAYER TOTAL</small><strong>8</strong></article></div></div>}
      {slide.kind === 'torch-count-two' && <div className="content-layout"><h1>{slide.title}</h1><div className="l14-count"><article><small>WEIGHTS</small><span>1 output × 4 hidden values</span><strong>4</strong></article><b>+</b><article><small>BIAS</small><span>1 for the output neuron</span><strong>1</strong></article><b>=</b><article className="total"><small>LAYER TOTAL</small><strong>5</strong></article></div><p className="rule-chip">Network total = 8 + 5 = 13 learned parameters</p></div>}
      {slide.kind === 'torch-model-call' && <div className="content-layout"><h1>{slide.title}</h1><div className="l14-model-call"><span>x = [[2.0]]</span><b>model(x)</b><span>Linear</span><span>ReLU</span><span>Linear</span><span>Sigmoid</span><strong>p ≈ 0.5731</strong></div><p className="takeaway">The exact first output changes because the initial weights are random.</p></div>}
      {slide.kind === 'torch-data' && <div className="content-layout"><h1>{slide.title}</h1><div className="l14-dataset"><article><small>INPUT TENSOR X · SHAPE [6, 1]</small><strong>-3 · -2 · -1 · 1 · 2 · 3</strong></article><article><small>LABEL TENSOR y · SHAPE [6, 1]</small><strong>0 · 0 · 0 · 1 · 1 · 1</strong></article></div></div>}
      {slide.kind === 'torch-setup' && <div className="content-layout"><h1>{slide.title}</h1><div className="l14-roles"><article><span>01</span><strong>model</strong><p>Linear → ReLU → Linear → Sigmoid</p></article><article><span>02</span><strong>BCELoss</strong><p>Measures binary classification error.</p></article><article><span>03</span><strong>SGD · lr 0.1</strong><p>Uses gradients to update every parameter.</p></article></div></div>}
      {slide.kind === 'torch-loop' && <div className="content-layout"><h1>{slide.title}</h1><div className="l14-loop"><article><span>01</span><small>CLEAR</small><strong>optimizer.zero_grad()</strong><p>Remove gradients left from the previous epoch.</p></article><article><span>02</span><small>CALCULATE</small><strong>loss.backward()</strong><p>Backpropagate through every layer.</p></article><article><span>03</span><small>UPDATE</small><strong>optimizer.step()</strong><p>Apply w ← w - learning rate × gradient.</p></article></div></div>}
      {slide.kind === 'torch-epochs' && <div className="content-layout"><h1>{slide.title}</h1><div className="l14-table epochs"><div><span>Epoch</span><span>Representative BCE loss</span><span>Reading</span></div>{[['1','0.7234','random start'],['10','0.4891','learning the sign'],['50','0.0512','confident separation'],['200','0.0013','near-perfect fit']].map(row=><div className={row[0]==='200'?'learned':''} key={row[0]}>{row.map((cell,i)=><span className={i===1?'accent':''} key={cell}>{cell}</span>)}</div>)}</div></div>}
      {slide.kind === 'torch-predictions' && <div className="content-layout"><h1>{slide.title}</h1><div className="l14-table predictions"><div><span>x</span><span>p(class 1)</span><span>Prediction</span><span>Result</span></div>{[['-3','0.0002','negative'],['-2','0.0011','negative'],['-1','0.0085','negative'],['1','0.9920','positive'],['2','0.9990','positive'],['3','0.9998','positive']].map(row=><div key={row[0]}>{row.map((cell,i)=><span className={i===1?'accent':''} key={cell}>{cell}</span>)}<span className="check">✓</span></div>)}</div></div>}
      {slide.kind === 'torch-randomness' && <div className="content-layout"><h1>{slide.title}</h1>{theory([['Weights begin randomly','A new run starts from a slightly different model.'],['The exact losses may vary','0.7234 and 0.70 can both be valid first-epoch results.'],['The learning pattern should agree','Loss should fall and the six labels should separate correctly.']])}</div>}
      {slide.kind === 'torch-deeper' && <div className="content-layout"><h1>{slide.title}</h1><div className="l14-depth"><article><small>SHALLOW</small><span>1</span><b>→</b><span>4</span><b>→</b><strong>1</strong><p>Linear · ReLU · Linear · Sigmoid</p></article><article><small>DEEP</small><span>1</span><b>→</b><span>8</span><b>→</b><span>8</span><b>→</b><span>4</span><b>→</b><strong>1</strong><p>Three hidden Linear + ReLU pairs · one output</p></article></div></div>}
      {slide.kind === 'torch-deep-count' && <div className="content-layout"><h1>{slide.title}</h1><div className="l14-deep-count"><article><small>SHALLOW</small><strong>8 + 5 = 13</strong><p>1→4 layer plus 4→1 layer.</p></article><article><small>DEEP</small><span>1→8: 16</span><span>8→8: 72</span><span>8→4: 36</span><span>4→1: 5</span><strong>total = 129</strong></article></div><p className="takeaway">More layers add parameters; <b>autograd handles all 129 gradients</b>.</p></div>}
      {slide.kind === 'torch-replaced' && <div className="content-layout"><h1>{slide.title}</h1><div className="l14-translate"><div><span>Idea learned by hand</span><span>PyTorch block</span></div>{[['y = w × x + b','nn.Linear'],['ReLU(z) = max(0, z)','nn.ReLU'],['Sigmoid(z)','nn.Sigmoid'],['Binary cross-entropy','nn.BCELoss'],['Manual chain-rule gradients','loss.backward()'],['w ← w - lr × gradient','optimizer.step()']].map(row=><div key={row[0]}><span>{row[0]}</span><strong>{row[1]}</strong></div>)}</div></div>}
      {slide.kind === 'torch-understanding' && <div className="content-layout"><h1>{slide.title}</h1>{theory([['PyTorch does not replace the concepts','Linear, ReLU, Sigmoid, BCE, and gradient descent behave as before.'],['It replaces repetitive bookkeeping','The calculation graph tracks dependencies and gradient flow.'],['Your understanding helps you debug','You can spot wrong shapes, blocked gradients, unsuitable losses, and unstable updates.']])}</div>}
      {slide.kind === 'torch-check' && <div className="content-layout"><h1>{slide.title}</h1><div className="quiz-grid l14-quiz">{[
        ['01','What does requires_grad=True request?','Track operations so a gradient can be stored for that tensor.'],
        ['02','What does loss.backward() do?','Runs backpropagation and calculates all tracked gradients.'],
        ['03','What are the three training actions?','zero_grad(), backward(), then step().'],
        ['04','How do you build two hidden layers?','Repeat Linear → ReLU twice, then add the output layer.'],
        ['05','Why learn the math by hand first?','So the framework operations, gradient flow, and failures are understandable.'],
      ].map(([n,q,a])=><article className={revealed?'answered':''} key={n}><span>{n}</span><p>{q}</p><strong>{revealed?a:'Think first…'}</strong></article>)}</div></div>}
      {slide.kind === 'torch-next' && <div className="bridge-layout"><h1>{slide.title}</h1><div className="bridge-compare"><div><small>LESSONS 1–13 · BY HAND</small><strong>Every idea</strong><p>neuron, loss, gradient, backprop</p></div><span>→</span><div><small>LESSON 14 · PYTORCH</small><strong>The same ideas, automated</strong><p>tensors, autograd, optimizers</p></div></div><p className="next-question">Predict, measure, compute gradients, update — at any scale.</p><span className="next-lesson">NEURAL NETWORKS · COURSE COMPLETE</span></div>}
    </>}
  </PresentationShell>;
}
