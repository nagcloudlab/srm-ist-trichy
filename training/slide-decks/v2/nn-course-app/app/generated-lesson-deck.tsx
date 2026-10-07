'use client';

import type { CSSProperties } from 'react';
import { courseLessons } from './course-data';
import generated from './generated-lessons.json';
import { InteractiveLab } from './interactive-labs';
import { PresentationShell, type LessonSection, type PresenterNote, type SlideMeta } from './presentation-shell';

type TextBlock = { type: 'text'; text: string };
type CalloutBlock = { type: 'callout'; text: string };
type ListBlock = { type: 'list'; items: string[] };
type StepsBlock = { type: 'steps'; steps: string[] };
type TableBlock = { type: 'table'; headers: string[]; rows: string[][] };
type Block = TextBlock | CalloutBlock | ListBlock | StepsBlock | TableBlock;
type GeneratedSlide = { id: string; title: string; section: string; kind: string; blocks: Block[]; lab?: string; viewTitle?: string };
type GeneratedLesson = { number: string; title: string; slides: GeneratedSlide[] };

const lessonData = generated as GeneratedLesson[];
const interactiveSpecs: Record<string, { after: string; lab: string; title: string }> = {
  '05': { after: 'Compare learning rates over 10 steps', lab: 'descent', title: 'Watch the learning rate change the journey' },
  '06': { after: 'Derive it step by step (one example)', lab: 'gradient', title: 'Calculate the exact gradient live' },
  '07': { after: 'Train both parameters', lab: 'dual-parameter', title: 'Move weight and bias together' },
  '08': { after: 'Calculate a prediction', lab: 'multi-input', title: 'See each input contribute' },
  '09': { after: 'Meet ReLU', lab: 'relu', title: 'Move through the ReLU gate' },
  '11': { after: 'Experiment: what if ReLU is OFF?', lab: 'relu', title: 'Test when the backward gate is open' },
  '12': { after: 'BCE step by step', lab: 'sigmoid-bce', title: 'Turn scores into probabilities and loss' },
  '13': { after: 'Forward pass by hand', lab: 'sigmoid-bce', title: 'Move a score across the decision boundary' },
};

const lessonDesign: Record<string, { phase: string; tagline: string; accent: string; soft: string }> = {
  '09': { phase: 'NETWORKS', tagline: 'Discover why nonlinearity gives a network the power to bend', accent: '#3157d5', soft: '#e8edff' },
  '10': { phase: 'NETWORKS', tagline: 'Follow information through your first hidden layer', accent: '#7353bd', soft: '#f0ebff' },
  '11': { phase: 'NETWORKS', tagline: 'Pass responsibility backward, one connection at a time', accent: '#eb5a46', soft: '#fff0ed' },
  '12': { phase: 'CLASSIFICATION', tagline: 'Turn raw scores into probabilities and meaningful penalties', accent: '#277a59', soft: '#e3f5ed' },
  '13': { phase: 'CLASSIFICATION', tagline: 'Train a decision boundary that can say yes or no', accent: '#3157d5', soft: '#e8edff' },
  '14': { phase: 'PYTORCH', tagline: 'Let automatic differentiation scale the ideas you built by hand', accent: '#eb5a46', soft: '#fff0ed' },
};

const knowledgeAnswers: Record<string, string[]> = {
  '09': ['A straight line cannot represent a curved x² pattern.', 'No. More epochs cannot fix insufficient model capacity.', 'Linear functions composed together are still one linear function.', '0', '5', '0'],
  '10': ['It sits between the visible input and output layers.', 'z is the weighted sum before activation; h is the value after activation.', 'Seven parameters: four layer weights and three biases.', 'They learn the same feature, wasting one neuron.', 'The sequence of calculations from input to prediction.'],
  '11': ['The local derivative of the next operation.', 'Yes—at the ReLU step, because z is positive.', 'No. ReLU’s derivative is zero there.', 'The backward pass needs to know whether ReLU was on.', 'Every gradient must describe the same parameter state.'],
  '12': ['Between 0 and 1.', '0.5', 'BCE strongly penalizes confident wrong classifications and matches probabilities.', 'Low.', 'High.', 'Its estimate that the input is real.'],
  '13': ['The probability that the input belongs to class 1.', 'Binary cross-entropy.', 'prediction − target.', 'It makes the transition between classes steeper.', 'It shifts the decision boundary.', 'Both output a probability for a binary decision.'],
  '14': ['It tells PyTorch to track operations so a gradient can be computed.', 'It computes gradients backward through the saved computation graph.', 'Clear gradients, run backward, update parameters.', 'Add another Linear → activation pair before the output.', 'So every automatic operation has a concrete meaning.'],
};

function withInteractiveSlide(lesson: GeneratedLesson): GeneratedSlide[] {
  const spec = interactiveSpecs[lesson.number];
  if (!spec) return lesson.slides;
  const slides = [...lesson.slides];
  let insertAt = slides.map((slide) => slide.title).lastIndexOf(spec.after);
  if (insertAt < 0) insertAt = Math.max(0, slides.length - 2);
  slides.splice(insertAt + 1, 0, { id: `live-${spec.lab}`, title: spec.title, section: spec.after, kind: 'interactive', blocks: [], lab: spec.lab });
  return slides;
}

function displayText(value: string) {
  return value
    .replaceAll('\\rightarrow', '→')
    .replaceAll('\\approx', '≈')
    .replaceAll('\\times', '×')
    .replaceAll('\\sum', 'Σ')
    .replaceAll('\\frac', '')
    .replaceAll('\\text', '')
    .replaceAll('np.mean', 'mean')
    .replaceAll('np.maximum', 'maximum')
    .replaceAll('np.array', 'vector')
    .replace(/[{}]/g, '')
    .replace(/â†’/g, '→').replace(/â‰ˆ/g, '≈').replace(/â€”/g, '—')
    .replace(/\s+/g, ' ')
    .trim();
}

function decorateTitles(slides: GeneratedSlide[]) {
  const totals = new Map<string, number>();
  const seen = new Map<string, number>();
  slides.forEach((slide) => totals.set(slide.title, (totals.get(slide.title) ?? 0) + 1));
  return slides.map((slide) => {
    const position = (seen.get(slide.title) ?? 0) + 1;
    seen.set(slide.title, position);
    const total = totals.get(slide.title) ?? 1;
    return { ...slide, viewTitle: total > 1 && slide.kind !== 'cover' ? `${slide.title} · ${position}/${total}` : slide.title };
  });
}

function Table({ block }: { block: TableBlock }) {
  return <div className="generated-table" role="table">
    <div className="generated-table-row generated-table-head" role="row" style={{ gridTemplateColumns: `repeat(${block.headers.length}, minmax(120px, 1fr))` }}>
      {block.headers.map((cell, index) => <span role="columnheader" key={`${cell}-${index}`}>{displayText(cell)}</span>)}
    </div>
    {block.rows.map((row, rowIndex) => <div className="generated-table-row" role="row" key={rowIndex} style={{ gridTemplateColumns: `repeat(${block.headers.length}, minmax(120px, 1fr))` }}>
      {row.map((cell, index) => <span role="cell" key={`${cell}-${index}`}>{displayText(cell)}</span>)}
    </div>)}
  </div>;
}

function BlockView({ block }: { block: Block }) {
  if (block.type === 'text') return <p className="generated-statement">{displayText(block.text)}</p>;
  if (block.type === 'callout') return <div className="generated-callout"><small>FOCUS</small><strong>{displayText(block.text)}</strong></div>;
  if (block.type === 'list') return <div className="generated-list">{block.items.map((item, index) => <article key={item}><span>{String(index + 1).padStart(2, '0')}</span><p>{displayText(item)}</p></article>)}</div>;
  if (block.type === 'steps') return <div className="generated-steps">{block.steps.map((step, index) => <article key={`${step}-${index}`}><span>{index + 1}</span><p>{displayText(step)}</p></article>)}</div>;
  return <Table block={block} />;
}

function KnowledgeCheck({ lessonNumber, block, revealed }: { lessonNumber: string; block: ListBlock; revealed: boolean }) {
  const answers = knowledgeAnswers[lessonNumber] ?? [];
  return <div className="quiz-grid generated-quiz">{block.items.map((question, index) => <article className={revealed ? 'answered' : ''} key={question}><span>{String(index + 1).padStart(2, '0')}</span><p>{displayText(question)}</p><strong>{revealed ? answers[index] ?? 'Discuss your reasoning.' : 'Explain first…'}</strong></article>)}</div>;
}

function pickSections(slides: GeneratedSlide[]): LessonSection[] {
  const candidates: LessonSection[] = [{ label: 'Open', at: 0 }];
  slides.forEach((slide, index) => {
    if (index > 0 && slide.section !== slides[index - 1].section) candidates.push({ label: slide.section, at: index });
  });
  if (candidates.length <= 6) return candidates;
  const indexes = [0, .2, .4, .6, .8, 1].map((ratio) => Math.min(candidates.length - 1, Math.round((candidates.length - 1) * ratio)));
  return [...new Set(indexes)].map((index) => ({ label: candidates[index].label.split(/[:—]/)[0].slice(0, 15), at: candidates[index].at }));
}

export function GeneratedLessonDeck({ lessonNumber }: { lessonNumber: string }) {
  const lesson = lessonData.find((item) => item.number === lessonNumber);
  if (!lesson) return null;
  const sourceSlides = decorateTitles(withInteractiveSlide(lesson));
  const design = lessonDesign[lesson.number] ?? { phase: 'NEURAL NETWORKS', tagline: 'Build the idea one clear step at a time', accent: '#3157d5', soft: '#e8edff' };
  const slides: SlideMeta[] = sourceSlides.map((slide) => ({ kicker: slide.section.toUpperCase(), title: slide.viewTitle!, kind: slide.id, reveal: slide.title === 'Knowledge check' }));
  const notes = Object.fromEntries(sourceSlides.map((slide) => [slide.id, {
    time: slide.kind === 'cover' ? '1 MIN' : slide.kind === 'interactive' ? '4–6 MIN' : '2–4 MIN',
    say: slide.kind === 'interactive' ? 'Change one control at a time. Ask learners to predict the result before moving it.' : slide.kind === 'steps' ? `Walk through ${slide.title} one visible operation at a time.` : `Connect this evidence to the lesson question: ${slide.title}.`,
    ask: slide.kind === 'interactive' ? 'What do you predict will happen before we change the value?' : slide.title.toLowerCase().includes('knowledge check') ? 'Ask learners to justify each answer before revealing it.' : 'What is the most important relationship on this slide?',
  }])) as Record<string, PresenterNote>;

  return <PresentationShell courseLessons={courseLessons} lessonNumber={lesson.number} notes={notes} sections={pickSections(sourceSlides)} slides={slides}>
    {({ index, revealed }) => {
      const current = sourceSlides[index];
      const themeStyle = { '--lesson-accent': design.accent, '--lesson-soft': design.soft } as CSSProperties;
      if (current.kind === 'cover') return <div className="generated-cover advanced-cover" style={themeStyle}>
        <div><p className="chapter">{lesson.number} · {design.phase}</p><h1>{lesson.title}</h1><p className="subtitle">{design.tagline}</p></div>
        <div className="generated-orbit" aria-hidden="true"><span>{lesson.number}</span><i /><i /><i /><strong>{design.phase}</strong></div>
      </div>;
      if (current.kind === 'interactive') return <div className="generated-slide interactive-slide advanced-slide" style={themeStyle}><h1>{current.viewTitle}</h1><InteractiveLab lab={current.lab!} /></div>;
      if (current.title === 'Next lesson') return <div className="generated-next" style={themeStyle}><p className="chapter">LESSON {lesson.number} · COMPLETE</p><h1>{current.viewTitle}</h1><div className="generated-next-card"><span>→</span><p>{displayText((current.blocks[0] as TextBlock).text)}</p></div></div>;
      const knowledge = current.title === 'Knowledge check' && current.blocks[0]?.type === 'list';
      return <div className={`generated-slide advanced-slide generated-kind-${current.kind} ${knowledge ? 'generated-knowledge' : ''}`} style={themeStyle}>
        <div className="generated-heading"><h1>{current.viewTitle}</h1><span>{String(index + 1).padStart(2, '0')} / {String(sourceSlides.length).padStart(2, '0')}</span></div>
        {knowledge ? <KnowledgeCheck lessonNumber={lesson.number} block={current.blocks[0] as ListBlock} revealed={revealed} /> : <div className={`generated-blocks blocks-${current.blocks.length}`}>{current.blocks.map((block, blockIndex) => <BlockView block={block} key={`${block.type}-${blockIndex}`} />)}</div>}
      </div>;
    }}
  </PresentationShell>;
}
