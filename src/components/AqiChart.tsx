import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { DailyAqiData } from '../types';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface AqiChartProps {
  data: DailyAqiData[];
  type?: 'line' | 'bar';
  height?: number;
  showLegend?: boolean;
  title?: string;
}

export const AqiChart: React.FC<AqiChartProps> = ({
  data,
  type = 'line',
  height = 300,
  showLegend = true,
  title
}) => {
  const labels = data.map((day) => {
    // Convert YYYY-MM-DD to short date format (e.g., "May 15")
    const date = new Date(day.date);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  });
  
  const getBackgroundColor = (aqi: number) => {
    if (aqi <= 50) return 'rgba(0, 228, 0, 0.6)';
    if (aqi <= 100) return 'rgba(255, 255, 0, 0.6)';
    if (aqi <= 150) return 'rgba(255, 126, 0, 0.6)';
    if (aqi <= 200) return 'rgba(255, 0, 0, 0.6)';
    if (aqi <= 300) return 'rgba(153, 0, 76, 0.6)';
    return 'rgba(126, 0, 35, 0.6)';
  };
  
  const getBorderColor = (aqi: number) => {
    if (aqi <= 50) return 'rgb(0, 228, 0)';
    if (aqi <= 100) return 'rgb(255, 255, 0)';
    if (aqi <= 150) return 'rgb(255, 126, 0)';
    if (aqi <= 200) return 'rgb(255, 0, 0)';
    if (aqi <= 300) return 'rgb(153, 0, 76)';
    return 'rgb(126, 0, 35)';
  };

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Average AQI',
        data: data.map((day) => day.averageAqi),
        backgroundColor: data.map((day) => getBackgroundColor(day.averageAqi)),
        borderColor: data.map((day) => getBorderColor(day.averageAqi)),
        borderWidth: 2,
        pointBackgroundColor: data.map((day) => getBorderColor(day.averageAqi)),
        pointBorderColor: '#fff',
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0.2,
        fill: type === 'line' ? 'origin' : undefined,
      },
      {
        label: 'Max AQI',
        data: data.map((day) => day.maxAqi),
        backgroundColor: 'rgba(0, 0, 0, 0)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderDash: [5, 5],
        borderWidth: 2,
        pointBackgroundColor: 'rgba(75, 192, 192, 1)',
        pointBorderColor: '#fff',
        pointRadius: 3,
        pointHoverRadius: 5,
        tension: 0.2,
        fill: false,
      },
    ],
  };
  
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: showLegend,
        position: 'top' as const,
      },
      title: {
        display: !!title,
        text: title,
        font: {
          size: 16,
        },
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const value = context.parsed.y;
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            label += value;
            return label;
          },
          afterLabel: function(context: any) {
            const value = context.parsed.y;
            let category = '';
            if (value <= 50) category = 'Good';
            else if (value <= 100) category = 'Moderate';
            else if (value <= 150) category = 'Unhealthy for Sensitive Groups';
            else if (value <= 200) category = 'Unhealthy';
            else if (value <= 300) category = 'Very Unhealthy';
            else category = 'Hazardous';
            return `Category: ${category}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          display: true,
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          callback: function(value: number) {
            return value;
          }
        }
      },
      x: {
        grid: {
          display: false,
        }
      }
    },
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
  };
  
  return (
    <div style={{ height: `${height}px` }}>
      {type === 'line' ? (
        <Line data={chartData} options={options} />
      ) : (
        <Bar data={chartData} options={options} />
      )}
    </div>
  );
};