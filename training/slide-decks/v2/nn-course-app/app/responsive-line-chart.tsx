'use client';

import { useId } from 'react';

export type ChartSeries = {
  color: string;
  intercept: number;
  label: string;
  slope: number;
};

type ResponsiveLineChartProps = {
  ariaLabel: string;
  lines: ChartSeries[];
  xLabel?: string;
  xMax?: number;
  yLabel?: string;
  yMax?: number;
};

const WIDTH = 1000;
const HEIGHT = 520;
const PLOT = { left: 82, right: 174, top: 34, bottom: 72 };

export function ResponsiveLineChart({ ariaLabel, lines, xLabel = 'DISTANCE', xMax = 5, yLabel = 'PREDICTION', yMax = 20 }: ResponsiveLineChartProps) {
  const clipId = `chart-clip-${useId().replaceAll(':', '')}`;
  const plotWidth = WIDTH - PLOT.left - PLOT.right;
  const plotHeight = HEIGHT - PLOT.top - PLOT.bottom;
  const xAt = (value: number) => PLOT.left + (value / xMax) * plotWidth;
  const yAt = (value: number) => PLOT.top + plotHeight - (value / yMax) * plotHeight;
  const xTicks = Array.from({ length: xMax + 1 }, (_, value) => value);
  const yTicks = Array.from({ length: Math.floor(yMax / 5) + 1 }, (_, index) => index * 5);
  const labelX = PLOT.left + plotWidth + 22;

  return <svg className="responsive-chart" viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={ariaLabel} preserveAspectRatio="xMidYMid meet">
    <defs>
      <clipPath id={clipId}><rect x={PLOT.left} y={PLOT.top} width={plotWidth} height={plotHeight} /></clipPath>
    </defs>

    <g className="chart-grid" aria-hidden="true">
      {xTicks.map((value) => <g key={`x-${value}`}>
        <line x1={xAt(value)} y1={PLOT.top} x2={xAt(value)} y2={PLOT.top + plotHeight} />
        <text x={xAt(value)} y={PLOT.top + plotHeight + 30} textAnchor="middle">{value}</text>
      </g>)}
      {yTicks.map((value) => <g key={`y-${value}`}>
        <line x1={PLOT.left} y1={yAt(value)} x2={PLOT.left + plotWidth} y2={yAt(value)} />
        <text x={PLOT.left - 17} y={yAt(value)} textAnchor="end" dominantBaseline="middle">{value}</text>
      </g>)}
      <text className="chart-axis-title" x={PLOT.left + plotWidth} y={HEIGHT - 13} textAnchor="end">{xLabel}</text>
      <text className="chart-axis-title" x={20} y={PLOT.top + plotHeight / 2} textAnchor="middle" transform={`rotate(-90 20 ${PLOT.top + plotHeight / 2})`}>{yLabel}</text>
    </g>

    <g className="chart-series" clipPath={`url(#${clipId})`}>
      {lines.map((line) => <line
        className="chart-series-line"
        data-series={line.label}
        key={line.label}
        x1={xAt(0)}
        y1={yAt(line.intercept)}
        x2={xAt(xMax)}
        y2={yAt(line.slope * xMax + line.intercept)}
        stroke={line.color}
      />)}
    </g>

    <g className="chart-series-labels">
      {lines.map((line) => {
        const rawY = yAt(line.slope * xMax + line.intercept);
        const labelY = Math.max(PLOT.top + 18, Math.min(PLOT.top + plotHeight - 18, rawY));
        const labelWidth = line.label.length > 5 ? 112 : 98;
        return <g className="chart-series-label" data-series={line.label} key={line.label} transform={`translate(${labelX} ${labelY})`}>
          <rect x={-8} y={-19} width={labelWidth} height={38} rx={8} />
          <text x={4} y={1} dominantBaseline="middle" fill={line.color}>{line.label}</text>
        </g>;
      })}
    </g>
  </svg>;
}
