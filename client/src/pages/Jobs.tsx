import { useEffect, useState } from 'react';
import { Job, JobStatus, AgentType } from '../types';
import { jobService, taskService } from '../services/api';
import { Activity, AlertCircle, PlayCircle, CheckCircle, XCircle } from 'lucide-react';
import './Jobs.css';

export default function Jobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [taskForm, setTaskForm] = useState({
    agentType: AgentType.REFRESH,
    action: 'refresh',
    channelId: 'channel-1',
    tables: '[]'
  });

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const data = await jobService.getAllJobs();
        setJobs(data.sort((a, b) => {
          const timeA = new Date(a.startTime || 0).getTime();
          const timeB = new Date(b.startTime || 0).getTime();
          return timeB - timeA;
        }));
      } catch (error) {
        console.error('Failed to fetch jobs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
    const interval = setInterval(fetchJobs, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmitTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let tables = [];
      try {
        tables = JSON.parse(taskForm.tables);
      } catch {
        tables = [{
          sourceSchema: 'SAP',
          sourceTable: 'SAMPLE_TABLE',
          targetSchema: 'TARGET',
          targetTable: 'SAMPLE_TABLE'
        }];
      }

      await taskService.submitTask({
        agentType: taskForm.agentType,
        action: taskForm.action,
        parameters: {
          channelId: taskForm.channelId,
          tables,
          estimatedRows: 10000
        },
        priority: 5
      });
      
      setShowTaskForm(false);
      alert('Task submitted successfully!');
    } catch (error) {
      console.error('Failed to submit task:', error);
      alert('Failed to submit task');
    }
  };

  const getStatusIcon = (status: JobStatus) => {
    switch (status) {
      case JobStatus.RUNNING:
        return <Activity className="status-icon running spinner" size={20} />;
      case JobStatus.COMPLETED:
        return <CheckCircle className="status-icon completed" size={20} />;
      case JobStatus.FAILED:
        return <XCircle className="status-icon failed" size={20} />;
      default:
        return <PlayCircle className="status-icon" size={20} />;
    }
  };

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString();
  };

  if (loading) {
    return (
      <div className="jobs-loading">
        <Activity className="spinner" size={48} />
        <p>Loading jobs...</p>
      </div>
    );
  }

  return (
    <div className="jobs-page">
      <div className="jobs-header">
        <div>
          <h2>Job Management</h2>
          <p className="jobs-subtitle">Monitor active and historical replication jobs</p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => setShowTaskForm(!showTaskForm)}
        >
          {showTaskForm ? 'Cancel' : 'Submit New Task'}
        </button>
      </div>

      {showTaskForm && (
        <div className="card task-form">
          <h3>Submit New Task</h3>
          <form onSubmit={handleSubmitTask}>
            <div className="form-group">
              <label>Agent Type</label>
              <select 
                value={taskForm.agentType}
                onChange={e => setTaskForm({...taskForm, agentType: e.target.value as AgentType})}
              >
                {Object.values(AgentType).map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Action</label>
              <input 
                type="text"
                value={taskForm.action}
                onChange={e => setTaskForm({...taskForm, action: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label>Channel ID</label>
              <input 
                type="text"
                value={taskForm.channelId}
                onChange={e => setTaskForm({...taskForm, channelId: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label>Tables (JSON Array)</label>
              <textarea 
                value={taskForm.tables}
                onChange={e => setTaskForm({...taskForm, tables: e.target.value})}
                rows={4}
                placeholder='[{"sourceSchema":"SAP","sourceTable":"TABLE1","targetSchema":"TARGET","targetTable":"TABLE1"}]'
              />
            </div>

            <button type="submit" className="btn btn-primary">Submit Task</button>
          </form>
        </div>
      )}

      {jobs.length === 0 ? (
        <div className="jobs-empty">
          <AlertCircle size={48} />
          <p>No jobs found</p>
        </div>
      ) : (
        <div className="jobs-list">
          {jobs.map(job => (
            <div key={job.id} className="job-card card">
              <div className="job-header">
                <div className="job-info">
                  {getStatusIcon(job.status)}
                  <div>
                    <h3>{job.agentType} Job</h3>
                    <span className="job-id">ID: {job.id.substring(0, 8)}</span>
                  </div>
                </div>
                <span className={`status-badge status-${job.status.toLowerCase()}`}>
                  {job.status}
                </span>
              </div>

              <div className="job-details">
                <div className="detail-item">
                  <span className="detail-label">Channel:</span>
                  <span className="detail-value">{job.channelId}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Started:</span>
                  <span className="detail-value">{formatDate(job.startTime)}</span>
                </div>
                {job.endTime && (
                  <div className="detail-item">
                    <span className="detail-label">Ended:</span>
                    <span className="detail-value">{formatDate(job.endTime)}</span>
                  </div>
                )}
              </div>

              <div className="job-progress">
                <div className="progress-header">
                  <span>Progress</span>
                  <span>{job.progress}%</span>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ width: `${job.progress}%` }}
                  />
                </div>
              </div>

              {(job.recordsProcessed !== undefined || job.recordsFailed !== undefined) && (
                <div className="job-stats">
                  {job.recordsProcessed !== undefined && (
                    <div className="stat">
                      <span className="stat-label">Records Processed:</span>
                      <span className="stat-value">{job.recordsProcessed.toLocaleString()}</span>
                    </div>
                  )}
                  {job.recordsFailed !== undefined && job.recordsFailed > 0 && (
                    <div className="stat">
                      <span className="stat-label error">Records Failed:</span>
                      <span className="stat-value error">{job.recordsFailed.toLocaleString()}</span>
                    </div>
                  )}
                </div>
              )}

              {job.errorMessage && (
                <div className="job-error">
                  <XCircle size={16} />
                  <span>{job.errorMessage}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
