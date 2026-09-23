import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { TrendingUp } from 'lucide-react';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export function TrustTrendChart({ trendData, period, onPeriodChange, isLoading }) {
  const labels = trendData?.labels || [];
  const scores = trendData?.scores || [];
  const isEmpty = trendData?.is_empty || labels.length === 0;

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Continuous Trust Score',
        data: scores,
        borderColor: '#3ec9ff',
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 200);
          gradient.addColorStop(0, 'rgba(62, 201, 255, 0.28)');
          gradient.addColorStop(1, 'rgba(62, 201, 255, 0.0)');
          return gradient;
        },
        fill: true,
        tension: 0.35,
        borderWidth: 2.2,
        pointBackgroundColor: '#3ec9ff',
        pointBorderColor: '#070d18',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#0d1726',
        titleColor: '#e2e8f0',
        bodyColor: '#3ec9ff',
        borderColor: '#16243a',
        borderWidth: 1,
        padding: 10,
        displayColors: false,
        callbacks: {
          label: (context) => `Trust Score: ${context.parsed.y}%`,
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.04)',
          drawBorder: false,
        },
        ticks: {
          color: '#64748b',
          font: {
            family: "'JetBrains Mono', monospace",
            size: 11,
          },
        },
      },
      y: {
        min: 0,
        max: 100,
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
          drawBorder: false,
        },
        ticks: {
          color: '#64748b',
          stepSize: 20,
          font: {
            family: "'JetBrains Mono', monospace",
            size: 11,
          },
          callback: (value) => `${value}%`,
        },
      },
    },
  };

  return (
    <div
      style={{
        background: 'var(--panel)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        padding: '22px',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '15px', fontWeight: '700', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={16} color="var(--accent)" />
            Continuous Trust Score Trend
          </h3>
          <p style={{ fontSize: '11.5px', color: 'var(--muted)', marginTop: '2px' }}>
            Dual-model continuous trust trajectory over time
          </p>
        </div>

        <select
          value={period}
          onChange={(e) => onPeriodChange(e.target.value)}
          style={{
            background: 'var(--panel-2)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            color: 'var(--text)',
            padding: '5px 10px',
            fontSize: '12px',
            fontFamily: 'var(--font-mono)',
            outline: 'none',
            cursor: 'pointer',
          }}
        >
          <option value="7d">Last 7 Days</option>
          <option value="14d">Last 14 Days</option>
          <option value="30d">Last 30 Days</option>
          <option value="all">All Time</option>
        </select>
      </div>

      {/* Chart Canvas Area */}
      <div style={{ position: 'relative', flex: 1, minHeight: '180px' }}>
        {isLoading && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(13, 23, 38, 0.7)', zIndex: 10, borderRadius: '8px' }}>
            <span style={{ fontSize: '12px', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>Loading trend records...</span>
          </div>
        )}

        {isEmpty && !isLoading ? (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', fontSize: '12.5px' }}>
            No trust evaluation records found for this period.
          </div>
        ) : (
          <Line data={chartData} options={chartOptions} />
        )}
      </div>
    </div>
  );
}

export default TrustTrendChart;
