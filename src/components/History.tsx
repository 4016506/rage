import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getHistoricalRage, getRageStats } from '../services/rageService';
import type { User } from 'firebase/auth';
import type { RageRecord, RageStats } from '../services/rageService';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import './History.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface HistoryProps {
  user: User | null;
}

function History({ user: _user }: HistoryProps) {
  const [historicalData, setHistoricalData] = useState<RageRecord[]>([]);
  const [stats, setStats] = useState<RageStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<'all' | 'week' | 'month'>('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [history, currentStats] = await Promise.all([
        getHistoricalRage(),
        getRageStats()
      ]);
      setHistoricalData(history);
      setStats(currentStats);
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getFilteredData = () => {
    const now = new Date();
    if (timeframe === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return historicalData.filter(record => new Date(record.date) >= weekAgo);
    } else if (timeframe === 'month') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      return historicalData.filter(record => new Date(record.date) >= monthAgo);
    }
    return historicalData;
  };

  const getChartData = () => {
    const filtered = getFilteredData().slice().reverse();
    return {
      labels: filtered.map(r => {
        const date = new Date(r.date);
        return `${date.getMonth() + 1}/${date.getDate()}`;
      }),
      datasets: [
        {
          label: 'Daily Rage Score',
          data: filtered.map(r => r.score),
          borderColor: '#ff4500',
          backgroundColor: 'rgba(255, 69, 0, 0.1)',
          borderWidth: 3,
          pointRadius: 5,
          pointHoverRadius: 7,
          pointBackgroundColor: '#ff4500',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#ff4500',
          font: {
            size: 14,
            weight: 'bold' as const,
          },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        titleColor: '#ff4500',
        bodyColor: '#ff6600',
        borderColor: '#ff4500',
        borderWidth: 2,
      },
    },
    scales: {
      x: {
        ticks: {
          color: '#ff8800',
        },
        grid: {
          color: 'rgba(255, 69, 0, 0.1)',
        },
      },
      y: {
        ticks: {
          color: '#ff8800',
        },
        grid: {
          color: 'rgba(255, 69, 0, 0.1)',
        },
      },
    },
  };

  if (isLoading) {
    return (
      <div className="history-container">
        <div className="loading-text">LOADING HISTORY...</div>
      </div>
    );
  }

  const filteredData = getFilteredData();
  const chartData = getChartData();

  return (
    <div className="history-container">
      <nav className="history-nav">
        <Link to="/" className="nav-link">
          🔥 BACK TO RAGE METER
        </Link>
      </nav>

      <h1 className="history-title">RAGE HISTORY</h1>

      {stats && (
        <div className="summary-cards">
          <div className="summary-card">
            <div className="summary-label">ALL-TIME HIGH</div>
            <div className="summary-value red-glow">{stats.allTimeHigh.toLocaleString()}</div>
          </div>
          <div className="summary-card">
            <div className="summary-label">WEEKLY TOTAL</div>
            <div className="summary-value orange-glow">{stats.weeklyTotal.toLocaleString()}</div>
          </div>
          <div className="summary-card">
            <div className="summary-label">MONTHLY TOTAL</div>
            <div className="summary-value yellow-glow">{stats.monthlyTotal.toLocaleString()}</div>
          </div>
        </div>
      )}

      {/* Timeframe selector */}
      <div className="timeframe-selector">
        <button
          className={`timeframe-btn ${timeframe === 'all' ? 'active' : ''}`}
          onClick={() => setTimeframe('all')}
        >
          ALL TIME
        </button>
        <button
          className={`timeframe-btn ${timeframe === 'month' ? 'active' : ''}`}
          onClick={() => setTimeframe('month')}
        >
          LAST 30 DAYS
        </button>
        <button
          className={`timeframe-btn ${timeframe === 'week' ? 'active' : ''}`}
          onClick={() => setTimeframe('week')}
        >
          LAST 7 DAYS
        </button>
      </div>

      {/* Chart */}
      <div className="chart-container">
        <div className="chart-wrapper">
          <Line data={chartData} options={chartOptions} />
        </div>
      </div>

      {/* Data table */}
      <div className="data-table-container">
        <h2 className="table-title">DAILY RECORDS</h2>
        <div className="data-table">
          <div className="table-header">
            <div className="table-cell header-cell">DATE</div>
            <div className="table-cell header-cell">RAGE SCORE</div>
          </div>
          {filteredData.length === 0 ? (
            <div className="no-data">No rage data available for this period</div>
          ) : (
            filteredData.map((record, index) => (
              <div 
                key={record.date} 
                className="table-row"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="table-cell">{record.date}</div>
                <div className="table-cell rage-value">{record.score.toLocaleString()}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default History;

