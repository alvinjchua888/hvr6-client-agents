import { useEffect, useState } from 'react';
import { Agent, AgentType } from '../types';
import { agentService } from '../services/api';
import AgentCard from '../components/AgentCard';
import { Activity, AlertCircle } from 'lucide-react';
import './Agents.css';

export default function Agents() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<AgentType | 'ALL'>('ALL');

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const data = await agentService.getAllAgents();
        setAgents(data);
      } catch (error) {
        console.error('Failed to fetch agents:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAgents();
    const interval = setInterval(fetchAgents, 3000);
    return () => clearInterval(interval);
  }, []);

  const filteredAgents = filter === 'ALL' 
    ? agents 
    : agents.filter(agent => agent.type === filter);

  if (loading) {
    return (
      <div className="agents-loading">
        <Activity className="spinner" size={48} />
        <p>Loading agents...</p>
      </div>
    );
  }

  return (
    <div className="agents-page">
      <div className="agents-header">
        <div>
          <h2>Agent Management</h2>
          <p className="agents-subtitle">
            Monitor and manage all replication agents
          </p>
        </div>
      </div>

      <div className="agents-filters">
        <button 
          className={`filter-btn ${filter === 'ALL' ? 'active' : ''}`}
          onClick={() => setFilter('ALL')}
        >
          All Agents ({agents.length})
        </button>
        {Object.values(AgentType).map(type => (
          <button
            key={type}
            className={`filter-btn ${filter === type ? 'active' : ''}`}
            onClick={() => setFilter(type)}
          >
            {type} ({agents.filter(a => a.type === type).length})
          </button>
        ))}
      </div>

      {filteredAgents.length === 0 ? (
        <div className="agents-empty">
          <AlertCircle size={48} />
          <p>No agents found</p>
        </div>
      ) : (
        <div className="agents-grid">
          {filteredAgents.map(agent => (
            <AgentCard key={agent.id} agent={agent} />
          ))}
        </div>
      )}
    </div>
  );
}
