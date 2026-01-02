import { useEffect, useState } from 'react';
import { SystemHealth } from '../types';
import { healthService } from '../services/api';
import { Activity, TrendingUp, AlertCircle, Clock } from 'lucide-react';
import './Dashboard.css';

export default function Dashboard() {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const healthData = await healthService.getSystemHealth();
        setHealth(healthData);
      } catch (error) {
        console.error('Failed to fetch health data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="dashboard-loading">
        <Activity className="spinner" size={48} />
        <p>Loading system status...</p>
      </div>
    );
  }

  if (!health) {
    return (
      <div className="dashboard-error">
        <AlertCircle size={48} />
        <p>Failed to load system health</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>System Dashboard</h2>
        <p className="dashboard-subtitle">Real-time monitoring of HVR 6.0 replication system</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon agents">
            <Activity size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Total Agents</span>
            <span className="stat-value">{health.agents.total}</span>
            <div className="stat-breakdown">
              <span className="stat-detail success">{health.agents.active} Active</span>
              <span className="stat-detail idle">{health.agents.idle} Idle</span>
              {health.agents.error > 0 && (
                <span className="stat-detail error">{health.agents.error} Error</span>
              )}
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon jobs">
            <Clock size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Active Jobs</span>
            <span className="stat-value">{health.jobs.running}</span>
            <div className="stat-breakdown">
              <span className="stat-detail success">{health.jobs.completed} Completed</span>
              {health.jobs.failed > 0 && (
                <span className="stat-detail error">{health.jobs.failed} Failed</span>
              )}
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon performance">
            <TrendingUp size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-label">CPU Usage</span>
            <span className="stat-value">{health.performance.cpuUsage.toFixed(2)}%</span>
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ width: `${Math.min(health.performance.cpuUsage, 100)}%` }}
              />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon memory">
            <TrendingUp size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Memory Usage</span>
            <span className="stat-value">{health.performance.memoryUsage.toFixed(2)}%</span>
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ width: `${Math.min(health.performance.memoryUsage, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-sections">
        <div className="card">
          <h3>Agent Status Overview</h3>
          <div className="agent-status-grid">
            <div className="status-item">
              <span className="status-label">Refresh Agents</span>
              <div className="status-indicators">
                <span className="status-badge status-idle">1 Idle</span>
              </div>
            </div>
            <div className="status-item">
              <span className="status-label">CDC Agents</span>
              <div className="status-indicators">
                <span className="status-badge status-idle">1 Idle</span>
              </div>
            </div>
            <div className="status-item">
              <span className="status-label">Integration Agents</span>
              <div className="status-indicators">
                <span className="status-badge status-idle">1 Idle</span>
              </div>
            </div>
            <div className="status-item">
              <span className="status-label">Compare Agents</span>
              <div className="status-indicators">
                <span className="status-badge status-idle">1 Idle</span>
              </div>
            </div>
            <div className="status-item">
              <span className="status-label">Monitor Agents</span>
              <div className="status-indicators">
                <span className="status-badge status-idle">1 Idle</span>
              </div>
            </div>
            <div className="status-item">
              <span className="status-label">Schedule Agents</span>
              <div className="status-indicators">
                <span className="status-badge status-idle">1 Idle</span>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <h3>Quick Actions</h3>
          <div className="quick-actions">
            <button className="btn btn-primary">Create New Channel</button>
            <button className="btn btn-primary">Start Refresh Job</button>
            <button className="btn btn-primary">Monitor CDC Stream</button>
            <button className="btn btn-secondary">Run Comparison</button>
          </div>
        </div>
      </div>
    </div>
  );
}
