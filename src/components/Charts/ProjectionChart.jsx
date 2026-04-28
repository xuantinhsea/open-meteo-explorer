import {
  Chart as ChartJS,
  LineElement, PointElement, LinearScale, CategoryScale,
  Tooltip, Legend, Filler,
} from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';
import { Line } from 'react-chartjs-2';

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend, Filler, annotationPlugin);

// Build combined x-axis (1950–2100) and pad historical/scenario arrays with nulls
function buildDatasets(historical, scenarioDatasets) {
  const histYears = historical?.years ?? [];
  const futYears = scenarioDatasets[0]?.years ?? [];
  const allYears = [...new Set([...histYears, ...futYears])].sort((a, b) => a - b);
  const yearIdx = Object.fromEntries(allYears.map((y, i) => [y, i]));
  const len = allYears.length;

  function pad(years, values) {
    const out = Array(len).fill(null);
    years.forEach((y, i) => { if (yearIdx[y] !== undefined) out[yearIdx[y]] = values[i]; });
    return out;
  }

  const datasets = [];

  // ── Historical (black/dark) ──
  if (historical) {
    const hMed = pad(histYears, historical.median);
    const hP10 = pad(histYears, historical.p10);
    const hP90 = pad(histYears, historical.p90);

    datasets.push(
      { label: '', data: hP10, borderColor: 'transparent', backgroundColor: 'transparent', pointRadius: 0, fill: '+1', spanGaps: false, order: 30 },
      { label: '', data: hP90, borderColor: 'transparent', backgroundColor: 'rgba(100,100,100,0.18)', pointRadius: 0, fill: '-1', spanGaps: false, order: 31 },
      { label: 'Historical', data: hMed, borderColor: '#1e293b', backgroundColor: '#1e293b', borderWidth: 2.5, pointRadius: 0, fill: false, spanGaps: false, order: 10 },
    );
  }

  // ── Future scenarios ──
  scenarioDatasets.forEach(({ label, color, years, median, p10, p90 }, idx) => {
    const fMed = pad(years, median);
    const fP10 = pad(years, p10);
    const fP90 = pad(years, p90);
    const base = 40 + idx * 10;

    datasets.push(
      { label: '', data: fP10, borderColor: 'transparent', backgroundColor: 'transparent', pointRadius: 0, fill: '+1', spanGaps: false, order: base },
      { label: '', data: fP90, borderColor: 'transparent', backgroundColor: color + '28', pointRadius: 0, fill: '-1', spanGaps: false, order: base + 1 },
      { label, data: fMed, borderColor: color, backgroundColor: color, borderWidth: 2, pointRadius: 0, fill: false, spanGaps: false, order: 20 + idx },
    );
  });

  return { allYears, datasets };
}

export default function ProjectionChart({ chartRef, historical, scenarioDatasets, unit }) {
  if (!scenarioDatasets?.length) return null;

  const { allYears, datasets } = buildDatasets(historical, scenarioDatasets, unit);
  const labels = allYears.map(String);

  const separatorYear = '2014';

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          font: { size: 11 },
          boxWidth: 20,
          padding: 10,
          // Only show datasets with a non-empty label
          filter: (item) => item.text !== '',
        },
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        filter: (item) => item.dataset.label !== '',
        callbacks: {
          label: (ctx) => {
            if (!ctx.dataset.label) return null;
            const v = ctx.parsed.y;
            return v !== null ? `${ctx.dataset.label}: ${v.toFixed(2)} ${unit}` : null;
          },
        },
      },
      annotation: {
        annotations: {
          histSep: {
            type: 'line',
            xMin: separatorYear,
            xMax: separatorYear,
            borderColor: '#94a3b8',
            borderWidth: 1.5,
            borderDash: [5, 4],
            label: {
              display: true,
              content: '2014',
              position: 'start',
              font: { size: 10 },
              color: '#94a3b8',
              backgroundColor: 'transparent',
              yAdjust: -6,
            },
          },
        },
      },
    },
    scales: {
      x: {
        ticks: {
          font: { size: 10 },
          maxTicksLimit: 16,
          callback: (_, i) => (allYears[i] % 25 === 0 ? allYears[i] : ''),
        },
        grid: { display: false },
      },
      y: {
        ticks: { font: { size: 10 } },
        title: { display: !!unit, text: unit, font: { size: 10 } },
      },
    },
    interaction: { mode: 'nearest', axis: 'x', intersect: false },
  };

  return (
    <Line
      ref={chartRef}
      data={{ labels, datasets }}
      options={options}
    />
  );
}
