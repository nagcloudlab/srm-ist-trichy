import type { ReactNode } from 'react';
import type { Tone } from '../components/kit';

/** Live labs: one dominant visual, only the controls the concept needs. */
export function Lab({ controls, metrics, children, foot }: { controls?: ReactNode; metrics?: ReactNode; children: ReactNode; foot?: ReactNode }) {
  return (
    <div className="lab">
      <div className="lab-visual">{children}</div>
      <aside className="lab-side">
        {controls && <div className="lab-controls">{controls}</div>}
        {metrics && <div className="lab-metrics">{metrics}</div>}
        {foot && <div className="lab-foot">{foot}</div>}
      </aside>
    </div>
  );
}

export function Slider({ label, value, min, max, step, onChange, format, tone = 'blue' }: {
  label: ReactNode; value: number; min: number; max: number; step: number; onChange: (v: number) => void; format?: (v: number) => string; tone?: Tone;
}) {
  return (
    <label className={`lab-slider tone-${tone}`}>
      <span>{label}<b>{format ? format(value) : String(Number(value.toFixed(3)))}</b></span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} />
    </label>
  );
}

export function Metric({ label, value, tone = 'plain' }: { label: ReactNode; value: ReactNode; tone?: Tone }) {
  return <div className={`lab-metric tone-${tone}`}><small>{label}</small><strong>{value}</strong></div>;
}

export function Segmented<T extends string>({ options, value, onChange, label }: { options: { value: T; label: ReactNode }[]; value: T; onChange: (v: T) => void; label?: ReactNode }) {
  return (
    <div className="segmented" role="group" aria-label={typeof label === 'string' ? label : undefined}>
      {label && <small>{label}</small>}
      <div>{options.map((o) => <button key={o.value} className={o.value === value ? 'on' : ''} aria-pressed={o.value === value} onClick={() => onChange(o.value)}>{o.label}</button>)}</div>
    </div>
  );
}

export function LabButton({ children, onClick, primary, disabled }: { children: ReactNode; onClick: () => void; primary?: boolean; disabled?: boolean }) {
  return <button className={`lab-btn ${primary ? 'primary' : ''}`} onClick={onClick} disabled={disabled}>{children}</button>;
}
