import { v4 as uuidv4 } from 'uuid';
import { Agent, AgentType, AgentStatus, AgentTask, Job, JobStatus } from '../../shared/types';
import { logger } from '../utils/logger';

/**
 * Base Agent class that all specialized agents extend
 */
export abstract class BaseAgent implements Agent {
  id: string;
  type: AgentType;
  name: string;
  status: AgentStatus;
  currentJob?: string;
  capabilities: string[];
  lastHeartbeat: Date;
  metrics = {
    tasksCompleted: 0,
    tasksFailed: 0,
    averageExecutionTime: 0,
    lastExecutionTime: 0,
    throughput: 0
  };

  private executionTimes: number[] = [];

  constructor(type: AgentType, name: string, capabilities: string[]) {
    this.id = uuidv4();
    this.type = type;
    this.name = name;
    this.status = AgentStatus.IDLE;
    this.capabilities = capabilities;
    this.lastHeartbeat = new Date();
  }

  /**
   * Execute a task assigned to this agent
   */
  async executeTask(task: AgentTask): Promise<Job> {
    logger.info(`Agent ${this.name} (${this.id}) starting task ${task.id}`);
    
    const job: Job = {
      id: uuidv4(),
      channelId: task.parameters.channelId || '',
      agentId: this.id,
      agentType: this.type,
      status: JobStatus.RUNNING,
      startTime: new Date(),
      progress: 0,
      recordsProcessed: 0,
      recordsFailed: 0,
      logs: []
    };

    this.currentJob = job.id;
    this.status = AgentStatus.RUNNING;

    try {
      const startTime = Date.now();
      await this.performTask(task, job);
      const executionTime = Date.now() - startTime;

      this.executionTimes.push(executionTime);
      if (this.executionTimes.length > 100) {
        this.executionTimes.shift();
      }

      this.metrics.tasksCompleted++;
      this.metrics.lastExecutionTime = executionTime;
      this.metrics.averageExecutionTime = 
        this.executionTimes.reduce((a, b) => a + b, 0) / this.executionTimes.length;

      job.status = JobStatus.COMPLETED;
      job.endTime = new Date();
      job.progress = 100;

      logger.info(`Agent ${this.name} completed task ${task.id} in ${executionTime}ms`);
    } catch (error) {
      this.metrics.tasksFailed++;
      job.status = JobStatus.FAILED;
      job.endTime = new Date();
      job.errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      logger.error(`Agent ${this.name} failed task ${task.id}: ${job.errorMessage}`);
    } finally {
      this.currentJob = undefined;
      this.status = AgentStatus.IDLE;
      this.updateHeartbeat();
    }

    return job;
  }

  /**
   * Abstract method that specialized agents must implement
   */
  protected abstract performTask(task: AgentTask, job: Job): Promise<void>;

  /**
   * Update the last heartbeat timestamp
   */
  updateHeartbeat(): void {
    this.lastHeartbeat = new Date();
  }

  /**
   * Pause the agent
   */
  pause(): void {
    if (this.status === AgentStatus.RUNNING) {
      this.status = AgentStatus.PAUSED;
      logger.info(`Agent ${this.name} paused`);
    }
  }

  /**
   * Resume the agent
   */
  resume(): void {
    if (this.status === AgentStatus.PAUSED) {
      this.status = AgentStatus.IDLE;
      logger.info(`Agent ${this.name} resumed`);
    }
  }

  /**
   * Get agent information
   */
  getInfo(): Agent {
    return {
      id: this.id,
      type: this.type,
      name: this.name,
      status: this.status,
      currentJob: this.currentJob,
      capabilities: this.capabilities,
      lastHeartbeat: this.lastHeartbeat,
      metrics: this.metrics
    };
  }
}
