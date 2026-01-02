import { BaseAgent } from './BaseAgent';
import { AgentType, AgentTask, Job, LogEntry } from '../../shared/types';
import { logger } from '../utils/logger';

/**
 * Integration Agent - Handles data integration to target systems
 * Applies captured changes to the target database
 */
export class IntegrationAgent extends BaseAgent {
  constructor() {
    super(
      AgentType.INTEGRATE,
      'Integration Agent',
      ['apply_changes', 'batch_processing', 'conflict_resolution', 'transaction_apply']
    );
  }

  protected async performTask(task: AgentTask, job: Job): Promise<void> {
    logger.info(`IntegrationAgent: Starting integration for channel ${task.parameters.channelId}`);

    const changes = task.parameters.changes || [];
    const batchSize = 100;
    const totalBatches = Math.ceil(changes.length / batchSize);
    let processedBatches = 0;

    for (let i = 0; i < changes.length; i += batchSize) {
      const batch = changes.slice(i, i + batchSize);
      
      const logEntry: LogEntry = {
        timestamp: new Date(),
        level: 'INFO',
        message: `Applying batch ${processedBatches + 1}/${totalBatches} (${batch.length} changes)`,
        metadata: { 
          batchNumber: processedBatches + 1,
          batchSize: batch.length
        }
      };
      job.logs = job.logs || [];
      job.logs.push(logEntry);

      await this.applyBatch(batch, job);
      
      processedBatches++;
      job.progress = Math.round((processedBatches / totalBatches) * 100);
      job.recordsProcessed = (job.recordsProcessed || 0) + batch.length;
    }

    logger.info(`IntegrationAgent: Applied ${changes.length} changes to target`);
  }

  private async applyBatch(batch: any[], job: Job): Promise<void> {
    // Simulate applying changes to target system
    await new Promise(resolve => setTimeout(resolve, 200));

    // Simulate some failures
    const failedChanges = Math.floor(Math.random() * batch.length * 0.01);
    if (failedChanges > 0) {
      job.recordsFailed = (job.recordsFailed || 0) + failedChanges;
      
      const logEntry: LogEntry = {
        timestamp: new Date(),
        level: 'WARN',
        message: `${failedChanges} changes failed to apply`,
        metadata: { failures: failedChanges }
      };
      job.logs = job.logs || [];
      job.logs.push(logEntry);
    }
  }
}
