import { BaseAgent } from './BaseAgent';
import { RefreshAgent } from './RefreshAgent';
import { CDCAgent } from './CDCAgent';
import { IntegrationAgent } from './IntegrationAgent';
import { CompareAgent } from './CompareAgent';
import { MonitorAgent } from './MonitorAgent';
import { ScheduleAgent } from './ScheduleAgent';
import { AgentType, AgentTask, Agent, Job, AgentStatus } from '../../shared/types';
import { logger } from '../utils/logger';
import { EventEmitter } from 'events';

/**
 * AgentOrchestrator - Central coordinator for all agents
 * Manages agent lifecycle, task distribution, and coordination
 */
export class AgentOrchestrator extends EventEmitter {
  private agents: Map<string, BaseAgent>;
  private taskQueue: AgentTask[];
  private activeJobs: Map<string, Job>;
  private isRunning: boolean;

  constructor() {
    super();
    this.agents = new Map();
    this.taskQueue = [];
    this.activeJobs = new Map();
    this.isRunning = false;
    
    this.initializeAgents();
  }

  /**
   * Initialize all agent types
   */
  private initializeAgents(): void {
    const agentInstances = [
      new RefreshAgent(),
      new CDCAgent(),
      new IntegrationAgent(),
      new CompareAgent(),
      new MonitorAgent(),
      new ScheduleAgent()
    ];

    agentInstances.forEach(agent => {
      this.agents.set(agent.id, agent);
      logger.info(`Initialized agent: ${agent.name} (${agent.id})`);
    });
  }

  /**
   * Start the orchestrator
   */
  start(): void {
    if (this.isRunning) {
      logger.warn('AgentOrchestrator already running');
      return;
    }

    this.isRunning = true;
    logger.info('AgentOrchestrator started');
    this.emit('started');
    
    // Start processing task queue
    this.processTaskQueue();
  }

  /**
   * Stop the orchestrator
   */
  stop(): void {
    this.isRunning = false;
    logger.info('AgentOrchestrator stopped');
    this.emit('stopped');
  }

  /**
   * Submit a task to the queue
   */
  submitTask(task: AgentTask): void {
    this.taskQueue.push(task);
    logger.info(`Task ${task.id} submitted to queue`);
    this.emit('taskSubmitted', task);
    
    if (this.isRunning) {
      this.processTaskQueue();
    }
  }

  /**
   * Process tasks in the queue
   */
  private async processTaskQueue(): Promise<void> {
    while (this.isRunning && this.taskQueue.length > 0) {
      // Sort by priority (higher first)
      this.taskQueue.sort((a, b) => b.priority - a.priority);
      
      // Find an available agent for the next task
      const task = this.taskQueue[0];
      const agent = this.findAvailableAgent(task.agentType);

      if (agent) {
        this.taskQueue.shift();
        this.executeTask(agent, task);
      } else {
        // No available agent, wait and retry
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }

  /**
   * Find an available agent of the specified type
   */
  private findAvailableAgent(type: AgentType): BaseAgent | null {
    for (const agent of this.agents.values()) {
      if (agent.type === type && agent.status === AgentStatus.IDLE) {
        return agent;
      }
    }
    return null;
  }

  /**
   * Execute a task on an agent
   */
  private async executeTask(agent: BaseAgent, task: AgentTask): Promise<void> {
    logger.info(`Assigning task ${task.id} to agent ${agent.name}`);
    this.emit('taskStarted', { agent, task });

    try {
      const job = await agent.executeTask(task);
      this.activeJobs.set(job.id, job);
      this.emit('taskCompleted', { agent, task, job });
      logger.info(`Task ${task.id} completed by agent ${agent.name}`);
    } catch (error) {
      this.emit('taskFailed', { agent, task, error });
      logger.error(`Task ${task.id} failed on agent ${agent.name}: ${error}`);
    }
  }

  /**
   * Get all agents
   */
  getAllAgents(): Agent[] {
    return Array.from(this.agents.values()).map(agent => agent.getInfo());
  }

  /**
   * Get agent by ID
   */
  getAgent(id: string): Agent | null {
    const agent = this.agents.get(id);
    return agent ? agent.getInfo() : null;
  }

  /**
   * Get agents by type
   */
  getAgentsByType(type: AgentType): Agent[] {
    return Array.from(this.agents.values())
      .filter(agent => agent.type === type)
      .map(agent => agent.getInfo());
  }

  /**
   * Get all active jobs
   */
  getActiveJobs(): Job[] {
    return Array.from(this.activeJobs.values());
  }

  /**
   * Get job by ID
   */
  getJob(id: string): Job | null {
    return this.activeJobs.get(id) || null;
  }

  /**
   * Get task queue status
   */
  getQueueStatus(): { pending: number; tasks: AgentTask[] } {
    return {
      pending: this.taskQueue.length,
      tasks: this.taskQueue
    };
  }

  /**
   * Clear completed jobs older than specified time
   */
  cleanupOldJobs(maxAge: number = 3600000): void {
    const now = Date.now();
    const jobsToRemove: string[] = [];

    this.activeJobs.forEach((job, id) => {
      if (job.endTime && now - job.endTime.getTime() > maxAge) {
        jobsToRemove.push(id);
      }
    });

    jobsToRemove.forEach(id => {
      this.activeJobs.delete(id);
    });

    if (jobsToRemove.length > 0) {
      logger.info(`Cleaned up ${jobsToRemove.length} old jobs`);
    }
  }
}
