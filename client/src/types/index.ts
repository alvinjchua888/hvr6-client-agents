/**
 * Shared types for the client application
 */

export enum AgentType {
  REFRESH = 'REFRESH',
  CDC = 'CDC',
  INTEGRATE = 'INTEGRATE',
  COMPARE = 'COMPARE',
  MONITOR = 'MONITOR',
  SCHEDULE = 'SCHEDULE'
}

export enum AgentStatus {
  IDLE = 'IDLE',
  RUNNING = 'RUNNING',
  PAUSED = 'PAUSED',
  ERROR = 'ERROR',
  COMPLETED = 'COMPLETED'
}

export enum JobStatus {
  PENDING = 'PENDING',
  RUNNING = 'RUNNING',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED'
}

export interface Agent {
  id: string;
  type: AgentType;
  name: string;
  status: AgentStatus;
  currentJob?: string;
  capabilities: string[];
  lastHeartbeat: Date | string;
  metrics?: AgentMetrics;
}

export interface AgentMetrics {
  tasksCompleted: number;
  tasksFailed: number;
  averageExecutionTime: number;
  lastExecutionTime?: number;
  throughput?: number;
}

export interface Job {
  id: string;
  channelId: string;
  agentId: string;
  agentType: AgentType;
  status: JobStatus;
  startTime?: Date | string;
  endTime?: Date | string;
  progress: number;
  recordsProcessed?: number;
  recordsFailed?: number;
  errorMessage?: string;
  logs?: LogEntry[];
}

export interface LogEntry {
  timestamp: Date | string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';
  message: string;
  metadata?: Record<string, any>;
}

export interface SystemHealth {
  timestamp: Date | string;
  agents: {
    total: number;
    active: number;
    idle: number;
    error: number;
  };
  jobs: {
    total: number;
    running: number;
    completed: number;
    failed: number;
  };
  channels: {
    total: number;
    active: number;
  };
  performance: {
    cpuUsage: number;
    memoryUsage: number;
    networkThroughput: number;
  };
}

export interface AgentTask {
  agentType: AgentType;
  action: string;
  parameters: Record<string, any>;
  priority?: number;
}
