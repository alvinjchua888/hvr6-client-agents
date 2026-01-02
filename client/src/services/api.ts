import axios from 'axios';
import { Agent, Job, SystemHealth, AgentTask, AgentType } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const agentService = {
  getAllAgents: async (): Promise<Agent[]> => {
    const response = await api.get('/agents');
    return response.data.data;
  },

  getAgentById: async (id: string): Promise<Agent> => {
    const response = await api.get(`/agents/${id}`);
    return response.data.data;
  },

  getAgentsByType: async (type: AgentType): Promise<Agent[]> => {
    const response = await api.get(`/agents/type/${type}`);
    return response.data.data;
  },
};

export const jobService = {
  getAllJobs: async (): Promise<Job[]> => {
    const response = await api.get('/jobs');
    return response.data.data;
  },

  getJobById: async (id: string): Promise<Job> => {
    const response = await api.get(`/jobs/${id}`);
    return response.data.data;
  },
};

export const taskService = {
  submitTask: async (task: AgentTask): Promise<AgentTask> => {
    const response = await api.post('/tasks', task);
    return response.data.data;
  },

  getQueueStatus: async (): Promise<{ pending: number; tasks: AgentTask[] }> => {
    const response = await api.get('/tasks/queue');
    return response.data.data;
  },
};

export const healthService = {
  getSystemHealth: async (): Promise<SystemHealth> => {
    const response = await api.get('/health');
    return response.data.data;
  },
};
