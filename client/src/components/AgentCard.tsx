import { Agent, AgentStatus } from '../types';
import { Clock, Zap, CheckCircle, XCircle } from 'lucide-react';
import './AgentCard.css';

interface AgentCardProps {
  agent: Agent;
}

export default function AgentCard({ agent }: AgentCardProps) {
  const getStatusColor = (status: AgentStatus) => {
    switch (status) {
      case AgentStatus.RUNNING:
        return 'status-running';
      case AgentStatus.IDLE:
        return 'status-idle';
      case AgentStatus.ERROR:
        return 'status-error';
      case AgentStatus.COMPLETED:
        return 'status-completed';
      case AgentStatus.PAUSED:
        return 'status-paused';
      default:
        return 'status-idle';
    }
  };

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  return (
    <div className="agent-card card">
      <div className="agent-header">
        <div className="agent-info">
          <h3>{agent.name}</h3>
          <span className="agent-type">{agent.type}</span>
        </div>
        <span className={`status-badge ${getStatusColor(agent.status)}`}>
          {agent.status}
        </span>
      </div>

      {agent.metrics && (
        <div className="agent-metrics">
          <div className="metric">
            <CheckCircle size={16} className="metric-icon success" />
            <div className="metric-content">
              <span className="metric-label">Completed</span>
              <span className="metric-value">{agent.metrics.tasksCompleted}</span>
            </div>
          </div>
          
          <div className="metric">
            <XCircle size={16} className="metric-icon error" />
            <div className="metric-content">
              <span className="metric-label">Failed</span>
              <span className="metric-value">{agent.metrics.tasksFailed}</span>
            </div>
          </div>
          
          <div className="metric">
            <Clock size={16} className="metric-icon" />
            <div className="metric-content">
              <span className="metric-label">Avg Time</span>
              <span className="metric-value">
                {formatTime(agent.metrics.averageExecutionTime)}
              </span>
            </div>
          </div>

          {agent.metrics.throughput !== undefined && (
            <div className="metric">
              <Zap size={16} className="metric-icon" />
              <div className="metric-content">
                <span className="metric-label">Throughput</span>
                <span className="metric-value">{agent.metrics.throughput}/s</span>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="agent-capabilities">
        <span className="capabilities-label">Capabilities:</span>
        <div className="capabilities-list">
          {agent.capabilities.map((cap, index) => (
            <span key={index} className="capability-tag">{cap}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
