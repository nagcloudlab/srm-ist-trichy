const WIDTH = 1000;
const HEIGHT = 510;
const PLOT = { left: 72, right: 48, top: 28, bottom: 66 };
const xMin = .5;
const xMax = 4;
const yMax = 20;
const loss = (weight: number) => (14 / 3) * (weight - 2) ** 2;

const updates = [
  { rate: 'η = 0.01', weight: 1.0929, value: 3.8402, color: '#3157d5', className: 'rate-small' },
  { rate: 'η = 0.10', weight: 1.9287, value: .0237, color: '#277a59', className: 'rate-good' },
  { rate: 'η = 0.30', weight: 3.7860, value: 14.8857, color: '#eb5a46', className: 'rate-large' },
];

export function LearningRateCurve() {
  const plotWidth = WIDTH - PLOT.left - PLOT.right;
  const plotHeight = HEIGHT - PLOT.top - PLOT.bottom;
  const xAt = (value: number) => PLOT.left + ((value - xMin) / (xMax - xMin)) * plotWidth;
  const yAt = (value: number) => PLOT.top + plotHeight - (value / yMax) * plotHeight;
  const samples = Array.from({ length: 101 }, (_, index) => xMin + (index / 100) * (xMax - xMin));
  const curve = samples.map((weight, index) => `${index ? 'L' : 'M'} ${xAt(weight).toFixed(2)} ${yAt(loss(weight)).toFixed(2)}`).join(' ');
  const startX = xAt(1);
  const startY = yAt(loss(1));

  return <svg className="learning-rate-svg" viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label="Loss curve comparing small, useful, and overshooting learning-rate updates from weight one">
    <defs><clipPath id="learning-rate-plot"><rect x={PLOT.left} y={PLOT.top} width={plotWidth} height={plotHeight} /></clipPath>{updates.map((update) => <marker key={update.rate} id={`arrow-${update.className}`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" fill={update.color} /></marker>)}</defs>
    <g className="rate-grid" aria-hidden="true">
      {[0, 5, 10, 15, 20].map((value) => <g key={value}><line x1={PLOT.left} y1={yAt(value)} x2={PLOT.left + plotWidth} y2={yAt(value)} /><text x={PLOT.left - 13} y={yAt(value)} textAnchor="end" dominantBaseline="middle">{value}</text></g>)}
      {[1, 2, 3, 4].map((value) => <g key={value}><line x1={xAt(value)} y1={PLOT.top} x2={xAt(value)} y2={PLOT.top + plotHeight} /><text x={xAt(value)} y={PLOT.top + plotHeight + 27} textAnchor="middle">w = {value}</text></g>)}
      <text className="rate-axis-title" x={PLOT.left + plotWidth} y={HEIGHT - 10} textAnchor="end">WEIGHT</text><text className="rate-axis-title" x={18} y={PLOT.top + plotHeight / 2} textAnchor="middle" transform={`rotate(-90 18 ${PLOT.top + plotHeight / 2})`}>LOSS</text>
    </g>
    <path className="rate-loss-curve" d={curve} clipPath="url(#learning-rate-plot)" />
    <circle className="rate-start" cx={startX} cy={startY} r="11" /><text className="rate-start-label" x={startX - 18} y={startY - 22} textAnchor="end">start · w = 1</text>
    <g className="rate-updates">{updates.map((update, index) => {
      const endX = xAt(update.weight);
      const endY = yAt(update.value);
      const controlY = Math.min(startY, endY) - 36 - index * 18;
      return <g className={update.className} key={update.rate}>
        <path d={`M ${startX} ${startY} Q ${(startX + endX) / 2} ${controlY} ${endX} ${endY}`} stroke={update.color} markerEnd={`url(#arrow-${update.className})`} />
        <circle cx={endX} cy={endY} r="9" fill={update.color} />
        <text x={endX} y={Math.max(22, endY - 24)} textAnchor={index === 2 ? 'end' : 'middle'} fill={update.color}>{update.rate}</text>
      </g>;
    })}</g>
  </svg>;
}
