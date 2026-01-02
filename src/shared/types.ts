/**
 * Shared types and interfaces for HVR 6.0 Multi-Agent System
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

export enum ReplicationMode {
  INITIAL_LOAD = 'INITIAL_LOAD',
  CONTINUOUS_CDC = 'CONTINUOUS_CDC',
  REFRESH_AND_CDC = 'REFRESH_AND_CDC',
  COMPARE_ONLY = 'COMPARE_ONLY'
}

export interface SAPConnection {
  id: string;
  name: string;
  host: string;
  port: number;
  systemId: string;
  client: string;
  username: string;
  password?: string;
  databaseType: 'HANA' | 'ORACLE' | 'DB2' | 'MAXDB';
  description?: string;
}

export interface TargetConnection {
  id: string;
  name: string;
  type: 'SNOWFLAKE' | 'REDSHIFT' | 'BIGQUERY' | 'DATABRICKS' | 'S3' | 'AZURE_BLOB';
  connectionString: string;
  credentials?: Record<string, any>;
  description?: string;
}

export interface ReplicationChannel {
  id: string;
  name: string;
  sourceConnection: string;
  targetConnection: string;
  tables: TableMapping[];
  mode: ReplicationMode;
  status: JobStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface TableMapping {
  sourceSchema: string;
  sourceTable: string;
  targetSchema: string;
  targetTable: string;
  columnMappings?: ColumnMapping[];
  filters?: string;
}

export interface ColumnMapping {
  sourceColumn: string;
  targetColumn: string;
  transformation?: string;
}

export interface Agent {
  id: string;
  type: AgentType;
  name: string;
  status: AgentStatus;
  currentJob?: string;
  capabilities: string[];
  lastHeartbeat: Date;
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
  startTime?: Date;
  endTime?: Date;
  progress: number;
  recordsProcessed?: number;
  recordsFailed?: number;
  errorMessage?: string;
  logs?: LogEntry[];
}

export interface LogEntry {
  timestamp: Date;
  level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';
  message: string;
  metadata?: Record<string, any>;
}

export interface ComparisonResult {
  id: string;
  channelId: string;
  timestamp: Date;
  tablesCompared: number;
  rowsCompared: number;
  discrepancies: Discrepancy[];
  summary: {
    matchedRows: number;
    mismatchedRows: number;
    missingInSource: number;
    missingInTarget: number;
  };
}

export interface Discrepancy {
  table: string;
  rowIdentifier: string;
  column: string;
  sourceValue: any;
  targetValue: any;
  type: 'MISMATCH' | 'MISSING_SOURCE' | 'MISSING_TARGET';
}

export interface AgentTask {
  id: string;
  agentType: AgentType;
  action: string;
  parameters: Record<string, any>;
  priority: number;
  createdAt: Date;
  scheduledFor?: Date;
}

export interface SystemHealth {
  timestamp: Date;
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
