const WIDTH = 1000;
const HEIGHT = 500;
const PLOT = { left: 92, right: 190, top: 28, bottom: 68 };
const loss = (weight: number) => (14 / 3) * (weight - 2) ** 2;
const gradient = (weight: number) => (28 / 3) * (weight - 2) + (14 / 3) * .001;

const series = [
  { rate: .01, label: 'η = 0.01 · slow', color: '#738bd8' },
  { rate: .10, label: 'η = 0.10 · stable', color: '#277a59' },
  { rate: .30, label: 'η = 0.30 · diverges', color: '#eb5a46' },
].map((item) => {
  let weight = 1;
  const values = [{ step: 0, loss: loss(weight) }];
  for (let step = 1; step <= 10; step += 1) {
    weight -= item.rate * gradient(weight);
    values.push({ step, loss: loss(weight) });
  }
  return { ...item, values };
});

export function TrainingConvergenceChart() {
  const plotWidth = WIDTH - PLOT.left - PLOT.right;
  const plotHeight = HEIGHT - PLOT.top - PLOT.bottom;
  const xAt = (step: number) => PLOT.left + (step / 10) * plotWidth;
  const yAt = (value: number) => {
    const exponent = Math.max(-6, Math.min(6, Math.log10(Math.max(value, 1e-6))));
    return PLOT.top + ((6 - exponent) / 12) * plotHeight;
  };

  return <svg className="training-convergence-svg" viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label="Loss over ten training steps for learning rates 0.01, 0.10, and 0.30 on a logarithmic scale">
    <defs><clipPath id="training-plot"><rect x={PLOT.left} y={PLOT.top} width={plotWidth} height={plotHeight} /></clipPath></defs>
    <g className="training-grid" aria-hidden="true">
      {[-6, -3, 0, 3, 6].map((power) => <g key={power}><line x1={PLOT.left} y1={yAt(10 ** power)} x2={PLOT.left + plotWidth} y2={yAt(10 ** power)} /><text x={PLOT.left - 15} y={yAt(10 ** power)} textAnchor="end" dominantBaseline="middle">10^{power}</text></g>)}
      {[0, 2, 4, 6, 8, 10].map((step) => <g key={step}><line x1={xAt(step)} y1={PLOT.top} x2={xAt(step)} y2={PLOT.top + plotHeight} /><text x={xAt(step)} y={PLOT.top + plotHeight + 28} textAnchor="middle">{step}</text></g>)}
      <text className="training-axis-title" x={PLOT.left + plotWidth} y={HEIGHT - 12} textAnchor="end">TRAINING STEP</text>
      <text className="training-axis-title" x="20" y={PLOT.top + plotHeight / 2} textAnchor="middle" transform={`rotate(-90 20 ${PLOT.top + plotHeight / 2})`}>LOSS · LOG SCALE</text>
    </g>
    <g clipPath="url(#training-plot)">{series.map((item) => <path key={item.rate} className="training-series" stroke={item.color} d={item.values.map((point, index) => `${index ? 'L' : 'M'} ${xAt(point.step).toFixed(1)} ${yAt(point.loss).toFixed(1)}`).join(' ')} />)}</g>
    {series.map((item) => {
      const end = item.values.at(-1)!;
      return <g key={item.label} className="training-end"><circle cx={xAt(10)} cy={yAt(end.loss)} r="8" fill={item.color} /><text x={xAt(10) + 18} y={yAt(end.loss)} dominantBaseline="middle" fill={item.color}>{item.label}</text></g>;
    })}
  </svg>;
}
