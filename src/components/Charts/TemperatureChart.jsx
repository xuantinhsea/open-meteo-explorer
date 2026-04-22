import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, Title, Tooltip, Legend, Filler,
} from 'chart.js';
import Annotation from 'chartjs-plugin-annotation';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler, Annotation);

const COLORS = ['#3b82f6', '#f97316', '#10b981', '#8b5cf6', '#ec4899', '#14b8a6'];

export default function TemperatureChart({ labels, datasets, unit = '°C', chartRef, nowLabel }) {
  const data = {
    labels,
    datasets: datasets.map((ds, i) => ({
      label: ds.label,
      data: ds.values,
      borderColor: COLORS[i % COLORS.length],
      backgroundColor: COLORS[i % COLORS.length] + '20',
      borderWidth: 1.5,
      pointRadius: labels.length > 200 ? 0 : 2,
      tension: 0.3,
      fill: false,
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
      title: { display: false },
      tooltip: { mode: 'index', intersect: false },
      annotation: { annotations: nowAnnotation },
    },
    scales: {
      x: {
        ticks: { maxTicksLimit: 12, font: { size: 10 }, maxRotation: 0 },
        grid: { color: '#f1f5f9' },
      },
      y: {
        title: { display: true, text: unit, font: { size: 10 } },
        grid: { color: '#f1f5f9' },
        ticks: { font: { size: 10 } },
      },
    },
  };

  return <Line ref={chartRef} data={data} options={options} />;
}
