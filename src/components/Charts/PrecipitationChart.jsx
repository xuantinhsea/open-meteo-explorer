import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  Title, Tooltip, Legend,
} from 'chart.js';
import Annotation from 'chartjs-plugin-annotation';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, Annotation);

const COLORS = {
  precipitation: '#60a5fa',
  rain: '#34d399',
  snowfall: '#a78bfa',
  precipitation_sum: '#60a5fa',
  rain_sum: '#34d399',
  snowfall_sum: '#a78bfa',
};

export default function PrecipitationChart({ labels, datasets, chartRef, nowLabel }) {
  const data = {
    labels,
    datasets: datasets.map((ds) => ({
      label: ds.label,
      data: ds.values,
      backgroundColor: COLORS[ds.id] || '#93c5fd',
      borderColor: COLORS[ds.id] || '#3b82f6',
      borderWidth: 1,
    })),
  };

  const nowAnnotation = nowLabel ? {
    nowLine: {
      type: 'line',
      scaleID: 'x',
      value: nowLabel,
      borderColor: '#ef4444',
      borderWidth: 1.5,
      borderDash: [5, 4],
      label: {
        display: true,
        content: 'Now',
        position: 'start',
        backgroundColor: '#ef4444',
        color: '#fff',
        font: { size: 10, weight: 'bold' },
        padding: { x: 5, y: 2 },
        yAdjust: -2,
      },
    },
  } : {};

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', labels: { boxWidth: 12, font: { size: 11 } } },
      tooltip: { mode: 'index', intersect: false },
      annotation: { annotations: nowAnnotation },
    },
    scales: {
      x: {
        stacked: true,
        ticks: { maxTicksLimit: 12, font: { size: 10 }, maxRotation: 0 },
        grid: { color: '#f1f5f9' },
      },
      y: {
        stacked: true,
        title: { display: true, text: 'mm', font: { size: 10 } },
        grid: { color: '#f1f5f9' },
        ticks: { font: { size: 10 } },
      },
    },
  };

  return <Bar ref={chartRef} data={data} options={options} />;
}
