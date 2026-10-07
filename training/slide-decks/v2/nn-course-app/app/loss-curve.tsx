type LossCurveProps = {
  showDirections?: boolean;
  showTangents?: boolean;
};

const WIDTH = 960;
const HEIGHT = 500;
const PLOT = { left: 78, right: 42, top: 28, bottom: 66 };
const xMin = .5;
const xMax = 3.5;
const yMax = 11;
const loss = (weight: number) => (14 / 3) * (weight - 2) ** 2;
const gradient = (weight: number) => (28 / 3) * (weight - 2);

export function LossCurve({ showDirections = true, showTangents = true }: LossCurveProps) {
  const plotWidth = WIDTH - PLOT.left - PLOT.right;
  const plotHeight = HEIGHT - PLOT.top - PLOT.bottom;
  const xAt = (value: number) => PLOT.left + ((value - xMin) / (xMax - xMin)) * plotWidth;
  const yAt = (value: number) => PLOT.top + plotHeight - (value / yMax) * plotHeight;
  const samples = Array.from({ length: 81 }, (_, index) => xMin + (index / 80) * (xMax - xMin));
  const curve = samples.map((weight, index) => `${index ? 'L' : 'M'} ${xAt(weight).toFixed(2)} ${yAt(loss(weight)).toFixed(2)}`).join(' ');
  const tangent = (weight: number, delta: number) => {
    const x1 = weight - delta;
    const x2 = weight + delta;
    const y1 = loss(weight) + gradient(weight) * (x1 - weight);
    const y2 = loss(weight) + gradient(weight) * (x2 - weight);
    return { x1: xAt(x1), y1: yAt(y1), x2: xAt(x2), y2: yAt(y2) };
  };

  return <svg className="loss-curve-svg" viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label="Loss curve with negative slope at weight one, minimum at weight two, and positive slope at weight three">
    <defs><marker id="curve-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" /></marker></defs>
    <g className="curve-grid" aria-hidden="true">
      {[0, 5, 10].map((value) => <g key={value}><line x1={PLOT.left} y1={yAt(value)} x2={PLOT.left + plotWidth} y2={yAt(value)} /><text x={PLOT.left - 15} y={yAt(value)} textAnchor="end" dominantBaseline="middle">{value}</text></g>)}
      {[1, 2, 3].map((value) => <g key={value}><line x1={xAt(value)} y1={PLOT.top} x2={xAt(value)} y2={PLOT.top + plotHeight} /><text x={xAt(value)} y={PLOT.top + plotHeight + 28} textAnchor="middle">w = {value}</text></g>)}
      <text className="curve-axis-title" x={PLOT.left + plotWidth} y={HEIGHT - 10} textAnchor="end">WEIGHT</text>
      <text className="curve-axis-title" x={19} y={PLOT.top + plotHeight / 2} textAnchor="middle" transform={`rotate(-90 19 ${PLOT.top + plotHeight / 2})`}>LOSS</text>
    </g>
    <path className="loss-curve-line" d={curve} />
    {showTangents && <g className="curve-tangents">
      <line {...tangent(1, .27)} className="negative-tangent" />
      <line {...tangent(3, .27)} className="positive-tangent" />
    </g>}
    <g className="curve-points">
      <circle cx={xAt(1)} cy={yAt(loss(1))} r="10" className="point-left" /><text x={xAt(1) - 18} y={yAt(loss(1)) - 24} textAnchor="end">gradient −9.3</text>
      <circle cx={xAt(2)} cy={yAt(0)} r="11" className="point-min" /><text x={xAt(2)} y={yAt(0) - 25} textAnchor="middle">minimum</text>
      <circle cx={xAt(3)} cy={yAt(loss(3))} r="10" className="point-right" /><text x={xAt(3) + 18} y={yAt(loss(3)) - 24}>gradient +9.3</text>
    </g>
    {showDirections && <g className="curve-directions">
      <line x1={xAt(1.12)} y1={yAt(1.15)} x2={xAt(1.78)} y2={yAt(.35)} markerEnd="url(#curve-arrow)" /><text x={xAt(1.38)} y={yAt(1.6)} textAnchor="middle">increase w</text>
      <line x1={xAt(2.88)} y1={yAt(1.15)} x2={xAt(2.22)} y2={yAt(.35)} markerEnd="url(#curve-arrow)" /><text x={xAt(2.62)} y={yAt(1.6)} textAnchor="middle">decrease w</text>
    </g>}
  </svg>;
}
