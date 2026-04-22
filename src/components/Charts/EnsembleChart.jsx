import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, Title, Tooltip, Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function EnsembleChart({ labels, memberDatasets, meanDataset, variableLabel, unit = '°C', chartRef }) {
  const datasets = [
    ...memberDatasets.map((ds, i) => ({
      label: ds.label,
      data: ds.values,
      borderColor: '#93c5fd',
      backgroundColor: 'transparent',
      borderWidth: 0.8,
      pointRadius: 0,
      tension: 0.2,
    })),
    meanDataset && {
      label: 'Mean',
      data: meanDataset.values,
      borderColor: '#1d4ed8',
      backgroundColor: 'transparent',
      borderWidth: 2.5,
      pointRadius: 0,
      tension: 0.2,
    },
  ].filter(Boolean);

  const data = { labels, datasets };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        mode: 'index',
        intersect: false,
        filter: (item) => item.datasetIndex === datasets.length - 1,
      },
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
