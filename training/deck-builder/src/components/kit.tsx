import { useEffect, useLayoutEffect, useRef, type CSSProperties, type ReactNode } from 'react';

// useLayoutEffect in the browser (no flash), useEffect during server rendering (no warning)
const useIsoLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

/**
 * The shared slide vocabulary. Semantic tones (keep them consistent across the day):
 *   blue   – input, noise, data           mint  – Generator, correct, "good"
 *   coral  – Discriminator, error, "bad"  violet – weights / parameters
 *   yellow – emphasis, the key takeaway   ink   – neutral, strong      plain – neutral, quiet
 */
export type Tone = 'blue' | 'coral' | 'mint' | 'yellow' | 'violet' | 'ink' | 'plain';

const cx = (...names: (string | false | undefined)[]) => names.filter(Boolean).join(' ');

/* ---------- text ---------- */

export function Takeaway({ children, tone = 'yellow' }: { children: ReactNode; tone?: Tone }) {
  return <p className={cx('takeaway', `tone-${tone}`)}><span>{children}</span></p>;
}

export function Big({ children, sub }: { children: ReactNode; sub?: ReactNode }) {
  return <div className="big-statement"><p>{children}</p>{sub && <span>{sub}</span>}</div>;
}

export function Quote({ children, by }: { children: ReactNode; by?: ReactNode }) {
  return <blockquote className="quote"><p>{children}</p>{by && <cite>{by}</cite>}</blockquote>;
}

export function Pill({ children, tone = 'plain' }: { children: ReactNode; tone?: Tone }) {
  return <span className={cx('pill', `tone-${tone}`)}>{children}</span>;
}

/** Colored math term, e.g. <T tone="violet">w</T>. */
export function T({ children, tone }: { children: ReactNode; tone: Tone }) {
  return <span className={cx('term', `tone-${tone}`)}>{children}</span>;
}

/** Large centered equation with optional plain-English reading underneath. */
export function Equation({ children, reading, size = 'lg' }: { children: ReactNode; reading?: ReactNode; size?: 'md' | 'lg' | 'xl' }) {
  const box = useRef<HTMLDivElement>(null);
  const line = useRef<HTMLDivElement>(null);
  // A formula never wraps: if it is wider than its column, the type shrinks until it fits on one line.
  useIsoLayoutEffect(() => {
    const fit = () => {
      const el = line.current, host = box.current;
      if (!el || !host) return;
      el.style.fontSize = '';
      el.style.maxWidth = 'none';
      el.style.width = 'max-content';
      const room = host.clientWidth;
      // offsetWidth of a max-content box = glyphs + padding + border, i.e. the width it really needs
      for (let pass = 0; pass < 4 && room > 0 && el.offsetWidth > room; pass++) {
        el.style.fontSize = `${parseFloat(getComputedStyle(el).fontSize) * (room / el.offsetWidth) * 0.97}px`;
      }
      el.style.maxWidth = '';
      el.style.width = '';
    };
    fit();
    const observer = new ResizeObserver(fit);
    if (box.current) observer.observe(box.current);
    return () => observer.disconnect();
  }, [children]);
  return <div ref={box} className={cx('equation', `eq-${size}`)}><div ref={line} className="eq-line">{children}</div>{reading && <p className="eq-reading">{reading}</p>}</div>;
}

/* ---------- layout ---------- */

export function Split({ left, right, ratio = '1fr 1fr', align = 'center' }: { left: ReactNode; right: ReactNode; ratio?: string; align?: 'start' | 'center' }) {
  return <div className="split" style={{ '--split': ratio, alignItems: align } as CSSProperties}><div>{left}</div><div>{right}</div></div>;
}

export function Stack({ children, gap = 'md' }: { children: ReactNode; gap?: 'sm' | 'md' | 'lg' }) {
  return <div className={cx('stack', `gap-${gap}`)}>{children}</div>;
}

/* ---------- cards ---------- */

export type CardItem = { tag?: ReactNode; title: ReactNode; body?: ReactNode; tone?: Tone; icon?: ReactNode };

export function Card({ tag, title, body, tone = 'plain', icon, children }: CardItem & { children?: ReactNode }) {
  return (
    <article className={cx('card', `tone-${tone}`)}>
      {icon && typeof icon !== 'string' && <div className="card-icon" aria-hidden="true">{icon}</div>}
      {tag && <small className="card-tag">{tag}</small>}
      <strong className="card-title">{title}</strong>
      {body && <div className="card-body">{body}</div>}
      {children}
    </article>
  );
}

export function Cards({ items, cols }: { items: CardItem[]; cols?: number }) {
  return <div className="cards" style={{ '--cols': cols ?? Math.min(items.length, 4) } as CSSProperties}>{items.map((item, i) => <Card key={i} {...item} />)}</div>;
}

/** Numbered process: one row per step. */
export function Steps({ items, tone = 'blue' }: { items: { title: ReactNode; body?: ReactNode; tone?: Tone }[]; tone?: Tone }) {
  return (
    <ol className="steps">
      {items.map((item, i) => (
        <li key={i} className={`tone-${item.tone ?? tone}`}>
          <span className="step-num">{String(i + 1).padStart(2, '0')}</span>
          <div><strong>{item.title}</strong>{item.body && <p>{item.body}</p>}</div>
        </li>
      ))}
    </ol>
  );
}

/** Good-vs-bad comparison for a single approach. */
export function ProsCons({ good, bad, goodLabel = 'Strengths', badLabel = 'Weaknesses' }: { good: ReactNode[]; bad: ReactNode[]; goodLabel?: string; badLabel?: string }) {
  return (
    <div className="proscons">
      <div className="pc-col pc-good"><small>{goodLabel}</small><ul>{good.map((g, i) => <li key={i}>{g}</li>)}</ul></div>
      <div className="pc-col pc-bad"><small>{badLabel}</small><ul>{bad.map((b, i) => <li key={i}>{b}</li>)}</ul></div>
    </div>
  );
}

/** Side-by-side "A vs B". */
export function Versus({ left, right, mid = 'vs' }: { left: CardItem; right: CardItem; mid?: ReactNode }) {
  return <div className="versus"><Card {...left} /><span className="versus-mid">{mid}</span><Card {...right} /></div>;
}

/* ---------- data ---------- */

export function Table({ headers, rows, highlight, compact, align }: {
  headers: ReactNode[];
  rows: ReactNode[][];
  highlight?: number[];
  compact?: boolean;
  align?: ('left' | 'right' | 'center')[];
}) {
  return (
    <div className="table-wrap">
      <table className={cx('table', compact && 'table-compact')}>
        <thead><tr>{headers.map((h, i) => <th key={i} style={{ textAlign: align?.[i] }}>{h}</th>)}</tr></thead>
        <tbody>{rows.map((row, r) => <tr key={r} className={highlight?.includes(r) ? 'hl' : ''}>{row.map((cell, c) => <td key={c} style={{ textAlign: align?.[c] }}>{cell}</td>)}</tr>)}</tbody>
      </table>
    </div>
  );
}

export function Stats({ items }: { items: { value: ReactNode; label: ReactNode; tone?: Tone }[] }) {
  return <div className="stats">{items.map((s, i) => <div key={i} className={cx('stat', `tone-${s.tone ?? 'plain'}`)}><strong>{s.value}</strong><span>{s.label}</span></div>)}</div>;
}

/* ---------- flows and traces ---------- */

export type FlowNode = { label?: ReactNode; value: ReactNode; tone?: Tone; note?: ReactNode } | { op: ReactNode };

/** Left-to-right pipeline. Use { op: '→' } or { op: '×' } between nodes. */
export function Flow({ nodes, caption, size = 'md' }: { nodes: FlowNode[]; caption?: ReactNode; size?: 'sm' | 'md' | 'lg' }) {
  return (
    <figure className={cx('flow', `flow-${size}`)}>
      <div className="flow-row">
        {nodes.map((n, i) => 'op' in n
          ? <span key={i} className="flow-op">{n.op}</span>
          : <div key={i} className={cx('flow-node', `tone-${n.tone ?? 'plain'}`)}>{n.label && <small>{n.label}</small>}<strong>{n.value}</strong>{n.note && <span>{n.note}</span>}</div>)}
      </div>
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  );
}

/** Rows of "left → right" mappings, e.g. analogies or before/after. */
export function Mapping({ rows, leftLabel, rightLabel }: { rows: [ReactNode, ReactNode][]; leftLabel?: ReactNode; rightLabel?: ReactNode }) {
  return (
    <div className="mapping">
      {(leftLabel || rightLabel) && <div className="mapping-head"><small>{leftLabel}</small><span /><small>{rightLabel}</small></div>}
      {rows.map(([a, b], i) => <div key={i} className="mapping-row"><span>{a}</span><b aria-hidden="true">→</b><strong>{b}</strong></div>)}
    </div>
  );
}

export function Timeline({ items }: { items: { when: ReactNode; title: ReactNode; body?: ReactNode; tone?: Tone }[] }) {
  return (
    <ol className="timeline">
      {items.map((item, i) => <li key={i} className={`tone-${item.tone ?? 'plain'}`}><span className="tl-when">{item.when}</span><span className="tl-dot" /><div><strong>{item.title}</strong>{item.body && <p>{item.body}</p>}</div></li>)}
    </ol>
  );
}

/* ---------- code ---------- */

const PY_KEYWORDS = new Set(['import', 'from', 'as', 'def', 'return', 'for', 'in', 'if', 'else', 'elif', 'with', 'class', 'while', 'and', 'or', 'not', 'None', 'True', 'False', 'print', 'range', 'lambda']);

function highlightPython(line: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /(#.*$)|("[^"]*"|'[^']*'|f"[^"]*")|(\b\d+(?:\.\d+)?\b)|([A-Za-z_][A-Za-z0-9_]*)|(\s+)|(.)/g;
  let m: RegExpExecArray | null;
  let k = 0;
  while ((m = re.exec(line))) {
    const [tok, comment, str, num, word] = m;
    if (comment) out.push(<span key={k++} className="tk-c">{tok}</span>);
    else if (str) out.push(<span key={k++} className="tk-s">{tok}</span>);
    else if (num) out.push(<span key={k++} className="tk-n">{tok}</span>);
    else if (word && PY_KEYWORDS.has(word)) out.push(<span key={k++} className="tk-k">{tok}</span>);
    else if (word && /^(nn|torch|optim)$/.test(word)) out.push(<span key={k++} className="tk-m">{tok}</span>);
    else out.push(tok);
  }
  return out;
}

/**
 * Projected code: keep it short (≤ 14 lines). `marks` highlights 1-based lines with a tone;
 * `notes` puts a margin explanation beside a line.
 */
export function Code({ code, marks, notes, title, dim }: {
  code: string;
  marks?: Record<number, Tone>;
  notes?: Record<number, ReactNode>;
  title?: ReactNode;
  dim?: boolean;
}) {
  const lines = code.replace(/^\n+|\s+$/g, '').split('\n');
  const hasNotes = notes && Object.keys(notes).length > 0;
  return (
    <figure className={cx('code', hasNotes && 'code-annotated', dim && 'code-dim')}>
      {title && <figcaption>{title}</figcaption>}
      <div className="code-lines">
        {lines.map((line, i) => {
          const n = i + 1;
          const tone = marks?.[n];
          return (
            <div key={i} className={cx('code-line', tone && `mark tone-${tone}`)}>
              <span className="ln">{n}</span>
              <code>{line ? highlightPython(line) : ' '}</code>
              {hasNotes && <span className="code-note">{notes?.[n]}</span>}
            </div>
          );
        })}
      </div>
    </figure>
  );
}

/** Program output, printed like a terminal. */
export function Output({ children, title = 'OUTPUT' }: { children: string; title?: string }) {
  return <figure className="output"><figcaption>{title}</figcaption><pre>{children.replace(/^\n+|\s+$/g, '')}</pre></figure>;
}

/* ---------- interaction ---------- */

/** Shows `children` once revealed; otherwise a "think first" placeholder. */
export function Reveal({ revealed, children, placeholder = 'Think first… then press R' }: { revealed: boolean; children: ReactNode; placeholder?: ReactNode }) {
  return <div className={cx('reveal', revealed && 'is-revealed')}>{revealed ? children : <span className="reveal-wait">{placeholder}</span>}</div>;
}

/** Knowledge check: answers appear inside each card when R is pressed. */
export function Quiz({ items, revealed, cols }: { items: { q: ReactNode; a: ReactNode }[]; revealed: boolean; cols?: number }) {
  return (
    <div className="quiz" style={{ '--cols': cols ?? (items.length > 4 ? 3 : 2) } as CSSProperties}>
      {items.map((item, i) => (
        <article key={i} className={revealed ? 'answered' : ''}>
          <span className="quiz-num">{String(i + 1).padStart(2, '0')}</span>
          <p className="quiz-q">{item.q}</p>
          <div className="quiz-a">{revealed ? item.a : 'Think first…'}</div>
        </article>
      ))}
    </div>
  );
}

/** Prediction prompt: learners commit before the answer appears in place. */
/** Prediction prompt: a one-line question, optional short fact lines, answer revealed in place. */
export function Predict({ question, facts, answer, revealed }: { question?: ReactNode; facts?: ReactNode[]; answer: ReactNode; revealed: boolean }) {
  return (
    <div className={cx('predict', revealed && 'is-revealed')}>
      <div className="predict-q"><small>{question ? 'PREDICT' : 'PREDICT · THE SETUP'}</small>{question && <div className="predict-q-text">{question}</div>}{facts && <ul className="predict-facts">{facts.map((f, i) => <li key={i}><span>{f}</span></li>)}</ul>}</div>
      <div className="predict-a"><small>{revealed ? 'ANSWER' : 'COMMIT TO AN ANSWER'}</small>{revealed ? <div>{answer}</div> : <p className="reveal-wait">Press R when everyone has a guess</p>}</div>
    </div>
  );
}

/** Short answer for Predict: a verdict, then one idea per line. */
export function Answer({ verdict, points }: { verdict: ReactNode; points: ReactNode[] }) {
  return <div className="answer-block"><strong className="answer-verdict">{verdict}</strong><ul className="answer-points">{points.map((p, i) => <li key={i}><span>{p}</span></li>)}</ul></div>;
}

export function Recap({ items }: { items: ReactNode[] }) {
  return <ol className="recap">{items.map((item, i) => <li key={i}><span>{i + 1}</span><p>{item}</p></li>)}</ol>;
}

/**
 * One slide per hands-on notebook: what to open, why, what to show, what to look for.
 * Use exactly one LabDemo slide where the notebook is run (kicker 'Lab demo').
 */
export function LabDemo({ notebook, goal, steps, watch, yourTurn }: {
  notebook: string;
  /** Kept for reference only — lab timing is not shown on slides. */
  minutes?: number;
  goal: ReactNode;
  steps: ReactNode[];
  watch: ReactNode[];
  yourTurn?: ReactNode;
}) {
  return (
    <div className="labdemo">
      <aside className="labdemo-file">
        <small>JUPYTER LAB</small>
        <code>{notebook}</code>
        <p className="labdemo-goal">{goal}</p>
        <span className="labdemo-path">this unit’s labs/ folder · labs/{notebook}</span>
      </aside>
      <div className="labdemo-steps">
        <small>DEMO · RUN THESE CELLS</small>
        <ol>{steps.map((s, i) => <li key={i}><span>{i + 1}</span><div>{s}</div></li>)}</ol>
      </div>
      <div className="labdemo-watch">
        <small>POINT OUT</small>
        <ul>{watch.map((w, i) => <li key={i}><span>{w}</span></li>)}</ul>
        {yourTurn && <p className="labdemo-turn"><b>Your turn</b>{yourTurn}</p>}
      </div>
    </div>
  );
}

/* ---------- formula explanations ---------- */

export type FormulaTerm = { symbol: ReactNode; name: ReactNode; meaning: ReactNode; range?: ReactNode; tone?: Tone };

/**
 * Formula, term by term: the equation (one line, auto-fit), how to read it aloud,
 * then every symbol with its name, its job and (optionally) its range or units.
 */
export function FormulaTerms({ formula, reading, terms, cols, symbolWidth, smallSymbols }: { formula: ReactNode; reading?: ReactNode; terms: FormulaTerm[]; cols?: 1 | 2; /** widen the symbol column for long symbols, e.g. '9rem' */ symbolWidth?: string; /** smaller symbol type for long expressions such as log(1−D(G(z))) */ smallSymbols?: boolean }) {
  return (
    <div className="ftx">
      <Equation size="md" reading={reading}>{formula}</Equation>
      <div className={cx('ftx-terms', smallSymbols && 'ftx-sm')} style={{ '--cols': cols ?? (terms.length > 4 ? 2 : 1), ...(symbolWidth ? { '--sym-w': symbolWidth } : {}) } as CSSProperties}>
        {terms.map((t, i) => (
          <div key={i} className={cx('ftx-term', `tone-${t.tone ?? 'plain'}`)}>
            <span className="ftx-sym">{t.symbol}</span>
            <div><strong>{t.name}</strong><p>{t.meaning}</p></div>
            {t.range && <em className="ftx-range">{t.range}</em>}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Formula, worked: given values, then one substitution per line (math on the left,
 * a short plain-English note on the right), ending in a highlighted result.
 */
export function FormulaSteps({ formula, given, steps, result }: {
  formula?: ReactNode;
  given: ReactNode[];
  steps: { math: ReactNode; note?: ReactNode }[];
  result: ReactNode;
}) {
  return (
    <div className="fst">
      {formula && <Equation size="md">{formula}</Equation>}
      <div className="fst-grid">
        <aside className="fst-given"><small>GIVEN</small><ul>{given.map((g, i) => <li key={i}><span>{g}</span></li>)}</ul></aside>
        <ol className="fst-steps">
          {steps.map((s, i) => <li key={i}><span className="fst-n">{i + 1}</span><span className="fst-math">{s.math}</span>{s.note && <span className="fst-note">{s.note}</span>}</li>)}
          <li className="fst-result"><span className="fst-n">=</span><span className="fst-math">{result}</span></li>
        </ol>
      </div>
    </div>
  );
}

/* ---------- full-canvas layouts ---------- */

export function Cover({ eyebrow, title, subtitle, art, meta }: { eyebrow: ReactNode; title: ReactNode; subtitle?: ReactNode; art?: ReactNode; meta?: ReactNode }) {
  return (
    <div className="cover">
      <div className="cover-copy">
        <p className="cover-eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        {subtitle && <p className="cover-sub">{subtitle}</p>}
        {meta && <div className="cover-meta">{meta}</div>}
      </div>
      {art && <div className="cover-art">{art}</div>}
    </div>
  );
}

export function Divider({ code, title, promise, items }: { code: ReactNode; title: ReactNode; promise?: ReactNode; items?: ReactNode[] }) {
  return (
    <div className="divider">
      <span className="divider-code">{code}</span>
      <div>
        <h1>{title}</h1>
        {promise && <p className="divider-promise">{promise}</p>}
        {items && <ol className="divider-items">{items.map((it, i) => <li key={i}><span>{String(i + 1).padStart(2, '0')}</span>{it}</li>)}</ol>}
      </div>
    </div>
  );
}

export function Bridge({ done, question, next }: { done: ReactNode; question: ReactNode; next: ReactNode }) {
  return (
    <div className="bridge">
      <p className="bridge-done">{done}</p>
      <h1>{question}</h1>
      <span className="bridge-next">NEXT · {next}</span>
    </div>
  );
}
